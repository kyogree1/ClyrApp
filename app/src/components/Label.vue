<template>
  <label
    :for="$attrs.for"
    class="block text-sm font-semibold text-gray-700 tracking-wide mb-1"
  >
    <slot />
  </label>
</template>

<script setup>
// Komponen ini hanya menampilkan label yang bisa digunakan di form.
// Gunakan dengan <Label for="email">Email</Label>
</script>

<style scoped>
/* Menjaga agar label tetap selaras secara vertikal */
label {
  letter-spacing: 0.02em;
}
</style>
