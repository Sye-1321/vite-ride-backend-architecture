export function normalizeTenantName(name: string): string {
  return name.trim().normalize('NFKC').toLowerCase();
}
