/**
 * Dashboard Module - Handles KPI, Charts, Gauges, Alerts
 * Only runs on index.html
 */

App.Dashboard = (function() {
  'use strict';

  // ============================================================
  // PRIVATE STATE
  // ============================================================
  
  const STATE = {
    initialized: false,
    charts: {
      donut: null,
      speed: null,
      route: null,
    },
    intervals: [],
    gaugesData: [
      { label: 'Engine Status', value: 92, status: 'Healthy', color: '#22c55e', trackL: '#dcfce7', trackD: '#14532d' },
      { label: 'Brake Status', value: 88, status: 'Healthy', color: '#f59e0b', trackL: '#fef3c7', trackD: '#451a03' },
      { label: 'Power Status', value: 95, status: 'Healthy', color: '#22c55e', trackL: '#dcfce7', trackD: '#14532d' },
      { label: 'Comm. Status', value: 90, status: 'Good', color: '#06b6d4', trackL: '#cffafe', trackD: '#164e63' },
    ],
    speedData: {
      labels: [],
      values: [],
      maxPoints: 14,
    }
  };

  // ============================================================
  // INITIALIZATION CHECK
  // ============================================================
  
  const isDashboardPage = function() {
    return window.location.pathname.includes('index.html') || 
           window.location.pathname === '/' ||
           window.location.pathname === '';
  };

  // ============================================================
  // GAUGES
  // ============================================================
  
  const buildGauges = function() {
    const grid = document.getElementById('gauges-grid');
    if (!grid) return;

    const isDark = App.theme.isDark;
    grid.innerHTML = '';

    STATE.gaugesData.forEach(g => {
      const R = 30;
      const circ = 2 * Math.PI * R;
      const offset = circ - (g.value / 100) * circ;
      const track = isDark ? g.trackD : g.trackL;
      const txtFill = isDark ? '#f1f5f9' : '#0f172a';

      const w = document.createElement('div');
      w.className = 'gw';
      w.innerHTML = `
        <svg width="76" height="76" viewBox="0 0 76 76">
          <circle cx="38" cy="38" r="${R}" fill="none" stroke="${track}" stroke-width="7"/>
          <circle cx="38" cy="38" r="${R}" fill="none" stroke="${g.color}"
            stroke-width="7"
            stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
            stroke-linecap="round" transform="rotate(-90 38 38)"
            style="transition:stroke-dashoffset .9s ease"/>
          <text x="38" y="35" text-anchor="middle" fill="${txtFill}"
            font-size="12" font-weight="800" font-family="Inter,sans-serif">${g.value}%</text>
          <text x="38" y="47" text-anchor="middle" fill="${g.color}"
            font-size="7.5" font-family="Inter,sans-serif">${g.status}</text>
        </svg>
        <p class="gl">${g.label}</p>
      `;
      grid.appendChild(w);
    });
  };

  // ============================================================
  // DONUT CHART
  // ============================================================
  
  const initDonutChart = function() {
    const el = document.getElementById('donut-chart');
    if (!el) return;

    if (STATE.charts.donut) {
      STATE.charts.donut.destroy();
    }

    const ctx = el.getContext('2d');
    STATE.charts.donut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Running', 'Stopped', 'Maintenance'],
        datasets: [{
          data: [10, 1, 1],
          backgroundColor: ['#22c55e', '#ef4444', '#f97316'],
          borderWidth: 0,
          hoverOffset: 5
        }]
      },
      options: {
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            borderColor: '#475569',
            borderWidth: 1,
            titleColor: '#f1f5f9',
            bodyColor: '#e2e8f0',
            titleFont: { size: 11 },
            bodyFont: { size: 10 },
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} trains`
            }
          }
        },
        animation: { animateRotate: true, duration: 1000 }
      }
    });
  };

  // ============================================================
  // SPEED CHART
  // ============================================================
  
  const initSpeedChart = function() {
    const el = document.getElementById('speed-chart');
    if (!el) return;

    if (STATE.charts.speed) {
      STATE.charts.speed.destroy();
    }

    const ctx = el.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, 'rgba(59,130,246,.35)');
    gradient.addColorStop(1, 'rgba(59,130,246,0)');

    // Generate initial data
    const now = new Date();
    STATE.speedData.labels = [];
    STATE.speedData.values = [];
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 5 * 60000);
      STATE.speedData.labels.push(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      STATE.speedData.values.push(Math.round(80 + Math.random() * 70));
    }

    STATE.charts.speed = new Chart(ctx, {
      type: 'line',
      data: {
        labels: STATE.speedData.labels,
        datasets: [{
          label: 'Speed (km/h)',
          data: STATE.speedData.values,
          borderColor: '#3b82f6',
          borderWidth: 2,
          backgroundColor: gradient,
          fill: true,
          tension: .45,
          pointRadius: 1.5,
          pointBackgroundColor: '#3b82f6',
          pointHoverRadius: 4,
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            borderColor: '#475569',
            borderWidth: 1,
            titleColor: '#f1f5f9',
            bodyColor: '#60a5fa',
            callbacks: {
              label: ctx => ` ${ctx.parsed.y} km/h`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8', font: { size: 7 }, maxRotation: 0 },
            grid: { color: 'rgba(148,163,184,.12)' },
            border: { display: false }
          },
          y: {
            ticks: { color: '#94a3b8', font: { size: 7 }, stepSize: 50 },
            grid: { color: 'rgba(148,163,184,.12)' },
            border: { display: false },
            min: 0,
            max: 200
          }
        },
        animation: { duration: 600 },
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  };

  // ============================================================
  // ROUTE CHART
  // ============================================================
  
  const initRouteChart = function() {
    const el = document.getElementById('route-chart');
    if (!el) return;

    if (STATE.charts.route) {
      STATE.charts.route.destroy();
    }

    const ctx = el.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 70);
    gradient.addColorStop(0, 'rgba(6,182,212,.35)');
    gradient.addColorStop(1, 'rgba(6,182,212,0)');

    STATE.charts.route = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mumbai', 'Surat', 'Vadodara', 'Ahmedabad'],
        datasets: [{
          label: 'km',
          data: [0, 214, 356, 498],
          borderColor: '#06b6d4',
          borderWidth: 2,
          backgroundColor: gradient,
          fill: true,
          tension: .4,
          pointRadius: 2.5,
          pointBackgroundColor: '#06b6d4',
          pointHoverRadius: 5,
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            borderColor: '#475569',
            borderWidth: 1,
            titleColor: '#f1f5f9',
            bodyColor: '#06b6d4',
            callbacks: {
              label: ctx => ` ${ctx.parsed.y} km from origin`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8', font: { size: 7 } },
            grid: { color: 'rgba(148,163,184,.12)' },
            border: { display: false }
          },
          y: {
            ticks: { color: '#94a3b8', font: { size: 7 }, stepSize: 150 },
            grid: { color: 'rgba(148,163,184,.12)' },
            border: { display: false },
            min: 0,
            max: 550
          }
        },
        animation: { duration: 600 },
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  };

  // ============================================================
  // ASSET TREE (Hierarchy)
  // ============================================================
  
  const TREE_DATA = {
    id: 'rn',
    label: 'Railway Network',
    children: [{
      id: 'wr',
      label: 'Western Railway',
      children: [{
        id: 'wr101',
        label: 'Train 01 (WR-101)',
        badge: 'Running',
        bClr: '#16a34a',
        bBg: '#dcfce7',
        bBgD: 'rgba(34,197,94,.15)',
        children: [
          { id: 'eng', label: 'Engine', dot: '#22c55e' },
          { id: 'c1', label: 'Coach 1', dot: '#22c55e' },
          { id: 'c2', label: 'Coach 2', dot: '#22c55e' },
          { id: 'bs', label: 'Brake System', dot: '#22c55e' },
        ]
      }, {
        id: 'wr102',
        label: 'Train 02 (WR-102)',
        badge: 'Running',
        bClr: '#16a34a',
        bBg: '#dcfce7',
        bBgD: 'rgba(34,197,94,.15)',
        children: [
          { id: 'eng2', label: 'Engine', dot: '#22c55e' },
          { id: 'c21', label: 'Coach 1', dot: '#22c55e' },
        ]
      }, {
        id: 'wr103',
        label: 'Train 03 (WR-103)',
        badge: 'Stopped',
        bClr: '#dc2626',
        bBg: '#fee2e2',
        bBgD: 'rgba(220,38,38,.15)',
        children: [
          { id: 'eng3', label: 'Engine', dot: '#ef4444' },
          { id: 'c31', label: 'Coach 1', dot: '#22c55e' },
          { id: 'c32', label: 'Coach 2', dot: '#22c55e' },
        ]
      }]
    }]
  };

  const ASSET_DETAILS = {
    wr101: { id: 'WR-101', type: 'Electric', status: 'Running', driver: 'John Smith', location: 'Vadodara', speed: '128 km/h', update: '10:45:30 AM' },
    wr102: { id: 'WR-102', type: 'Electric', status: 'Running', driver: 'Asha Rao', location: 'Anand', speed: '96 km/h', update: '10:44:10 AM' },
    wr103: { id: 'WR-103', type: 'Diesel', status: 'Stopped', driver: 'Vikram Singh', location: 'Surat', speed: '0 km/h', update: '10:31:02 AM' },
    eng: { id: 'WR-101-ENG', type: 'Engine', status: 'Healthy', driver: '-', location: 'Vadodara', speed: '-', update: '10:45:30 AM' },
    c1: { id: 'WR-101-C1', type: 'Coach', status: 'Healthy', driver: '-', location: 'Vadodara', speed: '-', update: '10:45:30 AM' },
    c2: { id: 'WR-101-C2', type: 'Coach', status: 'Healthy', driver: '-', location: 'Vadodara', speed: '-', update: '10:45:30 AM' },
    bs: { id: 'WR-101-BS', type: 'Brake System', status: 'Healthy', driver: '-', location: 'Vadodara', speed: '-', update: '10:45:30 AM' },
  };

  const openNodes = new Set(['rn', 'wr', 'wr101']);
  let selectedAssetId = 'wr101';

  const findNode = function(node, id) {
    if (node.id === id) return node;
    if (!node.children) return null;
    for (const c of node.children) {
      const r = findNode(c, id);
      if (r) return r;
    }
    return null;
  };

  const renderNode = function(node, depth) {
    const has = node.children && node.children.length > 0;
    const open = openNodes.has(node.id);
    const div = document.createElement('div');
    const row = document.createElement('div');
    row.className = depth === 0 ? 't-root' : 't-node';
    row.style.paddingLeft = `${depth * 13}px`;

    if (has) {
      const chev = document.createElement('svg');
      chev.className = `t-chev${open ? ' open' : ''}`;
      chev.setAttribute('viewBox', '0 0 24 24');
      chev.setAttribute('fill', 'none');
      chev.setAttribute('stroke', 'currentColor');
      chev.setAttribute('stroke-width', '2.5');
      chev.setAttribute('stroke-linecap', 'round');
      chev.setAttribute('stroke-linejoin', 'round');
      chev.innerHTML = '<polyline points="9 18 15 12 9 6"/>';
      chev.style.width = '11px';
      chev.style.height = '11px';
      chev.style.color = 'var(--muted)';
      chev.style.flexShrink = '0';
      row.appendChild(chev);
      
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        if (openNodes.has(node.id)) {
          openNodes.delete(node.id);
        } else {
          openNodes.add(node.id);
        }
        buildTree();
      });
    } else if (node.dot) {
      const dot = document.createElement('span');
      dot.className = 't-dot';
      dot.style.background = node.dot;
      dot.style.marginLeft = '2px';
      row.appendChild(dot);
    } else {
      const spacer = document.createElement('span');
      spacer.style.width = '13px';
      spacer.style.display = 'inline-block';
      spacer.style.flexShrink = '0';
      row.appendChild(spacer);
    }

    const lbl = document.createElement('span');
    lbl.className = 't-lbl';
    lbl.textContent = node.label;
    row.appendChild(lbl);

    if (node.badge) {
      const b = document.createElement('span');
      b.className = 't-badge';
      b.textContent = node.badge;
      b.style.color = node.bClr;
      b.style.background = App.theme.isDark ? node.bBgD : node.bBg;
      row.appendChild(b);
    }

    if (ASSET_DETAILS[node.id]) {
      row.style.cursor = 'pointer';
      if (node.id === selectedAssetId) row.style.background = 'var(--nav-hover)';
      row.addEventListener('click', (e) => {
        if (has) return;
        selectedAssetId = node.id;
        buildTree();
        renderAssetDetailsPanel();
      });
    }

    div.appendChild(row);

    if (has && open) {
      const kids = document.createElement('div');
      node.children.forEach(c => kids.appendChild(renderNode(c, depth + 1)));
      div.appendChild(kids);
    }

    return div;
  };

  const buildTree = function() {
    const container = document.getElementById('asset-tree');
    if (!container) return;

    container.innerHTML = '';
    const root = document.createElement('div');
    root.className = 't-root';
    root.style.cursor = 'pointer';
    root.innerHTML = `
      <svg style="width:11px;height:11px;color:var(--muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
      <span class="t-lbl" style="font-weight:600">Railway Network</span>
    `;
    container.appendChild(root);
    TREE_DATA.children.forEach(ch => container.appendChild(renderNode(ch, 1)));
  };

  const renderAssetDetailsPanel = function() {
    const panel = document.getElementById('asset-details-panel');
    if (!panel) return;

    const node = findNode(TREE_DATA, selectedAssetId);
    const d = ASSET_DETAILS[selectedAssetId];

    if (!node || !d) {
      panel.innerHTML = `<div style="padding:40px 0;text-align:center;color:var(--muted)">Select an asset from the hierarchy to view details</div>`;
      return;
    }

    const statusColor = d.status === 'Running' || d.status === 'Healthy' ? 'var(--green)' : 
                       (d.status === 'Stopped' ? 'var(--red)' : 'var(--orange)');

    panel.innerHTML = `
      <div class="det-row"><span class="det-k">Asset ID</span><span class="det-v">${d.id}</span></div>
      <div class="det-row"><span class="det-k">Name</span><span class="det-v">${node.label}</span></div>
      <div class="det-row"><span class="det-k">Type</span><span class="det-v">${d.type}</span></div>
      <div class="det-row"><span class="det-k">Status</span><span class="det-v"><span class="run-dot" style="background:${statusColor}"></span>${d.status}</span></div>
      <div class="det-row"><span class="det-k">Driver</span><span class="det-v">${d.driver}</span></div>
      <div class="det-row"><span class="det-k">Location</span><span class="det-v">${d.location}</span></div>
      <div class="det-row"><span class="det-k">Speed</span><span class="det-v">${d.speed}</span></div>
      <div class="det-row" style="border:none"><span class="det-k">Last Update</span><span class="det-v">${d.update}</span></div>
    `;
  };

  // ============================================================
  // SPEED SIMULATION
  // ============================================================
  
  let simulationInterval = null;

  const startSpeedSimulation = function() {
    if (simulationInterval) clearInterval(simulationInterval);

    simulationInterval = setInterval(() => {
      const chart = STATE.charts.speed;
      if (!chart) return;

      const data = chart.data.datasets[0].data;
      const prev = data[data.length - 1] || 100;
      const next = Math.min(160, Math.max(80, Math.round(prev + (Math.random() - .47) * 10)));
      
      data.push(next);
      
      const now = new Date();
      chart.data.labels.push(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      
      if (data.length > 14) {
        data.shift();
        chart.data.labels.shift();
      }
      
      chart.update('none');

      // Update live speed display
      const liveSpeed = document.getElementById('live-speed');
      if (liveSpeed) liveSpeed.textContent = next;
    }, 2000);
  };

  // ============================================================
  // THEME RESPONSE
  // ============================================================
  
  const onThemeChange = function(event) {
    const isDark = event.detail.isDark;
    
    // Update gauges
    buildGauges();
    
    // Update chart colors
    const tc = isDark ? '#64748b' : '#94a3b8';
    const gc = isDark ? 'rgba(71,85,105,.18)' : 'rgba(148,163,184,.12)';
    
    Object.values(STATE.charts).forEach(ch => {
      if (!ch) return;
      if (ch.options && ch.options.scales) {
        if (ch.options.scales.x) {
          ch.options.scales.x.ticks.color = tc;
          ch.options.scales.x.grid.color = gc;
        }
        if (ch.options.scales.y) {
          ch.options.scales.y.ticks.color = tc;
          ch.options.scales.y.grid.color = gc;
        }
        ch.update('none');
      }
    });

    // Rebuild tree with new theme
    buildTree();
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================
  
  const init = function() {
    // Only run on dashboard page
    if (!isDashboardPage()) return;
    if (STATE.initialized) return;

    // Check if we have dashboard content
    const content = document.getElementById('page-content');
    if (!content) return;

    // Build dashboard HTML if not already present
    if (content.children.length === 0) {
      content.innerHTML = getDashboardHTML();
    }

    // Initialize components
    buildGauges();
    initDonutChart();
    initSpeedChart();
    initRouteChart();
    buildTree();
    renderAssetDetailsPanel();
    startSpeedSimulation();

    // Listen for theme changes
    document.addEventListener('themeChange', onThemeChange);

    STATE.initialized = true;
  };

  // ============================================================
  // DASHBOARD HTML TEMPLATE
  // ============================================================
  
  const getDashboardHTML = function() {
    return `
      <!-- KPI Row -->
      <div class="kpi-row">
        <div class="kpi">
          <div class="kpi-ico" style="background:#eff6ff">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="13" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <circle cx="7.5" cy="18.5" r=".5" fill="#2563eb"/><circle cx="16.5" cy="18.5" r=".5" fill="#2563eb"/>
              <line x1="8" y1="7" x2="8" y2="14"/><line x1="16" y1="7" x2="16" y2="14"/><line x1="8" y1="14" x2="16" y2="14"/>
            </svg>
          </div>
          <div><div class="kpi-lbl">Total Trains</div><div class="kpi-val">12</div><div class="kpi-sub">All Trains</div></div>
        </div>
        <div class="kpi">
          <div class="kpi-ico" style="background:#f0fdf4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="#16a34a"/>
            </svg>
          </div>
          <div><div class="kpi-lbl">Online Trains</div><div class="kpi-val" style="color:#16a34a">10</div><div class="kpi-sub" style="color:#16a34a;font-weight:600">Running</div></div>
        </div>
        <div class="kpi">
          <div class="kpi-ico" style="background:#fef2f2">
            <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
          </div>
          <div><div class="kpi-lbl">Offline Trains</div><div class="kpi-val" style="color:#dc2626">2</div><div class="kpi-sub">Not Connected</div></div>
        </div>
        <div class="kpi">
          <div class="kpi-ico" style="background:#f5f3ff">
            <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
              <path d="M15 2v2M9 2v2M2 15h2M2 9h2M22 15h-2M22 9h-2M15 22v-2M9 22v-2"/>
            </svg>
          </div>
          <div><div class="kpi-lbl">Total Devices</div><div class="kpi-val">456</div><div class="kpi-sub">Connected</div></div>
        </div>
        <div class="kpi">
          <div class="kpi-ico" style="background:#fff7ed">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m10.29 3.86-8.17 14.17A1 1 0 0 0 3 19.5h18a1 1 0 0 0 .87-1.5L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div><div class="kpi-lbl">Active Alerts</div><div class="kpi-val" style="color:#ea580c">8</div><div class="kpi-sub">Requires Attention</div></div>
        </div>
        <div class="kpi">
          <div class="kpi-ico" style="background:#f0fdfa">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div><div class="kpi-lbl">Total Distance</div><div class="kpi-val">1,256<span class="u"> km</span></div><div class="kpi-sub">Today</div></div>
        </div>
      </div>

      <!-- Row 2 -->
      <div class="row2">
        <div class="panel"><div class="ph"><span class="pt">System Health</span></div><div class="pb"><div class="gauges-grid" id="gauges-grid"></div></div></div>
        <div class="panel"><div class="ph"><span class="pt">Train Status</span></div><div class="pb"><div class="donut-wrap"><canvas id="donut-chart"></canvas><div class="donut-ctr"><div class="big">12</div><div class="sm">Total</div></div></div><div class="leg"><div class="leg-row"><span style="display:flex;align-items:center"><span class="leg-dot" style="background:#22c55e"></span><span class="leg-n">Running</span></span><span class="leg-v">10 (83%)</span></div><div class="leg-row"><span style="display:flex;align-items:center"><span class="leg-dot" style="background:#ef4444"></span><span class="leg-n">Stopped</span></span><span class="leg-v">1 (8%)</span></div><div class="leg-row"><span style="display:flex;align-items:center"><span class="leg-dot" style="background:#f97316"></span><span class="leg-n">Maintenance</span></span><span class="leg-v">1 (8%)</span></div></div></div></div>
        <div class="panel"><div class="ph"><span class="pt">Route Visualization – Train 01</span><button class="bl">View Full Route <i data-lucide="external-link"></i></button></div><div class="pb"><div class="stop-row"><div class="stop-w"><div class="stop-nd"><div class="stop-d done"></div><div class="stop-nm done">Mumbai</div></div><div class="stop-ln done"></div></div><div class="stop-w"><div class="stop-nd"><div class="stop-d active"></div><div class="stop-nm active">Surat ›</div></div><div class="stop-ln"></div></div><div class="stop-w"><div class="stop-nd"><div class="stop-d"></div><div class="stop-nm">Vadodara</div></div><div class="stop-ln"></div></div><div class="stop-w" style="flex:0"><div class="stop-nd"><div class="stop-d"></div><div class="stop-nm">Ahmedabad</div></div></div></div><div class="rpb"><div class="rpb-fill"></div></div><div class="rs-grid"><div class="rs"><div class="rs-l">Distance Covered</div><div class="rs-v" style="color:var(--accent)">356<span class="u"> km</span></div></div><div class="rs"><div class="rs-l">Remaining</div><div class="rs-v">142<span class="u"> km</span></div></div><div class="rs"><div class="rs-l">ETA</div><div class="rs-v teal">01:45<span class="u"> min</span></div></div></div><div class="chart-wrap"><canvas id="route-chart"></canvas></div></div></div>
        <div class="panel"><div class="ph"><span class="pt">Alerts</span><button class="bl">View All</button></div><div class="pb"><div class="al-list"><div class="al-item" style="border-left-color:#f97316"><div class="al-meta"><span class="al-t">10:42</span><span class="al-tr" style="background:#fff7ed;color:#ea580c">Train 07</span></div><div class="al-msg">Brake Pressure Low</div></div><div class="al-item" style="border-left-color:#dc2626"><div class="al-meta"><span class="al-t">10:31</span><span class="al-tr" style="background:#fef2f2;color:#dc2626">Train 03</span></div><div class="al-msg">High Engine Temp</div></div><div class="al-item" style="border-left-color:#f97316"><div class="al-meta"><span class="al-t">10:15</span><span class="al-tr" style="background:#fff7ed;color:#ea580c">Train 02</span></div><div class="al-msg">GPS Signal Lost</div></div><div class="al-item" style="border-left-color:#3b82f6"><div class="al-meta"><span class="al-t">09:58</span><span class="al-tr" style="background:#eff6ff;color:#2563eb">Train 08</span></div><div class="al-msg">Door Sensor Fault</div></div><div class="al-item" style="border-left-color:#dc2626"><div class="al-meta"><span class="al-t">09:40</span><span class="al-tr" style="background:#fef2f2;color:#dc2626">Train 03</span></div><div class="al-msg">Brake Pressure Low</div></div></div></div></div>
        <div class="panel map-panel"><div class="map-head"><div style="display:flex;align-items:center;gap:8px"><span class="pt">Live Train Tracking</span><div class="live-badge"><span class="live-dot"></span><span style="font-size:10px;color:#16a34a;font-weight:600">Live</span></div></div><div style="display:flex;align-items:center;gap:6px"><select class="map-sel" id="train-filter"><option value="all">All Trains</option><option value="t1">Train 01</option><option value="t2">Train 02</option><option value="t3">Train 03</option><option value="t4">Train 04</option><option value="t5">Train 05</option></select><button class="ib"><i data-lucide="filter"></i></button><button class="ib" onclick="App.Map.resetView()"><i data-lucide="maximize-2"></i></button></div></div><div id="leaflet-map" style="flex:1;min-height:0"></div><div class="t05-strip"><div class="t05-top"><div style="display:flex;align-items:center;gap:7px"><div class="t05-train-ico">🚆</div><div><div style="font-size:11px;font-weight:700;color:var(--text)">Train 05 <span style="font-size:9px;padding:1px 6px;border-radius:3px;background:#dcfce7;color:#16a34a;font-weight:700;margin-left:4px">Running</span></div><div class="t05-s-l">Route: Surat – Ahmedabad · Last Update: 1 min ago <button style="color:var(--accent);font-size:9px">↻</button></div></div></div><div class="t05-stats"><div><div class="t05-stat-l">Status</div><div class="t05-stat-v" style="color:#16a34a">Running</div></div><div><div class="t05-stat-l">Speed</div><div class="t05-stat-v">110 km/h</div></div><div><div class="t05-stat-l">Next Station</div><div class="t05-stat-v">Vadodara</div></div><div><div class="t05-stat-l">ETA</div><div class="t05-stat-v">10:45 AM</div></div></div></div><div class="t05-sch"><div><div class="t05-s-l">Start: Surat</div><div class="t05-s-v">06:30 AM</div></div><div><div class="t05-s-l">Via: Vadodara</div><div class="t05-s-v">08:20 AM</div></div><div><div class="t05-s-l">Bharuch</div><div class="t05-s-v">09:10 AM</div></div><div><div class="t05-s-l">Anand</div><div class="t05-s-v">09:50 AM</div></div><div><div class="t05-s-l">Dest: Ahmedabad</div><div class="t05-s-v" style="color:var(--text);font-weight:700">11:15 AM</div></div></div><div class="t05-bottom"><div><div class="t05-stat-l">Train No.</div><div class="t05-stat-v">12005</div></div><div><div class="t05-stat-l">Coach</div><div class="t05-stat-v">B2, B3, B4, B5</div></div><div><div class="t05-stat-l">Driver</div><div class="t05-stat-v">Rajesh Kumar</div></div><div><div class="t05-stat-l">Last Update</div><div class="t05-stat-v">30 sec ago</div></div></div></div></div>
      </div>

      <!-- Row 3 -->
      <div class="row3">
        <div class="panel"><div class="ph"><span class="pt">Live Telemetry – Train 01</span><button class="bl">View Details <i data-lucide="external-link"></i></button></div><div class="pb"><div class="m-grid"><div class="mpill"><div class="ml">Speed</div><div class="mv" id="live-speed">128</div><div class="mu">km/h</div></div><div class="mpill"><div class="ml">Voltage</div><div class="mv">25.4</div><div class="mu">kV</div></div><div class="mpill"><div class="ml">Current</div><div class="mv">132</div><div class="mu">A</div></div><div class="mpill warn"><div class="mwl">Brake Pressure</div><div class="mv wv">5.6</div><div class="mu">bar</div></div></div><div class="chart-wrap"><canvas id="speed-chart"></canvas></div></div></div>
        <div class="panel"><div class="ph"><span class="pt">Asset Hierarchy</span><button class="bl" onclick="App.navigate('asset_hierarchy')">View Full <i data-lucide="external-link"></i></button></div><div class="pb"><div class="tree" id="asset-tree"></div></div></div>
        <div class="panel"><div class="ph"><span class="pt">Asset Details – Train 01</span></div><div class="pb" style="padding:0;"><div class="asset-details-container"><div class="asset-details-text" id="asset-details-panel"></div></div></div></div>
      </div>
    `;
  };

  // ============================================================
  // PUBLIC API
  // ============================================================
  
  return {
    init,
    buildGauges,
    buildTree,
    renderAssetDetailsPanel,
    startSpeedSimulation,
  };

})();