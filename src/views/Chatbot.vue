<template>
  <div class="chatbot-page">
    <!-- ✅ Navbar (same as Dashboard) -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand fw-bold text-light">
          🤖 HR Chatbot
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link to="/employee" class="nav-link">Dashboard</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/feedback" class="nav-link">Feedback</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/team" class="nav-link">My Team</router-link>
            </li>
          </ul>

          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <span class="badge bg-success px-3 py-2 fs-6">👤 {{ user.username }}</span>
            </li>
            <li class="nav-item ms-3">
              <button class="btn btn-danger btn-sm fw-bold px-3" @click="logout">
                🚪 Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- ✅ Main Content -->
    <main class="container py-4">
      <h2 class="fw-bold text-center mb-4">💼 Career Assistant & Chat Support</h2>

      <div class="row g-4">
        <!-- 🧭 Career Path Section -->
        <div class="col-lg-4">
          <div class="card shadow-sm border-0 rounded-4 h-100">
            <div class="card-header bg-primary text-white fw-semibold">
              🌱 Career Path Guidance
            </div>
            <div class="card-body">
              <p class="text-muted small">
                Explore trusted resources to grow your career and leadership skills.
              </p>

              <ul class="list-group list-group-flush">
                <li class="list-group-item">
                  <strong>Harvard Business Review:</strong><br />
                  <a href="https://hbr.org/2005/01/how-to-play-to-your-strengths" target="_blank" class="text-decoration-none">
                    How to Play to Your Strengths
                  </a>
                </li>
                <li class="list-group-item">
                  <strong>LinkedIn Learning:</strong><br />
                  <a href="https://www.linkedin.com/learning/" target="_blank" class="text-decoration-none">
                    Upskill with short professional courses
                  </a>
                </li>
                <li class="list-group-item">
                  <strong>Economic Times Career:</strong><br />
                  <a href="https://economictimes.indiatimes.com/jobs" target="_blank" class="text-decoration-none">
                    Industry news & career advice
                  </a>
                </li>
              </ul>

              <button class="btn btn-outline-primary w-100 mt-3" @click="showMoreCareerLinks">
                Show More Resources
              </button>
            </div>
          </div>
        </div>

        <!-- ❓ FAQ Section -->
        <div class="col-lg-4">
          <div class="card shadow-sm border-0 rounded-4 h-100">
            <div class="card-header bg-warning fw-semibold">❓ Frequently Asked Questions</div>
            <div class="card-body">
              <div v-for="faq in visibleFAQs" :key="faq.id" class="mb-3">
                <h6 class="fw-bold">{{ faq.question }}</h6>
                <p class="text-muted small">{{ faq.answer }}</p>
              </div>

              <button
                v-if="visibleFAQs.length < faqs.length"
                class="btn btn-outline-secondary w-100"
                @click="showMoreFAQs"
              >
                Show More Questions
              </button>
            </div>
          </div>
        </div>

        <!-- 💬 AI Chat Assistant -->
        <div class="col-lg-4">
          <div class="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column">
            <div class="card-header bg-success text-white fw-semibold">
              💬 Ask AI Assistant
            </div>

            <div class="card-body d-flex flex-column">
              <div class="chat-window flex-grow-1 mb-3 p-2 border rounded bg-light overflow-auto">
                <div v-for="(msg, index) in chatMessages" :key="index" class="mb-2">
                  <div
                    :class="[
                      'p-2 rounded',
                      msg.sender === 'user'
                        ? 'bg-primary text-white align-self-end'
                        : 'bg-white border'
                    ]"
                    style="max-width: 80%;"
                  >
                    {{ msg.text }}
                  </div>
                </div>
              </div>

              <div class="d-flex">
                <input
                  v-model="userMessage"
                  @keyup.enter="sendMessage"
                  type="text"
                  placeholder="Ask about leave, policy, or growth..."
                  class="form-control me-2"
                />
                <button class="btn btn-success" @click="sendMessage">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "ChatbotPage",
  data() {
    return {
      user: {
        username: localStorage.getItem("username") || "Employee",
      },
      faqs: [
        { id: 1, question: "How can I apply for leave?", answer: "Go to Dashboard → Leave Management → Apply for Leave." },
        { id: 2, question: "How can I withdraw my leave?", answer: "You can withdraw pending requests directly from Dashboard." },
        { id: 3, question: "Who approves my leave?", answer: "Your manager will review and update leave status." },
        { id: 4, question: "How do I check my training progress?", answer: "Open the Career Guide section in your Dashboard." },
        { id: 5, question: "Where can I get skill certifications?", answer: "Visit LinkedIn Learning or Coursera for certification courses." },
      ],
      visibleFAQs: [],
      chatMessages: [
        { sender: "ai", text: "👋 Hi! I'm your HR Assistant. How can I help you today?" },
      ],
      userMessage: "",
    };
  },
  mounted() {
    this.visibleFAQs = this.faqs.slice(0, 3);
  },
  methods: {
    showMoreFAQs() {
      const next = this.visibleFAQs.length + 2;
      this.visibleFAQs = this.faqs.slice(0, next);
    },
    showMoreCareerLinks() {
      alert("🌐 More curated career resources coming soon!");
    },
    sendMessage() {
      if (!this.userMessage.trim()) return;
      const msg = this.userMessage.trim();
      this.chatMessages.push({ sender: "user", text: msg });

      setTimeout(() => {
        let response = "I'm still learning. Try contacting HR for detailed help.";
        const lower = msg.toLowerCase();
        if (lower.includes("leave")) response = "You can apply or check leave status in your Dashboard.";
        else if (lower.includes("career")) response = "Check the Career Path section for growth articles.";
        else if (lower.includes("salary")) response = "Salary-related queries should be discussed with HR confidentially.";
        else if (lower.includes("training")) response = "You can track training progress in your Dashboard → Career Guide.";

        this.chatMessages.push({ sender: "ai", text: response });
      }, 800);

      this.userMessage = "";
    },
    logout() {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("username");
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.chatbot-page {
  background-color: #f8fafc;
  min-height: 100vh;
}

.chat-window {
  height: 280px;
  display: flex;
  flex-direction: column;
}

.card {
  background: #ffffff;
  border-radius: 12px;
}
</style>
