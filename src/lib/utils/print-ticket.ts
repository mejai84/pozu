
import { jsPDF } from "jspdf"

export const printOrderTicket = async (order: any, businessInfo: any) => {
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, 250] // Formato impresora térmica 80mm (largo ajustable)
    })

    const margin = 5
    const width = 70
    let y = 10

    // Extraer info de cliente (soporta varios formatos de la DB)
    const guestInfo = typeof order.guest_info === 'string' ? JSON.parse(order.guest_info) : order.guest_info;
    const customerName = guestInfo?.name || guestInfo?.full_name || order.customer_name || "Cliente Final";
    const customerPhone = order.customer_phone || guestInfo?.phone || "Sin teléfono";
    
    // Nueva lógica: Detectar método de pago desde columna o desde objeto items (n8n v12)
    const itemsData = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const paymentMethodRaw = (itemsData?.metodo_pago || order.payment_method || 'efectivo').toLowerCase();
    const paymentMethod = paymentMethodRaw.includes('tarjeta') || paymentMethodRaw === 'stripe' ? 'TARJETA' : 'EFECTIVO';
    
    const source = (order.source || 'web').toUpperCase();

    // Load Logo
    try {
        const logoUrl = "/images/logo_cropped.png"
        const img = new Image()
        img.src = logoUrl
        await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
        })
        
        const logoWidth = 30
        const logoHeight = (img.height * logoWidth) / img.width
        doc.addImage(img, 'PNG', 40 - (logoWidth / 2), y, logoWidth, logoHeight)
        y += logoHeight + 5
    } catch (e) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("POZU 2.0", 40, y, { align: "center" })
        y += 6
    }

    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(businessInfo.address || "Pola de Laviana", 40, y, { align: "center" })
    y += 4
    doc.text(`Tel: ${businessInfo.phone || "600 000 000"}`, 40, y, { align: "center" })
    y += 8

    // Separador
    doc.setLineDashPattern([1, 1], 0)
    doc.line(margin, y, margin + width, y)
    y += 5
    doc.setLineDashPattern([], 0)

    // Order Info
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(`PEDIDO #${order.id.split('-')[0].toUpperCase()}`, margin, y)
    y += 5
    
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(`Fecha: ${new Date(order.created_at).toLocaleString('es-ES')}`, margin, y)
    y += 4
    doc.text(`Origen: ${source}`, margin, y)
    y += 4
    doc.text(`Pago: ${paymentMethod}`, margin, y)
    y += 6

    // Customer / Delivery Info
    doc.setFont("helvetica", "bold")
    doc.text("DATOS DEL CLIENTE", margin, y)
    y += 4
    doc.setFont("helvetica", "normal")
    doc.text(`Nombre: ${customerName}`, margin, y)
    y += 4
    doc.text(`Tel: ${customerPhone}`, margin, y)
    y += 4

    if (order.order_type === 'delivery' && order.delivery_address) {
        const addr = order.delivery_address;
        const street = typeof addr === 'string' ? addr : (addr.street || addr.address || "Dirección no especificada");
        const city = addr.city || "";
        
        doc.setFont("helvetica", "bold")
        y += 2
        doc.text("DIRECCIÓN DE ENTREGA:", margin, y)
        y += 4
        doc.setFont("helvetica", "normal")
        const splitAddress = doc.splitTextToSize(street + (city ? `, ${city}` : ""), width);
        doc.text(splitAddress, margin, y)
        y += (splitAddress.length * 4) + 2
    }
    y += 2

    // Items Header
    doc.setDrawColor(0)
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
        const price = item.unit_price || item.price || 0;
        const lineTotal = (price * item.quantity).toFixed(2)
        
        doc.text(item.quantity.toString(), margin, y)
        
        // Wrap text if product name is long
        const splitName = doc.splitTextToSize(name, 45);
        doc.text(splitName, margin + 10, y)
        doc.text(`${lineTotal}€`, margin + width, y, { align: "right" })
        
        y += (splitName.length * 4)

        const notes = item.notes || item.customizations?.notes;
        if (notes) {
            doc.setFontSize(7)
            doc.setFont("helvetica", "italic")
            const splitNotes = doc.splitTextToSize(`* ${notes}`, 50);
            doc.text(splitNotes, margin + 12, y)
            y += (splitNotes.length * 3) + 1
            doc.setFontSize(8)
            doc.setFont("helvetica", "normal")
        }
        y += 1
    })

    y += 2
    doc.line(margin, y, margin + width, y)
    y += 6

    // Totals
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("TOTAL:", margin, y)
    doc.text(`${Number(order.total).toFixed(2)}€`, margin + width, y, { align: "right" })
    
    // Footer
    y += 15
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text("¡Gracias por elegir Pozu 2.0!", 40, y, { align: "center" })
    y += 4
    doc.text("Ruge ese motor!", 40, y, { align: "center" })

    // Open Print Dialog
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
}
