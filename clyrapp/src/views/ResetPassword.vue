<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6">
    <div class="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-10 w-full max-w-md text-center border border-gray-100">

      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        Reset Your <span class="text-indigo-600">Password</span>
      </h1>

      <form class="space-y-4" @submit.prevent="handlePasswordReset">

        <!-- NEW PASSWORD -->
        <div class="text-left">
          <label class="text-sm text-gray-600">New Password</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="New password"
            class="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        <!-- CONFIRM -->
        <div class="text-left">
          <label class="text-sm text-gray-600">Confirm New Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Repeat new password"
            class="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        <Button
          type="submit"
          class="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-lg text-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Reset Password
        </Button>

      </form>

      <p class="text-sm text-gray-500 mt-6">
        Back to 
        <router-link to="/login" class="text-indigo-600 hover:underline font-medium">Sign In</router-link>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { supabase } from "@/lib/supabase"
import Button from "@/components/Button.vue"
import { useRouter } from "vue-router"

const router = useRouter()

const newPassword = ref("")
const confirmPassword = ref("")

const handlePasswordReset = async () => {
  try {
    if (!newPassword.value || !confirmPassword.value) {
      alert("Please fill in both fields.")
      return
    }

    if (newPassword.value !== confirmPassword.value) {
      alert("Passwords do not match.")
      return
    }

    // Cek session Supabase (harus ada recovery token)
    const sessionRes = await supabase.auth.getSession()
    console.log("SESSION NOW:", sessionRes)

    if (!sessionRes.data.session) {
      throw new Error("Invalid session. Please open this page from the password reset email.")
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    })

    if (error) throw error

    alert("Your password has been updated!")
    router.push("/login")

  } catch (err) {
    console.error("RESET ERROR:", err)
    alert(err.message)
  }
}
</script>
