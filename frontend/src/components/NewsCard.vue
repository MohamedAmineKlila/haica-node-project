<template>
  <!--
    News / Recent Updates Card (DESIGN.md §4 Cards — News/Recent Updates Card)
    bg: white | no border | padding: 16px 0 | min-height: 211px | shadow-card
  -->
  <article
    class="bg-white shadow-card hover:shadow-card-hover min-h-card
           transition-shadow duration-200 cursor-pointer flex flex-col"
    style="border-radius: 0px;"
  >
    <!-- Card image -->
    <div class="overflow-hidden" style="border-radius: 0px;">
      <img
        :src="news.image"
        :alt="news.title"
        class="w-full h-40 object-cover"
        style="border-radius: 4px 4px 0 0;"
      />
    </div>

    <!-- Card body -->
    <div class="flex flex-col gap-2 p-4 flex-1">

      <!--
        Date Label (DESIGN.md §4 Badges — Date Label)
        bg: #BA2227 | text: white | 12px / 700 | padding: 6px 12px | border-radius: 2px
      -->
      <span
        class="inline-block self-start bg-haica-red text-white
               text-[12px] font-bold leading-[18px] px-3 py-1.5"
        style="border-radius: 2px;"
      >
        {{ news.date }}
      </span>

      <!-- Card title — Heading 3: 18px / 700 -->
      <h3 class="text-black font-bold text-[18px] leading-[27px] mt-1 line-clamp-2">
        {{ news.title }}
      </h3>

      <!-- Excerpt — Body Small: 14px / 400 -->
      <p class="text-[#666666] text-[14px] leading-[21px] line-clamp-3 flex-1">
        {{ news.excerpt }}
      </p>

      <!-- Read more link -->
      <a href="#" class="text-haica-blue text-[14px] font-bold no-underline hover:underline mt-auto">
        اقرأ المزيد ←
      </a>
    </div>
  </article>
</template>

<script setup lang="ts">
// Props — data passed from the parent component
defineProps<{
  news: {
    id: number
    title: string
    date: string
    excerpt: string
    image: string
    category: string
  }
}>()
</script>
