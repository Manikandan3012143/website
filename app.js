/* ==========================================================================
   INTERACTIVE JAVASCRIPT: STUDENT PORTFOLIO HUB
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // State variables
  let studentsData = [];
  let filteredData = [];
  let currentFilter = "all";
  let currentSort = "srn-asc";
  let carouselIndex = 0;
  let carouselAutoPlayTimer = null;
  let activeFeaturedStudents = [];

  // DOM Elements
  const statsTotal = document.getElementById("val-total");
  const statsDeployed = document.getElementById("val-deployed");
  const barDeployed = document.getElementById("bar-deployed");
  const textDeployedPct = document.getElementById("text-deployed-pct");
  const statsAcp = document.getElementById("val-acp");
  const barAcp = document.getElementById("bar-acp");
  const textAcpPct = document.getElementById("text-acp-pct");
  const statsRepos = document.getElementById("val-repos");
  const barRepos = document.getElementById("bar-repos");
  const textReposPct = document.getElementById("text-repos-pct");

  const carouselTrack = document.getElementById("carousel-track");
  const carouselIndicators = document.getElementById("carousel-indicators");
  const btnPrev = document.querySelector(".btn-prev");
  const btnNext = document.querySelector(".btn-next");

  const searchInput = document.getElementById("search-input");
  const chipContainer = document.getElementById("filter-chips");
  const sortSelect = document.getElementById("sort-select");
  const gridCount = document.getElementById("grid-count");
  const portfoliosGrid = document.getElementById("portfolios-grid");
  const emptyState = document.getElementById("empty-state");
  const btnResetFilters = document.getElementById("btn-reset-filters");

  // Preview Modal Elements
  const previewModal = document.getElementById("preview-modal");
  const previewBackdrop = document.getElementById("preview-backdrop");
  const previewAvatar = document.getElementById("preview-avatar");
  const previewStudentName = document.getElementById("preview-student-name");
  const previewStudentSrn = document.getElementById("preview-student-srn");
  const previewBtnExternal = document.getElementById("preview-btn-external");
  const previewBtnCopy = document.getElementById("preview-btn-copy");
  const copyBtnText = document.getElementById("copy-btn-text");
  const previewBtnClose = document.getElementById("preview-btn-close");
  const deviceViewport = document.getElementById("device-viewport");
  const chromeAddressText = document.getElementById("chrome-address-text");
  const previewIframe = document.getElementById("preview-iframe");
  const iframeLoader = document.getElementById("iframe-loader");
  const iframeFallback = document.getElementById("iframe-fallback");
  const fallbackExternalBtn = document.getElementById("fallback-external-btn");
  const deviceToggleButtons = document.querySelectorAll(".btn-device");

  /* ==========================================
     1. DATA FETCHING AND INITIALIZATION
     ========================================== */
  async function init() {
    try {
      const response = await fetch("students.json");
      if (!response.ok) {
        throw new Error("Failed to load students data file.");
      }
      studentsData = await response.json();
      
      // Compute dashboard stats
      calculateAnalytics();
      
      // Initialize Showcase Grid
      applyFiltersAndSort();
      
      // Initialize Carousel
      initCarousel();
      
      // Set up Event Listeners
      setupEventListeners();
      
    } catch (error) {
      console.error("Initialization Error:", error);
      portfoliosGrid.innerHTML = `
        <div class="grid-loading">
          <svg style="width:3rem;height:3rem;color:#ef4444;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style="color:#ef4444;font-weight:600;">Error loading directory data</span>
          <p style="font-size:0.875rem;color:var(--text-secondary);max-width:300px;text-align:center;">${error.message}</p>
        </div>
      `;
    }
  }

  /* ==========================================
     2. ANALYTICS CALCULATIONS
     ========================================== */
  function calculateAnalytics() {
    const total = studentsData.length;
    const deployed = studentsData.filter(s => s.vercel !== "").length;
    const acp = studentsData.filter(s => s.acpGit !== "").length;
    const repos = studentsData.filter(s => s.portfolioGit !== "").length;

    // Set numbers
    statsTotal.textContent = total;
    statsDeployed.textContent = deployed;
    statsAcp.textContent = acp;
    statsRepos.textContent = repos;

    // Deployed percentage
    const deployedPct = total > 0 ? Math.round((deployed / total) * 100) : 0;
    barDeployed.style.width = `${deployedPct}%`;
    textDeployedPct.textContent = `${deployedPct}% Deployment Rate`;

    // ACP percentage
    const acpPct = total > 0 ? Math.round((acp / total) * 100) : 0;
    barAcp.style.width = `${acpPct}%`;
    textAcpPct.textContent = `${acpPct}% Git Submitted`;

    // Repos percentage
    const reposPct = total > 0 ? Math.round((repos / total) * 100) : 0;
    barRepos.style.width = `${reposPct}%`;
    textReposPct.textContent = `${reposPct}% Codebases Linked`;
  }

  /* ==========================================
     3. FEATURED PORTFOLIO CAROUSEL
     ========================================== */
  function initCarousel() {
    // Filter students with vercel deployments
    const deployedStudents = studentsData.filter(s => s.vercel !== "");
    
    // Sort or grab a subset for featured section
    // Let's grab some key portfolios (or just shuffle/take first 8)
    activeFeaturedStudents = deployedStudents.slice(0, 8);

    if (activeFeaturedStudents.length === 0) {
      carouselTrack.innerHTML = `
        <div class="carousel-loading">
          <span>No deployed portfolios available for display.</span>
        </div>
      `;
      return;
    }

    // Render slides
    carouselTrack.innerHTML = activeFeaturedStudents.map((student, idx) => {
      const initials = getInitials(student.name);
      return `
        <div class="carousel-item" data-index="${idx}">
          <div class="carousel-item-header">
            <div class="carousel-srn">${student.srn}</div>
            <div class="carousel-badge">
              <span class="carousel-dot"></span>Deployed
            </div>
          </div>
          <h3 class="carousel-name">${student.name}</h3>
          <div class="carousel-item-footer">
            <button class="btn btn-primary btn-carousel-preview" data-vercel="${student.vercel}" data-name="${student.name}" data-srn="${student.srn}">
              Live Preview
            </button>
            <a href="${student.vercel}" target="_blank" class="btn btn-secondary btn-icon-only btn-icon" title="Visit website">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      `;
    }).join("");

    // Setup indicators
    updateCarouselIndicators();
    updateCarouselPosition();

    // Start auto-play
    startCarouselAutoPlay();

    // Event Delegation inside Carousel Preview Buttons
    carouselTrack.querySelectorAll(".btn-carousel-preview").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const url = btn.getAttribute("data-vercel");
        const name = btn.getAttribute("data-name");
        const srn = btn.getAttribute("data-srn");
        openPreviewModal(url, name, srn);
      });
    });
  }

  function getItemsPerSlide() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function updateCarouselIndicators() {
    const itemsPerSlide = getItemsPerSlide();
    const totalSlides = Math.max(0, activeFeaturedStudents.length - itemsPerSlide + 1);
    
    carouselIndicators.innerHTML = "";
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement("div");
      dot.className = `indicator ${i === carouselIndex ? "active" : ""}`;
      dot.addEventListener("click", () => {
        goToCarouselIndex(i);
        stopCarouselAutoPlay();
        startCarouselAutoPlay();
      });
      carouselIndicators.appendChild(dot);
    }
  }

  function updateCarouselPosition() {
    if (activeFeaturedStudents.length === 0) return;
    
    const itemsPerSlide = getItemsPerSlide();
    const maxIndex = Math.max(0, activeFeaturedStudents.length - itemsPerSlide);
    if (carouselIndex > maxIndex) {
      carouselIndex = maxIndex;
    }
    
    const firstItem = carouselTrack.querySelector(".carousel-item");
    if (!firstItem) return;
    
    const itemWidth = firstItem.getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(carouselTrack).gap) || 0;
    
    const offset = carouselIndex * (itemWidth + gap);
    carouselTrack.style.transform = `translateX(-${offset}px)`;

    // Update active indicators
    const dots = carouselIndicators.querySelectorAll(".indicator");
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === carouselIndex);
    });
  }

  function goToCarouselIndex(index) {
    const itemsPerSlide = getItemsPerSlide();
    const maxIndex = Math.max(0, activeFeaturedStudents.length - itemsPerSlide);
    
    if (index < 0) {
      carouselIndex = maxIndex;
    } else if (index > maxIndex) {
      carouselIndex = 0;
    } else {
      carouselIndex = index;
    }
    updateCarouselPosition();
  }

  function startCarouselAutoPlay() {
    carouselAutoPlayTimer = setInterval(() => {
      goToCarouselIndex(carouselIndex + 1);
    }, 6000);
  }

  function stopCarouselAutoPlay() {
    if (carouselAutoPlayTimer) {
      clearInterval(carouselAutoPlayTimer);
      carouselAutoPlayTimer = null;
    }
  }

  /* ==========================================
     4. SEARCH, FILTERS, AND SORTING
     ========================================== */
  function applyFiltersAndSort() {
    const query = searchInput.value.toLowerCase().trim();
    
    // Filter
    filteredData = studentsData.filter(student => {
      // 1. Search Query filter (matches Name or SRN)
      const matchesSearch = student.name.toLowerCase().includes(query) || 
                            student.srn.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;

      // 2. Chip status filter
      switch (currentFilter) {
        case "deployed":
          return student.vercel !== "";
        case "pending":
          return student.vercel === "";
        case "acp":
          return student.acpGit !== "";
        case "portfolio":
          return student.portfolioGit !== "";
        case "all":
        default:
          return true;
      }
    });

    // Sort
    filteredData.sort((a, b) => {
      switch (currentSort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "srn-asc":
        default:
          return a.srn.localeCompare(b.srn);
      }
    });

    // Render Grid
    renderShowcaseGrid();
  }

  function renderShowcaseGrid() {
    gridCount.textContent = `Showing ${filteredData.length} of ${studentsData.length} students`;

    if (filteredData.length === 0) {
      portfoliosGrid.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    
    portfoliosGrid.innerHTML = filteredData.map(student => {
      const initials = getInitials(student.name);
      const isDeployed = student.vercel !== "";
      const statusText = isDeployed ? "Deployed" : "Pending";
      const statusClass = isDeployed ? "badge-deployed" : "badge-pending";
      const deployedClass = isDeployed ? "deployed" : "";
      
      const acpGitHtml = student.acpGit 
        ? `<a href="${student.acpGit}" target="_blank" class="repo-link" title="Open ACP Repository">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
             <span>ACP Mini-Project</span>
           </a>`
        : `<div class="repo-link missing">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
             <span>ACP Mini-Project (Missing)</span>
           </div>`;

      const portGitHtml = student.portfolioGit 
        ? `<a href="${student.portfolioGit}" target="_blank" class="repo-link" title="Open Portfolio Repository">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
             <span>Portfolio Codebase</span>
           </a>`
        : `<div class="repo-link missing">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
             <span>Portfolio Codebase (Missing)</span>
           </div>`;

      const actionButtons = isDeployed
        ? `<button class="btn btn-primary btn-preview-trigger" data-vercel="${student.vercel}" data-name="${student.name}" data-srn="${student.srn}">
             Preview
           </button>
           <a href="${student.vercel}" target="_blank" class="btn btn-secondary btn-icon btn-icon-only" title="Open external link">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
           </a>`
        : `<button class="btn btn-secondary btn-disabled" disabled>
             No Deployment
           </button>`;

      // Determine glow styling class
      const glowColor = isDeployed ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)";

      return `
        <article class="student-card glass-panel ${deployedClass}">
          <div class="card-glow-bg" style="background-color: ${glowColor};"></div>
          
          <div class="card-header">
            <div class="card-avatar">${initials}</div>
            <span class="card-badge ${statusClass}">${statusText}</span>
          </div>

          <div class="card-body">
            <h3 class="card-name" title="${student.name}">${student.name}</h3>
            <span class="card-srn">${student.srn}</span>
          </div>

          <div class="card-repos">
            ${acpGitHtml}
            ${portGitHtml}
          </div>

          <div class="card-actions">
            ${actionButtons}
          </div>
        </article>
      `;
    }).join("");

    // Hook preview triggers
    portfoliosGrid.querySelectorAll(".btn-preview-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-vercel");
        const name = btn.getAttribute("data-name");
        const srn = btn.getAttribute("data-srn");
        openPreviewModal(url, name, srn);
      });
    });
  }

  /* ==========================================
     5. LIVE SANDBOX PREVIEW MODAL
     ========================================== */
  let activeIframeUrl = "";
  let iframeTimer = null;

  function openPreviewModal(url, name, srn) {
    activeIframeUrl = url;
    
    // Normalize url for displaying
    let displayUrl = url;
    if (!displayUrl.startsWith("http://") && !displayUrl.startsWith("https://")) {
      if (displayUrl.startsWith("/") || (displayUrl.includes("/") && !displayUrl.split("/")[0].includes("."))) {
        // Relative path (root-relative or directory-relative)
        try {
          const resolvedUrl = new URL(url, window.location.href).href;
          activeIframeUrl = resolvedUrl;
          displayUrl = resolvedUrl;
        } catch (e) {
          console.error("URL resolution failed:", e);
        }
      } else {
        // Standard domain without protocol (e.g., "portfolio-lsyg.vercel.app")
        displayUrl = "https://" + displayUrl;
        activeIframeUrl = "https://" + url;
      }
    }
    
    // Header texts
    previewAvatar.textContent = getInitials(name);
    previewStudentName.textContent = name;
    previewStudentSrn.textContent = srn;
    chromeAddressText.textContent = displayUrl;
    
    // Actions href
    previewBtnExternal.href = activeIframeUrl;
    fallbackExternalBtn.href = activeIframeUrl;
    
    // Reset state & elements
    iframeLoader.style.opacity = "1";
    iframeLoader.style.pointerEvents = "auto";
    iframeFallback.classList.add("hidden");
    previewIframe.classList.remove("hidden");
    previewIframe.src = "about:blank"; // Reset iframe contents
    
    // Animate open modal
    previewModal.classList.add("open");
    document.body.style.overflow = "hidden"; // Prevent background scroll
    
    // Set a safety timeout to load the website inside iframe
    if (iframeTimer) clearTimeout(iframeTimer);
    
    // Now trigger loading
    previewIframe.src = activeIframeUrl;
    
    // Wait for onload
    previewIframe.onload = () => {
      iframeLoader.style.opacity = "0";
      iframeLoader.style.pointerEvents = "none";
    };

    // A check for security/X-Frame-Options block:
    // Since we can't capture iframe load errors natively, we'll monitor if the load takes too long, 
    // or if the user complains. We'll also support a quick toggle helper to let them know they can click fallback.
    // However, we display a clear address bar and fallback guidelines.
    iframeTimer = setTimeout(() => {
      // If still loading after 8 seconds, the site might be blocking or taking too long.
      // We don't force a fallback, but we ensure the fallback container is accessible in case of error.
    }, 8000);
  }

  function closePreviewModal() {
    previewModal.classList.remove("open");
    document.body.style.overflow = "";
    previewIframe.src = "about:blank";
    activeIframeUrl = "";
    if (iframeTimer) clearTimeout(iframeTimer);
  }

  /* ==========================================
     6. HELPER FUNCTIONS
     ========================================== */
  function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /* ==========================================
     7. EVENT LISTENERS
     ========================================== */
  function setupEventListeners() {
    // Search
    searchInput.addEventListener("input", debounce(() => {
      applyFiltersAndSort();
    }, 250));

    // Reset Search
    searchInput.addEventListener("search", () => {
      applyFiltersAndSort();
    });

    // Filters (Chips)
    chipContainer.addEventListener("click", (e) => {
      const clickedBtn = e.target.closest(".chip");
      if (!clickedBtn) return;
      
      chipContainer.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      clickedBtn.classList.add("active");
      
      currentFilter = clickedBtn.getAttribute("data-filter");
      applyFiltersAndSort();
    });

    // Sorting
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      applyFiltersAndSort();
    });

    // Reset button inside empty state
    btnResetFilters.addEventListener("click", () => {
      searchInput.value = "";
      chipContainer.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chipContainer.querySelector('[data-filter="all"]').classList.add("active");
      currentFilter = "all";
      sortSelect.value = "srn-asc";
      currentSort = "srn-asc";
      applyFiltersAndSort();
    });

    // Modal Close
    previewBtnClose.addEventListener("click", closePreviewModal);
    previewBackdrop.addEventListener("click", closePreviewModal);
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && previewModal.classList.contains("open")) {
        closePreviewModal();
      }
    });

    // Device Frame Size Toggles
    deviceToggleButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        deviceToggleButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        const device = btn.getAttribute("data-device");
        
        // Remove old modes
        deviceViewport.classList.remove("desktop-mode", "tablet-mode", "mobile-mode");
        
        // Add new mode
        if (device === "desktop") {
          deviceViewport.classList.add("desktop-mode");
        } else if (device === "tablet") {
          deviceViewport.classList.add("tablet-mode");
        } else if (device === "mobile") {
          deviceViewport.classList.add("mobile-mode");
        }
      });
    });

    // Copy Link Action
    previewBtnCopy.addEventListener("click", () => {
      if (!activeIframeUrl) return;
      
      navigator.clipboard.writeText(activeIframeUrl).then(() => {
        copyBtnText.textContent = "Copied!";
        previewBtnCopy.style.borderColor = "var(--accent-green)";
        previewBtnCopy.style.color = "var(--accent-green)";
        
        setTimeout(() => {
          copyBtnText.textContent = "Copy Link";
          previewBtnCopy.style.borderColor = "var(--border-color)";
          previewBtnCopy.style.color = "var(--text-primary)";
        }, 2000);
      }).catch(err => {
        console.error("Could not copy link:", err);
      });
    });

    // Carousel Navigation
    btnPrev.addEventListener("click", () => {
      goToCarouselIndex(carouselIndex - 1);
      stopCarouselAutoPlay();
      startCarouselAutoPlay();
    });

    btnNext.addEventListener("click", () => {
      goToCarouselIndex(carouselIndex + 1);
      stopCarouselAutoPlay();
      startCarouselAutoPlay();
    });

    // Carousel responsive resize adjustments
    window.addEventListener("resize", () => {
      updateCarouselIndicators();
      updateCarouselPosition();
    });
  }

  // Debouncing helper
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Run app
  init();
});
