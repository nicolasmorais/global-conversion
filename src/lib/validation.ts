/**
 * Validações server-side
 */

export interface CheckoutData {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  product_name: string;
  product_id?: string;
  amount: number;
  currency: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCheckoutData(data: unknown): {
  valid: boolean;
  errors: ValidationError[];
  sanitized?: CheckoutData;
} {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: [{ field: "body", message: "Dados inválidos" }] };
  }

  const d = data as Record<string, unknown>;

  // Nome
  const name = String(d.name || "").trim();
  if (!name || name.length < 2) {
    errors.push({ field: "name", message: "Nome é obrigatório (mínimo 2 caracteres)" });
  }

  // Email
  const email = String(d.email || "").trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: "email", message: "Email inválido" });
  }

  // Telefone
  const phone = String(d.phone || "").trim();
  if (!phone || phone.length < 8) {
    errors.push({ field: "phone", message: "Telefone inválido (mínimo 8 dígitos)" });
  }

  // Endereço
  const address = String(d.address || "").trim();
  if (!address || address.length < 5) {
    errors.push({ field: "address", message: "Endereço é obrigatório (mínimo 5 caracteres)" });
  }

  // País
  const country = String(d.country || "").trim();
  if (!country) {
    errors.push({ field: "country", message: "País é obrigatório" });
  }

  // Produto
  const product_name = String(d.product_name || "").trim();
  if (!product_name) {
    errors.push({ field: "product_name", message: "Nome do produto é obrigatório" });
  }

  // Valor
  const amount = Number(d.amount);
  if (!amount || amount <= 0) {
    errors.push({ field: "amount", message: "Valor deve ser maior que zero" });
  }

  // Moeda
  const currency = String(d.currency || "usd").trim().toLowerCase();
  const validCurrencies = ["usd", "brl", "eur", "gbp", "mxn", "ars", "clp", "cop", "pen"];
  if (!validCurrencies.includes(currency)) {
    errors.push({ field: "currency", message: "Moeda inválida" });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const product_id = d.product_id ? String(d.product_id).trim() : undefined;

  return {
    valid: true,
    errors: [],
    sanitized: {
      name,
      email,
      phone,
      address,
      country,
      product_name,
      product_id,
      amount: Math.round(amount),
      currency,
    },
  };
}

export function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, "").trim();
}
