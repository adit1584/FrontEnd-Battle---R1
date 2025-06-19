// Enhanced Luxury Theme Management System
class LuxuryThemeManager {
  constructor() {
    this.theme = "dark"
    this.isTransitioning = false
    this.init()
  }

  init() {
    // Load saved theme or detect system preference
    const savedTheme = localStorage.getItem("luxury-theme")
    if (savedTheme) {
      this.theme = savedTheme
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      this.theme = "light"
    }

    this.applyTheme()
    this.setupToggle()
  }

  applyTheme() {
    // Remove existing theme classes
    document.documentElement.classList.remove("dark", "light")
    document.body.classList.remove("dark", "light")

    // Add current theme class to both html and body
    document.documentElement.classList.add(this.theme)
    document.body.classList.add(this.theme)

    this.updateToggleButton()
    this.updateParticleColors()

    // Update CSS custom properties for theme
    if (this.theme === "light") {
      document.documentElement.style.setProperty("--theme-bg", "#f8fafc")
      document.documentElement.style.setProperty("--theme-text", "#1e293b")
    } else {
      document.documentElement.style.setProperty("--theme-bg", "#000000")
      document.documentElement.style.setProperty("--theme-text", "#ffffff")
    }
  }

  toggleTheme() {
    if (this.isTransitioning) return

    this.isTransitioning = true
    document.documentElement.classList.add("theme-transitioning")

    setTimeout(() => {
      this.theme = this.theme === "dark" ? "light" : "dark"
      localStorage.setItem("luxury-theme", this.theme)
      this.applyTheme()

      setTimeout(() => {
        this.isTransitioning = false
        document.documentElement.classList.remove("theme-transitioning")
      }, 400)
    }, 200)
  }

  updateToggleButton() {
    const sunIcon = document.getElementById("sun-icon")
    const moonIcon = document.getElementById("moon-icon")
    const tooltip = document.getElementById("theme-tooltip")
    const toggle = document.getElementById("theme-toggle")

    if (this.theme === "dark") {
      // In dark mode, show moon icon and tooltip to switch to light
      sunIcon.classList.add("hidden")
      moonIcon.classList.remove("hidden")
      tooltip.textContent = "Switch to light mode"
      toggle.setAttribute("aria-label", "Switch to light mode")
    } else {
      // In light mode, show sun icon and tooltip to switch to dark
      sunIcon.classList.remove("hidden")
      moonIcon.classList.add("hidden")
      tooltip.textContent = "Switch to dark mode"
      toggle.setAttribute("aria-label", "Switch to dark mode")
    }

    // Force icon color update
    const icons = toggle.querySelectorAll("i")
    icons.forEach((icon) => {
      if (this.theme === "light") {
        icon.style.color = "#7c3aed"
      } else {
        icon.style.color = "#a855f7"
      }
    })
  }

  updateParticleColors() {
    if (window.luxuryParticleSystem) {
      window.luxuryParticleSystem.updateColors(this.theme)
    }
  }

  setupToggle() {
    const toggle = document.getElementById("theme-toggle")
    toggle.addEventListener("click", () => this.toggleTheme())
  }
}

// Enhanced Luxury Particle System
class LuxuryParticleSystem {
  constructor() {
    this.canvas = document.getElementById("luxury-particles")
    this.ctx = this.canvas.getContext("2d")
    this.particles = []
    this.colors = {
      dark: ["#a855f7", "#c084fc", "#10b981", "#34d399", "#6ee7b7", "#d8b4fe"],
      light: ["#7c3aed", "#9333ea", "#059669", "#047857", "#065f46", "#a855f7"],
    }
    this.currentColors = this.colors.dark
    this.mouseX = 0
    this.mouseY = 0
    this.init()
  }

  init() {
    this.resizeCanvas()
    this.createParticles()
    this.animate()
    this.setupMouseTracking()

    window.addEventListener("resize", () => this.resizeCanvas())
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  setupMouseTracking() {
    document.addEventListener("mousemove", (e) => {
      this.mouseX = e.clientX
      this.mouseY = e.clientY
    })
  }

  createParticles() {
    this.particles = []
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.1,
        color: this.currentColors[Math.floor(Math.random() * this.currentColors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
        originalSize: 0,
      })
      this.particles[this.particles.length - 1].originalSize = this.particles[this.particles.length - 1].size
    }
  }

