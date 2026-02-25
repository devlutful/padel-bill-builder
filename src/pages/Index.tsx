import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Invoice } from "@/lib/invoice-types";
import { getInvoices, deleteInvoice } from "@/lib/invoice-storage";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Trash2, Pencil, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  const filtered = invoices.filter(
    (inv) =>
      inv.quoteNumber.includes(search) ||
      inv.clientInfo.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this invoice?")) {
      deleteInvoice(id);
      setInvoices(getInvoices());
      toast.success("Invoice deleted");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <header className="bg-primary text-primary-foreground px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold">Newlands Padel</h1>
          <p className="text-sm mt-2 opacity-80">Invoice & Quotation Management System</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by quote # or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => navigate("/invoice/new")} className="gap-2">
            <Plus className="w-4 h-4" /> New Quote
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">
              {invoices.length === 0 ? "No quotes yet" : "No results"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {invoices.length === 0
                ? "Create your first quotation to get started."
                : "Try a different search term."}
            </p>
            {invoices.length === 0 && (
              <Button onClick={() => navigate("/invoice/new")} className="gap-2">
                <Plus className="w-4 h-4" /> Create First Quote
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((inv) => (
              <div
                key={inv.id}
                onClick={() => navigate(`/invoice/${inv.id}`)}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-colors invoice-shadow animate-fade-in"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Quote #{inv.quoteNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {inv.clientInfo.name || "No client"} · {new Date(inv.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground">£{inv.total.toFixed(2)}</span>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/invoice/${inv.id}`); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => handleDelete(inv.id, e)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
