export function downloadCsv(filename, headers, rows) {
  const escapeCell = value => {
    let text = value === null || value === undefined ? '' : String(value);
    // Guard spreadsheet programs against treating untrusted text as a formula.
    if (typeof value === 'string' && /^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };

  const contents = [headers, ...rows]
    .map(row => row.map(escapeCell).join(','))
    .join('\r\n');
  const blob = new Blob([`\uFEFF${contents}`], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadDateStamp() {
  return new Date().toISOString().slice(0, 10);
}
