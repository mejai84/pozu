import { Store, Clock, Truck, CheckCircle, Printer, Instagram } from "lucide-react"

interface Props {
    activeTab: string
    setActiveTab: (tab: string) => void
}

export const SettingsTabs = ({ activeTab, setActiveTab }: Props) => {
    const tabs = [
        { id: "general", label: "General", icon: Store },
        { id: "hours", label: "Horarios", icon: Clock },
        { id: "delivery", label: "Delivery", icon: Truck },
        { id: "features", label: "Funcionalidades", icon: CheckCircle },
        { id: "printers", label: "Impresoras", icon: Printer },
        { id: "instagram", label: "Instagram", icon: Instagram, color: "pink" },
    ]

    return (
        <div className="flex border-b border-white/10 mb-8 gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 
                    ${activeTab === tab.id 
                        ? (tab.color === 'pink' ? 'border-pink-500 text-pink-500' : 'border-primary text-primary') 
                        : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
