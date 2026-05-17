"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CheckoutForm, { type CheckoutFormHandle } from "@/components/CheckoutForm";
import { type Locale } from "@/lib/i18n";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface ProductData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  locale: string;
  currency: string;
  price: number;
  image_url: string | null;
  active: boolean;
}

const checkoutTranslations = {
  en: {
    secureCheckout: "Secure checkout",
    cart: "Cart",
    checkout: "Checkout",
    confirmation: "Confirmation",
    payment: "Payment",
    allTransactionsSecure: "All transactions are secure and encrypted.",
    orderSummary: "Order Summary",
    immediateDelivery: "Immediate delivery",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    finalizePurchase: "Finalize Purchase",
    processing: "Processing...",
    securePayment: "100% secure payment via Stripe",
    worldwideShipping: "Shipping to 50+ countries",
    realTimeTracking: "Real-time tracking",
    thirtyDayReturn: "30-day return policy",
    allRightsReserved: "All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfUse: "Terms of Use",
    support: "Support",
    invalidLink: "Invalid link",
    productNotFound: "Product information not found.",
    loadingProduct: "Loading product...",
    freeShipping: "Free shipping",
    errorProcessing: "Error processing payment. Please try again.",
    unexpectedError: "Unexpected error. Please try again.",
    fastShippingTitle: "Fast Shipping",
    fastShippingDesc: "Your product is shipped directly to your address, with tracking via WhatsApp.",
    returnsTitle: "Exchanges & Returns",
    returnsDesc: "If you don't like it or it arrives with an issue, we'll exchange or refund within 7 days. No hassle.",
    protectedTitle: "Protected Purchase",
    protectedDesc: "Your personal and payment data is completely secure with us.",
  },
  es: {
    secureCheckout: "Pago seguro",
    cart: "Carrito",
    checkout: "Pago",
    confirmation: "Confirmación",
    payment: "Pago",
    allTransactionsSecure: "Todas las transacciones son seguras y encriptadas.",
    orderSummary: "Resumen del Pedido",
    immediateDelivery: "Entrega inmediata",
    subtotal: "Subtotal",
    shipping: "Envío",
    total: "Total",
    finalizePurchase: "Finalizar Compra",
    processing: "Procesando...",
    securePayment: "Pago 100% seguro via Stripe",
    worldwideShipping: "Envío a más de 50 países",
    realTimeTracking: "Rastreo en tiempo real",
    thirtyDayReturn: "Devolución en 30 días",
    allRightsReserved: "Todos los derechos reservados.",
    privacyPolicy: "Política de Privacidad",
    termsOfUse: "Términos de Uso",
    support: "Soporte",
    invalidLink: "Enlace inválido",
    productNotFound: "Información del producto no encontrada.",
    loadingProduct: "Cargando producto...",
    freeShipping: "Envío gratis",
    errorProcessing: "Error al procesar el pago. Inténtalo de nuevo.",
    unexpectedError: "Error inesperado. Inténtalo de nuevo.",
    fastShippingTitle: "Envío Rápido",
    fastShippingDesc: "Tu producto se envía directamente a tu dirección, con rastreo por WhatsApp.",
    returnsTitle: "Cambios y Devoluciones",
    returnsDesc: "Si no te gusta o llega con problema, lo cambiamos o devolvemos en 7 días. Sin complicaciones.",
    protectedTitle: "Compra Protegida",
    protectedDesc: "Tus datos personales y de pago están completamente seguros con nosotros.",
  },
  pt: {
    secureCheckout: "Checkout seguro",
    cart: "Carrinho",
    checkout: "Checkout",
    confirmation: "Confirmação",
    payment: "Pagamento",
    allTransactionsSecure: "Todas as transações são seguras e criptografadas.",
    orderSummary: "Resumo do Pedido",
    immediateDelivery: "Entrega imediata",
    subtotal: "Subtotal",
    shipping: "Frete",
    total: "Total",
    finalizePurchase: "Finalizar Compra",
    processing: "Processando...",
    securePayment: "Pagamento 100% seguro via Stripe",
    worldwideShipping: "Envio para 50+ países",
    realTimeTracking: "Rastreamento em tempo real",
    thirtyDayReturn: "Devolução em 30 dias",
    allRightsReserved: "Todos os direitos reservados.",
    privacyPolicy: "Política de Privacidade",
    termsOfUse: "Termos de Uso",
    support: "Suporte",
    invalidLink: "Link inválido",
    productNotFound: "Informações do produto não encontradas.",
    loadingProduct: "Carregando produto...",
    freeShipping: "Frete grátis",
    errorProcessing: "Erro ao processar pagamento. Tente novamente.",
    unexpectedError: "Erro inesperado. Tente novamente.",
    fastShippingTitle: "Envio Rápido",
    fastShippingDesc: "Seu produto é enviado diretamente ao seu endereço, com rastreamento por WhatsApp.",
    returnsTitle: "Trocas e Devoluções",
    returnsDesc: "Se não gostar ou chegar com problema, trocamos ou devolvemos em 7 dias. Sem burocracia.",
    protectedTitle: "Compra Protegida",
    protectedDesc: "Seus dados pessoais e de pagamento estão completamente seguros conosco.",
  },
  fr: {
    secureCheckout: "Paiement sécurisé",
    cart: "Panier",
    checkout: "Paiement",
    confirmation: "Confirmation",
    payment: "Paiement",
    allTransactionsSecure: "Toutes les transactions sont sécurisées et cryptées.",
    orderSummary: "Récapitulatif",
    immediateDelivery: "Livraison immédiate",
    subtotal: "Sous-total",
    shipping: "Livraison",
    total: "Total",
    finalizePurchase: "Finaliser l'achat",
    processing: "Traitement...",
    securePayment: "Paiement 100% sécurisé via Stripe",
    worldwideShipping: "Livraison dans 50+ pays",
    realTimeTracking: "Suivi en temps réel",
    thirtyDayReturn: "Retour sous 30 jours",
    allRightsReserved: "Tous droits réservés.",
    privacyPolicy: "Politique de confidentialité",
    termsOfUse: "Conditions d'utilisation",
    support: "Support",
    invalidLink: "Lien invalide",
    productNotFound: "Informations produit introuvables.",
    loadingProduct: "Chargement du produit...",
    freeShipping: "Livraison gratuite",
    errorProcessing: "Erreur lors du paiement. Veuillez réessayer.",
    unexpectedError: "Erreur inattendue. Veuillez réessayer.",
    fastShippingTitle: "Livraison Rapide",
    fastShippingDesc: "Votre produit est expédié directement à votre adresse, avec suivi par WhatsApp.",
    returnsTitle: "Échanges & Retours",
    returnsDesc: "Si vous n'aimez pas ou s'il arrive avec un défaut, nous échangeons ou remboursons sous 7 jours.",
    protectedTitle: "Achat Protégé",
    protectedDesc: "Vos données personnelles et de paiement sont totalement sécurisées.",
  },
  de: {
    secureCheckout: "Sichere Bezahlung",
    cart: "Warenkorb",
    checkout: "Kasse",
    confirmation: "Bestätigung",
    payment: "Zahlung",
    allTransactionsSecure: "Alle Transaktionen sind sicher und verschlüsselt.",
    orderSummary: "Bestellübersicht",
    immediateDelivery: "Sofortige Lieferung",
    subtotal: "Zwischensumme",
    shipping: "Versand",
    total: "Gesamt",
    finalizePurchase: "Kauf abschließen",
    processing: "Verarbeitung...",
    securePayment: "100% sichere Zahlung über Stripe",
    worldwideShipping: "Versand in 50+ Länder",
    realTimeTracking: "Echtzeit-Tracking",
    thirtyDayReturn: "30-Tage-Rückgabe",
    allRightsReserved: "Alle Rechte vorbehalten.",
    privacyPolicy: "Datenschutz",
    termsOfUse: "Nutzungsbedingungen",
    support: "Support",
    invalidLink: "Ungültiger Link",
    productNotFound: "Produktinformationen nicht gefunden.",
    loadingProduct: "Produkt wird geladen...",
    freeShipping: "Kostenloser Versand",
    errorProcessing: "Fehler bei der Zahlung. Bitte versuchen Sie es erneut.",
    unexpectedError: "Unerwarteter Fehler. Bitte versuchen Sie es erneut.",
    fastShippingTitle: "Schneller Versand",
    fastShippingDesc: "Ihr Produkt wird direkt an Ihre Adresse geliefert, mit Tracking per WhatsApp.",
    returnsTitle: "Umtausch & Rückgabe",
    returnsDesc: "Wenn es Ihnen nicht gefällt oder mit einem Problem ankommt, tauschen wir um oder erstatten innerhalb von 7 Tagen.",
    protectedTitle: "Geschützter Kauf",
    protectedDesc: "Ihre persönlichen und Zahlungsdaten sind bei uns vollständig sicher.",
  },
  it: {
    secureCheckout: "Pagamento sicuro",
    cart: "Carrello",
    checkout: "Cassa",
    confirmation: "Conferma",
    payment: "Pagamento",
    allTransactionsSecure: "Tutte le transazioni sono sicure e crittografate.",
    orderSummary: "Riepilogo Ordine",
    immediateDelivery: "Consegna immediata",
    subtotal: "Subtotale",
    shipping: "Spedizione",
    total: "Totale",
    finalizePurchase: "Completa l'acquisto",
    processing: "Elaborazione...",
    securePayment: "Pagamento 100% sicuro via Stripe",
    worldwideShipping: "Spedizione in 50+ paesi",
    realTimeTracking: "Tracciamento in tempo reale",
    thirtyDayReturn: "Reso entro 30 giorni",
    allRightsReserved: "Tutti i diritti riservati.",
    privacyPolicy: "Privacy",
    termsOfUse: "Termini di utilizzo",
    support: "Supporto",
    invalidLink: "Link non valido",
    productNotFound: "Informazioni prodotto non trovate.",
    loadingProduct: "Caricamento prodotto...",
    freeShipping: "Spedizione gratuita",
    errorProcessing: "Errore durante il pagamento. Riprova.",
    unexpectedError: "Errore imprevisto. Riprova.",
    fastShippingTitle: "Spedizione Veloce",
    fastShippingDesc: "Il tuo prodotto viene spedito direttamente al tuo indirizzo, con tracciamento via WhatsApp.",
    returnsTitle: "Cambi e Resi",
    returnsDesc: "Se non ti piace o arriva con un problema, lo cambiamo o rimborsiamo entro 7 giorni.",
    protectedTitle: "Acquisto Protetto",
    protectedDesc: "I tuoi dati personali e di pagamento sono completamente al sicuro con noi.",
  },
};

interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_placement?: string;
  utm_id?: string;
  utm_creative_name?: string;
}

function PaymentSection({
  amount,
  currency,
  locale,
  formRef,
  paymentIntentId,
  productData,
  buttonColor,
  utmParams,
  onLoadingChange,
}: {
  amount: number;
  currency: string;
  locale: Locale;
  formRef: React.RefObject<CheckoutFormHandle | null>;
  paymentIntentId: string | null;
  productData: { productName: string; productId: string | null };
  buttonColor: string;
  utmParams: UtmParams;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);
  const t = checkoutTranslations[locale] || checkoutTranslations.en;

  const formatPrice = (value: number, curr: string) => {
    const localeMap: Record<string, string> = { en: "en-US", es: "es-ES", pt: "pt-BR", fr: "fr-FR", de: "de-DE", it: "it-IT" };
    const localeCode = localeMap[locale] || "en-US";
    return new Intl.NumberFormat(localeCode, {
      style: "currency",
      currency: curr.toUpperCase(),
    }).format(value / 100);
  };

  async function handleFinalize() {
    if (!stripe || !elements || !formRef.current) return;

    const data = formRef.current.getData();
    if (!data) return;

    setLoading(true);
    setError(null);

    try {
      // Atualizar metadata do PaymentIntent (pedido será criado no webhook após aprovação)
      const res = await fetch("/api/submit-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          country: data.country,
          product_id: productData.productId || undefined,
          locale,
          currency,
          ...utmParams,
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || t.unexpectedError);
      }

      // Confirmar pagamento
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || t.errorProcessing);
        setLoading(false);
        return;
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${appUrl}/success?amount=${amount}&currency=${currency}&pi=${paymentIntentId}&lang=${locale}&product=${encodeURIComponent(productData.productName)}`,
        },
      });

      if (confirmError) {
        if (confirmError.type === "card_error" || confirmError.type === "validation_error") {
          setError(confirmError.message || t.errorProcessing);
        } else {
          setError(t.unexpectedError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorProcessing);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="bg-white border border-[#e0e0e0] rounded-lg p-4"
        style={{ minHeight: "200px" }}
      >
        <PaymentElement
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleFinalize}
        disabled={!stripe || !elements || loading}
        style={{ backgroundColor: buttonColor }}
        className="w-full p-4 text-white font-extrabold text-[16px] rounded-lg active:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            {t.finalizePurchase} — {formatPrice(amount, currency)}
            <svg className="w-4 h-4 stroke-white fill-none stroke-[3]" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-[#999] font-medium">
        <svg className="w-3 h-3 stroke-[#16a34a] fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        {t.securePayment}
      </div>

      {/* Trust Cards - Mobile only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 lg:hidden">
        {[
          { emoji: "✈️", title: t.fastShippingTitle, desc: t.fastShippingDesc },
          { emoji: "🔄", title: t.returnsTitle, desc: t.returnsDesc },
          { emoji: "🔒", title: t.protectedTitle, desc: t.protectedDesc },
        ].map((card, i) => (
          <div key={i} className="flex flex-col items-center text-center p-4 bg-[#f7f7f7] border border-[#e5e5e5] rounded-lg">
            <span className="text-2xl mb-2">{card.emoji}</span>
            <div className="flex items-center gap-0.5 mb-1.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <svg key={s} className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-[13px] font-bold text-[#111] mb-1">{card.title}</span>
            <span className="text-[11.5px] text-[#777] font-medium leading-snug">{card.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();

  const productId = searchParams.get("id");
  const locale: Locale = (searchParams.get("lang") as Locale) || "en";
  const currencyParam = searchParams.get("currency") || "usd";

  const t = checkoutTranslations[locale] || checkoutTranslations.en;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [productName, setProductName] = useState(searchParams.get("product") || "");
  const [amount, setAmount] = useState(parseInt(searchParams.get("price") || "0"));
  const [currency, setCurrency] = useState(currencyParam);
  const [productLoading, setProductLoading] = useState(!!productId);
  const [formDisabled, setFormDisabled] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippings, setShippings] = useState<any[]>([]);
  const localeCountryMap: Record<string, string> = { en: "US", es: "ES", pt: "BR", fr: "FR", de: "DE", it: "IT" };
  const [selectedCountry, setSelectedCountry] = useState(localeCountryMap[locale] || "US");
  const [buttonColor, setButtonColor] = useState("#111111");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Capturar UTM parameters da URL
  const utmParams: UtmParams = {
    utm_source: searchParams.get("utm_source") || undefined,
    utm_medium: searchParams.get("utm_medium") || undefined,
    utm_campaign: searchParams.get("utm_campaign") || undefined,
    utm_content: searchParams.get("utm_content") || undefined,
    utm_term: searchParams.get("utm_term") || undefined,
    utm_placement: searchParams.get("utm_placement") || undefined,
    utm_id: searchParams.get("utm_id") || undefined,
    utm_creative_name: searchParams.get("utm_creative_name") || undefined,
  };

  const formRef = useRef<CheckoutFormHandle>(null);

  // Fetch shippings
  useEffect(() => {
    async function fetchShippings() {
      try {
        const res = await fetch("/api/shipping");
        const data = await res.json();
        setShippings(data.shippings || []);
      } catch {}
    }
    fetchShippings();
  }, []);

  // Update shipping cost when country changes
  useEffect(() => {
    const shipping = shippings.find((s: any) => s.country === selectedCountry) || shippings.find((s: any) => s.country === "GLOBAL");
    setShippingCost(shipping ? shipping.price : 0);
  }, [selectedCountry, shippings]);

  // Fetch checkout settings
  useEffect(() => {
    fetch("/api/checkout-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.button_color) setButtonColor(data.button_color);
        if (data.logo_url) setLogoUrl(data.logo_url);
      })
      .catch(() => {});
  }, []);

  // Fetch product
  useEffect(() => {
    if (!productId) return;

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) {
          setProductError(t.productNotFound);
          return;
        }
        const data = await res.json();
        const p: ProductData = data.product;

        if (!p.active) {
          setProductError(t.productNotFound);
          return;
        }

        setProduct(p);
        setProductName(p.name);
        setAmount(p.price);
        setCurrency(p.currency);
        document.title = `${p.name} — Checkout`;
      } catch {
        setProductError(t.productNotFound);
      } finally {
        setProductLoading(false);
      }
    }

    fetchProduct();
  }, [productId, locale]);

  // Create PaymentIntent (recria quando shipping muda)
  useEffect(() => {
    if (!productId) return;

    let cancelled = false;
    async function createPaymentIntent() {
      setPaymentLoading(true);
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            currency,
            country: selectedCountry,
          }),
        });

        const result = await res.json();
        if (!cancelled && res.ok && result.clientSecret) {
          setClientSecret(result.clientSecret);
          setPaymentIntentId(result.paymentIntentId);
          if (result.amount) setAmount(result.amount);
        }
      } catch {
        if (!cancelled) setError("Erro ao inicializar pagamento");
      } finally {
        if (!cancelled) setPaymentLoading(false);
      }
    }

    createPaymentIntent();
    return () => { cancelled = true; };
  }, [productId, currency, selectedCountry]);

  const isValid = amount > 0 && productName;

  const formatPrice = (value: number, curr: string) => {
    const localeMap: Record<string, string> = { en: "en-US", es: "es-ES", pt: "pt-BR", fr: "fr-FR", de: "de-DE", it: "it-IT" };
    const localeCode = localeMap[locale] || "en-US";
    return new Intl.NumberFormat(localeCode, {
      style: "currency",
      currency: curr.toUpperCase(),
    }).format(value / 100);
  };

  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t.loadingProduct}</p>
        </div>
      </div>
    );
  }

  if (productError || (!isValid && productId)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">{t.invalidLink}</h2>
          <p className="text-gray-500">{productError || t.productNotFound}</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">{t.invalidLink}</h2>
          <p className="text-gray-500">{t.productNotFound}</p>
        </div>
      </div>
    );
  }

  const displayName = product?.name || productName;
  const displayDescription = product?.description;

  return (
    <div className="min-h-screen bg-white text-[#111111] font-['Manrope',sans-serif]">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <style jsx global>{`
        :root {
          --bg: #ffffff;
          --surface: #fafafa;
          --border: #e5e5e5;
          --text-primary: #111111;
          --text-secondary: #555555;
          --text-muted: #999999;
          --text-label: #444444;
          --black: #111111;
          --gray-100: #f7f7f7;
          --gray-200: #efefef;
          --gray-300: #e0e0e0;
          --gray-400: #cccccc;
          --gray-500: #999999;
          --gray-600: #666666;
          --gray-700: #444444;
          --success: #16a34a;
          --error: #dc2626;
          --radius-sm: 8px;
        }

        body {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #fbfbfb;
          color: var(--text-primary);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-section-anim { opacity: 0; animation: fadeUp 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <header className="border-b border-[#e5e5e5] py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="font-extrabold text-xl tracking-tighter text-[#111111]">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-6 object-contain" />
          ) : (
            "STORE"
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#999999]">
          <svg className="w-3.5 h-3.5 stroke-[#16a34a] fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          {t.secureCheckout}
        </div>
      </header>

      <div className="max-w-[1160px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-130px)] lg:border-x lg:border-[#e5e5e5] bg-white shadow-[0_4px_40px_rgba(0,0,0,0.03)]">
        {/* Left: Form + Payment */}
        <div className="flex-1 p-6 sm:p-10 lg:p-12 lg:pr-10 overflow-y-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="text-[12.5px] font-semibold text-[#999999] uppercase tracking-wider">{t.cart}</span>
            <div className="w-7 h-[1px] bg-[#e0e0e0]"></div>
            <span className="text-[12.5px] font-semibold text-[#111111] uppercase tracking-wider relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-[2px] after:bg-[#111111]">{t.checkout}</span>
            <div className="w-7 h-[1px] bg-[#e0e0e0]"></div>
            <span className="text-[12.5px] font-semibold text-[#999999] uppercase tracking-wider">{t.confirmation}</span>
          </div>

          {/* Mobile Order Summary */}
          <div className="lg:hidden flex items-center gap-4 mb-8 p-4 bg-[#f7f7f7] border border-[#e5e5e5] rounded-xl">
            <div className="w-[72px] h-[72px] bg-[#efefef] border border-[#e5e5e5] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
              {product?.image_url ? (
                <img src={product.image_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl opacity-25">📦</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-[#111111] truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <svg className="w-3.5 h-3.5 text-[#16a34a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                </svg>
                <span className="text-[12px] font-semibold text-[#16a34a]">
                  {shippingCost === 0 ? t.freeShipping : formatPrice(shippingCost, currency)}
                </span>
              </div>
            </div>
            <span className="text-[16px] font-extrabold text-[#111111] shrink-0">{formatPrice(amount, currency)}</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <CheckoutForm
            ref={formRef}
            locale={locale}
            currency={currency}
            shippings={shippings}
            disabled={formDisabled}
            onShippingChange={(country, price) => {
              setSelectedCountry(country);
              setShippingCost(price);
            }}
          />

          {/* Stripe Payment Section */}
          <div className="form-section-anim mt-8 pt-8 border-t border-[#e5e5e5]">
            <h2 className="text-[1.1rem] font-bold text-[#111111] mb-2 tracking-tight">{t.payment}</h2>
            <p className="text-[13px] text-[#999999] mb-6 font-medium">{t.allTransactionsSecure}</p>

            {paymentLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full" />
              </div>
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#111111",
                      colorBackground: "#ffffff",
                      colorText: "#111111",
                      colorDanger: "#dc2626",
                      fontFamily: "'Manrope', sans-serif",
                      borderRadius: "8px",
                    },
                  },
                }}
              >
                <PaymentSection
                  amount={amount + shippingCost}
                  currency={currency}
                  locale={locale}
                  formRef={formRef}
                  paymentIntentId={paymentIntentId}
                  productData={{ productName: displayName, productId: productId }}
                  buttonColor={buttonColor}
                  utmParams={utmParams}
                  onLoadingChange={setFormDisabled}
                />
              </Elements>
            ) : (
              <div className="text-center py-8 text-[#999] text-sm">
                {t.unexpectedError}
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="hidden lg:block w-full lg:w-[420px] bg-[#f7f7f7] lg:border-l lg:border-[#e5e5e5] p-6 sm:p-10 lg:p-12">
          <h3 className="text-[1.1rem] font-bold text-[#111111] mb-6 tracking-tight">{t.orderSummary}</h3>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#efefef] border border-[#e5e5e5] rounded-lg flex items-center justify-center relative shrink-0 overflow-hidden">
                {product?.image_url ? (
                  <img src={product.image_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl opacity-25">📦</span>
                )}
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#444444] text-white text-[11px] font-bold rounded-full flex items-center justify-center">1</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[#111111] truncate">{displayName}</p>
                {displayDescription && (
                  <p className="text-[11px] text-[#999999] font-medium mt-0.5 line-clamp-2">{displayDescription}</p>
                )}
                <p className="text-[12px] text-[#999999] font-medium">{t.immediateDelivery}</p>
              </div>
              <span className="text-[14px] font-bold text-[#111111]">{formatPrice(amount, currency)}</span>
            </div>
          </div>

          <div className="h-[1px] bg-[#e0e0e0] my-5"></div>

          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-medium text-[#555555]">{t.subtotal}</span>
              <span className="text-[14px] font-semibold">{formatPrice(amount, currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-medium text-[#555555]">{t.shipping}</span>
              <span className="text-[14px] font-semibold">{formatPrice(shippingCost, currency)}</span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[16px] font-bold text-[#111111]">{t.total}</span>
              <span className="text-[20px] font-extrabold text-[#111111] tracking-tight">{formatPrice(amount + shippingCost, currency)}</span>
            </div>
          </div>

          {/* Trust Cards - Desktop */}
          <div className="grid grid-cols-1 gap-3 mt-8">
            {[
              { emoji: "✈️", title: t.fastShippingTitle, desc: t.fastShippingDesc },
              { emoji: "🔄", title: t.returnsTitle, desc: t.returnsDesc },
              { emoji: "🔒", title: t.protectedTitle, desc: t.protectedDesc },
            ].map((card, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white border border-[#e5e5e5] rounded-lg">
                <span className="text-xl shrink-0 mt-0.5">{card.emoji}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <svg key={s} className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[13px] font-bold text-[#111]">{card.title}</span>
                  <span className="text-[11.5px] text-[#777] font-medium leading-snug mt-0.5">{card.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 border-t border-[#e5e5e5] text-[11.5px] text-[#999999] font-medium">
        <span>© {new Date().getFullYear()} STORE. {t.allRightsReserved}</span>
        <div className="flex gap-5 mt-2 sm:mt-0">
          <a href="#" className="hover:text-[#111111]">{t.privacyPolicy}</a>
          <a href="#" className="hover:text-[#111111]">{t.termsOfUse}</a>
          <a href="#" className="hover:text-[#111111]">{t.support}</a>
        </div>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
