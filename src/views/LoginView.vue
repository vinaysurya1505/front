<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BrandLogo from '@/components/BrandLogo.vue'
import db from '@/services/db'

const router = useRouter()

const email = ref('')
const password = ref('')
const selectedRole = ref('');
const availableRoles = [
  { label: 'HR (Super Admin)', value: 'super_admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Employee', value: 'employee' }
];
const errorMessage = ref('')
const isLoading = ref(false)

const findUserByEmail = (emailValue) => {
  if (!emailValue) return null
  const normalized = String(emailValue).trim().toLowerCase()
  return db.users.find(u => String(u.email).toLowerCase() === normalized) || null
}

const handleLogin = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in email and password.'
    return
  }
  if (!selectedRole.value) {
    errorMessage.value = 'Please select a role from the dropdown.'
    return
  }

  isLoading.value = true

  try {
    // Mock authentication: match by email only; accept any password
    const user = findUserByEmail(email.value)
    if (!user) {
      errorMessage.value = 'No user found for this email.'
      return
    }

    const roles = Array.isArray(user.roles) ? user.roles : []
    const isSuperAdmin = roles.includes('super_admin')
    const isManager = user.employment_role === 'manager' && !isSuperAdmin
    const isEmployee = user.employment_role === 'employee' && !isSuperAdmin
    const roleMap = {
      super_admin: 'HrDashboard',
      manager: 'ManagerDashboard',
      employee: 'EmployeeDashboard'
    }
    // Role check logic
    if (isSuperAdmin) {
      // Allow to log in as any role
      if (!selectedRole.value || !roleMap[selectedRole.value]) {
        errorMessage.value = 'Select a valid role.'
        return
      }
    } else if (
      (isManager && selectedRole.value !== 'manager') ||
      (isEmployee && selectedRole.value !== 'employee')
    ) {
      errorMessage.value = 'You are only permitted to log in as your designated role.'
      return
    } else if (!isManager && !isEmployee && !isSuperAdmin) {
      errorMessage.value = 'Your account does not have permission for this role.'
      return
    }

    const token = 'demo-token-' + user.id

    try {
      localStorage.setItem('currentUser', JSON.stringify(user))
      localStorage.setItem('authToken', token)
      axios.defaults.headers.common['Authentication-Token'] = token
    } catch (storageError) {
      console.warn('Unable to cache user details locally', storageError)
    }

    router.push({ name: roleMap[selectedRole.value] })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <BrandLogo size="md" stacked />
      <h2 class="login-title">Sign in to Alveon HR</h2>

      <form class="login-form" @submit.prevent="handleLogin">
        <label class="input-group">
          <span>Email</span>
          <input v-model="email" type="email" placeholder="superadmin@example.com | admin1@example.com | manager01@techcorp.com | employee01@techcorp.com" required />
        </label>

        <label class="input-group">
          <span>Password</span>
          <input v-model="password" type="password" placeholder="Enter password" required />
        </label>

        <label class="input-group">
          <span>Role</span>
          <select v-model="selectedRole" required>
            <option value="">Select role</option>
            <option v-for="r in availableRoles" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </label>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <div class="actions-row">
          <router-link class="ghost-btn" :to="{ name: 'HomePage' }">Back to Home</router-link>
          <button class="submit-btn" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Logging in…' : 'Login' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(140deg, #f8fafc 0%, #e0e7ff 40%, #cbd5f5 100%);
  padding: 24px;
}

.login-card {
  width: min(380px, 100%);
  background: #fff;
  border-radius: 24px;
  padding: 36px 32px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.login-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  font-size: 0.9rem;
  color: #475569;
}

.input-group input {
  width: 100%;
  border-radius: 14px;
  border: 1px solid #cbd5f5;
  padding: 12px 14px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.error-text {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: -4px;
}

.submit-btn {
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 12px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(79, 70, 229, 0.25);
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.actions-row {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid #cbd5f5;
  background: #fff;
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.ghost-btn:hover {
  background: #f8fafc;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
}
</style>
