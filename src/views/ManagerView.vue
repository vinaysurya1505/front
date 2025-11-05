<template>
  <div class="manager-dashboard" @click="closeNotifications">
    <div class="dashboard-background">
      <span class="shape shape-1"></span>
      <span class="shape shape-2"></span>
      <span class="shape shape-3"></span>
    </div>
    <div class="dashboard-content">
      <header class="dashboard-header">
        <div class="header-inner mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div class="flex flex-wrap items-center gap-6">
            <router-link class="brand-link" to="/manager/dashboard" aria-label="Alveon home">
              <BrandLogo size="sm" muted />
            </router-link>
            <span class="workspace-label">Manager Workspace</span>
            <div class="page-switch">
              <router-link
                class="page-switch-btn"
                :class="{ active: isDashboardView }"
                to="/manager/dashboard"
              >
                Dashboard
              </router-link>
              <router-link
                class="page-switch-btn"
                :class="{ active: isLeaveInsightsView }"
                to="/manager/leaves"
              >
                Leave Insights
              </router-link>
            </div>
          </div>


          <div class="flex items-center gap-3 md:gap-4">
            <div class="relative">
              <button
                class="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl transition hover:bg-white/20"
                type="button"
                aria-label="Notifications"
                @click.stop="toggleNotifications"
              >
                &#128276;
                <span
                  v-if="unreadNotificationCount"
                  class="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white"
                >
                  {{ unreadNotificationCount }}
                </span>
              </button>
              <div
                v-if="showNotifications"
                class="absolute right-0 z-50 mt-3 w-[320px] origin-top-right rounded-xl border border-white/20 bg-white text-slate-900 shadow-xl"
                @click.self="closeNotifications"
              >
                <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h3 class="text-sm font-semibold text-slate-800">Notifications</h3>
                  <button class="text-lg leading-none text-slate-400 transition hover:text-slate-600" type="button" @click="closeNotifications">&times;</button>
                </div>
                <div class="max-h-80 overflow-y-auto p-4">
                  <div v-if="notificationsLoading" class="py-6 text-center text-sm text-slate-500">Loading alerts...</div>
                  <div v-else-if="notificationsError" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                    {{ notificationsError }}
                  </div>
                  <ul v-else-if="formattedNotifications.length" class="space-y-3">
                    <li v-for="item in formattedNotifications" :key="item.id">
                      <div
                        class="relative flex gap-3 rounded-lg border border-slate-100 px-3 py-2 transition hover:border-slate-200 hover:bg-slate-50"
                        :class="{ 'border-blue-200 bg-blue-50': !item.isRead }"
                      >
                        <button
                          class="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-slate-200 text-xs font-semibold text-slate-600 transition hover:bg-slate-300"
                          type="button"
                          @click.stop="dismissNotification(item)"
                        >
                          -
                        </button>
                        <div class="flex-1" @click.stop="markNotificationRead(item)">
                          <p class="text-sm font-semibold text-slate-800">{{ item.title }}</p>
                          <p v-if="item.message" class="mt-1 text-xs text-slate-500">{{ item.message }}</p>
                          <time v-if="item.createdAt" class="mt-2 block text-xs text-slate-400">
                            {{ formatRelativeDate(item.createdAt) }}
                          </time>
                        </div>
                      </div>
                    </li>
                  </ul>
                  <p v-else class="py-6 text-center text-sm text-slate-500">You're all caught up.</p>
                </div>
              </div>
            </div>

            
            <div class="flex items-center gap-3 rounded-full bg-white/10 px-3 py-1.5" @click.stop="openProfileModal">
              <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg font-semibold uppercase">{{ initials }}</span>
              <div class="hidden leading-tight sm:block">
                <p class="text-sm font-semibold text-white">{{ displayName }}</p>
                <p class="text-xs text-slate-200/80">Team {{ teamLabel }}</p>
              </div>
            </div>
            <button class="rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10" type="button" @click.stop="logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div
        v-if="toast"
        :class="[
          'toast-banner fixed top-24 right-6 z-50 flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur transition',
          toast.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : toast.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-white text-slate-700',
        ]"
      >
        <div class="text-sm font-medium leading-snug">
          <p>{{ toast.message }}</p>
        </div>
        <button class="text-xl leading-none text-current hover=text-slate-900" type="button" @click="dismissToast">
          &times;
        </button>
      </div>

      <main class="dashboard-main">
        <div class="mx-auto max-w-7xl space-y-8 px-4">
          <div v-if="loading" class="flex flex-col items-center gap-4 rounded-2xl bg-white p-10 text-center shadow-card">
            <span class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"></span>
            <p class="text-sm text-slate-500">Loading your manager dashboard...</p>
          </div>
          <div v-else>
            <div
              v-if="error"
              class="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 md:flex-row md:items-center md:justify-between"
            >
              <span>{{ error }}</span>
              <button
                class="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                type="button"
                @click="fetchManagerData"
              >
                Retry
              </button>
            </div>

            <div v-if="isDashboardView" class="space-y-8">
              <section id="section-overview" class="rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-card">
                <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div class="space-y-2">
                    <p class="text-sm font-medium uppercase tracking-wide text-slate-500">Team lead workspace</p>
                    <h1 class="text-3xl font-semibold text-slate-900">{{ displayName }}</h1>
                    <p class="max-w-2xl text-sm text-slate-600">{{ headlineText }}</p>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <button class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500" type="button" @click.stop="openLeaveModal">
                      Apply for leave
                    </button>
                    <button class="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50" type="button" @click.stop="openResignModal">
                      Resign
                    </button>
                  </div>
                </div>
              </section>

              <section class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="stat in managerStatCards"
                  :key="stat.title"
                  class="flex items-center justify-between rounded-2xl bg-white p-6 shadow-card"
                >
                  <div>
                    <p class="text-sm font-medium text-slate-500">{{ stat.title }}</p>
                    <p class="text-3xl font-semibold text-slate-900">{{ stat.value }}</p>
                    <p class="text-xs text-slate-500">{{ stat.subtext }}</p>
                  </div>
                  <div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg">
                    {{ stat.icon }}
                  </div>
                </div>
              </section>

              <section id="section-projects" class="rounded-2xl bg-white shadow-card">
                <div class="space-y-6 px-6 py-6">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div class="space-y-1">
                      <h2 class="text-lg font-semibold text-slate-900">Projects & announcements</h2>
                      <p class="text-sm text-slate-500">Keep everyone aligned with the latest priorities.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <button class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500" type="button" @click="openProjectModal('create')">
                        Create
                      </button>
                      <button
                        v-if="projectAnnouncement"
                        class="rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
                        type="button"
                        @click="openProjectModal('edit')"
                      >
                        Edit
                      </button>
                      <button
                        v-if="projectAnnouncement"
                        class="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:border-rose-400 hover:bg-rose-50"
                        type="button"
                        @click="confirmRemoveProject"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="projectAnnouncement"
                    class="space-y-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-700"
                  >
                    <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Shared with your team</p>
                    <h3 class="text-base font-semibold text-slate-900">{{ projectAnnouncement.title }}</h3>
                    <p class="whitespace-pre-line text-sm text-slate-700">
                      {{ projectAnnouncement.description }}
                    </p>
                    <p class="text-[11px] uppercase tracking-wide text-slate-400">
                      Updated {{ formatRelativeDate(projectAnnouncement.lastUpdated) }}
                    </p>
                  </div>
                  <div
                    v-else
                    class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-500"
                  >
                    No project announcement yet. Create one to broadcast the latest focus to your employees.
                  </div>
                </div>
              </section>

              <section id="section-team" class="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div class="rounded-2xl bg-white shadow-card xl:col-span-2">
            <div class="border-b border-slate-100 px-6 py-4">
              <h2 class="text-lg font-semibold text-slate-900">Team roster</h2>
            </div>
            <div v-if="teamMembers.length" class="divide-y divide-slate-100">
              <div
                v-for="member in teamMembers"
                :key="member.id"
                class="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p class="text-sm font-semibold text-slate-900">
                    {{ member.name }}
                    <span v-if="member.is_self" class="text-xs font-medium text-slate-500">(You)</span>
                  </p>
                  <p class="text-xs text-slate-500">
                    {{ member.job_title || member.employment_role || 'Member' }}
                  </p>
                </div>
                <div class="text-xs">
                  <a
                    v-if="member.email"
                    :href="'mailto:' + member.email"
                    class="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                  >
                    {{ member.email }}
                  </a>
                </div>
              </div>
            </div>
            <p v-else class="px-6 py-12 text-sm text-slate-500">{{ teamEmptyMessage }}</p>
          </div>

          <div id="section-birthdays" class="rounded-2xl bg-white shadow-card">
            <div class="border-b border-slate-100 px-6 py-4">
              <h2 class="text-lg font-semibold text-slate-900">Upcoming birthdays</h2>
              <p class="text-xs text-slate-500">Next {{ birthdayWindow }} days</p>
            </div>
            <div v-if="todayBirthdays.length" class="border-b border-slate-100 bg-blue-50/60 px-6 py-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Birthdays today</p>
              <ul class="mt-2 space-y-2">
                <li
                  v-for="person in todayBirthdays"
                  :key="`today-${person.employee_id}`"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="font-semibold text-slate-900">{{ person.employee_name }}</span>
                  <span class="text-xs text-slate-500">Turns {{ person.turning }}</span>
                </li>
              </ul>
            </div>
            <div v-if="upcomingBirthdays.length" class="divide-y divide-slate-100">
              <div
                v-for="person in upcomingBirthdays"
                :key="person.employee_id"
                class="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ person.employee_name }}</p>
                  <p class="text-xs text-slate-500">
                    Turns {{ person.turning }} • {{ formatAbsoluteDate(person.next_birthday) }}
                  </p>
                </div>
                <span class="text-xs font-medium text-blue-600">{{ person.days_until }} days</span>
              </div>
            </div>
            <p v-else class="px-6 py-12 text-sm text-slate-500">
              No birthdays within the next {{ birthdayWindow }} days.
            </p>
          </div>

          <div class="rounded-2xl bg-white shadow-card xl:col-span-3">
            <div class="border-b border-slate-100 px-6 py-4">
              <h2 class="text-lg font-semibold text-slate-900">Team offboarding</h2>
              <p class="text-sm text-slate-500">Monitor teammates progressing through exit steps</p>
            </div>
            <div v-if="teamOffboarding.length" class="divide-y divide-slate-100">
              <div
                v-for="member in teamOffboarding"
                :key="member.member_id"
                class="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ member.name }}</p>
                  <p class="text-xs text-slate-500">{{ member.job_title || 'Team member' }}</p>
                </div>
                <div class="text-right text-xs text-slate-500 md:text-sm">
                  <span class="status-pill" :class="`status-pill-${member.status}`">{{ member.stage }}</span>
                  <p v-if="member.last_updated" class="mt-1 text-xs text-slate-400">
                    Updated {{ formatRelativeDate(member.last_updated) }}
                  </p>
                  <p v-if="member.details" class="mt-1 text-xs text-slate-500 md:text-right">{{ member.details }}</p>
                </div>
              </div>
            </div>
            <p v-else class="px-6 py-12 text-sm text-slate-500">No offboarding activity across your team.</p>
          </div>
        </section>
            </div>

            <div v-else class="space-y-8">
              <section v-if="leaveSummaryCards.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div
                  v-for="card in leaveSummaryCards"
                  :key="card.id"
                  class="rounded-2xl bg-white p-6 shadow-card"
                >
                  <p class="text-sm font-medium text-slate-500">{{ card.label }}</p>
                  <p class="mt-2 text-3xl font-semibold text-slate-900">{{ card.value }}</p>
                  <p v-if="card.subtext" class="mt-1 text-xs text-slate-500">{{ card.subtext }}</p>
                </div>
              </section>

              <section
                v-if="showLeaveAnalytics"
                id="section-leave-analytics"
                class="rounded-2xl bg-white shadow-card"
              >
                <div class="border-b border-slate-100 px-6 py-4">
                  <h2 class="text-lg font-semibold text-slate-900">Leave analytics</h2>
                  <p class="text-sm text-slate-500">Track how your requests and approvals trend over time</p>
                </div>
                <div class="grid gap-8 px-6 py-6 lg:grid-cols-2">
                  <div>
                    <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Last 6 months</p>
                    <div class="analytics-chart mt-6">
                      <div
                        v-for="entry in leaveAnalyticsMonthly"
                        :key="entry.key"
                        class="analytics-column"
                      >
                        <div class="analytics-stack">
                          <div
                            v-if="entry.approved"
                            class="analytics-bar analytics-bar-approved"
                            :style="{ height: getAnalyticsBarHeight(entry.approved) }"
                            :title="`${entry.approved} approved`"
                          ></div>
                          <div
                            v-if="entry.pending"
                            class="analytics-bar analytics-bar-pending"
                            :style="{ height: getAnalyticsBarHeight(entry.pending) }"
                            :title="`${entry.pending} pending`"
                          ></div>
                          <div
                            v-if="entry.rejected"
                            class="analytics-bar analytics-bar-rejected"
                            :style="{ height: getAnalyticsBarHeight(entry.rejected) }"
                            :title="`${entry.rejected} rejected`"
                          ></div>
                        </div>
                        <span class="analytics-label">{{ entry.label }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-6">
                    <div>
                      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Your requests</p>
                      <ul class="status-breakdown mt-4">
                        <li v-for="chip in leaveStatusChips" :key="chip.key" class="status-breakdown-item">
                          <span class="status-chip" :class="`status-chip-${chip.key}`">{{ chip.label }}</span>
                          <span class="status-value">{{ chip.value }}</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Team status</p>
                      <ul class="status-breakdown mt-4">
                        <li v-for="chip in teamStatusChips" :key="chip.key" class="status-breakdown-item">
                          <span class="status-chip" :class="`status-chip-${chip.key}`">{{ chip.label }}</span>
                          <span class="status-value">{{ chip.value }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section id="section-approvals" class="rounded-2xl bg-white shadow-card">
                <div>
                  <div class="flex flex-col gap-2 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 class="text-lg font-semibold text-slate-900">Pending approvals</h2>
                      <p class="text-sm text-slate-500">Requests waiting on a decision</p>
                    </div>
                    <button class="text-sm font-medium text-blue-600 transition hover:text-blue-500" type="button" @click="refreshTeamInsights">
                      Refresh
                    </button>
                  </div>
                  <div v-if="pendingTeamLeaves.length" class="divide-y divide-slate-100">
                    <div
                      v-for="leave in pendingTeamLeaves"
                      :key="leave.id"
                      class="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p class="text-sm font-semibold text-slate-900">{{ leave.employee_name }}</p>
                        <p class="text-sm text-slate-500">
                          {{ formatLeaveType(leave.leave_type) }} • {{ leave.dateRange }}
                        </p>
                        <p class="text-xs text-slate-400">
                          {{ leave.reason || 'Not provided' }}
                        </p>
                      </div>
                      <div class="flex gap-2">
                        <button
                          class="rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white disabled:opacity-60"
                          type="button"
                          :disabled="Boolean(processingLeaves[leave.id])"
                          @click="updateLeaveStatus(leave, 'rejected')"
                        >
                          {{ processingLeaves[leave.id] === 'rejected' ? 'Rejecting…' : 'Reject' }}
                        </button>
                        <button
                          class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                          type="button"
                          :disabled="Boolean(processingLeaves[leave.id])"
                          @click="updateLeaveStatus(leave, 'approved')"
                        >
                          {{ processingLeaves[leave.id] === 'approved' ? 'Approving…' : 'Approve' }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p v-else class="px-6 py-12 text-sm text-slate-500">No pending requests from your team.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

    </div>

    <button class="floating-trigger chatbot-trigger" type="button" aria-label="Open Ava chatbot" @click.stop="openChatbot">
      <img src="@/assets/chatbot-assistant.svg" alt="Illustration of Ava, the virtual HR assistant" />
      <span class="trigger-label">Ask Ava</span>
    </button>
    <button class="floating-trigger career-trigger" type="button" aria-label="Open career growth planner" @click.stop="openCareerModal">
      <img src="@/assets/career-growth.svg" alt="Illustration symbolizing career growth" />
      <span class="trigger-label">Career Path</span>
    </button>

    <div v-if="showProjectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8" @click.self="closeProjectModal">
      <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">
              {{ projectModalMode === 'edit' ? 'Edit project update' : 'Create project update' }}
            </h2>
            <p class="text-sm text-slate-500">Share the latest project focus or announcement with your team.</p>
          </div>
          <button class="text-2xl leading-none text-slate-400 transition hover:text-slate-600" type="button" @click="closeProjectModal">-</button>
        </div>
        <form class="space-y-4 px-6 py-5" @submit.prevent="saveProjectAnnouncement">
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Title</span>
            <input
              v-model="projectForm.title"
              type="text"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="e.g. Q3 product launch alignment"
              required
            >
          </label>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Description</span>
            <textarea
              v-model="projectForm.description"
              rows="4"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Outline goals, checkpoints, or updates for the team"
              required
            ></textarea>
          </label>
          <p v-if="projectFormError" class="text-sm font-medium text-rose-600">{{ projectFormError }}</p>
          <div class="flex justify-end gap-3">
            <button class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100" type="button" @click="closeProjectModal">
              Cancel
            </button>
            <button class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500" type="submit">
              {{ projectModalMode === 'edit' ? 'Save changes' : 'Create update' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showLeaveModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8" @click.self="closeLeaveModal">
      <div class="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">New leave request</h2>
            <p class="text-sm text-slate-500">Let your manager know when you'll be away</p>
          </div>
          <button class="text-2xl leading-none text-slate-400 transition hover:text-slate-600" type="button" @click="closeLeaveModal">-</button>
        </div>
        <div class="px-6 py-5">
          <aside v-if="leaveBalance" class="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <p>
              <strong>{{ leaveRemainingDays }}</strong>
              of {{ leaveAllowanceDays }} days remaining this year.
            </p>
            <p v-if="leaveUsedDays" class="mt-1 text-xs text-blue-600">
              {{ leaveUsedDays }} day{{ leaveUsedDays === 1 ? '' : 's' }} used so far.
            </p>
          </aside>
          <form class="space-y-4" @submit.prevent="submitLeaveForm">
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Leave type</span>
              <select
                v-model="leaveForm.leave_type"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="annual">Annual leave</option>
                <option value="sick">Sick leave</option>
                <option value="casual">Casual leave</option>
                <option value="unpaid">Unpaid leave</option>
                <option value="general">Other</option>
              </select>
            </label>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label class="block space-y-2 text-sm">
                <span class="font-medium text-slate-700">Start date</span>
                <input
                  v-model="leaveForm.start_date"
                  type="date"
                  required
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
              </label>
              <label class="block space-y-2 text-sm">
                <span class="font-medium text-slate-700">End date</span>
                <input
                  v-model="leaveForm.end_date"
                  type="date"
                  required
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
              </label>
            </div>
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Reason</span>
              <textarea
                v-model="leaveForm.reason"
                rows="3"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Share context for your manager"
              ></textarea>
            </label>
            <p v-if="leaveFormError" class="text-sm font-medium text-rose-600">{{ leaveFormError }}</p>
            <div class="flex justify-end gap-3">
              <button class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100" type="button" @click="closeLeaveModal">
                Cancel
              </button>
              <button
                class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                :disabled="submittingLeave"
              >
                {{ submittingLeave ? 'Submitting...' : 'Submit request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showCareerModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8" @click.self="closeCareerModal">
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Career path planner</h2>
            <p class="text-sm text-slate-500">Share your growth goals to get personalised guidance</p>
          </div>
          <button class="text-2xl leading-none text-slate-400 transition hover:text-slate-600" type="button" @click="closeCareerModal">-</button>
        </div>
        <form class="space-y-4 px-6 py-5" @submit.prevent="submitCareerForm">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Current role</span>
              <input v-model="careerForm.current_role" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
            </label>
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Target role</span>
              <input v-model="careerForm.target_role" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
            </label>
          </div>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Strengths</span>
            <textarea v-model="careerForm.strengths" rows="2" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"></textarea>
          </label>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Focus areas</span>
            <textarea v-model="careerForm.focus_areas" rows="2" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"></textarea>
          </label>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Preferred learning style</span>
              <select v-model="careerForm.learning_style" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="online">Self-paced</option>
                <option value="mentorship">Mentorship</option>
                <option value="projects">Project-based</option>
                <option value="workshops">Workshops</option>
              </select>
            </label>
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Timeline (months)</span>
              <select v-model="careerForm.timeline" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="0-3">0 - 3</option>
                <option value="3-6">3 - 6</option>
                <option value="6-12">6 - 12</option>
                <option value="12+">12+</option>
              </select>
            </label>
          </div>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Guidance goal</span>
            <textarea v-model="careerForm.guidance_goal" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Mention projects, mentors, or skills you would like to explore"></textarea>
          </label>
          <p v-if="careerFormError" class="text-sm font-medium text-rose-600">{{ careerFormError }}</p>
          <div class="flex justify-end gap-3">
            <button class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100" type="button" @click="closeCareerModal">
              Cancel
            </button>
            <button class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60" type="submit" :disabled="submittingCareerForm">
              {{ submittingCareerForm ? 'Submitting...' : 'Generate plan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showChatbotModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8" @click.self="closeChatbot">
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">{{ chatbotHeadline }}</h3>
            <p v-if="chatbotSubtitle" class="text-sm text-slate-500">{{ chatbotSubtitle }}</p>
          </div>
          <button class="text-2xl leading-none text-slate-400 transition hover:text-slate-600" type="button" @click="closeChatbot">-</button>
        </div>
        <div class="space-y-5 px-6 py-5">
          <div v-if="chatHistory.length" class="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div
              v-for="(entry, index) in chatHistory"
              :key="'chat-' + index"
              class="flex w-full flex-col gap-1 rounded-xl bg-white p-3 shadow-inner"
              :class="entry.sender === 'user' ? 'items-end text-right' : 'items-start text-left'"
            >
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ entry.sender === 'user' ? 'You' : 'HR Support' }}</p>
              <p class="text-sm text-slate-600 whitespace-pre-line">{{ entry.content }}</p>
              <small class="text-xs text-slate-400">{{ formatRelativeDate(entry.timestamp) }}</small>
            </div>
          </div>
          <div v-else class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Ask HR anything about policies, leave balances, or processes.
          </div>
          <div v-if="chatbotStatusLabel" class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
            {{ chatbotStatusLabel }}
          </div>
          <div v-if="chatbotReference" class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
            Reference: {{ chatbotReference }}
          </div>
          <p v-if="chatbotReply && !chatHistory.length" class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600 whitespace-pre-line">
            {{ chatbotReply }}
          </p>
          <form class="space-y-4" @submit.prevent="submitChatbotPrompt">
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Message</span>
              <textarea
                v-model="chatbotPrompt"
                rows="3"
                required
                class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Ask about leave policy, benefits, or HR processes"
              ></textarea>
            </label>
            <div class="flex justify-end gap-3">
              <button class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100" type="button" @click="closeChatbot">
                Close
              </button>
              <button class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60" type="submit" :disabled="chatbotLoading">
                {{ chatbotLoading ? 'Sending...' : 'Send' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showProfileModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8" @click.self="closeProfileModal">
      <div class="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <h2 class="text-lg font-semibold text-slate-900">Profile details</h2>
          <button class="text-2xl leading-none text-slate-400 transition hover:text-slate-600" type="button" @click="closeProfileModal">-</button>
        </div>
        <div class="space-y-3 px-6 py-5 text-sm text-slate-600">
          <div v-if="profileFields.length" class="space-y-3">
            <div
              v-for="field in profileFields"
              :key="field.label"
              class="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ field.label }}</span>
              <span class="text-sm font-medium text-slate-700">{{ field.value }}</span>
            </div>
          </div>
          <p v-else class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Profile information is not available right now.
          </p>
        </div>
      </div>
    </div>

    <div v-if="showResignModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8" @click.self="closeResignModal">
      <div class="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Submit resignation</h2>
            <p class="text-sm text-slate-500">Share details so HR can support your transition</p>
          </div>
          <button class="text-2xl leading-none text-slate-400 transition hover:text-slate-600" type="button" @click="closeResignModal">-</button>
        </div>
        <form class="space-y-4 px-6 py-5" @submit.prevent="submitResignForm">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Expected last day</span>
              <input v-model="resignForm.last_day" type="date" required class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
            </label>
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Notice period</span>
              <input v-model="resignForm.notice_period" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="e.g. 2 weeks">
            </label>
          </div>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Reason</span>
            <textarea v-model="resignForm.reason" rows="3" required class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Share a short reason for resigning"></textarea>
          </label>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Handover plan</span>
            <textarea v-model="resignForm.handover_plan" rows="2" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Key tasks or documents to transfer"></textarea>
          </label>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Additional notes</span>
            <textarea v-model="resignForm.notes" rows="2" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Anything else we should know?"></textarea>
          </label>
          <p v-if="resignFormError" class="text-sm font-medium text-rose-600">{{ resignFormError }}</p>
          <div class="flex justify-end gap-3">
            <button class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100" type="button" @click="closeResignModal">
              Cancel
            </button>
            <button class="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
</template>
<script>
import axios from 'axios';
import BrandLogo from '@/components/BrandLogo.vue';
import db from '@/services/db';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api';
const AUTH_HEADER = 'Authentication-Token';
const PROJECT_ANNOUNCEMENT_STORAGE_KEY = 'employee:project-announcement';

export default {
  name: 'ManagerDashboard',
  props: {
    mode: {
      type: String,
      default: 'dashboard',
      validator: (value) => ['dashboard', 'leaves'].includes(value),
    },
  },
  components: {
    BrandLogo,
  },
  data() {
    return {
      loading: false,
      error: '',
      profile: null,
      stats: [],
      teamOverview: null,
      teamLeaveSummary: {
        total: 0,
        by_status: {},
      },
      pendingTeamLeaves: [],
      processingLeaves: {},
      upcomingEvents: [],
      notifications: [],
      projectAnnouncement: null,
      leaveBalance: null,
      leaveSummary: null,
      leaveAnalytics: {
        monthly: [],
        status_breakdown: {},
        team_status_breakdown: {},
      },
      showLeaveModal: false,
      leaveForm: {
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        reason: '',
      },
      leaveFormError: '',
      submittingLeave: false,
      showNotifications: false,
      notificationsLoading: false,
      notificationsError: '',
      showProjectModal: false,
      projectForm: {
        title: '',
        description: '',
      },
      projectModalMode: 'create',
      projectFormError: '',
      chatbot: null,
      showChatbotModal: false,
      chatbotPrompt: '',
      chatbotReply: '',
      chatbotStatus: '',
      chatbotReference: '',
      chatbotTicketId: null,
      chatbotLoading: false,
      chatHistory: [],
      showCareerModal: false,
      careerForm: {
        current_role: '',
        target_role: '',
        strengths: '',
        focus_areas: '',
        learning_style: 'online',
        timeline: '6-12',
        guidance_goal: '',
      },
      careerFormError: '',
      submittingCareerForm: false,
      showProfileModal: false,
      showResignModal: false,
      resignForm: {
        last_day: '',
        notice_period: '',
        reason: '',
        handover_plan: '',
        notes: '',
      },
      resignFormError: '',
      resignationDetails: null,
      teamOffboarding: [],
      birthdayTracker: null,
      toast: null,
      toastTimer: null,
      currentUserName: 'Manager',
    };
  },
  computed: {
    currentView() {
      return this.mode === 'leaves' ? 'leaves' : 'dashboard';
    },
    isDashboardView() {
      return this.currentView === 'dashboard';
    },
    isLeaveInsightsView() {
      return this.currentView === 'leaves';
    },
    displayName() {
      if (this.profile && this.profile.full_name) {
        return this.profile.full_name;
      }
      return this.currentUserName;
    },
    initials() {
      const parts = (this.displayName || '').trim().split(/\s+/);
      const letters = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase());
      return letters.join('') || 'M';
    },
    teamMembers() {
      if (this.teamOverview && Array.isArray(this.teamOverview.members)) {
        return this.teamOverview.members;
      }
      return [];
    },
    teamLabel() {
      return this.teamOverview && this.teamOverview.team_number ? this.teamOverview.team_number : 'Unassigned';
    },
    pendingCount() {
      return (this.teamLeaveSummary.by_status && this.teamLeaveSummary.by_status.pending) || this.pendingTeamLeaves.length;
    },
    managerStatCards() {
      if (Array.isArray(this.stats) && this.stats.length) {
        return this.stats.map((item) => ({
          title: item.title || 'Metric',
          value: typeof item.value === 'number' ? item.value : 0,
          subtext: item.subtext || '',
          icon: item.icon || '•',
        }));
      }
      const totalMembers =
        this.teamOverview && typeof this.teamOverview.total_members === 'number'
          ? this.teamOverview.total_members
          : this.teamMembers.length || 0;
      return [
        {
          title: 'Pending approvals',
          value: this.pendingCount,
          subtext: 'Waiting on manager decision',
          icon: 'PA',
        },
        {
          title: 'Leave balance',
          value: this.leaveRemainingDays != null ? this.leaveRemainingDays : 0,
          subtext: this.leaveAllowanceDays ? `of ${this.leaveAllowanceDays} days` : 'Remaining days',
          icon: 'LB',
        },
        {
          title: 'Team members',
          value: totalMembers,
          subtext: 'Active teammates',
          icon: 'TM',
        },
      ];
    },
    leaveSummaryCards() {
      const cards = [];
      const balance = this.leaveSummary && this.leaveSummary.balance ? this.leaveSummary.balance : this.leaveBalance;
      const byStatus = (this.leaveSummary && this.leaveSummary.by_status) || {};
      const totalRequests = this.leaveSummary && typeof this.leaveSummary.total === 'number' ? this.leaveSummary.total : 0;
      if (balance) {
        cards.push({
          id: 'remaining',
          label: 'Remaining leave',
          value: this.leaveRemainingDays ?? 0,
          subtext: balance.allowance_days ? `of ${balance.allowance_days} days` : null,
        });
        cards.push({
          id: 'used',
          label: 'Days used',
          value: this.leaveUsedDays ?? 0,
          subtext: 'This year',
        });
      }
      cards.push({
        id: 'total-requests',
        label: 'Total requests',
        value: totalRequests,
        subtext: 'Submitted by you',
      });
      cards.push({
        id: 'active-requests',
        label: 'Active requests',
        value: byStatus.pending || 0,
        subtext: 'Waiting on decision',
      });
      return cards;
    },
    showLeaveAnalytics() {
      return (this.leaveAnalyticsMonthly && this.leaveAnalyticsMonthly.length > 0) || this.leaveStatusChips.length > 0 || this.teamStatusChips.length > 0;
    },
    leaveAnalyticsMonthly() {
      if (!this.leaveAnalytics || !Array.isArray(this.leaveAnalytics.monthly)) {
        return [];
      }
      return this.leaveAnalytics.monthly.map((entry) => ({
        key: entry.key,
        label: entry.label,
        approved: entry.approved || 0,
        pending: entry.pending || 0,
        rejected: entry.rejected || 0,
      }));
    },
    maxLeaveAnalyticsValue() {
      const values = this.leaveAnalyticsMonthly.flatMap((entry) => [entry.approved, entry.pending, entry.rejected]);
      return Math.max(...values, 1);
    },
    leaveStatusChips() {
      if (!this.leaveAnalytics || !this.leaveAnalytics.status_breakdown) {
        return [];
      }
      const mapping = this.leaveAnalytics.status_breakdown;
      const order = ['approved', 'pending', 'rejected', 'cancelled'];
      return Object.keys(mapping)
        .sort((a, b) => {
          const ia = order.indexOf(a);
          const ib = order.indexOf(b);
          if (ia === -1 && ib === -1) {
            return a.localeCompare(b);
          }
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        })
        .map((key) => ({
          key,
          label: `${key.charAt(0).toUpperCase()}${key.slice(1)}`,
          value: mapping[key],
        }));
    },
    teamStatusChips() {
      if (!this.leaveAnalytics || !this.leaveAnalytics.team_status_breakdown) {
        return [];
      }
      const mapping = this.leaveAnalytics.team_status_breakdown;
      const order = ['approved', 'pending', 'rejected', 'cancelled'];
      return Object.keys(mapping)
        .sort((a, b) => {
          const ia = order.indexOf(a);
          const ib = order.indexOf(b);
          if (ia === -1 && ib === -1) {
            return a.localeCompare(b);
          }
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        })
        .map((key) => ({
          key,
          label: `${key.charAt(0).toUpperCase()}${key.slice(1)}`,
          value: mapping[key],
        }));
    },
    headlineText() {
      if (this.teamMembers.length) {
        return `Overseeing ${this.teamMembers.length} teammates with ${this.pendingCount} pending requests.`;
      }
      return 'Assign teammates to manage their requests and staffing here.';
    },
    teamEmptyMessage() {
      if (this.teamOverview && this.teamOverview.empty_message) {
        return this.teamOverview.empty_message;
      }
      return 'Assign teammates to this squad to track their requests here.';
    },
    birthdayWindow() {
      return (this.birthdayTracker && this.birthdayTracker.window_days) || 30;
    },
    todayBirthdays() {
      if (this.birthdayTracker && Array.isArray(this.birthdayTracker.today)) {
        return this.birthdayTracker.today;
      }
      return [];
    },
    upcomingBirthdays() {
      if (this.birthdayTracker && Array.isArray(this.birthdayTracker.upcoming)) {
        return this.birthdayTracker.upcoming.slice(0, 6);
      }
      return [];
    },
    leaveRemainingDays() {
      return this.leaveBalance ? this.leaveBalance.remaining_days : null;
    },
    leaveUsedDays() {
      return this.leaveBalance ? this.leaveBalance.used_days : null;
    },
    leaveAllowanceDays() {
      return this.leaveBalance ? this.leaveBalance.allowance_days : null;
    },
    unreadNotificationCount() {
      if (!Array.isArray(this.notifications)) {
        return 0;
      }
      return this.notifications.filter((item) => item && item.is_read === false).length;
    },
    formattedNotifications() {
      if (!Array.isArray(this.notifications)) {
        return [];
      }
      return this.notifications.map((item) => ({
        id: item.id,
        title: item.title || 'Notification',
        message: item.message || '',
        createdAt: item.created_at || item.createdAt || null,
        isRead: Boolean(item.is_read),
        category: item.category || 'general',
      }));
    },
    chatbotHeadline() {
      if (this.chatbot && this.chatbot.headline) {
        return this.chatbot.headline;
      }
      return 'Ava, your HR co-pilot';
    },
    chatbotSubtitle() {
      if (this.chatbot && this.chatbot.subtitle) {
        return this.chatbot.subtitle;
      }
      return 'Quick answers on policy, approvals, and people support.';
    },
    chatbotStatusLabel() {
      if (!this.chatbotStatus) {
        return '';
      }
      const lookup = {
        pending: 'We have flagged this for HR follow-up. Expect a response soon.',
        auto_answered: 'Answered using verified HR guidance.',
        error: 'We ran into an issue processing that question. Please try again.',
      };
      return lookup[this.chatbotStatus] || this.chatbotStatus;
    },
    profileFields() {
      if (!this.profile) {
        return [];
      }
      return [
        { label: 'Employee ID', value: this.profile.employee_id || '-' },
        { label: 'Department', value: this.profile.department || '-' },
        { label: 'Role', value: this.profile.employment_role || '-' },
        {
          label: 'Manager',
          value: this.profile.manager && this.profile.manager.name ? this.profile.manager.name : '-',
        },
        { label: 'Joined', value: this.formatAbsoluteDate(this.profile.hire_date) },
        {
          label: 'Tenure',
          value: this.profile.tenure && this.profile.tenure.label ? this.profile.tenure.label : '-',
        },
        { label: 'Email', value: this.profile.contact?.email || '-' },
        { label: 'Phone', value: this.profile.contact?.phone || '-' },
      ];
    },
  },
  created() {
    this.loadUserFromStorage();
    this.loadProjectAnnouncement();
    this.fetchManagerData();
  },
  mounted() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent);
    }
  },
  beforeUnmount() {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
  },
  methods: {
    buildMockManagerDashboard() {
      const rawUser = localStorage.getItem('currentUser');
      let me = null;
      try { me = rawUser ? JSON.parse(rawUser) : null } catch (_) { me = null }
      const manager = me || db.users.find(u => u.employment_role === 'manager') || null;

      const teamMembers = db.users
        .filter(u => u.employment_role === 'employee')
        .slice(0, 5)
        .map(u => ({
          id: u.id,
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || 'Member',
          email: u.email,
          employment_role: u.employment_role,
          is_self: false,
        }))
      const profile = manager
        ? {
            full_name: `${manager.first_name || ''} ${manager.last_name || ''}`.trim() || manager.username,
            employment_role: manager.employment_role,
            department: manager.department || 'Engineering',
            hire_date: '2022-04-15',
            contact: { email: manager.email },
            manager: { name: 'VP Engineering' },
          }
        : null

      const leaveBalance = { allowance_days: 24, used_days: 8, remaining_days: 16 }
      const leaveSummary = { total: 6, by_status: { approved: 3, pending: 2, rejected: 1 }, balance: leaveBalance }
      const leaveAnalytics = {
        monthly: [
          { key: 'Jun', label: 'Jun', approved: 2, pending: 1, rejected: 0 },
          { key: 'Jul', label: 'Jul', approved: 0, pending: 1, rejected: 1 },
          { key: 'Aug', label: 'Aug', approved: 1, pending: 0, rejected: 0 },
          { key: 'Sep', label: 'Sep', approved: 1, pending: 0, rejected: 0 },
          { key: 'Oct', label: 'Oct', approved: 0, pending: 0, rejected: 0 },
          { key: 'Nov', label: 'Nov', approved: 1, pending: 0, rejected: 0 },
        ],
        status_breakdown: { approved: 5, pending: 2, rejected: 1 },
        team_status_breakdown: { approved: 8, pending: 1, rejected: 2 },
      }

      const pendingTeamLeaves = (db.leave_requests || [])
        .filter(l => l.status === 'pending')
        .map(l => ({
          id: l.id,
          employee_name: (db.users.find(u => u.id === l.user_id)?.first_name || 'Employee') + ' ' + (db.users.find(u => u.id === l.user_id)?.last_name || ''),
          leave_type: l.leave_type,
          start_date: l.start_date,
          end_date: l.end_date,
          reason: l.reason,
          status: l.status,
        }))

      const teamOverview = {
        team_number: 'ENG-05',
        total_members: teamMembers.length,
        members: teamMembers,
        empty_message: 'Assign teammates to this squad to track their requests here.',
      }

      const project_announcement = (db.project_announcements && db.project_announcements[0])
        ? {
            title: db.project_announcements[0].title,
            description: db.project_announcements[0].description,
            lastUpdated: new Date().toISOString(),
          }
        : null

      const notifications = (db.notifications || []).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        category: n.category,
        is_read: false,
        created_at: new Date().toISOString(),
      }))

      const upcoming_events = db.team_events || []

      const chatbot = { headline: 'Ask HR anything', subtitle: 'Policies, approvals, and more' }

      return {
        profile,
        leave_summary: leaveSummary,
        leave_balance: leaveBalance,
        leave_analytics: leaveAnalytics,
        team_overview: teamOverview,
        team_leave_summary: { total: pendingTeamLeaves.length, by_status: { pending: pendingTeamLeaves.length } },
        pending_team_leaves: pendingTeamLeaves,
        team_offboarding: [],
        upcoming_events,
        notifications,
        project_announcement,
        chatbot,
      }
    },
    openProjectModal(mode = 'create') {
      this.projectModalMode = mode;
      if (mode === 'edit' && this.projectAnnouncement) {
        this.projectForm = {
          title: this.projectAnnouncement.title || '',
          description: this.projectAnnouncement.description || '',
        };
      } else {
        this.projectForm = {
          title: '',
          description: '',
        };
      }
      this.projectFormError = '';
      this.showProjectModal = true;
    },
    closeProjectModal() {
      this.showProjectModal = false;
      this.projectFormError = '';
      this.projectForm = {
        title: '',
        description: '',
      };
    },
    normalizeProjectAnnouncement(payload) {
      if (!payload) {
        return null;
      }
      let source = payload;
      if (typeof source === 'string') {
        const trimmed = source.trim();
        if (!trimmed) {
          return null;
        }
        try {
          source = JSON.parse(trimmed);
        } catch (error) {
          source = { description: trimmed };
        }
      }
      const title =
        typeof source.title === 'string'
          ? source.title.trim()
          : typeof source.project_title === 'string'
          ? source.project_title.trim()
          : '';
      const descriptionRaw =
        typeof source.description === 'string'
          ? source.description
          : typeof source.project_description === 'string'
          ? source.project_description
          : typeof source.body === 'string'
          ? source.body
          : '';
      const description = descriptionRaw.trim();
      if (!title && !description) {
        return null;
      }
      return {
        title,
        description,
        lastUpdated:
          source.lastUpdated ||
          source.last_updated ||
          source.updated_at ||
          source.timestamp ||
          new Date().toISOString(),
      };
    },
    setProjectAnnouncementFromPayload(payload, { persist = false } = {}) {
      const normalized = this.normalizeProjectAnnouncement(payload);
      this.projectAnnouncement = normalized;
      if (persist) {
        this.persistProjectAnnouncement(normalized);
      }
    },
    persistProjectAnnouncement(payload) {
      try {
        if (payload) {
          localStorage.setItem(PROJECT_ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(payload));
        } else {
          localStorage.removeItem(PROJECT_ANNOUNCEMENT_STORAGE_KEY);
        }
      } catch (error) {
        console.warn('Unable to persist project announcement', error);
      }
    },
    loadProjectAnnouncement() {
      try {
        const raw = localStorage.getItem(PROJECT_ANNOUNCEMENT_STORAGE_KEY);
        this.setProjectAnnouncementFromPayload(raw ? JSON.parse(raw) : null);
      } catch (error) {
        console.warn('Unable to parse project announcement from storage', error);
        this.projectAnnouncement = null;
      }
    },
    handleStorageEvent(event) {
      if (!event || event.key !== PROJECT_ANNOUNCEMENT_STORAGE_KEY) {
        return;
      }
      try {
        this.setProjectAnnouncementFromPayload(event.newValue ? JSON.parse(event.newValue) : null);
      } catch (error) {
        console.warn('Unable to apply project announcement from storage event', error);
      }
    },
    async saveProjectAnnouncement() {
      this.projectFormError = '';
      const title = (this.projectForm.title || '').trim();
      const description = (this.projectForm.description || '').trim();
      if (!title) {
        this.projectFormError = 'Please add a title for the update.';
        return;
      }
      if (!description) {
        this.projectFormError = 'Please add a description for the update.';
        return;
      }
      const payload = { title, description };
      const announcement = { ...payload, lastUpdated: new Date().toISOString() }
      this.setProjectAnnouncementFromPayload(announcement, { persist: true })
      this.closeProjectModal()
      this.showToast('Project announcement saved for your team.', 'success')
    },
    confirmRemoveProject() {
      if (!this.projectAnnouncement) {
        return;
      }
      const shouldRemove =
        typeof window === 'undefined' ? true : window.confirm('Remove the current project announcement?');
      if (shouldRemove) {
        this.removeProjectAnnouncement();
      }
    },
    async removeProjectAnnouncement() {
      this.setProjectAnnouncementFromPayload(null, { persist: true })
      this.showToast('Project announcement removed.', 'info')
    },
    loadUserFromStorage() {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const nameParts = [parsed.first_name, parsed.last_name].filter(Boolean);
          const fallback = parsed.full_name || parsed.username || parsed.email || this.currentUserName;
          this.currentUserName = nameParts.length ? nameParts.join(' ') : fallback;
        } catch (error) {
          console.warn('Unable to parse cached user', error);
        }
      }

      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        axios.defaults.headers.common[AUTH_HEADER] = savedToken;
      } else {
        delete axios.defaults.headers.common[AUTH_HEADER];
      }
    },
    async fetchManagerData() {
      this.loading = true;
      this.error = '';
      try {
        const dashboard = this.buildMockManagerDashboard()
        this.profile = dashboard.profile || null;
        this.stats = Array.isArray(dashboard.stats) ? dashboard.stats : [];
        this.leaveSummary = dashboard.leave_summary || null;
        this.leaveBalance =
          dashboard.leave_balance ||
          (this.leaveSummary && this.leaveSummary.balance) ||
          this.leaveBalance;
        this.leaveAnalytics = dashboard.leave_analytics || {
          monthly: [],
          status_breakdown: {},
          team_status_breakdown: {},
        };
        this.teamOverview = dashboard.team_overview || null;
        this.teamLeaveSummary = dashboard.team_leave_summary || { total: 0, by_status: {} };
        this.pendingTeamLeaves = Array.isArray(dashboard.pending_team_leaves)
          ? dashboard.pending_team_leaves.map((item) => this.decorateTeamLeave(item))
          : [];
        this.processingLeaves = {};
        this.teamOffboarding = Array.isArray(dashboard.team_offboarding) ? dashboard.team_offboarding : [];
        this.upcomingEvents = dashboard.upcoming_events || [];
        this.notifications = dashboard.notifications || [];
        const incomingAnnouncement = Object.prototype.hasOwnProperty.call(dashboard, 'project_announcement')
          ? dashboard.project_announcement
          : undefined;
        if (incomingAnnouncement && (incomingAnnouncement.title || incomingAnnouncement.description)) {
          this.setProjectAnnouncementFromPayload(incomingAnnouncement, { persist: true });
        } else if (!this.projectAnnouncement) {
          this.loadProjectAnnouncement();
        }
        this.chatbot = dashboard.chatbot || null;
        this.resignationDetails = dashboard.resignation || null;
        if (this.profile && this.profile.job_title && !this.careerForm.current_role) {
          this.careerForm.current_role = this.profile.job_title;
        }
        await this.loadBirthdayTracker();
        if (this.profile && this.profile.full_name) {
          this.currentUserName = this.profile.full_name;
        }
      } catch (error) {
        this.error = 'Unable to load dashboard right now.'
      } finally {
        this.loading = false;
      }
    },
    async loadNotifications(force = false) {
      if (this.notificationsLoading) {
        return;
      }
      if (!force && this.notifications.length && !this.unreadNotificationCount) {
        return;
      }
      this.notificationsLoading = true;
      this.notificationsError = '';
      try {
        const items = (db.notifications || []).map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          category: n.category,
          is_read: false,
          created_at: new Date().toISOString(),
        }))
        this.notifications = items
      } finally {
        this.notificationsLoading = false;
      }
    },
    async markNotificationRead(notification, { remove = false } = {}) {
      if (!notification || !notification.id) {
        return;
      }
      if (!notification.isRead) {
        try {
          await axios.post(
            `${API_BASE_URL}/notifications/${notification.id}/read`,
            {},
            { withCredentials: true },
          );
        } catch (error) {
          console.error('Failed to mark notification as read', error);
        }
      }
      this.notifications = this.notifications.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item,
      );
      if (remove) {
        this.notifications = this.notifications.filter((item) => item.id !== notification.id);
      }
    },
    async dismissNotification(notification) {
      await this.markNotificationRead(notification, { remove: true });
    },
    async toggleNotifications() {
      if (this.showNotifications) {
        this.showNotifications = false;
        return;
      }
      this.showNotifications = true;
      await this.loadNotifications(true);
    },
    closeNotifications() {
      this.showNotifications = false;
    },
    openLeaveModal() {
      this.leaveFormError = '';
      this.showLeaveModal = true;
    },
    closeLeaveModal() {
      this.showLeaveModal = false;
      this.leaveFormError = '';
      this.leaveForm = { leave_type: 'annual', start_date: '', end_date: '', reason: '' };
    },
    async submitLeaveForm() {
      this.leaveFormError = '';
      if (!this.leaveForm.start_date || !this.leaveForm.end_date) {
        this.leaveFormError = 'Please choose a start and end date.';
        return;
      }
      if (this.leaveForm.end_date < this.leaveForm.start_date) {
        this.leaveFormError = 'End date cannot be earlier than start date.';
        return;
      }
      this.submittingLeave = true;
      try {
        await axios.post(
          `${API_BASE_URL}/leave/apply`,
          {
            leave_type: this.leaveForm.leave_type,
            start_date: this.leaveForm.start_date,
            end_date: this.leaveForm.end_date,
            reason: this.leaveForm.reason,
          },
          { withCredentials: true },
        );
        this.showToast('Leave request submitted.', 'success');
        this.closeLeaveModal();
        await this.fetchManagerData();
      } catch (error) {
        console.error('Failed to submit leave request', error);
        const message =
          (error.response && (error.response.data?.error || error.response.data?.message)) ||
          error.message ||
          'Unable to submit leave request.';
        this.leaveFormError = message;
      } finally {
        this.submittingLeave = false;
      }
    },
    openProfileModal() {
      this.showProfileModal = true;
    },
    closeProfileModal() {
      this.showProfileModal = false;
    },
    openResignModal() {
      this.resignFormError = '';
      this.showResignModal = true;
    },
    closeResignModal() {
      this.showResignModal = false;
      this.resignFormError = '';
    },
    submitResignForm() {
      this.resignFormError = ''
      if (!this.resignForm.last_day) {
        this.resignFormError = 'Please select your planned last working day.'
        return
      }
      if (!this.resignForm.reason.trim()) {
        this.resignFormError = 'Please share a short reason for resigning.'
        return
      }
      const payload = {
        last_day: this.resignForm.last_day,
        reason: this.resignForm.reason.trim(),
      }
      const token = localStorage.getItem('authToken')
      const headers = token ? { 'Authentication-Token': token } : {}
      this.loading = true
      axios
        .post(`${API_BASE_URL}/offboarding/resign`, payload, { headers })
        .then(() => {
          this.showToast('Resignation request submitted to HR.', 'info')
          this.resignationDetails = {
            status_label: 'Offboarding started',
            message: 'Your resignation has been recorded. HR will contact you.',
            last_day: this.resignForm.last_day,
            reason: this.resignForm.reason.trim(),
          }
          this.closeResignModal()
          this.resignForm = {
            last_day: '',
            notice_period: '',
            reason: '',
            handover_plan: '',
            notes: '',
          }
        })
        .catch((error) => {
          const errMsg = error?.response?.data?.error || error.message || 'Failed to submit resignation'
          this.resignFormError = errMsg
        })
        .finally(() => {
          this.loading = false
        })
    },
    openChatbot() {
      this.chatbotPrompt = '';
      this.chatbotReply = '';
      this.chatbotStatus = '';
      this.chatbotReference = '';
      this.chatbotTicketId = null;
      this.chatHistory = [];
      this.chatbotLoading = false;
      this.showChatbotModal = true;
    },
    closeChatbot() {
      this.showChatbotModal = false;
      this.chatbotLoading = false;
      this.chatHistory = [];
    },
    async submitChatbotPrompt() {
      const prompt = (this.chatbotPrompt || '').trim();
      if (!prompt) {
        return;
      }
      const userMessage = {
        sender: 'user',
        content: prompt,
        timestamp: new Date().toISOString(),
      };
      this.chatHistory = [...this.chatHistory, userMessage];
      this.chatbotLoading = true;
      try {
        const response = await axios.post(
          `${API_BASE_URL}/employee/chatbot`,
          { message: prompt },
          { withCredentials: true },
        );
        const payload = response.data || {};
        const normalize = (entry) => ({
          sender: entry.sender || 'assistant',
          content: entry.content || '',
          timestamp: entry.timestamp || new Date().toISOString(),
        });
        if (Array.isArray(payload.messages) && payload.messages.length) {
          this.chatHistory = payload.messages.map(normalize);
        } else {
          const assistantMessage = normalize({
            sender: 'assistant',
            content: payload.response || 'HR bot has recorded your message.',
          });
          this.chatHistory = [...this.chatHistory, assistantMessage];
        }
        this.chatbotReply =
          payload.response ||
          (Array.isArray(payload.messages)
            ? payload.messages
                .filter((entry) => entry.sender !== 'user')
                .map((entry) => entry.content)
                .filter(Boolean)
                .pop() || ''
            : '');
        this.chatbotStatus = payload.status || '';
        this.chatbotReference = payload.reference || '';
        this.chatbotTicketId = payload.question_log_id || null;
        if (this.chatbotStatus === 'pending') {
          this.showToast('Your question has been escalated to HR. We will follow up soon.', 'info');
        }
        this.chatbotPrompt = '';
      } catch (error) {
        console.error('Chatbot request failed', error);
        const message =
          (error.response && (error.response.data?.error || error.response.data?.message)) ||
          error.message ||
          'Unable to send message right now.';
        this.showToast(message, 'error');
        this.chatbotStatus = 'error';
        this.chatbotReference = '';
        this.chatbotTicketId = null;
        this.chatHistory = [
          ...this.chatHistory,
          {
            sender: 'assistant',
            content: 'Something went wrong while reaching HR. Please try again shortly.',
            timestamp: new Date().toISOString(),
          },
        ];
      } finally {
        this.chatbotLoading = false;
      }
    },
    openCareerModal() {
      this.careerFormError = '';
      if (this.profile && this.profile.job_title && !this.careerForm.current_role) {
        this.careerForm.current_role = this.profile.job_title;
      }
      this.showCareerModal = true;
    },
    closeCareerModal() {
      this.showCareerModal = false;
      this.careerFormError = '';
      this.submittingCareerForm = false;
    },
    async submitCareerForm() {
      this.careerFormError = '';
      if (!this.careerForm.target_role.trim()) {
        this.careerFormError = 'Please share the target role or aspiration.';
        return;
      }
      this.submittingCareerForm = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        this.showToast('We will curate a growth playbook and email it to you shortly.', 'success');
        const currentRole = this.careerForm.current_role;
        this.careerForm = {
          current_role: currentRole,
          target_role: '',
          strengths: '',
          focus_areas: '',
          learning_style: 'online',
          timeline: '6-12',
          guidance_goal: '',
        };
        this.closeCareerModal();
      } catch (error) {
        console.error('Failed to prepare career guidance', error);
        this.careerFormError = 'Unable to prepare guidance right now. Please try again.';
      } finally {
        this.submittingCareerForm = false;
      }
    },
    async refreshTeamInsights() {
      try {
        const dashboard = this.buildMockManagerDashboard()
        if (dashboard.team_leave_summary) {
          this.teamLeaveSummary = dashboard.team_leave_summary;
        }
        if (Array.isArray(dashboard.pending_team_leaves)) {
          this.pendingTeamLeaves = dashboard.pending_team_leaves.map((item) => this.decorateTeamLeave(item));
        }
        this.processingLeaves = {};
        if (Array.isArray(dashboard.team_offboarding)) {
          this.teamOffboarding = dashboard.team_offboarding;
        }
        if (dashboard.leave_summary) {
          this.leaveSummary = dashboard.leave_summary;
          if (dashboard.leave_summary.balance) {
            this.leaveBalance = dashboard.leave_summary.balance;
          }
        }
        if (dashboard.leave_analytics) {
          this.leaveAnalytics = dashboard.leave_analytics;
        }
        if (Array.isArray(dashboard.stats)) {
          this.stats = dashboard.stats;
        }
        if (Array.isArray(dashboard.notifications)) {
          this.notifications = dashboard.notifications;
        }
        await this.loadBirthdayTracker();
      } catch (error) {
        console.error('Failed to refresh team insights', error);
        this.showToast('Unable to refresh team data right now.', 'error');
        if (error.response && error.response.status === 401) {
          this.redirectToLogin();
        }
      }
    },
    async loadBirthdayTracker() {
      try {
        const today = []
        const upcoming = []
        this.birthdayTracker = { window_days: 30, today, upcoming }
      } catch (error) {
        this.birthdayTracker = { window_days: 30, today: [], upcoming: [] }
      }
    },
    decorateTeamLeave(leave) {
      const startDate = this.parseISODate(leave.start_date);
      const endDate = this.parseISODate(leave.end_date);
      return {
        ...leave,
        startDate,
        endDate,
        dateRange: this.formatDateRange(startDate, endDate),
      };
    },
    parseISODate(value) {
      if (!value || typeof value !== 'string') {
        return null;
      }
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!match) {
        return null;
      }
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(Date.UTC(year, month, day));
    },
    formatDateRange(start, end) {
      if (!start) {
        return '-';
      }
      const from = this.formatAbsoluteDate(start);
      if (!end || start.getTime() === end.getTime()) {
        return from;
      }
      return `${from} - ${this.formatAbsoluteDate(end)}`;
    },
    getAnalyticsBarHeight(value) {
      if (!value) {
        return '0%';
      }
      const denominator = this.maxLeaveAnalyticsValue || 1;
      const ratio = Math.min(value / denominator, 1);
      const height = Math.max(ratio * 100, 6);
      return `${height}%`;
    },
    formatAbsoluteDate(value) {
      if (!value) {
        return '-';
      }
      const date = value instanceof Date ? value : this.parseISODate(value);
      if (!date || Number.isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    },
    formatRelativeDate(value) {
      if (!value) {
        return '';
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '';
      }
      const diffMs = Date.now() - date.getTime();
      const minutes = Math.round(diffMs / 60000);
      if (minutes < 1) {
        return 'Just now';
      }
      if (minutes < 60) {
        return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
      }
      const hours = Math.round(minutes / 60);
      if (hours < 24) {
        return `${hours} hr${hours === 1 ? '' : 's'} ago`;
      }
      const days = Math.round(hours / 24);
      if (days < 7) {
        return `${days} day${days === 1 ? '' : 's'} ago`;
      }
      return this.formatAbsoluteDate(date);
    },
    formatLeaveType(type) {
      if (!type) {
        return 'General';
      }
      const text = type.toString().replace(/[_-]/g, ' ');
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
    async updateLeaveStatus(leave, nextStatus) {
      if (!leave || !leave.id) {
        return;
      }
      const confirmationMessage =
        nextStatus === 'approved'
          ? `Approve ${leave.employee_name}'s leave request?`
          : `Reject ${leave.employee_name}'s leave request?`;
      if (!window.confirm(confirmationMessage)) {
        return;
      }
      this.processingLeaves = { ...this.processingLeaves, [leave.id]: nextStatus };
      try {
        this.showToast(
          `Leave ${nextStatus === 'approved' ? 'approved' : 'rejected'} for ${leave.employee_name}.`,
          'success',
        );
        // Optimistically update local list
        this.pendingTeamLeaves = this.pendingTeamLeaves.filter(item => item.id !== leave.id)
        this.teamLeaveSummary = {
          ...this.teamLeaveSummary,
          total: Math.max((this.teamLeaveSummary.total || 1) - 1, 0),
          by_status: { ...(this.teamLeaveSummary.by_status || {}), pending: Math.max((this.teamLeaveSummary.by_status?.pending || 1) - 1, 0) },
        }
      } finally {
        const next = { ...this.processingLeaves };
        delete next[leave.id];
        this.processingLeaves = next;
      }
    },
    showToast(message, type = 'info', duration = 4000) {
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
        this.toastTimer = null;
      }
      this.toast = { message, type };
      this.toastTimer = setTimeout(() => {
        this.toast = null;
        this.toastTimer = null;
      }, duration);
    },
    dismissToast() {
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
        this.toastTimer = null;
      }
      this.toast = null;
    },
    redirectToLogin() {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common[AUTH_HEADER];
      this.$router.push({ name: 'LoginPage', query: { redirect: this.$route.fullPath } });
    },
    async logout() {
      try {
        await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
      } catch (error) {
        console.warn('Logout request failed', error);
      } finally {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common[AUTH_HEADER];
        this.$router.push({ name: 'HomePage' });
      }
    },
  },
};
</script>

