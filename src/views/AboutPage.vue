<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
    <!-- NAVBAR -->
    <Navbar />

    <main class="flex-1 container mx-auto px-6 py-12">
      <!-- Hero Section -->
      <section class="text-center mb-16 max-w-4xl mx-auto">
        <h1 class="text-5xl text-gray-900 mb-6">
          About <span class="text-indigo-600">CLYR</span>
        </h1>
        <p class="text-xl text-gray-600 leading-relaxed mb-8">
          <span class="text-indigo-600">CLYR</span> (Clear Life, Your Recovery) is a digital platform
          dedicated to helping individuals on their recovery journey from pornography addiction.
          We believe everyone deserves a clear, healthy, and meaningful life.
        </p>
      </section>

      <!-- Mission & Vision -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card class="shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-0">
          <CardContent class="pt-8 pb-8">
            <div class="flex items-center gap-3 mb-4">
              <Target class="h-8 w-8" />
              <h2 class="text-3xl">Our Mission</h2>
            </div>
            <p class="text-indigo-100 text-lg leading-relaxed">
              To provide a safe, supportive, and effective platform that helps individuals
              overcome addiction through technology, community, and evidence-based methods.
            </p>
          </CardContent>
        </Card>

        <Card class="shadow-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0">
          <CardContent class="pt-8 pb-8">
            <div class="flex items-center gap-3 mb-4">
              <TrendingUp class="h-8 w-8" />
              <h2 class="text-3xl">Our Vision</h2>
            </div>
            <p class="text-purple-100 text-lg leading-relaxed">
              To become the most trusted and accessible recovery platform that creates a positive
              impact on thousands of lives.
            </p>
          </CardContent>
        </Card>
      </section>

      <!-- Statistics -->
      <section class="mb-16">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card
            v-for="(stat, index) in stats"
            :key="index"
            class="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <CardContent class="pt-8 pb-8 text-center">
              <div class="text-4xl text-indigo-600 mb-2">{{ stat.number }}</div>
              <div class="text-gray-600">{{ stat.label }}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Our Values -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-4xl text-gray-900 mb-4">
            Our <span class="text-indigo-600">Values</span>
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            The principles that guide every decision and feature we build.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            v-for="(value, index) in values"
            :key="index"
            class="shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CardContent class="pt-8 pb-8">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <component :is="value.icon" class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 class="text-xl text-gray-800 mb-2">{{ value.title }}</h3>
                  <p class="text-gray-600">{{ value.description }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Timeline -->
      <section class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-4xl text-gray-900 mb-4">
            The <span class="text-indigo-600">CLYR</span> Journey
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            From an idea to a platform that supports thousands of people
          </p>
        </div>

        <div class="relative max-w-4xl mx-auto">
          <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200 transform -translate-x-1/2" />
          <div class="space-y-12">
            <div
              v-for="(item, index) in timeline"
              :key="index"
              class="relative flex items-center"
              :class="index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'"
            >
              <div class="hidden md:block absolute left-1/2 w-4 h-4 bg-indigo-600 rounded-full transform -translate-x-1/2 ring-4 ring-white z-10" />
              <div class="w-full md:w-5/12" :class="index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'">
                <Card class="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent class="pt-6 pb-6">
                    <div class="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm mb-3">
                      {{ item.year }}
                    </div>
                    <h3 class="text-xl text-gray-800 mb-2">{{ item.title }}</h3>
                    <p class="text-gray-600">{{ item.description }}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="text-center">
        <Card class="shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 max-w-2xl mx-auto">
          <CardContent class="pt-12 pb-12">
            <h2 class="text-3xl mb-4">Join CLYR Today</h2>
            <p class="text-indigo-100 mb-8 text-lg">
              Start your recovery journey with thousands who already trust CLYR
            </p>
            <Button
                variant="light"
                size="lg"
                class="bg-white text-indigo-600 hover:bg-gray-100 shadow-lg font-semibold px-8 py-4 transition-transform hover:-translate-y-0.5"
                @click="navigate('register')"
                >
                Get Started for Free
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>

    <!-- FOOTER -->
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Card from '@/components/Card.vue'
import CardContent from '@/components/CardContent.vue'
import Button from '@/components/Button.vue'
import { Target, Heart, Users, Shield, Lightbulb, TrendingUp } from 'lucide-vue-next'

const navigate = (page) => console.log('Navigate to:', page)

const values = [
  { icon: Heart, title: 'Empathy & Support', description: 'We understand that everyone’s struggle is unique. CLYR was built with empathy and without judgment.' },
  { icon: Shield, title: 'Privacy & Security', description: 'Your data is our top priority. All information is encrypted and safely stored.' },
  { icon: Lightbulb, title: 'Evidence-Based', description: 'We use research-backed and proven methods for addiction recovery.' },
  { icon: Users, title: 'Community-Driven', description: 'Built with and for the community. Every feedback helps us improve.' },
]

const timeline = [
  { year: '2024', title: 'Idea & Research', description: 'CLYR began from a real need for an accessible and holistic recovery platform.' },
  { year: '2025', title: 'Development', description: 'The team started building core features with a focus on user experience and effectiveness.' },
  { year: 'Q1 2025', title: 'Beta Launch', description: 'Launched beta for early adopters and gathered community feedback.' },
  { year: 'Q2 2025', title: 'Full Launch', description: 'Official launch with full features and ready to help thousands.' },
]

const stats = [
  { number: '1000+', label: 'Active Users' },
  { number: '5000+', label: 'Daily Check-ins' },
  { number: '95%', label: 'Satisfaction Rate' },
  { number: '24/7', label: 'Support Available' },
]
</script>
