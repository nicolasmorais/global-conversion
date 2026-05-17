"use client";

import { forwardRef, useState, useEffect, useRef, useImperativeHandle } from "react";
import { type Locale } from "@/lib/i18n";

const COUNTRIES = [
  { code:"BR", name:"Brasil",          ddi:"+55",  flag:"br" },
  { code:"US", name:"Estados Unidos",  ddi:"+1",   flag:"us" },
  { code:"PT", name:"Portugal",        ddi:"+351", flag:"pt" },
  { code:"GB", name:"Reino Unido",     ddi:"+44",  flag:"gb" },
  { code:"DE", name:"Alemanha",        ddi:"+49",  flag:"de" },
  { code:"FR", name:"França",          ddi:"+33",  flag:"fr" },
  { code:"ES", name:"Espanha",         ddi:"+34",  flag:"es" },
  { code:"IT", name:"Itália",          ddi:"+39",  flag:"it" },
  { code:"JP", name:"Japão",           ddi:"+81",  flag:"jp" },
  { code:"KR", name:"Coreia do Sul",   ddi:"+82",  flag:"kr" },
  { code:"AU", name:"Austrália",       ddi:"+61",  flag:"au" },
  { code:"CA", name:"Canadá",          ddi:"+1",   flag:"ca" },
  { code:"MX", name:"México",          ddi:"+52",  flag:"mx" },
  { code:"AR", name:"Argentina",       ddi:"+54",  flag:"ar" },
  { code:"CO", name:"Colômbia",        ddi:"+57",  flag:"co" },
  { code:"CL", name:"Chile",           ddi:"+56",  flag:"cl" },
  { code:"PE", name:"Peru",            ddi:"+51",  flag:"pe" },
  { code:"NL", name:"Países Baixos",   ddi:"+31",  flag:"nl" },
  { code:"SE", name:"Suécia",          ddi:"+46",  flag:"se" },
  { code:"CH", name:"Suíça",           ddi:"+41",  flag:"ch" },
  { code:"AE", name:"Emirados Árabes", ddi:"+971", flag:"ae" },
  { code:"SG", name:"Singapura",       ddi:"+65",  flag:"sg" },
  { code:"IN", name:"Índia",           ddi:"+91",  flag:"in" },
  { code:"CN", name:"China",           ddi:"+86",  flag:"cn" },
  { code:"IE", name:"Irlanda",         ddi:"+353", flag:"ie" },
];

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  shipping: string;
}

export interface CheckoutFormHandle {
  getData: () => CustomerData | null;
}

interface Shipping {
  id: string;
  country: string;
  price: number;
  days_min: number;
  days_max: number;
}

interface CheckoutFormProps {
  locale?: Locale;
  currency?: string;
  shippings?: Shipping[];
  disabled?: boolean;
  onShippingChange?: (country: string, price: number) => void;
}

