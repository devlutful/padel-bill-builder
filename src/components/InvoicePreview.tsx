import React from "react";
import { Invoice } from "@/lib/invoice-types";

interface InvoicePreviewProps {
  invoice: Invoice;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const { companyInfo, clientInfo, lineItems } = invoice;
  const currency = "£";

  return (
    <div
      id="invoice-preview"
      className="bg-white text-gray-900 max-w-[210mm] mx-auto shadow-lg"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", lineHeight: 1.5 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-8 pb-4" style={{ backgroundColor: "hsl(220, 60%, 15%)", color: "white" }}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {companyInfo.name}
          </h1>
          <p className="text-xs mt-1 opacity-80">Premium Padel Court Solutions</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold tracking-wider" style={{ color: "hsl(40, 80%, 55%)" }}>QUOTE</h2>
        </div>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-3 gap-4 px-8 py-4 border-b" style={{ borderColor: "#e5e7eb" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(40, 80%, 45%)" }}>Quote No.</p>
          <p className="font-bold text-lg">{invoice.quoteNumber}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(40, 80%, 45%)" }}>Date</p>
          <p className="font-semibold">{invoice.date ? new Date(invoice.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(40, 80%, 45%)" }}>Basis</p>
          <p className="font-semibold">{invoice.basis}</p>
        </div>
      </div>

      {/* Billed To / From */}
      <div className="grid grid-cols-2 gap-8 px-8 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "hsl(40, 80%, 45%)" }}>Billed To</p>
          <p className="font-bold text-base">{clientInfo.name || "Client Name"}</p>
          {clientInfo.address && <p className="whitespace-pre-line text-xs">{clientInfo.address}</p>}
          {clientInfo.email && <p className="text-xs">{clientInfo.email}</p>}
          {clientInfo.phone && <p className="text-xs">{clientInfo.phone}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "hsl(40, 80%, 45%)" }}>From</p>
          <p className="font-bold text-base">{companyInfo.name}</p>
          <p className="whitespace-pre-line text-xs">{companyInfo.address}</p>
          <div className="mt-1 text-xs">
            <p>{companyInfo.email1}</p>
            {companyInfo.email2 && <p>{companyInfo.email2}</p>}
            <p>{companyInfo.phone1}</p>
            {companyInfo.phone2 && <p>{companyInfo.phone2}</p>}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 py-2">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: "hsl(220, 40%, 25%)", color: "white" }}>
              <th className="text-left p-2 font-semibold">Ref</th>
              <th className="text-left p-2 font-semibold">Picture</th>
              <th className="text-left p-2 font-semibold">Item</th>
              <th className="text-left p-2 font-semibold">Product Specifications</th>
              <th className="text-left p-2 font-semibold">Advantages</th>
              <th className="text-left p-2 font-semibold">Details</th>
              <th className="text-right p-2 font-semibold">Unit Price (GBP)</th>
              <th className="text-right p-2 font-semibold">DDP QTY</th>
              <th className="text-right p-2 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center p-4 text-gray-400">No items</td>
              </tr>
            )}
            {lineItems.map((item, idx) => (
              <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? "#f9fafb" : "white" }} className="border-b border-gray-200">
                <td className="p-2 align-top font-medium">{item.productCode}</td>
                <td className="p-2 align-top">
                  {item.referImage && (
                    <img src={item.referImage} alt="" className="w-12 h-12 object-cover rounded" />
                  )}
                </td>
                <td className="p-2 align-top font-medium">{item.itemName}</td>
                <td className="p-2 align-top whitespace-pre-line">{item.specifications}</td>
                <td className="p-2 align-top whitespace-pre-line">{item.advantages}</td>
                <td className="p-2 align-top whitespace-pre-line">{item.packingDetails}</td>
                <td className="p-2 align-top text-right">{currency}{item.unitPrice.toFixed(2)}</td>
                <td className="p-2 align-top text-right">{item.quantity}</td>
                <td className="p-2 align-top text-right font-semibold">{currency}{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div className="px-8 py-3 text-xs space-y-1" style={{ color: "#374151" }}>
        {invoice.notes && <p><strong>MOQ:</strong> {invoice.notes.replace("MOQ: ", "")}</p>}
        {invoice.certifications && <p><strong>Certifications:</strong> {invoice.certifications}</p>}
        {invoice.warranty && <p><strong>Warranty:</strong> {invoice.warranty}</p>}
        {invoice.leadTime && <p><strong>Mass Production Lead Time:</strong> {invoice.leadTime}.</p>}
        {invoice.paymentTerms && <p><strong>Payment terms:</strong> {invoice.paymentTerms}</p>}
        <p className="text-gray-500 italic text-[10px] mt-2">
          This quotation is valid for {invoice.validityDays} days from date of issue. All prices are {invoice.basis} unless otherwise stated. Prices subject to final confirmation and availability.
        </p>
      </div>

      {/* Totals */}
      <div className="px-8 py-4 flex justify-end">
        <div className="w-64 space-y-1">
          <div className="flex justify-between text-sm border-b pb-1" style={{ borderColor: "#e5e7eb" }}>
            <span className="font-medium">Subtotal</span>
            <span>{currency}{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-1" style={{ color: "hsl(220, 60%, 15%)" }}>
            <span>TOTAL</span>
            <span>{currency}{invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 text-center text-[10px]" style={{ backgroundColor: "hsl(220, 60%, 15%)", color: "white" }}>
        <p className="font-semibold">{companyInfo.name}</p>
        <p className="opacity-70 mt-0.5">{companyInfo.email1} | {companyInfo.phone1}</p>
      </div>
    </div>
  );
};

export default InvoicePreview;
