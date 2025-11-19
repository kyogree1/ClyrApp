<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content -->
    <main class="flex-1 container mx-auto px-6 py-12">
      <!-- Hero -->
      <section class="text-center mb-16">
        <h1 class="text-5xl text-gray-900 mb-6">
          Complete <span class="text-indigo-600">Features</span> for Recovery
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          CLYR provides a variety of tools and features designed to support your recovery journey
          with technology, accountability, and compassion.
        </p>
      </section>

      <!-- Feature Cards -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <Card
          v-for="(feature, index) in features"
          :key="index"
          class="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <CardHeader>
            <div
              :class="['w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-r', feature.color]"
            >
              <component :is="feature.icon" class="h-6 w-6 text-white" />
            </div>
            <CardTitle class="text-gray-800">{{ feature.title }}</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-gray-600 mb-4">{{ feature.description }}</p>
            <ul class="space-y-2">
              <li
                v-for="(benefit, idx) in feature.benefits"
                :key="idx"
                class="flex items-center gap-2 text-sm text-gray-700"
              >
                <CheckCircle2 class="h-4 w-4 text-green-500 flex-shrink-0" />
                {{ benefit }}
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <!-- Recovery Journey -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-4xl text-gray-900 mb-4">
            Your <span class="text-indigo-600">Recovery Journey</span>
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Five stages of growth designed to guide your transformation
          </p>
        </div>

        <div class="relative">
          <div
            class="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200"
          />
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Card
              v-for="step in recoverySteps"
              :key="step.step"
              class="shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
            >
              <CardContent class="pt-6 text-center">
                <div
                  class="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg"
                >
                  <span class="text-2xl text-white font-semibold">{{ step.step }}</span>
                </div>
                <div
                  class="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center"
                >
                  <component :is="step.icon" class="h-6 w-6 text-indigo-600" />
                </div>
                <h3 class="text-gray-800 mb-2 font-medium">{{ step.title }}</h3>
                <p class="text-sm text-gray-600">{{ step.description }}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <!-- Why Choose CLYR -->
      <section
        class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 mb-16 text-white shadow-2xl"
      >
        <div class="max-w-4xl mx-auto">
          <h2 class="text-4xl mb-6 text-center">Why Choose CLYR?</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div v-for="item in whyChoose" :key="item.title" class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <component :is="item.icon" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl mb-2">{{ item.title }}</h3>
                <p class="text-indigo-100">{{ item.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="text-center">
        <Card
          class="shadow-2xl bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-200 max-w-2xl mx-auto"
        >
          <CardContent class="pt-12 pb-12">
            <h2 class="text-3xl text-gray-900 mb-4">Ready to Begin Your Recovery Journey?</h2>
            <p class="text-gray-600 mb-8 text-lg">
              Join thousands who have transformed their lives with CLYR
            </p>
            <div class="flex justify-center gap-4">
              <Button
                @click="$router.push('/login')"
                class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-lg"
              >
                Start Now – Free
              </Button>
              <Button
                @click="$router.push('/about')"
                variant="outline"
                class="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-6 text-lg rounded-lg"
              >
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { CheckCircle2, TrendingUp, Calendar, BookOpen, MessageCircle, Shield, Clock, Award, Target, Heart, AlertTriangle, Users, BarChart3, Lock } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import CardContent from '@/components/CardContent.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'

const features = [
  {
    icon: CheckCircle2,
    title: 'Daily Check-in',
    description: 'Start your day by checking in to track your mood and set intentions.',
    color: 'from-blue-500 to-cyan-500',
    benefits: ['Mood tracking', 'Daily goals', 'Morning reflection'],
  },
  {
    icon: Clock,
    title: 'Activity Monitoring',
    description: 'Real-time monitoring system for daily and weekly accountability.',
    color: 'from-purple-500 to-pink-500',
    benefits: ['Real-time timer', 'Alert system', 'Structured limits'],
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Visualize your progress with charts and motivational milestones.',
    color: 'from-green-500 to-emerald-500',
    benefits: ['7-day trend graph', 'Detailed stats', 'Milestone tracking'],
  },
  {
    icon: BookOpen,
    title: 'Reflection Journal',
    description: 'Document your thoughts and growth through daily journaling.',
    color: 'from-orange-500 to-red-500',
    benefits: ['Daily notes', 'Emotion tags', 'Search & filter'],
  },
  {
    icon: MessageCircle,
    title: 'AI Assistant',
    description: 'Get 24/7 support with CLYR’s AI recovery assistant.',
    color: 'from-indigo-500 to-purple-500',
    benefits: ['Instant response', 'Recovery tips', 'Crisis detection'],
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'Your data is fully encrypted and safe — always private.',
    color: 'from-gray-700 to-gray-900',
    benefits: ['Data encryption', 'Anonymous mode', 'Secure storage'],
  },
]

const recoverySteps = [
  { step: 1, title: 'Awareness', description: 'Recognize the issue and your desire to change.', icon: Target },
  { step: 2, title: 'Commitment', description: 'Commit to recovery and use the tools provided.', icon: Heart },
  { step: 3, title: 'Action', description: 'Take steps with monitoring, journaling, and reflection.', icon: TrendingUp },
  { step: 4, title: 'Consistency', description: 'Build sustainable healthy habits every day.', icon: Calendar },
  { step: 5, title: 'Growth', description: 'Become the best version of yourself.', icon: Award },
]

const whyChoose = [
  { title: 'Evidence-Based', text: 'Uses research-backed methods proven to help recovery.', icon: BarChart3 },
  { title: 'Community Support', text: 'Join a supportive, understanding community.', icon: Users },
  { title: '100% Private', text: 'Your data remains fully private and anonymous.', icon: Lock },
  { title: 'Holistic Approach', text: 'Focuses on mental, emotional, and spiritual wellness.', icon: Heart },
]
</script>
