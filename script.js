document.addEventListener("DOMContentLoaded", () => {
    // --- Sticky Header ---
    const header = document.querySelector("header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            // Animate toggle lines
            const spans = menuToggle.querySelectorAll("span");
            spans[0].style.transform = navLinks.classList.contains("active") ? "rotate(45deg) translate(6px, 6px)" : "none";
            spans[1].style.opacity = navLinks.classList.contains("active") ? "0" : "1";
            spans[2].style.transform = navLinks.classList.contains("active") ? "rotate(-45deg) translate(6px, -6px)" : "none";
        });

        // Close menu on link click
        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                const spans = menuToggle.querySelectorAll("span");
                spans[0].style.transform = "none";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "none";
            });
        });
    }

    // --- Pricing Toggle (Monthly vs Annual) ---
    const toggleSwitch = document.querySelector(".toggle-switch");
    const monthlyLabel = document.getElementById("billing-monthly");
    const annualLabel = document.getElementById("billing-annual");
    const prices = document.querySelectorAll(".price-value");
    const billingPeriods = document.querySelectorAll(".billing-period");

    const pricingData = {
        monthly: [
            { price: "$49", period: "/ month" },
            { price: "$99", period: "/ month" },
            { price: "$499", period: "one-time" }
        ],
        annual: [
            { price: "$35", period: "/ month (billed annually)" },
            { price: "$69", period: "/ month (billed annually)" },
            { price: "$499", period: "one-time" } // Lifetime doesn't change
        ]
    };

    function updatePricing(billingMode) {
        prices.forEach((el, index) => {
            el.textContent = pricingData[billingMode][index].price;
        });
        billingPeriods.forEach((el, index) => {
            el.textContent = pricingData[billingMode][index].period;
        });
    }

    if (toggleSwitch) {
        toggleSwitch.addEventListener("click", () => {
            toggleSwitch.classList.toggle("active");
            const isAnnual = toggleSwitch.classList.contains("active");
            
            if (isAnnual) {
                annualLabel.classList.add("active");
                monthlyLabel.classList.remove("active");
                updatePricing("annual");
            } else {
                monthlyLabel.classList.add("active");
                annualLabel.classList.remove("active");
                updatePricing("monthly");
            }
        });
    }

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");
        question.addEventListener("click", () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains("active")) {
                    otherItem.classList.remove("active");
                }
            });
            item.classList.toggle("active");
        });
    });

    // --- Mock Chart Bar Animation ---
    const bars = document.querySelectorAll(".chart-mock .bar");
    function animateChart() {
        bars.forEach(bar => {
            const currentHeight = bar.style.height || "50%";
            // Randomly vary height slightly to look like active trading ticks
            const base = parseFloat(currentHeight);
            const variation = (Math.random() - 0.5) * 15;
            let newHeight = Math.max(10, Math.min(95, base + variation));
            bar.style.height = `${newHeight}%`;
        });
    }
    
    // Set initial heights
    bars.forEach(bar => {
        bar.style.height = `${Math.floor(Math.random() * 60) + 20}%`;
    });

    setInterval(animateChart, 1500);
});
