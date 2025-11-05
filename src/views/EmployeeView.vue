<template>
  <div class="employee-dashboard" @click="closeNotifications">
    <div class="dashboard-background">
      <span class="shape shape-1"></span>
      <span class="shape shape-2"></span>
      <span class="shape shape-3"></span>
    </div>
    <div class="dashboard-content">
      <header class="dashboard-header">
      <div class="header-inner mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div class="flex flex-wrap items-center gap-6">
          <router-link class="brand-link" to="/employee/dashboard" aria-label="Alveon home">
            <BrandLogo size="sm" muted />
          </router-link>
          <span class="workspace-label">Employee Workspace</span>
          <nav class="hidden items-center gap-4 text-sm text-slate-200 md:flex">
            <button class="transition hover:text-white/80" type="button" @click.stop.prevent="scrollTo('section-overview')">Overview</button>
            <button class="transition hover:text-white/80" type="button" @click.stop.prevent="scrollTo('section-projects')">Projects</button>
            <button class="transition hover:text-white/80" type="button" @click.stop.prevent="scrollTo('section-team')">Team</button>
            <button class="transition hover:text-white/80" type="button" @click.stop.prevent="scrollTo('section-leave')">Leave</button>
            <button class="transition hover:text-white/80" type="button" @click.stop.prevent="scrollTo('section-support')">Support</button>
          </nav>
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
              <p class="text-xs text-slate-300">{{ displayJobTitle || 'Employee' }}</p>
            </div>
          </div>
          <button class="rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10" type="button" @click="logout">
            Logout
          </button>
        </div>
      </div>
      </header>

      <div
        v-if="toast"
        :class="[
          'fixed top-24 right-6 z-50 flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur transition',
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
        <button class="text-xl leading-none text-current hover:text-slate-900" type="button" @click="dismissToast">
          &times;
        </button>
      </div>
      <main class="dashboard-main mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div v-if="loading" class="flex flex-col items-center gap-4 rounded-2xl bg-white p-10 text-center shadow-card">
        <span class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"></span>
        <p class="text-sm text-slate-500">Loading your employee dashboard...</p>
      </div>

      <div v-else class="space-y-8">
        <div
          v-if="error"
          class="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 md:flex-row md:items-center md:justify-between"
        >
          <span>{{ error }}</span>
          <button
            class="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            type="button"
            @click="fetchDashboard"
          >
            Retry
          </button>
        </div>

        <section id="section-overview" class="rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-card">
          <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium uppercase tracking-wide text-slate-500">Personal workspace</p>
              <h1 class="text-3xl font-semibold text-slate-900">{{ displayName }}</h1>
              <p class="max-w-2xl text-sm text-slate-600">
                {{ overviewSubtitle }}
              </p>
            </div>
            <div class="flex flex-wrap gap-3">

              <button class="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50" type="button" @click.stop="openResignModal">
                Resign
              </button>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="card in insightCards"
            :key="card.id"
            class="rounded-2xl bg-white p-6 shadow-card"
          >
            <p class="text-sm font-medium text-slate-500">{{ card.label }}</p>
            <p class="mt-2 text-3xl font-semibold text-slate-900">{{ card.value }}</p>
            <p v-if="card.subline" class="mt-1 text-xs text-slate-500">{{ card.subline }}</p>
          </div>
        </section>

        <section id="section-projects" class="rounded-2xl bg-white shadow-card">
          <div class="space-y-6 px-6 py-6">
            <div class="space-y-2">
              <h2 class="text-lg font-semibold text-slate-900">Projects</h2>
              <p class="text-sm text-slate-500">
                {{ projectAnnouncement ? 'Latest update from your manager' : 'Stay aligned with current initiatives.' }}
              </p>
            </div>
            <div
              v-if="projectAnnouncement"
              class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"
            >
              <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Manager update</p>
              <h3 class="mt-1 text-base font-semibold text-slate-900">{{ projectAnnouncement.title }}</h3>
              <p class="mt-1 text-sm text-slate-700 whitespace-pre-line">{{ projectAnnouncement.description }}</p>
              <p class="mt-2 text-[11px] uppercase tracking-wide text-slate-400">
                Updated {{ formatRelativeDate(projectAnnouncement.lastUpdated) }}
              </p>
            </div>
            <div
              v-else
              class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500"
            >
              Your manager’s project updates will appear here when shared.
            </div>
            <div
              v-if="projectSummaryText"
              class="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500"
            >
              {{ projectSummaryText }}
            </div>
            <div v-if="projectList.length" class="rounded-xl border border-slate-100 bg-slate-50">
              <ul class="divide-y divide-slate-100">
                <li
                  v-for="assignment in projectList"
                  :key="assignment.name + (assignment.start_date || '')"
                  class="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div class="space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="text-sm font-semibold text-slate-900">{{ assignment.name }}</h3>
                      <span v-if="assignment.is_active" class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-600">Active</span>
                    </div>
                    <p v-if="assignment.role" class="text-xs text-slate-500">{{ assignment.role }}</p>
                    <p v-if="assignment.client" class="text-xs text-slate-500">Client | {{ assignment.client }}</p>
                    <p v-if="assignment.summary" class="text-xs text-slate-500">{{ assignment.summary }}</p>
                  </div>
                  <div class="text-xs text-slate-400">
                    <p>{{ formatAbsoluteDate(assignment.start_date) }} - {{ formatAbsoluteDate(assignment.end_date) }}</p>
                  </div>
                </li>
              </ul>
            </div>
            <div id="section-team" class="space-y-4 border-t border-slate-100 pt-6">
              <div class="space-y-1">
                <h3 class="text-lg font-semibold text-slate-900">Team roster</h3>
                <p class="text-sm text-slate-500">Your immediate collaborators</p>
              </div>
              <ul v-if="teamMembers.length" class="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
                <li v-for="member in teamMembers" :key="member.id" class="flex flex-col gap-1 px-5 py-4">
                  <p class="text-sm font-semibold text-slate-900">
                    {{ member.name }}
                    <span v-if="member.is_self" class="ml-1 text-xs font-medium text-blue-600">(You)</span>
                  </p>
                  <p class="text-xs text-slate-500">{{ member.job_title || member.employment_role || 'Member' }}</p>
                  <a v-if="member.email" :href="'mailto:' + member.email" class="text-xs font-medium text-blue-600 hover:text-blue-500">
                    {{ member.email }}
                  </a>
                </li>
              </ul>
              <p v-else class="px-6 py-6 text-center text-sm text-slate-500">{{ teamEmptyMessage }}</p>
            </div>
          </div>
        </section>

        <section id="section-leave" class="space-y-6 rounded-2xl bg-white shadow-card">
          <div class="flex flex-col gap-4 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Leave summary</h2>
              <p class="text-sm text-slate-500">Track balances and recent requests</p>
            </div>
            <button class="rounded-full border border-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-600 transition hover:bg-blue-50" type="button" @click="openLeaveModal">
              Apply for leave
            </button>
          </div>
          <div class="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total requests</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ totalLeaveRequests }}</p>
            </div>
            <div v-if="leaveRemainingDays !== null" class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Days remaining</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ leaveRemainingDays }}</p>
              <p v-if="leaveAllowanceDays" class="mt-1 text-xs text-slate-500">of {{ leaveAllowanceDays }} days</p>
            </div>
            <div v-if="leaveUsedDays !== null" class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Days used</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ leaveUsedDays }}</p>
            </div>
            <div
              v-for="row in leaveSummaryRows"
              :key="row.status"
              class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ formatStatus(row.status) }}</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ row.count }}</p>
            </div>
          </div>
          <div v-if="recentLeaves.length" class="overflow-x-auto px-6 pb-6">
            <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-4 py-3 font-medium">Leave type</th>
                  <th class="px-4 py-3 font-medium">Dates</th>
                  <th class="px-4 py-3 font-medium">Status</th>
                  <th class="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="leave in recentLeaves" :key="leave.id">
                  <td class="px-4 py-3 text-slate-700">{{ formatLeaveType(leave.leave_type) }}</td>
                  <td class="px-4 py-3 text-sm text-slate-500">{{ leave.dateRange }}</td>
                  <td class="px-4 py-3">
                    <span
                      :class="[
                        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                        leave.statusClass === 'success'
                          ? 'bg-emerald-100 text-emerald-600'
                          : leave.statusClass === 'warning'
                          ? 'bg-amber-100 text-amber-600'
                          : leave.statusClass === 'danger'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-slate-100 text-slate-600',
                      ]"
                    >
                      {{ formatStatus(leave.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button
                      v-if="canWithdraw(leave)"
                      class="rounded-full border border-rose-400 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      :disabled="Boolean(withdrawProcessing[leave.id])"
                      @click="withdrawLeave(leave)"
                    >
                      {{ withdrawProcessing[leave.id] ? 'Processing...' : 'Withdraw' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="px-6 pb-6 text-sm text-slate-500">No leave requests yet.</p>
        </section>
        <section class="rounded-2xl bg-white shadow-card">
          <div id="section-support" class="space-y-6">
            <div class="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 class="text-lg font-semibold text-slate-900">HR questions</h2>
                <p class="text-sm text-slate-500">Follow up on escalated requests</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button class="rounded-full border border-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-600 transition hover:bg-blue-50" type="button" @click="openChatbot">
                  Ask HR
                </button>
                <button class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-100" type="button" @click="openFeedback">
                  Share feedback
                </button>
              </div>
            </div>
            <div class="px-6 pb-6">
              <div v-if="hrQuestionsLoading" class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Checking for updates...
              </div>
              <div v-else-if="hrQuestionsError" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-600">
                {{ hrQuestionsError }}
              </div>
              <div v-else-if="hrQuestions.length" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th class="px-4 py-3 font-medium">Question</th>
                      <th class="px-4 py-3 font-medium">Status</th>
                      <th class="px-4 py-3 font-medium">Submitted</th>
                      <th class="px-4 py-3 font-medium">Answer</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="question in hrQuestions" :key="question.id">
                      <td class="px-4 py-3 text-sm text-slate-700">{{ truncateText(question.question, 120) }}</td>
                      <td class="px-4 py-3">
                        <span
                          :class="[
                            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                            question.statusClass === 'success'
                              ? 'bg-emerald-100 text-emerald-600'
                              : question.statusClass === 'warning'
                              ? 'bg-amber-100 text-amber-600'
                              : question.statusClass === 'danger'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-slate-100 text-slate-600',
                          ]"
                        >
                          {{ formatStatus(question.status) }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-xs text-slate-500">{{ question.submittedAtReadable }}</td>
                      <td class="px-4 py-3 text-sm text-slate-600">
                        <template v-if="question.hasAnswer">
                          <p>{{ truncateText(question.answer, 160) }}</p>
                          <small v-if="question.updatedAtReadable" class="mt-1 block text-xs text-slate-400">
                            Updated {{ question.updatedAtReadable }}
                          </small>
                        </template>
                        <span v-else class="text-xs font-medium uppercase tracking-wide text-slate-400">Awaiting response</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                No questions have been escalated yet.
              </p>
            </div>
          </div>

          <div class="rounded-2xl bg-white shadow-card">
            <div class="border-b border-slate-100 px-6 py-4">
              <h2 class="text-lg font-semibold text-slate-900">Upcoming events</h2>
              <p class="text-sm text-slate-500">Stay prepared for what's ahead</p>
            </div>
            <div v-if="upcomingEvents.length" class="divide-y divide-slate-100">
              <div v-for="event in upcomingEvents" :key="event.id || event.title" class="flex items-start gap-4 px-6 py-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-xl text-white">
                  &#128197;
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-slate-900">{{ event.title }}</p>
                  <p class="text-xs text-slate-500">
                    {{ event.date_label || formatAbsoluteDate(event.date || event.event_date || event.start_date) }}
                    <span v-if="event.time || event.time_label"> | {{ event.time || event.time_label }}</span>
                    <span v-if="event.location || event.location_label"> | {{ event.location || event.location_label }}</span>
                  </p>
                  <p v-if="event.description" class="mt-2 text-xs text-slate-500">{{ event.description }}</p>
                </div>
              </div>
            </div>
            <p v-else class="px-6 py-12 text-sm text-slate-500">No upcoming events scheduled.</p>
          </div>
        </section>

        <section v-if="showOffboardingCard" class="rounded-2xl bg-white shadow-card">
          <div class="border-b border-slate-100 px-6 py-4">
            <h2 class="text-lg font-semibold text-slate-900">Offboarding status</h2>
          </div>
          <div v-if="offboardingCard" class="space-y-3 px-6 py-6 text-sm text-slate-600">
            <p>
              <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
                {{ offboardingCard.status_label }}
              </span>
            </p>
            <p>{{ offboardingCard.message }}</p>
            <p v-if="offboardingCard.last_day"><strong>Requested last day:</strong> {{ formatAbsoluteDate(offboardingCard.last_day) }}</p>
            <p v-if="offboardingCard.notice_period"><strong>Notice period:</strong> {{ offboardingCard.notice_period }}</p>
            <p v-if="offboardingCard.handover_plan"><strong>Handover focus:</strong> {{ offboardingCard.handover_plan }}</p>
            <p v-if="offboardingCard.notes"><strong>Notes:</strong> {{ offboardingCard.notes }}</p>
          </div>
        </section>
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
                <option value="online">Online courses</option>
                <option value="mentorship">Mentorship</option>
                <option value="project">Project-based assignments</option>
                <option value="certification">Certification bootcamps</option>
                <option value="blended">A blended approach</option>
              </select>
            </label>
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Timeline</span>
              <select v-model="careerForm.timeline" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="0-3">0-3 months</option>
                <option value="3-6">3-6 months</option>
                <option value="6-12">6-12 months</option>
                <option value="12+">12+ months</option>
              </select>
            </label>
          </div>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">What support would help most?</span>
            <textarea v-model="careerForm.guidance_goal" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Mention projects, mentors, or skills you would like to explore"></textarea>
          </label>
          <p v-if="careerFormError" class="text-sm font-medium text-rose-600">{{ careerFormError }}</p>
          <div class="flex justify-end gap-3">
            <button class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100" type="button" @click="closeCareerModal">
              Cancel
            </button>
            <button class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60" type="submit" :disabled="submittingCareerForm">
              {{ submittingCareerForm ? 'Submitting...' : 'Share goals' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="showFeedbackModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8" @click.self="closeFeedbackModal">
      <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <h2 class="text-lg font-semibold text-slate-900">Share feedback</h2>
          <button class="text-2xl leading-none text-slate-400 transition hover:text-slate-600" type="button" @click="closeFeedbackModal">-</button>
        </div>
        <form class="space-y-4 px-6 py-5" @submit.prevent="submitFeedback">
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Subject</span>
            <input v-model="feedbackForm.subject" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="e.g. Workspace experience">
          </label>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Rating</span>
            <select v-model="feedbackForm.rating" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option disabled value="">Select rating</option>
              <option value="5">Excellent</option>
              <option value="4">Good</option>
              <option value="3">Average</option>
              <option value="2">Needs improvement</option>
              <option value="1">Poor</option>
            </select>
          </label>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Message</span>
            <textarea v-model="feedbackForm.message" rows="4" required class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Share your thoughts"></textarea>
          </label>
          <p v-if="feedbackError" class="text-sm font-medium text-rose-600">{{ feedbackError }}</p>
          <div class="flex justify-end gap-3">
            <button class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100" type="button" @click="closeFeedbackModal">
              Cancel
            </button>
            <button class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60" type="submit" :disabled="submittingFeedback">
              {{ submittingFeedback ? 'Sending...' : 'Send feedback' }}
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
              v-for="entry in chatHistory"
              :key="entry.id"
              class="flex flex-col gap-1 rounded-xl bg-white p-3 shadow-inner"
            >
              <p class="text-sm font-semibold text-slate-700">You</p>
              <p class="text-sm text-slate-600">{{ entry.prompt }}</p>
              <p v-if="entry.response" class="mt-2 text-sm font-semibold text-slate-700">HR Support</p>
              <p v-if="entry.response" class="text-sm text-slate-600">{{ entry.response }}</p>
              <small class="text-xs text-slate-400">{{ entry.createdAtReadable }}</small>
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
          <p v-if="chatbotReply && !chatHistory.length" class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
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
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ field.label }}</span>
              <span class="text-sm text-slate-700">{{ field.value }}</span>
            </div>
          </div>
          <p v-else class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Profile details are not available.
          </p>
        </div>
      </div>
    </div>

    <div v-if="showResignModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8" @click.self="closeResignModal">
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Resignation request</h2>
            <p class="text-sm text-slate-500">Share details so HR can support your transition</p>
          </div>
          <button class="text-2xl leading-none text-slate-400 transition hover:text-slate-600" type="button" @click="closeResignModal">-</button>
        </div>
        <form class="space-y-4 px-6 py-5" @submit.prevent="submitResignForm">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Last working day</span>
              <input v-model="resignForm.last_day" type="date" required class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
            </label>
            <label class="block space-y-2 text-sm">
              <span class="font-medium text-slate-700">Notice period</span>
              <select v-model="resignForm.notice_period" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">Select</option>
                <option value="2 weeks">2 weeks</option>
                <option value="30 days">30 days</option>
                <option value="60 days">60 days</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Reason</span>
            <textarea v-model="resignForm.reason" rows="3" required class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"></textarea>
          </label>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Handover plan</span>
            <textarea v-model="resignForm.handover_plan" rows="2" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Outline any key handover tasks"></textarea>
          </label>
          <label class="block space-y-2 text-sm">
            <span class="font-medium text-slate-700">Additional notes</span>
            <textarea v-model="resignForm.notes" rows="2" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"></textarea>
          </label>
          <p v-if="resignFormError" class="text-sm font-medium text-rose-600">{{ resignFormError }}</p>
          <div class="flex justify-end gap-3">
            <button class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100" type="button" @click="closeResignModal">
              Cancel
            </button>
            <button class="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400" type="submit">
              Submit notice
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

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000/api';
const AUTH_HEADER = 'Authentication-Token';
const PROJECT_ANNOUNCEMENT_STORAGE_KEY = 'employee:project-announcement';

export default {
  name: 'EmployeeDashboard',
  components: {
    BrandLogo,
  },
  data() {
    return {
      loading: false,
      error: '',
      profile: null,
      stats: [],
      leaveSummary: null,
      recentLeaves: [],
      upcomingEvents: [],
      notifications: [],
      showNotifications: false,
      notificationsLoading: false,
      notificationsError: '',
      hrQuestions: [],
      hrQuestionsLoading: false,
      hrQuestionsError: '',
      projectAssignments: null,
      projectAnnouncement: null,
      teamOverview: null,
      chatbot: null,
      offboarding: null,
      showLeaveModal: false,
      leaveForm: {
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        reason: '',
      },
      leaveFormError: '',
      submittingLeave: false,
      withdrawProcessing: {},
      showFeedbackModal: false,
      feedbackForm: {
        subject: '',
        rating: '',
        message: '',
      },
        feedbackError: '',
        submittingFeedback: false,
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
        toast: null,
        toastTimer: null,
        currentUserName: 'Employee',
      };
  },
  computed: {
    displayName() {
      if (this.profile && this.profile.full_name) {
        return this.profile.full_name;
      }
      return this.currentUserName;
    },
    displayJobTitle() {
      return this.profile && this.profile.job_title ? this.profile.job_title : '';
    },
    initials() {
      const parts = (this.displayName || '').trim().split(/\s+/);
      const letters = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase());
      return letters.join('') || 'E';
    },
    overviewSubtitle() {
      const job = this.displayJobTitle;
      const department = this.profile && this.profile.department ? this.profile.department : '';
      if (job && department) {
        return `${job} | ${department}`;
      }
      if (job) {
        return job;
      }
      if (department) {
        return `Department ${department}`;
      }
      return 'Stay on top of your projects, leave, and HR updates.';
    },
    activeProjectCount() {
      if (this.projectAssignments && typeof this.projectAssignments.active_count === 'number') {
        return this.projectAssignments.active_count;
      }
      return 0;
    },
    insightCards() {
      const remaining = this.leaveRemainingDays;
      const used = this.leaveUsedDays;
      const allowance = this.leaveAllowanceDays;
      const total = this.totalLeaveRequests;
      return [
        {
          id: 'leave-remaining',
          label: 'Remaining leave',
          value: remaining !== null ? remaining : '--',
          subline: allowance ? `of ${allowance} days` : null,
        },
        {
          id: 'leave-used',
          label: 'Days used',
          value: used !== null ? used : '--',
          subline: used !== null ? 'This year' : null,
        },
        {
          id: 'leave-total',
          label: 'Total requests',
          value: typeof total === 'number' ? total : '--',
          subline: total === 1 ? 'Request filed' : 'Requests filed',
        },
        {
          id: 'projects-active',
          label: 'Active projects',
          value: this.activeProjectCount,
          subline: this.projectSummaryText || null,
        },
      ];
    },
    leaveSummaryRows() {
      const summary = (this.leaveSummary && this.leaveSummary.by_status) || {};
      const order = ['approved', 'pending', 'rejected', 'cancelled'];
      const ordered = order.filter((status) => summary[status]).map((status) => ({ status, count: summary[status] }));
      const others = Object.keys(summary)
        .filter((status) => !order.includes(status))
        .map((status) => ({ status, count: summary[status] }));
      return [...ordered, ...others];
    },
    totalLeaveRequests() {
      return this.leaveSummary && typeof this.leaveSummary.total === 'number' ? this.leaveSummary.total : 0;
    },
    leaveBalance() {
      return this.leaveSummary && this.leaveSummary.balance ? this.leaveSummary.balance : null;
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
        metadata: item.metadata || null,
      }));
    },
    projectList() {
      return this.projectAssignments && Array.isArray(this.projectAssignments.assignments)
        ? this.projectAssignments.assignments
        : [];
    },
    projectSummaryText() {
      if (!this.projectAssignments) {
        return '';
      }
      const active = this.projectAssignments.active_count || 0;
      const total = this.projectAssignments.history_count || 0;
      if (!active && !total) {
        return '';
      }
      return `${active} active | ${total} total`;
    },
    teamMembers() {
      return this.teamOverview && Array.isArray(this.teamOverview.members) ? this.teamOverview.members : [];
    },
    teamEmptyMessage() {
      if (this.teamOverview && this.teamOverview.empty_message) {
        return this.teamOverview.empty_message;
      }
      return 'No teammates listed.';
    },
    chatbotHeadline() {
      if (this.chatbot) {
        return this.chatbot.headline || this.chatbot.subtitle || 'I can help with policy and leave questions!';
      }
      return 'I can help with policy and leave questions!';
    },
    chatbotSubtitle() {
      return this.chatbot && this.chatbot.subtitle ? this.chatbot.subtitle : '';
    },
    chatbotStatusLabel() {
      if (!this.chatbotStatus) {
        return '';
      }
      const mapping = {
        pending: 'We have escalated this question to HR for a personalised response.',
        auto_answered: 'Answered using verified HR policies.',
        error: 'We ran into an issue processing the question.',
      };
      return mapping[this.chatbotStatus] || this.chatbotStatus;
    },
    showOffboardingCard() {
      return Boolean(this.resignationDetails);
    },
    offboardingCard() {
      if (this.resignationDetails) {
        return this.resignationDetails;
      }
      if (this.offboarding && this.offboarding.status && this.offboarding.status !== 'active') {
        return {
          status_label: this.offboarding.status_label || 'Offboarding in progress',
          message: this.offboarding.message || 'Please follow the shared exit checklist.',
          last_day: this.offboarding.last_updated || null,
          notice_period: this.offboarding.notice_period || null,
          handover_plan: null,
          notes: this.offboarding.pending_tasks ? `Tasks pending: ${this.offboarding.pending_tasks}` : null,
        };
      }
      return null;
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
    this.fetchDashboard();
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
    setProjectAnnouncement(payload, { persist = false } = {}) {
      const normalized = this.normalizeProjectAnnouncement(payload);
      this.projectAnnouncement = normalized;
      if (persist) {
        this.persistProjectAnnouncement(normalized);
      }
    },
    loadProjectAnnouncement() {
      try {
        const raw = localStorage.getItem(PROJECT_ANNOUNCEMENT_STORAGE_KEY);
        this.setProjectAnnouncement(raw ? JSON.parse(raw) : null);
      } catch (error) {
        console.warn('Unable to parse project announcement from local storage', error);
        this.projectAnnouncement = null;
      }
    },
    async fetchProjectAnnouncementFallback() {
      try {
        const response = await axios.get(`${API_BASE_URL}/employee/project-announcement`, {
          withCredentials: true,
        });
        const payload = response.data?.project_announcement;
        if (payload && (payload.title || payload.description)) {
          this.setProjectAnnouncement(payload, { persist: true });
          return;
        }
      } catch (error) {
        console.warn('Unable to load project announcement fallback', error);
      }
      if (!this.projectAnnouncement) {
        this.loadProjectAnnouncement();
      }
    },
    handleStorageEvent(event) {
      if (!event) {
        return;
      }
      if (event.key === PROJECT_ANNOUNCEMENT_STORAGE_KEY) {
        try {
          this.setProjectAnnouncement(event.newValue ? JSON.parse(event.newValue) : null);
        } catch (error) {
          console.warn('Unable to parse project announcement from storage event', error);
        }
      }
    },
    async fetchDashboard() {
      this.loading = true;
      this.error = '';
      try {
        const response = await axios.get(`${API_BASE_URL}/employee/dashboard`, { withCredentials: true });
        const data = response.data || {};
        this.profile = data.profile || null;
        this.leaveSummary = data.leave_summary || null;
        this.recentLeaves = (data.recent_leaves || []).map((leave) => this.decorateLeave(leave));
        this.upcomingEvents = data.upcoming_events || [];
        this.notifications = data.notifications || [];
        this.projectAssignments = data.project_assignments || null;
        this.teamOverview = data.team_overview || null;
        this.chatbot = data.chatbot || null;
        this.offboarding = data.offboarding || null;
        const incomingAnnouncement = data.project_announcement;
        if (incomingAnnouncement && (incomingAnnouncement.title || incomingAnnouncement.description)) {
          this.setProjectAnnouncement(incomingAnnouncement, { persist: true });
        } else {
          await this.fetchProjectAnnouncementFallback();
        }
        await this.loadHrQuestions();
        if (this.profile && this.profile.job_title && !this.careerForm.current_role) {
          this.careerForm.current_role = this.profile.job_title;
        }
      } catch (error) {
        console.error('Failed to load dashboard', error);
        const message =
          (error.response && (error.response.data?.error || error.response.data?.message)) ||
          error.message ||
          'Unable to load dashboard right now.';
        this.error = message;
        if (error.response && error.response.status === 401) {
          this.redirectToLogin();
        }
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
        const response = await axios.get(`${API_BASE_URL}/notifications`, {
          params: { unread_only: true },
          withCredentials: true
        });
        const data = response.data || {};
        this.notifications = data.notifications || [];
      } catch (error) {
        console.error('Failed to load notifications', error);
        const message =
          (error.response && (error.response.data?.error || error.response.data?.message)) ||
          error.message ||
          'Unable to load notifications.';
        this.notificationsError = message;
      } finally {
        this.notificationsLoading = false;
      }
    },
    async markNotificationRead(notification, { remove = false } = {}) {
      if (!notification) {
        return;
      }
      if (!notification.isRead) {
        try {
          await axios.post(
            `${API_BASE_URL}/notifications/${notification.id}/read`,
            {},
            { withCredentials: true }
          );
        } catch (error) {
          console.error('Failed to mark notification as read', error);
        }
      }
      this.notifications = this.notifications.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      );
      if (remove) {
        this.notifications = this.notifications.filter((item) => item.id !== notification.id);
      }
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
    async dismissNotification(notification) {
      await this.markNotificationRead(notification, { remove: true });
    },
    async loadHrQuestions() {
      this.hrQuestionsLoading = true;
      this.hrQuestionsError = '';
      try {
        const response = await axios.get(`${API_BASE_URL}/hr/questions`, {
          params: { status: 'pending,resolved' },
          withCredentials: true,
        });
        const data = response.data || {};
        const questions = Array.isArray(data.questions) ? data.questions : [];
        this.hrQuestions = questions.map((item) => this.decorateHrQuestion(item));
      } catch (error) {
        console.error('Failed to load HR questions', error);
        const message =
          (error.response && (error.response.data?.error || error.response.data?.message)) ||
          error.message ||
          'Unable to load HR questions.';
        this.hrQuestionsError = message;
        this.hrQuestions = [];
      } finally {
        this.hrQuestionsLoading = false;
      }
    },
    decorateHrQuestion(question) {
      const createdAt = question.created_at || question.createdAt || null;
      const updatedAt = question.updated_at || question.updatedAt || null;
      return {
        ...question,
        createdAt,
        updatedAt,
        submittedAtReadable: createdAt ? this.formatAbsoluteDate(createdAt) : '-',
        updatedAtReadable: updatedAt ? this.formatRelativeDate(updatedAt) : '',
        statusClass: this.statusToClass(question.status),
        hasAnswer: Boolean(question.answer),
      };
    },
    redirectToLogin() {
      localStorage.removeItem('currentUser');
      this.$router.push({ name: 'LoginPage', query: { redirect: this.$route.fullPath } });
    },
    formatStatus(status) {
      if (!status) {
        return 'Unknown';
      }
      const text = status.toString().toLowerCase();
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
    formatLeaveType(type) {
      if (!type) {
        return 'General';
      }
      const text = type.toString().replace(/[_-]/g, ' ');
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
    decorateLeave(leave) {
      const startDate = this.parseISODate(leave.start_date);
      const endDate = this.parseISODate(leave.end_date);
      return {
        ...leave,
        startDate,
        endDate,
        dateRange: this.formatDateRange(startDate, endDate),
        statusClass: this.statusToClass(leave.status),
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
      if (!end) {
        return from;
      }
      if (start.getTime() === end.getTime()) {
        return from;
      }
      return `${from} - ${this.formatAbsoluteDate(end)}`;
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
        return `${minutes} min ago`;
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
    truncateText(text, limit = 120) {
      if (!text) {
        return '';
      }
      const value = text.toString();
      if (value.length <= limit) {
        return value;
      }
      return `${value.slice(0, limit).trim()}...`;
    },
    statusToClass(status) {
      const text = (status || '').toString().toLowerCase();
      if (text === 'approved') {
        return 'success';
      }
      if (text === 'pending') {
        return 'warning';
      }
      if (text === 'rejected' || text === 'cancelled') {
        return 'danger';
      }
      return 'muted';
    },
    canWithdraw(leave) {
      const status = (leave.status || '').toString().toLowerCase();
      if (status !== 'pending') {
        return false;
      }
      if (!leave.startDate) {
        return true;
      }
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      return leave.startDate.getTime() >= today.getTime();
    },
    scrollTo(id) {
      if (!id) {
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
      if (!this.careerForm.target_role) {
        this.careerFormError = 'Please share the role you are aiming for.';
        return;
      }
      this.submittingCareerForm = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        this.showToast('Career planner insights are on their way to your inbox!', 'success');
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
        console.error('Failed to generate career plan', error);
        this.careerFormError = 'Unable to prepare a plan right now. Please try again.';
      } finally {
        this.submittingCareerForm = false;
      }
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
        await this.fetchDashboard();
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
    async withdrawLeave(leave) {
      if (!leave || !leave.id) {
        return;
      }
      if (!window.confirm('Withdraw this leave request?')) {
        return;
      }
      this.withdrawProcessing = { ...this.withdrawProcessing, [leave.id]: true };
      try {
        await axios.post(`${API_BASE_URL}/leave/${leave.id}/cancel`, {}, { withCredentials: true });
        this.showToast('Leave request withdrawn.', 'success');
        await this.fetchDashboard();
      } catch (error) {
        console.error('Failed to withdraw leave', error);
        const message =
          (error.response && (error.response.data?.error || error.response.data?.message)) ||
          error.message ||
          'Unable to withdraw leave request.';
        this.showToast(message, 'error');
      } finally {
        const next = { ...this.withdrawProcessing };
        delete next[leave.id];
        this.withdrawProcessing = next;
      }
    },
    openFeedback() {
      this.feedbackError = '';
      this.showFeedbackModal = true;
    },
    closeFeedbackModal() {
      this.showFeedbackModal = false;
      this.feedbackError = '';
      this.feedbackForm = { subject: '', rating: '', message: '' };
    },
    async submitFeedback() {
      this.feedbackError = '';
      if (!this.feedbackForm.message) {
        this.feedbackError = 'Please add a message.';
        return;
      }
      this.submittingFeedback = true;
      try {
        await axios.post(
          `${API_BASE_URL}/employee/feedback`,
          {
            subject: this.feedbackForm.subject || 'General',
            rating: this.feedbackForm.rating || null,
            message: this.feedbackForm.message,
          },
          { withCredentials: true },
        );
        this.showToast('Thanks for sharing your feedback!', 'success');
        this.closeFeedbackModal();
      } catch (error) {
        console.error('Failed to submit feedback', error);
        const message =
          (error.response && (error.response.data?.error || error.response.data?.message)) ||
          error.message ||
          'Unable to send feedback.';
        this.feedbackError = message;
      } finally {
        this.submittingFeedback = false;
      }
    },
    openChatbot() {
      this.chatbotPrompt = '';
      this.chatbotReply = '';
      this.chatbotLoading = false;
      this.chatbotStatus = '';
      this.chatbotReference = '';
      this.chatbotTicketId = null;
      this.chatHistory = [];
      this.showChatbotModal = true;
    },
    closeChatbot() {
      this.showChatbotModal = false;
      this.chatbotLoading = false;
      this.chatHistory = [];
    },
    async submitChatbotPrompt() {
      if (!this.chatbotPrompt) {
        return;
      }
      const pendingMessage = {
        sender: 'user',
        content: this.chatbotPrompt,
        timestamp: new Date().toISOString(),
      };
      this.chatHistory = [...this.chatHistory, pendingMessage];
      this.chatbotLoading = true;
      try {
        const response = await axios.post(
          `${API_BASE_URL}/employee/chatbot`,
          { message: this.chatbotPrompt },
          { withCredentials: true },
        );
        const payload = response.data || {};
        const normalizeMessage = (entry) => ({
          sender: entry.sender || 'assistant',
          content: entry.content || '',
          timestamp: entry.timestamp || new Date().toISOString(),
        });
        if (Array.isArray(payload.messages) && payload.messages.length) {
          this.chatHistory = payload.messages.map(normalizeMessage);
        } else {
          const assistantMessage = normalizeMessage({
            sender: 'assistant',
            content: payload.response || 'HR bot has recorded your message.',
          });
          this.chatHistory = [...this.chatHistory, assistantMessage];
        }
        this.chatbotReply =
          payload.response ||
          (Array.isArray(payload.messages)
            ? payload.messages
                .filter((msg) => msg.sender !== 'user')
                .map((msg) => msg.content)
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
          // Use the returned tasks / leave request if needed
          this.showToast('Resignation request submitted to HR.', 'success')
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.employee-dashboard {
  
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

.employee-dashboard .shadow-card {
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

@media (max-width: 1024px) {
  .shape-3 {
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