  updateColors(theme) {
    this.currentColors = this.colors[theme]
    this.particles.forEach((particle) => {
      particle.color = this.currentColors[Math.floor(Math.random() * this.currentColors.length)]
    })
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Mouse interaction
      const dx = this.mouseX - particle.x
      const dy = this.mouseY - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 150) {
        const force = (150 - distance) / 150
        particle.vx += (dx / distance) * force * 0.01
        particle.vy += (dy / distance) * force * 0.01
      }

      // Apply friction
      particle.vx *= 0.99
      particle.vy *= 0.99

      // Bounce off edges with some randomness
      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.vx *= -0.8
        particle.x = Math.max(0, Math.min(this.canvas.width, particle.x))
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.vy *= -0.8
        particle.y = Math.max(0, Math.min(this.canvas.height, particle.y))
      }

      // Pulsing effect
      particle.pulsePhase += 0.02
      const pulseSize = particle.originalSize + Math.sin(particle.pulsePhase) * 0.5

      // Draw particle with enhanced effects
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2)

      // Create gradient for each particle
      const gradient = this.ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, pulseSize * 2)
      gradient.addColorStop(0, particle.color)
      gradient.addColorStop(1, particle.color + "00")

      this.ctx.fillStyle = gradient
      this.ctx.globalAlpha = particle.opacity
      this.ctx.fill()

      // Add glow effect
      this.ctx.shadowBlur = 10
      this.ctx.shadowColor = particle.color
      this.ctx.fill()
      this.ctx.shadowBlur = 0
    })

    // Enhanced connections with varying opacity
    this.particles.forEach((particle, i) => {
      this.particles.slice(i + 1).forEach((otherParticle) => {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 140) {
          this.ctx.beginPath()
          this.ctx.moveTo(particle.x, particle.y)
          this.ctx.lineTo(otherParticle.x, otherParticle.y)

          // Create gradient for connection line
          const lineGradient = this.ctx.createLinearGradient(particle.x, particle.y, otherParticle.x, otherParticle.y)
          lineGradient.addColorStop(0, particle.color)
          lineGradient.addColorStop(1, otherParticle.color)

          this.ctx.strokeStyle = lineGradient
          this.ctx.globalAlpha = ((140 - distance) / 140) * 0.2
          this.ctx.lineWidth = 1.5
          this.ctx.stroke()
        }
      })
    })

    requestAnimationFrame(() => this.animate())
  }
}

// Enhanced Luxury Loader System
class LuxuryLoaderSystem {
  constructor() {
    this.progress = 0
    this.loader = document.getElementById("luxury-loader")
    this.progressBar = document.getElementById("luxury-progress")
    this.progressText = document.getElementById("luxury-progress-text")
    this.loadingText = document.getElementById("luxury-loading-text")
    this.mainContent = document.getElementById("main-content")

    this.loadingMessages = [
      "Initializing Aurelius Capital...",
      "Connecting to global markets...",
      "Loading premium analytics...",
      "Preparing your portfolio...",
      "Finalizing security protocols...",
      "Activating AI systems...",
      "Welcome to luxury investing...",
    ]

    this.init()
  }

  init() {
    this.startLoading()
  }

  startLoading() {
    const interval = setInterval(() => {
      this.progress += Math.random() * 4 + 2

      if (this.progress > 100) {
        this.progress = 100
      }

      this.updateProgress()

      if (this.progress >= 100) {
        clearInterval(interval)
        this.completeLoading()
      }
    }, 100)
  }

  updateProgress() {
    // Enhanced progress bar animation
    this.progressBar.style.width = `${this.progress}%`

    // Update progress text with smooth animation
    this.progressText.textContent = `${Math.floor(this.progress)}%`

    // Update loading message based on progress with smooth transitions
    const messageIndex = Math.min(
      Math.floor((this.progress / 100) * (this.loadingMessages.length - 1)),
      this.loadingMessages.length - 1,
    )

    if (this.loadingText.textContent !== this.loadingMessages[messageIndex]) {
      this.loadingText.style.opacity = "0.5"
      setTimeout(() => {
        this.loadingText.textContent = this.loadingMessages[messageIndex]
        this.loadingText.style.opacity = "1"
      }, 200)
    }
  }

