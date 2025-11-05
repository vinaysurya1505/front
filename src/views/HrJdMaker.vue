<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <h2>AI Job Description Builder</h2>
        <p class="panel-subtitle">Craft role descriptions and publish openings instantly</p>
      </div>
    </header>

    <form class="jd-form" @submit.prevent="parentContext.generateJD">
      <div class="form-grid">
        <label class="form-field">
          <span>Job Title *</span>
          <input v-model="generator.title" type="text" placeholder="e.g., Senior Backend Engineer" required />
        </label>
        <label class="form-field">
          <span>Department</span>
          <input v-model="generator.department" type="text" placeholder="e.g., Engineering" />
        </label>
        <label class="form-field">
          <span>Experience Level</span>
          <select v-model="generator.experience_level">
            <option value="">Select level</option>
            <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
            <option value="Mid Level (3-5 years)">Mid Level (3-5 years)</option>
            <option value="Senior Level (6-10 years)">Senior Level (6-10 years)</option>
            <option value="Executive (10+ years)">Executive (10+ years)</option>
          </select>
        </label>
        <label class="form-field">
          <span>Employment Type</span>
          <select v-model="generator.employment_type">
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </label>
        <label class="form-field">
          <span>Location</span>
          <input v-model="generator.location" type="text" placeholder="e.g., Remote or Bengaluru" />
        </label>
        <label class="form-field">
          <span>Salary Range</span>
          <input v-model="generator.salary_range" type="text" placeholder="e.g., â‚¹18L - â‚¹24L" />
        </label>
      </div>

      <label class="form-field">
        <span>Key Skills (comma separated)</span>
        <input v-model="generator.key_skills" type="text" placeholder="Node.js, PostgreSQL, Microservices" />
      </label>

      <label class="form-field">
        <span>Responsibilities</span>
        <textarea
          v-model="generator.responsibilities"
          rows="4"
          placeholder="Outline key responsibilities for this role."
        ></textarea>
      </label>

      <label class="form-field">
        <span>Qualifications</span>
        <textarea
          v-model="generator.qualifications"
          rows="3"
          placeholder="List qualifications or certifications."
        ></textarea>
      </label>

      <div class="form-actions">
        <button class="primary" type="submit" :disabled="generator.loading">
          {{ generator.loading ? 'Generating...' : 'Generate JD' }}
        </button>
        <button
          class="secondary"
          type="button"
          :disabled="!generator.generated"
          @click="parentContext.saveGeneratedJD"
        >
          Save Generated JD
        </button>
      </div>
    </form>

    <section v-if="generator.generated" class="generated-preview">
      <div class="preview-header">
        <h3>Generated Job Description</h3>
        <span class="hint">Review and tweak before saving</span>
      </div>
      <div class="preview-body">
        <pre>{{ generator.generated.description }}</pre>
      </div>
    </section>

    <section class="jd-list">
      <header class="list-header">
        <h3>Saved Job Descriptions</h3>
        <p>{{ jobDescriptions.length }} active postings</p>
      </header>
      <div v-if="jobDescriptions.length" class="jd-cards">
        <article class="jd-card" v-for="jd in jobDescriptions" :key="jd.id">
          <div class="card-head">
            <h4>{{ jd.title }}</h4>
            <span class="tag">{{ jd.department || 'General' }}</span>
          </div>
          <p class="card-meta">Experience: {{ jd.experience_required || 'N/A' }}</p>
          <div class="card-actions">
            <button class="link-btn" type="button" @click="parentContext.matchCandidates(jd.id)">
              Match Candidates
            </button>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">
        No saved job descriptions yet. Generate one above to get started.
      </div>
    </section>
  </section>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'HrJdMaker',
  props: {
    context: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const parentContext = computed(() => props.context)
    const generator = computed(() => parentContext.value.jdGenerator)
    const jobDescriptions = computed(() => parentContext.value.jobDescriptions || [])

    return {
      parentContext,
      generator,
      jobDescriptions,
    }
  },
}
</script>

<style scoped>
.panel-header {
  margin-bottom: 24px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.panel-subtitle {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.jd-form {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 500;
  color: #1f2937;
}

.form-field input,
.form-field select,
.form-field textarea {
  border: 1px solid rgba(203, 213, 225, 0.9);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.95rem;
  background: #f8fafc;
  color: #1f2937;
}

.form-field textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.primary,
.secondary {
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.primary {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  box-shadow: 0 16px 30px rgba(79, 70, 229, 0.25);
}

.primary:disabled {
  opacity: 0.6;
  cursor: progress;
}

.secondary {
  background: rgba(241, 245, 249, 0.95);
  color: #1f2937;
  border: 1px solid rgba(203, 213, 225, 0.9);
}

.generated-preview {
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  background: rgba(248, 250, 252, 0.9);
  box-shadow: 0 16px 24px rgba(15, 23, 42, 0.08);
  padding: 24px;
  margin-bottom: 28px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.preview-header h3 {
  margin: 0;
  color: #1f2937;
}

.hint {
  font-size: 0.8rem;
  color: #64748b;
}

.preview-body {
  max-height: 380px;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.7);
  padding: 18px;
  font-family: "Inter", sans-serif;
  line-height: 1.6;
  color: #374151;
}

.jd-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  color: #475569;
}

.jd-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.jd-card {
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.7);
  background: rgba(255, 255, 255, 0.95);
  padding: 18px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.card-head h4 {
  margin: 0;
  font-size: 1.05rem;
  color: #1f2937;
}

.tag {
  font-size: 0.75rem;
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
}

.card-meta {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.card-actions {
  margin-top: auto;
}

.link-btn {
  border: none;
  background: none;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.empty-state {
  border-radius: 18px;
  padding: 32px;
  text-align: center;
  border: 1px dashed rgba(148, 163, 184, 0.5);
  background: rgba(248, 250, 252, 0.8);
  color: #475569;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>





