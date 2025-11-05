<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <h2>Candidate Matching</h2>
        <p class="panel-subtitle">
          Review AI-ranked candidates against saved job descriptions.
        </p>
      </div>
      <div class="actions">
        <select v-model="selectedJobId" class="job-select">
          <option disabled value="">Select job description</option>
          <option v-for="jd in jobDescriptions" :key="jd.id" :value="jd.id">
            {{ jd.title }}
          </option>
        </select>
        <button class="primary" type="button" :disabled="!selectedJobId" @click="matchSelected">
          Match Candidates
        </button>
      </div>
    </header>

    <div v-if="matches.length" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Match Score</th>
            <th>Skills</th>
            <th>Reasoning</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="match in matches" :key="match.candidate?.id || match.id">
            <td>{{ match.candidate?.name || '-' }}</td>
            <td>{{ match.candidate?.email || '-' }}</td>
            <td>
              <span class="score" :class="parentContext.getScoreClass(match.match_score)">
                {{ match.match_score?.toFixed(1) || 0 }}%
              </span>
            </td>
            <td>
              <span
                class="skill-tag"
                v-for="(skill, index) in (match.candidate?.skills || []).slice(0, 3)"
                :key="index"
              >
                {{ skill }}
              </span>
            </td>
            <td class="reasoning">
              {{ match.reasoning ? match.reasoning.substring(0, 140) + 'â€¦' : 'â€”' }}
            </td>
            <td class="row-actions">
              <button class="link-btn" type="button" @click="parentContext.viewCandidateDetails(match.candidate)">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty-state">
      <h4>No matches yet</h4>
      <p>Select a job description above to generate candidate matches.</p>
    </div>
  </section>
</template>

<script>
import { computed, ref, watch } from 'vue'

export default {
  name: 'HrMatching',
  props: {
    context: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const parentContext = computed(() => props.context)
    const jobDescriptions = computed(() => parentContext.value.jobDescriptions || [])
    const matches = computed(() => parentContext.value.matchedCandidates || [])
    const selectedJobId = ref(jobDescriptions.value[0]?.id || '')

    watch(jobDescriptions, (list) => {
      if (list.length && !selectedJobId.value) {
        selectedJobId.value = list[0].id
      }
    })

    const matchSelected = () => {
      if (selectedJobId.value) {
        parentContext.value.matchCandidates(selectedJobId.value)
      }
    }

    return {
      parentContext,
      jobDescriptions,
      matches,
      selectedJobId,
      matchSelected,
    }
  },
}
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.panel-subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.job-select {
  border: 1px solid rgba(203, 213, 225, 0.9);
  border-radius: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  color: #1f2937;
}

.primary {
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(79, 70, 229, 0.25);
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.table-wrapper {
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  text-align: left;
  vertical-align: top;
}

th {
  background: rgba(241, 245, 249, 0.85);
  color: #475569;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 0.75rem;
  margin: 0 6px 6px 0;
}

.score {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
}

.score.high {
  background: rgba(34, 197, 94, 0.15);
  color: #15803d;
}

.score.medium {
  background: rgba(250, 204, 21, 0.18);
  color: #b45309;
}

.score.low {
  background: rgba(248, 113, 113, 0.18);
  color: #b91c1c;
}

.reasoning {
  color: #475569;
  font-size: 0.9rem;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
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
  padding: 48px 24px;
  text-align: center;
  border-radius: 20px;
  border: 1px dashed rgba(148, 163, 184, 0.5);
  background: rgba(248, 250, 252, 0.8);
  color: #475569;
}

.empty-state h4 {
  margin: 0 0 8px;
  color: #1f2937;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .primary,
  .job-select {
    width: 100%;
  }
}
</style>