  completeLoading() {
    this.loadingText.innerHTML = '<span class="animate-fade-in-up-enhanced">Ready for Excellence!</span>'

    setTimeout(() => {
      this.loader.style.opacity = "0"
      this.loader.style.pointerEvents = "none"
      this.mainContent.classList.remove("hidden")

      // Show theme toggle button with enhanced animation
      const themeToggle = document.getElementById("theme-toggle")
      if (themeToggle) {
        themeToggle.classList.add("show")
      }

      setTimeout(() => {
        this.loader.style.display = "none"
      }, 600)
    }, 1200)
  }
}

// Enhanced Luxury Navigation System
class LuxuryNavigationSystem {
  constructor() {
    this.nav = document.getElementById("luxury-nav")
    this.navLinks = document.querySelectorAll(".nav-link")
    this.sections = document.querySelectorAll("section[id]")
    this.mobileMenuBtn = document.getElementById("mobile-menu-btn")

    this.init()
  }

  init() {
    this.setupScrollEffects()
    this.setupSmoothScrolling()
    this.setupActiveLinks()
    this.setupMobileMenu()
  }

  setupScrollEffects() {
    let lastScrollY = window.scrollY

    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY

      // Enhanced navigation background with gradient
      if (currentScrollY > 50) {
        this.nav.style.background = "rgba(0, 0, 0, 0.98)"
        this.nav.style.borderBottomColor = "rgba(168, 85, 247, 0.4)"
        this.nav.style.boxShadow = "0 4px 20px rgba(168, 85, 247, 0.1)"
      } else {
        this.nav.style.background = "rgba(0, 0, 0, 0.85)"
        this.nav.style.borderBottomColor = "rgba(168, 85, 247, 0.2)"
        this.nav.style.boxShadow = "none"
      }

      // Hide/show navigation on scroll
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        this.nav.style.transform = "translateY(-100%)"
      } else {
        this.nav.style.transform = "translateY(0)"
      }

