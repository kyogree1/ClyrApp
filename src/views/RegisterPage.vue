<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6">
    <div class="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md text-center">
      <h1 class="text-3xl font-bold text-indigo-600 mb-6">Create Your Account</h1>
      <p class="text-gray-600 mb-8">
        Join <strong>Clyr</strong> today and begin your journey to recovery and emotional balance.
      </p>

      <form class="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="email"
          placeholder="Email Address"
          class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        <Button
          class="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-lg text-lg font-semibold"
        >
          Sign Up
        </Button>
      </form>

      <p class="text-sm text-gray-500 mt-6">
        Already have an account?
        <router-link to="/login" class="text-indigo-600 hover:underline">Log In</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import Button from '@/components/Button.vue'
</script>
