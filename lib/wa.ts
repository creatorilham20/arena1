function digits(s: string): string {
  return s.replace(/\D/g, "");
}

export function normalizeWaNumber(phone: string): string {
  let p = digits(phone);
  if (p.startsWith("0")) p = "62" + p.slice(1);
  if (p.startsWith("8")) p = "62" + p;
  if (p.startsWith("+")) p = p.replace("+", "");
  return p;
}

export function waLink(text: string, phone?: string): string {
  const qs = new URLSearchParams();
  qs.set("text", text);
  if (phone) {
    const num = normalizeWaNumber(phone);
    return `https://wa.me/${num}?${qs.toString()}`;
  }
  return `https://wa.me/?${qs.toString()}`;
}