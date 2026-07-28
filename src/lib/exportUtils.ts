export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]).filter(k => !k.startsWith('_'));
  const header = keys.join(',');
  const rows = data.map(row => keys.map(k => {
    const val = row[k] ?? '';
    return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
  }).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}
