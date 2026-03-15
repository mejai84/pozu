export type Product = {
    id: string
    name: string
    category_id: string
    price: number
    description: string | null
    image_url: string | null
    is_available: boolean
    ingredients: string[] | null
    deleted_at: string | null
    allergens: string | null
    stock_quantity: number | null
    options?: {
        video_url?: string | null
        badge?: string | null
        allergens?: string[] | null
    }
}

export type FormData = Partial<Product> & { 
    video_url?: string;
    badge?: string;
}

export type MediaMode = 'url' | 'upload' | 'library'
export type ViewMode = 'grid' | 'table'

export interface MediaItem {
    name: string
    url: string
    type: 'image' | 'video'
}
