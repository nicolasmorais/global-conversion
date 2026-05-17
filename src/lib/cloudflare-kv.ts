/**
 * Cloudflare KV - Backup Storage
 * Usa a REST API do Cloudflare para salvar/recuperar dados
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

function getBaseUrl(): string {
  return `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}`;
}

function isConfigured(): boolean {
  return !!(ACCOUNT_ID && NAMESPACE_ID && API_TOKEN);
}

export async function kvPut(key: string, value: unknown): Promise<boolean> {
  if (!isConfigured()) {
    console.warn("[KV Backup] Cloudflare KV não configurado, pulando backup...");
    return false;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/values/${key}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    });

    if (!response.ok) {
      console.error("[KV Backup] Erro ao salvar:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[KV Backup] Erro:", error);
    return false;
  }
}

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  if (!isConfigured()) {
    console.warn("[KV Backup] Cloudflare KV não configurado");
    return null;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/values/${key}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("[KV Backup] Erro ao ler:", error);
    return null;
  }
}
