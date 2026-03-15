"use client"

import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Search, ShieldAlert } from 'lucide-react'
import { useEmployees } from './hooks/useEmployees'
import { EmployeeHeader } from './components/EmployeeHeader'
import { EmployeeTable } from './components/EmployeeTable'
import { EmployeeFormModal } from './components/EmployeeFormModal'
import { Employee } from './types'

export const EmployeesModule = () => {
    const {
        employees,
        loading,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        refresh
    } = useEmployees()

    const [searchTerm, setSearchTerm] = useState("")
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [employees, searchTerm])

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este empleado?')) return
        const res = await deleteEmployee(id)
        if (!res.success) alert(res.error)
    }

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            <EmployeeHeader onOpenCreate={() => { setSelectedEmployee(null); setIsFormOpen(true); }} />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8">
                <div className="space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-[1.5rem] p-5 pl-14 outline-none focus:ring-2 focus:ring-primary/20 font-bold transition-all text-sm text-white"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <EmployeeTable 
                        employees={filteredEmployees}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <ShieldAlert className="w-8 h-8" />
                            <h3 className="font-black italic uppercase tracking-tighter text-xl">Seguridad</h3>
                        </div>
                        <div className="space-y-4 text-xs font-bold uppercase tracking-widest leading-relaxed text-muted-foreground">
                            <p className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <span className="text-primary block mb-1">Roles Críticos</span>
                                Admins y Gerentes tienen control total sobre facturación y stock.
                            </p>
                            <p className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                <span className="text-secondary block mb-1">Operativos</span>
                                Cocina y Sala solo ven módulos transaccionales.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 space-y-4">
                        <h4 className="font-black italic uppercase tracking-tighter text-white">Instrucciones</h4>
                        <ul className="text-xs text-muted-foreground space-y-3 font-bold uppercase tracking-tight list-disc list-inside opacity-70">
                            <li>El personal debe tener email corporativo.</li>
                            <li>La contraseña se puede resetear editando.</li>
                            <li>Eliminar un acceso es definitivo.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <EmployeeFormModal 
                        employee={selectedEmployee}
                        onClose={() => setIsFormOpen(false)}
                        onSubmit={(data) => selectedEmployee 
                            ? updateEmployee(selectedEmployee.id, data) 
                            : createEmployee(data)
                        }
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
