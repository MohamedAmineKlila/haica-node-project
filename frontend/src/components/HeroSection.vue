<template>
  <!--
    Hero / Banner Container (DESIGN.md §4 Cards & Containers — Hero/Banner)
    bg: #1B3A6B | padding: 60px 40px | min-height: 300px | text: white
  -->
  <section class="bg-haica-navy min-h-hero py-[60px] px-10">
    <div class="max-w-content mx-auto flex flex-col items-center text-center gap-6">

      <!-- Main hero title — Display size: 28px / 700 / 42px line-height -->
      <h1 class="text-white font-bold text-[28px] leading-[42px] max-w-2xl">
        الهيئة العليا المستقلة للاتصال السمعي البصري
      </h1>

      <!-- Subtitle — Body size -->
      <p class="text-white/80 text-base leading-[25.6px] max-w-xl">
        جهة رقابية مستقلة تسهر على ضمان حرية التعبير وضبط المشهد الإعلامي في تونس
      </p>

      <!--
        Hero Search Input (DESIGN.md §4 Inputs — Search Input Hero)
        border-radius: 100px | height: 67.2px | border: 2px solid rgba(255,255,255,0.6)
      -->
      <div class="relative w-full max-w-lg mt-4">
        <!-- Search icon inside the input (left side in RTL = inline-end) -->
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">
          <i class="pi pi-search text-xl"></i>
        </span>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="ابحث في الموقع..."
          class="w-full bg-transparent border-2 border-white/60 rounded-[100px]
                 px-8 pl-12 text-white text-[22.4px] h-input-hero leading-[22.4px]
                 placeholder:text-white/50
                 focus:outline-none focus:border-white focus:bg-white/10
                 transition-colors duration-200"
        />
      </div>

      <!--
        Primary CTA Button (DESIGN.md §4 Buttons — Primary Button)
        bg: #BA2227 | padding: 12px 20px | border-radius: 0px | no shadow
      -->
      <button
        class="bg-haica-red text-white text-base font-normal leading-[25.6px]
               px-5 py-3 border-0 cursor-pointer
               hover:bg-[#8B1A1E] active:bg-[#6B1416] active:shadow-pressed
               transition-colors duration-150 mt-2"
        style="border-radius: 0px;"
      >
        اكتشف المزيد
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
</script>
