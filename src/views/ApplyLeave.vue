<template>
  <div>
    <!-- Top Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="#">Employee Portal</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item mx-2">
              <router-link class="nav-link" to="/employee">Dashboard</router-link>
            </li>
            <li class="nav-item mx-2">
              <router-link class="nav-link active" to="/leave">Apply Leave</router-link>
            </li>
            <li class="nav-item mx-2">
              <router-link class="nav-link" to="/profile">Profile</router-link>
            </li>
            <li class="nav-item mx-2">
              <router-link class="nav-link" to="/login">Logout</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- ✅ Page Body -->
    <div class="container my-5">
      <div class="card shadow-lg border-0">
        <div class="card-header bg-primary text-white text-center py-3">
          <h3 class="mb-0">Apply for Leave</h3>
        </div>

        <div class="card-body bg-light">
          <form @submit.prevent="applyLeave" class="row g-4 p-3">
            <!-- From Date -->
            <div class="col-md-4">
              <label for="from" class="form-label fw-semibold">From</label>
              <input
                id="from"
                type="date"
                v-model="leave.from"
                class="form-control shadow-sm"
                required
              />
            </div>

            <!-- To Date -->
            <div class="col-md-4">
              <label for="to" class="form-label fw-semibold">To</label>
              <input
                id="to"
                type="date"
                v-model="leave.to"
                class="form-control shadow-sm"
                required
              />
            </div>

            <!-- Reason -->
            <div class="col-md-4">
              <label for="reason" class="form-label fw-semibold">Reason</label>
              <input
                id="reason"
                type="text"
                v-model="leave.reason"
                placeholder="Enter reason"
                class="form-control shadow-sm"
                required
              />
            </div>

            <!-- Apply Button -->
            <div class="col-12 text-center mt-4">
              <button
                type="submit"
                class="btn btn-success px-5 py-2 fw-semibold shadow-sm"
              >
                Apply
              </button>
            </div>
          </form>

          <!-- Success / Info Message -->
          <div v-if="message" class="alert alert-info mt-4 text-center fw-semibold">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ApplyLeave",
  data() {
    return {
      leave: {
        from: "",
        to: "",
        reason: "",
      },
      message: "",
    };
  },
  methods: {
    applyLeave() {
      if (!this.leave.from || !this.leave.to || !this.leave.reason) {
        this.message = "⚠️ Please fill all fields before applying.";
        return;
      }

      // Example API call (replace with your Flask backend later)
      // axios.post('/api/leave/apply', this.leave)
      //   .then(response => { ... })

      this.message = `✅ Leave applied from ${this.leave.from} to ${this.leave.to} for: "${this.leave.reason}".`;
      this.leave = { from: "", to: "", reason: "" };
    },
  },
};
</script>

<style scoped>
body {
  background-color: #f8f9fa;
}
.card {
  border-radius: 1rem;
}
.navbar-brand {
  font-size: 1.3rem;
}
.nav-link {
  color: #e9ecef !important;
  font-weight: 500;
}
.nav-link.active {
  color: #fff !important;
  text-decoration: underline;
}
</style>