      lastScrollY = currentScrollY
    })
  }

  setupSmoothScrolling() {
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const targetId = link.getAttribute("href").substring(1)
        const targetSection = document.getElementById(targetId)

        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 80
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          })
        }
      })
    })
  }

  setupActiveLinks() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`)

            // Remove active class from all links
            this.navLinks.forEach((link) => link.classList.remove("active"))

            // Add active class to current link with enhanced animation
            if (activeLink) {
              activeLink.classList.add("active")
            }
          }
        })
      },
      {
        threshold: 0.3,
        rootMargin: "-80px 0px -80px 0px",
      },
    )

    this.sections.forEach((section) => {
      observer.observe(section)
    })
  }

  setupMobileMenu() {
    // Enhanced mobile menu functionality
    this.mobileMenuBtn.addEventListener("click", () => {
      console.log("Mobile menu clicked - Enhanced version")
      // Add mobile menu implementation here
    })
  }
}

// Enhanced Luxury Interactive Effects
class LuxuryInteractiveEffects {
  constructor() {
    this.setupParallax()
    this.setupCursorFollower()
    this.setupScrollAnimations()
    this.setupStatCounters()
    this.setupRippleEffects()
    this.setupMagneticButtons()
    this.setupChartAnimations()
  }

  setupChartAnimations() {
    // Animate chart counters when visible
    const chartCounters = document.querySelectorAll(".chart-value, .chart-growth")

    const chartObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = Number.parseFloat(entry.target.dataset.target)
            this.animateChartCounter(entry.target, target)
            chartObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.5 },
    )

    chartCounters.forEach((counter) => chartObserver.observe(counter))

    // Chart period button interactions
    const periodButtons = document.querySelectorAll(".chart-period-btn")
    periodButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active class from all buttons
        periodButtons.forEach((b) => b.classList.remove("active"))
        // Add active class to clicked button
        btn.classList.add("active")

        // Animate chart update
        this.animateChartUpdate()
      })
    })

    // Chart control button interactions
    const controlButtons = document.querySelectorAll(".chart-control-btn")
    controlButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Add ripple effect
        this.createChartRipple(e, btn)
      })
    })
  }

  animateChartCounter(element, target) {
    let current = 0
    const increment = target / 60
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      element.textContent = Math.floor(current * 10) / 10
    }, 25)
  }

  animateChartUpdate() {
    const performanceLine = document.getElementById("performance-line")
    const dataPoints = document.querySelectorAll(".animate-pulse-data-point")

    // Temporarily hide elements
    performanceLine.style.opacity = "0.3"
    dataPoints.forEach((point) => (point.style.opacity = "0.3"))

    // Animate back in
    setTimeout(() => {
      performanceLine.style.opacity = "1"
      performanceLine.style.transition = "opacity 0.8s ease"

      dataPoints.forEach((point, index) => {
        setTimeout(() => {
          point.style.opacity = "1"
          point.style.transition = "opacity 0.5s ease"
        }, index * 100)
      })
    }, 300)
  }

  createChartRipple(e, button) {
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = document.createElement("span")
    ripple.style.position = "absolute"
    ripple.style.left = `${x - 15}px`
    ripple.style.top = `${y - 15}px`
    ripple.style.width = "30px"
    ripple.style.height = "30px"
    ripple.style.background = "rgba(16, 185, 129, 0.3)"
    ripple.style.borderRadius = "50%"
    ripple.style.transform = "scale(0)"
    ripple.style.animation = "ripple-luxury-enhanced 0.6s linear"
    ripple.style.pointerEvents = "none"

    button.style.position = "relative"
    button.style.overflow = "hidden"
    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  setupParallax() {
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY
      const parallaxBg = document.getElementById("parallax-bg")

      if (parallaxBg) {
        parallaxBg.style.transform = `translateY(${scrollY * 0.4}px)`
      }

      // Enhanced parallax for decorative elements
      const decorativeElements = document.querySelectorAll(".absolute")
      decorativeElements.forEach((element, index) => {
        const speed = 0.1 + (index % 3) * 0.05
        element.style.transform = `translateY(${scrollY * speed}px)`
      })
    })
  }

  setupCursorFollower() {
    const cursorFollower = document.getElementById("cursor-follower")
    let mouseX = 0
    let mouseY = 0
    let followerX = 0
    let followerY = 0

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    })

    // Smooth cursor following with easing
    const updateCursor = () => {
      const dx = mouseX - followerX
      const dy = mouseY - followerY

      followerX += dx * 0.1
      followerY += dy * 0.1

      if (cursorFollower) {
        cursorFollower.style.left = `${followerX - 192}px`
        cursorFollower.style.top = `${followerY - 192}px`
      }

      requestAnimationFrame(updateCursor)
    }
    updateCursor()
  }

  setupScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1"
            entry.target.style.transform = "translateY(0) scale(1)"
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    // Enhanced animation for all interactive elements
    const animatedElements = document.querySelectorAll(
      ".luxury-service-card, .luxury-stat-card, .luxury-insight-card, .luxury-team-card",
    )
    animatedElements.forEach((el, index) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(40px) scale(0.95)"
      el.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`
      observer.observe(el)
    })
  }

  setupStatCounters() {
    const statNumbers = document.querySelectorAll(".stat-number")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = Number.parseFloat(entry.target.dataset.target)
            this.animateCounter(entry.target, target)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.5 },
    )

    statNumbers.forEach((stat) => observer.observe(stat))
  }

  animateCounter(element, target) {
    let current = 0
    const increment = target / 80
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      element.textContent = Math.floor(current)
    }, 20)
  }

  setupRippleEffects() {
    const buttons = document.querySelectorAll("button")

    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const rect = button.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const ripple = document.createElement("span")
        ripple.style.position = "absolute"
        ripple.style.left = `${x - 20}px`
        ripple.style.top = `${y - 20}px`
        ripple.style.width = "40px"
        ripple.style.height = "40px"
        ripple.style.background = "rgba(168, 85, 247, 0.4)"
        ripple.style.borderRadius = "50%"
        ripple.style.transform = "scale(0)"
        ripple.style.animation = "ripple-luxury-enhanced 0.8s linear"
        ripple.style.pointerEvents = "none"

        button.style.position = "relative"
        button.style.overflow = "hidden"
        button.appendChild(ripple)

        setTimeout(() => {
          ripple.remove()
        }, 800)
      })
    })
  }

  setupMagneticButtons() {
    const magneticElements = document.querySelectorAll("button, .luxury-service-card, .luxury-stat-card")

    magneticElements.forEach((element) => {
      element.addEventListener("mousemove", (e) => {
        const rect = element.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2

        const moveX = x * 0.1
        const moveY = y * 0.1

        element.style.transform = `translate(${moveX}px, ${moveY}px)`
      })

      element.addEventListener("mouseleave", () => {
        element.style.transform = "translate(0px, 0px)"
      })
    })
  }
}

