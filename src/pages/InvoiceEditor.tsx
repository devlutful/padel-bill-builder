import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Invoice, defaultInvoice, defaultCompanyInfo, createEmptyLineItem, generateQuoteNumber } from "@/lib/invoice-types";
import { getInvoice, getInvoices, saveInvoice } from "@/lib/invoice-storage";
import LineItemsEditor from "@/components/LineItemsEditor";
import InvoicePreview from "@/components/InvoicePreview";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Eye, Pencil, Printer, Save } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const InvoiceEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [invoice, setInvoice] = useState<Invoice>(() => {
    if (!isNew && id) {
      const existing = getInvoice(id);
      if (existing) return existing;
    }
    const invoices = getInvoices();
    const now = new Date().toISOString();
    return {
      ...defaultInvoice,
      id: crypto.randomUUID(),
      quoteNumber: generateQuoteNumber(invoices),
      companyInfo: { ...defaultCompanyInfo },
      lineItems: [createEmptyLineItem()],
      createdAt: now,
      updatedAt: now,
    };
  });

  const [tab, setTab] = useState<string>("edit");

  // Recalculate totals
  const computed = useMemo(() => {
    const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
    return { subtotal, total: subtotal };
  }, [invoice.lineItems]);

  useEffect(() => {
    setInvoice((prev) => ({ ...prev, subtotal: computed.subtotal, total: computed.total }));
  }, [computed]);

  const updateField = <K extends keyof Invoice>(field: K, value: Invoice[K]) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const updateCompany = (field: keyof typeof invoice.companyInfo, value: string) => {
    setInvoice((prev) => ({ ...prev, companyInfo: { ...prev.companyInfo, [field]: value } }));
  };

  const updateClient = (field: keyof typeof invoice.clientInfo, value: string) => {
    setInvoice((prev) => ({ ...prev, clientInfo: { ...prev.clientInfo, [field]: value } }));
  };

  const handleSave = () => {
    saveInvoice({ ...invoice, subtotal: computed.subtotal, total: computed.total });
    toast.success("Invoice saved successfully!");
    if (isNew) navigate(`/invoice/${invoice.id}`, { replace: true });
  };

  const handlePrint = () => {
    setTab("preview");
    setTimeout(() => window.print(), 300);
  };

  const handleDownloadPDF = async () => {
    setTab("preview");
    await new Promise((r) => setTimeout(r, 300));
    const el = document.getElementById("invoice-preview");
    if (!el) return;
    toast.loading("Generating PDF...");
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [279, 432] });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      } else {
        while (position < pdfHeight) {
          pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, pdfHeight);
          position += pageHeight;
          if (position < pdfHeight) pdf.addPage();
        }
      }
      pdf.save(`Quote_${invoice.quoteNumber}_${invoice.clientInfo.name || "client"}.pdf`);
      toast.dismiss();
      toast.success("PDF downloaded!");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between invoice-shadow">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">
              Quote #{invoice.quoteNumber}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isNew ? "New Quote" : `Last updated: ${new Date(invoice.updatedAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-1">
            <Download className="w-4 h-4" /> PDF
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1">
            <Save className="w-4 h-4" /> Save
          </Button>
        </div>
      </div>

      <div className="no-print max-w-6xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="edit" className="gap-1"><Pencil className="w-3.5 h-3.5" /> Edit</TabsTrigger>
            <TabsTrigger value="preview" className="gap-1"><Eye className="w-3.5 h-3.5" /> Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6 animate-fade-in">
            {/* Invoice Meta */}
            <div className="bg-card rounded-lg border border-border p-5 invoice-shadow">
              <h3 className="text-lg font-semibold font-display text-foreground mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Quote Number</label>
                  <Input value={invoice.quoteNumber} onChange={(e) => updateField("quoteNumber", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Date</label>
                  <Input type="date" value={invoice.date} onChange={(e) => updateField("date", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Basis</label>
                  <Input value={invoice.basis} onChange={(e) => updateField("basis", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Company & Client */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-border p-5 invoice-shadow">
                <h3 className="text-lg font-semibold font-display text-foreground mb-4">Company Info</h3>
                <div className="space-y-3">
                  <div><label className="text-xs font-medium text-muted-foreground">Company Name</label><Input value={invoice.companyInfo.name} onChange={(e) => updateCompany("name", e.target.value)} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground">Address</label><Textarea value={invoice.companyInfo.address} onChange={(e) => updateCompany("address", e.target.value)} rows={3} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium text-muted-foreground">Email 1</label><Input value={invoice.companyInfo.email1} onChange={(e) => updateCompany("email1", e.target.value)} /></div>
                    <div><label className="text-xs font-medium text-muted-foreground">Email 2</label><Input value={invoice.companyInfo.email2} onChange={(e) => updateCompany("email2", e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium text-muted-foreground">Phone 1</label><Input value={invoice.companyInfo.phone1} onChange={(e) => updateCompany("phone1", e.target.value)} /></div>
                    <div><label className="text-xs font-medium text-muted-foreground">Phone 2</label><Input value={invoice.companyInfo.phone2} onChange={(e) => updateCompany("phone2", e.target.value)} /></div>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-5 invoice-shadow">
                <h3 className="text-lg font-semibold font-display text-foreground mb-4">Client Info</h3>
                <div className="space-y-3">
                  <div><label className="text-xs font-medium text-muted-foreground">Client Name</label><Input value={invoice.clientInfo.name} onChange={(e) => updateClient("name", e.target.value)} placeholder="Client name" /></div>
                  <div><label className="text-xs font-medium text-muted-foreground">Address</label><Textarea value={invoice.clientInfo.address} onChange={(e) => updateClient("address", e.target.value)} rows={3} placeholder="Client address" /></div>
                  <div><label className="text-xs font-medium text-muted-foreground">Email</label><Input value={invoice.clientInfo.email} onChange={(e) => updateClient("email", e.target.value)} placeholder="client@email.com" /></div>
                  <div><label className="text-xs font-medium text-muted-foreground">Phone</label><Input value={invoice.clientInfo.phone} onChange={(e) => updateClient("phone", e.target.value)} placeholder="+44..." /></div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <LineItemsEditor items={invoice.lineItems} onChange={(items) => updateField("lineItems", items)} />

            {/* Totals */}
            <div className="bg-card rounded-lg border border-border p-5 invoice-shadow flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">£{computed.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-foreground border-t border-border pt-2">
                  <span>Total</span>
                  <span>£{computed.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-card rounded-lg border border-border p-5 invoice-shadow space-y-3">
              <h3 className="text-lg font-semibold font-display text-foreground">Terms & Notes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Notes / MOQ</label><Input value={invoice.notes} onChange={(e) => updateField("notes", e.target.value)} /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Lead Time</label><Input value={invoice.leadTime} onChange={(e) => updateField("leadTime", e.target.value)} /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground">Certifications</label><Input value={invoice.certifications} onChange={(e) => updateField("certifications", e.target.value)} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Warranty</label><Textarea value={invoice.warranty} onChange={(e) => updateField("warranty", e.target.value)} rows={2} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Payment Terms</label><Input value={invoice.paymentTerms} onChange={(e) => updateField("paymentTerms", e.target.value)} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Validity (days)</label><Input type="number" value={invoice.validityDays} onChange={(e) => updateField("validityDays", parseInt(e.target.value) || 30)} /></div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="animate-fade-in">
            <InvoicePreview invoice={{ ...invoice, subtotal: computed.subtotal, total: computed.total }} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Print-only preview */}
      <div className="hidden print-only">
        <InvoicePreview invoice={{ ...invoice, subtotal: computed.subtotal, total: computed.total }} />
      </div>
    </div>
  );
};

export default InvoiceEditor;
