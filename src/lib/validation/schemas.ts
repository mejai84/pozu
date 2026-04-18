/**
 * Zod v4 validation schemas for all API inputs.
 * Centralized validation ensures consistent, type-safe input handling.
 */
import { z } from 'zod'

// ========================================
// Employee schemas
// ========================================

const validRoles = ['admin', 'manager', 'staff', 'kitchen', 'cashier', 'delivery', 'waiter'] as const

export const createEmployeeSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email demasiado largo'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'Contraseña demasiado larga'),
  fullName: z
    .string()
    .min(2, 'Nombre demasiado corto')
    .max(100, 'Nombre demasiado largo')
    .regex(/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s'-]+$/, 'Nombre contiene caracteres no válidos'),
  phone: z
    .string()
    .max(20, 'Teléfono demasiado largo')
    .regex(/^[+\d\s()-]*$/, 'Formato de teléfono inválido')
    .optional(),
  role: z.enum(validRoles, { error: 'Rol no válido' }),
})

export const updateEmployeeSchema = z.object({
  id: z.string().uuid('ID de empleado inválido'),
  email: z.string().email('Email inválido').max(255).optional(),
  password: z.string().min(8).max(128).optional(),
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(validRoles).optional(),
})

export const deleteEmployeeSchema = z.object({
  id: z.string().uuid('ID de empleado inválido'),
})

// ========================================
// Checkout schemas
// ========================================

export const createPaymentIntentSchema = z.object({
  amount: z
    .number({ error: 'El monto debe ser un número' })
    .positive('El monto debe ser mayor que 0')
    .max(10000, 'Monto máximo excedido (10.000€)')
    .transform(val => Math.round(val * 100) / 100), // Round to 2 decimals
})

// ========================================
// Reservation schemas
// ========================================

export const createReservationSchema = z.object({
  customer_name: z
    .string()
    .min(2, 'Nombre demasiado corto')
    .max(100, 'Nombre demasiado largo')
    .transform(val => val.trim()),
  customer_phone: z
    .string()
    .min(6, 'Teléfono demasiado corto')
    .max(20, 'Teléfono demasiado largo')
    .regex(/^[+\d\s()-]+$/, 'Formato de teléfono inválido')
    .transform(val => val.trim()),
  reservation_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .refine(val => {
      const date = new Date(val)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date >= today
    }, 'La fecha no puede ser en el pasado'),
  reservation_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  guests_count: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 comensal')
    .max(20, 'Máximo 20 comensales'),
  notes: z
    .string()
    .max(500, 'Notas demasiado largas')
    .optional()
    .transform(val => val?.trim() || ''),
})

// ========================================
// Upload schemas
// ========================================

export const uploadFileSchema = z.object({
  type: z.enum(['image', 'video'] as const, { error: 'Tipo de archivo debe ser image o video' }),
})

// ========================================
// Helper: Format Zod errors for API responses
// ========================================

export function formatZodErrors(error: z.ZodError): string {
  return error.issues.map(e => e.message).join(', ')
}
