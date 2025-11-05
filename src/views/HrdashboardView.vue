<template>
  <div class="hr-dashboard">
    <header class="dashboard-header">
      <div class="brand">
        <router-link class="brand-link" to="/hr/dashboard" aria-label="Alveon home">
          <BrandLogo size="sm" muted />
        </router-link>
        <div class="brand-copy">
          <h1>HR Dashboard</h1>
          <p class="tagline">Super admin control center</p>
        </div>
      </div>
      <nav class="nav-tabs">
        <button
          v-for="item in navItems"
          :key="item.value"
          class="tab"
          :class="{ active: activeTab === item.value }"
          type="button"
          @click="setActiveTab(item.value)"
        >
          {{ item.label }}
          <span v-if="item.badge && item.badge()" class="badge">{{ item.badge() }}</span>
        </button>
      </nav>
      <div class="header-actions">
        <div class="user-chip">
          <span class="initials">{{ initials }}</span>
          <div class="user-info">
            <span class="name">{{ displayName }}</span>
            <span class="role">{{ profileRole }}</span>
          </div>
        </div>
        <button class="logout-btn" type="button" @click="logout">Logout</button>
      </div>
    </header>

    <main class="dashboard-main">
      <section v-if="activeTab === 'overview'" class="panel">
        <div class="panel-header">
          <h2>Overview</h2>
          <form class="quick-search" @submit.prevent="onSearchSubmit">
            <label class="input-group" aria-label="Search by name or email">
              <span class="input-label">Name or Email</span>
              <input
                v-model="filters.query"
                class="input"
                type="search"
                placeholder="Search name or email"
              />
            </label>
            <label class="input-group" aria-label="Employee ID">
              <span class="input-label">Employee ID</span>
              <input
                v-model="filters.employee_id"
                class="input"
                type="text"
                placeholder="Employee ID"
              />
            </label>
            <label class="input-group" aria-label="Department">
              <span class="input-label">Department</span>
              <select v-model="filters.department" class="input">
                <option value="">Department</option>
                <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
              </select>
            </label>
            <label class="input-group" aria-label="Role">
              <span class="input-label">Role</span>
              <input
                v-model="filters.role"
                class="input"
                type="text"
                placeholder="Role"
              />
            </label>
            <label class="input-group" aria-label="Status">
              <span class="input-label">Status</span>
              <select v-model="filters.status" class="input">
                <option value="">Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On leave</option>
                <option value="offboarded">Offboarded</option>
              </select>
            </label>
            <button class="primary" type="submit" :disabled="loadingResults">
              {{ loadingResults ? 'Searching...' : 'Search' }}
            </button>
            <button class="ghost" type="button" @click="resetSearch">Reset</button>
          </form>
        </div>

        <div class="stats-grid">
          <article class="stat-card">
            <p>Total Results</p>
            <h3>{{ total }}</h3>
          </article>
          <article class="stat-card">
            <p>Active Employees</p>
            <h3>{{ statusCounts.active || 0 }}</h3>
          </article>
          <article class="stat-card">
            <p>Managers</p>
            <h3>{{ managerCount }}</h3>
          </article>
          <article class="stat-card">
            <p>Departments</p>
            <h3>{{ departments.length }}</h3>
          </article>
        </div>

        <div class="panel-body">
          <header class="table-head">
            <div>
              <h3>Employees</h3>
              <p class="meta">{{ showingLabel }}</p>
            </div>
            <div class="table-actions">
              <button class="ghost small" type="button" @click="prevPage" :disabled="page === 1">Prev</button>
              <span class="pager">Page {{ page }} / {{ totalPages }}</span>
              <button class="ghost small" type="button" @click="nextPage" :disabled="page === totalPages">Next</button>
            </div>
          </header>

          <div v-if="loadingResults" class="empty-state">Loading employees...</div>
          <div v-else-if="resultsError" class="empty-state error">{{ resultsError }}</div>
          <div v-else-if="!results.length" class="empty-state">No employees match your filters yet.</div>
          <div v-else class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="person in results" :key="person.id || person.employee_id">
                  <td>
                    <span class="main">{{ person.full_name || person.name || '-' }}</span>
                    <span class="sub">{{ person.email || 'No email' }}</span>
                  </td>
                  <td>{{ person.employee_id || '-' }}</td>
                  <td>{{ person.department || '-' }}</td>
                  <td>{{ person.role || person.employment_role || '-' }}</td>
                  <td>
                    <span :class="['status-pill', person.status || 'unknown']">
                      {{ (person.status || 'unknown').replace('_', ' ') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section v-else-if="activeTab === 'approvals'" class="panel">
        <div class="panel-header">
          <h2>Manager Leave Approvals</h2>
          <p class="subtitle">Review pending leave requests from managers.</p>
        </div>

        <div v-if="managerLoading" class="empty-state">Loading approvals...</div>
        <div v-else-if="!managerLeaves.length" class="empty-state">No pending approvals right now.</div>
        <ul v-else class="list">
          <li v-for="leave in managerLeaves" :key="leave.id" class="list-item">
            <div>
              <h3>{{ leave.manager_name }}</h3>
              <p>{{ leave.reason || 'No reason provided' }}</p>
              <span class="sub">Dates: {{ leave.date_range }}</span>
            </div>
            <div class="actions">
              <button
                class="ghost"
                type="button"
                :disabled="processingLeaves[leave.id] === 'reject'"
                @click="actOnManagerLeave(leave, 'reject')"
              >
                {{ processingLeaves[leave.id] === 'reject' ? 'Rejecting...' : 'Reject' }}
              </button>
              <button
                class="primary"
                type="button"
                :disabled="processingLeaves[leave.id] === 'approve'"
                @click="actOnManagerLeave(leave, 'approve')"
              >
                {{ processingLeaves[leave.id] === 'approve' ? 'Approving...' : 'Approve' }}
              </button>
            </div>
          </li>
        </ul>
      </section>

      <section v-else-if="activeTab === 'questions'" class="panel">
        <div class="panel-header">
          <h2>Escalated Questions</h2>
          <p class="subtitle">Respond to employee questions escalated to HR.</p>
        </div>

        <div v-if="questionsLoading" class="empty-state">Loading questions...</div>
        <template v-else>
          <div v-if="!questions.length" class="empty-state">No pending questions.</div>
          <div class="panel-header" style="margin-top:8px">
            <h3>Create a quick survey</h3>
            <div class="actions">
              <button class="ghost" type="button" @click="openSurveyModal">Create Survey</button>
            </div>
          </div>
          <ul v-if="questions.length" class="list">
            <li v-for="question in questions" :key="question.id" class="list-item">
              <div>
                <h3>{{ question.subject || 'Question' }}</h3>
                <p>{{ question.body || question.question || 'No description provided.' }}</p>
                <span class="sub">From: {{ question.asked_by || 'Unknown employee' }}</span>
              </div>
              <div class="actions">
                <button class="primary" type="button" @click="openAnswerModal(question)">Answer</button>
                <button class="ghost" type="button" @click="openSurveyModal">Create Survey</button>
              </div>
            </li>
          </ul>
        </template>
      </section>

      <section v-else-if="activeTab === 'resumes'" class="panel">
        <div class="panel-header">
          <h2>Resumes</h2>
          <p class="subtitle">Track resume extraction, matching quality, and overall pipeline health.</p>
        </div>

        <div class="resume-actions">
          <form class="upload-card" @submit.prevent="uploadResume">
            <h3>Upload Resume &amp; Extract</h3>
            <p class="helper">Drop a PDF, DOCX, or TXT file to add a new candidate profile.</p>
            <label class="file-input">
              <input ref="resumeFileInput" type="file" accept=".pdf,.doc,.docx,.txt" @change="handleResumeFile" />
            </label>
            <input v-model="resumeUploadSource" class="input" type="text" placeholder="Source (e.g., LinkedIn, Referral)" />
            <p v-if="resumeUploadError" class="error-text">{{ resumeUploadError }}</p>
            <button class="primary" type="submit" :disabled="resumeUploading">
              {{ resumeUploading ? 'Processing...' : 'Upload & Extract' }}
            </button>
          </form>

          <div class="upload-card">
            <h3>Match Candidates to JD</h3>
            <p class="helper">Run AI matching against saved candidate profiles.</p>
            <select v-model.number="selectedJobDescriptionId" class="input">
              <option value="">Select job description</option>
              <option v-for="jd in jobDescriptions" :key="jd.id" :value="jd.id">
                {{ jd.title }}{{ jd.department ? ' - ' + jd.department : '' }}
              </option>
            </select>
            <input v-model.number="matchTopN" class="input" type="number" min="1" max="25" placeholder="Top candidates to return" />
            <p class="helper muted" v-if="!jobDescriptions.length">Add a job description in the JD Maker tab.</p>
            <p v-if="matchError" class="error-text">{{ matchError }}</p>
            <button class="primary" type="button" :disabled="matching || !jobDescriptions.length" @click="runMatching">
              {{ matching ? 'Matching...' : 'Match Candidates' }}
            </button>
          </div>
        </div>

        <div v-if="matchResults.length" class="match-results">
          <div class="match-header">
            <div>
              <h3>Top Matches</h3>
              <p class="helper">
                Job: {{ matchedJob?.title }}
                <span v-if="matchedJob?.department">({{ matchedJob.department }})</span>
              </p>
            </div>
            <button class="ghost small" type="button" @click="clearMatchResults">Clear</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Experience (yrs)</th>
                  <th>Score</th>
                  <th>Reasoning</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in matchResults" :key="item.candidate.id">
                  <td>
                    <span class="main">{{ item.candidate.full_name || item.candidate.name || item.candidate.email }}</span>
                    <span class="sub">{{ item.candidate.email }}</span>
                  </td>
                  <td>{{ item.candidate.current_role || '-' }}</td>
                  <td>{{ item.candidate.total_experience ?? '-' }}</td>
                  <td><span class="score-pill">{{ formatMatchScore(item.match_score) }}</span></td>
                  <td>{{ item.reasoning }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="grid three-column">
          <article class="info-card">
            <h3>Resume Data Extraction</h3>
            <p>Automatically parse resume uploads into structured candidate profiles for review.</p>
            <ul>
              <li>Total resumes processed: {{ resumeSummary.total }}</li>
              <li>Pending enrichment: {{ resumeSummary.pending }}</li>
              <li>Recent uploads queued: {{ recentResumeUploads }}</li>
            </ul>
          </article>
          <article class="info-card">
            <h3>Resume Matching</h3>
            <p>Match candidate skills to open job descriptions with AI-powered scoring.</p>
            <ul>
              <li>Shortlisted matches: {{ resumeSummary.shortlisted }}</li>
              <li>Rejected matches: {{ resumeSummary.rejected }}</li>
              <li>Average match score trend: {{ matchScoreLabel }}</li>
            </ul>
          </article>
          <article class="info-card">
            <h3>Recruitment Analytics</h3>
            <p>Monitor funnel performance and identify bottlenecks across hiring stages.</p>
            <ul>
              <li>Funnel health: {{ funnelHealthLabel }}</li>
              <li>Time-to-hire trend: {{ timeToHireLabel }}</li>
              <li>Top sourcing channel: {{ topSourceLabel }}</li>
            </ul>
          </article>
        </div>
      </section>

  <section v-else-if="activeTab === 'jdMaker'" class="panel">
    <div class="panel-header">
      <h2>JD Maker &amp; Matching</h2>
      <p class="subtitle">Craft compelling job descriptions to power matching and analytics.</p>
    </div>

    <div class="jd-maker-body">
      <form class="upload-card" @submit.prevent="uploadJobDescription">
        <h3>Create Job Description</h3>
        <p class="helper">Paste details or upload a JD file to auto-extract requirements.</p>
        <input v-model.trim="jdForm.title" class="input" type="text" placeholder="Job title *" required />
        <input v-model.trim="jdForm.department" class="input" type="text" placeholder="Department" />
        <textarea v-model.trim="jdForm.description" class="textarea" rows="4" placeholder="Paste job description text"></textarea>
        <label class="file-input">
          <input ref="jdFileInput" type="file" accept=".txt,.md,.doc,.docx,.pdf" @change="handleJdFile" />
        </label>
        <input v-model.trim="jdForm.skills" class="input" type="text" placeholder="Key skills (comma separated)" />
        <input v-model.trim="jdForm.requirements" class="input" type="text" placeholder="Additional requirements (comma separated)" />
        <input v-model="jdForm.experience_required" class="input" type="number" step="0.1" min="0" placeholder="Experience required (years)" />
        <p v-if="jdUploadError" class="error-text">{{ jdUploadError }}</p>
        <button class="primary" type="submit" :disabled="jdUploading">
          {{ jdUploading ? 'Saving...' : 'Save Job Description' }}
        </button>
      </form>
    </div>

    <div v-if="jobDescriptions.length" class="jd-table table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Department</th>
            <th>Requirements</th>
            <th>Experience</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="jd in jobDescriptions" :key="jd.id">
            <td>{{ jd.title }}</td>
            <td>{{ jd.department || '-' }}</td>
            <td>{{ formatRequirementList(jd.requirements) }}</td>
            <td>{{ jd.experience_required ?? '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </section>

  <section v-else-if="activeTab === 'birthdays'" class="panel">
    <div class="panel-header">
      <h2>Birthday Tracker</h2>
      <p class="subtitle">Celebrate your people and plan thoughtful recognition.</p>
    </div>

    <div v-if="birthdayLoading" class="empty-state">Loading upcoming birthdays...</div>
    <div v-else-if="birthdayError" class="empty-state error">{{ birthdayError }}</div>
    <div v-else>
      <div class="birthday-grid">
        <article class="info-card">
          <h3>Today</h3>
          <p v-if="!birthdayTracker.today.length" class="helper muted">No birthdays today.</p>
          <ul v-else class="birthday-list">
            <li v-for="entry in birthdayTracker.today" :key="entry.employee_id">
              <div class="birthday-person">
                <strong>{{ entry.employee_name }}</strong>
                <span>{{ entry.team_number ? 'Team ' + entry.team_number : 'Organization' }}</span>
              </div>
              <span class="helper">Turning {{ entry.turning }}</span>
            </li>
          </ul>
        </article>
        <article class="info-card">
          <h3>Upcoming (Next 30 days)</h3>
          <p v-if="!birthdayTracker.upcoming.length" class="helper muted">No upcoming birthdays in the next month.</p>
          <ul v-else class="birthday-list">
            <li v-for="entry in birthdayTracker.upcoming" :key="entry.employee_id">
              <div>
                <strong>{{ entry.employee_name }}</strong>
                <span>{{ entry.team_number ? 'Team ' + entry.team_number : 'Organization' }}</span>
              </div>
              <span class="helper">{{ formatBirthdayEntry(entry) }}</span>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>

  <section v-else-if="activeTab === 'offboarding'" class="panel">
    <div class="panel-header">
      <h2>Offboarding Journey</h2>
      <p class="subtitle">A simple five-step walkthrough to ensure smooth, human-centered offboarding.</p>
    </div>

    <div class="offboarding-steps">
      <article class="step-card" v-for="step in offboardingSteps" :key="step.title">
        <div class="step-number">{{ step.number }}</div>
        <div class="step-content">
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
          <ul v-if="step.checkpoints?.length">
            <li v-for="point in step.checkpoints" :key="point">{{ point }}</li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</main>

    <transition name="fade">
      <aside v-if="toast" class="toast" :class="toast.type">
        <span>{{ toast.message }}</span>
        <button class="icon-btn" type="button" @click="dismissToast">x</button>
      </aside>
    </transition>

    <div v-if="showAnswerModal" class="modal-backdrop" @click.self="closeAnswerModal">
      <div class="modal">
        <h3>Answer question</h3>
        <p class="modal-subject">{{ activeQuestion?.subject || 'Question' }}</p>
        <p class="modal-body">{{ activeQuestion?.body || activeQuestion?.question }}</p>
        <textarea
          v-model="answerDraft"
          class="textarea"
          rows="5"
          placeholder="Type your answer..."
        ></textarea>
        <p v-if="answerError" class="error-text">{{ answerError }}</p>
        <div class="modal-actions">
          <button class="ghost" type="button" @click="closeAnswerModal">Cancel</button>
          <button class="primary" type="button" :disabled="answerSubmitting" @click="submitAnswer">
            {{ answerSubmitting ? 'Sending...' : 'Send answer' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSurveyModal" class="modal-backdrop" @click.self="closeSurveyModal">
      <div class="modal">
        <h3>Create survey</h3>
        <input v-model.trim="surveyForm.title" class="input" type="text" placeholder="Survey title *" />
        <textarea v-model.trim="surveyForm.description" class="textarea" rows="3" placeholder="Short description (optional)"></textarea>
        <label class="input-group">
          <span class="input-label">Target audience</span>
          <select v-model="surveyForm.audience" class="input">
            <option value="all">All employees and managers</option>
            <option value="employees">Employees only</option>
            <option value="managers">Managers only</option>
          </select>
        </label>
        <label class="input-group">
          <span class="input-label">Questions (one per line)</span>
          <textarea v-model.trim="surveyForm.questionsRaw" class="textarea" rows="5" placeholder="e.g. How satisfied are you with workplace flexibility?\nWhat can we improve in onboarding?"></textarea>
        </label>
        <p v-if="surveyError" class="error-text">{{ surveyError }}</p>
        <div class="modal-actions">
          <button class="ghost" type="button" @click="closeSurveyModal">Cancel</button>
          <button class="primary" type="button" :disabled="surveySubmitting" @click="submitSurvey">
            {{ surveySubmitting ? 'Publishing...' : 'Publish survey' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import BrandLogo from '@/components/BrandLogo.vue'

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api'
const AUTH_HEADER = 'Authentication-Token'

export default {
  name: 'HrdashboardView',
  components: {
    BrandLogo,
  },
  data() {
    return {
      activeTab: 'overview',
      filters: {
        query: '',
        employee_id: '',
        department: '',
        role: '',
        status: '',
      },
      departments: [],
      results: [],
      total: 0,
      page: 1,
      pageSize: 10,
      loadingResults: false,
      resultsError: '',
      managerLeaves: [],
      processingLeaves: {},
      managerLoading: false,
      questions: [],
      questionsLoading: false,
      showAnswerModal: false,
      activeQuestion: null,
      answerDraft: '',
      answerError: '',
      answerSubmitting: false,
      showSurveyModal: false,
      surveyForm: {
        title: '',
        description: '',
        audience: 'all',
        questionsRaw: '',
      },
      surveyError: '',
      surveySubmitting: false,
      resumeSummary: {
        pending: 0,
        shortlisted: 0,
        rejected: 0,
        total: 0,
      },
      recentResumes: [],
      resumeUploadFile: null,
      resumeUploadSource: '',
      resumeUploading: false,
      resumeUploadError: '',
      jdFile: null,
      jdForm: {
        title: '',
        department: '',
        description: '',
        skills: '',
        requirements: '',
        experience_required: '',
      },
      jdUploading: false,
      jdUploadError: '',
      jobDescriptions: [],
      selectedJobDescriptionId: null,
      matchTopN: 5,
      matching: false,
      matchResults: [],
      offboardingSteps: [
        {
          number: '1',
          title: 'Knowledge Transfer',
          description: 'Transition responsibilities and document ongoing work before the final day.',
          checkpoints: ['Capture handover notes', 'Schedule transition meeting'],
        },
        {
          number: '2',
          title: 'Asset & Access Audit',
          description: 'Gather company assets and revoke system permissions in a coordinated timeline.',
          checkpoints: ['Retrieve hardware and badges', 'Coordinate system revocations'],
        },
        {
          number: '3',
          title: 'People & Payroll Updates',
          description: 'Confirm final pay, update HRIS records, and brief managers and payroll.',
          checkpoints: ['Confirm final paycheck details', 'Update HR systems'],
        },
        {
          number: '4',
          title: 'Exit Conversation',
          description: 'Hold a thoughtful exit interview to gather feedback and offer support.',
          checkpoints: ['Schedule exit interview', 'Share feedback highlights'],
        },
        {
          number: '5',
          title: 'Farewell & Records',
          description: 'Celebrate contributions, share farewell communications, and archive documentation.',
          checkpoints: ['Send farewell message', 'Archive offboarding paperwork'],
        },
      ],
      profileName: 'Super Admin',
      profileRole: 'Super Admin',
      toast: null,
      toastTimer: null,
    }
  },
  computed: {
    navItems() {
      return [
        { value: 'overview', label: 'Overview' },
        {
          value: 'approvals',
          label: 'Approve Leaves',
          badge: () => (this.managerLeaves.length ? this.managerLeaves.length : null),
        },
        {
          value: 'questions',
          label: 'Answer Questions',
          badge: () => (this.questions.length ? this.questions.length : null),
        },
        { value: 'resumes', label: 'Resumes' },
        { value: 'jdMaker', label: 'JD Maker' },
        {
          value: 'birthdays',
          label: 'Birthdays',
          badge: () =>
            this.birthdayTracker &&
            this.birthdayTracker.summary &&
            this.birthdayTracker.summary.birthdays_today
              ? this.birthdayTracker.summary.birthdays_today
              : null,
        },
        { value: 'offboarding', label: 'Offboarding' },
      ]
    },
    displayName() {
      return this.profileName
    },
    initials() {
      const parts = (this.displayName || '').trim().split(/\s+/)
      return parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('') || 'SA'
    },
    totalPages() {
      return Math.max(Math.ceil(this.total / this.pageSize), 1)
    },
    showingLabel() {
      if (!this.total) return 'No results'
      const start = (this.page - 1) * this.pageSize + 1
      const end = Math.min(this.total, this.page * this.pageSize)
      return `${start}-${end} of ${this.total}`
    },
    statusCounts() {
      return this.results.reduce((acc, person) => {
        const status = person.status || 'unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})
    },
    managerCount() {
      return this.results.filter((person) => (person.employment_role || person.role) === 'manager').length
    },
    recentResumeUploads() {
      return this.recentResumes.length
    },
    matchScoreLabel() {
      if (!this.resumeSummary.total) return 'Awaiting data'
      const ratio = this.resumeSummary.shortlisted / this.resumeSummary.total
      if (ratio >= 0.6) return 'Excellent'
      if (ratio >= 0.3) return 'Healthy'
      return 'Needs attention'
    },
    funnelHealthLabel() {
      if (!this.resumeSummary.total) return 'Building pipeline'
      const rejectionRatio = this.resumeSummary.rejected / this.resumeSummary.total
      if (rejectionRatio <= 0.4) return 'Balanced'
      if (rejectionRatio <= 0.7) return 'Watch list'
      return 'High drop-off'
    },
    timeToHireLabel() {
      if (this.resumeSummary.shortlisted >= 5) return 'Improving'
      if (this.resumeSummary.shortlisted) return 'Stable'
      return 'Collecting data'
    },
    topSourceLabel() {
      if (!this.recentResumes.length) return 'No recent uploads'
      const sources = this.recentResumes
        .map((item) => (item.source || '').trim())
        .filter(Boolean)
      if (!sources.length) return 'Mixed channels'
      const tally = sources.reduce((acc, source) => {
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {})
      return Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0]
    },
  },
  created() {
    this.loadUserFromStorage()
    this.bootstrap()
  },
  beforeUnmount() {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer)
    }
  },
  methods: {
    async bootstrap() {
      await Promise.allSettled([
        this.submitSearch(),
        this.loadManagerLeaves(),
        this.loadQuestions(),
        this.loadDepartments(),
        this.loadResumeSummary(),
        this.loadJobDescriptions(),
        this.loadBirthdayTracker(),
      ])
    },
    setActiveTab(tab) {
      this.activeTab = tab
      if (tab === 'overview' && !this.results.length && !this.loadingResults) {
        this.submitSearch()
      }
      if (tab === 'approvals' && !this.managerLeaves.length && !this.managerLoading) {
        this.loadManagerLeaves()
      }
      if (tab === 'questions' && !this.questions.length && !this.questionsLoading) {
        this.loadQuestions()
      }
      if (tab === 'jdMaker' && !this.jobDescriptions.length && !this.jdUploading) {
        this.loadJobDescriptions()
      }
      if (tab === 'birthdays' && !this.birthdayLoaded && !this.birthdayLoading) {
        this.loadBirthdayTracker()
      }
    },
    loadUserFromStorage() {
      const raw = localStorage.getItem('currentUser')
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          const nameParts = [parsed.first_name, parsed.last_name].filter(Boolean)
          const fallback = parsed.full_name || parsed.username || parsed.email || this.profileName
          this.profileName = nameParts.length ? nameParts.join(' ') : fallback
          const roles = Array.isArray(parsed.roles) ? parsed.roles : []
          if (roles.includes('super_admin')) {
            this.profileRole = 'Super Admin'
          } else if (roles.includes('admin')) {
            this.profileRole = 'Admin'
          } else {
            const roleValue = (parsed.employment_role || 'User').replace(/_/g, ' ')
            this.profileRole = roleValue.charAt(0).toUpperCase() + roleValue.slice(1)
          }
        } catch (error) {
          console.warn('Unable to parse cached user profile', error)
        }
      }
      const savedToken = localStorage.getItem('authToken')
      if (savedToken) {
        axios.defaults.headers.common[AUTH_HEADER] = savedToken
      } else {
        delete axios.defaults.headers.common[AUTH_HEADER]
      }
    },
    async loadDepartments() {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/departments`, { withCredentials: true })
        const items = Array.isArray(res.data?.departments) ? res.data.departments : []
        this.departments = items
      } catch (error) {
        this.departments = []
      }
    },
    async submitSearch() {
      this.loadingResults = true
      this.resultsError = ''
      try {
        const params = {
          ...this.filters,
          page: this.page,
          page_size: this.pageSize,
        }
        const res = await axios.get(`${API_BASE_URL}/admin/employees/search`, { params, withCredentials: true })
        this.results = Array.isArray(res.data?.results) ? res.data.results : []
        this.total = typeof res.data?.total === 'number' ? res.data.total : this.results.length
      } catch (error) {
        console.error('Employee search failed', error)
        this.resultsError = error?.response?.data?.error || error.message || 'Unable to search right now.'
        this.results = []
        this.total = 0
      } finally {
        this.loadingResults = false
      }
    },
    resetSearch() {
      this.filters = {
        query: '',
        employee_id: '',
        department: '',
        role: '',
        status: '',
      }
      this.page = 1
      this.submitSearch()
    },
    onSearchSubmit() {
      this.page = 1
      this.submitSearch()
    },
    prevPage() {
      if (this.page <= 1) return
      this.page -= 1
      this.submitSearch()
    },
    nextPage() {
      if (this.page >= this.totalPages) return
      this.page += 1
      this.submitSearch()
    },
    async loadManagerLeaves() {
      this.managerLoading = true
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/leaves`, {
          params: { submitted_by: 'manager', status: 'pending' },
          withCredentials: true,
        })
        const items = Array.isArray(res.data?.leaves) ? res.data.leaves : []
        this.managerLeaves = items.map((leave) => ({
          ...leave,
          manager_name: leave.manager_name || leave.manager || leave.requested_by || 'Manager',
          date_range: leave.date_range || `${leave.start_date || 'N/A'} -> ${leave.end_date || 'N/A'}`,
        }))
      } catch (error) {
        console.error('Failed to load manager leaves', error)
        this.showToast('Unable to load manager approvals right now.', 'error')
        this.managerLeaves = []
      } finally {
        this.managerLoading = false
      }
    },
    async actOnManagerLeave(leave, action) {
      if (!leave || !leave.id) return
      const question = action === 'approve' ? `Approve ${leave.manager_name}'s leave?` : `Reject ${leave.manager_name}'s leave?`
      if (!window.confirm(question)) return
      this.processingLeaves = { ...this.processingLeaves, [leave.id]: action }
      try {
        const endpoint =
          action === 'approve'
            ? `${API_BASE_URL}/admin/leaves/${leave.id}/approve`
            : `${API_BASE_URL}/admin/leaves/${leave.id}/reject`
        const payload = action === 'reject' ? { reason: 'Rejected by HR' } : {}
        await axios.post(endpoint, payload, { withCredentials: true })
        this.showToast(`Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, 'success')
        await this.loadManagerLeaves()
      } catch (error) {
        console.error('Failed to update leave status', error)
        this.showToast('Unable to update leave status.', 'error')
      } finally {
        const nextState = { ...this.processingLeaves }
        delete nextState[leave.id]
        this.processingLeaves = nextState
      }
    },
    async loadQuestions() {
      this.questionsLoading = true
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/hr/questions`, {
          params: { status: 'pending' },
          withCredentials: true,
        })
        this.questions = Array.isArray(res.data?.questions) ? res.data.questions : []
      } catch (error) {
        console.error('Failed to load escalated questions', error)
        this.showToast('Unable to load HR questions right now.', 'error')
        this.questions = []
      } finally {
        this.questionsLoading = false
      }
    },
    openAnswerModal(question) {
      this.activeQuestion = question
      this.answerDraft = ''
      this.answerError = ''
      this.showAnswerModal = true
    },
    closeAnswerModal() {
      this.showAnswerModal = false
      this.activeQuestion = null
      this.answerDraft = ''
      this.answerError = ''
    },
    async submitAnswer() {
      if (!this.answerDraft.trim()) {
        this.answerError = 'Please add an answer before sending.'
        return
      }
      if (!this.activeQuestion || !this.activeQuestion.id) {
        this.answerError = 'Question information missing.'
        return
      }
      this.answerSubmitting = true
      this.answerError = ''
      try {
        await axios.post(
          `${API_BASE_URL}/admin/hr/questions/${this.activeQuestion.id}/answer`,
          { answer: this.answerDraft.trim() },
          { withCredentials: true },
        )
        this.showToast('Answer sent to the employee.', 'success')
        this.closeAnswerModal()
        await this.loadQuestions()
      } catch (error) {
        console.error('Failed to submit answer', error)
        this.answerError = error?.response?.data?.error || error.message || 'Unable to send answer right now.'
      } finally {
        this.answerSubmitting = false
      }
    },
    openSurveyModal() {
      this.surveyError = ''
      this.showSurveyModal = true
    },
    closeSurveyModal() {
      this.showSurveyModal = false
      this.surveyError = ''
      this.surveyForm = { title: '', description: '', audience: 'all', questionsRaw: '' }
    },
    async submitSurvey() {
      const title = (this.surveyForm.title || '').trim()
      const description = (this.surveyForm.description || '').trim()
      const audience = this.surveyForm.audience || 'all'
      const lines = (this.surveyForm.questionsRaw || '').split(/\r?\n/).map((q) => q.trim()).filter(Boolean)
      if (!title) {
        this.surveyError = 'Please add a survey title.'
        return
      }
      if (!lines.length) {
        this.surveyError = 'Add at least one question (one per line).'
        return
      }
      this.surveySubmitting = true
      this.surveyError = ''
      try {
        await axios.post(
          `${API_BASE_URL}/admin/surveys`,
          { title, description, audience, questions: lines },
          { withCredentials: true },
        )
        this.showToast('Survey published to Employee and Manager dashboards.', 'success')
        this.closeSurveyModal()
      } catch (error) {
        console.error('Failed to publish survey', error)
        this.surveyError = error?.response?.data?.error || error.message || 'Unable to publish survey right now.'
      } finally {
        this.surveySubmitting = false
      }
    },
    async loadResumeSummary() {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/resumes/summary`, { withCredentials: true })
        const payload = res.data || {}
        const summary = payload.summary || {}
        this.resumeSummary = {
          pending: summary.pending ?? 0,
          shortlisted: summary.shortlisted ?? 0,
          rejected: summary.rejected ?? 0,
          total: payload.total ?? (summary.pending ?? 0) + (summary.shortlisted ?? 0) + (summary.rejected ?? 0),
        }
        this.recentResumes = Array.isArray(payload.recent_uploads) ? payload.recent_uploads : []
      } catch (error) {
        this.resumeSummary = { pending: 0, shortlisted: 0, rejected: 0, total: 0 }
        this.recentResumes = []
      }
    },
    async loadJobDescriptions() {
      try {
        const res = await axios.get(`${API_BASE_URL}/hr/jd`, { withCredentials: true })
        const items = Array.isArray(res.data?.job_descriptions) ? res.data.job_descriptions : []
        this.jobDescriptions = items.map((item) => ({
          ...item,
          requirements: Array.isArray(item.requirements)
            ? item.requirements
            : typeof item.requirements === 'string' && item.requirements
            ? item.requirements.split(',').map((value) => value.trim()).filter(Boolean)
            : [],
          skills_required: Array.isArray(item.skills_required)
            ? item.skills_required
            : typeof item.skills_required === 'string' && item.skills_required
            ? item.skills_required.split(',').map((value) => value.trim()).filter(Boolean)
            : [],
        }))
        if (!this.selectedJobDescriptionId && this.jobDescriptions.length) {
          this.selectedJobDescriptionId = this.jobDescriptions[0].id
        } else if (!this.jobDescriptions.length) {
          this.selectedJobDescriptionId = null
        }
      } catch (error) {
        console.error('Failed to load job descriptions', error)
        this.jobDescriptions = []
        this.selectedJobDescriptionId = null
      }
    },
    handleResumeFile(event) {
      const [file] = event.target.files || []
      this.resumeUploadFile = file || null
      this.resumeUploadError = ''
    },
    handleJdFile(event) {
      const [file] = event.target.files || []
      this.jdFile = file || null
      this.jdUploadError = ''
    },
    async uploadResume() {
      if (!this.resumeUploadFile) {
        this.resumeUploadError = 'Please choose a resume file.'
        return
      }
      this.resumeUploading = true
      this.resumeUploadError = ''
      try {
        const formData = new FormData()
        formData.append('file', this.resumeUploadFile)
        if (this.resumeUploadSource) {
          formData.append('source', this.resumeUploadSource)
        }
        await axios.post(`${API_BASE_URL}/hr/resume/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        })
        this.showToast('Resume processed successfully.', 'success')
        this.resumeUploadFile = null
        this.resumeUploadSource = ''
        if (this.$refs.resumeFileInput) {
          this.$refs.resumeFileInput.value = ''
        }
        await Promise.allSettled([this.loadResumeSummary(), this.loadJobDescriptions()])
      } catch (error) {
        console.error('Resume upload failed', error)
        this.resumeUploadError =
          error?.response?.data?.error || error.message || 'Unable to process resume right now.'
      } finally {
        this.resumeUploading = false
      }
    },
    parseCommaList(value) {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    },
    async uploadJobDescription() {
      const title = this.jdForm.title.trim()
      const descriptionText = this.jdForm.description.trim()
      if (!title) {
        this.jdUploadError = 'Title is required.'
        return
      }
      if (!descriptionText && !this.jdFile) {
        this.jdUploadError = 'Add description text or upload a JD file.'
        return
      }
      this.jdUploading = true
      this.jdUploadError = ''
      try {
        const department = this.jdForm.department.trim()
        const skills = this.jdForm.skills.trim()
        const requirements = this.jdForm.requirements.trim()
        const experienceRaw = this.jdForm.experience_required
        const experience =
          typeof experienceRaw === 'string'
            ? experienceRaw.trim()
            : experienceRaw !== null && experienceRaw !== undefined
            ? String(experienceRaw).trim()
            : ''
        const skillsList = skills ? this.parseCommaList(skills) : []
        const requirementsList = requirements ? this.parseCommaList(requirements) : []

        if (this.jdFile) {
          const formData = new FormData()
          formData.append('file', this.jdFile)
          formData.append('title', title)
          if (department) formData.append('department', department)
          if (descriptionText) formData.append('description', descriptionText)
          if (skillsList.length) formData.append('skills_required', JSON.stringify(skillsList))
          if (requirementsList.length) formData.append('requirements', JSON.stringify(requirementsList))
          if (experience) {
            const parsed = Number.parseFloat(experience)
            if (!Number.isNaN(parsed)) {
              formData.append('experience_required', String(parsed))
            }
          }
          await axios.post(`${API_BASE_URL}/hr/jd/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
          })
        } else {
          const payload = {
            title,
            department: department || undefined,
            description: descriptionText,
          }
          if (skillsList.length) payload.skills_required = skillsList
          if (requirementsList.length) payload.requirements = requirementsList
          if (experience) {
            const parsed = Number.parseFloat(experience)
            if (!Number.isNaN(parsed)) {
              payload.experience_required = parsed
            }
          }
          await axios.post(`${API_BASE_URL}/hr/jd/upload`, payload, { withCredentials: true })
        }

        this.showToast('Job description saved.', 'success')
        this.jdForm = {
          title: '',
          department: '',
          description: '',
          skills: '',
          requirements: '',
          experience_required: '',
        }
        this.jdFile = null
        if (this.$refs.jdFileInput) {
          this.$refs.jdFileInput.value = ''
        }
        await this.loadJobDescriptions()
      } catch (error) {
        console.error('JD upload failed', error)
        this.jdUploadError = error?.response?.data?.error || error.message || 'Unable to save JD right now.'
      } finally {
        this.jdUploading = false
      }
    },
    async runMatching() {
      if (!this.selectedJobDescriptionId) {
        this.matchError = 'Select a job description first.'
        return
      }
      this.matchError = ''
      this.matching = true
      this.matchResults = []
      this.matchedJob = null
      try {
        const res = await axios.post(
          `${API_BASE_URL}/hr/jd/match`,
          {
            job_description_id: this.selectedJobDescriptionId,
            top_n: this.matchTopN || 5,
          },
          { withCredentials: true },
        )
        this.matchResults = Array.isArray(res.data?.matches) ? res.data.matches : []
        this.matchedJob = res.data?.job_description || null
        if (!this.matchResults.length) {
          this.matchError = 'No candidates matched this job description.'
        }
      } catch (error) {
        console.error('Matching failed', error)
        this.matchError = error?.response?.data?.error || error.message || 'Unable to run matching right now.'
      } finally {
        this.matching = false
      }
    },
    clearMatchResults() {
      this.matchResults = []
      this.matchedJob = null
      this.matchError = ''
    },
    formatMatchScore(score) {
      const numeric = typeof score === 'number' ? score : Number(score)
      if (Number.isNaN(numeric)) return '-'
      const percent = numeric <= 1 ? numeric * 100 : numeric
      return `${percent.toFixed(1)}%`
    },
    formatRequirementList(value) {
      if (Array.isArray(value)) {
        const cleaned = value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)
        return cleaned.length ? cleaned.join(', ') : '-'
      }
      if (typeof value === 'string') {
        const cleaned = value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
        return cleaned.length ? cleaned.join(', ') : '-'
      }
      return '-'
    },
    formatBirthdayEntry(entry) {
      const days = Number(entry?.days_until)
      const date = entry?.next_birthday ? new Date(entry.next_birthday) : null
      const dateLabel = date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : ''
      if (days === 0) return dateLabel ? `Today - ${dateLabel}` : 'Today'
      if (Number.isNaN(days)) return dateLabel || '-'
      const unit = days === 1 ? 'day' : 'days'
      return `${days} ${unit} - ${dateLabel || 'Soon'}`
    },
    async loadBirthdayTracker() {
      this.birthdayLoading = true
      this.birthdayError = ''
      try {
        const res = await axios.get(`${API_BASE_URL}/birthday-tracker`, { withCredentials: true })
        const today = Array.isArray(res.data?.today) ? res.data.today : []
        const upcomingAll = Array.isArray(res.data?.upcoming) ? res.data.upcoming : []
        const upcoming = upcomingAll.filter((entry) => Number(entry?.days_until) > 0)
        const summary = res.data?.summary || {}
        this.birthdayTracker = { today, upcoming, summary }
        this.birthdayLoaded = true
      } catch (error) {
        console.error('Failed to load birthday tracker', error)
        this.birthdayError = error?.response?.data?.error || error.message || 'Unable to load birthday tracker.'
      } finally {
        this.birthdayLoading = false
      }
    },
    showToast(message, type = 'info', duration = 4000) {
      this.toast = { message, type }
      if (this.toastTimer) {
        clearTimeout(this.toastTimer)
      }
      this.toastTimer = setTimeout(() => {
        this.toast = null
        this.toastTimer = null
      }, duration)
    },
    dismissToast() {
      if (this.toastTimer) {
        clearTimeout(this.toastTimer)
        this.toastTimer = null
      }
      this.toast = null
    },
    async logout() {
      try {
        await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true })
      } catch (error) {
        console.error('Failed to logout', error)
        this.showToast('Unable to log out right now. Clearing local session.', 'error')
      } finally {
        try {
          localStorage.removeItem('currentUser')
          localStorage.removeItem('authToken')
        } catch (storageError) {
          console.warn('Unable to clear cached session', storageError)
        }
        delete axios.defaults.headers.common[AUTH_HEADER]
        this.$router.push({ name: 'HomePage' })
      }
    },
  },
}
</script>

<style scoped>
/* HR Dashboard - cleaned & consolidated */
.hr-dashboard {
  min-height: 100vh;
  background: #f6f8fb;
  color: #0f172a;
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* HEADER */
.hr-dashboard .dashboard-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 28px;
  background: linear-gradient(115deg, rgba(15, 23, 42, 0.94), rgba(30, 64, 175, 0.88));
  color: #f8fafc;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(16px);
  flex-wrap: wrap;
}

.hr-dashboard .brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hr-dashboard .brand-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.hr-dashboard .brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hr-dashboard .brand-copy h1 {
  font-size: 1.25rem;
  margin: 0;
  line-height: 1;
}

.hr-dashboard .brand-copy .tagline {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.78);
}

/* NAV / TABS */
.hr-dashboard .nav-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 120px;
  overflow-x: auto;
}

.hr-dashboard .tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(226, 232, 240, 0.92);
  cursor: pointer;
  transition: background 0.18s ease, transform 0.12s ease, color 0.18s ease;
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.95rem;
}

.hr-dashboard .tab:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
  color: #fff;
}

.hr-dashboard .tab.active {
  background: rgba(255, 255, 255, 0.26);
  color: #0f172a;
  border-color: rgba(255, 255, 255, 0.48);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.18);
}

/* small badge used in tabs */
.hr-dashboard .badge {
  min-width: 24px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  color: #fff;
}

/* header actions */
.hr-dashboard .header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hr-dashboard .user-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(15, 23, 42, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  padding: 6px 12px;
  min-width: 160px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.18);
}

.hr-dashboard .initials {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #0f172a;
}

.hr-dashboard .user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.hr-dashboard .user-info .name {
  font-weight: 600;
  color: #fff;
  font-size: 0.95rem;
}

.hr-dashboard .role {
  font-size: 0.78rem;
  color: rgba(226, 232, 240, 0.7);
}

/* logout */
.hr-dashboard .logout-btn {
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.hr-dashboard .logout-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

/* MAIN / PANEL */
.hr-dashboard .dashboard-main {
  flex: 1;
  padding: 28px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.hr-dashboard .panel {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  padding: 22px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

/* panel header */
.hr-dashboard .panel-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hr-dashboard .panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.hr-dashboard .panel-header .subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

/* QUICK SEARCH / FORM */
.hr-dashboard .quick-search {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-top: 6px;
}

.hr-dashboard .quick-search .input-group {
  display: flex;
  flex-direction: column;
  flex: 1 1 160px;
  min-width: 140px;
}

.hr-dashboard .quick-search .input-label,
.hr-dashboard .quick-search .input-group span {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin-bottom: 6px;
}

/* generic inputs */
.hr-dashboard .input,
.hr-dashboard .textarea,
.hr-dashboard .file-input input,
.hr-dashboard .quick-search input,
.hr-dashboard .quick-search select {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 10px 12px;
  font-size: 0.95rem;
  box-sizing: border-box;
  background: #fff;
  color: #0f172a;
}

/* file input visual */
.hr-dashboard .file-input input[type="file"] {
  border: 1px dashed #94a3b8;
  border-radius: 12px;
  padding: 10px;
  background: #fff;
}

/* buttons - primary / ghost / small modifiers */
.hr-dashboard button,
.hr-dashboard .button {
  font-family: inherit;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.hr-dashboard .primary {
  background: #2563eb;
  color: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(37, 99, 235, 0.15);
}

.hr-dashboard .primary[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.hr-dashboard .ghost {
  background: transparent;
  color: #2563eb;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(37, 99, 235, 0.09);
  min-width: 110px;
}

.hr-dashboard .small {
  padding: 6px 10px;
  min-width: 72px;
  font-size: 0.85rem;
}

/* STATS GRID */
.hr-dashboard .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.hr-dashboard .stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
}

.hr-dashboard .stat-card p {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.hr-dashboard .stat-card h3 {
  margin: 8px 0 0;
  font-size: 1.2rem;
}

/* PANEL BODY / TABLE AREA */
.hr-dashboard .panel-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hr-dashboard .table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hr-dashboard .meta {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.85rem;
}

.hr-dashboard .table-wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
}

.hr-dashboard table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
  background: transparent;
}

.hr-dashboard thead th {
  text-align: left;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
  padding: 12px 10px;
  border-bottom: 1px solid #e6eef8;
}

.hr-dashboard tbody td {
  padding: 12px 10px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

/* name/email rows */
.hr-dashboard .main {
  display: block;
  font-weight: 700;
  color: #0f172a;
}

.hr-dashboard .sub {
  display: block;
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 4px;
}

/* status pills: note status class is added as separate class (e.g. "on_leave") */
.hr-dashboard .status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  text-transform: capitalize;
  background: #eaf0ff;
  color: #0f172a;
  border: 1px solid rgba(14, 35, 75, 0.04);
}

.hr-dashboard .status-pill.active {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.hr-dashboard .status-pill.on_leave {
  background: rgba(249, 115, 22, 0.12);
  color: #c2410c;
}

.hr-dashboard .status-pill.inactive {
  background: rgba(148, 163, 184, 0.16);
  color: #334155;
}

/* EMPTY / LIST ITEMS */
.hr-dashboard .empty-state {
  text-align: center;
  padding: 22px;
  border-radius: 12px;
  background: #f8fafc;
  color: #475569;
  border: 1px dashed #dbe8ff;
}

.hr-dashboard .empty-state.error {
  color: #b91c1c;
  border-color: rgba(248, 113, 113, 0.4);
  background: rgba(255, 235, 235, 0.5);
}

.hr-dashboard .list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hr-dashboard .list-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e9f0fb;
  background: #fff;
  align-items: center;
}

/* actions area inside list items */
.hr-dashboard .actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* cards / info blocks */
.hr-dashboard .info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.hr-dashboard .info-card h3 {
  margin: 0 0 8px 0;
}

/* match score pill */
.hr-dashboard .score-pill {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef2ff;
  font-weight: 700;
}

/* toast & modal */
.hr-dashboard .toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: rgba(15, 23, 42, 0.92);
  color: #f8fafc;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
  z-index: 1200;
}

.hr-dashboard .toast.success {
  background: rgba(16, 185, 129, 0.92);
}

.hr-dashboard .toast.error {
  background: rgba(239, 68, 68, 0.92);
}

.hr-dashboard .icon-btn {
  border: none;
  background: none;
  color: inherit;
  font-size: 1.05rem;
  cursor: pointer;
}

/* modal backdrop */
.hr-dashboard .modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1300;
}

.hr-dashboard .modal {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  max-width: 640px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}

.hr-dashboard .modal-subject {
  margin: 0;
  color: #1e293b;
  font-weight: 700;
  font-size: 1rem;
}

.hr-dashboard .modal-body {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
}

.hr-dashboard .textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 10px;
  font-size: 0.95rem;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
}

.hr-dashboard .modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* step cards / offboarding */
.hr-dashboard .offboarding-steps,
.hr-dashboard .birthday-grid,
.hr-dashboard .resume-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.hr-dashboard .step-card {
  position: relative;
  background: #fff;
  border: 1px solid #eef4ff;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.hr-dashboard .step-number {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  background: linear-gradient(140deg, #2563eb, #4f46e5);
  color: #fff;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
}

/* small helpers */
.hr-dashboard .helper {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
}

.hr-dashboard .helper.muted {
  color: #94a3b8;
}

.hr-dashboard .error-text {
  color: #b91c1c;
  font-size: 0.9rem;
}

/* RESPONSIVE TWEAKS */
@media (max-width: 880px) {
  .hr-dashboard .dashboard-header {
    padding: 14px 16px;
    gap: 12px;
  }

  .hr-dashboard .brand-copy h1 {
    font-size: 1rem;
  }

  .hr-dashboard .nav-tabs {
    gap: 6px;
  }

  .hr-dashboard .dashboard-main {
    padding: 18px;
  }

  .hr-dashboard .panel {
    padding: 16px;
  }

  .hr-dashboard table {
    min-width: 600px;
  }
}

@media (max-width: 520px) {
  .hr-dashboard .nav-tabs {
    width: 100%;
  }
  .hr-dashboard .user-chip {
    display: none;
  }
}
</style>
