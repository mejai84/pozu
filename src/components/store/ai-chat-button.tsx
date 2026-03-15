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
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

interface Message {
  id?: string
  sender: 'user' | 'assistant'
  message: string
  timestamp: Date
  attachment_url?: string
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
      .order('timestamp', { ascending: true })

    if (data && data.length > 0) {
      setMessages(data.map(m => ({
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
          message: '¡Hola! Soy Pozu AI. 🍔 ¿Listo para el mejor pedido de tu vida? Cuéntame qué te apetece.',
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

    // Insertar localmente para feedback inmediato (opcional, Realtime lo hará también)
    // Pero insertamos en DB para que n8n lo procese
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

    setInput('')

    // Notificar a n8n según la estructura de su Webhook
    try {
      const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL || 'https://n8n.example.com/webhook/chat-web'
      
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'website_chat',
          session_id: sessionId,
          message_id: userMsgData.id,
          text: userMsgData.message,
          timestamp: userMsgData.timestamp
        }),
      })
    } catch (error) {
      console.error('n8n notification error:', error)
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
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1A1A1A] border-4 border-primary shadow-[0_0_40px_rgba(255,184,0,0.4)] flex items-center justify-center overflow-hidden group touch-none"
              >
                <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
                  <GripHorizontal className="w-4 h-4 text-white" />
                </div>
                <div className="absolute inset-0 bg-primary/20 animate-ping rounded-full" />
                <Image src="/images/logo.jpg" alt="Pozu Logo" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -top-1 -right-1 bg-primary text-black text-[9px] font-black px-2 py-1 rounded-full border-2 border-black animate-bounce shadow-lg">AI</div>
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
                className="w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-[#111111] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden glass touch-none"
              >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-primary to-secondary flex items-center justify-between cursor-move">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-black bg-white overflow-hidden relative shadow-lg">
                      <Image src="/images/logo.jpg" alt="Logo" fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="text-black font-black italic uppercase tracking-tight text-sm">Pozu Business</h3>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-black/60 uppercase">Asistente IA 🔥</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GripHorizontal className="w-5 h-5 text-black/30" />
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/10 rounded-xl transition-colors pointer-events-auto">
                      <X className="w-5 h-5 text-black" />
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] bg-fixed pointer-events-auto">
                  {messages.map((msg, i) => (
                    <motion.div key={msg.id || i} initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
                      className={cn("flex flex-col max-w-[85%]", msg.sender === 'user' ? "ml-auto items-end" : "items-start")}
                    >
                      <div className={cn("p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-lg",
                        msg.sender === 'user' ? "bg-primary text-black rounded-tr-none" : "bg-white/5 border border-white/10 text-white rounded-tl-none backdrop-blur-md"
                      )}>
                        {msg.attachment_url && (
                          <div className="mb-2 overflow-hidden rounded-xl border border-black/10 bg-black/20">
                            <img src={msg.attachment_url} alt="attachment" className="max-h-32 w-full object-cover" />
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-[8px] font-black uppercase text-muted-foreground mt-1 opacity-60">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-primary p-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest italic animate-pulse">Pozu AI está cocinando...</span>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-xl pointer-events-auto">
                  <div className="relative group">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Pide tu burger, consulta alérgenos..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-14 text-sm font-bold focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-inner"
                    />
                    <button onClick={() => handleSend()} disabled={(!input.trim() && !isLoading) || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between px-2">
                    <div className="flex gap-4">
                      <button className="text-white/40 hover:text-primary transition-colors p-1" title="Adjuntar (Próximamente)"><Paperclip className="w-5 h-5" /></button>
                      <button 
                        onClick={() => {
                          if (isRecording) {
                            // Detener
                            const recognition = (window as any).recognition
                            if (recognition) recognition.stop()
                            setIsRecording(false)
                          } else {
                            // Iniciar
                            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
                            if (!SpeechRecognition) {
                              alert("Tu navegador no soporta reconocimiento de voz.")
                              return
                            }
                            const recognition = new SpeechRecognition()
                            recognition.lang = 'es-ES'
                            recognition.interimResults = false
                            recognition.onstart = () => setIsRecording(true)
                            recognition.onresult = (event: any) => {
                              const transcript = event.results[0][0].transcript
                              setInput(transcript)
                              setIsRecording(false)
                            }
                            recognition.onerror = () => setIsRecording(false)
                            recognition.onend = () => setIsRecording(false)
                            ;(window as any).recognition = recognition
                            recognition.start()
                          }
                        }}
                        className={cn("transition-all p-1", isRecording ? "text-red-500 scale-125 animate-pulse" : "text-white/40 hover:text-primary")} 
                        title={isRecording ? "Escuchando..." : "Dictar mensaje"}
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-40">
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                      <span className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em]">Pozu Omnichannel AI</span>
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
