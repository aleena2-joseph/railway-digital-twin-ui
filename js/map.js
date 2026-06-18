/**
 * Map Module - Handles Leaflet map with train tracking
 * Only runs on index.html
 */

App.Map = (function() {
  'use strict';

  // ============================================================
  // PRIVATE STATE
  // ============================================================
  
  const STATE = {
    initialized: false,
    map: null,
    markers: {},
    trains: [
      { id: 't1', name: 'Train 01', lat: 21.95, lng: 73.09, speed: 128, color: '#f59e0b', status: 'Running', route: 'Mumbai→Ahmedabad', next: 'Vadodara' },
      { id: 't2', name: 'Train 02', lat: 22.44, lng: 71.80, speed: 96, color: '#60a5fa', status: 'Running', route: 'Rajkot→Ahmedabad', next: 'Ahmedabad' },
      { id: 't3', name: 'Train 03', lat: 21.50, lng: 73.05, speed: 0, color: '#ef4444', status: 'Stopped', route: 'Mumbai→Surat', next: 'Surat' },
      { id: 't4', name: 'Train 04', lat: 22.75, lng: 72.85, speed: 78, color: '#f59e0b', status: 'Running', route: 'Vadodara→Ahmedabad', next: 'Ahmedabad' },
      { id: 't5', name: 'Train 05', lat: 22.19, lng: 72.63, speed: 110, color: '#22c55e', status: 'Running', route: 'Surat→Ahmedabad', next: 'Vadodara' },
    ],
    routes: [
      { color: '#f59e0b', weight: 3, points: [[19.076,72.877],[20.599,72.934],[20.946,72.952],[21.170,72.831],[21.627,73.001],[21.705,72.996],[22.307,73.181],[22.557,72.954],[23.022,72.571]] },
      { color: '#60a5fa', weight: 3, points: [[22.303,70.802],[22.680,71.350],[22.900,71.880],[23.022,72.571]] },
      { color: '#a78bfa', weight: 2.5, points: [[21.764,72.152],[22.100,72.550],[22.307,73.181]] },
      { color: '#34d399', weight: 2.5, points: [[21.519,70.457],[21.900,70.620],[22.303,70.802]] },
      { color: '#fb923c', weight: 2.5, dashed: true, points: [[23.083,70.133],[23.040,70.500],[23.022,72.571]] },
    ],
    cities: {
      Mumbai: [19.076, 72.877],
      Valsad: [20.599, 72.934],
      Navsari: [20.946, 72.952],
      Surat: [21.170, 72.831],
      Bharuch: [21.705, 72.996],
      Ankleshwar: [21.627, 73.001],
      Vadodara: [22.307, 73.181],
      Anand: [22.557, 72.954],
      Ahmedabad: [23.022, 72.571],
      Rajkot: [22.303, 70.802],
      Bhavnagar: [21.764, 72.152],
      Junagadh: [21.519, 70.457],
      Gandhidham: [23.083, 70.133],
      Saurashtra: [22.200, 71.000],
    },
    simulationInterval: null,
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
  // MAP INITIALIZATION
  // ============================================================
  
  const init = function() {
    if (!isDashboardPage()) return;
    if (STATE.initialized) return;

    const container = document.getElementById('leaflet-map');
    if (!container) return;

    // Check if map is visible
    if (container.offsetParent === null) return;

    // Create map
    STATE.map = L.map('leaflet-map', {
      center: [22.0, 72.5],
      zoom: 7,
      zoomControl: false,
      attributionControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(STATE.map);

    // Add zoom control
    L.control.zoom({ position: 'topright' }).addTo(STATE.map);

    // Draw routes
    STATE.routes.forEach(r => {
      const opts = { color: r.color, weight: r.weight || 2.5, opacity: .85, lineJoin: 'round' };
      if (r.dashed) opts.dashArray = '8,5';
      L.polyline(r.points, opts).addTo(STATE.map);
    });

    // Add city labels
    Object.entries(STATE.cities).forEach(([name, coords]) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:8px;height:8px;border-radius:50%;background:#64748b;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);"></div>`,
        iconAnchor: [4, 4],
      });
      const marker = L.marker(coords, { icon, interactive: false }).addTo(STATE.map);
      marker.bindTooltip(name, {
        permanent: true,
        direction: 'right',
        offset: [6, 0],
        className: 'leaflet-city-label',
        opacity: .85,
      });
    });

    // Add train markers
    STATE.trains.forEach(train => {
      const icon = createTrainIcon(train);
      const m = L.marker([train.lat, train.lng], { icon, zIndexOffset: 100 })
        .addTo(STATE.map)
        .on('click', (e) => {
          showTooltip(e.originalEvent, train);
        });
      STATE.markers[train.id] = m;
    });

    // Setup filter
    const filter = document.getElementById('train-filter');
    if (filter) {
      filter.addEventListener('change', (e) => filterTrains(e.target.value));
    }

    // Start simulation
    startSimulation();

    STATE.initialized = true;

    // Handle resize
    setTimeout(() => {
      if (STATE.map) STATE.map.invalidateSize();
    }, 500);
  };

  // ============================================================
  // TRAIN ICON
  // ============================================================
  
  const createTrainIcon = function(train) {
    const stopped = train.status === 'Stopped';
    return L.divIcon({
      className: '',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <div style="width:16px;height:16px;border-radius:50%;background:${train.color};border:2.5px solid #fff;box-shadow:0 0 8px ${train.color}88,0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:8px;">
            ${stopped ? '✖' : '▶'}
          </div>
          <div style="background:rgba(15,23,42,.85);backdrop-filter:blur(4px);color:${train.color};font-size:8.5px;font-weight:700;padding:2px 5px;border-radius:4px;white-space:nowrap;border:1px solid ${train.color}55;line-height:1.3;font-family:Inter,sans-serif;">
            ${train.name}<br>
            <span style="color:${stopped ? '#ef4444' : '#94a3b8'};font-weight:400">${stopped ? 'Stopped' : train.speed + ' km/h'}</span>
          </div>
        </div>
      `,
      iconSize: [80, 44],
      iconAnchor: [8, 8],
      popupAnchor: [0, -12],
    });
  };

  // ============================================================
  // TOOLTIP
  // ============================================================
  
  const showTooltip = function(ev, train) {
    const tt = document.getElementById('train-tt');
    if (!tt) return;

    const title = document.getElementById('tt-title');
    const speed = document.getElementById('tt-speed');
    const status = document.getElementById('tt-status');
    const route = document.getElementById('tt-route');
    const next = document.getElementById('tt-next');
    const update = document.getElementById('tt-upd');

    if (title) { title.textContent = train.name; title.style.color = train.color; }
    if (speed) speed.textContent = train.speed > 0 ? train.speed + ' km/h' : 'Stopped';
    if (status) { status.textContent = train.status; status.style.color = train.status === 'Stopped' ? '#ef4444' : '#16a34a'; }
    if (route) route.textContent = train.route;
    if (next) next.textContent = train.next;
    if (update) update.textContent = 'Last updated: just now';

    tt.style.left = Math.min(ev.clientX + 14, window.innerWidth - 200) + 'px';
    tt.style.top = Math.max(ev.clientY - 32, 8) + 'px';
    tt.style.display = 'block';
  };

  // Hide tooltip on click anywhere
  document.addEventListener('click', () => {
    const tt = document.getElementById('train-tt');
    if (tt) tt.style.display = 'none';
  });

  // ============================================================
  // FILTER
  // ============================================================
  
  const filterTrains = function(val) {
    STATE.trains.forEach(t => {
      const m = STATE.markers[t.id];
      if (!m || !STATE.map) return;
      if (val === 'all' || t.id === val) {
        m.addTo(STATE.map);
      } else {
        m.remove();
      }
    });
  };

  // ============================================================
  // SIMULATION
  // ============================================================
  
  const startSimulation = function() {
    if (STATE.simulationInterval) clearInterval(STATE.simulationInterval);
    
    STATE.simulationInterval = setInterval(() => {
      if (!STATE.map) return;

      STATE.trains.filter(t => t.status === 'Running').forEach(t => {
        t.lat += (Math.random() - .5) * 0.001;
        t.lng += (Math.random() - .5) * 0.001;
        if (STATE.markers[t.id]) {
          STATE.markers[t.id].setLatLng([t.lat, t.lng]);
        }
      });
    }, 2000);
  };

  // ============================================================
  // RESET VIEW
  // ============================================================
  
  const resetView = function() {
    if (STATE.map) {
      STATE.map.setView([22.0, 72.5], 7);
    }
  };

  // ============================================================
  // PUBLIC API
  // ============================================================
  
  return {
    init,
    filterTrains,
    resetView,
  };

})();