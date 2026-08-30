const CEP_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CEP_CACHE_MAX = 500;
const cepCache = new Map();

function sanitizeCep(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 8);
}

function remember(cep, value) {
  if (cepCache.size >= CEP_CACHE_MAX) {
    const oldest = cepCache.keys().next().value;
    cepCache.delete(oldest);
  }
  cepCache.set(cep, { value, expiresAt: Date.now() + CEP_CACHE_TTL_MS });
}

function readCache(cep) {
  const cached = cepCache.get(cep);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    cepCache.delete(cep);
    return null;
  }
  return cached.value;
}

async function resolveCep(rawCep) {
  const cep = sanitizeCep(rawCep);
  if (cep.length !== 8) {
    return { ok: false, status: 400, error: "CEP inválido. Informe 8 dígitos." };
  }

  const cached = readCache(cep);
  if (cached) return { ok: true, status: 200, data: cached };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      headers: { Accept: "application/json", "User-Agent": "CuidarMais/1.0" },
      signal: controller.signal
    });
    if (!response.ok) {
      return { ok: false, status: 502, error: "Serviço de CEP temporariamente indisponível." };
    }
    const payload = await response.json();
    if (payload.erro) return { ok: false, status: 404, error: "CEP não localizado." };

    const data = {
      cep,
      uf: String(payload.uf || "").toUpperCase(),
      municipality: String(payload.localidade || ""),
      municipalityIbge: String(payload.ibge || ""),
      neighborhood: String(payload.bairro || ""),
      source: "ViaCEP",
      resolvedAt: new Date().toISOString()
    };
    remember(cep, data);
    return { ok: true, status: 200, data };
  } catch (error) {
    const message = error?.name === "AbortError"
      ? "A consulta do CEP excedeu o tempo limite."
      : "Não foi possível consultar o CEP agora.";
    return { ok: false, status: 502, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { resolveCep, sanitizeCep };
