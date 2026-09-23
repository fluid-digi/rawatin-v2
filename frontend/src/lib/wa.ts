export function waLink(phone: string, text: string): string {
  const clean = phone.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export interface TemplateVars {
  customer: string;
  code: string;
  items: string;
  estimate: string;
  total: string;
  due: string;
  receipt: string;
  maps: string;
}

export function fillTemplate(body: string, vars: TemplateVars): string {
  return body.replace(/\{(\w+)\}/g, (_, key: keyof TemplateVars) => vars[key] ?? `{${key}}`);
}
