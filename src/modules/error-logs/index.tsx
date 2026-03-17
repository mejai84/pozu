"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { AlertTriangle, RefreshCw, ShieldAlert, Wifi, Phone, MessageSquare, Globe, Loader2, CheckCircle2 } from 'lucide-react'

interface ErrorLog {
  id: string
  node_name: string
  error_message: string
  alert_message?: string
  canal: string
  workflow_id?: string
  item_data?: Record<string, unknown>
  created_at: string
}

const CANAL_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  whatsapp:     { label: 'WhatsApp',    color: 'text-green-400 bg-green-400/10 border-green-400/20',    icon: <Phone className="w-3 h-3" /> },
  telegram:     { label: 'Telegram',    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',       icon: <MessageSquare className="w-3 h-3" /> },
  vapi:         { label: 'Vapi (Tel.)', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: <Phone className="w-3 h-3" /> },
  website_chat: { label: 'Web Chat',    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: <Globe className="w-3 h-3" /> },
  desconocido:  { label: 'Desconocido', color: 'text-white/40 bg-white/5 border-white/10',              icon: <Wifi className="w-3 h-3" /> },
}

export const ErrorLogsModule = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchLogs = async () => {
    setLoading(true)
    const query = supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    const { data } = await query
    setLogs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filtered = filter === 'all' ? logs : logs.filter(l => (l.canal || 'desconocido') === filter)
  const channels = ['all', ...Array.from(new Set(logs.map(l => l.canal || 'desconocido')))]

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-400" />
            Monitor de Errores
          </h1>
          <p className="text-muted-foreground mt-1">Fallos capturados por el orquestador n8n v3.0</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {(['all', 'whatsapp', 'telegram', 'website_chat'] as const).map(canal => {
          const count = canal === 'all' ? logs.length : logs.filter(l => l.canal === canal).length
          const meta = canal === 'all' 
            ? { label: 'Total Errores', color: 'text-red-400', icon: <AlertTriangle className="w-5 h-5" /> }
            : CANAL_META[canal]
          return (
            <button
              key={canal}
              onClick={() => setFilter(canal)}
              className={`p-4 rounded-2xl border transition-all text-left ${
                filter === canal ? 'bg-red-500/10 border-red-500/30' : 'bg-white/3 border-white/10 hover:bg-white/5'
              }`}
            >
              <div className={`flex items-center gap-2 mb-1 ${canal === 'all' ? 'text-red-400' : CANAL_META[canal]?.color.split(' ')[0]}`}>
                {meta?.icon}
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{meta?.label}</span>
              </div>
              <p className="text-2xl font-black">{count}</p>
            </button>
          )
        })}
      </div>

      {/* Log List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-bold">Cargando logs...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
          <p className="font-bold text-lg">Sin errores registrados</p>
          <p className="text-sm">El sistema funciona correctamente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((log, i) => {
            const canalKey = (log.canal || 'desconocido') as keyof typeof CANAL_META
            const meta = CANAL_META[canalKey] ?? CANAL_META.desconocido
            const isExpanded = expandedId === log.id

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-[#151515] border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full p-5 flex items-start gap-4 text-left hover:bg-white/3 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-black text-sm truncate">{log.node_name || 'Nodo desconocido'}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex items-center gap-1 ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium truncate">{log.error_message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap font-bold shrink-0">
                    {new Date(log.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                    {log.alert_message && (
                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Alerta Telegram</p>
                        <pre className="text-xs font-mono text-white/70 whitespace-pre-wrap">{log.alert_message}</pre>
                      </div>
                    )}
                    {log.item_data && (
                      <div className="bg-black/40 rounded-xl p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Datos del Item</p>
                        <pre className="text-xs font-mono text-white/60 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(log.item_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.workflow_id && (
                      <p className="text-[10px] text-muted-foreground font-mono">Workflow ID: {log.workflow_id}</p>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
