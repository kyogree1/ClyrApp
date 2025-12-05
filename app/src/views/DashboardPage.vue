<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
    <!-- Navbar Component -->
    <Navbar />

    <!-- MAIN CONTENT -->
    <main class="flex-1 container mx-auto px-6 py-12 max-w-7xl">
      <!-- HEADER TITLE -->
      <header class="mb-10 text-center lg:text-left">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p class="text-gray-600">Your progress and daily emotional insights at a glance.</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- LEFT COLUMN -->
        <section class="lg:col-span-2 space-y-8">
          <!-- SUMMARY CARDS -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card class="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-all">
              <CardContent class="pt-6">
                <div class="flex items-center gap-3 mb-2">
                  <div class="p-2 bg-green-500 rounded-lg"><CheckCircle2 class="h-5 w-5 text-white" /></div>
                  <div class="text-green-700 font-medium">Days Completed</div>
                </div>
                <div class="text-3xl text-green-700 mt-2 font-semibold">{{ daysCompleted }}</div>
                <p class="text-green-600 text-sm mt-1">Streaks maintained</p>
              </CardContent>
            </Card>

            <Card class="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-all">
              <CardContent class="pt-6">
                <div class="flex items-center gap-3 mb-2">
                  <div class="p-2 bg-purple-500 rounded-lg">
                    <span class="text-white font-bold text-lg">😊</span>
                  </div>
                  <div class="text-purple-700 font-medium">Avg Mood (7 Days)</div>
                </div>
                <div class="text-3xl text-purple-700 mt-2 font-semibold">{{ avgMood }}</div>
                <p class="text-purple-600 text-sm mt-1">Your emotional trend this week</p>
              </CardContent>
            </Card>


            <Card class="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-md hover:shadow-lg transition-all">
              <CardContent class="pt-6">
                <div class="flex items-center gap-3 mb-2">
                  <div class="p-2 bg-yellow-500 rounded-lg">
                    <span class="text-white font-bold text-lg">🔥</span>
                  </div>
                  <div class="text-yellow-700 font-medium">Current Streak</div>
                </div>
                <div class="text-3xl text-yellow-700 mt-2 font-semibold">{{ streak }}</div>
                <p class="text-yellow-600 text-sm mt-1">Keep the momentum!</p>
              </CardContent>
            </Card>

          </div>

          <!-- CHECK-IN SECTION -->
          <Card class="shadow-lg hover:shadow-xl transition-all">
            <CardHeader class="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle class="text-indigo-600 flex items-center gap-2">
                <BookOpen class="h-5 w-5" /> Daily Reflection
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-6 space-y-6">
              <section>
                <h4 class="mb-4 text-gray-700 font-semibold">Today's Focus</h4>
                <div class="space-y-3">
                  <div
                    v-for="(label, key) in checklistLabels"
                    :key="key"
                    class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <input
                      type="checkbox"
                      :id="key"
                      v-model="checklist[key]"
                      class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label :for="key" class="flex-1 cursor-pointer text-gray-700">{{ label }}</label>
                  </div>
                </div>
              </section>

              <section>
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-gray-700 font-semibold">Mood Level (0–5)</h4>
                  <span class="text-2xl text-indigo-600 font-bold">{{ mood }}</span>
                </div>
                <Progress :value="(mood / 5) * 100" class="h-3 bg-gray-200 rounded-full" />
                <input
                  type="range"
                  min="0"
                  max="5"
                  v-model="mood"
                  class="w-full mt-3 accent-indigo-600"
                />
              </section>

              <section>
                <h4 class="mb-3 text-gray-700 font-semibold">Personal Notes</h4>
                <Textarea
                  v-model="notes"
                  placeholder="Reflect on today’s thoughts, struggles, or gratitude..."
                  class="min-h-32 resize-none border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                />
              </section>

            <Button
              @click="submitReflection"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-lg shadow-md hover:shadow-xl font-semibold transition-all"
            >
              Check in
            </Button>

            </CardContent>
          </Card>
        </section>

        <!-- RIGHT COLUMN -->
        <aside class="space-y-8">
          <Card class="shadow-lg hover:shadow-xl transition-all">
            <CardHeader class="border-b bg-gray-50">
              <CardTitle class="text-indigo-600 flex items-center gap-2">
                <Target class="h-5 w-5" /> Goals & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-4 space-y-3 max-h-80 overflow-y-auto">
              <div
                v-for="(item, idx) in achievements"
                :key="idx"
                class="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span class="text-indigo-600 font-semibold">{{ idx + 1 }}</span>
                  </div>
                  <div class="flex-1">
                    <h5 class="text-gray-800 font-medium">{{ item.title }}</h5>
                    <p class="text-gray-600 text-sm">{{ item.desc }}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:shadow-xl transition-all">
            <CardContent class="pt-6">
              <h4 class="text-xl font-semibold mb-3">🌱 Keep Growing!</h4>
              <p class="text-indigo-100 text-sm mb-4">
                Each reflection and check-in helps you progress further. Continue your consistency!
              </p>
              <p class="text-sm italic text-indigo-100">
                “Small steps every day lead to big transformations.”
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>

    <!-- Footer Component -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/store/auth'

