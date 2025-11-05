<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <h2>Offboarding Tasks</h2>
        <p class="panel-subtitle">Monitor and update offboarding tasks for departing employees.</p>
      </div>
      <div class="flex gap-2">
        <input v-model="filters.userId" type="number" placeholder="Employee ID" class="rounded-md border border-slate-300 px-2 py-1 text-sm" />
        <input v-model="filters.status" placeholder="Status (comma-separated)" class="rounded-md border border-slate-300 px-2 py-1 text-sm" />
        <button class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500" type="button" @click="fetchTasks">Filter</button>
      </div>
    </header>

    <div v-if="loading" class="p-4 text-center text-slate-500">Loading tasks…</div>
    <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Task ID</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Employee</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Assignee Role</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Description</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Due Date</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
            <th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="task in tasks" :key="task.id">
            <td class="px-3 py-2 text-sm text-slate-700">{{ task.id }}</td>
            <td class="px-3 py-2 text-sm text-slate-700">{{ task.user_id }}</td>
            <td class="px-3 py-2 text-sm text-slate-700 capitalize">{{ task.assignee_role }}</td>
            <td class="px-3 py-2 text-sm text-slate-700">{{ task.description }}</td>
            <td class="px-3 py-2 text-sm text-slate-700">{{ task.due_date || '—' }}</td>
            <td class="px-3 py-2 text-sm text-slate-700 capitalize">{{ task.status }}</td>
            <td class="px-3 py-2 text-sm text-slate-700">
              <select v-model="taskUpdates[task.id]" class="rounded-md border border-slate-300 px-2 py-1 text-sm">
                <option disabled value="">Change status…</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button v-if="taskUpdates[task.id]" class="ml-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500" @click="updateStatus(task)">Save</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!tasks.length" class="p-4 text-center text-slate-500">No offboarding tasks found.</p>
    </div>
  </section>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HrOffboarding',
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
      tasks: [],
      taskUpdates: {},
      filters: {
        userId: '',
        status: '',
      },
    }
  },
  mounted() {
    this.fetchTasks()
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('authToken')
      return token ? { 'Authentication-Token': token } : {}
    },
    async fetchTasks() {
      this.loading = true
      this.error = null
      const params = {}
      if (this.filters.userId) params.user_id = this.filters.userId
      if (this.filters.status) params.status = this.filters.status
      try {
        const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api'}/offboarding/tasks`, {
          headers: this.getAuthHeaders(),
          params,
        })
        this.tasks = res.data.tasks || []
        // reset updates
        this.taskUpdates = {}
      } catch (err) {
        this.error = err?.response?.data?.error || err.message || 'Failed to load tasks'
      } finally {
        this.loading = false
      }
    },
    async updateStatus(task) {
      const newStatus = this.taskUpdates[task.id]
      if (!newStatus) return
      try {
        await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api'}/offboarding/tasks/${task.id}`,
          { status: newStatus },
          { headers: this.getAuthHeaders() },
        )
        this.context.showToast?.('Task updated', 'success')
        await this.fetchTasks()
      } catch (err) {
        this.context.showToast?.(err?.response?.data?.error || err.message || 'Failed to update task', 'error')
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
</style>