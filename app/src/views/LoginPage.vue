<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6">
    <!-- HEADER -->
    <div class="absolute top-6 left-8 text-2xl text-indigo-600 font-semibold tracking-wider">
      Clyr
    </div>

    <!-- CARD -->
    <div class="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-10 w-full max-w-md text-center border border-gray-100">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">
        Welcome Back to <span class="text-indigo-600">Clyr</span>
      </h1>
      <p class="text-gray-500 text-sm mb-8">
        Continue your journey toward clarity and recovery.  
        Sign in to track progress and emotional balance.
      </p>

      <!-- FORM -->
      <form class="space-y-4" @submit.prevent="handleSignIn">
        <div class="text-left">
          <label class="text-sm text-gray-600">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        <div class="text-left">
          <label class="text-sm text-gray-600">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        <!-- RESET PASSWORD LINK -->
        <router-link
          to="/forgot-password"
          class="text-sm text-indigo-600 hover:underline"
        >
          Forgot password?
        </router-link>


        <Button
          type="submit"
          class="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-lg text-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Sign In
        </Button>
      </form>

      <p class="text-sm text-gray-500 mt-6">
        Don’t have an account?
        <router-link to="/register" class="text-indigo-600 hover:underline font-medium">
          Sign Up
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/Button.vue'
import { useUI } from '@/store/ui'
import { useAuth } from '@/store/auth'

const router = useRouter()

const email = ref('')
const password = ref('')

const { signIn } = useAuth()
const { startLoading, stopLoading } = useUI()

const handleSignIn = async () => {
  try {
    startLoading()
    await signIn(email.value, password.value)
    router.push('/dashboard')
  } catch (error) {
    alert(error.message)
  } finally {
    stopLoading()
  }
}
</script>

