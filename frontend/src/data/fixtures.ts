import type {
  Addon,
  Customer,
  Order,
  Service,
  Tenant,
  User,
  WaTemplate
} from './types';
import { placeholderPhoto } from './photos';

const iso = (offsetDays: number, hour = 10, min = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

export const TENANT: Tenant = {
  id: 't_dipclean',
  name: 'Dip Clean Shoes',
  slug: 'dipclean',
  city: 'Bandung',
  whatsapp: '628112223334',
  googleMapsReviewUrl: 'https://maps.google.com/?cid=demo-dipclean',
  plan: 'outlet',
  itemLabel: 'pasang',
  disclaimerText:
    'Kondisi barang telah difoto dan disetujui saat serah-terima. Outlet tidak bertanggung jawab atas kerusakan yang sudah ada sebelum perawatan.',
  requirePickupProof: true,
  photoRetentionDays: 730,
  statuses: [
    { id: 'received', label: 'Diterima' },
    { id: 'in_progress', label: 'Dikerjakan' },
    { id: 'finishing', label: 'Finishing' },
    { id: 'ready', label: 'Siap Diambil' },
    { id: 'completed', label: 'Selesai' }
  ],
  shareCounterEnabled: true,
  totalCaredItems: 1247
};

export const USERS: User[] = [
  { id: 'u_dimas', tenantId: TENANT.id, name: 'Bang Dimas', phone: '628112223334', role: 'owner' },
  { id: 'u_rani', tenantId: TENANT.id, name: 'Rani', phone: '628119990001', role: 'staff' }
];

export const SERVICES: Service[] = [
  { id: 's_deep', tenantId: TENANT.id, name: 'Deep Clean', price: 45000, durationDays: 3, category: 'Cuci', unit: 'pasang', isActive: true },
  { id: 's_fast', tenantId: TENANT.id, name: 'Fast Clean', price: 30000, durationDays: 1, category: 'Cuci', unit: 'pasang', isActive: true },
  { id: 's_unyellow', tenantId: TENANT.id, name: 'Unyellowing', price: 60000, durationDays: 4, category: 'Perawatan', unit: 'pasang', isActive: true },
  { id: 's_repaint', tenantId: TENANT.id, name: 'Repaint', price: 120000, durationDays: 7, category: 'Perawatan', unit: 'pasang', isActive: true },
  { id: 's_sole', tenantId: TENANT.id, name: 'Sole Protect', price: 35000, durationDays: 2, category: 'Perawatan', unit: 'pasang', isActive: true },
  { id: 's_repair', tenantId: TENANT.id, name: 'Repair', price: 80000, durationDays: 5, category: 'Perbaikan', unit: 'pasang', isActive: false }
];

export const ADDONS: Addon[] = [
  { id: 'a_express', tenantId: TENANT.id, name: 'Express (-1 hari)', price: 25000, extraDurationDays: -1, isActive: true },
  { id: 'a_laces', tenantId: TENANT.id, name: 'Cuci tali terpisah', price: 8000, extraDurationDays: 0, isActive: true },
  { id: 'a_deodor', tenantId: TENANT.id, name: 'Deodorizer', price: 10000, extraDurationDays: 0, isActive: true }
];

export const CUSTOMERS: Customer[] = [
  { id: 'c_sari', tenantId: TENANT.id, name: 'Kak Sari', phone: '6281234500011', totalOrders: 5, totalSpent: 410000, lastOrderAt: iso(-2) },
  { id: 'c_bimo', tenantId: TENANT.id, name: 'Bimo', phone: '6281234500022', totalOrders: 2, totalSpent: 150000, lastOrderAt: iso(-5) },
  { id: 'c_nadia', tenantId: TENANT.id, name: 'Nadia', phone: '6281234500033', totalOrders: 1, totalSpent: 45000, lastOrderAt: iso(-1) },
  { id: 'c_reza', tenantId: TENANT.id, name: 'Reza', phone: '6281234500044', totalOrders: 8, totalSpent: 720000, lastOrderAt: iso(-9) }
];

export const WA_TEMPLATES: WaTemplate[] = [
  { id: 'wa_received', label: 'Order diterima', body: 'Halo {customer} 👋\nOrder {code} sudah kami terima: {items}.\nEstimasi siap: {estimate}.\nTotal {total}. Lacak di sini: {receipt}' },
  { id: 'wa_ready', label: 'Siap diambil', body: 'Halo {customer} 😊\n{code} sudah SIAP DIAMBIL. Lihat hasilnya: {receipt}\nSisa bayar: {due}. Ditunggu ya!' },
  { id: 'wa_reminder14', label: 'Pengingat H+14', body: 'Halo {customer}, {code} sudah selesai sejak beberapa waktu lalu dan menunggu diambil 🙏. Detail: {receipt}' },
  { id: 'wa_reminder30', label: 'Pengingat tegas H+30', body: 'Halo {customer}, {code} sudah 30+ hari belum diambil. Mohon dijadwalkan pengambilan sesuai ketentuan penitipan. {receipt}' },
  { id: 'wa_payment', label: 'Pengingat pelunasan', body: 'Halo {customer}, mengingatkan sisa pembayaran {code} sebesar {due}. Terima kasih 🙏' },
  { id: 'wa_review', label: 'Terima kasih + minta review', body: 'Halo {customer} 😊\nMakasih sudah mempercayakan {items} ke kami!\nHasilnya: {receipt}\n\nKalau berkenan, cerita jujur pengalaman Kakak di Google Maps sangat membantu kami 🙏\n👉 {maps}' }
];

function photo(kind: 'before' | 'after' | 'pickup_proof', label: string, offset: number) {
  return {
    id: `ph_${kind}_${label}_${offset}`.replace(/\s/g, ''),
    type: kind,
    url: placeholderPhoto(kind, label),
    takenAt: iso(offset),
    expiresAt: iso(offset + 730),
    uploadedBy: 'Rani'
  };
}

let seq = 400;
function makeOrder(partial: {
  customer: Customer;
  status: Order['status'];
  brand: string;
  color: string;
  serviceId: string;
  addonIds?: string[];
  paid: number;
  receivedOffset: number;
  quantity?: number;
  conditionTags?: string[];
  publishConsent?: boolean;
  withAfter?: boolean;
  reviewSent?: boolean;
  pickedUp?: boolean;
}): Order {
  const svc = SERVICES.find((s) => s.id === partial.serviceId)!;
  const addonIds = partial.addonIds ?? [];
  const addonTotal = addonIds.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0);
  const qty = partial.quantity ?? 1;
  const lineTotal = (svc.price + addonTotal) * qty;
  const subtotal = lineTotal;
  const discount = 0;
  const total = subtotal - discount;
  seq += 1;
  const code = `RWT-${seq}`;
  const durationDays = svc.durationDays + addonIds.reduce((s, id) => s + (ADDONS.find((a) => a.id === id)?.extraDurationDays ?? 0), 0);
  const estimatedReadyAt = iso(partial.receivedOffset + Math.max(1, durationDays));
  const statusOrder: Order['status'][] = ['received', 'in_progress', 'finishing', 'ready', 'completed'];
  const idx = statusOrder.indexOf(partial.status);
  const withAfter = partial.withAfter ?? idx >= 3;

  const photos = [photo('before', partial.brand, partial.receivedOffset)];
  if (withAfter) photos.push(photo('after', partial.brand, partial.receivedOffset + durationDays));

  const paymentStatus: Order['paymentStatus'] =
    partial.paid >= total ? 'paid' : partial.paid > 0 ? 'partial' : 'unpaid';

  const readyAt = idx >= 3 ? iso(partial.receivedOffset + durationDays) : null;
  const pickedUp = partial.pickedUp ?? partial.status === 'completed';

  const logs: Order['statusLogs'] = [];
  for (let i = 0; i <= idx; i += 1) {
    logs.push({
      id: `${code}_log_${i}`,
      from: i === 0 ? null : statusOrder[i - 1],
      to: statusOrder[i],
      at: iso(partial.receivedOffset + i),
      by: i === 0 ? 'Rani' : i >= 3 ? 'Rani' : 'Rani'
    });
  }

  return {
    id: `o_${code}`,
    tenantId: TENANT.id,
    orderCode: code,
    publicToken: `${code.toLowerCase()}-${(seq * 7).toString(36)}`,
    customerId: partial.customer.id,
    customerName: partial.customer.name,
    customerPhone: partial.customer.phone,
    createdByName: 'Rani',
    status: partial.status,
    items: [
      {
        id: `${code}_item1`,
        brand: partial.brand,
        color: partial.color,
        conditionTags: partial.conditionTags ?? ['Sol menguning'],
        conditionNotes: '',
        quantity: qty,
        services: [
          {
            serviceId: svc.id,
            serviceName: svc.name,
            priceSnapshot: svc.price,
            addonIds
          }
        ],
        photos,
        lineTotal
      }
    ],
    subtotal,
    discount,
    total,
    paidAmount: Math.min(partial.paid, total),
    paymentStatus,
    payments: partial.paid > 0
      ? [{ id: `${code}_pay1`, amount: Math.min(partial.paid, total), method: 'qris', createdAt: iso(partial.receivedOffset), receivedBy: 'Rani' }]
      : [],
    publishConsent: partial.publishConsent ?? true,
    disclaimerAcceptedAt: iso(partial.receivedOffset),
    receivedAt: iso(partial.receivedOffset),
    estimatedReadyAt,
    readyAt,
    pickedUpAt: pickedUp ? iso(partial.receivedOffset + durationDays + 1) : null,
    pickedUpByName: pickedUp ? partial.customer.name : null,
    pickupConfirmedByName: pickedUp ? 'Rani' : null,
    pickupProof: pickedUp ? photo('pickup_proof', partial.brand, partial.receivedOffset + durationDays + 1) : null,
    reviewRequestSentAt: partial.reviewSent ? iso(partial.receivedOffset + durationDays + 2) : null,
    reviewRequestSentByName: partial.reviewSent ? 'Rani' : null,
    statusLogs: logs,
    notes: '',
    synced: true
  };
}

