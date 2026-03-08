(function() {
    // --- state ---
    let expenses = [];

    // --- dom ---
    const form = document.getElementById('formModern');
    const dateInp = document.getElementById('dateModern');
    const descInp = document.getElementById('descModern');
    const catInp = document.getElementById('catModern');
    const amountInp = document.getElementById('amountModern');
    const streamDiv = document.getElementById('streamModern');

    const totalSpan = document.getElementById('totalModern');
    const foodSpan = document.getElementById('foodModern');
    const travelSpan = document.getElementById('travelModern');
    const rentSpan = document.getElementById('rentModern');
    const essentialSpan = document.getElementById('essentialModern');
    const clothesSpan = document.getElementById('clothesModern');
    const foodMini = document.getElementById('foodMiniModern');
    const travelMini = document.getElementById('travelMiniModern');
    const rentMini = document.getElementById('rentMiniModern');

    let chart = null;

    // --- storage ---
    function load() {
    const stored = localStorage.getItem('zenith_expenses');
    if (stored) {
        try { expenses = JSON.parse(stored); } catch { expenses = []; }
    } else {
        expenses = [
        { id: Date.now() - 900000, date: '2025-03-08', description: 'whole foods', category: 'Food', amount: 63.20 },
        { id: Date.now() - 600000, date: '2025-03-10', description: 'lyft', category: 'Travel', amount: 24.80 },
        { id: Date.now() - 300000, date: '2025-03-12', description: 'toothpaste & shampoo', category: 'Essential', amount: 19.45 }
        ];
    }
    }
    function save() { localStorage.setItem('zenith_expenses', JSON.stringify(expenses)); }

    // --- render helpers ---
    function escape(s) {
    return String(s).replace(/[&<>"]/g, c => {
        if(c==='&') return '&amp;'; if(c==='<') return '&lt;'; if(c==='>') return '&gt;'; if(c==='"') return '&quot;';
        return c;
    });
    }

    function renderStream() {
    if (!streamDiv) return;
    if (expenses.length === 0) {
        streamDiv.innerHTML = `<div class="empty-message"><i class="fas fa-receipt"></i> no transactions yet</div>`;
        return;
    }
    const sorted = [...expenses].sort((a,b)=> new Date(b.date)-new Date(a.date));
    let html = '';
    sorted.forEach(ex => {
        html += `<div class="expense-row" data-id="${ex.id}">
        <div class="row-detail">
            <span class="date-badge"><i class="far fa-calendar-alt"></i> ${ex.date}</span>
            <span class="desc-text"><i class="fas fa-pencil-alt"></i> ${escape(ex.description)}</span>
            <span class="cat-pill"><i class="fas fa-tag"></i> ${ex.category}</span>
            <span class="amount-text">$${ex.amount.toFixed(2)}</span>
        </div>
        <button class="delete-modern" data-id="${ex.id}"><i class="fas fa-trash-can"></i> delete</button>
        </div>`;
    });
    streamDiv.innerHTML = html;
    document.querySelectorAll('.delete-modern').forEach(btn => {
        btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.getAttribute('data-id'));
        expenses = expenses.filter(e => e.id !== id);
        save();
        refresh();
        });
    });
    }

    function updateTotals() {
    let total = 0;
    const sums = { Food:0, Travel:0, Rent:0, Essential:0, Clothes:0 };
    expenses.forEach(e => {
        let a = Number(e.amount) || 0;
        total += a;
        if (sums.hasOwnProperty(e.category)) sums[e.category] += a;
    });
    totalSpan.textContent = `$${total.toFixed(2)}`;
    foodSpan.textContent = `$${sums.Food.toFixed(2)}`;
    travelSpan.textContent = `$${sums.Travel.toFixed(2)}`;
    rentSpan.textContent = `$${sums.Rent.toFixed(2)}`;
    essentialSpan.textContent = `$${sums.Essential.toFixed(2)}`;
    clothesSpan.textContent = `$${sums.Clothes.toFixed(2)}`;
    if (foodMini) foodMini.textContent = `$${sums.Food.toFixed(2)}`;
    if (travelMini) travelMini.textContent = `$${sums.Travel.toFixed(2)}`;
    if (rentMini) rentMini.textContent = `$${sums.Rent.toFixed(2)}`;
    }

    function updateChart() {
    const ctx = document.getElementById('chartModern')?.getContext('2d');
    if (!ctx) return;
    const cats = ['Food','Travel','Rent','Essential','Clothes'];
    const data = cats.map(c => expenses.filter(e=>e.category===c).reduce((a,ex)=> a+ (Number(ex.amount)||0),0));
    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const gridColor = getComputedStyle(document.body).getPropertyValue('--chart-grid').trim();

    if (chart) {
        chart.data.datasets[0].data = data;
        chart.update();
    } else {
        chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Food', 'Travel', 'Rent', 'Essential', 'Clothes'],
            datasets: [{
            label: 'spent ($)',
            data: data,
            backgroundColor: ['#f97316','#06b6d4','#8b5cf6','#10b981','#ec4899'],
            borderRadius: 8,
            borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
            y: { grid: { color: gridColor }, ticks: { color: textColor } },
            x: { ticks: { color: textColor } }
            }
        }
        });
    }
    }

    function refresh() {
    renderStream();
    updateTotals();
    updateChart();
    }

    // --- add expense ---
    form.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = dateInp.value;
    const desc = descInp.value.trim();
    const cat = catInp.value;
    const amt = parseFloat(amountInp.value);
    if (!date || !desc || !cat || isNaN(amt) || amt <= 0) {
        alert('please fill all fields');
        return;
    }
    expenses.push({ id: Date.now(), date, description: desc, category: cat, amount: amt });
    save();
    refresh();
    form.reset();
    dateInp.value = new Date().toISOString().split('T')[0];
    });

    // --- theme ---
    const btnLight = document.getElementById('btnLightModern');
    const btnDark = document.getElementById('btnDarkModern');
    const body = document.body;

    function setTheme(light) {
    if (light) {
        body.classList.add('light'); body.classList.remove('dark');
        btnLight.classList.add('active-theme'); btnDark.classList.remove('active-theme');
    } else {
        body.classList.add('dark'); body.classList.remove('light');
        btnDark.classList.add('active-theme'); btnLight.classList.remove('active-theme');
    }
    if (chart) { chart.destroy(); chart = null; }
    updateChart();
    }

    btnLight.addEventListener('click', () => setTheme(true));
    btnDark.addEventListener('click', () => setTheme(false));

    // --- init ---
    dateInp.value = new Date().toISOString().split('T')[0];
    load();
    save(); // ensure seed if empty
    refresh();
    window.addEventListener('resize', () => chart && chart.resize());
})();