<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <h2>Resume Workspace</h2>
        <p class="panel-subtitle">Upload resumes and review parsed insights</p>
      </div>
      <button class="link-btn" type="button" @click="parentContext.refreshResumes">Refresh</button>
    </header>

    <div class="upload-row">
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,.docx,.txt"
        class="hidden-input"
        multiple
        @change="handleFileChange"
      />
      <button class="primary upload-btn" type="button" @click="openPicker">
        Upload Resumes
      </button>
      <select v-model="uploadSource" class="source-select">
        <option value="Manual">Manual</option>
        <option value="LinkedIn">LinkedIn</option>
        <option value="Indeed">Indeed</option>
        <option value="Referral">Referral</option>
        <option value="Company Website">Company Website</option>
      </select>
    </div>

    <div v-if="parentContext.bulkUploadProgress.show" class="bulk-progress">
      <div class="progress-top">
        <h4>Bulk Upload Progress</h4>
        <button class="icon-btn" type="button" @click="parentContext.bulkUploadProgress.show = false">Ã—</button>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: parentContext.bulkUploadProgress.percentage + '%' }"></div>
      </div>
      <div class="progress-stats">
        <span>Processed: {{ parentContext.bulkUploadProgress.processed }} / {{ parentContext.bulkUploadProgress.total }}</span>
        <span>Success: {{ parentContext.bulkUploadProgress.successful }}</span>
        <span>Failed: {{ parentContext.bulkUploadProgress.failed }}</span>
      </div>
      <ul v-if="parentContext.bulkUploadProgress.failedFiles.length" class="failed-list">
        <li v-for="failed in parentContext.bulkUploadProgress.failedFiles" :key="failed.filename">
          {{ failed.filename }} — {{ failed.error }}
        </li>
      </ul>
    </div>

    <div class="table-wrapper" v-if="resumes.length">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Skills</th>
            <th>Experience</th>
            <th>Source</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resume in resumes" :key="resume.id">
            <td>{{ resume.name || '-' }}</td>
            <td>{{ resume.email || '-' }}</td>
            <td>
              <span
                v-for="(skill, index) in resume.skills.slice(0, 3)"
                :key="index"
                class="skill-tag"
              >
                {{ skill }}
              </span>
              <span v-if="resume.skills.length > 3">...</span>
            </td>
            <td>{{ resume.total_experience || 0 }} yrs</td>
            <td>{{ resume.source || '-' }}</td>
            <td>
              <select v-model="resume.status" @change="parentContext.updateResumeStatus(resume)">
                <option value="New">New</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interviewed">Interviewed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </td>
            <td class="actions">
              <button class="link-btn" type="button" @click="parentContext.viewResumeDetails(resume)">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty-state">
      <h4>No resumes yet</h4>
      <p>Upload candidate resumes to start building your recruitment pipeline.</p>
    </div>
  </section>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  name: 'HrResumes',
  props: {
    context: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const parentContext = computed(() => props.context)
    const fileInput = ref(null)
    const resumes = computed(() => parentContext.value.resumes || [])

    const uploadSource = computed({
      get: () => parentContext.value.uploadSource,
      set: (value) => {
        if (typeof parentContext.value.setUploadSource === 'function') {
          parentContext.value.setUploadSource(value)
        } else {
          parentContext.value.uploadSource = value
        }
      },
    })

    const openPicker = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }

    const handleFileChange = (event) => {
      parentContext.value.handleFileUpload(event)
    }

    return {
      parentContext,
      fileInput,
      resumes,
      uploadSource,
      openPicker,
      handleFileChange,
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

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
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

.upload-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.hidden-input {
  display: none;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  padding: 10px 20px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(79, 70, 229, 0.25);
}

.source-select {
  border: 1px solid #cbd5f5;
  border-radius: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  color: #1e293b;
}

.bulk-progress {
  background: rgba(248, 250, 252, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 18px 20px;
  margin-bottom: 24px;
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
}

.progress-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-bar-container {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(203, 213, 225, 0.6);
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #6366f1);
  transition: width 0.3s ease;
}

.progress-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.85rem;
  color: #475569;
  margin-bottom: 8px;
}

.failed-list {
  margin: 0;
  padding-left: 20px;
  color: #dc2626;
  font-size: 0.85rem;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.6);
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

td select {
  border: 1px solid rgba(203, 213, 225, 0.9);
  border-radius: 10px;
  padding: 6px 10px;
  background: #fff;
}

.actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  padding: 48px 24px;
  text-align: center;
  border-radius: 20px;
  border: 1px dashed rgba(148, 163, 184, 0.5);
  background: rgba(248, 250, 252, 0.75);
}

.empty-state h4 {
  margin: 0 0 8px;
  color: #1f2937;
}

.empty-state p {
  margin: 0;
  color: #64748b;
}

@media (max-width: 768px) {
  th,
  td {
    padding: 12px;
  }

  .upload-row {
    flex-direction: column;
    align-items: stretch;
  }

  .upload-btn,
  .source-select {
    width: 100%;
  }
}
</style>











