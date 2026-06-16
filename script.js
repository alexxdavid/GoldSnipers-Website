document.addEventListener("DOMContentLoaded", () => {
    initStickyHeader();
    initMobileMenu();
    initPricingToggle();
    initFaqAccordion();
    initHeroChart();
    initShowcaseTabs();
    initScrollspy();
    initInfographicLightbox();
});

// --- Sticky Header ---
function initStickyHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                header.classList.toggle("scrolled", window.scrollY > 50);
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
        spans[0].style.transform = isOpen ? "rotate(45deg) translate(6px, 6px)" : "none";
        spans[1].style.opacity = isOpen ? "0" : "1";
        spans[2].style.transform = isOpen ? "rotate(-45deg) translate(6px, -6px)" : "none";
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

// --- Pricing Toggle ---
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
    toggleSwitch.setAttribute("aria-label", "Toggle lifetime license");

    const pricingData = {
        monthly: [
            { price: "$29", period: "/ month", checkout: "https://goldsnipers.lemonsqueezy.com/checkout/buy/STARTER_MONTHLY_ID" },
            { price: "$39", period: "/ month", checkout: "https://goldsnipers.lemonsqueezy.com/checkout/buy/PRO_MONTHLY_ID" },
            { price: "$49", period: "/ month", checkout: "https://goldsnipers.lemonsqueezy.com/checkout/buy/DEV_MONTHLY_ID" }
        ],
        annual: [
            { price: "$299", period: "one-time", checkout: "https://goldsnipers.lemonsqueezy.com/checkout/buy/STARTER_LIFETIME_ID" },
            { price: "$399", period: "one-time", checkout: "https://goldsnipers.lemonsqueezy.com/checkout/buy/PRO_LIFETIME_ID" },
            { price: "$599", period: "one-time", checkout: "https://goldsnipers.lemonsqueezy.com/checkout/buy/DEV_LIFETIME_ID" }
        ]
    };

    const starterBtn = document.getElementById("btn-starter");
    const proBtn = document.getElementById("btn-pro");
    const lifetimeBtn = document.getElementById("btn-lifetime");

    function updatePricing(billingMode) {
        prices.forEach((el, index) => {
            el.textContent = pricingData[billingMode][index].price;
        });
        billingPeriods.forEach((el, index) => {
            el.textContent = pricingData[billingMode][index].period;
        });

        if (starterBtn) starterBtn.href = pricingData[billingMode][0].checkout;
        if (proBtn) proBtn.href = pricingData[billingMode][1].checkout;
        if (lifetimeBtn) lifetimeBtn.href = pricingData[billingMode][2].checkout;

        if (window.createLemonSqueezy) {
            window.createLemonSqueezy();
        }
    }

    function setBilling(isAnnual) {
        toggleSwitch.classList.toggle("active", isAnnual);
        toggleSwitch.setAttribute("aria-checked", isAnnual ? "true" : "false");
        if (isAnnual) {
            annualLabel.classList.add("active");
            monthlyLabel.classList.remove("active");
            updatePricing("annual");
        } else {
            monthlyLabel.classList.add("active");
            annualLabel.classList.remove("active");
            updatePricing("monthly");
        }
        try {
            localStorage.setItem("gs_billing_mode", isAnnual ? "annual" : "monthly");
        } catch (e) {
            // ignore storage errors
        }
    }

    let savedMode = null;
    try {
        savedMode = localStorage.getItem("gs_billing_mode");
    } catch (e) {
        // ignore
    }
    if (savedMode === "annual") {
        setBilling(true);
    }

    toggleSwitch.addEventListener("click", () => {
        setBilling(!toggleSwitch.classList.contains("active"));
    });

    toggleSwitch.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setBilling(!toggleSwitch.classList.contains("active"));
        }
    });
}

