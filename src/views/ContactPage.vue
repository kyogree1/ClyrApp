<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
    <!-- NAVBAR -->
    <Navbar />

    <main class="flex-1 container mx-auto px-6 py-12">
      <!-- Hero Section -->
      <section class="text-center mb-16">
        <h1 class="text-5xl text-gray-900 mb-6">
          Contact <span class="text-indigo-600">Us</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          We’re here to help. Reach out to us with any questions, feedback, or if you need support.
        </p>
      </section>

      <!-- Contact Methods -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Card
          v-for="(method, index) in contactMethods"
          :key="index"
          class="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <CardContent class="pt-6 pb-6 text-center">
            <div
              class="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center"
              :class="`bg-gradient-to-r ${method.color}`"
            >
              <component :is="method.icon" class="h-6 w-6 text-white" />
            </div>
            <h3 class="text-gray-800 mb-2">{{ method.title }}</h3>
            <p class="text-indigo-600 mb-2 font-medium">{{ method.value }}</p>
            <p class="text-sm text-gray-600">{{ method.description }}</p>
          </CardContent>
        </Card>
      </section>

      <!-- Contact Form + Sidebar -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <!-- Contact Form -->
        <Card class="lg:col-span-2 shadow-xl">
          <CardHeader class="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle class="text-indigo-600 flex items-center gap-2">
              <Send class="h-5 w-5" />
              Send Message
            </CardTitle>
          </CardHeader>

          <CardContent class="pt-6">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label for="name">Name</Label>
                  <Input
                    id="name"
                    v-model="form.name"
                    placeholder="Your name"
                    required
                    class="mt-1"
                  />
                </div>
                <div>
                  <Label for="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    v-model="form.email"
                    placeholder="email@example.com"
                    required
                    class="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label for="subject">Subject</Label>
                <Input
                  id="subject"
                  v-model="form.subject"
                  placeholder="How can we help?"
                  required
                  class="mt-1"
                />
              </div>

              <div>
                <Label for="message">Message</Label>
                <Textarea
                  id="message"
                  v-model="form.message"
                  placeholder="Write your message here..."
                  rows="6"
                  required
                  class="mt-1"
                />
              </div>

              <Button
                type="submit"
                :disabled="isSubmitting"
                class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6"
              >
                {{ isSubmitting ? 'Sending...' : 'Send Message' }}
              </Button>
            </form>
          </CardContent>
        </Card>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Emergency -->
          <Card class="shadow-xl bg-gradient-to-br from-red-500 to-orange-500 text-white border-0">
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <AlertTriangle class="h-5 w-5" />
                Emergency Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-red-50 mb-4 text-sm">
                If you’re in crisis or need immediate help:
              </p>
              <div class="space-y-3">
                <div
                  v-for="(contact, index) in emergencyContacts"
                  :key="index"
                  class="bg-white/20 rounded-lg p-3"
                >
                  <h4 class="mb-1 font-semibold">{{ contact.name }}</h4>
                  <p class="text-xl mb-1">{{ contact.number }}</p>
                  <p class="text-xs text-red-50">{{ contact.description }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Support Hours -->
          <Card class="shadow-lg">
            <CardHeader class="border-b bg-gray-50">
              <CardTitle class="text-indigo-600 flex items-center gap-2 text-base">
                <Clock class="h-4 w-4" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-4 text-sm">
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">AI Assistant</span>
                  <span class="text-gray-900">24/7</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Email Support</span>
                  <span class="text-gray-900">24 hours</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Emergency Hotline</span>
                  <span class="text-gray-900">24/7</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Footer -->
      <Footer />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'
import CardContent from '@/components/CardContent.vue'
import CardHeader from '@/components/CardHeader.vue'
import CardTitle from '@/components/CardTitle.vue'
import Input from '@/components/Input.vue'
import Textarea from '@/components/Textarea.vue'
import Label from '@/components/Label.vue'
import { Mail, Phone, MapPin, MessageCircle, Send, AlertTriangle, Clock } from 'lucide-vue-next'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})
const isSubmitting = ref(false)

const handleSubmit = () => {
  isSubmitting.value = true
  setTimeout(() => {
    toast.success('Message sent! We will reply within 24 hours.')
    form.value = { name: '', email: '', subject: '', message: '' }
    isSubmitting.value = false
  }, 1500)
}

const contactMethods = [
  { icon: Mail, title: 'Email', value: 'support@clyr.app', description: 'We reply within 24 hours', color: 'from-blue-500 to-cyan-500' },
  { icon: Phone, title: 'Hotline', value: '1-800-CLYR', description: 'Available 24/7 for emergencies', color: 'from-green-500 to-emerald-500' },
  { icon: MessageCircle, title: 'Live Chat', value: 'AI Assistant', description: 'Chat instantly for quick help', color: 'from-purple-500 to-pink-500' },
  { icon: MapPin, title: 'Location', value: 'Jakarta, Indonesia', description: 'Headquarters & support team', color: 'from-orange-500 to-red-500' },
]

const emergencyContacts = [
  { name: 'Crisis Hotline', number: '119', description: 'National emergency line' },
  { name: 'Save Yourselves', number: '021-5638-7770', description: 'Crisis counseling' },
  { name: 'Into The Light', number: '021-788-42377', description: 'Mental health support' },
]
</script>
