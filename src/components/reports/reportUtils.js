// Report utilities for BackBone Report Builder

export function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatAgeDetailed(dob, fallbackAge) {
  if (!dob) {
    return fallbackAge !== undefined && fallbackAge !== null && fallbackAge !== '' ? `${fallbackAge}Y` : '-';
  }
  const parts = String(dob).split('-');
  if (parts.length !== 3) {
    return fallbackAge !== undefined && fallbackAge !== null && fallbackAge !== '' ? `${fallbackAge}Y` : '-';
  }
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) {
    return fallbackAge !== undefined && fallbackAge !== null && fallbackAge !== '' ? `${fallbackAge}Y` : '-';
  }
  const birthDate = new Date(y, m, d);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) {
    if (months > 0 && days > 0) return `${years}Y ${months}M ${days}D`;
    if (months > 0) return `${years}Y ${months}M`;
    return `${years}Y`;
  }
  if (months > 0) {
    if (days > 0) return `${months}M ${days}D`;
    return `${months}M`;
  }
  return `${Math.max(1, days)}D`;
}

export function formatCurrency(val) {
  const num = Number(val || 0);
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDateTime(dtStr) {
  if (!dtStr) return '-';
  try {
    const dt = new Date(dtStr);
    if (isNaN(dt.getTime())) return String(dtStr);
    const day = String(dt.getDate()).padStart(2, '0');
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const year = dt.getFullYear();
    let hours = dt.getHours();
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  } catch {
    return String(dtStr);
  }
}

export function formatDateOnly(dtStr) {
  if (!dtStr) return '-';
  try {
    const dt = new Date(dtStr);
    if (isNaN(dt.getTime())) return String(dtStr);
    const day = String(dt.getDate()).padStart(2, '0');
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const year = dt.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(dtStr);
  }
}

export function exportToCsv(filename, headers, rows) {
  const escapeCell = (cell) => {
    if (cell === null || cell === undefined) return '""';
    const s = String(cell).replace(/"/g, '""');
    return `"${s}"`;
  };

  const headerLine = headers.map(h => escapeCell(h.label || h)).join(',');
  const rowLines = rows.map(r => {
    return headers.map(h => {
      const val = typeof h.accessor === 'function' ? h.accessor(r) : r[h.key || h];
      return escapeCell(val);
    }).join(',');
  });

  const csvContent = [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyTableToClipboard(headers, rows) {
  const headerLine = headers.map(h => h.label || h).join('\t');
  const rowLines = rows.map(r => {
    return headers.map(h => {
      const val = typeof h.accessor === 'function' ? h.accessor(r) : r[h.key || h];
      return val !== null && val !== undefined ? String(val) : '';
    }).join('\t');
  });

  const tsvContent = [headerLine, ...rowLines].join('\n');
  try {
    await navigator.clipboard.writeText(tsvContent);
    return true;
  } catch (err) {
    console.warn('Clipboard copy error, falling back:', err);
    const ta = document.createElement('textarea');
    ta.value = tsvContent;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}