export function seedOrders(): Order[] {
  const [sari, bimo, nadia, reza] = CUSTOMERS;
  return [
    makeOrder({ customer: sari, status: 'in_progress', brand: 'Nike AF1', color: 'Putih', serviceId: 's_deep', addonIds: ['a_express'], paid: 0, receivedOffset: -1, conditionTags: ['Sol menguning', 'Noda'] }),
    makeOrder({ customer: bimo, status: 'received', brand: 'Adidas Ultraboost', color: 'Hitam', serviceId: 's_fast', paid: 30000, receivedOffset: 0, conditionTags: ['Bau'] }),
    makeOrder({ customer: nadia, status: 'finishing', brand: 'Converse', color: 'Krem', serviceId: 's_unyellow', paid: 0, receivedOffset: -2, conditionTags: ['Sol menguning'] }),
    makeOrder({ customer: reza, status: 'ready', brand: 'Vans Old Skool', color: 'Navy', serviceId: 's_deep', addonIds: ['a_deodor'], paid: 55000, receivedOffset: -4, conditionTags: ['Noda', 'Bau'] }),
    makeOrder({ customer: sari, status: 'ready', brand: 'New Balance 550', color: 'Abu', serviceId: 's_repaint', paid: 0, receivedOffset: -6, publishConsent: false }),
    makeOrder({ customer: bimo, status: 'completed', brand: 'Nike Dunk', color: 'Panda', serviceId: 's_deep', paid: 45000, receivedOffset: -8, reviewSent: false }),
    makeOrder({ customer: reza, status: 'completed', brand: 'Jordan 1', color: 'Merah', serviceId: 's_deep', addonIds: ['a_laces'], paid: 53000, receivedOffset: -12, reviewSent: true }),
    makeOrder({ customer: nadia, status: 'completed', brand: 'Puma Suede', color: 'Hijau', serviceId: 's_sole', paid: 35000, receivedOffset: -20, pickedUp: true, reviewSent: false })
  ];
}
