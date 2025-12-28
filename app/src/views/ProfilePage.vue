<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
    <Navbar />

    <main class="flex-1 container mx-auto px-6 py-12 max-w-7xl">
      <!-- HEADER -->
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-gray-800">User Profile</h1>
        <p class="text-gray-600">Kelola akun dan lihat progres pemulihan Anda</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

        <!-- SIDEBAR -->
        <Card class="bg-white/90 backdrop-blur shadow-lg flex flex-col items-center py-8">
          <div class="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <User class="h-14 w-14 text-indigo-600" />
          </div>

          <h2 class="text-lg font-semibold">{{ user.name }}</h2>
          <p class="text-gray-500 text-sm">{{ user.email }}</p>

          <span
            class="mt-2 text-xs px-3 py-1 rounded-full"
            :class="isPremium
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-200 text-gray-600'"
          >
            {{ isPremium ? 'PREMIUM' : 'FREE' }}
          </span>

          <div class="mt-6 space-y-2 w-full px-8">
            <Button variant="outline" class="w-full" @click="router.push('/profile/edit')">
              Edit Profile
            </Button>
            <Button variant="outline" class="w-full" @click="router.push('/dashboard')">
              Back
            </Button>
          </div>
        </Card>

        <!-- CONTENT -->
        <div class="md:col-span-2 space-y-8">

          <!-- ACCOUNT INFO -->
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              <div class="flex justify-between">
                <span>Name</span><span>{{ user.name }}</span>
              </div>
              <div class="flex justify-between">
                <span>Email</span><span>{{ user.email }}</span>
              </div>
              <div class="flex justify-between">
                <span>Joined</span><span>{{ user.joined }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- STATS -->
          <Card>
            <CardHeader>
              <CardTitle>Recovery Statistics</CardTitle>
            </CardHeader>

            <CardContent class="space-y-5">
              <!-- FREE -->
              <div>
                <div class="flex justify-between text-sm">
                  <span>Clean Days</span>
                  <span>{{ stats.cleanDays }}</span>
                </div>
                <Progress :value="stats.cleanDays / 30 * 100" />
              </div>

              <!-- PREMIUM -->
              <template v-if="isPremium">
                <div>
                  <div class="flex justify-between text-sm">
                    <span>Longest Streak</span>
                    <span>{{ stats.longestStreak }} days</span>
                  </div>
                  <Progress :value="stats.longestStreak / 30 * 100" />
                </div>

                <div>
                  <div class="flex justify-between text-sm">
                    <span>Total Journals</span>
                    <span>{{ stats.totalJournals }}</span>
                  </div>
                  <Progress :value="stats.totalJournals / 20 * 100" />
                </div>
              </template>

              <!-- LOCK -->
              <div
                v-else
                class="text-center text-sm text-gray-500 mt-4"
              >
                🔒 Statistik lanjutan tersedia untuk Premium
                <button
                  class="text-indigo-600 font-semibold ml-1 hover:underline"
                  @click="openUpgrade"
                >
                  Upgrade
                </button>
              </div>
            </CardContent>
          </Card>

          <!-- HABITS (PREMIUM ONLY) -->
          <Card v-if="isPremium">
            <CardHeader>
              <CardTitle>Positive Habits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-2">
                <li
                  v-for="(habit, i) in habits"
                  :key="i"
                  class="flex items-center gap-2"
                >
                  <CheckCircle2 class="h-4 w-4 text-green-500" />
                  {{ habit }}
                </li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>

    <UpgradePremiumModal v-model="showUpgrade" />
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/store/auth'

import {
  User,
  CheckCircle2
} from 'lucide-vue-next'

import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'
import CardContent from '@/components/CardContent.vue'
import Progress from '@/components/Progress.vue'
import UpgradePremiumModal from '@/components/UpgradePremiumModal.vue'

const router = useRouter()
const { state } = useAuth()

const isPremium = computed(() => state.isPremium)

const showUpgrade = ref(false)

const user = reactive({
  name: '',
  email: '',
  joined: ''
})

const stats = reactive({
  cleanDays: 14,
  longestStreak: 7,
  totalJournals: 12
})

const habits = [
  'Daily Meditation',
  'Read 15 minutes',
  'Write reflection journal'
]

const openUpgrade = () => {
  showUpgrade.value = true
}

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return router.push('/login')

  user.email = data.user.email
  user.joined = data.user.created_at.split('T')[0]

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', data.user.id)
    .single()

  user.name = profile?.full_name || 'User'
})
</script>
