document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Data Store / State Setup
    // -------------------------------------------------------------
    let users = JSON.parse(localStorage.getItem('gca_users')) || [];
    let currentSession = localStorage.getItem('gca_session') || null;

    // View Elements
    const views = {
        landing: document.getElementById('landing-content'),
        register: document.getElementById('register-content'),
        login: document.getElementById('login-content'),
        dashboard: document.getElementById('dashboard-content'),
        visual: document.getElementById('landing-visual'),
        container: document.getElementById('main-container')
    };

    // -------------------------------------------------------------
    // 2. View Switcher Routing Logic
    // -------------------------------------------------------------
    function switchView(viewName) {
        // Hide all views
        views.landing.classList.add('hidden');
        views.register.classList.add('hidden');
        views.login.classList.add('hidden');
        views.dashboard.classList.add('hidden');
        
        // Show visual side by default (for landing, login, register)
        views.visual.classList.remove('hidden');
        views.container.classList.remove('dashboard-active');

        if (viewName === 'dashboard') {
            views.dashboard.classList.remove('hidden');
            views.visual.classList.add('hidden');
            views.container.classList.add('dashboard-active');
            loadDashboardData();
        } else if (viewName === 'register') {
            views.register.classList.remove('hidden');
        } else if (viewName === 'login') {
            views.login.classList.remove('hidden');
        } else {
            views.landing.classList.remove('hidden');
        }
        
        // Scroll to top of content side
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // -------------------------------------------------------------
    // 3. Setup Navigation / Button Handlers
    // -------------------------------------------------------------
    
    // Join CTA is now a native <a> link to Google Form — no JS handler needed
    document.getElementById('portal-login-trigger')?.addEventListener('click', () => switchView('login'));
    document.getElementById('to-login-btn')?.addEventListener('click', (e) => { e.preventDefault(); switchView('login'); });
    document.getElementById('to-register-btn')?.addEventListener('click', (e) => { e.preventDefault(); switchView('register'); });
    
    document.querySelectorAll('.to-landing-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); switchView('landing'); });
    });

    // Logout Button
    document.getElementById('dash-logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('gca_session');
        currentSession = null;
        showToast('Logged out successfully.');
        switchView('landing');
    });

    // -------------------------------------------------------------
    // 4. Registration Logic
    // -------------------------------------------------------------
    const regForm = document.getElementById('register-form');
    regForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullname = document.getElementById('reg-fullname').value.trim();
        const whatsapp = document.getElementById('reg-whatsapp').value.trim();
        const password = document.getElementById('reg-password').value;
        const license = document.getElementById('reg-license').value;
        const pincode = document.getElementById('reg-pincode').value.trim();
        const vehicle = document.getElementById('reg-vehicle').value;
        const km = document.getElementById('reg-km').value;

        // Check if user already exists
        if (users.some(u => u.whatsapp === whatsapp)) {
            alert('A rider with this WhatsApp number already exists! Please login instead.');
            switchView('login');
            return;
        }

        // Create new user with seeded starting data
        const newUser = {
            fullname,
            whatsapp,
            password,
            license,
            pincode,
            vehicle,
            km,
            profile: {
                profession: '',
                age: '',
                licenseNum: '',
                email: '',
                pan: '',
                aadhar: '',
                address: '',
                sponsorId: ''
            },
            bank: null,
            stats: {
                totalIncome: 1080.00,
                unpaidIncome: 1080.00,
                drivenIncome: 780.00,
                referralIncome: 300.00,
                totalKm: 120,
                lastOdometer: 12000,
                totalReferrals: 2,
                adsRun: 1,
                activePartners: 2
            },
            speedoHistory: [
                { date: getFormattedDate(0), prevKm: 11880, currKm: 12000, diffKm: 120, earnings: 780.00, status: 'Verified' }
            ],
            withdrawHistory: [],
            supportTickets: [
                { date: getFormattedDate(0), subject: 'Welcome Campaign Package', priority: 'Medium', message: 'Hello! I registered and wanted to know when my ads will be active.', status: 'Closed', reply: 'System: Welcome to Game Changer! Your ads are active. Start driving!' }
            ]
        };

        users.push(newUser);
        localStorage.setItem('gca_users', JSON.stringify(users));
        
        // Log in automatically
        localStorage.setItem('gca_session', whatsapp);
        currentSession = whatsapp;

        showToast('Account created successfully!');
        regForm.reset();
        switchView('dashboard');
    });

    // -------------------------------------------------------------
    // 5. Login Logic
    // -------------------------------------------------------------
    const loginForm = document.getElementById('login-form');
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const whatsapp = document.getElementById('login-whatsapp').value.trim();
        const password = document.getElementById('login-password').value;

        const user = users.find(u => u.whatsapp === whatsapp && u.password === password);

        if (!user) {
            alert('Invalid WhatsApp number or password. Please try again.');
            return;
        }

        localStorage.setItem('gca_session', whatsapp);
        currentSession = whatsapp;

        showToast('Logged in successfully!');
        loginForm.reset();
        switchView('dashboard');
    });

    // -------------------------------------------------------------
    // 6. Dashboard Tabs Switching
    // -------------------------------------------------------------
    const tabButtons = document.querySelectorAll('.dashboard-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.tab-container .tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetTab)?.classList.add('active');
        });
    });

    // -------------------------------------------------------------
    // 7. Dashboard Live Loading & Tab Logic
    // -------------------------------------------------------------
    function getCurrentUser() {
        return users.find(u => u.whatsapp === currentSession);
    }

    function saveUserData(user) {
        const index = users.findIndex(u => u.whatsapp === user.whatsapp);
        if (index !== -1) {
            users[index] = user;
            localStorage.setItem('gca_users', JSON.stringify(users));
        }
    }

    function loadDashboardData() {
        const user = getCurrentUser();
        if (!user) {
            switchView('landing');
            return;
        }

        // Welcome text
        document.getElementById('dash-user-name').textContent = user.fullname.toUpperCase();

        // Load stats
        document.getElementById('stat-total-income').textContent = `₹${user.stats.totalIncome.toFixed(2)}`;
        document.getElementById('stat-unpaid-income').textContent = `₹${user.stats.unpaidIncome.toFixed(2)}`;
        document.getElementById('stat-driven-income').textContent = `₹${user.stats.drivenIncome.toFixed(2)}`;
        document.getElementById('stat-referral-income').textContent = `₹${user.stats.referralIncome.toFixed(2)}`;

        document.getElementById('stat-total-km').textContent = `${user.stats.totalKm} km`;
        document.getElementById('stat-last-odometer').textContent = `${user.stats.lastOdometer} km`;
        document.getElementById('stat-total-referrals').textContent = user.stats.totalReferrals;
        document.getElementById('stat-ads-run').textContent = user.stats.adsRun;
        document.getElementById('stat-active-partners').textContent = user.stats.activePartners;

        // Speedometer reading setup
        const prevInput = document.getElementById('speedo-prev');
        if (prevInput) {
            prevInput.value = user.stats.lastOdometer;
        }
        
        // Populate lists
        renderSpeedoHistory(user.speedoHistory);
        renderWithdrawalHistory(user.withdrawHistory);
        renderTicketsHistory(user.supportTickets);

        // Pre-fill profile form
        document.getElementById('prof-fullname').value = user.fullname;
        document.getElementById('prof-whatsapp').value = user.whatsapp;
        document.getElementById('prof-email').value = user.profile.email || '';
        document.getElementById('prof-profession').value = user.profile.profession || '';
        document.getElementById('prof-age').value = user.profile.age || '';
        document.getElementById('prof-license').value = user.profile.licenseNum || '';
        document.getElementById('prof-pan').value = user.profile.pan || '';
        document.getElementById('prof-aadhar').value = user.profile.aadhar || '';
        document.getElementById('prof-address').value = user.profile.address || '';
        document.getElementById('prof-pincode').value = user.pincode;
        document.getElementById('prof-sponsor').value = user.profile.sponsorId || '';
        document.getElementById('prof-vehicle').value = user.vehicle;
        document.getElementById('prof-km').value = user.km;

        // Pre-fill bank details if they exist
        if (user.bank) {
            document.getElementById('bank-holder').value = user.bank.holder || '';
            document.getElementById('bank-ifsc').value = user.bank.ifsc || '';
            document.getElementById('bank-name').value = user.bank.name || '';
            document.getElementById('bank-branch').value = user.bank.branch || '';
            document.getElementById('bank-number').value = user.bank.number || '';
        }
    }

    // -------------------------------------------------------------
    // 8. Speedometer Reading Calculator & Submission
    // -------------------------------------------------------------
    const speedoCurrInput = document.getElementById('speedo-curr');
    const calcDiff = document.getElementById('calc-diff');
    const calcAccountable = document.getElementById('calc-accountable');
    const calcEstEarnings = document.getElementById('calc-est-earnings');
    const speedoImgInput = document.getElementById('speedo-img');
    const speedoImgPreview = document.getElementById('speedo-img-preview');
    const ratePerKm = 6.50;

    function updateSpeedoCalculations() {
        const user = getCurrentUser();
        if (!user) return;

        const prev = user.stats.lastOdometer;
        const curr = parseInt(speedoCurrInput.value) || 0;

        if (curr > prev) {
            const diff = curr - prev;
            // Cap accountable KM per entry if needed, otherwise difference
            const accountable = diff; 
            const estEarnings = accountable * ratePerKm;

            calcDiff.textContent = `${diff} KM`;
            calcAccountable.textContent = `${accountable} KM`;
            calcEstEarnings.textContent = `₹${estEarnings.toFixed(2)}`;
        } else {
            calcDiff.textContent = `0 KM`;
            calcAccountable.textContent = `0 KM`;
            calcEstEarnings.textContent = `₹0.00`;
        }
    }

    speedoCurrInput?.addEventListener('input', updateSpeedoCalculations);

    // Show Image Preview
    speedoImgInput?.addEventListener('change', function() {
        const file = this.files[0];
        if (file && speedoImgPreview) {
            const reader = new FileReader();
            reader.onload = function(e) {
                speedoImgPreview.src = e.target.result;
                speedoImgPreview.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    });

    const speedoForm = document.getElementById('speedometer-form');
    speedoForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = getCurrentUser();
        if (!user) return;

        const prev = user.stats.lastOdometer;
        const curr = parseInt(speedoCurrInput.value);

        if (curr <= prev) {
            alert(`Current reading must be strictly greater than previous reading (${prev} km)!`);
            return;
        }

        const diff = curr - prev;
        const earnings = diff * ratePerKm;

        // Create new entry
        const entry = {
            date: getFormattedDate(0),
            prevKm: prev,
            currKm: curr,
            diffKm: diff,
            earnings: earnings,
            status: 'Verified' // Automatically verified for demo mockup
        };

        user.speedoHistory.unshift(entry);

        // Update stats
        user.stats.lastOdometer = curr;
        user.stats.totalKm += diff;
        user.stats.drivenIncome += earnings;
        user.stats.totalIncome += earnings;
        user.stats.unpaidIncome += earnings;

        saveUserData(user);
        loadDashboardData();
        showToast('Speedometer proof submitted and verified!');
        
        // Reset speedo input fields
        speedoForm.reset();
        speedoImgPreview.classList.add('hidden');
        calcDiff.textContent = `0 KM`;
        calcAccountable.textContent = `0 KM`;
        calcEstEarnings.textContent = `₹0.00`;
    });

    function renderSpeedoHistory(history) {
        const tbody = document.getElementById('speedo-history-tbody');
        if (!tbody) return;

        if (history.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-gray);">No readings submitted yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = history.map(h => `
            <tr>
                <td>${h.date}</td>
                <td>${h.prevKm} km</td>
                <td>${h.currKm} km</td>
                <td>+${h.diffKm} km</td>
                <td class="yellow-text">₹${h.earnings.toFixed(2)}</td>
                <td><span class="badge-status status-verified">${h.status}</span></td>
            </tr>
        `).join('');
    }

    // -------------------------------------------------------------
    // 9. Profile Saving
    // -------------------------------------------------------------
    const profileForm = document.getElementById('profile-form');
    profileForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = getCurrentUser();
        if (!user) return;

        user.fullname = document.getElementById('prof-fullname').value.trim();
        user.profile.email = document.getElementById('prof-email').value.trim();
        user.profile.profession = document.getElementById('prof-profession').value;
        user.profile.age = document.getElementById('prof-age').value;
        user.profile.licenseNum = document.getElementById('prof-license').value.trim();
        user.profile.pan = document.getElementById('prof-pan').value.trim();
        user.profile.aadhar = document.getElementById('prof-aadhar').value.trim();
        user.profile.address = document.getElementById('prof-address').value.trim();
        user.pincode = document.getElementById('prof-pincode').value.trim();
        user.profile.sponsorId = document.getElementById('prof-sponsor').value.trim();
        user.vehicle = document.getElementById('prof-vehicle').value;
        user.km = document.getElementById('prof-km').value;

        saveUserData(user);
        loadDashboardData();
        showToast('Profile updated successfully!');
    });

    // -------------------------------------------------------------
    // 10. Bank & Withdrawal Requests
    // -------------------------------------------------------------
    const bankForm = document.getElementById('bank-form');
    bankForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = getCurrentUser();
        if (!user) return;

        user.bank = {
            holder: document.getElementById('bank-holder').value.trim(),
            ifsc: document.getElementById('bank-ifsc').value.trim(),
            name: document.getElementById('bank-name').value.trim(),
            branch: document.getElementById('bank-branch').value.trim(),
            number: document.getElementById('bank-number').value.trim()
        };

        saveUserData(user);
        loadDashboardData();
        showToast('Bank details saved successfully!');
    });

    // Withdrawal action handlers
    const withdrawBtn = document.getElementById('dash-withdraw-btn');
    const handleWithdrawalRequest = () => {
        const user = getCurrentUser();
        if (!user) return;

        if (user.stats.unpaidIncome <= 0) {
            alert('Your Current Unpaid Balance is ₹0. There are no earnings to withdraw.');
            return;
        }

        if (!user.bank) {
            alert('Please add and save your Bank Account Details in the "Withdrawals" tab before requesting a payout!');
            // Auto switch to withdrawals tab
            const tabBtn = document.querySelector('[data-tab="tab-withdraw"]');
            tabBtn?.click();
            return;
        }

        const gross = user.stats.unpaidIncome;
        const fee = gross * 0.05; // 5% charge
        const net = gross - fee;
        const orderId = 'WD' + Math.floor(100000 + Math.random() * 900000);
        const bankMask = `${user.bank.name} (*${user.bank.number.slice(-4)})`;

        // Create withdrawal record
        const record = {
            date: getFormattedDate(0),
            orderId: orderId,
            gross: gross,
            fee: fee,
            net: net,
            bankMask: bankMask,
            status: 'Pending'
        };

        user.withdrawHistory.unshift(record);
        
        // Reset current unpaid balance
        user.stats.unpaidIncome = 0;

        saveUserData(user);
        loadDashboardData();
        alert(`Withdrawal request submitted successfully!\n\nOrder ID: ${orderId}\nGross Amount: ₹${gross.toFixed(2)}\nFee (5%): ₹${fee.toFixed(2)}\nNet Transferred: ₹${net.toFixed(2)}\n\nPayment will reflect in your account within 24 hours.`);
    };

    withdrawBtn?.addEventListener('click', handleWithdrawalRequest);

    function renderWithdrawalHistory(history) {
        const tbody = document.getElementById('withdraw-history-tbody');
        if (!tbody) return;

        if (history.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-text-gray);">No withdrawal history found.</td></tr>`;
            return;
        }

        tbody.innerHTML = history.map(w => `
            <tr>
                <td>${w.date}</td>
                <td>${w.orderId}</td>
                <td class="yellow-text">₹${w.gross.toFixed(2)}</td>
                <td>₹${w.fee.toFixed(2)}</td>
                <td><strong>₹${w.net.toFixed(2)}</strong></td>
                <td>${w.bankMask}</td>
                <td><span class="badge-status status-pending">${w.status}</span></td>
            </tr>
        `).join('');
    }

    // -------------------------------------------------------------
    // 11. Support Tickets Desk
    // -------------------------------------------------------------
    const ticketForm = document.getElementById('ticket-form');
    ticketForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = getCurrentUser();
        if (!user) return;

        const subject = document.getElementById('ticket-subject').value.trim();
        const priority = document.getElementById('ticket-priority').value;
        const message = document.getElementById('ticket-message').value.trim();

        const newTicket = {
            date: getFormattedDate(0),
            subject: subject,
            priority: priority,
            message: message,
            status: 'Open',
            reply: null
        };

        user.supportTickets.unshift(newTicket);
        saveUserData(user);
        loadDashboardData();
        
        showToast('Support ticket created successfully!');
        ticketForm.reset();

        // Simulate interactive support reply after 3.5 seconds
        setTimeout(() => {
            const freshUser = getCurrentUser();
            if (freshUser && freshUser.supportTickets.length > 0) {
                // Find that specific ticket (since it was just unshifted, it's at index 0)
                freshUser.supportTickets[0].status = 'Replied';
                freshUser.supportTickets[0].reply = `Support Executive: Thank you for raising this. We have received your ticket regarding "${subject}". Our backend verification team is checking the details. We will update you here shortly.`;
                saveUserData(freshUser);
                loadDashboardData();
                showToast('New update on your support ticket!');
            }
        }, 3500);
    });

    function renderTicketsHistory(tickets) {
        const tbody = document.getElementById('tickets-history-tbody');
        if (!tbody) return;

        if (tickets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-text-gray);">No support tickets raised yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = tickets.map(t => {
            const lastMsg = t.reply ? t.reply.substring(0, 50) + '...' : t.message.substring(0, 50) + '...';
            const statusClass = t.status === 'Open' ? 'status-open' : (t.status === 'Closed' ? 'status-verified' : 'status-pending');
            
            return `
                <tr>
                    <td>${t.date}</td>
                    <td><strong>${t.subject}</strong></td>
                    <td>${t.priority}</td>
                    <td style="font-size:0.85rem; color:var(--color-text-gray); cursor:pointer;" onclick="alert('Ticket History:\\n\\nUser: ${t.message.replace(/'/g, "\\'")}\\n\\n${t.reply ? t.reply.replace(/'/g, "\\'") : 'No replies yet.'}')">
                        ${lastMsg} <span style="color:var(--color-brand-yellow); text-decoration:underline; font-size:0.75rem;">(View Full)</span>
                    </td>
                    <td><span class="badge-status ${statusClass}">${t.status}</span></td>
                </tr>
            `;
        }).join('');
    }

    // -------------------------------------------------------------
    // 12. Security Settings (Change password)
    // -------------------------------------------------------------
    const securityForm = document.getElementById('security-form');
    securityForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = getCurrentUser();
        if (!user) return;

        const current = document.getElementById('pwd-current').value;
        const newPwd = document.getElementById('pwd-new').value;
        const confirm = document.getElementById('pwd-confirm').value;

        if (current !== user.password) {
            alert('Incorrect current password. Please try again.');
            return;
        }

        if (newPwd !== confirm) {
            alert('New passwords do not match. Please ensure both fields are identical.');
            return;
        }

        user.password = newPwd;
        saveUserData(user);
        showToast('Password changed successfully!');
        securityForm.reset();
    });

    // -------------------------------------------------------------
    // Helper Functions
    // -------------------------------------------------------------
    function getFormattedDate(daysOffset = 0) {
        const d = new Date();
        d.setDate(d.getDate() + daysOffset);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // Modern custom Toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.right = '30px';
        toast.style.backgroundColor = 'var(--color-brand-yellow)';
        toast.style.color = 'var(--color-bg-dark)';
        toast.style.padding = '1rem 2rem';
        toast.style.borderRadius = '8px';
        toast.style.fontFamily = 'var(--font-alt)';
        toast.style.fontWeight = '800';
        toast.style.fontSize = '1.1rem';
        toast.style.letterSpacing = '0.5px';
        toast.style.boxShadow = '0 10px 25px rgba(255, 230, 0, 0.4)';
        toast.style.zIndex = '9999';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        toast.textContent = message.toUpperCase();

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    // -------------------------------------------------------------
    // Initial Session Route Check
    // -------------------------------------------------------------
    if (currentSession) {
        // Double check session is valid user
        const userExists = users.some(u => u.whatsapp === currentSession);
        if (userExists) {
            switchView('dashboard');
        } else {
            localStorage.removeItem('gca_session');
            switchView('landing');
        }
    } else {
        switchView('landing');
    }
});
