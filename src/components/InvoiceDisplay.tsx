import React, { useRef } from 'react';
import './InvoiceDisplay.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface UserInfo {
  name: string;
  date: string;
  address: string;
  phoneNumber: string;
}

interface BillFromInfo {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  gstNumber?: string;
}

interface InvoiceItem {
  id: number;
  itemName: string;
  itemCost: number;
}

interface InvoiceDisplayProps {
  billFrom: BillFromInfo;
  userInfo: UserInfo;
  items: InvoiceItem[];
  total: number;
}

const InvoiceDisplay: React.FC<InvoiceDisplayProps> = ({ billFrom, userInfo, items, total }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    const element = invoiceRef.current;
    element.classList.add('exporting');
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save('invoice.pdf');
    } finally {
      element.classList.remove('exporting');
    }
  };

  return (
    <div className="invoice-display" ref={invoiceRef}>
      <div className="invoice-header">
        <h1>INVOICE</h1>
        <div className="invoice-details">
          {userInfo.date && (<p><strong>Date:</strong> {userInfo.date}</p>)}
          <p><strong>Invoice #:</strong> {Date.now().toString().slice(-6)}</p>
        </div>
      </div>

      <div className="invoice-actions">
        <button className="download-btn" onClick={handleDownloadPDF}>Download PDF</button>
      </div>
      
      <div className="invoice-body">
        <div className="invoice-parties">
          <div className="party bill-from">
            <h3>Bill From</h3>
            {billFrom.companyName && (<p><strong>{billFrom.companyName}</strong></p>)}
            {billFrom.companyAddress && (<p>{billFrom.companyAddress}</p>)}
            {billFrom.companyPhone && (<p>{billFrom.companyPhone}</p>)}
            {billFrom.companyEmail && (<p>{billFrom.companyEmail}</p>)}
            {billFrom.gstNumber && (<p><strong>GST:</strong> {billFrom.gstNumber}</p>)}
          </div>
          <div className="party bill-to">
            <h3>Bill To</h3>
            {userInfo.name && (<p><strong>{userInfo.name}</strong></p>)}
            {userInfo.address && (<p>{userInfo.address}</p>)}
            {userInfo.phoneNumber && (<p>{userInfo.phoneNumber}</p>)}
          </div>
        </div>
        
        <div className="invoice-table">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.itemName || 'Unnamed Item'}</td>
                  <td>₹{item.itemCost.toFixed(2)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={2} className="no-items">No items added yet</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td><strong>Total:</strong></td>
                <td><strong>₹{total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDisplay;