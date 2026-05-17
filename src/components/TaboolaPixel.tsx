"use client";

import Script from "next/script";

export default function TaboolaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_TABOOLA_PIXEL_ID;

  if (!pixelId) return null;

  return (
    <Script id="taboola-pixel" strategy="afterInteractive">
      {`
        window._tfa = window._tfa || [];
        window._tfa.push({notify: 'event', name: 'page_view', id: ${pixelId}});
        !function (t, f, a, x) {
          if (!document.getElementById(x)) {
            t.async = 1;t.src = a;t.id=x;f.parentNode.insertBefore(t, f);
          }
        }(document.createElement('script'),
        document.getElementsByTagName('script')[0],
        '//cdn.taboola.com/libtrc/unip/${pixelId}/tfa.js',
        'tb_tfa_script');
      `}
    </Script>
  );
}

export function trackTaboolaPurchase(amount: number, currency: string, orderId: string) {
  const pixelId = process.env.NEXT_PUBLIC_TABOOLA_PIXEL_ID;
  if (!pixelId || typeof window === "undefined") return;

  window._tfa = window._tfa || [];
  window._tfa.push({
    notify: "event",
    name: "Purchase",
    id: Number(pixelId),
    revenue: amount / 100,
    currency: currency.toUpperCase(),
    orderid: orderId,
  });
}

declare global {
  interface Window {
    _tfa: Array<Record<string, unknown>>;
  }
}
