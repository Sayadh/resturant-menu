import { SITE } from '~/data/seo'
import { useJsonLd } from '~/composables/useJsonLd'

export type FaqItem = {
  q: string
  a: string
}

export type PricingPlan = {
  name: string
  price: number | string
  description?: string
}

export type UseHomeStructuredDataOptions = {
  faqItems: FaqItem[]
  pricingPlans: PricingPlan[]
}

export const useHomeStructuredData = ({
  faqItems,
  pricingPlans
}: UseHomeStructuredDataOptions) => {
  const siteUrl = SITE.url

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl}/#software-application`,

    name: SITE.brand,
    alternateName: 'Menus',
    url: `${siteUrl}/`,

    description:
      'Menus.am-ը թվային QR մենյուի SaaS հարթակ է ռեստորանների, սրճարանների, բարերի, հացաբուլկեղենի և սննդի այլ բիզնեսների համար։ Հարթակը թույլ է տալիս ստեղծել, կառավարել և իրական ժամանակում թարմացնել առցանց մենյուն։',

    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Restaurant Menu Management Software',
    operatingSystem: 'Web, iOS, Android',
    browserRequirements: 'Requires a modern web browser',

    image: SITE.ogImage,
    screenshot: SITE.ogImage,

    provider: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: SITE.brand,
      url: `${siteUrl}/`
    },

    offers: pricingPlans.map((plan, index) => ({
      '@type': 'Offer',
      '@id': `${siteUrl}/#offer-${index + 1}`,
      name: plan.name,
      url: `${siteUrl}/#pricing`,
      price: String(plan.price),
      priceCurrency: 'AMD',
      availability: 'https://schema.org/InStock',
      category: 'subscription',
      description: plan.description
    })),

    featureList: [
      'QR կոդով թվային մենյու',
      'Առցանց մենյուի կառավարում',
      'Մենյուի իրական ժամանակում թարմացում',
      'Բազմալեզու մենյու',
      'Կատեգորիաների և ապրանքների կառավարում',
      'Բջջային սարքերին հարմարեցված դիզայն',
      'Անհատական դոմեյնի միացում',
      'Մենյուի թեմաների փոփոխություն'
    ],

    inLanguage: ['hy', 'ru', 'en']
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl}/#faq`,
    url: `${siteUrl}/#faq`,
    name: `${SITE.brand} հաճախ տրվող հարցեր`,

    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  }

  useJsonLd([softwareApplicationSchema, faqSchema])
}