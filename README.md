# Invoice Generator

A simple, responsive React app to create professional invoices. It supports "Bill From" and "Bill To" sections, itemized costs, optional PDF export, and optional custom extra charges (such as GST or handling fees).

## Features

- Bill From and Bill To details with clean layout
- Add, edit, and remove invoice items
- Automatic subtotal and final total calculation
- Optional extra charges:
  - Percentage-based (e.g., 18% GST)
  - Fixed amount (e.g., ₹50 Handling Fee)
  - Custom charge names (e.g., "GST percent", "Handling charge", "Shipping")
  - Multiple charges supported
- Invoice preview with subtotal, charges breakdown, and final total
- Download PDF button that is hidden inside the exported PDF
- Responsive design for desktop and mobile

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm

### Install
```
npm install
```

### Run
```
npm start
```
Open `http://localhost:3002` (the dev server may run on a custom port).

## Usage

1. Fill in "Bill From" and "Bill To" details.
2. Add your invoice items and set costs.
3. (Optional) Add Extra Charges:
   - In the Extra Charges section, click "Add Extra Charge".
   - Type a custom charge name like "GST", "Handling", or "Shipping".
   - Choose "Percent %" and enter a percentage (e.g., 18 for 18% GST), or choose "Fixed Amount" and enter a rupee amount.
   - Add multiple charges if needed and remove any charge with the Remove button.
4. Review the invoice preview. It shows subtotal, each extra charge, and the final total.
5. Click "Download PDF" to export the invoice as a PDF. The button is hidden in the exported file itself.

### Example: 18% GST on ₹100
- Subtotal: ₹100.00
- GST (18%): ₹18.00
- Total: ₹118.00

## Project Structure

- `src/App.tsx` — Main app composition and state (items, subtotal, extra charges, total)
- `src/components/BillFromForm.tsx` — Bill From form
- `src/components/UserInfoForm.tsx` — Bill To form
- `src/components/InvoiceItems.tsx` — Items list and editing
- `src/components/ExtraCharges.tsx` — Extra charges management (percent/fixed)
- `src/components/InvoiceDisplay.tsx` — Invoice preview, subtotal/charges breakdown, and PDF export

## Notes

- Extra charges are entirely optional. If you don’t add them, the total equals the subtotal.
- The PDF export uses `html2canvas` and `jspdf`.

## License

This project is provided as-is for personal or educational use.
