<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
    <!-- Navbar dinamis -->
    <Navbar />

    <!-- HERO -->
    <section class="flex-1 container mx-auto px-6 py-20 max-w-6xl">
      <div class="text-center mb-16">
        <h1 class="text-5xl text-gray-900 mb-6 font-bold">
          Welcome to <span class="text-indigo-600">Clyr</span> <br />
          <span class="text-gray-800">Your Path to Clarity and Recovery</span>
        </h1>

        <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Clyr is a digital platform designed to help you overcome porn addiction
          through self-reflection, emotional awareness, and compassionate guidance.
          Begin your journey toward balance and freedom — one step at a time.
        </p>

        <div class="flex items-center justify-center gap-4">
          <Button
            @click="navigate('login')"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all text-lg"
          >
            Start Now
            <ArrowRight class="ml-2 h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            class="border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-6 rounded-lg text-lg"
          >
            Learn More
          </Button>
        </div>
      </div>

      <!-- FEATURES -->
      <div class="mb-20">
        <h2 class="text-3xl text-center text-gray-900 mb-4">Key Features</h2>
        <p class="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Clyr provides essential features to support your personal recovery journey
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            v-for="(feature, index) in features"
            :key="index"
            class="bg-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <CardContent class="pt-6">
              <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <component :is="feature.icon" class="h-6 w-6 text-indigo-600" />
              </div>
              <h3 class="text-xl text-gray-900 mb-2">{{ feature.title }}</h3>
              <p class="text-gray-600">{{ feature.description }}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- CTA -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white shadow-xl">
        <h2 class="text-3xl mb-4 font-semibold">Ready to Begin Your Recovery Journey?</h2>
        <p class="text-xl mb-8 text-indigo-100">
          Join thousands of users who have already experienced the benefits of Clyr
        </p>
        <Button
          variant="light"
          size="lg"
          class="bg-white text-indigo-600 hover:bg-gray-100 shadow-lg font-semibold px-8 py-4 transition-transform hover:-translate-y-0.5"
          @click="navigate('register')"
        >
          Sign Up for Free
        </Button>
      </div>
    </section>

    <!-- FOOTER KOMPONEN -->
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { ref } from 'vue'
import { Heart, Shield, BookOpen, Users, CheckCircle, TrendingUp, ArrowRight } from 'lucide-vue-next'
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import CardContent from '@/components/CardContent.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = ref([
  { icon: Heart, title: 'Emotional Support', description: 'Daily support to maintain emotional and mental balance' },
  { icon: CheckCircle, title: 'Daily Check-in', description: 'Track your mood and recovery progress easily' },
  { icon: BookOpen, title: 'Reflection Journal', description: 'Document your personal journey and reflections' },
  { icon: TrendingUp, title: 'Progress Tracking', description: 'Monitor your achievements and growth over time' },
  { icon: Shield, title: 'Emergency Support', description: 'Access coping strategies when you need them most' },
  { icon: Users, title: 'Supportive Community', description: 'Be part of a caring community that grows together' },
])

const navigate = (page) => {
  router.push(`/${page}`)
}
</script>
