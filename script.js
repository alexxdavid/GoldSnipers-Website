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
            const spans = menuToggle.querySelectorAll("span");
            spans[0].style.transform = navLinks.classList.contains("active") ? "rotate(45deg) translate(6px, 6px)" : "none";
            spans[1].style.opacity = navLinks.classList.contains("active") ? "0" : "1";
            spans[2].style.transform = navLinks.classList.contains("active") ? "rotate(-45deg) translate(6px, -6px)" : "none";
        });

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

    // --- Pricing Toggle ---
    const toggleSwitch = document.querySelector(".toggle-switch");
    const monthlyLabel = document.getElementById("billing-monthly");
    const annualLabel = document.getElementById("billing-annual");
    const prices = document.querySelectorAll(".price-value");
    const billingPeriods = document.querySelectorAll(".billing-period");

    const pricingData = {
        monthly: [
            { price: "$49", period: "/ month" },
            { price: "$89", period: "/ month" },
            { price: "$499", period: "one-time" }
        ],
        annual: [
            { price: "$35", period: "/ month (billed annually)" },
            { price: "$59", period: "/ month (billed annually)" },
            { price: "$499", period: "one-time" }
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
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains("active")) {
                    otherItem.classList.remove("active");
                }
            });
            item.classList.toggle("active");
        });
    });

    // --- ROI Calculator Logic ---
    const capitalInput = document.getElementById("capital-input");
    const capitalValue = document.getElementById("capital-value");
    const returnInput = document.getElementById("return-input");
    const returnValue = document.getElementById("return-value");
    const projectedValue = document.getElementById("projected-value");

    function calculateROI() {
        if (!capitalInput || !returnInput || !projectedValue) return;
        const capital = parseFloat(capitalInput.value);
        const monthlyReturn = parseFloat(returnInput.value) / 100;
        
        // Compound interest for 12 months
        let futureValue = capital * Math.pow(1 + monthlyReturn, 12);
        
        capitalValue.textContent = "$" + capital.toLocaleString();
        returnValue.textContent = returnInput.value + "%";
        projectedValue.textContent = "$" + Math.round(futureValue).toLocaleString();
    }

    if (capitalInput && returnInput) {
        capitalInput.addEventListener("input", calculateROI);
        returnInput.addEventListener("input", calculateROI);
        calculateROI(); // Initial calc
    }

    // --- Hero Canvas Animation (Candlestick Chart) ---
    const canvas = document.getElementById("heroChart");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;

        window.addEventListener('resize', () => {
            width = canvas.parentElement.offsetWidth;
            height = canvas.parentElement.offsetHeight;
            canvas.width = width;
            canvas.height = height;
        });

        let time = 0;
        const candles = [];
        const maxCandles = 20;

        // Initialize fake candles
        let lastClose = height / 2 + 50;
        for (let i = 0; i < maxCandles; i++) {
            let open = lastClose;
            let close = open + (Math.random() - 0.5) * 40;
            let high = Math.min(open, close) - Math.random() * 20;
            let low = Math.max(open, close) + Math.random() * 20;
            candles.push({ open, close, high, low });
            lastClose = close;
        }

        // Bridge Execution State
        let executionStep = 0; // 0: scanning, 1: placing anchor, 2: placing grid
        let executionTimer = 0;

        function drawChart() {
            ctx.clearRect(0, 0, width, height);
            
            const candleWidth = (width / maxCandles) * 0.6;
            const spacing = width / maxCandles;

            // Draw Grid Lines
            ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            ctx.lineWidth = 1;
            for(let i=0; i<5; i++) {
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
                let close = open + (Math.random() - 0.4) * 40; // Bias slightly upward
                let high = Math.min(open, close) - Math.random() * 20;
                let low = Math.max(open, close) + Math.random() * 20;
                candles.push({ open, close, high, low });
            }

            // Draw Candles
            candles.forEach((c, i) => {
                let x = i * spacing + spacing / 2;
                
                // Color based on open/close
                let isBullish = c.close < c.open; // Canvas y is inverted
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
                // Step 1: Anchor placed
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
                // Step 2: Grid Ladder placed below
                let targetY = candles[maxCandles - 3].close;
                for (let j = 1; j <= 3; j++) {
                    let gridY = targetY + (j * 20); // Limit orders below
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

            // Update Mock Console
            const consoleText = document.getElementById("console-text");
            if (consoleText) {
                if (executionTimer === 10) consoleText.innerHTML = "[BOT POLL] Listening to Telegram...<br><span class='highlight'>Waiting for setup...</span>";
                if (executionTimer === 50) consoleText.innerHTML += "<br>[0.5s] Signal detected: BUY XAUUSD @ 2354";
                if (executionTimer === 100) consoleText.innerHTML += "<br><span class='exec'>[EA EXEC] Anchor + Grid Placed!</span>";
            }

            requestAnimationFrame(drawChart);
        }

        drawChart();
    }
});
