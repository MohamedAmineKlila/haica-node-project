<template>
  <section class="rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-8 text-center shadow-card">
    <i class="pi pi-lock text-5xl text-slate-300 dark:text-slate-600 mb-4 block"></i>
    <h2 class="text-xl font-bold text-slate-800 dark:text-white">Accès non autorisé</h2>
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
      Votre rôle actuel ne contient pas la permission nécessaire pour ouvrir cette page.
    </p>
    <RouterLink class="btn btn--primary mt-6 inline-flex no-underline" to="/admin">
      Retour au tableau de bord
    </RouterLink>
  </section>
</template>
