export type ProductCategory = 'all' | 'bebidas' | 'padaria' | 'mercearia' | 'hortifruti' | 'conveniencia';

export interface Product {
  id: string;
  code: string; // EAN or PLU
  name: string;
  brand: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  wholesale_price?: number;
  wholesale_min_quantity?: number;
  unit: 'UN' | 'KG';
  stock: number;
  isWeighable?: boolean;
  lowStock?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  timestamp: string;
}

export type PaymentMethodType = 'cash' | 'pix' | 'debit' | 'credit' | 'split';

export interface AppliedPayment {
  id: string;
  method: PaymentMethodType;
  methodLabel: string;
  detail: string;
  amount: number;
}

export interface CashMovementRecord {
  id: string;
  time: string;
  type: 'sangria' | 'suprimento' | 'abertura' | 'venda';
  title: string;
  documentRef: string;
  reason: string;
  operator: string;
  authorizer: string;
  amount: number;
}

export interface ParkedSale {
  id: string;
  code: string;
  timestamp: string;
  items: CartItem[];
  customerCpf?: string;
  total: number;
}

export interface CompletedSale {
  saleNumber: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: AppliedPayment[];
  change: number;
  customerCpf?: string;
  nfceKey: string;
}
