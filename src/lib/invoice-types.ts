export interface LineItem {
  id: string;
  referImage: string; // base64 or URL
  itemName: string;
  productCode: string;
  specifications: string;
  advantages: string;
  packingDetails: string;
  unitPrice: number;
  quantity: number;
  amount: number; // computed: unitPrice * quantity
}

export interface CompanyInfo {
  name: string;
  address: string;
  email1: string;
  email2: string;
  phone1: string;
  phone2: string;
}

export interface ClientInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface Invoice {
  id: string;
  quoteNumber: string;
  date: string;
  basis: string;
  companyInfo: CompanyInfo;
  clientInfo: ClientInfo;
  lineItems: LineItem[];
  notes: string;
  certifications: string;
  warranty: string;
  leadTime: string;
  paymentTerms: string;
  validityDays: number;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export const defaultCompanyInfo: CompanyInfo = {
  name: "Newlands Padel",
  address: "2301 Bayfield Building\n99 Hennessy Road, Wan Chai\nHong Kong",
  email1: "Alan@newlandssourcing.com",
  email2: "John@piece-of-cake.org",
  phone1: "(+44)7594865953",
  phone2: "(+852)54839871",
};

export const defaultInvoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
  quoteNumber: "",
  date: new Date().toISOString().split('T')[0],
  basis: "DDP",
  companyInfo: { ...defaultCompanyInfo },
  clientInfo: { name: "", address: "", email: "", phone: "" },
  lineItems: [],
  notes: "MOQ: 1 court",
  certifications: "All components have passed Official CE testing.",
  warranty: "Our entire padel court system has a 5 year warranty, with a service time of 8+ years. LED lights: 2 years, artificial grass: 5 years, metal structure: 4 years, 12mm tempered glass: 10 years.",
  leadTime: "25-30 days",
  paymentTerms: "T/T 30% deposit, 70% balance before shipment.",
  validityDays: 30,
  subtotal: 0,
  total: 0,
};

export function createEmptyLineItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    referImage: "",
    itemName: "",
    productCode: "",
    specifications: "",
    advantages: "",
    packingDetails: "",
    unitPrice: 0,
    quantity: 0,
    amount: 0,
  };
}

export function generateQuoteNumber(existingInvoices: Invoice[]): string {
  const maxNum = existingInvoices.reduce((max, inv) => {
    const num = parseInt(inv.quoteNumber, 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return String(maxNum + 1).padStart(5, '0');
}