const formTranslations: Record<string, Record<string, string>> = {
  en: {
    contactInfo: "Contact Information",
    email: "Email *",
    emailPlaceholder: "your@email.com",
    fullName: "Full Name *",
    fullNamePlaceholder: "Your full name",
    phone: "Phone *",
    phonePlaceholder: "(555) 123-4567",
    searchCountry: "Search country...",
    shippingAddress: "Shipping Address",
    country: "Country *",
    address: "Address *",
    addressPlaceholder: "Street, number, complement",
    city: "City *",
    cityPlaceholder: "City",
    state: "State *",
    statePlaceholder: "State",
    zip: "ZIP Code *",
    zipPlaceholder: "00000",
    shippingMethod: "Shipping Method",
    standardShipping: "Standard Shipping",
    standardDays: "business days",
    free: "Free",
    noShipping: "No shipping available for this country",
    errorName: "Name is required",
    errorEmail: "Valid email is required",
    errorPhone: "Phone must have at least 6 digits",
    errorAddress: "Address is required",
    errorCity: "City is required",
    errorState: "State is required",
    errorZip: "ZIP code is required",
  },
  es: {
    contactInfo: "Información de Contacto",
    email: "Correo electrónico *",
    emailPlaceholder: "tu@correo.com",
    fullName: "Nombre completo *",
    fullNamePlaceholder: "Tu nombre completo",
    phone: "Teléfono *",
    phonePlaceholder: "(555) 123-4567",
    searchCountry: "Buscar país...",
    shippingAddress: "Dirección de Envío",
    country: "País *",
    address: "Dirección *",
    addressPlaceholder: "Calle, número, complemento",
    city: "Ciudad *",
    cityPlaceholder: "Ciudad",
    state: "Estado *",
    statePlaceholder: "Estado",
    zip: "Código Postal *",
    zipPlaceholder: "00000",
    shippingMethod: "Método de Envío",
    standardShipping: "Envío Estándar",
    standardDays: "días hábiles",
    free: "Gratis",
    noShipping: "No hay envío disponible para este país",
    errorName: "El nombre es obligatorio",
    errorEmail: "Se requiere un correo válido",
    errorPhone: "El teléfono debe tener al menos 6 dígitos",
    errorAddress: "La dirección es obligatoria",
    errorCity: "La ciudad es obligatoria",
    errorState: "El estado es obligatorio",
    errorZip: "El código postal es obligatorio",
  },
  pt: {
    contactInfo: "Informações de Contato",
    email: "E-mail *",
    emailPlaceholder: "seu@email.com",
    fullName: "Nome completo *",
    fullNamePlaceholder: "Seu nome completo",
    phone: "Telefone *",
    phonePlaceholder: "(11) 91234-5678",
    searchCountry: "Buscar país...",
    shippingAddress: "Endereço de Entrega",
    country: "País *",
    address: "Endereço *",
    addressPlaceholder: "Rua, número, complemento",
    city: "Cidade *",
    cityPlaceholder: "Cidade",
    state: "Estado *",
    statePlaceholder: "Estado",
    zip: "CEP *",
    zipPlaceholder: "00000-000",
    shippingMethod: "Método de Envio",
    standardShipping: "Envio Padrão",
    standardDays: "dias úteis",
    free: "Grátis",
    noShipping: "Envio não disponível para este país",
    errorName: "Nome é obrigatório",
    errorEmail: "E-mail válido é obrigatório",
    errorPhone: "Telefone deve ter pelo menos 6 dígitos",
    errorAddress: "Endereço é obrigatório",
    errorCity: "Cidade é obrigatória",
    errorState: "Estado é obrigatório",
    errorZip: "CEP é obrigatório",
  },
  fr: {
    contactInfo: "Informations de Contact",
    email: "E-mail *",
    emailPlaceholder: "votre@email.com",
    fullName: "Nom complet *",
    fullNamePlaceholder: "Votre nom complet",
    phone: "Téléphone *",
    phonePlaceholder: "(01) 2345-6789",
    searchCountry: "Rechercher un pays...",
    shippingAddress: "Adresse de Livraison",
    country: "Pays *",
    address: "Adresse *",
    addressPlaceholder: "Rue, numéro, complément",
    city: "Ville *",
    cityPlaceholder: "Ville",
    state: "Région *",
    statePlaceholder: "Région",
    zip: "Code Postal *",
    zipPlaceholder: "00000",
    shippingMethod: "Méthode de Livraison",
    standardShipping: "Livraison Standard",
    standardDays: "jours ouvrables",
    free: "Gratuit",
    noShipping: "Livraison non disponible pour ce pays",
    errorName: "Le nom est obligatoire",
    errorEmail: "Un e-mail valide est obligatoire",
    errorPhone: "Le téléphone doit comporter au moins 6 chiffres",
    errorAddress: "L'adresse est obligatoire",
    errorCity: "La ville est obligatoire",
    errorState: "La région est obligatoire",
    errorZip: "Le code postal est obligatoire",
  },
  de: {
    contactInfo: "Kontaktinformationen",
    email: "E-Mail *",
    emailPlaceholder: "ihre@email.com",
    fullName: "Vollständiger Name *",
    fullNamePlaceholder: "Ihr vollständiger Name",
    phone: "Telefon *",
    phonePlaceholder: "(0123) 456-7890",
    searchCountry: "Land suchen...",
    shippingAddress: "Lieferadresse",
    country: "Land *",
    address: "Adresse *",
    addressPlaceholder: "Straße, Nummer, Zusatz",
    city: "Stadt *",
    cityPlaceholder: "Stadt",
    state: "Bundesland *",
    statePlaceholder: "Bundesland",
    zip: "PLZ *",
    zipPlaceholder: "00000",
    shippingMethod: "Versandart",
    standardShipping: "Standardversand",
    standardDays: "Werktage",
    free: "Kostenlos",
    noShipping: "Kein Versand für dieses Land verfügbar",
    errorName: "Name ist erforderlich",
    errorEmail: "Gültige E-Mail ist erforderlich",
    errorPhone: "Telefon muss mindestens 6 Ziffern haben",
    errorAddress: "Adresse ist erforderlich",
    errorCity: "Stadt ist erforderlich",
    errorState: "Bundesland ist erforderlich",
    errorZip: "PLZ ist erforderlich",
  },
  it: {
    contactInfo: "Informazioni di Contatto",
    email: "E-mail *",
    emailPlaceholder: "tua@email.com",
    fullName: "Nome completo *",
    fullNamePlaceholder: "Il tuo nome completo",
    phone: "Telefono *",
    phonePlaceholder: "(02) 1234-5678",
    searchCountry: "Cerca paese...",
    shippingAddress: "Indirizzo di Spedizione",
    country: "Paese *",
    address: "Indirizzo *",
    addressPlaceholder: "Via, numero, interno",
    city: "Città *",
    cityPlaceholder: "Città",
    state: "Provincia *",
    statePlaceholder: "Provincia",
    zip: "CAP *",
    zipPlaceholder: "00000",
    shippingMethod: "Metodo di Spedizione",
    standardShipping: "Spedizione Standard",
    standardDays: "giorni lavorativi",
    free: "Gratuito",
    noShipping: "Spedizione non disponibile per questo paese",
    errorName: "Il nome è obbligatorio",
    errorEmail: "Un'e-mail valida è obbligatoria",
    errorPhone: "Il telefono deve avere almeno 6 cifre",
    errorAddress: "L'indirizzo è obbligatorio",
    errorCity: "La città è obbligatoria",
    errorState: "La provincia è obbligatoria",
    errorZip: "Il CAP è obbligatorio",
  },
};

