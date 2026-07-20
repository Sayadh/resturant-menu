// Inject one or more schema.org JSON-LD blocks into <head>. SSR-rendered so
// Google sees them on first crawl. Accepts a value or a getter — the getter
// form stays reactive (e.g. locale-dependent Article schema).
type Json = Record<string, unknown>
type JsonLdInput = Json | Json[]

export function useJsonLd(data: JsonLdInput | (() => JsonLdInput)) {
  useHead(() => {
    const val = typeof data === 'function' ? data() : data
    const blocks = Array.isArray(val) ? val : [val]
    return {
      script: blocks.map((d) => ({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(d),
      })),
    }
  })
}
