<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6">
    <div class="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-100">

      <h1 class="text-3xl font-bold text-gray-900 mb-6 text-center">
        Set New <span class="text-indigo-600">Password</span>
      </h1>

      <form class="space-y-4" @submit.prevent="handlePasswordReset">
        <div>
          <label class="text-sm text-gray-600">New Password</label>
          <input
            v-model="newPassword"
            type="password"
            class="w-full mt-1 px-4 py-3 border rounded-lg"
          />
        </div>

        <div>
          <label class="text-sm text-gray-600">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="w-full mt-1 px-4 py-3 border rounded-lg"
          />
        </div>

        <Button class="w-full bg-indigo-600 text-white py-3">
          Update Password
        </Button>
      </form>

      <p class="text-sm text-gray-500 mt-6 text-center">
        Back to
        <router-link to="/login" class="text-indigo-600 hover:underline">
          Sign In
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { supabase } from "@/lib/supabase"
import { useRouter } from "vue-router"
import Button from "@/components/Button.vue"

const router = useRouter()

const newPassword = ref("")
const confirmPassword = ref("")

const handlePasswordReset = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    alert("Please fill in both fields.")
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    alert("Passwords do not match.")
    return
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword.value
  })

  if (error) {
    alert(error.message)
    return
  }

  alert("Password updated successfully. Please sign in again.")
  await supabase.auth.signOut()
  router.push("/login")
}
</script>
