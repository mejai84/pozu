import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { MediaItem } from '../types'

export const useMediaLibrary = () => {
    const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([])
    const [loadingMedia, setLoadingMedia] = useState(false)

    const fetchMediaLibrary = async () => {
        setLoadingMedia(true)
        try {
            const { data, error } = await supabase.storage.from('media').list('burgers', {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' }
            })
            if (error) throw error
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
            
            setMediaLibrary((data || []).filter(f => f.name !== '.emptyFolderPlaceholder').map(f => ({
                name: f.name,
                url: `${supabaseUrl}/storage/v1/object/public/media/burgers/${f.name}`,
                type: f.metadata?.mimetype?.includes('video') ? 'video' : 'image'
            })))
        } catch (e: any) {
            console.error(e)
        }
        setLoadingMedia(false)
    }

    return {
        mediaLibrary,
        loadingMedia,
        fetchMediaLibrary
    }
}
