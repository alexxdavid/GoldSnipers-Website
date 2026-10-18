document.addEventListener("DOMContentLoaded", () => {
    initStickyHeader();
    initMobileMenu();
    initPricingToggle();
    initFaqAccordion();
    initShowcaseTabs();
    initLightboxTriggers();
    initScrollspy();
    initCookieConsent();
    initSlippageCalculator();
});

// --- Sticky Header ---
function initStickyHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                header.classList.toggle("scrolled", window.scrollY > 30);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// --- Mobile Menu Toggle ---
function initMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (!menuToggle || !navLinks) return;

    menuToggle.setAttribute("aria-label", "Toggle navigation");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-controls", "main-nav");
    navLinks.id = "main-nav";

    function updateMenuIcon(isOpen) {
        const spans = menuToggle.querySelectorAll("span");
        if (spans.length < 3) return;
        spans[0].style.transform = isOpen ? "rotate(45deg) translate(5px, 5px)" : "none";
        spans[1].style.opacity = isOpen ? "0" : "1";
        spans[2].style.transform = isOpen ? "rotate(-45deg) translate(5px, -5px)" : "none";
    }

    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");
        menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        updateMenuIcon(isOpen);
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            updateMenuIcon(false);
        });
    });
}

// --- Pricing Toggle (Backward-compatible if present) ---
function initPricingToggle() {
    const toggleSwitch = document.querySelector(".toggle-switch");
    const monthlyLabel = document.getElementById("billing-monthly");
    const annualLabel = document.getElementById("billing-annual");
    const prices = document.querySelectorAll(".price-value");
    const billingPeriods = document.querySelectorAll(".billing-period");
    if (!toggleSwitch || !monthlyLabel || !annualLabel || prices.length === 0) return;

    toggleSwitch.setAttribute("role", "switch");
    toggleSwitch.setAttribute("aria-checked", "false");
    toggleSwitch.setAttribute("tabindex", "0");
}

// --- FAQ Accordion ---
function initFaqAccordion() {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");
        if (!question || !answer) return;

        question.setAttribute("aria-expanded", "false");
        question.setAttribute("aria-controls", answer.id || (answer.id = "faq-answer-" + Math.random().toString(36).substring(2, 9)));
        answer.setAttribute("role", "region");
        answer.setAttribute("aria-labelledby", question.id || (question.id = "faq-question-" + Math.random().toString(36).substring(2, 9)));

        question.addEventListener("click", () => {
            const isActive = item.classList.toggle("active");
            question.setAttribute("aria-expanded", isActive ? "true" : "false");
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains("active")) {
                    otherItem.classList.remove("active");
                    const otherQuestion = otherItem.querySelector(".faq-question");
                    if (otherQuestion) otherQuestion.setAttribute("aria-expanded", "false");
                }
            });
        });
    });
}

// --- Showcase Tab Logic ---
function initShowcaseTabs() {
    const tabs = document.querySelectorAll(".showcase-tab");
    const displayImage = document.getElementById("showcase-display");
    const imageMap = {
        "trades-img": { directSrc: "guide-step4-live-trades.png?v=383.30", alt: "Gold Snipers Cloud Live Trades Dashboard" },
        "rules-img": { directSrc: "guide-step3-trade-rules.png?v=383.20", alt: "Signal Rules & Grid Ladder Setup" },
        "mobile-tab-img": { directSrc: "mobile_view.png?v=383.20", alt: "Standalone Mobile PWA View" },
        "analytics-tab-img": { directSrc: "cloud_analytics.png?v=383.20", alt: "Cloud Performance Analytics & Deal Lifecycle" },
        "tester-tab-img": { directSrc: "signal_test.png?v=383.20", alt: "Interactive Signal Tester & Simulator" },
        "dashboard-img": { directSrc: "dashboard.png?v=383.30", alt: "Gold Snipers Cloud Live Dashboard" }
    };

    if (!displayImage || tabs.length === 0) return;

    const picture = displayImage.closest("picture");
    const source = picture ? picture.querySelector("source") : null;
    const viewer = document.getElementById("showcase-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");

            const target = tab.getAttribute("data-target");
            if (viewer) {
                viewer.classList.toggle("is-mobile-frame", target === "mobile-tab-img");
            }
            const meta = imageMap[target];
            if (meta && meta.directSrc) {
                displayImage.style.opacity = "0.25";
                setTimeout(() => {
                    if (source) source.srcset = meta.directSrc;
                    displayImage.src = meta.directSrc;
                    displayImage.alt = meta.alt;
                    displayImage.style.opacity = "1";
                }, 120);
            }
        });
    });
}

