<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
    <!-- NAVBAR -->
    <Navbar />

    <!-- MAIN CONTENT -->
    <main class="flex-1 container mx-auto px-6 py-12 max-w-7xl">
      <header class="mb-10 text-center lg:text-left">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">User Profile</h1>
        <p class="text-gray-600">View your recovery progress, achievements, and personal data.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- SIDEBAR PROFILE -->
        <Card class="shadow-lg hover:shadow-xl transition-all bg-white/90 backdrop-blur-sm flex flex-col items-center py-8">
          <div class="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <User class="h-14 w-14 text-indigo-600" />
          </div>
          <h2 class="text-lg font-semibold text-gray-800">{{ user.name }}</h2>
          <p class="text-gray-500 text-sm">{{ user.email }}</p>

          <div class="mt-6 space-y-2 w-full px-8">
            <Button
              variant="outline"
              class="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              @click="editProfile = true"
            >
              <Edit class="h-4 w-4 mr-2" /> Edit Profile
            </Button>
            <Button
              variant="outline"
              class="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              @click="router.push('/dashboard')"
            >
              <ArrowLeft class="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
        </Card>

        <!-- PROFILE DETAILS -->
        <div class="md:col-span-2 space-y-8">
          <Card class="shadow-md hover:shadow-lg transition-all">
            <CardHeader class="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle class="text-indigo-600 flex items-center gap-2">
                <Info class="h-5 w-5" /> Account Information
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-6 space-y-3">
              <div class="flex justify-between text-gray-700">
                <span>Name</span>
                <span class="font-medium">{{ user.name }}</span>
              </div>
              <div class="flex justify-between text-gray-700">
                <span>Email</span>
                <span class="font-medium">{{ user.email }}</span>
              </div>
              <div class="flex justify-between text-gray-700">
                <span>Joined</span>
                <span class="font-medium">{{ user.joined }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- STATS CARD -->
          <Card class="shadow-md hover:shadow-lg transition-all">
            <CardHeader class="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle class="text-indigo-600 flex items-center gap-2">
                <BarChart class="h-5 w-5" /> Recovery Statistics
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-6 space-y-5">
              <div class="space-y-2">
                <div class="flex justify-between text-sm text-gray-700">
                  <span>Clean Days</span>
                  <span>{{ stats.cleanDays }}</span>
                </div>
                <Progress :value="stats.cleanDays / 30 * 100" class="rounded-full" />
              </div>

              <div class="space-y-2">
                <div class="flex justify-between text-sm text-gray-700">
                  <span>Longest Streak</span>
                  <span>{{ stats.longestStreak }} days</span>
                </div>
                <Progress :value="stats.longestStreak / 30 * 100" class="rounded-full" />
              </div>

              <div class="space-y-2">
                <div class="flex justify-between text-sm text-gray-700">
                  <span>Total Journals</span>
                  <span>{{ stats.totalJournals }}</span>
                </div>
                <Progress :value="stats.totalJournals / 20 * 100" class="rounded-full" />
              </div>
            </CardContent>
          </Card>

          <!-- POSITIVE HABITS -->
          <Card class="shadow-md hover:shadow-lg transition-all">
            <CardHeader class="border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle class="text-purple-600 flex items-center gap-2">
                <Heart class="h-5 w-5" /> Positive Habits
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-6">
              <ul class="space-y-2 text-gray-700">
                <li v-for="(habit, i) in habits" :key="i" class="flex items-center gap-2">
                  <CheckCircle2 class="h-4 w-4 text-green-500" /> {{ habit }}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- EDIT PROFILE DIALOG -->
      <Dialog v-model:open="editProfile" maxWidth="lg">
        <DialogContent>
          <DialogHeader>
            <DialogTitle class="text-indigo-700 text-2xl mb-4 font-semibold">Edit Profile</DialogTitle>
          </DialogHeader>

          <form @submit.prevent="saveProfile" class="space-y-6">
            <div class="space-y-2">
              <Label>Full Name</Label>
              <Input v-model="tempUser.name" placeholder="Your full name" />
            </div>

            <div class="space-y-2">
              <Label>Email</Label>
              <Input v-model="tempUser.email" placeholder="email@example.com" />
            </div>

            <DialogFooter class="pt-4">
              <Button
                variant="outline"
                class="border-gray-300 text-gray-700 hover:bg-gray-50"
                @click="editProfile = false"
              >
                Cancel
              </Button>
              <Button class="bg-indigo-600 hover:bg-indigo-700 text-white">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>

    <!-- FOOTER -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  Edit,
  Info,
  BarChart,
  Heart,
  CheckCircle2,
  ArrowLeft
} from 'lucide-vue-next'

import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'
import CardContent from '@/components/CardContent.vue'
import Progress from '@/components/Progress.vue'
import Dialog from '@/components/Dialog.vue'
import DialogContent from '@/components/DialogContent.vue'
import DialogHeader from '@/components/DialogHeader.vue'
import DialogTitle from '@/components/DialogTitle.vue'
import DialogFooter from '@/components/DialogFooter.vue'
import Input from '@/components/Input.vue'
import Label from '@/components/Label.vue'

const router = useRouter()

const user = reactive({
  name: 'Muhammad Azka Yunastio',
  email: 'azka@example.com',
  joined: 'January 2025'
})

const stats = reactive({
  cleanDays: 14,
  longestStreak: 7,
  totalJournals: 12
})

const habits = ref([
  'Daily Meditation',
  'Read 15 minutes',
  'Write reflection journal',
  'Light exercise'
])

const editProfile = ref(false)
const tempUser = reactive({ ...user })

function saveProfile() {
  user.name = tempUser.name
  user.email = tempUser.email
  editProfile.value = false
}
</script>
