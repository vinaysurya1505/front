<template>
  <div class="hr-overview">
    <section class="hero">
      <div>
        <p class="hero-label">Recruitment Intelligence</p>
        <h1>Super Admin Dashboard</h1>
        <p class="hero-subtitle">
          Manage resumes, orchestrate hiring, and monitor analytics in one place.
        </p>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card" v-for="item in stats" :key="item.label">
        <div class="stat-icon">{{ item.icon }}</div>
        <div>
          <h3>{{ item.value }}</h3>
          <p class="stat-title">{{ item.label }}</p>
          <p class="stat-subtitle">{{ item.subtitle }}</p>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HrOverview',
  props: {
    context: {
      type: Object,
      required: true,
    },
  },
  computed: {
    stats() {
      const analytics = this.context.analytics || {}
      return [
        {
          icon: '📁',
          label: 'Total Candidates',
          value: analytics.total_candidates || 0,
          subtitle: 'Profiles processed',
        },
        {
          icon: '📝',
          label: 'Job Descriptions',
          value: this.context.jobDescriptions.length || 0,
          subtitle: 'Active openings',
        },
        {
          icon: '⏱️',
          label: 'Avg Experience',
          value: analytics.average_experience ? `${analytics.average_experience} yrs` : '0 yrs',
          subtitle: 'Candidate experience',
        },
        {
          icon: '🤝',
          label: 'Matched Candidates',
          value: this.context.matchedCandidates.length || 0,
          subtitle: 'Awaiting review',
        },
      ]
    },
  },
}
</script>

<style scoped>
.hr-overview {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.hero {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(124, 58, 237, 0.12));
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 24px;
  padding: 32px;
  color: #1e293b;
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
}

.hero-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #1d4ed8;
  margin-bottom: 12px;
  font-weight: 600;
}

.hero h1 {
  font-size: 2.2rem;
  margin: 0 0 10px;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  margin: 0;
  font-size: 1.05rem;
  color: #475569;
  max-width: 560px;
  line-height: 1.6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.28), rgba(59, 130, 246, 0.32));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}

.stat-card h3 {
  margin: 0;
  font-size: 1.8rem;
  color: #0f172a;
}

.stat-title {
  margin: 6px 0 0;
  font-weight: 600;
  color: #1f2937;
}

.stat-subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.85rem;
}
</style>