// --- FAQ Accordion ---
function initFaqAccordion() {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");
        if (!question || !answer) return;

        question.setAttribute("aria-expanded", "false");
        question.setAttribute("aria-controls", answer.id || (answer.id = "faq-answer-" + Math.random().toString(36).substr(2, 9)));
        answer.setAttribute("role", "region");
        answer.setAttribute("aria-labelledby", question.id || (question.id = "faq-question-" + Math.random().toString(36).substr(2, 9)));

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

// --- Hero Canvas Animation (Candlestick Chart) ---
function initHeroChart() {
    const canvas = document.getElementById("heroChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = canvas.parentElement.offsetWidth;
    let height = canvas.parentElement.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const consoleText = document.getElementById("console-text");
    let lastConsoleState = -1;

    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            width = canvas.parentElement.offsetWidth;
            height = canvas.parentElement.offsetHeight;
            canvas.width = width;
            canvas.height = height;
        }, 150);
    });

    let time = 0;
    const candles = [];
    const maxCandles = 20;

    let lastClose = height / 2 + 50;
    for (let i = 0; i < maxCandles; i++) {
        let open = lastClose;
        let close = open + (Math.random() - 0.5) * 40;
        let high = Math.min(open, close) - Math.random() * 20;
        let low = Math.max(open, close) + Math.random() * 20;
        candles.push({ open, close, high, low });
        lastClose = close;
    }

    let executionTimer = 0;
    let isAnimating = true;
    let rafId = null;

    function updateConsole() {
        if (!consoleText) return;
        let state = 0;
        let html = "";
        if (executionTimer < 50) {
            state = 0;
            html = "[BOT POLL] Listening to Telegram...<br><span class='highlight'>Waiting for setup...</span>";
        } else if (executionTimer < 100) {
            state = 1;
            html = "[BOT POLL] Listening to Telegram...<br><span class='highlight'>Waiting for setup...</span>" +
                   "<br>[0.5s] Signal detected: BUY XAUUSD @ 2354";
        } else {
            state = 2;
            html = "[BOT POLL] Listening to Telegram...<br><span class='highlight'>Waiting for setup...</span>" +
                   "<br>[0.5s] Signal detected: BUY XAUUSD @ 2354" +
                   "<br><span class='exec'>[EA EXEC] Anchor + Grid Placed!</span>";
        }
        if (state !== lastConsoleState) {
            consoleText.innerHTML = html;
            lastConsoleState = state;
        }
    }

    function drawChart() {
        if (!isAnimating) return;

        ctx.clearRect(0, 0, width, height);

        const candleWidth = (width / maxCandles) * 0.6;
        const spacing = width / maxCandles;

        // Draw Grid Lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            let y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Animate latest candle
        time += 0.05;
        let currentCandle = candles[candles.length - 1];
        currentCandle.close += Math.sin(time) * 0.5;
        if (currentCandle.close < currentCandle.high) currentCandle.high = currentCandle.close;
        if (currentCandle.close > currentCandle.low) currentCandle.low = currentCandle.close;

        // Shift candles over time
        if (time > 10) {
            time = 0;
            candles.shift();
            let open = candles[candles.length - 1].close;
            let close = open + (Math.random() - 0.4) * 40;
            let high = Math.min(open, close) - Math.random() * 20;
            let low = Math.max(open, close) + Math.random() * 20;
            candles.push({ open, close, high, low });
        }

        // Draw Candles
        candles.forEach((c, i) => {
            let x = i * spacing + spacing / 2;
            let isBullish = c.close < c.open;
            ctx.strokeStyle = isBullish ? "#00D2D3" : "#E5A93B";
            ctx.fillStyle = isBullish ? "rgba(0, 210, 211, 0.8)" : "rgba(229, 169, 59, 0.8)";

            // Draw Wick
            ctx.beginPath();
            ctx.moveTo(x, c.high);
            ctx.lineTo(x, c.low);
            ctx.stroke();

            // Draw Body
            let bodyY = Math.min(c.open, c.close);
            let bodyH = Math.max(Math.abs(c.close - c.open), 2);
            ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);
        });

        // Bridge Execution Animation overlay
        executionTimer++;
        if (executionTimer > 200) executionTimer = 0;

        if (executionTimer > 50) {
            let targetX = (maxCandles - 3) * spacing + spacing / 2;
            let targetY = candles[maxCandles - 3].close;

            ctx.fillStyle = "#00D2D3";
            ctx.beginPath();
            ctx.arc(targetX, targetY, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = "10px 'JetBrains Mono'";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText("BUY 0.10", targetX + 10, targetY + 3);

            ctx.strokeStyle = "rgba(0, 210, 211, 0.5)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, targetY);
            ctx.lineTo(width, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (executionTimer > 100) {
            let targetY = candles[maxCandles - 3].close;
            for (let j = 1; j <= 3; j++) {
                let gridY = targetY + (j * 20);
                ctx.fillStyle = "rgba(229, 169, 59, 0.8)";
                ctx.beginPath();
                ctx.arc((maxCandles - 3) * spacing + spacing / 2, gridY, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = "rgba(229, 169, 59, 0.3)";
                ctx.setLineDash([2, 4]);
                ctx.beginPath();
                ctx.moveTo(0, gridY);
                ctx.lineTo(width, gridY);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        updateConsole();
        rafId = requestAnimationFrame(drawChart);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isAnimating) {
                isAnimating = true;
                rafId = requestAnimationFrame(drawChart);
            } else if (!entry.isIntersecting) {
                isAnimating = false;
                if (rafId) cancelAnimationFrame(rafId);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(canvas.parentElement);
    rafId = requestAnimationFrame(drawChart);
}

// --- Showcase Tab Logic ---
function initShowcaseTabs() {
    const tabs = document.querySelectorAll(".showcase-tab");
    const displayImage = document.getElementById("showcase-display");
    const imageMap = {
        "dashboard-img": { name: "dashboard", w: 1024, h: 656, alt: "Desktop Bridge Dashboard" },
        "parsing-img": { name: "parsing", w: 1024, h: 651, alt: "Custom Command & Parsing Settings" },
        "test-img": { name: "signal_test", w: 1024, h: 654, alt: "Signal Tester Console" },
        "analytics-img": { name: "analytics", w: 1024, h: 607, alt: "Local Analytics & Closed Deals" }
    };

    if (!displayImage) return;

    const picture = displayImage.closest("picture");
    const source = picture ? picture.querySelector("source") : null;
    const viewer = document.getElementById("showcase-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
                t.setAttribute("tabindex", "-1");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");
            tab.setAttribute("tabindex", "0");
            tab.focus();

            const target = tab.getAttribute("data-target");
            const meta = imageMap[target];
            if (meta) {
                displayImage.style.opacity = "0.3";
                setTimeout(() => {
                    const webpSrc = `${meta.name}.webp?v=4`;
                    const pngSrc = `${meta.name}.png?v=4`;
                    const img = new Image();
                    img.onload = () => {
                        if (source) source.srcset = webpSrc;
                        displayImage.src = webpSrc;
                        displayImage.width = meta.w;
                        displayImage.height = meta.h;
                        displayImage.alt = meta.alt;
                        if (viewer) viewer.style.aspectRatio = `${meta.w} / ${meta.h}`;
                        displayImage.style.opacity = "1";
                    };
                    img.onerror = () => {
                        if (source) source.srcset = "";
                        displayImage.src = pngSrc;
                        displayImage.width = meta.w;
                        displayImage.height = meta.h;
                        displayImage.alt = meta.alt;
                        if (viewer) viewer.style.aspectRatio = `${meta.w} / ${meta.h}`;
                        displayImage.style.opacity = "1";
                    };
                    img.src = webpSrc;
                }, 150);
            }
        });
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

// --- Infographic Lightbox ---
function initInfographicLightbox() {
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const closeBtn = modal?.querySelector(".modal-close");
    if (!modal || !modalImage) return;

    function openModal(src, alt) {
        modalImage.src = src;
        modalImage.alt = alt;
        modal.hidden = false;
        document.body.style.overflow = "hidden";
        closeBtn?.focus();
    }

    function closeModal() {
        modal.hidden = true;
        modalImage.src = "";
        document.body.style.overflow = "";
    }

    document.querySelectorAll(".infographic-container[data-full]").forEach(container => {
        function activate() {
            const full = container.getAttribute("data-full");
            const img = container.querySelector("img");
            if (full) openModal(full, img?.alt || "");
        }

        container.addEventListener("click", activate);
        container.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                activate();
            }
        });
    });

    closeBtn?.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hidden) closeModal();
    });
}
