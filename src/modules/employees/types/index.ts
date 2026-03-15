export type EmployeeRole = 'admin' | 'manager' | 'staff' | 'waiter' | 'kitchen' | 'cashier' | 'delivery'

export interface Employee {
    id: string
    email: string
    full_name: string | null
    phone: string | null
    role: EmployeeRole
    created_at: string
}

export interface EmployeeFormData {
    fullName: string
    email?: string
    password?: string
    role: EmployeeRole
}
