<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6">
    <div class="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-100 text-center">

      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Forgot your <span class="text-indigo-600">password?</span>
      </h1>

      <p class="text-sm text-gray-500 mb-6">
        Enter your email and we’ll send you a password reset link.
      </p>

      <form class="space-y-4" @submit.prevent="sendResetEmail">

        <div class="text-left">
          <label class="text-sm text-gray-600">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        <Button
          class="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-lg text-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Send Reset Link
        </Button>

      </form>

      <p class="text-sm text-gray-500 mt-6">
        Back to
        <router-link to="/login" class="text-indigo-600 hover:underline font-medium">
          Sign In
        </router-link>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import Button from '@/components/Button.vue'

const email = ref('')

const sendResetEmail = async () => {
  if (!email.value) {
    alert("Please enter your email.")
    return
  }

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.value,
    {
      redirectTo: `${window.location.origin}/reset-password`
    }
  )

  if (error) {
    alert(error.message)
  } else {
    alert("If this email is registered, a reset link has been sent.")
  }
}
</script>