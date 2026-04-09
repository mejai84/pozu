"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  X, 
  MessageSquare, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  ChevronDown,
  Paperclip,
  Mic,
  GripHorizontal,
  FileIcon,
  ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const renderMessageWithLinks = (text: string) => {
  if (!text) return text;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline decoration-2 underline-offset-2 hover:text-blue-400 break-all select-all">
          {part}
        </a>
      );
    }
    return part;
  });
};

interface Message {
  id?: string
  sender: 'user' | 'assistant'
  message: string
  timestamp: Date
  attachment_url?: string
}

// Framer Motion variants for staggered message animation
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20
    }
  }
}

export function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Inicializar sesión y cargar historial
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sId = localStorage.getItem('pozu_chat_session')
      if (!sId) {
        sId = 'web_' + Math.random().toString(36).substring(2, 11)
        localStorage.setItem('pozu_chat_session', sId)
      }
      setSessionId(sId)
      loadHistory(sId)
    }
  }, [])

  // 2. Suscribirse a Realtime (Compatible con el flujo n8n proporcionado)
  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newMessage = payload.new as any
          setMessages(prev => {
            // Evitar duplicados
            if (prev.find(m => m.id === newMessage.id)) return prev
            return [...prev, {
              id: newMessage.id,
              sender: newMessage.sender,
              message: newMessage.message,
              timestamp: new Date(newMessage.timestamp),
              attachment_url: newMessage.attachment_url
            }]
          })
          if (newMessage.sender === 'assistant') {
            setIsLoading(false)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  const loadHistory = async (sId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sId)
      .order('timestamp', { ascending: false })
      .limit(50)

    if (data && data.length > 0) {
      setMessages(data.reverse().map(m => ({
        id: m.id,
        sender: m.sender,
        message: m.message,
        timestamp: new Date(m.timestamp),
        attachment_url: m.attachment_url
      })))
    } else {
      setMessages([
        {
          sender: 'assistant',
          message: '¡Hola! Soy Pozu IA. 🍔 ¿Listo para el mejor pedido de tu vida? Cuéntame qué te apetece.',
          timestamp: new Date()
        }
      ])
    }
  }

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async (file?: File) => {
    const textToSend = input.trim()
    if (!textToSend && !file && !isLoading) return

    setIsLoading(true)

    // 1. Insertar para la UI reactiva (chat_messages)
    const { data: userMsgData, error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender: 'user',
        message: textToSend || (file ? `Archivo: ${file.name}` : '')
      })
      .select()
      .single()

    if (userMsgError) {
      console.error('Error enviando mensaje:', userMsgError)
      setIsLoading(false)
      return
    }

    // 2. Sincronizar con n8n_chat_histories (LangChain format para memoria de IA)
    if (textToSend) {
      const { error: historyError } = await supabase
        .from('n8n_chat_histories')
        .insert({
          session_id: sessionId,
          message: {
            role: 'user',
            content: textToSend
          }
        })
      if (historyError) console.error('Error sincronizando n8n memory:', historyError)
    }

    // 14. Anti doble envío
    if (isLoading) return;
    
    // 13. UX obligatoria: isTyping = true antes del fetch
    setIsLoading(true);
    setInput('')

    // 12. Timeout extendido (35s) — El agente IA + 3 consultas Supabase pueden tardar hasta 25s
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 35000)

    try {
      const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL || 'https://n8npozu.pozu2.com/webhook/chat-web'
      
      const res = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'website_chat',
          session_id: sessionId,
          user_name: 'Usuario Pozu',
          text: userMsgData.message,
          message: {
            text: userMsgData.message
          },
          message_id: userMsgData.id,
          timestamp: userMsgData.timestamp
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      // Parsear respuesta de forma segura para evitar "Unexpected end of JSON input"
      let resData: any = null
      const contentType = res.headers.get("content-type")
      if (res.ok && contentType && contentType.includes("application/json")) {
        try {
          resData = await res.json()
        } catch (e) {
          console.warn('Respuesta n8n no es un JSON válido:', e)
        }
      }
      
      // Registrar la respuesta en la base de datos si n8n devolvió contenido directamente
      if (resData && (resData.message || resData.text)) {
        const assistantText = resData.message || resData.text
        
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          sender: 'assistant',
          message: assistantText
        })

        // Sincronizar respuesta en n8n_chat_histories
        await supabase.from('n8n_chat_histories').insert({
          session_id: sessionId,
          message: {
            role: 'assistant',
            content: assistantText
          }
        })
      } else if (!res.ok) {
        throw new Error(`Error en n8n: ${res.statusText}`)
      } else {
        throw new Error(`Pozu AI no devolvió una respuesta válida. Probablemente esté muy ocupado ahora mismo.`);
      }
      
    } catch (error: any) {
      console.error('n8n notification error:', error)
      
      // Feedback opcional para el usuario en caso de error crítico
      const errorMessage = error.name === 'AbortError' 
        ? "Pozu AI tardó demasiado en pensar. Por favor, asegúrate de hablarle con un poco menos de prisa o espera unos segundos."
        : "Lo siento, hubo un problema al conectar con mis circuitos en la cocina. Vuelve a intentarlo en un instante.";

      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        sender: 'assistant',
        message: `⚠️ ${errorMessage}`
      })
    } finally {
      setIsLoading(false)
      clearTimeout(timeoutId)
    }
  }

  return (
    <>
      <motion.div 
        drag
        dragMomentum={false}
        className="fixed bottom-6 right-4 sm:right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none"
      >
        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <AnimatePresence>
            {!isOpen && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  y: [0, -8, 0] 
                }}
                transition={{
                  scale: { duration: 0.5 },
                  opacity: { duration: 0.5 },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1, y: -12 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                aria-label="Abrir asistente IA Pozu"
                className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#1A1A1A] border-4 border-primary shadow-[0_0_50px_rgba(255,184,0,0.5)] flex items-center justify-center group touch-none"
              >
                <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity z-10 pointer-events-none">
                  <GripHorizontal className="w-4 h-4 text-white" />
                </div>
                <div className="absolute inset-0 bg-primary/20 animate-ping rounded-full pointer-events-none" />
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  <Image src="/images/logo.jpg" alt="Pozu Logo" fill className="object-contain bg-black group-hover:scale-110 transition-transform duration-700" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], boxShadow: ["0 0 10px #FFB800", "0 0 20px #FFB800", "0 0 10px #FFB800"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 bg-primary text-black text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full border-2 border-black shadow-lg z-20"
                >
                  AI
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={chatRef}
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.8 }}
                className="w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-[#111111] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden glass"
              >
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-between cursor-move shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl border-2 border-black bg-black overflow-hidden relative shadow-[4px_4px_0px_#000]">
                      <Image src="/images/logo.jpg" alt="Logo" fill className="object-contain" />
                    </div>
                    <div>
                      <h3 className="text-black font-black italic uppercase tracking-tighter text-base leading-none">Pozu AI Business</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }} 
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.8)]" 
                        />
                        <span className="text-[10px] font-black text-black/70 uppercase tracking-widest">En Línea • Cocinando Pedidos</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <button 
                      onClick={() => setIsOpen(false)} 
                      aria-label="Cerrar chat"
                      className="p-2.5 hover:bg-black/10 rounded-2xl transition-all active:scale-90 pointer-events-auto border-2 border-transparent hover:border-black/5"
                    >
                      <X className="w-6 h-6 text-black" />
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <motion.div 
                  ref={scrollRef}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex-1 overflow-y-auto p-6 space-y-5 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] bg-fixed pointer-events-auto select-text"
                >
                  {messages.map((msg, i) => (
                    <motion.div 
                      key={msg.id || i} 
                      variants={itemVariants}
                      className={cn("flex flex-col max-w-[88%]", msg.sender === 'user' ? "ml-auto items-end" : "items-start")}
                    >
                      <div className={cn(
                        "p-4 rounded-[2rem] text-sm font-bold leading-relaxed shadow-[6px_6px_0px_rgba(0,0,0,0.2)] transition-all",
                        msg.sender === 'user' 
                          ? "bg-primary text-black rounded-tr-none border-2 border-black" 
                          : "bg-[#1A1A1A] border-2 border-white/10 text-white rounded-tl-none backdrop-blur-xl"
                      )}>
                        {msg.attachment_url && (
                          <div className="mb-3 overflow-hidden rounded-2xl border-2 border-black/20 bg-black/40">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={msg.attachment_url} alt="attachment" className="max-h-48 w-full object-cover" />
                          </div>
                        )}
                        <p className="whitespace-pre-wrap text-[13px] sm:text-sm tracking-tight text-pretty select-text">{renderMessageWithLinks(msg.message)}</p>
                      </div>
                      <span className="text-[9px] font-black uppercase text-muted-foreground mt-2 opacity-50 flex items-center gap-1">
                        {msg.sender === 'assistant' && <Bot className="w-3 h-3 text-primary" />}
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 text-primary p-3 bg-white/5 rounded-full w-fit border border-white/10"
                    >
                      <div className="flex gap-1">
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Pozu AI está cocinando…</span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Input Area */}
                <div className="p-6 border-t-2 border-black/20 bg-[#1A1A1A]/80 backdrop-blur-2xl pointer-events-auto">
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={input} 
                      onChange={(e) => setInput(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Pide tu burger, consulta alérgenos…" 
                      inputMode="text"
                      autoComplete="off"
                      spellCheck="true"
                      className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-5 pr-16 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner placeholder:text-white/20"
                    />
                    <button 
                      onClick={() => handleSend()} 
                      disabled={(!input.trim() && !isLoading) || isLoading}
                      aria-label="Enviar mensaje"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3 bg-primary text-black rounded-xl hover:scale-110 active:scale-90 transition-all shadow-[3px_3px_0px_#000] disabled:opacity-50 disabled:grayscale disabled:shadow-none"
                    >
                      <Send className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                  <div className="mt-5 flex items-center justify-between px-2">
                    <div className="flex gap-5">
                      <button 
                        className="text-white/40 hover:text-primary transition-all active:scale-95 p-1" 
                        title="Adjuntar archivo"
                        aria-label="Adjuntar archivo"
                      >
                        <Paperclip className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => {
                          if (isRecording) {
                            const recognition = (window as any).recognition
                            if (recognition) recognition.stop()
                            setIsRecording(false)
                          } else {
                            try {
                              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
                              if (!SpeechRecognition) {
                                alert("⚠️ Tu navegador o teléfono bloquea el dictado por voz de forma nativa (común en iOS/Safari). Intenta usar Chrome o simplemente escribe tu mensaje.")
                                return
                              }
                              const recognition = new SpeechRecognition()
                              recognition.lang = 'es-ES'
                              recognition.interimResults = true // Permite ver el texto en tiempo real
                              recognition.onstart = () => setIsRecording(true)
                              recognition.onresult = (event: any) => {
                                const transcript = Array.from(event.results)
                                  .map((result: any) => result[0].transcript)
                                  .join('')
                                setInput(transcript)
                              }
                              recognition.onerror = (e: any) => {
                                console.error('Error de micrófono:', e)
                                setIsRecording(false)
                                if (e.error === 'not-allowed') alert("🔌 Debes darle permisos de micrófono al navegador.")
                              }
                              recognition.onend = () => setIsRecording(false)
                              ;(window as any).recognition = recognition
                              recognition.start()
                            } catch (e) {
                              console.error(e)
                              alert("⚠️ Error técnico al activar el micrófono. Revisa tus permisos.")
                            }
                          }
                        }}
                        aria-label={isRecording ? "Detener grabación" : "Dictar mensaje"}
                        className={cn(
                          "transition-all p-1 rounded-full",
                          isRecording ? "text-red-500 scale-150 animate-pulse bg-red-500/10" : "text-white/40 hover:text-primary active:scale-95"
                        )} 
                        title={isRecording ? "Escuchando…" : "Dictar mensaje"}
                      >
                        <Mic className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.3em] italic">Pozu Multimodal IA</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  )
}
