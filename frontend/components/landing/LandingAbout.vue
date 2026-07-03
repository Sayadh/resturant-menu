<script setup lang="ts">
const paragraphs = [
  'Մեր նպատակն է օգնել ռեստորաններին հրաժարվել հնացած գործընթացներից և անցնել արագ, գեղեցիկ ու հեշտ կառավարվող թվային համակարգերի։',
  'Մենք հավատում ենք, որ տեխնոլոգիան պետք է պարզեցնի աշխատանքը, խնայի ժամանակը և բարելավի յուրաքանչյուր հաճախորդի փորձառությունը։ Այդ գաղափարով էլ ստեղծել ենք QR Menu Platform-ը՝ հարթակ, որը թույլ է տալիս ռեստորաններին հեշտությամբ կառավարել իրենց մենյուն, կատարել ակնթարթային փոփոխություններ և ներկայացնել իրենց բրենդը ժամանակակից ու պրոֆեսիոնալ ձևով։',
]
const values = [
  { icon: '✦', title: 'Որակ', desc: 'Ամեն արտադրանք կառուցում ենք բարձր ստանդարտներով։' },
  { icon: '◇', title: 'Պարզություն', desc: 'Հեշտ, ինտուիտիվ լուծումներ՝ առանց ավելորդ բարդության։' },
  { icon: '➤', title: 'Նորարարություն', desc: 'Անընդհատ զարգանում ենք թվային աշխարհի հետ միասին։' },
]
</script>

<template>
  <section id="about" class="relative overflow-hidden bg-slate-50 py-24">
    <div class="pointer-events-none absolute inset-0">
      <div class="about-glow about-a" />
      <div class="about-glow about-b" />
    </div>

    <div class="relative mx-auto max-w-4xl px-5 sm:px-8">
      <LandingReveal class="text-center">
        <span class="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm">
          Մեր մասին
        </span>
        <h2 class="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Rosami <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">ՍՊԸ</span>
        </h2>
        <p class="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          Rosami ՍՊԸ-ն հայկական տեխնոլոգիական ընկերություն է, որը ստեղծում է ժամանակակից թվային լուծումներ բիզնեսների համար։
        </p>
      </LandingReveal>

      <LandingReveal :delay="80" class="mx-auto mt-8 max-w-2xl space-y-5 text-center text-[15px] leading-relaxed text-slate-500">
        <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
      </LandingReveal>

      <!-- Vision highlight -->
      <LandingReveal :delay="120" class="mt-12">
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl sm:p-10">
          <span class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <p class="relative text-sm font-semibold uppercase tracking-wide text-indigo-200">Սակայն սա միայն սկիզբն է</p>
          <p class="relative mt-4 text-xl font-medium leading-relaxed sm:text-2xl">
            Մեր տեսլականն է ստեղծել թվային լուծումների ամբողջական էկոհամակարգ, որը կօգնի տարբեր ոլորտների բիզնեսներին աշխատել ավելի արդյունավետ, զարգանալ և մրցունակ մնալ թվային աշխարհում։
          </p>
        </div>
      </LandingReveal>

      <!-- Values -->
      <div class="mt-10 grid gap-5 sm:grid-cols-3">
        <LandingReveal
          v-for="(v, i) in values"
          :key="v.title"
          :delay="i * 90"
          class="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <span class="grid h-11 w-11 mx-auto place-items-center rounded-xl bg-indigo-50 text-lg text-indigo-600">{{ v.icon }}</span>
          <h3 class="mt-4 text-base font-bold text-slate-900">{{ v.title }}</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-slate-500">{{ v.desc }}</p>
        </LandingReveal>
      </div>

      <LandingReveal :delay="80" class="mx-auto mt-12 max-w-2xl text-center">
        <p class="text-lg font-medium italic leading-relaxed text-slate-700">
          Rosami ՍՊԸ-ում մենք հավատում ենք, որ յուրաքանչյուր գաղափար կարող է վերածվել հզոր թվային արտադրանքի, եթե այն կառուցվում է որակի, պարզության և նորարարության սկզբունքներով։
        </p>
      </LandingReveal>
    </div>
  </section>
</template>

<style scoped>
.about-glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(100px);
  opacity: 0.14;
}
.about-a { top: 8%; left: -6%; height: 360px; width: 360px; background: #6366f1; }
.about-b { bottom: 0; right: -6%; height: 420px; width: 420px; background: #a855f7; }
</style>
