<template>
  <div class="home-container">
    <!-- Background Elements -->
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <header class="hero">
      <div class="hero-content">
        <div class="brand-badge">
          <BrandLogo size="lg" />
          <span class="brand-tagline">People | Performance | Progress</span>
        </div>
        <div class="badge">Professional HR Platform</div>
        <h1 class="title">
          Welcome to Human Resource
          <span class="highlight">Management System</span>
        </h1>
        <p class="subtitle">
          Empowering your workforce with efficient, intelligent, and secure HR solutions
        </p>
        <div class="buttons">
          <router-link to="login" class="btn btn-primary">
            <span>Login</span>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
            </svg>
          </router-link>
          <router-link to="register" class="btn btn-secondary">
            <span>Register</span>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </router-link>
        </div>
      </div>
    </header>

    <section class="features">
      <div class="section-header">
        <h2 class="section-title">Why Choose Our Platform?</h2>
        <p class="section-description">Comprehensive HR solutions designed for modern businesses</p>
      </div>
      
      <div class="features-grid">
        <div class="feature">
          <div class="feature-icon icon-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3>Streamlined Processes</h3>
          <p>Automate employee onboarding, attendance, and payroll management with intelligent workflows.</p>
        </div>

        <div class="feature">
          <div class="feature-icon icon-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <h3>Smart Analytics</h3>
          <p>Gain actionable insights into employee performance and engagement with real-time dashboards.</p>
        </div>

        <div class="feature">
          <div class="feature-icon icon-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3>Secure & Reliable</h3>
          <p>Your HR data is safely stored and managed with enterprise-grade security and role-based access.</p>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-content">
        <p class="footer-text">© 2025 Human Resource Management System | All Rights Reserved</p>
        <div class="footer-links">
          <a href="#" class="footer-link">Privacy Policy</a>
          <span class="separator">•</span>
          <a href="#" class="footer-link">Terms of Service</a>
          <span class="separator">•</span>
          <a href="#" class="footer-link">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import BrandLogo from '@/components/BrandLogo.vue'

export default {
  name: "HomePage",
  components: {
    BrandLogo,
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-container {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  color: #1e293b;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

/* Background Shapes */
.background-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.08;
  animation: float 25s infinite ease-in-out;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  top: -15%;
  left: -10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  top: 40%;
  right: -10%;
  animation-delay: 8s;
}

.shape-3 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  bottom: -10%;
  left: 25%;
  animation-delay: 16s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(20px, -30px); }
  66% { transform: translate(-15px, 25px); }
}

/* Hero Section */
.hero {
  padding: 90px 20px 70px;
  position: relative;
  z-index: 1;
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
}

.brand-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 18px;
}

.brand-tagline {
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #0f2738;
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.2);
}

.title {
  font-size: 3.2rem;
  margin-bottom: 18px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
  color: #0f172a;
}

.highlight {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.15rem;
  margin-bottom: 35px;
  color: #475569;
  font-weight: 400;
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

.btn-secondary {
  background: white;
  color: #2563eb;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.btn .icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s;
}

.btn:hover .icon {
  transform: translateX(3px);
}

/* Features Section */
.features {
  padding: 70px 20px;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
}

.section-header {
  margin-bottom: 50px;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #0f172a;
}

.section-description {
  font-size: 1rem;
  color: #64748b;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature {
  background: white;
  border-radius: 16px;
  padding: 35px 28px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.feature:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  transition: transform 0.3s;
}

.feature:hover .feature-icon {
  transform: scale(1.05);
}

.feature-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.icon-blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.icon-purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
}

.icon-green {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.feature h3 {
  font-size: 1.35rem;
  margin-bottom: 10px;
  font-weight: 600;
  color: #1e293b;
}

.feature p {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.6;
}

/* Footer */
.footer {
  padding: 28px 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-top: 1px solid #e2e8f0;
  position: relative;
  z-index: 1;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-text {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-link {
  color: #475569;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #2563eb;
}

.separator {
  color: #cbd5e1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .title {
    font-size: 2.3rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.9rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .hero {
    padding: 60px 20px 50px;
  }

  .features {
    padding: 60px 20px;
  }

  .footer-content {
    gap: 14px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.9rem;
  }

  .buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
