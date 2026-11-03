/**
 * Utility to print registration and review slips in isolated A5 Landscape format.
 * Prevents main SPA elements (breadcrumbs, navbars, footers) from wasting pages.
 */
export function printLandscapeSlip(elementId, title = 'OP Registration Slip') {
  const elem = document.getElementById(elementId);
  if (!elem) {
    window.print();
    return;
  }

  // Remove previous iframe if present
  const oldIframe = document.getElementById('khc-print-iframe');
  if (oldIframe) {
    oldIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'khc-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page {
            size: A5 landscape;
            size: 210mm 148mm;
            margin: 4mm 6mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            font-size: 8.5pt;
            line-height: 1.35;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: 2mm 3mm;
          }
          .op-a5-print-card {
            width: 100% !important;
            max-width: 198mm !important;
            margin: 0 auto !important;
            border: 1.5px solid #1e3a8a !important;
            border-radius: 6px !important;
            padding: 8px 14px !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }
          .badge {
            display: inline-block;
            padding: 1px 6px;
            font-size: 7.5pt;
            font-weight: 700;
            border-radius: 4px;
            background: #e0f2fe;
            color: #0369a1;
            border: 1px solid #bae6fd;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${elem.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Iframe print error, falling back to window.print():', e);
      window.print();
    }
  }, 250);
}
