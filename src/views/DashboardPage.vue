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
                <div class="text-3xl text-green-700 mt-2 font-semibold">12</div>
                <p class="text-green-600 text-sm mt-1">Streaks maintained</p>
              </CardContent>
            </Card>

            <Card class="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-all">
              <CardContent class="pt-6">
                <div class="flex items-center gap-3 mb-2">
                  <div class="p-2 bg-blue-500 rounded-lg"><XCircle class="h-5 w-5 text-white" /></div>
                  <div class="text-blue-700 font-medium">Pending Goals</div>
                </div>
                <div class="text-3xl text-blue-700 mt-2 font-semibold">3</div>
                <p class="text-blue-600 text-sm mt-1">Tasks left to complete</p>
              </CardContent>
            </Card>

            <Card class="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md hover:shadow-lg transition-all">
              <CardContent class="pt-6">
                <div class="flex items-center gap-3 mb-2">
                  <div class="p-2 bg-orange-500 rounded-lg"><Calendar class="h-5 w-5 text-white" /></div>
                  <div class="text-orange-700 font-medium">Milestones</div>
                </div>
                <div class="text-3xl text-orange-700 mt-2 font-semibold">5</div>
                <p class="text-orange-600 text-sm mt-1">Achieved so far</p>
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle2, XCircle, Calendar, BookOpen, Target } from 'lucide-vue-next'

import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'
import CardContent from '@/components/CardContent.vue'
import Progress from '@/components/Progress.vue'
import Textarea from '@/components/Textarea.vue'

const router = useRouter()

const checklist = reactive({
  mindful: false,
  productive: true,
  reflective: false
})

const checklistLabels = {
  mindful: 'Practiced Mindfulness',
  productive: 'Focused on Work',
  reflective: 'Reflected on Emotions'
}

const mood = ref(3)
const notes = ref('')

const achievements = [
  { title: 'Day One', desc: 'Started your recovery journey' },
  { title: '3 Days', desc: 'Maintained focus for 3 days' },
  { title: '1 Week', desc: 'Completed your first week milestone' },
  { title: '2 Weeks', desc: 'Stayed consistent for two weeks' }
]
</script>