// Enhanced Luxury Form Handler
class LuxuryFormHandler {
  constructor() {
    this.form = document.getElementById("luxury-contact-form")
    this.init()
  }

  init() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e))
      this.setupFormValidation()
    }
  }

  setupFormValidation() {
    const inputs = this.form.querySelectorAll("input, select, textarea")

    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input))
      input.addEventListener("input", () => this.clearErrors(input))
    })
  }

  validateField(field) {
    const value = field.value.trim()
    let isValid = true

    // Remove existing error styling
    field.classList.remove("border-red-500")

    if (field.hasAttribute("required") && !value) {
      isValid = false
    }

    if (field.type === "email" && value && !this.isValidEmail(value)) {
      isValid = false
    }

    if (!isValid) {
      field.classList.add("border-red-500")
    }

    return isValid
  }

  clearErrors(field) {
    field.classList.remove("border-red-500")
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  handleSubmit(e) {
    e.preventDefault()

    // Validate all fields
    const inputs = this.form.querySelectorAll("input, select, textarea")
    let isFormValid = true

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isFormValid = false
      }
    })

    if (!isFormValid) {
      this.showError("Please fill in all required fields correctly.")
      return
    }

    const formData = new FormData(this.form)
    const data = Object.fromEntries(formData)

    // Enhanced form submission simulation
    this.showLoading()

    setTimeout(() => {
      this.showSuccess()
      this.form.reset()
    }, 2500)
  }

  showLoading() {
    const submitBtn = this.form.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML

    submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 mr-2 animate-spin"></i>Processing...'
    submitBtn.disabled = true
    submitBtn.classList.add("opacity-75")

    // Re-initialize Lucide icons for the new icon
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }

  showSuccess() {
    const submitBtn = this.form.querySelector('button[type="submit"]')

    submitBtn.innerHTML = '<i data-lucide="check-circle" class="w-5 h-5 mr-2"></i>Message Sent!'
    submitBtn.style.background = "linear-gradient(to right, #10b981, #059669)"
    submitBtn.classList.remove("opacity-75")

    setTimeout(() => {
      submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5 mr-2"></i>Schedule Consultation'
      submitBtn.style.background = ""
      submitBtn.disabled = false
    }, 3500)

    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }

  showError(message) {
    // Create error message element
    const errorDiv = document.createElement("div")
    errorDiv.className = "bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg mb-4"
    errorDiv.textContent = message

    // Insert at the top of the form
    this.form.insertBefore(errorDiv, this.form.firstChild)

    // Remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove()
    }, 5000)
  }
}

// Enhanced ripple animation styles
const enhancedRippleStyle = document.createElement("style")
enhancedRippleStyle.textContent = `
    @keyframes ripple-luxury-enhanced {
        to {
            transform: scale(5);
            opacity: 0;
        }
    }
`
document.head.appendChild(enhancedRippleStyle)

// Initialize all enhanced systems when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all luxury systems with enhanced features
  window.luxuryThemeManager = new LuxuryThemeManager()
  window.luxuryParticleSystem = new LuxuryParticleSystem()
  window.luxuryLoaderSystem = new LuxuryLoaderSystem()
  window.luxuryNavigationSystem = new LuxuryNavigationSystem()
  window.luxuryInteractiveEffects = new LuxuryInteractiveEffects()
  window.luxuryFormHandler = new LuxuryFormHandler()

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons()
  }

  // Enhanced page load animations
  setTimeout(() => {
    document.body.classList.add("loaded")
  }, 100)
})

// Enhanced performance monitoring
window.addEventListener("load", () => {
  console.log("🎉 Aurelius Capital - Enhanced Luxury Platform Loaded Successfully!")

  // Performance metrics
  if (window.performance) {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
    console.log(`⚡ Page loaded in ${loadTime}ms`)
  }
})
