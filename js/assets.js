/**
 * Asset Module - Handles Asset Details page with enhanced UI
 * Runs on asset_details.html
 */

App.AssetDetails = (function() {
  'use strict';

  // ============================================================
  // PRIVATE STATE
  // ============================================================
  
  const STATE = {
    initialized: false,
    assetData: {
      id: 'TRN-2024-001',
      name: 'Express Train 01',
      type: 'Passenger Express',
      route: 'Mumbai → Ahmedabad',
      driver: 'John Smith',
      status: 'ONLINE',
      speed: '120 km/h',
      location: 'Between Station B & C',
      engineHealth: 98,
      brakeHealth: 95,
      batteryHealth: 82,
      communication: 100,
      lastMaintenance: '15 Days Ago',
      totalDistance: '1,245 km',
      operatingHours: '342 hrs',
      lastUpdate: '10:45 AM',
      nextStation: 'Vadodara',
      eta: '01:45 min'
    }
  };

  // ============================================================
  // INITIALIZATION CHECK
  // ============================================================
  
  const isAssetDetailsPage = function() {
    return window.location.pathname.includes('asset_details.html');
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================
  
  const statusClass = function(status) {
    return status === 'ONLINE' ? 'online' : 'offline';
  };

  const healthColor = function(value) {
    if (value >= 90) return 'green';
    if (value >= 70) return 'blue';
    if (value >= 50) return 'orange';
    return 'red';
  };

  const healthLabel = function(value) {
    if (value >= 90) return 'EXCELLENT';
    if (value >= 70) return 'GOOD';
    if (value >= 50) return 'FAIR';
    return 'POOR';
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  const render = function() {
    const content = document.getElementById('page-content');
    if (!content) return;

    const d = STATE.assetData;

    content.innerHTML = `
      <!-- Asset Header Card -->
      <div class="card">
        <div class="asset-header">
          <div class="asset-header-left">
            <div class="asset-icon">TR</div>
            <div>
              <h3>${d.name}</h3>
              <div class="subtitle">Train ID: ${d.id}</div>
            </div>
          </div>
          <div>
            <span class="asset-status-badge ${statusClass(d.status)}">
              <span class="status-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${d.status === 'ONLINE' ? 'var(--green)' : 'var(--red)'};margin-right:6px;"></span>
              ${d.status}
            </span>
          </div>
        </div>
        <div style="margin-top:16px;display:flex;gap:30px;flex-wrap:wrap;">
          <div><span class="subtle">Route:</span> <strong>${d.route}</strong></div>
          <div><span class="subtle">Driver:</span> <strong>${d.driver}</strong></div>
          <div><span class="subtle">Last Update:</span> <strong>${d.lastUpdate}</strong></div>
        </div>
      </div>

      <br>

      <!-- Main Grid: Asset Info + Current Status -->
      <div class="asset-details-grid">
        <!-- Asset Information -->
        <div class="card">
          <h3>Asset Information</h3>
          <table class="detail-table">
            <tr><td>Train ID</td><td>${d.id}</td></tr>
            <tr><td>Type</td><td>${d.type}</td></tr>
            <tr><td>Route</td><td>${d.route}</td></tr>
            <tr><td>Driver</td><td>${d.driver}</td></tr>
            <tr><td>Last Update</td><td>${d.lastUpdate}</td></tr>
          </table>
        </div>

        <!-- Current Status -->
        <div class="card">
          <h3>Current Status</h3>
          <div class="metric-card">
            <div class="metric-title">Current Speed</div>
            <div class="metric-value">${d.speed}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Current Location</div>
            <div class="metric-value">${d.location}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Engine Health</div>
            <div class="metric-value" style="color:var(--${healthColor(d.engineHealth)})">${d.engineHealth}%</div>
            <div class="health-progress">
              <div class="bar" style="width:${d.engineHealth}%;background:var(--${healthColor(d.engineHealth)})"></div>
            </div>
          </div>
          <div style="display:flex;gap:20px;margin-top:12px;flex-wrap:wrap;">
            <div><span class="subtle">Next Station:</span> <strong>${d.nextStation}</strong></div>
            <div><span class="subtle">ETA:</span> <strong>${d.eta}</strong></div>
          </div>
        </div>
      </div>

      <br>

      <!-- Health Monitoring -->
      <div class="card">
        <h3>Health Monitoring</h3>
        <div class="health-grid">
          <div class="health-item">
            <div class="label">Engine Health</div>
            <div class="value ${healthColor(d.engineHealth)}">${d.engineHealth}%</div>
            <div class="health-progress">
              <div class="bar" style="width:${d.engineHealth}%;background:var(--${healthColor(d.engineHealth)})"></div>
            </div>
            <div style="margin-top:4px;font-size:11px;color:var(--muted)">${healthLabel(d.engineHealth)}</div>
          </div>
          <div class="health-item">
            <div class="label">Brake Health</div>
            <div class="value ${healthColor(d.brakeHealth)}">${d.brakeHealth}%</div>
            <div class="health-progress">
              <div class="bar" style="width:${d.brakeHealth}%;background:var(--${healthColor(d.brakeHealth)})"></div>
            </div>
            <div style="margin-top:4px;font-size:11px;color:var(--muted)">${healthLabel(d.brakeHealth)}</div>
          </div>
          <div class="health-item">
            <div class="label">Battery Health</div>
            <div class="value ${healthColor(d.batteryHealth)}">${d.batteryHealth}%</div>
            <div class="health-progress">
              <div class="bar" style="width:${d.batteryHealth}%;background:var(--${healthColor(d.batteryHealth)})"></div>
            </div>
            <div style="margin-top:4px;font-size:11px;color:var(--muted)">${healthLabel(d.batteryHealth)}</div>
          </div>
          <div class="health-item">
            <div class="label">Communication Status</div>
            <div class="value ${healthColor(d.communication)}">${d.communication}%</div>
            <div class="health-progress">
              <div class="bar" style="width:${d.communication}%;background:var(--${healthColor(d.communication)})"></div>
            </div>
            <div style="margin-top:4px;font-size:11px;color:var(--muted)">${healthLabel(d.communication)}</div>
          </div>
        </div>
      </div>

      <br>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-label">Total Distance Traveled</div>
          <div class="stat-value">${d.totalDistance}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;">This month</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Operating Hours</div>
          <div class="stat-value">${d.operatingHours}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;">This month</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Last Maintenance</div>
          <div class="stat-value">${d.lastMaintenance}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;">Status: Scheduled</div>
        </div>
      </div>
    `;

    // Re-initialize icons
    if (window.lucide) {
      lucide.createIcons();
    }
  };

  // ============================================================
  // UPDATE DATA (for live updates)
  // ============================================================
  
  const updateData = function(newData) {
    STATE.assetData = { ...STATE.assetData, ...newData };
    render();
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================
  
  const init = function() {
    if (!isAssetDetailsPage()) return;
    if (STATE.initialized) return;

    render();
    STATE.initialized = true;

    // Simulate live updates every 5 seconds
    setInterval(function() {
      const d = STATE.assetData;
      // Simulate slight changes
      const speedChange = Math.round((Math.random() - 0.5) * 10);
      const newSpeed = Math.max(80, Math.min(160, parseInt(d.speed) + speedChange));
      
      // Update only if on the page
      if (document.getElementById('page-content')) {
        updateData({
          speed: newSpeed + ' km/h',
          lastUpdate: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
      }
    }, 5000);
  };

  // ============================================================
  // PUBLIC API
  // ============================================================
  
  return {
    init,
    render,
    updateData,
  };

})();