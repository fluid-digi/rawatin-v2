export type Plan = 'free' | 'solo' | 'outlet';
export type Role = 'owner' | 'staff';

export type OrderStatus =
  | 'received'
  | 'in_progress'
  | 'finishing'
  | 'ready'
  | 'completed';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'qris' | 'transfer';
export type PhotoType = 'before' | 'after' | 'issue' | 'pickup_proof';

export interface StatusConfig {
  id: OrderStatus;
  label: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  city: string;
  whatsapp: string;
  googleMapsReviewUrl: string;
  plan: Plan;
  itemLabel: string;
  disclaimerText: string;
  requirePickupProof: boolean;
  photoRetentionDays: number;
  statuses: StatusConfig[];
  shareCounterEnabled: boolean;
  totalCaredItems: number;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  role: Role;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  durationDays: number;
  category: 'Cuci' | 'Perawatan' | 'Perbaikan';
  unit: 'pasang' | 'pcs' | 'unit';
  isActive: boolean;
}

export interface Addon {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  extraDurationDays: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

export interface Photo {
  id: string;
  type: PhotoType;
  url: string;
  takenAt: string;
  expiresAt: string | null;
  uploadedBy: string;
  local?: boolean;
}

export interface OrderItemService {
  serviceId: string;
  serviceName: string;
  priceSnapshot: number;
  addonIds: string[];
}

export interface OrderItem {
  id: string;
  brand: string;
  color: string;
  conditionTags: string[];
  conditionNotes: string;
  quantity: number;
  services: OrderItemService[];
  photos: Photo[];
  lineTotal: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  createdAt: string;
  receivedBy: string;
}

export interface StatusLog {
  id: string;
  from: OrderStatus | null;
  to: OrderStatus;
  at: string;
  by: string;
  note?: string;
}

export interface Order {
  id: string;
  tenantId: string;
  orderCode: string;
  publicToken: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  createdByName: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  payments: Payment[];
  publishConsent: boolean;
  disclaimerAcceptedAt: string | null;
  receivedAt: string;
  estimatedReadyAt: string;
  readyAt: string | null;
  pickedUpAt: string | null;
  pickedUpByName: string | null;
  pickupConfirmedByName: string | null;
  pickupProof: Photo | null;
  reviewRequestSentAt: string | null;
  reviewRequestSentByName: string | null;
  statusLogs: StatusLog[];
  notes: string;
  synced: boolean;
}

export interface Session {
  user: User;
  tenant: Tenant;
}

export interface WaTemplate {
  id: string;
  label: string;
  body: string;
}
