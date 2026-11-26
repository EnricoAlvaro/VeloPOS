// Dashboard charts + reservation calendar (plain JavaScript, no libraries)
// EDIT THIS: put each item you sell under a category (use lowercase names)
const ITEM_CATEGORIES = {
  'latte': 'Drinks', 'americano': 'Drinks', 'iced coffee': 'Drinks',
  'rice meal': 'Food', 'pasta': 'Food',
  'fries': 'Snacks', 'nachos': 'Snacks'
};

(function () {
  const css = `
  .vw-row{display:flex;flex-wrap:wrap;gap:20px;margin:20px 0}
  .vw-card{background:#fff;color:#334155;border:1px solid #e5e7eb;border-radius:14px;padding:20px;flex:1 1 320px;min-width:0}
  .vw-card h3{margin:0 0 16px;font-size:15px}
  .vw-bars{display:flex;align-items:flex-end;gap:8px;height:180px}
  .vw-col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;font-size:11px;color:#94a3b8}
  .vw-bar{width:70%;max-width:44px;border-radius:6px 6px 2px 2px;background:linear-gradient(#ee9f00,#f07000);margin-bottom:6px}
  .vw-cat{display:grid;grid-template-columns:90px 1fr 80px;gap:10px;align-items:center;margin:10px 0;font-size:12px}
  .vw-track{background:#f1f3f8;border-radius:6px;height:24px}
  .vw-fill{height:100%;min-width:34px;border-radius:6px;color:#fff;font-size:10px;font-weight:700;line-height:24px;padding-left:9px;box-sizing:border-box}
  .vw-name{text-align:right}
  .vw-right{text-align:right;font-weight:700}
  .vw-cal{background:#000;color:#eee;border-color:#2a2a2a}
  .vw-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .vw-head button{background:#0b1a30;color:#4e9bff;border:0;border-radius:8px;padding:6px 12px;cursor:pointer}
  .vw-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:12px}
  .vw-day{padding:9px 0;border-radius:6px;min-height:36px}
  .vw-out{color:#666}
  .vw-confirmed{background:#0e2412}.vw-pending{background:#2a2000}.vw-conflict{background:#2c0d0d}
  .vw-today{outline:1px solid #4e9bff}
  .vw-legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:14px;font-size:12px}
  .vw-legend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px}`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

  const pad = n => String(n).padStart(2, '0');
  const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const peso = n => '₱' + Number(n).toLocaleString('en-PH', { maximumFractionDigits: 2 });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // sales: [{ date:'2026-11-26' or ISO timestamp, category:'Drinks', total:150 }]
  window.renderSalesCharts = function (el, sales) {
    const now = new Date();
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    const days = [...Array(7)].map((_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
    const dayOf = s => String(s.date).length === 10 ? s.date : key(new Date(s.date));
    const week = sales.filter(s => days.some(d => key(d) === dayOf(s)));
    const totals = days.map(d => week.filter(s => dayOf(s) === key(d)).reduce((a, s) => a + Number(s.total), 0));
    const max = Math.max(...totals, 1);

    const cats = {};
    week.forEach(s => { const c = s.category || 'Other'; cats[c] = (cats[c] || 0) + Number(s.total); });
    const sum = Object.values(cats).reduce((a, b) => a + b, 0);
    const colors = ['#eea000,#f07000', '#3466ee,#6866f5', '#34a34a,#48c45a', '#9238ee,#bd85fb', '#68778c,#9aa6b8'];

    el.innerHTML = `<div class="vw-row">
      <div class="vw-card"><h3>Weekly Sales</h3><div class="vw-bars">${days.map((d, i) =>
        `<div class="vw-col" title="${peso(totals[i])}"><div class="vw-bar" style="height:${totals[i] / max * 85}%"></div>${d.toLocaleDateString('en-US', { weekday: 'short' })}</div>`).join('')}</div></div>
      <div class="vw-card"><h3>Sales by Category (this week)</h3>${Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([name, v], i) => {
        const pct = sum ? Math.round(v / sum * 100) : 0;
        return `<div class="vw-cat"><span class="vw-name">${esc(name)}</span><div class="vw-track"><div class="vw-fill" style="width:${pct}%;background:linear-gradient(90deg,${colors[i % 5]})">${pct}%</div></div><span class="vw-right">${peso(v)}</span></div>`;
      }).join('') || '<p>No sales yet.</p>'}</div></div>`;
  };

  // bookings: [{ date:'2026-11-08', payment:'Paid'|'Partial'|'Unpaid', status:'Confirmed'|'Cancelled' }]
  // capacity: how many bookings one date can hold before it shows red
  window.renderCalendar = function (el, bookings, { capacity = 1, month = new Date() } = {}) {
    const y = month.getFullYear(), m = month.getMonth();
    el.bookings = bookings;
    el.month = month;
    const first = new Date(y, m, 1).getDay();
    const cells = Math.ceil((first + new Date(y, m + 1, 0).getDate()) / 7) * 7;
    let grid = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<b>${d}</b>`).join('');

    for (let i = 0; i < cells; i++) {
      const d = new Date(y, m, 1 - first + i);
      const list = bookings.filter(b => b.date === key(d) && b.status !== 'Cancelled');
      let cls = d.getMonth() !== m ? ' vw-out' : '';
      if (list.length > capacity) cls += ' vw-conflict';
      else if (list.some(b => b.payment === 'Unpaid')) cls += ' vw-pending';
      else if (list.length) cls += ' vw-confirmed';
      if (key(d) === key(new Date())) cls += ' vw-today';
      grid += `<div class="vw-day${cls}" title="${list.length} booking(s)">${d.getDate()}</div>`;
    }

    el.innerHTML = `<div class="vw-card vw-cal"><h3>Campground Reservation Calendar</h3>
      <div class="vw-head"><button type="button" data-step="-1">‹ Prev</button>
      <strong>${month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
      <button type="button" data-step="1">Next ›</button></div>
      <div class="vw-grid">${grid}</div>
      <div class="vw-legend"><span><i style="background:#1f5a2b"></i>Confirmed</span>
      <span><i style="background:#6b1f1f"></i>Occupied / conflict</span>
      <span><i style="background:#6b5200"></i>Pending</span></div></div>`;

    el.querySelectorAll('[data-step]').forEach(btn => btn.onclick = () =>
      window.renderCalendar(el, el.bookings || bookings, { capacity, month: new Date(y, m + Number(btn.dataset.step), 1) }));
  };
})();

// ---- Connect to your API ----
(function () {
  const CAPACITY = 1; // bookings per day before a date turns red
  const get = async url => {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(url + ' returned ' + res.status);
    return res.json();
  };

  async function refresh() {
    if (document.getElementById('appPage').classList.contains('hidden')) return;
    try {
      const [sales, bookings] = await Promise.all([get('/api/sales'), get('/api/reservations')]);
      renderSalesCharts(document.getElementById('salesCharts'),
        sales.map(s => ({ date: s.created_at.replace(' ', 'T'), category: ITEM_CATEGORIES[s.item_name.trim().toLowerCase()] || 'Other', total: s.total_amount })));
      const cal = document.getElementById('bookingCalendar');
      renderCalendar(cal,
        bookings.map(b => ({ date: String(b.booking_date).slice(0, 10), payment: b.payment_status, status: b.status })),
        { capacity: CAPACITY, month: cal.month });
    } catch (error) {
      console.error('Widgets could not load:', error);
    }
  }

  // Refresh after sign-in, when changing pages, and when app.js updates the tables
  let timer;
  const later = () => { clearTimeout(timer); timer = setTimeout(refresh, 300); };
  const observer = new MutationObserver(later);
  observer.observe(document.getElementById('appPage'), { attributes: true, attributeFilter: ['class'] });
  ['reservationRows', 'saleRows'].forEach(id => observer.observe(document.getElementById(id), { childList: true }));
  document.querySelectorAll('.nav-button').forEach(b => b.addEventListener('click', later));
  later();
})();
