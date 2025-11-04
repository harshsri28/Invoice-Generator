import React, { useRef, useImperativeHandle } from 'react';
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

interface ExtraCharge {
  id: number;
  name: string;
  type: 'percent' | 'fixed';
  value: number;
}

interface InvoiceDisplayProps {
  billFrom: BillFromInfo;
  userInfo: UserInfo;
  items: InvoiceItem[];
  total: number;
  subtotal?: number;
  extraCharges?: ExtraCharge[];
  invoiceNumber?: string;
}

export interface InvoiceDisplayHandle {
  downloadPDF: () => Promise<void>;
}

const InvoiceDisplay = React.forwardRef<InvoiceDisplayHandle, InvoiceDisplayProps>(function InvoiceDisplay({ billFrom, userInfo, items, total, subtotal, extraCharges, invoiceNumber }, ref) {
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

  useImperativeHandle(ref, () => ({
    downloadPDF: handleDownloadPDF
  }));

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  const computeChargeAmount = (charge: ExtraCharge, base: number) => {
    if (charge.type === 'percent') {
      return (base * (Number(charge.value) || 0)) / 100;
    }
    return Number(charge.value) || 0;
  };

  return (
    <div className="invoice-display" ref={invoiceRef}>
      <div className="invoice-header">
        <h1>INVOICE</h1>
        <div className="invoice-details">
          {userInfo.date && (<p><strong>Date:</strong> {userInfo.date}</p>)}
          <p><strong>Invoice #:</strong> {invoiceNumber || Date.now().toString().slice(-6)}</p>
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
                  <td>{formatCurrency(item.itemCost)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={2} className="no-items">No items added yet</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              {typeof subtotal === 'number' && (
                <tr>
                  <td><strong>Subtotal:</strong></td>
                  <td><strong>{formatCurrency(subtotal)}</strong></td>
                </tr>
              )}

              {Array.isArray(extraCharges) && extraCharges.map((charge) => (
                <tr key={`ch-${charge.id}`}>
                  <td>
                    {charge.type === 'percent'
                      ? `${charge.name || 'Percent charge'} ${charge.value}%`
                      : `${charge.name || 'Fixed charge'} ${formatCurrency(charge.value)}`}
                  </td>
                  <td><strong>{formatCurrency(computeChargeAmount(charge, subtotal || 0))}</strong></td>
                </tr>
              ))}

              <tr className="total-row">
                <td><strong>Total:</strong></td>
                <td><strong>{formatCurrency(total)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
});

export default InvoiceDisplay;