<script setup>
import { ref } from 'vue'
import axios from 'axios'

// Reactive form fields
const email = ref('')
const password = ref('')
const first_name = ref('')
const last_name = ref('')
const phone = ref('')
const address = ref('')
const organization = ref('')
const employee_id = ref('')
const job_title = ref('')
const department = ref('')
const team_number = ref('')
const role = ref('employee')
const hire_date = ref('')
const birth_date = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

// Flask backend URL
const API_URL = 'http://127.0.0.1:5000/api/register'

const handleSignup = () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in email and password.'
    return
  }

  isLoading.value = true

  axios.post(API_URL, {
    email: email.value,
    password: password.value,
    first_name: first_name.value,
    last_name: last_name.value,
    phone: phone.value,
    address: address.value,
    organization: organization.value,
    employee_id: employee_id.value,
    job_title: job_title.value,
    department: department.value,
    team_number: team_number.value || null,
    employment_role: role.value,
    hire_date: hire_date.value || null,
    birth_date: birth_date.value || null,
  }, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  })
  .then((response) => {
    console.log('Signup successful:', response.data)
    successMessage.value = 'Registration successful! You can now log in.'
    // Clear the form
    email.value = ''
    password.value = ''
    first_name.value = ''
    last_name.value = ''
    phone.value = ''
    address.value = ''
    organization.value = ''
    employee_id.value = ''
    job_title.value = ''
    department.value = ''
    team_number.value = ''
    role.value = 'employee'
    hire_date.value = ''
    birth_date.value = ''
  })
  .catch((error) => {
    console.error('Signup failed:', error)
    errorMessage.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Registration failed.'
  })
  .finally(() => {
    isLoading.value = false
  })
}
</script>

<template>
  <div class="register-wrapper">
    <div class="register-card">
      <h2 class="register-title">Create your Alveon HR account</h2>

      <form class="register-form" @submit.prevent="handleSignup">
        <label class="input-group">
          <span>Email</span>
          <input v-model="email" type="email" placeholder="Enter email" required />
        </label>

        <div class="row">
          <label class="input-group">
            <span>First name</span>
            <input v-model="first_name" type="text" placeholder="First name" />
          </label>
          <label class="input-group">
            <span>Last name</span>
            <input v-model="last_name" type="text" placeholder="Last name" />
          </label>
        </div>

        <div class="row">
          <label class="input-group">
            <span>Phone</span>
            <input v-model="phone" type="text" placeholder="Phone number" />
          </label>
          <label class="input-group">
            <span>Address</span>
            <input v-model="address" type="text" placeholder="Address" />
          </label>
        </div>

        <label class="input-group">
          <span>Organization</span>
          <input v-model="organization" type="text" placeholder="Organization" />
        </label>

        <div class="row">
          <label class="input-group">
            <span>Employee ID</span>
            <input v-model="employee_id" type="text" placeholder="Employee ID" />
          </label>
          <label class="input-group">
            <span>Job title</span>
            <input v-model="job_title" type="text" placeholder="Job title" />
          </label>
        </div>

        <div class="row">
          <label class="input-group">
            <span>Department</span>
            <input v-model="department" type="text" placeholder="Department" />
          </label>
          <label class="input-group">
            <span>Team number</span>
            <input v-model="team_number" type="text" placeholder="Team #" />
          </label>
        </div>

        <label class="input-group">
          <span>Role</span>
          <select v-model="role">
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
        </label>

        <div class="row">
          <label class="input-group">
            <span>Hire date</span>
            <input v-model="hire_date" type="date" />
          </label>
          <label class="input-group">
            <span>Birth date</span>
            <input v-model="birth_date" type="date" />
          </label>
        </div>

        <label class="input-group">
          <span>Password</span>
          <input v-model="password" type="password" placeholder="Enter password" required />
        </label>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

        <div class="actions-row">
          <router-link class="ghost-btn" :to="{ name: 'HomePage' }">Back to Home</router-link>
          <button class="submit-btn" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Signing up…' : 'Sign Up' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(140deg, #f8fafc 0%, #e0e7ff 40%, #cbd5f5 100%);
  padding: 24px;
}

.register-card {
  width: min(760px, 100%);
  background: #fff;
  border-radius: 24px;
  padding: 28px 24px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.register-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.02em;
  text-align: center;
}

.register-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  font-size: 0.9rem;
  color: #475569;
}

.input-group input,
.input-group select {
  width: 100%;
  border-radius: 14px;
  border: 1px solid #cbd5f5;
  padding: 12px 14px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.error-text {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: -4px;
}

.success-text {
  color: #059669;
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

@media (max-width: 720px) {
  .row {
    grid-template-columns: 1fr;
  }
  .register-card {
    padding: 24px 18px;
  }
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
