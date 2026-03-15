import { Shield, ShieldCheck, Mail, Phone, Trash2, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Employee } from "../types"

interface Props {
    employees: Employee[]
    loading: boolean
    onEdit: (e: Employee) => void
    onDelete: (id: string) => void
}

export const EmployeeTable = ({ employees, loading, onEdit, onDelete }: Props) => {
    return (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-black/20">
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Empleado</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rol</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contacto</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                </td>
                            </tr>
                        ) : employees.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-muted-foreground text-sm font-bold opacity-40 uppercase tracking-widest">
                                    No se encontraron empleados registrados
                                </td>
                            </tr>
                        ) : (
                            employees.map((employee) => (
                                <tr key={employee.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black italic text-primary group-hover:scale-110 transition-transform">
                                                {employee.full_name?.charAt(0) || employee.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-extrabold uppercase italic tracking-tight text-white group-hover:text-primary transition-colors">{employee.full_name || 'Sin nombre'}</div>
                                                <div className="text-xs text-muted-foreground font-medium">{employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black italic tracking-widest uppercase border",
                                            ['admin', 'manager'].includes(employee.role)
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        )}>
                                            {['admin', 'manager'].includes(employee.role) ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                            {employee.role}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                <Mail className="w-3 h-3" /> {employee.email}
                                            </div>
                                            {employee.phone && (
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                    <Phone className="w-3 h-3" /> {employee.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-3 text-white">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary/10 hover:text-primary border border-white/5"
                                                onClick={() => onEdit(employee)}
                                            >
                                                <Users className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-white/5"
                                                onClick={() => onDelete(employee.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
