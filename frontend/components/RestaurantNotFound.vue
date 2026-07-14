<script setup lang="ts">
defineProps<{ slug: string }>()
</script>

<template>
  <div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FDFBF7] to-[#F3EDE0] px-6 py-12 text-center text-[#3E2723]">
    
    <!-- Background abstract decorative blobs -->
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <div class="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#E4D6C2] opacity-30 blur-3xl mix-blend-multiply" />
      <div class="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C69A5A] opacity-10 blur-[100px] mix-blend-multiply" />
    </div>

    <div class="relative z-10 mx-auto w-full max-w-lg">
      
      <!-- Animated Cloche Icon -->
      <div class="group relative mx-auto mb-10 h-32 w-32">
        <svg class="h-full w-full text-[#A87E42] drop-shadow-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- The Lid (animated to lift) -->
          <path class="animate-lift origin-bottom" d="M12 2C12.5523 2 13 2.44772 13 3V4.22384C17.4727 5.16335 21 9.17646 21 14H3C3 9.17646 6.52733 5.16335 11 4.22384V3C11 2.44772 11.4477 2 12 2Z" fill="currentColor"/>
          <!-- The Platter Base -->
          <path d="M22 15C22.5523 15 23 15.4477 23 16C23 16.5523 22.5523 17 22 17H2C1.44772 17 1 16.5523 1 16C1 15.4477 1.44772 15 2 15H22Z" fill="currentColor"/>
        </svg>
        <div class="absolute -right-2 top-0 rotate-12 animate-float rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-lg shadow-red-500/30">
          404
        </div>
      </div>

      <h1 class="font-serif text-4xl font-extrabold tracking-tight text-[#2D1A11] sm:text-5xl">
        Մենյուն չի գտնվել
      </h1>
      
      <p class="mx-auto mt-5 max-w-md text-base leading-relaxed text-[#7A6455] sm:text-lg">
        «<span class="font-semibold text-[#A87E42]">{{ slug }}</span>» հասցեով թվային մենյու գոյություն չունի կամ այն այլևս հասանելի չէ։
      </p>


      
      <div class="mt-10 animate-[slide-up_0.5s_ease-out_0.5s_both]">
        <NuxtLink to="/" class="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-[#8A7868] transition-colors hover:bg-white/50 hover:text-[#C69A5A]">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Վերադառնալ գլխավոր էջ
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes lift {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.02); }
}
.animate-lift {
  animation: lift 3s ease-in-out infinite;
  transform-origin: center bottom;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(12deg); }
  50% { transform: translateY(-8px) rotate(16deg); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
