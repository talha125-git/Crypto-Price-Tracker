import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDF = (items) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    // 1. Header Section (Blue Banner)
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, 210, 40, 'F'); // Full width rectangle

    // Title in White
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Crypto Portfolio Report", 14, 25);

    // Date in lighter white/gray
    doc.setFontSize(10);
    doc.setTextColor(220, 220, 220);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${date}`, 200, 25, { align: "right" });

    // 2. Portfolio Summary Table
    const tableColumn = ["Coin", "Symbol", "Price", "Quantity", "Total Value"];
    const tableRows = [];
    let grandTotal = 0;

    items.forEach(item => {
        const itemTotal = item.totalValue || 0;
        grandTotal += itemTotal;

        const rowData = [
            item.name || "Unknown",
            (item.symbol || "").toUpperCase(),
            `$${(item.current_price || 0).toLocaleString()}`,
            (item.quantity || 0).toString(),
            `$${itemTotal.toLocaleString()}`
        ];
        tableRows.push(rowData);
    });

    // Table Configuration
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid', // Grid theme for clear separation
        headStyles: {
            fillColor: [37, 99, 235], // Blue header to match top
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 12,
            halign: 'center'
        },
        bodyStyles: {
            textColor: 50,
            fontSize: 11,
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [240, 245, 255] // Very light blue for alternate rows
        },
        columnStyles: {
            0: { halign: 'left', fontStyle: 'bold' }, // Coin Name left aligned
            4: { halign: 'right', fontStyle: 'bold' } // Value right aligned
        },
        margin: { top: 50 },
    });

    // 3. Grand Total Section
    const finalY = doc.lastAutoTable.finalY + 15;

    // Total Box
    doc.setFillColor(245, 245, 245);
    doc.rect(110, finalY - 8, 90, 16, 'F'); // Background box for total

    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text("Grand Total Value:", 115, finalY + 4);

    doc.setFontSize(14);
    doc.setTextColor(37, 180, 50); // Green color for money
    doc.setFont("helvetica", "bold");
    doc.text(`$${grandTotal.toLocaleString()}`, 195, finalY + 4, { align: "right" });

    // 4. Footer
    const pageHeight = doc.internal.pageSize.height;

    // Footer Line
    doc.setDrawColor(200);
    doc.line(14, pageHeight - 15, 196, pageHeight - 15);

    // Footer Text
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "italic");
    doc.text("Abutalha Crypto Price Tracker project", 105, pageHeight - 8, { align: "center" });

    // Save PDF
    doc.save("crypto_portfolio_report.pdf");
};
