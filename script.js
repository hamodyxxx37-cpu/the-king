document.addEventListener('DOMContentLoaded', () => {
    // 1. Clock and Date Implementation
    const updateTime = () => {
        const now = new Date();
        const clockElement = document.getElementById('clock');
        const dateElement = document.getElementById('date');

        clockElement.textContent = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        dateElement.textContent = now.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    setInterval(updateTime, 1000);
    updateTime();

    // 2. State Management & Persistence
    const taskList = document.getElementById('task-list');
    const addTaskBtn = document.getElementById('add-task-btn');
    const ledgerBody = document.getElementById('ledger-body');
    const goldCountElement = document.getElementById('gold-count');
    const chartPath = document.querySelector('.chart-line');
    const chartFill = document.querySelector('.chart-fill');

    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('royal_tasks')) || [
        { id: 1, text: "Review the Royal Treasury", completed: false },
        { id: 2, text: "Consult with the Council", completed: false }
    ];

    // Load kingdom state with fallback values
    let treasuryAU = parseInt(localStorage.getItem('treasury_au')) || 1240000;
    let ledgerEntries = JSON.parse(localStorage.getItem('ledger_entries')) || [
        { event: "Gold Standard", impact: "Economic Stability", status: "Initial", date: new Date().toLocaleDateString('en-GB') },
        { event: "Treaty Signed", impact: "Peace with Outer Rim", status: "Success", date: new Date().toLocaleDateString('en-GB') }
    ];
    let chartData = JSON.parse(localStorage.getItem('chart_data')) || [120, 110, 130, 90, 100, 60, 70, 30, 40];

    console.log('REX HUB State Loaded:', { tasks, treasuryAU, ledgerEntries, chartData });

    const saveState = () => {
        localStorage.setItem('royal_tasks', JSON.stringify(tasks));
        localStorage.setItem('treasury_au', treasuryAU.toString());
        localStorage.setItem('ledger_entries', JSON.stringify(ledgerEntries));
        localStorage.setItem('chart_data', JSON.stringify(chartData));
        console.log('REX HUB State Saved');
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <span>${task.text}</span>
                <i class="${task.completed ? 'fas fa-check-circle' : 'far fa-circle'}" 
                   style="cursor: pointer; color: ${task.completed ? 'var(--primary-gold)' : 'var(--text-muted)'}"></i>
            `;

            // Toggle completion
            li.querySelector('i').onclick = () => {
                task.completed = !task.completed;
                if (task.completed) {
                    addLedgerEntry("Decree Fulfilled", task.text, "Success");
                }
                saveState();
                renderTasks();
            };

            // Long press or double click to delete (Simple UX)
            li.ondblclick = () => {
                tasks = tasks.filter(t => t.id !== task.id);
                saveState();
                renderTasks();
            };

            taskList.appendChild(li);
        });
    };

    // Modal Elements
    const modalOverlay = document.getElementById('modal-overlay');
    const decreeInput = document.getElementById('decree-input');
    const cancelModal = document.getElementById('cancel-modal');
    const confirmModal = document.getElementById('confirm-modal');

    const showModal = () => {
        modalOverlay.style.display = 'flex';
        decreeInput.value = '';
        setTimeout(() => modalOverlay.querySelector('.modal').classList.add('active'), 10);
        decreeInput.focus();
    };

    const hideModal = () => {
        modalOverlay.querySelector('.modal').classList.remove('active');
        setTimeout(() => modalOverlay.style.display = 'none', 300);
    };

    addTaskBtn.onclick = showModal;

    cancelModal.onclick = hideModal;

    confirmModal.onclick = () => {
        const text = decreeInput.value.trim();
        if (text) {
            tasks.push({
                id: Date.now(),
                text: text,
                completed: false
            });
            saveState();
            renderTasks();
            hideModal();
        }
    };

    // Close modal on Enter
    decreeInput.onkeypress = (e) => {
        if (e.key === 'Enter') confirmModal.click();
    };

    // Close modal on background click
    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) hideModal();
    };

    renderTasks();

    // 3. Phase 2: Imperial Treasury Logic
    const updateTreasury = (amount) => {
        treasuryAU += amount;

        // Add new data point to chart (simulated growth/reduction)
        const lastVal = chartData[chartData.length - 1];
        const newVal = Math.max(10, Math.min(140, lastVal - (amount / 5000))); // Map amount to chart Y
        chartData.push(newVal);
        if (chartData.length > 15) chartData.shift();

        renderTreasury();
        renderChart();
        saveState();
    };

    const renderTreasury = () => {
        goldCountElement.textContent = treasuryAU.toLocaleString() + ' AU';
        goldCountElement.style.color = 'var(--accent-amber)';
        setTimeout(() => goldCountElement.style.color = 'var(--primary-gold)', 300);
    };

    const renderChart = () => {
        const points = chartData.map((y, x) => `${(x / (chartData.length - 1)) * 400},${y}`).join(' ');
        chartPath.setAttribute('d', 'M' + points);
        chartFill.setAttribute('d', `M0,150 L${points} L400,150 Z`);
    };

    const addLedgerEntry = (event, impact, status) => {
        const entry = {
            event,
            impact,
            status,
            date: new Date().toLocaleDateString('en-GB')
        };
        ledgerEntries.unshift(entry);
        if (ledgerEntries.length > 5) ledgerEntries.pop();
        renderLedger();
        saveState();
    };

    const renderLedger = () => {
        ledgerBody.innerHTML = '';
        ledgerEntries.forEach(entry => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
            row.innerHTML = `
                <td style="padding: 0.5rem; font-weight: 500;">${entry.event}</td>
                <td style="padding: 0.5rem; color: var(--text-muted);">${entry.impact}</td>
                <td style="padding: 0.5rem; color: var(--primary-gold);">${entry.date}</td>
            `;
            ledgerBody.appendChild(row);
        });
    };

    // Initial Render
    renderTreasury();
    renderChart();
    renderLedger();

    // 4. Phase 2: The Throne Room Actions
    const raiseTaxesBtn = document.getElementById('raise-taxes');
    const declareFeastBtn = document.getElementById('declare-feast');
    const summonKnightsBtn = document.getElementById('summon-knights');
    const statusText = document.querySelector('.welcome-msg .date');

    // Restore Status if militarized
    if (ledgerEntries.some(e => e.event === "Legion Summoned")) {
        statusText.textContent = "Dominion Status: MILITARIZED";
        statusText.style.color = 'var(--primary-gold)';
    }

    raiseTaxesBtn.onclick = () => {
        updateTreasury(50000);
        addLedgerEntry("Tax Hike", "+50,000 AU", "Prosperity");
    };

    declareFeastBtn.onclick = () => {
        createConfetti();
        updateTreasury(-10000); // Feasts cost gold!
        addLedgerEntry("Royal Feast", "-10,000 AU", "Morale Up");
    };

    summonKnightsBtn.onclick = () => {
        statusText.textContent = "Dominion Status: MILITARIZED";
        statusText.style.color = 'var(--primary-gold)';
        addLedgerEntry("Legion Summoned", "Security High", "Alert");
    };

    // Confetti Effect
    const createConfetti = () => {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.backgroundColor = Math.random() > 0.5 ? 'var(--primary-gold)' : 'var(--accent-amber)';
            document.body.appendChild(confetti);

            // Remove after animation
            setTimeout(() => confetti.remove(), 5000);
        }
    };

    // 5. Phase 2: The Bard's Corner
    const playPauseBtn = document.getElementById('play-pause');
    const visualizer = document.querySelector('.visualizer');
    let isPlaying = false;

    playPauseBtn.onclick = () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            visualizer.style.display = 'flex';
        } else {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            visualizer.style.display = 'none';
        }
    };

    // 5. Phase 4: SPA Routing Logic
    const switchView = (viewId) => {
        const views = document.querySelectorAll('.view');
        const navItems = document.querySelectorAll('.nav-links .nav-item');

        // Update Nav Active State
        navItems.forEach(nav => {
            if (nav.id === `nav-${viewId}`) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });

        // Update View Visibility
        views.forEach(view => {
            if (view.id === `${viewId}-view`) {
                view.style.display = 'block';
                // Trigger a reflow for animation
                view.offsetHeight;
                view.classList.add('active');
            } else {
                view.classList.remove('active');
                view.style.display = 'none';
            }
        });

        console.log(`Kingdom Navigation: Switched to ${viewId.toUpperCase()}`);
    };

    const setupNav = (navId, viewId) => {
        const btn = document.getElementById(navId);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                switchView(viewId);
            });
        }
    };

    // Initialize Navigation
    setupNav('nav-dashboard', 'dashboard');
    setupNav('nav-strategy', 'strategy');
    setupNav('nav-analytics', 'analytics');
    setupNav('nav-territory', 'territory');
    setupNav('nav-settings', 'settings');

    // 6. Settings Logic
    const kingdomNameInput = document.getElementById('kingdom-name-input');
    const royalTitleInput = document.getElementById('royal-title-input');
    const startingGoldInput = document.getElementById('starting-gold-input');
    const taxRateInput = document.getElementById('tax-rate-input');

    // Load existing settings into fields
    const savedKingdomName = localStorage.getItem('kingdom_name') || '';
    const savedRoyalTitle = localStorage.getItem('royal_title') || '';
    if (kingdomNameInput) kingdomNameInput.value = savedKingdomName;
    if (royalTitleInput) royalTitleInput.value = savedRoyalTitle;
    if (startingGoldInput) startingGoldInput.value = localStorage.getItem('starting_gold') || '';
    if (taxRateInput) taxRateInput.value = localStorage.getItem('tax_rate') || '';

    // Apply saved kingdom name to header
    if (savedKingdomName) {
        const h1 = document.querySelector('.welcome-msg h1');
        if (h1) h1.textContent = `Welcome, ${savedRoyalTitle || 'Your Majesty'}`;
    }

    const saveIdentityBtn = document.getElementById('save-identity-btn');
    if (saveIdentityBtn) {
        saveIdentityBtn.onclick = () => {
            const name = kingdomNameInput.value.trim();
            const title = royalTitleInput.value.trim();
            if (name) localStorage.setItem('kingdom_name', name);
            if (title) localStorage.setItem('royal_title', title);
            const h1 = document.querySelector('.welcome-msg h1');
            if (h1) h1.textContent = `Welcome, ${title || 'Your Majesty'}`;
            addLedgerEntry('Identity Updated', name || 'Kingdom', 'Confirmed');
            saveIdentityBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => { saveIdentityBtn.innerHTML = '<i class="fas fa-save"></i> Save Identity'; }, 2000);
        };
    }

    const saveTreasuryBtn = document.getElementById('save-treasury-btn');
    if (saveTreasuryBtn) {
        saveTreasuryBtn.onclick = () => {
            const gold = parseInt(startingGoldInput.value);
            const rate = parseInt(taxRateInput.value);
            if (!isNaN(gold)) localStorage.setItem('starting_gold', gold);
            if (!isNaN(rate)) localStorage.setItem('tax_rate', rate);
            saveTreasuryBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => { saveTreasuryBtn.innerHTML = '<i class="fas fa-coins"></i> Save Settings'; }, 2000);
        };
    }

    const resetKingdomBtn = document.getElementById('reset-kingdom-btn');
    if (resetKingdomBtn) {
        resetKingdomBtn.onclick = () => {
            if (confirm('Are you absolutely certain? All kingdom data will be lost forever.')) {
                localStorage.clear();
                location.reload();
            }
        };
    }

    // 7. Abdicate Logic
    const abdicateOverlay = document.getElementById('abdicate-overlay');
    const cancelAbdicate = document.getElementById('cancel-abdicate');
    const confirmAbdicate = document.getElementById('confirm-abdicate');

    document.getElementById('nav-abdicate').addEventListener('click', (e) => {
        e.preventDefault();
        abdicateOverlay.style.display = 'flex';
        setTimeout(() => abdicateOverlay.querySelector('.modal').classList.add('active'), 10);
    });

    cancelAbdicate.onclick = () => {
        abdicateOverlay.querySelector('.modal').classList.remove('active');
        setTimeout(() => abdicateOverlay.style.display = 'none', 300);
    };

    confirmAbdicate.onclick = () => {
        document.body.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0a0a0f;color:var(--primary-gold,#d4af37);font-family:serif;text-align:center;gap:1.5rem;">
                <i class="fas fa-crown" style="font-size:5rem;opacity:0.4;"></i>
                <h1 style="font-size:2.5rem;">The Throne Stands Empty</h1>
                <p style="color:#888;max-width:400px;">Your legacy shall endure in the annals of the kingdom. The realm mourns, yet persists.</p>
                <a href="index.html" style="margin-top:1rem;padding:1rem 2rem;border:1px solid #d4af37;color:#d4af37;text-decoration:none;border-radius:10px;font-size:1rem;">Return to Power</a>
            </div>`;
    };


    // 7. View Specific Interactions
    // Territory Map Interactions
    const mapPoints = document.querySelectorAll('.map-point');
    mapPoints.forEach(point => {
        point.onclick = () => {
            const provinceName = point.getAttribute('title');
            alert(`Province: ${provinceName}\nStatus: FLOURISHING\nDefense: 85%\nStability: HIGH`);
        };
    });

    // 6. Subtle Interaction Effects
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Potential for more complex animations or sounds
        });
    });
});