<style scoped>
.manager-dashboard {
  min-height: 100vh;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  color: #1e293b;
  overflow-x: hidden;
  overflow-y: auto;
}

.dashboard-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.dashboard-background .shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(0);
  opacity: 0.55;
}

.dashboard-background .shape-1 {
  width: 320px;
  height: 320px;
  top: -140px;
  left: -140px;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.28), rgba(59, 130, 246, 0));
}

.dashboard-background .shape-2 {
  width: 260px;
  height: 260px;
  top: -80px;
  right: -120px;
  background: radial-gradient(circle at center, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0));
}

.dashboard-background .shape-3 {
  width: 420px;
  height: 420px;
  bottom: -220px;
  left: 40%;
  transform: translateX(-50%);
  background: radial-gradient(circle at center, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0));
}

.dashboard-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  background: linear-gradient(115deg, rgba(15, 23, 42, 0.92), rgba(30, 64, 175, 0.88));
  color: #f8fafc;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 40;
}

.dashboard-header .header-inner {
  align-items: center;
}

.brand-link {
  display: inline-flex;
  align-items: center;
}

.workspace-label {
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.25);
  border: 1px solid rgba(148, 163, 184, 0.4);
  color: rgba(226, 232, 240, 0.92);
}

.dashboard-header a,
.dashboard-header button {
  color: inherit;
}

