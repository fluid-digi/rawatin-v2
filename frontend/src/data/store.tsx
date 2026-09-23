import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import type {
  Addon,
  Customer,
  Order,
  OrderStatus,
  Payment,
  PaymentMethod,
  Photo,
  Service,
  Session,
  Tenant,
  User
} from './types';
import {
  ADDONS,
  CUSTOMERS,
  SERVICES,
  TENANT,
  USERS,
  seedOrders
} from './fixtures';
import { localId, randomSuffix } from '@/lib/id';

const STORAGE_KEY = 'rawatin.demo.v1';
const STATUS_ORDER: OrderStatus[] = ['received', 'in_progress', 'finishing', 'ready', 'completed'];

interface PersistShape {
  tenant: Tenant;
  services: Service[];
  addons: Addon[];
  customers: Customer[];
  orders: Order[];
  roleId: string;
  loggedIn: boolean;
  onboarded: boolean;
}

function seed(): PersistShape {
  return {
    tenant: structuredClone(TENANT),
    services: structuredClone(SERVICES),
    addons: structuredClone(ADDONS),
    customers: structuredClone(CUSTOMERS),
    orders: seedOrders(),
    roleId: 'u_rani',
    loggedIn: false,
    onboarded: true
  };
}

function load(): PersistShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistShape;
  } catch {
    /* ignore corrupt state, fall back to seed */
  }
  return seed();
}

export interface IntakeDraftItem {
  brand: string;
  color: string;
  conditionTags: string[];
  conditionNotes: string;
  quantity: number;
  serviceId: string;
  addonIds: string[];
  photos: { url: string }[];
}

export interface IntakeInput {
  customerName: string;
  customerPhone: string;
  items: IntakeDraftItem[];
  discount: number;
  paid: number;
  paymentMethod: PaymentMethod;
  publishConsent: boolean;
  disclaimerAccepted: boolean;
  offline: boolean;
}

