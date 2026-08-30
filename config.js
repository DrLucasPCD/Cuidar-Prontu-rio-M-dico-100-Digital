// Em desenvolvimento, usa o servidor local. Em hospedagem estática, usa a Function.
const isLocalCuidar = ["localhost", "127.0.0.1"].includes(window.location.hostname);
window.CUIDAR_API_BASE = isLocalCuidar
  ? "/api"
  : "https://southamerica-east1-cuidarmais-7d01d.cloudfunctions.net/api";
