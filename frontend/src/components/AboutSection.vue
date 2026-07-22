<template>
  <!-- About section — alternating background (DESIGN.md §2 Background Alternate) -->
  <section class="bg-[#F5F5F5] py-10 px-10">
    <div class="max-w-content mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

      <!-- Text content -->
      <div class="flex flex-col gap-4">
        <h2 class="text-black font-bold text-[24px] leading-[36px]">عن الهيئة</h2>
        <p class="text-[#444444] text-base leading-[25.6px]">
          الهيئة العليا المستقلة للاتصال السمعي البصري (HAICA) هي هيئة دستورية مستقلة
          تأسّست بموجب المرسوم عدد 116 لسنة 2011، وتضطلع بمهمة ضبط وتنظيم القطاع
          السمعي البصري في تونس.
        </p>
        <p class="text-[#666666] text-[14px] leading-[21px]">
          تعمل الهيئة على ضمان التعددية والتوازن في المشهد الإعلامي، وإصدار تراخيص البث،
          ومراقبة الالتزام بالمعايير المهنية والأخلاقية في وسائل الإعلام السمعية البصرية.
        </p>

        <button
          class="self-start bg-haica-red text-white text-base font-normal leading-[25.6px]
                 px-5 py-3 border-0 cursor-pointer mt-2
                 hover:bg-[#8B1A1E] active:shadow-pressed transition-colors duration-150"
          style="border-radius: 0px;"
        >
          تعرّف على الهيئة
        </button>
      </div>

      <!-- Stats / quick facts -->
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white shadow-card p-6 flex flex-col items-center text-center"
          style="border-radius: 0px;"
        >
          <span class="text-haica-red font-bold text-[28px] leading-[42px]">{{ stat.value }}</span>
          <span class="text-[#666666] text-[14px] leading-[21px] mt-1">{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const stats = [
  { value: '+120', label: 'قناة مرخّصة' },
  { value: '+80',  label: 'محطة إذاعية' },
  { value: '2011', label: 'سنة التأسيس' },
  { value: '9',    label: 'أعضاء المجلس' },
]
</script>
