import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Employee, EmployeeFormData } from '../types'

export const useEmployees = () => {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)

    const fetchEmployees = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['admin', 'manager', 'staff', 'waiter', 'kitchen', 'cashier', 'delivery'])
                .order('created_at', { ascending: false })

            if (error) throw error
            setEmployees(data || [])
        } catch (error) {
            console.error('Error fetching employees:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    const createEmployee = async (data: EmployeeFormData) => {
        try {
            const response = await fetch('/api/admin/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error || 'Error al crear empleado')
            
            await fetchEmployees()
            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    const updateEmployee = async (id: string, data: Partial<EmployeeFormData>) => {
        try {
            const response = await fetch('/api/admin/employees', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...data })
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error || 'Error al actualizar empleado')
            
            await fetchEmployees()
            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    const deleteEmployee = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/employees?id=${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.error || 'Error al eliminar empleado')
            }
            
            await fetchEmployees()
            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    return {
        employees,
        loading,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        refresh: fetchEmployees
    }
}
