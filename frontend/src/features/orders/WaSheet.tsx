import { useMemo, useState } from 'react';
import type { Order } from '@/data/types';
import { useStore } from '@/data/store';
import { WA_TEMPLATES } from '@/data/fixtures';
import { Button, Chip, Sheet } from '@/components/ui';
import { useToast } from '@/components/ui';
import { fillTemplate, waLink } from '@/lib/wa';
import { buildVars } from './waVars';
import { MockNote } from '@/components/MockNote';

export function WaSheet({
  order,
  open,
  onClose,
  defaultTemplateId,
  onSent
}: {
  order: Order;
  open: boolean;
  onClose: () => void;
  defaultTemplateId?: string;
  onSent?: () => void;
}) {
  const { tenant } = useStore();
  const toast = useToast();
  const [templateId, setTemplateId] = useState(defaultTemplateId ?? WA_TEMPLATES[0].id);
  const template = WA_TEMPLATES.find((t) => t.id === templateId) ?? WA_TEMPLATES[0];
  const vars = useMemo(() => buildVars(order, tenant), [order, tenant]);
  const [message, setMessage] = useState(() => fillTemplate(template.body, vars));

  const pick = (id: string) => {
    setTemplateId(id);
    const t = WA_TEMPLATES.find((x) => x.id === id)!;
    setMessage(fillTemplate(t.body, vars));
  };

  const send = () => {
    window.open(waLink(order.customerPhone, message), '_blank', 'noopener');
    onSent?.();
    toast.show('WhatsApp dibuka. Tandai terkirim setelah pesan benar-benar dikirim.', { tone: 'default' });
  };

  return (
    <Sheet open={open} onClose={onClose} title="Kirim pesan WhatsApp">
      <div className="mb-3 flex flex-wrap gap-2">
        {WA_TEMPLATES.map((t) => (
          <Chip key={t.id} active={t.id === templateId} onClick={() => pick(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={6}
        className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400"
      />
      <MockNote className="mt-3">
        Membuka WhatsApp bukan bukti pesan terkirim. Tidak ada WA API/blast otomatis di sistem ini.
      </MockNote>
      <Button block size="lg" className="mt-3" onClick={send}>
        Buka WhatsApp
      </Button>
    </Sheet>
  );
}
