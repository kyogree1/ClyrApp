<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
    <!-- NAVBAR -->
    <Navbar />

    <!-- MAIN CONTENT -->
    <main class="flex-1 container mx-auto px-6 py-12 max-w-7xl">
      <header class="mb-10 text-center lg:text-left">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Monitoring & Accountability</h1>
        <p class="text-gray-600">Track your habits and progress to strengthen your recovery journey.</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- LEFT COLUMN -->
        <section class="lg:col-span-2 space-y-8">
          <!-- TRACKING CARD -->
          <Card class="shadow-lg hover:shadow-xl transition-all">
            <CardHeader class="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle class="text-indigo-600 flex items-center gap-2">
                <Clock class="h-5 w-5" /> Daily Tracking
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-6">
              <div class="text-center mb-8">
                <div class="text-6xl font-bold text-indigo-600 mb-3">
                  {{ String(todayHours).padStart(2, '0') }}:{{ String(todayMinutes % 60).padStart(2, '0') }}
                </div>
                <p class="text-gray-600 text-sm">of {{ DAILY_LIMIT_HOURS }} hours daily limit</p>
              </div>

              <div class="mb-6">
                <div class="flex justify-between mb-2">
                  <span class="text-gray-700 font-medium">Daily Progress</span>
                  <span :class="dailyProgressColor">{{ dailyProgress.toFixed(0) }}%</span>
                </div>
                <Progress :value="Math.min(dailyProgress, 100)" class="h-4 bg-gray-200 rounded-full" />
                <div
                  v-if="dailyProgress >= 75"
                  class="flex items-center gap-2 mt-2 text-sm font-medium"
                  :class="dailyProgressColor"
                >
                  <AlertTriangle class="h-4 w-4" />
                  <span>
                    {{ dailyProgress >= 100 ? 'Daily limit exceeded!' : 'Approaching daily limit!' }}
                  </span>
                </div>
              </div>

              <div class="flex gap-3">
                <Button
                  v-if="!isTracking"
                  @click="startTracking"
                  class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-lg font-semibold"
                  :disabled="dailyProgress >= 100"
                >
                  <Play class="h-5 w-5 mr-2" /> Start
                </Button>

                <Button
                  v-else
                  @click="stopTracking"
                  class="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-lg font-semibold"
                >
                  <Pause class="h-5 w-5 mr-2" /> Stop
                </Button>

                <Button
                  @click="resetToday"
                  variant="outline"
                  class="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- CHART CARD -->
          <Card class="shadow-lg hover:shadow-xl transition-all">
            <CardHeader class="border-b bg-gray-50">
              <CardTitle class="text-indigo-600 flex items-center gap-2">
                <BarChart3 class="h-5 w-5" /> Weekly Trend
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-6 text-center text-gray-500">
              Chart integration coming soon...
            </CardContent>
          </Card>
        </section>

        <!-- RIGHT COLUMN -->
        <aside class="space-y-8">
          <!-- MONTHLY PROGRESS -->
          <Card class="shadow-lg hover:shadow-xl transition-all">
            <CardHeader class="border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle class="text-purple-600 flex items-center gap-2">
                <Calendar class="h-5 w-5" /> Monthly Progress
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-6">
              <div class="text-center mb-6">
                <div class="text-5xl font-semibold text-purple-600 mb-2">{{ monthlyHours }}h</div>
                <p class="text-gray-600 text-sm">of {{ MONTHLY_LIMIT_HOURS }} hours monthly limit</p>
              </div>

              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-gray-700 font-medium">Progress</span>
                  <span :class="monthlyProgressColor">{{ monthlyProgress.toFixed(0) }}%</span>
                </div>
                <Progress :value="Math.min(monthlyProgress, 100)" class="h-4 bg-gray-200 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <!-- MOTIVATION -->
          <Card class="shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:shadow-xl transition-all">
            <CardContent class="pt-6">
              <h4 class="text-xl font-semibold mb-3">💪 Stay Strong!</h4>
              <p class="text-indigo-100 text-sm mb-4">
                Every day without relapse is a small victory. Keep going — you're building a better version of yourself.
              </p>
              <p class="text-sm italic text-indigo-100">
                “Recovery isn’t about perfection — it’s about progress.”
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>

    <!-- FOOTER -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, Play, Pause, BarChart3, Calendar, AlertTriangle } from 'lucide-vue-next'

import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'
import CardContent from '@/components/CardContent.vue'
import Progress from '@/components/Progress.vue'

// --- Routing ---
const router = useRouter()

// --- State ---
const isTracking = ref(false)
const todayMinutes = ref(0)
const startTime = ref(null)
let timer

// --- Constants ---
const DAILY_LIMIT_HOURS = 2
const MONTHLY_LIMIT_HOURS = 20

// --- Computed ---
const todayHours = computed(() => Math.floor(todayMinutes.value / 60))
const dailyProgress = computed(() => (todayMinutes.value / (DAILY_LIMIT_HOURS * 60)) * 100)
const monthlyHours = computed(() => Math.floor(todayMinutes.value / 60))
const monthlyProgress = computed(() => (monthlyHours.value / MONTHLY_LIMIT_HOURS) * 100)

const dailyProgressColor = computed(() =>
  dailyProgress.value >= 100
    ? 'text-red-600'
    : dailyProgress.value >= 75
    ? 'text-orange-600'
    : 'text-indigo-600'
)

const monthlyProgressColor = computed(() =>
  monthlyProgress.value >= 100
    ? 'text-red-600'
    : monthlyProgress.value >= 75
    ? 'text-orange-600'
    : 'text-purple-600'
)

// --- Functions ---
function startTracking() {
  isTracking.value = true
  startTime.value = Date.now() - todayMinutes.value * 60000
  timer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime.value) / 60000)
    todayMinutes.value = elapsed
  }, 1000)
}

function stopTracking() {
  isTracking.value = false
  clearInterval(timer)
}

function resetToday() {
  todayMinutes.value = 0
  stopTracking()
}

function handleLogout() {
  localStorage.removeItem('auth')
  router.push('/login')
}

// --- Cleanup ---
onUnmounted(() => clearInterval(timer))
</script>
