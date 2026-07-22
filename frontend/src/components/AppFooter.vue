<template>
  <!--
    Footer — deep navy background, white text, full-width
    centered content max-width 1200px (DESIGN.md §5 Layout)
  -->
  <footer class="bg-haica-navy text-white py-10 px-10">
    <div class="max-w-content mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

      <!-- Column 1: Logo & description -->
      <div class="flex flex-col gap-3">
        <h3 class="font-bold text-xl">HAICA</h3>
        <p class="text-white/70 text-[14px] leading-[21px]">
          الهيئة العليا المستقلة للاتصال السمعي البصري — تونس
        </p>
        <p class="text-white/50 text-[12px] leading-[18px]">
          جهة رقابية مستقلة لضبط وتنظيم قطاع الإعلام السمعي البصري.
        </p>
      </div>

      <!-- Column 2: Quick links -->
      <div class="flex flex-col gap-3">
        <h4 class="font-bold text-base leading-[24px] mb-1">روابط سريعة</h4>
        <a
          v-for="link in quickLinks"
          :key="link.label"
          :href="link.href"
          class="text-white/70 text-[14px] font-normal no-underline
                 hover:text-white transition-colors duration-150"
        >
          {{ link.label }}
        </a>
      </div>

      <!-- Column 3: Contact -->
      <div class="flex flex-col gap-3">
        <h4 class="font-bold text-base leading-[24px] mb-1">تواصل معنا</h4>
        <p class="text-white/70 text-[14px] leading-[21px]">
          <span class="font-bold text-white/90">العنوان:</span> 3 نهج لندن، تونس 1002
        </p>
        <p class="text-white/70 text-[14px] leading-[21px]">
          <span class="font-bold text-white/90">الهاتف:</span> 71 841 700
        </p>
        <p class="text-white/70 text-[14px] leading-[21px]">
          <span class="font-bold text-white/90">البريد:</span> contact@haica.tn
        </p>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="max-w-content mx-auto mt-10 pt-6 border-t border-white/20 flex items-center justify-between flex-wrap gap-4">
      <p class="text-white/50 text-[12px] leading-[18px]">
        © {{ currentYear }} HAICA — جميع الحقوق محفوظة
      </p>
      <div class="flex gap-4">
        <a href="#" class="text-white/50 text-[12px] no-underline hover:text-white/80 font-normal">
          سياسة الخصوصية
        </a>
        <a href="#" class="text-white/50 text-[12px] no-underline hover:text-white/80 font-normal">
          شروط الاستخدام
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()

const quickLinks = [
  { label: 'الرئيسية',           href: '#' },
  { label: 'عن الهيئة',          href: '#' },
  { label: 'القرارات والتراخيص', href: '#' },
  { label: 'البلاغات والتقارير', href: '#' },
  { label: 'اتصل بنا',           href: '#' },
]
</script>
