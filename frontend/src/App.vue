<script setup lang="ts">
import { useBackgroundMusic } from '@/composables/useBackgroundMusic'
import HeroSection from '@/components/sections/HeroSection.vue'
import CountdownSection from '@/components/sections/CountdownSection.vue'
import CalendarSection from '@/components/sections/CalendarSection.vue'
import TimelineSection from '@/components/sections/TimelineSection.vue'
import InfoSection from '@/components/sections/InfoSection.vue'
import GallerySwiperSection from '@/components/sections/GallerySwiperSection.vue'
import RsvpSection from '@/components/sections/RsvpSection.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import MusicToggle from '@/components/ui/MusicToggle.vue'

const { isPlaying, toggle } = useBackgroundMusic()
</script>

<template>
  <div class="wedding-site min-h-screen bg-wedding-cream">
    <!-- Page Sections (FR-001) -->
    <HeroSection />
    <CalendarSection />
    <CountdownSection />
    <TimelineSection />
    <InfoSection />
    <GallerySwiperSection />
    <RsvpSection />
    <AppFooter />

    <!-- Fixed Music Toggle (FR-020) — always visible -->
    <MusicToggle :is-playing="isPlaying" @toggle="toggle" />
  </div>
</template>
