<template>
      <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
        <Navbar />

        <main class="flex-1 container mx-auto px-6 py-12 max-w-7xl">
          <header class="mb-10 text-center lg:text-left">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Monitoring & Accountability</h1>
            <p class="text-gray-600">Track your habits and progress to strengthen your recovery journey.</p>
          </header>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- LEFT COLUMN -->
            <section class="lg:col-span-2 space-y-8">

              <!-- DAILY TRACKING -->
              <Card class="shadow-lg hover:shadow-xl transition-all">
                <CardHeader class="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                  <CardTitle class="text-indigo-600 flex items-center gap-2">
                    <Clock class="h-5 w-5" /> Daily Tracking
                  </CardTitle>
                </CardHeader>

                <CardContent class="pt-6">
                  <div class="text-center mb-8">
                    <div class="text-6xl font-bold text-indigo-600 mb-3">
                      {{ todayFormatted }}
                    </div>
                    <p class="text-gray-600 text-sm">
                      of {{ limitFormatted }} daily limit
                    </p>
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
                </CardContent>
              </Card>

              <!-- WEEKLY TREND -->
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
                    <div class="text-5xl font-semibold text-purple-600 mb-2">
                      {{ monthlyFormatted }}
                    </div>
                    <p class="text-gray-600 text-sm">
                      of {{ MONTHLY_LIMIT_HOURS }} hours monthly limit
                    </p>
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

        <Footer />
      </div>
    </template>

<script setup>
import { Clock, BarChart3, Calendar, AlertTriangle } from 'lucide-vue-next'

import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Card from '@/components/Card.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'
import CardContent from '@/components/CardContent.vue'
import Progress from '@/components/Progress.vue'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/store/auth'

const { state } = useAuth()

// STATES
const todaySeconds = ref(0)
const monthlySeconds = ref(0)
const dailyLimitSeconds = ref(0)

const MONTHLY_LIMIT_HOURS = 20
let realtimeChannel = null;


/* --------------------------------------------------------------
   FORMAT HELPER
--------------------------------------------------------------*/
function formatHMS(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}


/* --------------------------------------------------------------
   FETCH FUNCTIONS - DIRECT QUERY (NO RPC)
--------------------------------------------------------------*/

async function getRecoveryDay() {
  const { data } = await supabase.rpc("get_recovery_day", {
    uid: state.user.id,
  })
  return data ?? 1
}

async function loadDailyLimit() {
  const recoveryDay = await getRecoveryDay()

  const { data } = await supabase
    .from("global_daily_limits")
    .select("limit_seconds")
    .eq("day_number", recoveryDay)
    .single()

  dailyLimitSeconds.value = data?.limit_seconds ?? 0
}

async function loadTodayUsage() {
  console.log("📊 Loading today usage...")
  
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('monitoring_logs')
      .select('duration_seconds')
      .eq('user_id', state.user.id)
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)

    if (error) throw error

    todaySeconds.value = data.reduce((sum, log) => sum + (log.duration_seconds || 0), 0)
    console.log("✅ Today total:", todaySeconds.value, "seconds")

  } catch (err) {
    console.error("❌ Load today error:", err)
  }
}

async function loadMonthUsage() {
  console.log("📊 Loading month usage (RPC)...")

  try {
    const { data, error } = await supabase.rpc("get_month_usage", {
      uid: state.user.id
    })

    console.log("📌 RPC result:", data, error)

    if (error) throw error

    monthlySeconds.value = data ?? 0

    console.log("✅ Month total:", monthlySeconds.value, "seconds")

  } catch (err) {
    console.error("❌ Load month error:", err)
  }
}   
/* --------------------------------------------------------------
   COMPUTEDS
--------------------------------------------------------------*/
const todayFormatted = computed(() => formatHMS(todaySeconds.value))
const monthlyFormatted = computed(() => formatHMS(monthlySeconds.value))
const limitFormatted = computed(() => formatHMS(dailyLimitSeconds.value))

const dailyProgress = computed(() =>
  dailyLimitSeconds.value > 0
    ? (todaySeconds.value / dailyLimitSeconds.value) * 100
    : 0
)

const monthlyProgress = computed(() =>
  (monthlySeconds.value / (MONTHLY_LIMIT_HOURS * 3600)) * 100
)

const dailyProgressColor = computed(() => {
  if (dailyProgress.value >= 100) return 'text-red-600'
  if (dailyProgress.value >= 75) return 'text-orange-600'
  return 'text-indigo-600'
})

const monthlyProgressColor = computed(() => {
  if (monthlyProgress.value >= 100) return 'text-red-600'
  if (monthlyProgress.value >= 75) return 'text-orange-600'
  return 'text-purple-600'
})


/* --------------------------------------------------------------
   INIT + REALTIME LISTENER - FIXED
--------------------------------------------------------------*/
onMounted(async () => {
  console.log("🔵 MonitoringPage Mounted")

  // Tunggu user auth ready
  while (!state.user?.id) {
    await new Promise(res => setTimeout(res, 200))
  }

  console.log("🟢 USER READY:", state.user.id)

  // Load data di awal
  await loadDailyLimit()
  await loadTodayUsage()
  await loadMonthUsage()

  /* ------------------------------------------------------------
     REALTIME SUPABASE - FIXED FILTER & EVENTS
  ------------------------------------------------------------*/
  realtimeChannel = supabase
    .channel("monitoring_rt")
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to ALL events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "monitoring_logs",
        filter: `user_id=eq.${state.user.id}`, // FIX: eq bukan like untuk UUID
      },
      async (payload) => {
        console.log("🔥 REALTIME EVENT:", payload.eventType, payload.new);
        
        // Reload data saat ada perubahan
        await loadTodayUsage();
        await loadMonthUsage();
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Realtime Channel Active");
      } else if (status === "CHANNEL_ERROR") {
        console.error("❌ Realtime Channel Error");
      } else {
        console.log("📡 Realtime Status:", status);
      }
    });

  console.log("📡 Realtime Listener Started")
})

/* --------------------------------------------------------------
   CLEANUP
--------------------------------------------------------------*/
onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
    console.log("🛑 Realtime Channel Closed")
  }
})
</script> 