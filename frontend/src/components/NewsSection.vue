<template>
  <!-- News Section — responsive 1/2/4-column grid -->
  <section class="bg-white py-10 px-10">
    <div class="max-w-content mx-auto">

      <!-- Section header -->
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-black font-bold text-[24px] leading-[36px]">
          آخر الأخبار والمستجدات
        </h2>
        <a href="#" class="text-haica-blue text-[14px] font-bold no-underline hover:underline">
          عرض الكل
        </a>
      </div>

      <!-- Cards grid: 1 col mobile → 2 col tablet → 4 col desktop -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NewsCard v-for="item in newsItems" :key="item.id" :news="item" />
      </div>

      <!-- Load more button -->
      <div class="flex justify-center mt-10">
        <button
          class="bg-haica-red text-white text-base font-normal leading-[25.6px]
                 px-5 py-3 border-0 cursor-pointer
                 hover:bg-[#8B1A1E] active:bg-[#6B1416] active:shadow-pressed
                 transition-colors duration-150"
          style="border-radius: 0px;"
        >
          عرض المزيد من الأخبار
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import NewsCard from './NewsCard.vue'

// Type definition for a news item
interface NewsItem {
  id: number
  title: string
  date: string
  excerpt: string
  image: string
  category: string
}

// Mock data — replace with real API calls later
const newsItems: NewsItem[] = [
  {
    id: 1,
    title: 'اجتماع مجلس الهيئة — ماي 2026',
    date: '13 ماي 2026',
    excerpt:
      'انعقد مجلس الهيئة العليا المستقلة للاتصال السمعي البصري في جلسة عادية لمناقشة جملة من الملفات المطروحة المتعلقة بضبط المشهد الإعلامي.',
    image: 'https://picsum.photos/seed/haica1/400/250',
    category: 'أخبار الهيئة',
  },
  {
    id: 2,
    title: 'ترخيص قناة تلفزية جديدة',
    date: '10 ماي 2026',
    excerpt:
      'أصدرت الهيئة قراراً بمنح رخصة بث لقناة تلفزية خاصة جديدة في إطار تكريس التعددية الإعلامية وفق الأطر القانونية المنظِّمة للقطاع.',
    image: 'https://picsum.photos/seed/haica2/400/250',
    category: 'القرارات',
  },
  {
    id: 3,
    title: 'تقرير رقابة البث — أفريل 2026',
    date: '05 ماي 2026',
    excerpt:
      'أصدرت الهيئة تقريرها الشهري حول مراقبة مضامين البث الإذاعي والتلفزي خلال شهر أفريل المنقضي، مع رصد للمخالفات وتوصيات للمؤسسات الإعلامية.',
    image: 'https://picsum.photos/seed/haica3/400/250',
    category: 'التقارير',
  },
  {
    id: 4,
    title: 'ندوة وطنية حول حرية الصحافة',
    date: '02 ماي 2026',
    excerpt:
      'نظّمت الهيئة ندوة وطنية بعنوان "حرية الصحافة ومسؤولية المنظومة الإعلامية" بمشاركة خبراء ومختصين من مختلف المؤسسات الإعلامية والمدنية.',
    image: 'https://picsum.photos/seed/haica4/400/250',
    category: 'الفعاليات',
  },
]
</script>
