// Resolves a page URL (or a link that points to a page, e.g. a fryday.am
// product page or a Google result) into a direct image URL by reading the
// page's og:image / twitter:image meta tag. If the URL is already an image,
// it is returned as-is.
export default defineEventHandler(async (event) => {
  const raw = (getQuery(event).url as string | undefined)?.trim()
  if (!raw || !/^https?:\/\//i.test(raw)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid http(s) url is required' })
  }

  let res: Response
  try {
    res = await fetch(raw, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; MenuBot/1.0)' },
      redirect: 'follow',
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Could not reach the URL' })
  }

  const contentType = res.headers.get('content-type') || ''
  // Already an image → use the (possibly redirected) final URL.
  if (contentType.startsWith('image/')) {
    return { image: res.url || raw }
  }

  const html = await res.text()
  const pick = (re: RegExp) => html.match(re)?.[1]
  const image =
    pick(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i) ||
    pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i)

  if (!image) {
    throw createError({ statusCode: 404, statusMessage: 'No image found on that page' })
  }

  // Resolve relative URLs against the page origin.
  try {
    return { image: new URL(image, res.url || raw).href }
  } catch {
    return { image }
  }
})
