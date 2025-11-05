<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <h2>Letter Templates</h2>
        <p class="panel-subtitle">Create and manage letter templates for offers, experiences and relieving letters.</p>
      </div>
      <button class="link-btn" type="button" @click="openNewTemplate">Add Template</button>
    </header>

    <div v-if="loading" class="p-4 text-center text-slate-500">Loading templates…</div>
    <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>
    <div v-else class="space-y-6">
      <!-- Template form -->
      <div v-if="showForm" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">{{ isEditing ? 'Edit Template' : 'Add Template' }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Name</label>
            <input v-model="form.name" type="text" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Description</label>
            <input v-model="form.description" type="text" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Content</label>
            <textarea v-model="form.content" rows="6" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            <p class="mt-1 text-xs text-slate-500">Use placeholders like <code>{first_name}</code>, <code>{last_name}</code>, <code>{full_name}</code>, <code>{job_title}</code>, <code>{hire_date}</code> to personalise letters.</p>
          </div>
        </div>
        <div class="mt-4 flex gap-3">
          <button class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500" type="button" @click="saveTemplate">Save</button>
          <button class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" type="button" @click="cancelForm">Cancel</button>
        </div>
      </div>

      <!-- List of templates -->
      <div v-if="templates.length" class="space-y-4">
        <div
          v-for="tpl in templates"
          :key="tpl.id"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h4 class="text-lg font-semibold text-slate-900">{{ tpl.name }}</h4>
              <p v-if="tpl.description" class="mt-1 text-sm text-slate-600">{{ tpl.description }}</p>
            </div>
            <div class="flex-shrink-0 space-x-2">
              <button class="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500" @click="generateForCurrentUser(tpl)">Generate</button>
              <button class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500" @click="editTemplate(tpl)">Edit</button>
              <button class="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500" @click="deleteTemplate(tpl)">Delete</button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="p-4 text-center text-slate-500">No templates found. Create one to get started.</p>
    </div>
  </section>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HrLetters',
  props: {
    context: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      error: null,
      templates: [],
      showForm: false,
      isEditing: false,
      form: {
        id: null,
        name: '',
        description: '',
        content: '',
      },
    }
  },
  mounted() {
    this.fetchTemplates()
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('authToken')
      return token ? { 'Authentication-Token': token } : {}
    },
    async fetchTemplates() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api'}/letters/templates`, {
          headers: this.getAuthHeaders(),
        })
        this.templates = res.data.templates || []
      } catch (err) {
        this.error = err?.response?.data?.error || err.message || 'Failed to load templates'
      } finally {
        this.loading = false
      }
    },
    openNewTemplate() {
      this.isEditing = false
      this.form = { id: null, name: '', description: '', content: '' }
      this.showForm = true
    },
    editTemplate(tpl) {
      this.isEditing = true
      this.form = { id: tpl.id, name: tpl.name, description: tpl.description || '', content: tpl.content }
      this.showForm = true
    },
    cancelForm() {
      this.showForm = false
      this.isEditing = false
    },
    async saveTemplate() {
      const { id, name, description, content } = this.form
      if (!name || !content) {
        this.context.showToast?.('Name and content are required', 'error')
        return
      }
      this.loading = true
      this.error = null
      try {
        if (this.isEditing) {
          await axios.patch(
            `${process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api'}/letters/templates/${id}`,
            { name, description, content },
            { headers: this.getAuthHeaders() },
          )
          this.context.showToast?.('Template updated', 'success')
        } else {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api'}/letters/templates`,
            { name, description, content },
            { headers: this.getAuthHeaders() },
          )
          this.context.showToast?.('Template created', 'success')
        }
        this.showForm = false
        await this.fetchTemplates()
      } catch (err) {
        this.error = err?.response?.data?.error || err.message || 'Failed to save template'
      } finally {
        this.loading = false
      }
    },
    async deleteTemplate(tpl) {
      if (!confirm(`Delete template "${tpl.name}"?`)) {
        return
      }
      this.loading = true
      this.error = null
      try {
        await axios.delete(
          `${process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api'}/letters/templates/${tpl.id}`,
          { headers: this.getAuthHeaders() },
        )
        this.context.showToast?.('Template deleted', 'success')
        await this.fetchTemplates()
      } catch (err) {
        this.error = err?.response?.data?.error || err.message || 'Failed to delete template'
      } finally {
        this.loading = false
      }
    },
    async generateForCurrentUser(tpl) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api'}/letters/generate`,
          { template_id: tpl.id },
          { headers: this.getAuthHeaders() },
        )
        const letter = res.data.letter
        // Provide download link to user
        const blob = new Blob([letter.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `letter_${letter.id}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        this.context.showToast?.('Letter generated', 'success')
      } catch (err) {
        this.error = err?.response?.data?.error || err.message || 'Failed to generate letter'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}
.panel-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.9rem;
}
.link-btn {
  border: none;
  background: none;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
}
</style>