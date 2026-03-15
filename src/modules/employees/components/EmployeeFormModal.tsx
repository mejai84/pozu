import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Loader2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Employee, EmployeeFormData, EmployeeRole } from "../types"

interface Props {
    employee: Employee | null
    onClose: () => void
    onSubmit: (data: EmployeeFormData) => Promise<{ success: boolean; error?: string }>
}

export const EmployeeFormModal = ({ employee, onClose, onSubmit }: Props) => {
    const [formData, setFormData] = useState<EmployeeFormData>({
        fullName: "",
        email: "",
        password: "",
        role: "staff"
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (employee) {
            setFormData({
                fullName: employee.full_name || "",
                email: employee.email,
                role: employee.role,
                password: ""
            })
        }
    }, [employee])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const result = await onSubmit(formData)
        setLoading(false)
        if (result.success) onClose()
        else alert(result.error)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="bg-[#151515] border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                            {employee ? 'Editar' : 'Nuevo'} <span className="text-primary">Empleado</span>
                        </h2>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-white"><X /></button>
                    </div>

                    <div className="p-8 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre Completo</label>
                            <input
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none text-white"
                                placeholder="Ej: Laura García"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        
                        {!employee && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none text-white"
                                    placeholder="empleado@pozu.es"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                {employee ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial'}
                            </label>
                            <input
                                type="password"
                                required={!employee}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none text-white"
                                placeholder={employee ? "Dejar vacío para no cambiar" : "Min. 6 caracteres"}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2 text-white">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rol de Acceso</label>
                            <div className="relative group/select">
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-primary/50 outline-none appearance-none cursor-pointer"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                                >
                                    <option value="staff" className="bg-[#151515]">Staff General</option>
                                    <option value="admin" className="bg-[#151515]">Administrador</option>
                                    <option value="manager" className="bg-[#151515]">Gerente</option>
                                    <option value="waiter" className="bg-[#151515]">Camarero</option>
                                    <option value="kitchen" className="bg-[#151515]">Cocina</option>
                                    <option value="cashier" className="bg-[#151515]">Cajero</option>
                                    <option value="delivery" className="bg-[#151515]">Reparto</option>
                                </select>
                                <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 rounded-2xl font-black uppercase italic text-xs h-14 text-white"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-[2] rounded-2xl bg-primary text-black font-black uppercase italic tracking-tighter h-14 hover:bg-primary/80 shadow-lg shadow-primary/10"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : employee ? 'Guardar Cambios' : 'Crear Acceso'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
