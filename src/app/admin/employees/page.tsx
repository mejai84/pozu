
"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    Users,
    UserPlus,
    Shield,
    ShieldCheck,
    Mail,
    Phone,
    Trash2,
    MoreVertical,
    Search,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Employee {
    id: string
    email: string
    full_name: string | null
    phone: string | null
    role: 'admin' | 'staff' | 'customer'
    created_at: string
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newEmployee, setNewEmployee] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "staff"
    })
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editData, setEditData] = useState({
        fullName: "",
        password: "",
        role: "staff" as any
    })

    useEffect(() => {
        fetchEmployees()
    }, [])

    async function fetchEmployees() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['admin', 'staff'])
                .order('created_at', { ascending: false })

            if (error) throw error
            setEmployees(data || [])
        } catch (error) {
            console.error('Error fetching employees:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredEmployees = employees.filter(emp =>
        emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const updateRole = async (id: string, newRole: 'admin' | 'staff') => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', id)

            if (error) throw error
            fetchEmployees()
        } catch (error) {
            alert('Error al actualizar el rol')
        }
    }

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.')) return

        try {
            const response = await fetch(`/api/admin/employees?id=${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error al eliminar empleado')
            }

            alert('Empleado eliminado con éxito')
            fetchEmployees()
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleUpdateEmployee = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingEmployee) return
        setIsCreating(true)

        try {
            const response = await fetch('/api/admin/employees', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: editingEmployee.id,
                    fullName: editData.fullName,
                    role: editData.role,
                    ...(editData.password ? { password: editData.password } : {})
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error al actualizar empleado')
            }

            alert('Empleado actualizado con éxito')
            setIsEditModalOpen(false)
            fetchEmployees()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsCreating(false)
        }
    }

    const openEditModal = (employee: Employee) => {
        setEditingEmployee(employee)
        setEditData({
            fullName: employee.full_name || "",
            password: "",
            role: employee.role
        })
        setIsEditModalOpen(true)
    }

    const handleCreateEmployee = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)

        try {
            const response = await fetch('/api/admin/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEmployee)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Ocurrió un error al crear empleado')
            }

            alert('Empleado creado con éxito')
            setIsAddModalOpen(false)
            setNewEmployee({
                fullName: "",
                email: "",
                password: "",
                role: "staff"
            })
            fetchEmployees()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
                    <p className="text-muted-foreground">Administra el personal con acceso al panel.</p>
                </div>
                <Button
                    className="gap-2 font-bold"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <UserPlus className="w-5 h-5" />
                    Nuevo Empleado
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            className="w-full h-12 pl-10 rounded-2xl bg-card border border-white/10 focus:border-primary outline-none transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="bg-card/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Empleado</th>
                                        <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Contacto</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-muted-foreground uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                            </td>
                                        </tr>
                                    ) : filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                No se encontraron empleados.
                                            </td>
                                        </tr>
                                    ) : filteredEmployees.map((employee) => (
                                        <tr key={employee.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                                        {employee.full_name?.charAt(0) || employee.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{employee.full_name || 'Sin nombre'}</div>
                                                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset",
                                                    employee.role === 'admin'
                                                        ? "bg-primary/10 text-primary ring-primary/20"
                                                        : "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
                                                )}>
                                                    {employee.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                                    {employee.role.toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {employee.email}
                                                    </div>
                                                    {employee.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {employee.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="hover:text-primary transition-colors"
                                                        onClick={() => openEditModal(employee)}
                                                        title="Editar / Cambiar Clave"
                                                    >
                                                        <Users className="w-5 h-5" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="hover:text-destructive transition-colors"
                                                        onClick={() => handleDeleteEmployee(employee.id)}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <ShieldCheck className="w-6 h-6" />
                            <h3 className="font-bold text-lg">Roles y Permisos</h3>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="space-y-1">
                                <div className="font-bold text-primary uppercase text-[10px] tracking-wider">Admin</div>
                                <p className="text-muted-foreground">Control total: productos, pedidos, configuración y gestión de empleados.</p>
                            </div>
                            <div className="space-y-1">
                                <div className="font-bold text-emerald-500 uppercase text-[10px] tracking-wider">Staff</div>
                                <p className="text-muted-foreground">Acceso a pedidos y cocina (KDS). No puede editar productos ni configuración.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-white/10 rounded-3xl p-6 space-y-4">
                        <h3 className="font-bold">Instrucciones</h3>
                        <ol className="text-sm text-muted-foreground space-y-3 list-decimal list-inside">
                            <li>El empleado debe registrarse primero.</li>
                            <li>Búscalo en la lista (si ya tiene rol asignado).</li>
                            <li>Si es un nuevo cliente que quieres promover, cámbialo desde la sección de Clientes.</li>
                            <li>Los cambios son instantáneos.</li>
                        </ol>
                    </div>
                </div>
            </div>
            {/* Modal de Nuevo Empleado */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md relative">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6 relative">
                            Nuevo Empleado
                            <div className="absolute -bottom-2 left-0 w-12 h-1 bg-primary rounded-full" />
                        </h2>

                        <form onSubmit={handleCreateEmployee} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                    placeholder="Ej: Laura García"
                                    value={newEmployee.fullName}
                                    onChange={e => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                    placeholder="empleado@pozu.es"
                                    value={newEmployee.email}
                                    onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Contraseña Inicial</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                    placeholder="Min. 6 caracteres"
                                    value={newEmployee.password}
                                    onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Rol de Acceso</label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                    value={newEmployee.role}
                                    onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                >
                                    <option value="staff" className="bg-[#1A1A1A]">Staff (Cocina y Pedidos)</option>
                                    <option value="admin" className="bg-[#1A1A1A]">Administrador (Acceso Total)</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full rounded-xl border-white/10"
                                    onClick={() => setIsAddModalOpen(false)}
                                    disabled={isCreating}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full rounded-xl font-bold font-black uppercase italic tracking-tighter shadow-lg"
                                    disabled={isCreating}
                                >
                                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Crear Acceso'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Editar Empleado */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md relative">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6 relative">
                            Editar Empleado
                            <div className="absolute -bottom-2 left-0 w-12 h-1 bg-primary rounded-full" />
                        </h2>

                        <form onSubmit={handleUpdateEmployee} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                    value={editData.fullName}
                                    onChange={e => setEditData({ ...editData, fullName: e.target.value })}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Nueva Contraseña (Opcional)</label>
                                <input
                                    type="password"
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                    placeholder="Dejar vacío para no cambiar"
                                    value={editData.password}
                                    onChange={e => setEditData({ ...editData, password: e.target.value })}
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Rol de Acceso</label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                    value={editData.role}
                                    onChange={e => setEditData({ ...editData, role: e.target.value as any })}
                                >
                                    <option value="staff" className="bg-[#1A1A1A]">Staff (Cocina y Pedidos)</option>
                                    <option value="admin" className="bg-[#1A1A1A]">Administrador (Acceso Total)</option>
                                    <option value="waiter" className="bg-[#1A1A1A]">Camarero</option>
                                    <option value="kitchen" className="bg-[#1A1A1A]">Cocina</option>
                                    <option value="cashier" className="bg-[#1A1A1A]">Cajero</option>
                                    <option value="delivery" className="bg-[#1A1A1A]">Reparto</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full rounded-xl border-white/10"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isCreating}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full rounded-xl font-bold font-black uppercase italic tracking-tighter shadow-lg"
                                    disabled={isCreating}
                                >
                                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
