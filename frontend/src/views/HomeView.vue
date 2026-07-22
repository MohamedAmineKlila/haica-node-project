<template>
  <!--
    Home Page — composes all sections in order
    Layout: Navbar → Hero → News → About → Footer
  -->
  <div class="min-h-screen flex flex-col font-arabic">
    <AppNavbar />
    <main class="flex-1">
      <HeroSection />
      <NewsSection />
      <AboutSection />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppNavbar    from '../components/AppNavbar.vue'
import HeroSection  from '../components/HeroSection.vue'
import NewsSection  from '../components/NewsSection.vue'
import AboutSection from '../components/AboutSection.vue'
import AppFooter    from '../components/AppFooter.vue'
</script>
