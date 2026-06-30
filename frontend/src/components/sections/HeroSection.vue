<script setup lang="ts">
import { onMounted, ref } from "vue";

const heroImg = "/assets/hero/hero.png";
const active = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      active.value = true;
    }, 60);
  });
});

function scrollToRsvp() {
  document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" });
}
</script>

<template>
  <section
    class="hero-section relative min-h-screen overflow-hidden bg-wedding-cream"
  >
    <!-- ── Photo: LCP ── -->
    <!-- Mobile: object-cover full-bleed immersive; Desktop: object-contain no-crop luxury -->
    <img
      :src="heroImg"
      alt=""
      aria-hidden="true"
      fetchpriority="high"
      decoding="async"
      class="hero-photo absolute inset-0 w-full h-full select-none pointer-events-none transition-opacity duration-[2000ms]"
      :class="active ? 'opacity-95' : 'opacity-0'"
    />

    <!-- ── Mobile bottom fade (immersive, 42% height) ── -->
    <div
      class="lg:hidden absolute inset-x-0 bottom-0 pointer-events-none"
      style="
        height: 42%;
        background: linear-gradient(
          to top,
          #faf8f5 0%,
          rgba(250, 248, 245, 0.85) 35%,
          rgba(250, 248, 245, 0.2) 70%,
          transparent 100%
        );
      "
    />

    <!-- ── Desktop bottom fade (lighter, preserves photo — 33% height, reduced opacity) ── -->
    <div
      class="hidden lg:block absolute inset-x-0 bottom-0 pointer-events-none"
      style="
        height: 33%;
        background: linear-gradient(
          to top,
          rgba(250, 248, 245, 0.93) 0%,
          rgba(250, 248, 245, 0.55) 45%,
          rgba(250, 248, 245, 0.05) 85%,
          transparent 100%
        );
      "
    />

    <!-- ───────────────────────────────────────────────────────
         TOP — script atmosphere title, lives in sky/background
    ─────────────────────────────────────────────────────────── -->
    <div
      class="absolute top-[25px] inset-x-0 z-10 text-center pt-20 md:pt-16"
      :class="{ 'hero-active': active }"
    >
      <!-- pt-4 pb-3 on <p> gives clip-path animation room above ascenders -->
      <p
        class="hero-write font-script text-5xl md:text-6xl lg:text-7xl text-wedding-charcoal/80 title-shadow pt-4 pb-3"
        style="--delay: 0.25s; --write-dur: 2s"
      >
        We got Married
      </p>
    </div>

    <!-- ───────────────────────────────────────────────────────
         BOTTOM — name zone sits on top of the fade area
    ─────────────────────────────────────────────────────────── -->
    <div
      class="absolute bottom-0 inset-x-0 z-10 px-5 md:px-10 pb-8 md:pb-10"
      :class="{ 'hero-active': active }"
    >
      <!-- Thin gold divider -->
      <div
        class="hero-divider w-10 h-px bg-wedding-gold/60 mx-auto mb-6"
        style="--delay: 1s"
      />

      <!-- Side-by-side names -->
      <div
        class="hero-fade flex items-center justify-center gap-5 md:gap-12 mb-4"
        style="--delay: 1.2s"
      >
        <!-- Groom -->
        <div class="text-center">
          <p
            class="font-sans font-light text-2xl md:text-3xl text-wedding-charcoal tracking-[0.12em] leading-tight"
          >
            何啟賢
          </p>
          <p
            class="font-display text-[10px] md:text-xs text-wedding-charcoal/55 tracking-[0.38em] mt-2 uppercase"
          >
            Bean
          </p>
        </div>

        <!-- Separator -->
        <span
          class="font-display text-wedding-gold/55 text-xl md:text-2xl leading-none select-none"
          >/</span
        >

        <!-- Bride -->
        <div class="text-center">
          <p
            class="font-sans font-light text-2xl md:text-3xl text-wedding-charcoal tracking-[0.12em] leading-tight"
          >
            周羽薇
          </p>
          <p
            class="font-display font-bold text-[10px] md:text-xs text-wedding-charcoal/55 tracking-[0.38em] mt-2 uppercase"
          >
            Katherine
          </p>
        </div>
      </div>

      <!-- Date -->
      <p
        class="hero-fade font-display text-wedding-charcoal/50 tracking-[0.38em] text-[16px] md:text-sm text-center mb-6"
        style="--delay: 1.5s"
      >
        2026 / 11 / 14
      </p>

      <!-- CTA -->
      <div class="hero-fade text-center" style="--delay: 1.75s">
        <button
          class="border border-wedding-gold text-wedding-gold font-display tracking-[0.25em] text-sm uppercase px-10 py-4 transition-all duration-300 hover:bg-wedding-gold hover:text-white min-h-[44px]"
          @click="scrollToRsvp"
        >
          出席回覆
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Photo rendering: mobile cover / desktop contain ── */
.hero-photo {
  object-fit: cover;
  object-position: 53% center;
}

@media (min-width: 1024px) {
  .hero-photo {
    object-position: center center;
  }
}

/* ── Base hidden states ── */
.hero-fade {
  opacity: 0;
  transform: translateY(6px);
}

.hero-write {
  clip-path: inset(0 100% 0 0);
  display: block;
}

.hero-divider {
  transform: scaleX(0);
  transform-origin: center;
}

/* ── Animations activate when parent gets .hero-active ── */
.hero-active .hero-fade {
  animation: heroFadeUp 0.85s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  animation-delay: var(--delay, 0s);
}

.hero-active .hero-write {
  animation: heroWriteIn var(--write-dur, 1.8s) cubic-bezier(0.23, 1, 0.32, 1)
    both;
  animation-delay: var(--delay, 0s);
}

.hero-active .hero-divider {
  animation: heroExpand 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  animation-delay: var(--delay, 0s);
}

/* ── Keyframes ── */
@keyframes heroFadeUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes heroWriteIn {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0% 0 0);
  }
}

@keyframes heroExpand {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* Top script title: light white bloom + dark drop for bright sky backgrounds */
.title-shadow {
  text-shadow:
    0 0 40px rgba(255, 255, 255, 0.6),
    0 0 14px rgba(255, 255, 255, 0.4),
    0 1px 5px rgba(0, 0, 0, 0.18);
}

/* ── Accessibility ── */
@media (prefers-reduced-motion: reduce) {
  .hero-active .hero-fade,
  .hero-active .hero-write,
  .hero-active .hero-divider {
    animation: none;
    opacity: 1;
    transform: none;
    clip-path: none;
  }
}
</style>
