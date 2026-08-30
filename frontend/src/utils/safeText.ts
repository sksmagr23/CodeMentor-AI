/**
 * Safe text renderer to guarantee that unexpected model objects (like {step, description})
 * never crash React rendering when rendered inside JSX elements.
 */
export function renderSafeText(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (val.description && val.step) return `Step ${val.step}: ${val.description}`;
    if (val.description) return String(val.description);
    if (val.text) return String(val.text);
    if (val.detail) return String(val.detail);
    if (val.name) return String(val.name);
    if (val.title) return String(val.title);
    if (val.value) return String(val.value);
    try {
      return Object.entries(val)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(' • ');
    } catch {
      return String(val);
    }
  }
  return String(val);
}