.dashboard-header nav button {
  color: rgba(226, 232, 240, 0.88);
  font-weight: 500;
}

.dashboard-header nav button:hover {
  color: #ffffff;
}

.dashboard-main {
  position: relative;
  z-index: 1;
  padding-top: 3rem;
  padding-bottom: 6rem;
}

.manager-dashboard .shadow-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
}

.floating-trigger {
  position: fixed;
  bottom: 32px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(203, 213, 225, 0.8);
  box-shadow: 0 24px 46px rgba(15, 23, 42, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  z-index: 20;
}

.floating-trigger:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 56px rgba(15, 23, 42, 0.18);
}

.floating-trigger img {
  width: 48px;
  height: 48px;
  display: block;
}

.floating-trigger .trigger-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
}

.chatbot-trigger {
  right: 32px;
}

.career-trigger {
  left: 32px;
}

.analytics-chart {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  height: 220px;
}

.analytics-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 48px;
}

.analytics-stack {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  gap: 4px;
  height: 170px;
}

.analytics-bar {
  width: 22px;
  border-radius: 999px;
  transition: height 0.2s ease, transform 0.2s ease;
}

.analytics-bar-approved {
  background: linear-gradient(180deg, #4ade80 0%, #16a34a 100%);
}

.analytics-bar-pending {
  background: linear-gradient(180deg, #facc15 0%, #d97706 100%);
}

.analytics-bar-rejected {
  background: linear-gradient(180deg, #f87171 0%, #dc2626 100%);
}

.analytics-column:hover .analytics-bar {
  transform: translateY(-4px);
}

.analytics-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
}

.status-breakdown {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-breakdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #e2e8f0;
  color: #1e293b;
}

.status-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
}

.status-chip-approved {
  background: rgba(34, 197, 94, 0.16);
  color: #15803d;
}

.status-chip-pending {
  background: rgba(250, 204, 21, 0.2);
  color: #b45309;
}

.status-chip-rejected {
  background: rgba(248, 113, 113, 0.18);
  color: #b91c1c;
}

.status-chip-cancelled {
  background: rgba(148, 163, 184, 0.2);
  color: #475569;
}

.status-pill {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pill-pending {
  background: rgba(251, 191, 36, 0.2);
  color: #b45309;
}

.status-pill-approved {
  background: rgba(74, 222, 128, 0.2);
  color: #15803d;
}

.status-pill-completed {
  background: rgba(148, 163, 184, 0.25);
  color: #334155;
}

.status-pill-rejected {
  background: rgba(248, 113, 113, 0.25);
  color: #b91c1c;
}

.status-pill-active {
  background: rgba(226, 232, 240, 0.4);
  color: #1e293b;
}

@media (max-width: 1024px) {
  .dashboard-background .shape-3 {
    width: 320px;
    height: 320px;
  }
}

@media (max-width: 768px) {
  .floating-trigger {
    bottom: 20px;
    padding: 8px 14px;
  }

  .floating-trigger img {
    width: 42px;
    height: 42px;
  }
}

@media (max-width: 640px) {
  .floating-trigger {
    bottom: 18px;
    padding: 8px;
  }

  .floating-trigger .trigger-label {
    display: none;
  }

  .chatbot-trigger {
    right: 16px;
  }

  .career-trigger {
    left: 16px;
  }
}
</style>
