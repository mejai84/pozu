import { Button } from "@/components/ui/button"
import { BarChart3, Mail, Download, FileText } from "lucide-react"
import { ReportData } from "../types"

interface Props {
    reportData: ReportData | null
    onEmailClick: () => void
    onExportCSV: () => void
    onExportPDF: () => void
}

export const ReportsHeader = ({ reportData, onEmailClick, onExportCSV, onExportPDF }: Props) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-10 h-10 text-primary" />
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic text-[#E8E0D5]">Inteligencia de <span className="text-primary">Negocio</span></h1>
                </div>
                <p className="text-muted-foreground font-medium max-w-xl">
                    Métricas avanzadas, rendimiento financiero y comportamiento de clientes para la toma de decisiones.
                </p>
            </div>
            <div className="flex flex-wrap gap-3 relative z-10">
                <Button
                    onClick={onEmailClick}
                    variant="outline"
                    disabled={!reportData}
                    className="gap-2 rounded-xl border-white/10 font-bold bg-white/5 hover:bg-white/10"
                >
                    <Mail className="w-4 h-4" /> Exportar (Email)
                </Button>
                <Button
                    onClick={onExportCSV}
                    variant="outline"
                    disabled={!reportData}
                    className="gap-2 rounded-xl border-white/10 font-bold bg-white/5 hover:bg-white/10"
                >
                    <Download className="w-4 h-4" /> Descargar CSV
                </Button>
                <Button
                    onClick={onExportPDF}
                    disabled={!reportData}
                    className="gap-2 rounded-xl font-black uppercase tracking-tighter italic"
                >
                    <FileText className="w-4 h-4" /> Imprimir PDF
                </Button>
            </div>
        </div>
    )
}