import {
  CheckCircle2,
  BookOpen,
  Target,
} from 'lucide-vue-next'

import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'
import CardContent from '@/components/CardContent.vue'
import Progress from '@/components/Progress.vue'
import Textarea from '@/components/Textarea.vue'

/* ------------------------------------------------------------------
   INIT
------------------------------------------------------------------ */
const router = useRouter()
const { state } = useAuth()
const userId = state.user?.id

/* ------------------------------------------------------------------
   LOCAL STATES
------------------------------------------------------------------ */
const checklist = reactive({
  mindful: false,
  productive: false,
  reflective: false
})

const checklistLabels = {
  mindful: 'Practiced Mindfulness',
  productive: 'Focused on Work',
  reflective: 'Reflected on Emotions'
}

const mood = ref(3)
const notes = ref('')

/* Dashboard Stats */
const daysCompleted = ref(0)
const avgMood = ref(0)
const streak = ref(0)

/* Achievement list */
const achievements = ref([])

/* ------------------------------------------------------------------
   LOAD DAYS COMPLETED
------------------------------------------------------------------ */
async function loadDaysCompleted() {
  const { count } = await supabase
    .from("daily_reflections")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  daysCompleted.value = count || 0
}

/* ------------------------------------------------------------------
   LOAD AVG MOOD
------------------------------------------------------------------ */
async function loadAvgMood() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const { data } = await supabase
    .from("daily_reflections")
    .select("mood_level")
    .eq("user_id", userId)
    .gte("date", sevenDaysAgo)

  if (!data || data.length === 0) {
    avgMood.value = 0
    return
  }

  const total = data.reduce((acc, i) => acc + i.mood_level, 0)
  avgMood.value = (total / data.length).toFixed(1)
}

/* ------------------------------------------------------------------
   LOAD STREAK
------------------------------------------------------------------ */
async function loadStreak() {
  const { data } = await supabase
    .from("daily_reflections")
    .select("date")
    .eq("user_id", userId)
    .order("date", { ascending: false })

  if (!data || data.length === 0) {
    streak.value = 0
    return
  }

  let count = 0
  let current = new Date()

  for (let row of data) {
    const checkDate = new Date(row.date)

    if (checkDate.toDateString() === current.toDateString()) {
      count++
      current.setDate(current.getDate() - 1)
    } else {
      break
    }
  }

  streak.value = count
}

/* ------------------------------------------------------------------
   LOAD ACHIEVEMENTS (AUTO)
------------------------------------------------------------------ */
function loadAchievements() {
  const d = daysCompleted.value

  achievements.value = []

  if (d >= 1) achievements.value.push({ title: "Day One", desc: "Started your journey" })
  if (d >= 3) achievements.value.push({ title: "3 Days", desc: "Maintained focus for 3 days" })
  if (d >= 7) achievements.value.push({ title: "1 Week", desc: "Completed your first week milestone" })
  if (d >= 14) achievements.value.push({ title: "2 Weeks", desc: "Stayed consistent for two weeks" })
  if (d >= 30) achievements.value.push({ title: "1 Month", desc: "Reached 1 month milestone" })
}

/* ------------------------------------------------------------------
   SUBMIT REFLECTION
------------------------------------------------------------------ */
async function submitReflection() {
  const today = new Date().toISOString().slice(0, 10)

  const { error } = await supabase
    .from("daily_reflections")
    .upsert({
      user_id: userId,
      date: today,
      practiced_mindfulness: checklist.mindful,
      focused_on_work: checklist.productive,
      reflected_on_emotions: checklist.reflective,
      mood_level: mood.value,
      notes: notes.value
    })

  if (error) {
    alert("You already checked in today.")
    return
  }

  alert("Reflection submitted!")

  await loadDashboard()
}

/* ------------------------------------------------------------------
   LOAD ALL DASHBOARD DATA
------------------------------------------------------------------ */
async function loadDashboard() {
  await loadDaysCompleted()
  await loadAvgMood()
  await loadStreak()
  await loadAchievements()
}

onMounted(() => {
  if (!userId) return router.push('/login')
  loadDashboard()
})
</script>