// --- Lightbox ---
function openLightbox(src) {
    const lb = document.getElementById("showcase-lightbox");
    const img = document.getElementById("lightbox-image");
    if (!lb || !img) return;
    img.src = src;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeLightbox(e) {
    if (e && e.target !== e.currentTarget) return;
    const lb = document.getElementById("showcase-lightbox");
    if (!lb) return;
    lb.classList.remove("open");
    document.body.style.overflow = "";
}

function initLightboxTriggers() {
    const displayImage = document.getElementById("showcase-display");
    if (displayImage) {
        displayImage.addEventListener("click", () => {
            if (displayImage.src) openLightbox(displayImage.src);
        });
        displayImage.addEventListener("keydown", (e) => {
            if ((e.key === "Enter" || e.key === " ") && displayImage.src) {
                e.preventDefault();
                openLightbox(displayImage.src);
            }
        });
        displayImage.tabIndex = 0;
        displayImage.setAttribute("role", "button");
        displayImage.style.cursor = "zoom-in";
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeLightbox();
    });
}

// --- Documentation Sidebar Scrollspy ---
function initScrollspy() {
    const sidebar = document.querySelector(".doc-sidebar");
    if (!sidebar) return;

    const links = sidebar.querySelectorAll("a");
    const sections = document.querySelectorAll(".doc-section");
    if (links.length === 0 || sections.length === 0) return;

    function changeActiveLink() {
        let index = sections.length;
        while (--index && window.scrollY + 180 < sections[index].offsetTop) {}
        links.forEach(link => link.classList.remove("active"));
        if (links[index]) links[index].classList.add("active");
    }

    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                changeActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    changeActiveLink();
}

// --- Cookie Consent Banner ---
function initCookieConsent() {
    const banner = document.getElementById("cookie-consent");
    if (!banner) return;

    let consent = null;
    try {
        consent = localStorage.getItem("gs_cookie_consent");
    } catch (e) { /* ignore */ }

    if (consent) {
        if (consent === "accepted") loadTawk();
        return;
    }

    setTimeout(() => banner.classList.add("visible"), 800);

    const acceptBtn = banner.querySelector(".cookie-btn-accept");
    const declineBtn = banner.querySelector(".cookie-btn-decline");

    function saveConsent(value) {
        try {
            localStorage.setItem("gs_cookie_consent", value);
        } catch (e) { /* ignore */ }
        banner.classList.remove("visible");
        setTimeout(() => banner.remove(), 400);
        if (value === "accepted") loadTawk();
    }

    if (acceptBtn) acceptBtn.addEventListener("click", () => saveConsent("accepted"));
    if (declineBtn) declineBtn.addEventListener("click", () => saveConsent("declined"));
}

function loadTawk() {
    if (document.getElementById("tawk-loader")) return;
    var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
    (function () {
        var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.id = "tawk-loader";
        s1.src = "https://embed.tawk.to/6a30c0ab16a8811d4c595c28/1jr77180j";
        s1.charset = "UTF-8";
        s1.setAttribute("crossorigin", "*");
        s0.parentNode.insertBefore(s1, s0);
    })();
}

// --- Slippage & Delayed Entry Calculator ---
function initSlippageCalculator() {
    const signalsSlider = document.getElementById("calc-signals");
    const pipsSlider = document.getElementById("calc-pips");
    const pipValSlider = document.getElementById("calc-pipval");
    const signalsVal = document.getElementById("calc-signals-val");
    const pipsVal = document.getElementById("calc-pips-val");
    const pipValVal = document.getElementById("calc-pipval-val");
    const resultCost = document.getElementById("calc-result-cost");

    if (!signalsSlider || !pipsSlider || !pipValSlider || !resultCost) return;

    function update() {
        const signals = parseInt(signalsSlider.value, 10);
        const pips = parseFloat(pipsSlider.value);
        const pipVal = parseFloat(pipValSlider.value);

        if (signalsVal) signalsVal.textContent = signals;
        if (pipsVal) pipsVal.textContent = pips.toFixed(1);
        if (pipValVal) pipValVal.textContent = "$" + pipVal.toFixed(0);

        const monthlyLoss = Math.round(signals * pips * pipVal * 4.33);
        resultCost.textContent = "$" + monthlyLoss.toLocaleString();
    }

    signalsSlider.addEventListener("input", update);
    pipsSlider.addEventListener("input", update);
    pipValSlider.addEventListener("input", update);
    update();
}
