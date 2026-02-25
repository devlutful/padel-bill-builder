import React from "react";
import { LineItem, createEmptyLineItem } from "@/lib/invoice-types";
import ImageUpload from "./ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency?: string;
}

const LineItemsEditor: React.FC<LineItemsEditorProps> = ({ items, onChange, currency = "£" }) => {
  const addItem = () => onChange([...items, createEmptyLineItem()]);

  const removeItem = (id: string) => onChange(items.filter((i) => i.id !== id));

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "unitPrice" || field === "quantity") {
          updated.amount = Number(updated.unitPrice) * Number(updated.quantity);
        }
        return updated;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground font-display">Line Items</h3>
        <Button type="button" size="sm" onClick={addItem} className="gap-1">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          No items yet. Click "Add Item" to get started.
        </div>
      )}

      {items.map((item, idx) => (
        <div
          key={item.id}
          className="bg-card rounded-lg border border-border p-4 space-y-3 animate-fade-in invoice-shadow"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Item #{idx + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
            <ImageUpload value={item.referImage} onChange={(v) => updateItem(item.id, "referImage", v)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Item Name</label>
                <Input value={item.itemName} onChange={(e) => updateItem(item.id, "itemName", e.target.value)} placeholder="e.g. Padel Court Frame" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Product Code</label>
                <Input value={item.productCode} onChange={(e) => updateItem(item.id, "productCode", e.target.value)} placeholder="e.g. PC-001" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Specifications</label>
            <Textarea value={item.specifications} onChange={(e) => updateItem(item.id, "specifications", e.target.value)} placeholder="Product specifications..." rows={2} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Advantages</label>
              <Textarea value={item.advantages} onChange={(e) => updateItem(item.id, "advantages", e.target.value)} placeholder="Key advantages..." rows={2} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Packing Details</label>
              <Textarea value={item.packingDetails} onChange={(e) => updateItem(item.id, "packingDetails", e.target.value)} placeholder="Packing details..." rows={2} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Unit Price ({currency})</label>
              <Input type="number" min={0} step={0.01} value={item.unitPrice || ""} onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Quantity</label>
              <Input type="number" min={0} value={item.quantity || ""} onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Amount ({currency})</label>
              <Input readOnly value={`${currency}${item.amount.toFixed(2)}`} className="bg-muted font-semibold" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LineItemsEditor;
