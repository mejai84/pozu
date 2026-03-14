
import { jsPDF } from "jspdf"

export const printOrderTicket = async (order: any, businessInfo: any) => {
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, 200] // Formato impresora térmica 80mm
    })

    const margin = 5
    const width = 70
    let y = 10

    // Load Logo
    try {
        const logoUrl = "/images/logo_cropped.png"
        const img = new Image()
        img.src = logoUrl
        await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
        })
        
        // Add logo (centered, approx 30mm width)
        const logoWidth = 30
        const logoHeight = (img.height * logoWidth) / img.width
        doc.addImage(img, 'PNG', 40 - (logoWidth / 2), y, logoWidth, logoHeight)
        y += logoHeight + 5
    } catch (e) {
        console.warn("Could not load logo for ticket, falling back to text", e)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("POZU 2.0", 40, y, { align: "center" })
        y += 6
    }

    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(businessInfo.address || "Pozu 2.0 Rest.", 40, y, { align: "center" })
    y += 4
    doc.text(`Tel: ${businessInfo.phone || ""}`, 40, y, { align: "center" })
    y += 8

    // Order Info
    doc.setFont("helvetica", "bold")
    doc.text(`TICKET #${order.id.split('-')[0].toUpperCase()}`, margin, y)
    y += 4
    doc.setFont("helvetica", "normal")
    doc.text(`Fecha: ${new Date(order.created_at).toLocaleString()}`, margin, y)
    y += 4
    doc.text(`Canal: ${order.order_type.toUpperCase()}`, margin, y)
    y += 4
    doc.text(`Cliente: ${order.guest_info?.name || "Cliente Final"}`, margin, y)
    y += 6

    // Items Header
    doc.line(margin, y, margin + width, y)
    y += 4
    doc.setFont("helvetica", "bold")
    doc.text("Cant", margin, y)
    doc.text("Producto", margin + 10, y)
    doc.text("Total", margin + width, y, { align: "right" })
    y += 2
    doc.line(margin, y, margin + width, y)
    y += 5

    // Items
    doc.setFont("helvetica", "normal")
    order.order_items.forEach((item: any) => {
        const name = item.products?.name || item.customizations?.name || "Producto"
        const lineTotal = (item.unit_price * item.quantity).toFixed(2)
        
        doc.text(item.quantity.toString(), margin, y)
        doc.text(name.substring(0, 22), margin + 10, y)
        doc.text(`${lineTotal}€`, margin + width, y, { align: "right" })
        y += 4

        if (item.customizations?.notes) {
            doc.setFontSize(7)
            doc.setFont("helvetica", "italic")
            doc.text(`* ${item.customizations.notes}`, margin + 10, y)
            y += 4
            doc.setFontSize(8)
            doc.setFont("helvetica", "normal")
        }
    })

    y += 2
    doc.line(margin, y, margin + width, y)
    y += 6

    // Totals
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("TOTAL:", margin + 20, y)
    doc.text(`${order.total.toFixed(2)}€`, margin + width, y, { align: "right" })
    
    // Footer
    y += 15
    doc.setFontSize(7)
    doc.setFont("helvetica", "italic")
    doc.text("¡Gracias por elegir Pozu 2.0!", 40, y, { align: "center" })
    y += 4
    doc.text("Síguenos en @pozu.rest", 40, y, { align: "center" })

    // Open Print Dialog indirectly by opening the blob or downloading
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
}
