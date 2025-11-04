import React from "react";
import "./BillFromForm.css";

interface BillFromInfo {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  gstNumber?: string;
}

interface BillFromFormProps {
  billFrom: BillFromInfo;
  onBillFromChange: (field: keyof BillFromInfo, value: string) => void;
}

const BillFromForm: React.FC<BillFromFormProps> = ({
  billFrom,
  onBillFromChange,
}) => {
  return (
    <div className="bill-from-form">
      <h2>Bill From</h2>
      <div className="form-group">
        <label htmlFor="companyName">Company Name:</label>
        <input
          type="text"
          id="companyName"
          value={billFrom.companyName}
          onChange={(e) => onBillFromChange("companyName", e.target.value)}
          placeholder="Enter company name"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="companyAddress">Company Address:</label>
        <textarea
          id="companyAddress"
          value={billFrom.companyAddress}
          onChange={(e) => onBillFromChange("companyAddress", e.target.value)}
          placeholder="Enter company address"
          rows={3}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="companyPhone">Company Phone:</label>
        <input
          type="tel"
          id="companyPhone"
          value={billFrom.companyPhone}
          onChange={(e) => onBillFromChange("companyPhone", e.target.value)}
          placeholder="Enter company phone"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="companyEmail">Company Email:</label>
        <input
          type="email"
          id="companyEmail"
          value={billFrom.companyEmail}
          onChange={(e) => onBillFromChange("companyEmail", e.target.value)}
          placeholder="Enter company email"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="gstNumber">GST Number (optional):</label>
        <input
          type="text"
          id="gstNumber"
          value={billFrom.gstNumber || ""}
          onChange={(e) => onBillFromChange("gstNumber", e.target.value)}
          placeholder="Enter GST number"
        />
      </div>
    </div>
  );
};

export default BillFromForm;
