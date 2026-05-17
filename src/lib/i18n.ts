export type Locale = "en" | "es" | "pt" | "fr" | "de" | "it";

export const translations = {
  en: {
    // Checkout steps
    step1: "Information",
    step2: "Payment",
    stepProgress: "Step",

    // CheckoutForm
    contactInfo: "Contact Information",
    email: "Email",
    emailPlaceholder: "your@email.com",
    fullName: "Full Name",
    fullNamePlaceholder: "John Doe",
    phone: "Phone",
    phonePlaceholder: "Your phone number",

    // Shipping
    shippingAddress: "Shipping Address",
    country: "Country",
    selectCountry: "Select country",
    address: "Address",
    addressPlaceholder: "Street and number",
    city: "City",
    cityPlaceholder: "City",
    state: "State",
    statePlaceholder: "State",
    zip: "ZIP Code",
    zipPlaceholder: "00000",

    // Shipping methods
    shippingMethod: "Shipping Method",
    standardShipping: "Standard Shipping",
    standardDays: "10-20 business days",
    free: "Free",
    expressShipping: "Express Shipping",
    expressDays: "3-7 business days",

    // Buttons
    continueToPayment: "Continue to Payment",
    processing: "Processing...",

    // StripePayment
    finalizePurchase: "Finalize Purchase",
    securePayment: "100% Secure Payment via Stripe",

    // Errors
    errorName: "Name is required",
    errorEmail: "Valid email is required",
    errorPhone: "Phone must have at least 6 digits",
    errorAddress: "Address is required",
    errorCity: "City is required",
    errorState: "State is required",
    errorZip: "ZIP code is required",

    // Validation
    invalidData: "Invalid data",
    errorCreatingPayment: "Error creating payment",
    unexpectedError: "Unexpected error. Please try again.",
    cardError: "Payment error",

    // Product loading
    loadingProduct: "Loading product...",
    productNotFound: "Product not found",
    invalidProduct: "Invalid product",
  },
  es: {
    // Checkout steps
    step1: "Información",
    step2: "Pago",
    stepProgress: "Paso",

    // CheckoutForm
    contactInfo: "Información de Contacto",
    email: "Correo electrónico",
    emailPlaceholder: "tu@correo.com",
    fullName: "Nombre completo",
    fullNamePlaceholder: "Juan Pérez",
    phone: "Teléfono",
    phonePlaceholder: "Tu número de teléfono",

    // Shipping
    shippingAddress: "Dirección de Envío",
    country: "País",
    selectCountry: "Seleccionar país",
    address: "Dirección",
    addressPlaceholder: "Calle y número",
    city: "Ciudad",
    cityPlaceholder: "Ciudad",
    state: "Estado",
    statePlaceholder: "Estado",
    zip: "Código Postal",
    zipPlaceholder: "00000",

    // Shipping methods
    shippingMethod: "Método de Envío",
    standardShipping: "Envío Estándar",
    standardDays: "10-20 días hábiles",
    free: "Gratis",
    expressShipping: "Envío Express",
    expressDays: "3-7 días hábiles",

    // Buttons
    continueToPayment: "Continuar al Pago",
    processing: "Procesando...",

    // StripePayment
    finalizePurchase: "Finalizar Compra",
    securePayment: "Pago 100% Seguro via Stripe",

    // Errors
    errorName: "El nombre es obligatorio",
    errorEmail: "Se requiere un correo válido",
    errorPhone: "El teléfono debe tener al menos 6 dígitos",
    errorAddress: "La dirección es obligatoria",
    errorCity: "La ciudad es obligatoria",
    errorState: "El estado es obligatorio",
    errorZip: "El código postal es obligatorio",

    // Validation
    invalidData: "Datos inválidos",
    errorCreatingPayment: "Error al crear el pago",
    unexpectedError: "Error inesperado. Inténtalo de nuevo.",
    cardError: "Error en el pago",

    // Product loading
    loadingProduct: "Cargando producto...",
    productNotFound: "Producto no encontrado",
    invalidProduct: "Producto inválido",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function t(locale: Locale, key: TranslationKey): string {
  const table = translations as unknown as Record<Locale, typeof translations.en>;
  return table[locale]?.[key] || translations.en[key] || key;
}
