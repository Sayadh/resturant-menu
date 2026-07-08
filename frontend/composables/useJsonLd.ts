// Inject one or more schema.org JSON-LD blocks into <head>. SSR-rendered so
// Google sees them on first crawl.
export function useJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  const blocks = Array.isArray(data) ? data : [data]
  useHead({
    script: blocks.map((d) => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(d),
    })),
  })
}
