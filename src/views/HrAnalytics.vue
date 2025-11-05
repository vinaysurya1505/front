<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <h2>Recruitment Analytics</h2>
        <p class="panel-subtitle">At-a-glance metrics from the latest intake.</p>
      </div>
      <button class="link-btn" type="button" @click="parentContext.fetchAnalytics">Refresh Analytics</button>
    </header>

    <div class="analytics-grid">
      <article class="chart-card">
        <h3>Applicants by Gender</h3>
        <div class="bar-chart">
          <div class="bar-item" v-for="(value, label) in genderEntries" :key="label">
            <span class="bar-label">{{ label }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: parentContext.getBarWidth(value, 'gender') }"></div>
              <span class="bar-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="chart-card">
        <h3>Applicants by Source</h3>
        <div class="bar-chart">
          <div class="bar-item" v-for="(value, label) in sourceEntries" :key="label">
            <span class="bar-label">{{ label }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: parentContext.getBarWidth(value, 'source') }"></div>
              <span class="bar-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="chart-card">
        <h3>Applicants by Status</h3>
        <div class="bar-chart">
          <div class="bar-item" v-for="(value, label) in statusEntries" :key="label">
            <span class="bar-label">{{ label }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: parentContext.getBarWidth(value, 'status') }"></div>
              <span class="bar-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="chart-card">
        <h3>Top Skills</h3>
        <ul class="skills-list">
          <li v-for="skill in topSkills" :key="skill.skill">
            <span>{{ skill.skill }}</span>
            <strong>{{ skill.count }}</strong>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'HrAnalytics',
  props: {
    context: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const parentContext = computed(() => props.context)
    const genderEntries = computed(() => parentContext.value.genderAnalytics || { Male: 0, Female: 0, Other: 0 })
    const sourceEntries = computed(() => parentContext.value.sourceAnalytics || {})
    const statusEntries = computed(() => parentContext.value.statusAnalytics || {})
    const topSkills = computed(() => parentContext.value.topSkills || [])

    return {
      parentContext,
      genderEntries,
      sourceEntries,
      statusEntries,
      topSkills,
    }
  },
}
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.panel-subtitle {
  margin: 4px 0 0;
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

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 20px 22px;
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.1);
}

.chart-card h3 {
  margin: 0 0 16px;
  color: #1f2937;
  font-size: 1rem;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar-label {
  font-weight: 600;
  color: #334155;
  font-size: 0.9rem;
}

.bar-track {
  position: relative;
  height: 12px;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.8);
  overflow: hidden;
}

.bar-fill {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #38bdf8, #6366f1);
  transition: width 0.3s ease;
}

.bar-value {
  margin-top: 4px;
  font-size: 0.8rem;
  color: #475569;
  font-weight: 600;
}

.skills-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skills-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(248, 250, 252, 0.9);
  border-radius: 12px;
  padding: 10px 14px;
  color: #1f2937;
  font-weight: 500;
}

.skills-list strong {
  color: #2563eb;
}
</style>




