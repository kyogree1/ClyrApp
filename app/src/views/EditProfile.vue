<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
    <Navbar />

    <main class="flex-1 container mx-auto px-6 py-12 max-w-xl">

      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
        Edit Profile
      </h1>

      <Card class="shadow-xl bg-white/90 backdrop-blur-sm p-8 space-y-6">

        <!-- AVATAR PREVIEW -->
        <div class="flex flex-col items-center">
          <img
            v-if="previewAvatar || form.avatar_url"
            :src="previewAvatar || form.avatar_url"
            class="w-32 h-32 rounded-full object-cover shadow"
          />
          <div
            v-else
            class="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center shadow"
          >
            <User class="w-14 h-14 text-indigo-600" />
          </div>

          <label
            class="mt-4 cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Change Photo
            <input type="file" class="hidden" accept="image/*" @change="selectAvatar" />
          </label>
        </div>

        <!-- INPUT NAME -->
        <div class="space-y-2">
          <Label>Full Name</Label>
          <Input v-model="form.name" />
        </div>

        <!-- INPUT EMAIL -->
        <div class="space-y-2">
          <Label>Email</Label>
          <Input v-model="form.email" />
        </div>

        <!-- ACTION BUTTONS -->
        <div class="flex justify-between mt-6">
          <Button
            class="bg-gray-200 text-gray-800 hover:bg-gray-300"
            @click="router.push('/profile')"
          >
            Cancel
          </Button>

          <Button
            class="bg-indigo-600 text-white hover:bg-indigo-700"
            @click="save"
            :disabled="loading"
          >
            <span v-if="loading">Saving...</span>
            <span v-else>Save Changes</span>
          </Button>
        </div>
      </Card>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Label from '@/components/Label.vue'
import Input from '@/components/Input.vue'
import { User } from 'lucide-vue-next'

const router = useRouter()
const loading = ref(false)

// Form state
const form = reactive({
  name: '',
  email: '',
  avatar_url: ''
})

const previewAvatar = ref(null)
let selectedAvatarFile = null

// Load user data
onMounted(async () => {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return router.push('/login')

  form.email = authUser.email

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single()

  form.name = profile?.full_name || ''
  form.avatar_url = profile?.avatar_url || ''
})

// 1. Select avatar & show preview
function selectAvatar(e) {
  const file = e.target.files[0]
  if (!file) return

  selectedAvatarFile = file
  previewAvatar.value = URL.createObjectURL(file)
}

// 2. Save Everything
async function save() {
  loading.value = true

  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Update email
  const { error: emailErr } = await supabase.auth.updateUser({
    email: form.email
  })
  if (emailErr) {
    alert("Failed to update email: " + emailErr.message)
    loading.value = false
    return
  }

  // Upload avatar if selected
  let avatarUrl = form.avatar_url
  if (selectedAvatarFile) {
    const ext = selectedAvatarFile.name.split('.').pop()
    const filePath = `avatar-${authUser.id}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('avatar')
      .upload(filePath, selectedAvatarFile, { upsert: true })

    if (uploadErr) {
      alert("Failed to upload avatar: " + uploadErr.message)
      loading.value = false
      return
    }

    const { data: urlData } = supabase.storage
      .from('avatar')
      .getPublicUrl(filePath)

    avatarUrl = urlData.publicUrl
  }

  // Update profile table
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({
      full_name: form.name,
      avatar_url: avatarUrl,
      updated_at: new Date()
    })
    .eq('id', authUser.id)

  if (profileErr) {
    alert("Failed to update profile: " + profileErr.message)
    loading.value = false
    return
  }

  loading.value = false
  router.push('/profile')
}
</script>
