<template>
  <Dialog v-model="internalValue" maxWidth="2xl">
    <DialogContent class="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-2xl text-indigo-600 font-semibold">
          Tambah Jurnal Baru
        </DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleAdd" class="space-y-6">
        <!-- Judul -->
        <div class="space-y-2">
          <Label>Judul Jurnal</Label>
          <Input
            v-model="title"
            placeholder="Berikan judul untuk jurnal Anda..."
            required
          />
        </div>

        <!-- Isi -->
        <div class="space-y-2">
          <Label>Isi Jurnal</Label>
          <Textarea
            v-model="content"
            placeholder="Tuliskan refleksi, perasaan, atau pencapaian Anda hari ini..."
            required
          />
        </div>

        <!-- Mood -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label class="text-gray-700">Mood Anda Hari Ini (0–5)</Label>
            <span class="text-2xl text-indigo-600 font-semibold">{{ mood }}</span>
          </div>
          <input type="range" min="0" max="5" v-model="mood" class="w-full accent-indigo-600" />
          <div class="flex justify-between text-sm text-gray-500">
            <span>Sangat Buruk</span>
            <span>Netral</span>
            <span>Sangat Baik</span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="closeDialog" class="border-gray-300 text-gray-700 hover:bg-gray-50">
            Batal
          </Button>
          <Button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white">
            Simpan Jurnal
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import Dialog from '@/components/Dialog.vue'
import DialogContent from '@/components/DialogContent.vue'
import DialogHeader from '@/components/DialogHeader.vue'
import DialogTitle from '@/components/DialogTitle.vue'
import DialogFooter from '@/components/DialogFooter.vue'
import Input from '@/components/Input.vue'
import Textarea from '@/components/Textarea.vue'
import Label from '@/components/Label.vue'
import Button from '@/components/Button.vue'

// props dan emits
const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'add'])

// internal reactive state sinkron dengan v-model parent
const internalValue = ref(props.modelValue)
watch(() => props.modelValue, val => internalValue.value = val)
watch(internalValue, val => emit('update:modelValue', val))

// data input
const title = ref('')
const content = ref('')
const mood = ref(3)

// fungsi tambah jurnal
function handleAdd() {
  console.log('🟢 handleAdd dipanggil')
  console.log('📝 title:', title.value, '| content:', content.value, '| mood:', mood.value)

  if (!title.value.trim() || !content.value.trim()) {
    console.warn('⚠️ Field kosong, tidak menambah jurnal')
    return
  }

  const entry = {
    id: Date.now(),
    title: title.value.trim(),
    content: content.value.trim(),
    date: new Date(),
    mood: mood.value,
  }

  console.log('📤 Emit add:', entry)
  emit('add', entry)
  closeDialog()
}

function closeDialog() {
  internalValue.value = false
  emit('update:modelValue', false)
  title.value = ''
  content.value = ''
  mood.value = 3
}
</script>