const localeToCountry: Record<string, string> = {
  en: "US",
  es: "ES",
  pt: "BR",
  fr: "FR",
  de: "DE",
  it: "IT",
};

const currencySymbols: Record<string, string> = {
  usd: "$",
  eur: "\u20AC",
  brl: "R$",
};

function formatShippingPrice(price: number, currency: string): string {
  if (price === 0) return "";
  const sym = currencySymbols[currency] || "$";
  return `${sym}${(price / 100).toFixed(2)}`;
}

const CheckoutForm = forwardRef<CheckoutFormHandle, CheckoutFormProps>(function CheckoutForm(
  { locale = "en", currency = "usd", shippings = [], disabled = false, onShippingChange },
  ref
) {
  const t = formTranslations[locale] || formTranslations.en;

  const defaultCountry = localeToCountry[locale] || "US";

  const [form, setForm] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: defaultCountry,
    city: "",
    state: "",
    zip: "",
    shipping: "standard",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0]
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Notificar shipping inicial
  useEffect(() => {
    if (onShippingChange && shippings.length > 0) {
      const shipping = shippings.find(s => s.country === defaultCountry) || shippings.find(s => s.country === "GLOBAL");
      onShippingChange(defaultCountry, shipping ? shipping.price : 0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = t.errorName;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) newErrors.email = t.errorEmail;
    if (form.phone.replace(/\D/g, "").length < 6) newErrors.phone = t.errorPhone;
    if (!form.address.trim()) newErrors.address = t.errorAddress;
    if (!form.city.trim()) newErrors.city = t.errorCity;
    if (!form.state.trim()) newErrors.state = t.errorState;
    if (!form.zip.trim()) newErrors.zip = t.errorZip;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  useImperativeHandle(ref, () => ({
    getData() {
      if (!validate()) return null;
      return {
        ...form,
        phone: selectedCountry.ddi + form.phone.replace(/\D/g, ""),
      };
    },
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (name === "country" && onShippingChange) {
      const shipping = shippings.find(s => s.country === value) || shippings.find(s => s.country === "GLOBAL");
      onShippingChange(value, shipping ? shipping.price : 0);
    }
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.ddi.includes(search)
  );

  return (
    <fieldset disabled={disabled} className="flex flex-col gap-8 border-none p-0 m-0">
      {/* Contact */}
      <section>
        <h2 className="text-[1.1rem] font-bold text-[#111111] mb-5 tracking-tight">{t.contactInfo}</h2>
        <div className="grid gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-[#444444]">{t.email}</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t.emailPlaceholder}
              className={`w-full p-3.5 border-[1.5px] rounded-lg outline-none transition-all text-[14.5px] font-medium ${errors.email ? 'border-[#dc2626]' : 'border-[#e0e0e0] focus:border-[#111111] focus:ring-[3px] focus:ring-[#111111]/[0.06]'}`}
            />
            {errors.email && <span className="text-[11px] text-[#dc2626] font-bold">{errors.email}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-[#444444]">{t.fullName}</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder={t.fullNamePlaceholder}
              className={`w-full p-3.5 border-[1.5px] rounded-lg outline-none transition-all text-[14.5px] font-medium ${errors.name ? 'border-[#dc2626]' : 'border-[#e0e0e0] focus:border-[#111111] focus:ring-[3px] focus:ring-[#111111]/[0.06]'}`}
            />
            {errors.name && <span className="text-[11px] text-[#dc2626] font-bold">{errors.name}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-[#444444]">{t.phone}</label>
            <div className="flex relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 px-3.5 border-[1.5px] border-r-0 rounded-l-lg bg-[#f7f7f7] transition-all shrink-0 min-w-[95px] ${errors.phone ? 'border-[#dc2626]' : 'border-[#e0e0e0]'}`}
              >
                <img src={`https://flagcdn.com/w40/${selectedCountry.flag}.png`} alt={selectedCountry.code} className="w-5 h-3.5 rounded-sm shadow-sm" />
                <span className="text-[13.5px] font-bold">{selectedCountry.ddi}</span>
                <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#999] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}></div>
              </button>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder={t.phonePlaceholder}
                className={`flex-1 p-3.5 border-[1.5px] rounded-r-lg outline-none transition-all text-[14.5px] font-medium ${errors.phone ? 'border-[#dc2626]' : 'border-[#e0e0e0] focus:border-[#111111] focus:ring-[3px] focus:ring-[#111111]/[0.06]'}`}
              />
              {dropdownOpen && (
                <div ref={dropdownRef} className="absolute top-full left-0 w-[280px] bg-white border border-[#e0e0e0] rounded-lg shadow-2xl z-[100] mt-1 overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-[#f0f0f0]">
                    <input
                      type="text"
                      placeholder={t.searchCountry}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full p-2 border-[1.5px] border-[#e0e0e0] rounded-md text-[13px] outline-none focus:border-[#111111]"
                    />
                  </div>
                  <div className="max-h-[280px] overflow-y-auto p-1">
                    {filteredCountries.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setDropdownOpen(false);
                          setSearch("");
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-md transition-colors ${selectedCountry.code === c.code ? 'bg-[#111111] text-white' : 'hover:bg-[#f7f7f7]'}`}
                      >
                        <img src={`https://flagcdn.com/w40/${c.flag}.png`} alt={c.code} className="w-5 h-3.5 rounded-sm" />
                        <span className="flex-1 text-left text-[13px] font-medium truncate">{c.name}</span>
                        <span className={`text-[12px] font-bold ${selectedCountry.code === c.code ? 'text-white/70' : 'text-[#999]'}`}>{c.ddi}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.phone && <span className="text-[11px] text-[#dc2626] font-bold">{errors.phone}</span>}
          </div>
        </div>
      </section>

      <div className="h-[1px] bg-[#e5e5e5]"></div>

      {/* Address */}
      <section>
        <h2 className="text-[1.1rem] font-bold text-[#111111] mb-5 tracking-tight">{t.shippingAddress}</h2>
        <div className="grid gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-[#444444]">{t.country}</label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full p-3.5 border-[1.5px] border-[#e0e0e0] rounded-lg outline-none bg-white text-[14.5px] font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201.5L6%206.5L11%201.5%22%20stroke%3D%22%23999%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10"
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-[#444444]">{t.address}</label>
            <input
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder={t.addressPlaceholder}
              className={`w-full p-3.5 border-[1.5px] rounded-lg outline-none transition-all text-[14.5px] font-medium ${errors.address ? 'border-[#dc2626]' : 'border-[#e0e0e0] focus:border-[#111111] focus:ring-[3px] focus:ring-[#111111]/[0.06]'}`}
            />
            {errors.address && <span className="text-[11px] text-[#dc2626] font-bold">{errors.address}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-[#444444]">{t.city}</label>
              <input
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder={t.cityPlaceholder}
                className={`w-full p-3.5 border-[1.5px] rounded-lg outline-none transition-all text-[14.5px] font-medium ${errors.city ? 'border-[#dc2626]' : 'border-[#e0e0e0] focus:border-[#111111] focus:ring-[3px] focus:ring-[#111111]/[0.06]'}`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-[#444444]">{t.state}</label>
              <input
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                placeholder={t.statePlaceholder}
                className={`w-full p-3.5 border-[1.5px] rounded-lg outline-none transition-all text-[14.5px] font-medium ${errors.state ? 'border-[#dc2626]' : 'border-[#e0e0e0] focus:border-[#111111] focus:ring-[3px] focus:ring-[#111111]/[0.06]'}`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-[#444444]">{t.zip}</label>
              <input
                name="zip"
                type="text"
                value={form.zip}
                onChange={handleChange}
                placeholder={t.zipPlaceholder}
                className={`w-full p-3.5 border-[1.5px] rounded-lg outline-none transition-all text-[14.5px] font-medium ${errors.zip ? 'border-[#dc2626]' : 'border-[#e0e0e0] focus:border-[#111111] focus:ring-[3px] focus:ring-[#111111]/[0.06]'}`}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="h-[1px] bg-[#e5e5e5]"></div>

      {/* Shipping */}
      <section>
        <h2 className="text-[1.1rem] font-bold text-[#111111] mb-5 tracking-tight">{t.shippingMethod}</h2>
        <div className="flex flex-col gap-3">
          {(() => {
            const currentShipping = shippings.find(s => s.country === form.country) || shippings.find(s => s.country === "GLOBAL");
            if (!currentShipping) {
              return (
                <div className="p-4 border-[1.5px] border-[#e0e0e0] rounded-lg text-center">
                  <p className="text-[13px] text-[#999999] font-medium">{t.noShipping}</p>
                </div>
              );
            }
            const priceLabel = currentShipping.price === 0 ? t.free : formatShippingPrice(currentShipping.price, currency);
            return (
              <label
                className="flex items-center justify-between p-4 border-[1.5px] border-[#111111] bg-[#f7f7f7] rounded-lg cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-[#111111] flex items-center justify-center">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#111111]"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold">{t.standardShipping}</span>
                    <span className="text-[12px] text-[#999999] font-medium">
                      {currentShipping.days_min} - {currentShipping.days_max} {t.standardDays}
                    </span>
                  </div>
                </div>
                <span className="text-[14px] font-bold">{priceLabel}</span>
              </label>
            );
          })()}
        </div>
      </section>
    </fieldset>
  );
});

export default CheckoutForm;
