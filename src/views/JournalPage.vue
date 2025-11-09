<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
    <Navbar />

    <main class="flex-1 container mx-auto px-6 py-12 max-w-6xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-indigo-100 rounded-xl">
            <BookOpen class="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 class="text-3xl text-gray-800 font-bold">Jurnal Refleksi</h1>
            <p class="text-gray-600">Dokumentasikan perjalanan pemulihan Anda</p>
          </div>
        </div>
        <Button
          @click="openAddDialog = true"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus class="h-5 w-5" />
          Tambah Jurnal
        </Button>
      </div>

      <!-- Empty State -->
      <div v-if="journals.length === 0" class="text-center py-16">
        <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen class="h-10 w-10 text-indigo-600" />
        </div>
        <h3 class="text-xl text-gray-800 mb-3">Belum Ada Jurnal</h3>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          Mulai dokumentasikan perjalanan pemulihan Anda dengan menulis jurnal refleksi pertama Anda.
        </p>
        <Button
          @click="openAddDialog = true"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg"
        >
          <Plus class="h-5 w-5 mr-2" /> Buat Jurnal Pertama
        </Button>
      </div>

      <!-- Journal Entries -->
      <div v-else class="space-y-6">
        <Card
          v-for="journal in journals"
          :key="journal.id"
          :class="['shadow-md hover:shadow-lg transition-all border', moodColor(journal.mood)]"
        >
          <CardContent class="pt-6">
            <div class="flex justify-between mb-3">
              <div>
                <h3 class="text-xl font-semibold text-gray-800">{{ journal.title }}</h3>
                <p class="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar class="h-4 w-4" />
                  {{ formatDate(journal.date) }}
                </p>
              </div>
              <div class="flex items-center gap-1">
                <component :is="moodIcon(journal.mood)" class="h-5 w-5" />
                <span class="text-gray-700 text-sm">Mood: {{ journal.mood }}/5</span>
              </div>
            </div>
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ journal.content }}</p>
          </CardContent>
        </Card>
      </div>
    </main>

    <!-- Dialog dipindah ke luar Footer -->
    <AddJournalDialog v-model="openAddDialog" @add="addJournal" />

    <Footer />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { BookOpen, Plus, Calendar, Smile, Frown, Meh } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import CardContent from '@/components/CardContent.vue'
import AddJournalDialog from '@/components/AddJournalDialog.vue'

const journals = ref([])
const openAddDialog = ref(false)

// 🔄 Load dari localStorage saat pertama kali
onMounted(() => {
  const saved = localStorage.getItem('journals')
  if (saved) {
    journals.value = JSON.parse(saved)
    console.log('📦 Jurnal dimuat dari localStorage:', journals.value)
  }
})

// 🧩 Fungsi tambah jurnal
function addJournal(entry) {
  console.log('🔥 [JournalPage] Event @add diterima! Entry:', entry)

  if (!entry || !entry.title) {
    console.warn('⚠️ Tidak ada entry diterima!')
    return
  }

  journals.value.unshift(entry)
  localStorage.setItem('journals', JSON.stringify(journals.value))
  console.log('✅ Jurnal disimpan! Total sekarang:', journals.value.length)
}


// 🔁 Watch agar sinkron saat localStorage berubah
watch(journals, (val) => {
  console.log('🧠 Watcher aktif, menyimpan ulang...')
  localStorage.setItem('journals', JSON.stringify(val))
}, { deep: true })

// 🟢 Fungsi bantu
function moodIcon(mood) {
  if (mood >= 4) return Smile
  if (mood >= 2) return Meh
  return Frown
}

function moodColor(mood) {
  if (mood >= 4) return 'bg-green-50 border-green-200'
  if (mood >= 2) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

function formatDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
</script>
