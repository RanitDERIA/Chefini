import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateShoppingListPDF(items: string[], userName?: string) {
  const doc = new jsPDF();
  
  // Add logo (you'll need to convert your logo to base64 or use URL)
  // For now, using text as placeholder
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 199, 44); // Chefini Yellow
  doc.text('CHEFINI', 105, 30, { align: 'center' });
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('Smart Shopping List', 105, 45, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 105, 52, { align: 'center' });
  
  if (userName) {
    doc.text(`Created by ${userName}`, 105, 58, { align: 'center' });
  }
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.setDrawColor(255, 199, 44);
  doc.line(20, 65, 190, 65);
  
  // Items list
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  let yPosition = 80;
  
  items.forEach((item, index) => {
    // Checkbox
    doc.rect(25, yPosition - 4, 5, 5);
    
    // Item text
    doc.text(`${index + 1}. ${item}`, 35, yPosition);
    
    yPosition += 10;
    
    // Add new page if needed
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      'Developed by RanitDERIA • Made with ❤️ by Chefini',
      105,
      285,
      { align: 'center' }
    );
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  return doc;
}

export async function generateShoppingListImage(
  elementId: string,
  items: string[],
  userName?: string
): Promise<Blob> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error('Element not found');
  }
  
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher quality
    logging: false,
    useCORS: true
  });
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image'));
      }
    }, 'image/png');
  });
}