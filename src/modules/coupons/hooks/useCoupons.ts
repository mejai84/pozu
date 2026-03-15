import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Coupon } from '../types'

export const useCoupons = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.warn('Coupons table might not exist yet:', error.message)
                setCoupons([])
            } else {
                setCoupons(data || [])
            }
        } catch (err) {
            console.error('Error fetching coupons:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    const toggleCoupon = async (id: string, active: boolean) => {
        const { error } = await supabase
            .from('coupons')
            .update({ active })
            .eq('id', id)
        
        if (!error) fetchCoupons()
        return !error
    }

    const deleteCoupon = async (id: string) => {
        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', id)
        
        if (!error) fetchCoupons()
        return !error
    }

    const createCoupon = async (coupon: Partial<Coupon>) => {
        const { error } = await supabase
            .from('coupons')
            .insert([coupon])
        
        if (!error) fetchCoupons()
        return !error
    }

    return {
        coupons,
        loading,
        toggleCoupon,
        deleteCoupon,
        createCoupon
    }
}