interface StoreValue {
  tenant: Tenant;
  services: Service[];
  addons: Addon[];
  customers: Customer[];
  orders: Order[];
  currentUser: User;
  session: Session | null;
  loggedIn: boolean;
  onboarded: boolean;
  pendingSync: number;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (userId: string) => void;
  getOrder: (id: string) => Order | undefined;
  getOrderByToken: (token: string) => Order | undefined;
  findCustomerByPhone: (phone: string) => Customer | undefined;
  createOrder: (input: IntakeInput) => Order;
  advanceStatus: (orderId: string, to: OrderStatus, note?: string) => void;
  bulkAdvance: (orderIds: string[]) => void;
  addAfterPhoto: (orderId: string, itemId: string, url: string) => void;
  addPayment: (orderId: string, amount: number, method: PaymentMethod) => void;
  confirmPickup: (orderId: string, proofUrl: string, pickedUpByName?: string, overrideNote?: string) => void;
  markReviewSent: (orderId: string) => void;
  resetReview: (orderId: string) => void;
  syncNow: () => void;
  toggleService: (serviceId: string) => void;
  updateTenant: (patch: Partial<Tenant>) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistShape>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be full or blocked; demo continues in-memory */
    }
  }, [state]);

  const currentUser = useMemo(
    () => USERS.find((u) => u.id === state.roleId) ?? USERS[0],
    [state.roleId]
  );

  const patchOrder = useCallback((orderId: string, fn: (o: Order) => Order) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === orderId ? fn(o) : o))
    }));
  }, []);

  const recomputePayment = (o: Order): Order => {
    const paidAmount = o.payments.reduce((sum, p) => sum + p.amount, 0);
    const paymentStatus = paidAmount >= o.total ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';
    return { ...o, paidAmount, paymentStatus };
  };

  const value: StoreValue = {
    tenant: state.tenant,
    services: state.services,
    addons: state.addons,
    customers: state.customers,
    orders: state.orders,
    currentUser,
    session: state.loggedIn ? { user: currentUser, tenant: state.tenant } : null,
    loggedIn: state.loggedIn,
    onboarded: state.onboarded,
    pendingSync: state.orders.filter((o) => !o.synced).length,

    login: (userId) => setState((s) => ({ ...s, loggedIn: true, roleId: userId })),
    logout: () => setState((s) => ({ ...s, loggedIn: false })),
    switchRole: (userId) => setState((s) => ({ ...s, roleId: userId })),

    getOrder: (id) => state.orders.find((o) => o.id === id),
    getOrderByToken: (token) => state.orders.find((o) => o.publicToken === token || o.orderCode.toLowerCase() === token.toLowerCase()),
    findCustomerByPhone: (phone) => state.customers.find((c) => c.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')),

    createOrder: (input) => {
      const now = new Date();
      const durationForItem = (it: IntakeDraftItem) => {
        const svc = state.services.find((s) => s.id === it.serviceId);
        const base = svc?.durationDays ?? 2;
        const extra = it.addonIds.reduce((sum, id) => sum + (state.addons.find((a) => a.id === id)?.extraDurationDays ?? 0), 0);
        return Math.max(1, base + extra);
      };
      const maxDuration = Math.max(...input.items.map(durationForItem), 1);
      const est = new Date(now.getTime() + maxDuration * 86_400_000);

      const items = input.items.map((it, i) => {
        const svc = state.services.find((s) => s.id === it.serviceId)!;
        const addonTotal = it.addonIds.reduce((sum, id) => sum + (state.addons.find((a) => a.id === id)?.price ?? 0), 0);
        const lineTotal = (svc.price + addonTotal) * it.quantity;
        const photos: Photo[] = it.photos.map((p, j) => ({
          id: localId(`ph${i}${j}`),
          type: 'before',
          url: p.url,
          takenAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + state.tenant.photoRetentionDays * 86_400_000).toISOString(),
          uploadedBy: currentUser.name,
          local: input.offline
        }));
        return {
          id: localId('it'),
          brand: it.brand,
          color: it.color,
          conditionTags: it.conditionTags,
          conditionNotes: it.conditionNotes,
          quantity: it.quantity,
          services: [{ serviceId: svc.id, serviceName: svc.name, priceSnapshot: svc.price, addonIds: it.addonIds }],
          photos,
          lineTotal
        };
      });

      const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
      const total = Math.max(0, subtotal - input.discount);
      const paid = Math.min(input.paid, total);
      const code = `RWT-${Math.floor(1000 + Math.random() * 8999)}`;

      let customer = state.customers.find((c) => c.phone.replace(/\D/g, '') === input.customerPhone.replace(/\D/g, ''));
      let customers = state.customers;
      if (!customer) {
        customer = {
          id: localId('c'),
          tenantId: state.tenant.id,
          name: input.customerName,
          phone: input.customerPhone,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderAt: null
        };
        customers = [...state.customers, customer];
      }
      customers = customers.map((c) =>
        c.id === customer!.id
          ? { ...c, totalOrders: c.totalOrders + 1, totalSpent: c.totalSpent + total, lastOrderAt: now.toISOString() }
          : c
      );

      const order: Order = {
        id: localId('o'),
        tenantId: state.tenant.id,
        orderCode: code,
        publicToken: `${code.toLowerCase()}-${randomSuffix(5).toLowerCase()}`,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        createdByName: currentUser.name,
        status: 'received',
        items,
        subtotal,
        discount: input.discount,
        total,
        paidAmount: paid,
        paymentStatus: paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
        payments: paid > 0 ? [{ id: localId('pay'), amount: paid, method: input.paymentMethod, createdAt: now.toISOString(), receivedBy: currentUser.name }] : [],
        publishConsent: input.publishConsent,
        disclaimerAcceptedAt: input.disclaimerAccepted ? now.toISOString() : null,
        receivedAt: now.toISOString(),
        estimatedReadyAt: est.toISOString(),
        readyAt: null,
        pickedUpAt: null,
        pickedUpByName: null,
        pickupConfirmedByName: null,
        pickupProof: null,
        reviewRequestSentAt: null,
        reviewRequestSentByName: null,
        statusLogs: [{ id: localId('log'), from: null, to: 'received', at: now.toISOString(), by: currentUser.name }],
        notes: '',
        synced: !input.offline
      };

      setState((s) => ({ ...s, orders: [order, ...s.orders], customers }));
      return order;
    },

    advanceStatus: (orderId, to, note) => {
      // Completion only via pickup flow.
      if (to === 'completed') return;
      patchOrder(orderId, (o) => {
        if (o.status === to) return o;
        const now = new Date().toISOString();
        const readyAt = to === 'ready' ? now : o.readyAt;
        return {
          ...o,
          status: to,
          readyAt,
          statusLogs: [...o.statusLogs, { id: localId('log'), from: o.status, to, at: now, by: currentUser.name, note }]
        };
      });
    },

    bulkAdvance: (orderIds) => {
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) => {
          if (!orderIds.includes(o.id)) return o;
          const idx = STATUS_ORDER.indexOf(o.status);
          if (idx < 0 || idx >= 3) return o; // never bulk into ready->completed
          const to = STATUS_ORDER[idx + 1];
          const readyAt = to === 'ready' ? now : o.readyAt;
          return { ...o, status: to, readyAt, statusLogs: [...o.statusLogs, { id: localId('log'), from: o.status, to, at: now, by: currentUser.name, note: 'Ubah massal' }] };
        })
      }));
    },

    addAfterPhoto: (orderId, itemId, url) => {
      const now = new Date();
      patchOrder(orderId, (o) => ({
        ...o,
        items: o.items.map((it) =>
          it.id === itemId
            ? {
                ...it,
                photos: [
                  ...it.photos,
                  {
                    id: localId('after'),
                    type: 'after',
                    url,
                    takenAt: now.toISOString(),
                    expiresAt: new Date(now.getTime() + state.tenant.photoRetentionDays * 86_400_000).toISOString(),
                    uploadedBy: currentUser.name
                  }
                ]
              }
            : it
        )
      }));
    },

    addPayment: (orderId, amount, method) => {
      if (amount <= 0) return;
      patchOrder(orderId, (o) => {
        const payment: Payment = { id: localId('pay'), amount, method, createdAt: new Date().toISOString(), receivedBy: currentUser.name };
        return recomputePayment({ ...o, payments: [...o.payments, payment] });
      });
    },

    confirmPickup: (orderId, proofUrl, pickedUpByName, overrideNote) => {
      const now = new Date();
      patchOrder(orderId, (o) => {
        const proof: Photo = {
          id: localId('proof'),
          type: 'pickup_proof',
          url: proofUrl,
          takenAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + state.tenant.photoRetentionDays * 86_400_000).toISOString(),
          uploadedBy: currentUser.name
        };
        return {
          ...o,
          status: 'completed',
          pickedUpAt: now.toISOString(),
          pickedUpByName: pickedUpByName?.trim() || o.customerName,
          pickupConfirmedByName: currentUser.name,
          pickupProof: proof,
          statusLogs: [...o.statusLogs, { id: localId('log'), from: o.status, to: 'completed', at: now.toISOString(), by: currentUser.name, note: overrideNote ? `Override: ${overrideNote}` : 'Konfirmasi pengambilan' }]
        };
      });
    },

    markReviewSent: (orderId) => {
      const now = new Date().toISOString();
      patchOrder(orderId, (o) => ({ ...o, reviewRequestSentAt: now, reviewRequestSentByName: currentUser.name }));
    },

    resetReview: (orderId) => {
      patchOrder(orderId, (o) => ({ ...o, reviewRequestSentAt: null, reviewRequestSentByName: null }));
    },

    syncNow: () => setState((s) => ({ ...s, orders: s.orders.map((o) => ({ ...o, synced: true, items: o.items.map((it) => ({ ...it, photos: it.photos.map((p) => ({ ...p, local: false })) })) })) })),

    toggleService: (serviceId) =>
      setState((s) => ({ ...s, services: s.services.map((sv) => (sv.id === serviceId ? { ...sv, isActive: !sv.isActive } : sv)) })),

    updateTenant: (patch) => setState((s) => ({ ...s, tenant: { ...s.tenant, ...patch } })),

    resetDemo: () => setState({ ...seed(), loggedIn: state.loggedIn, roleId: state.roleId })
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
