const configuredUrl = import.meta.env.VITE_API_URL?.trim()

/** En dev sans URL → requêtes relatives via proxy Vite (évite CORS). */
export const API_BASE_URL =
  configuredUrl !== undefined && configuredUrl !== ''
    ? configuredUrl
    : import.meta.env.DEV
      ? ''
      : 'https://parser.datapipe.duckdns.org'
