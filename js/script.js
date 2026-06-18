/* ─────────────────────────────────────────────
   INIT ICONS
───────────────────────────────────────────── */
lucide.createIcons();

/* ─────────────────────────────────────────────
   CLOCK
───────────────────────────────────────────── */
function updateClock(){
  const n=new Date();
  const dateEl=document.getElementById('clock-date');
  const timeEl=document.getElementById('clock-time');
  if(dateEl) dateEl.textContent=n.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
  if(timeEl) timeEl.textContent=n.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
}
updateClock(); setInterval(updateClock,1000);

/* ─────────────────────────────────────────────
   THEME TOGGLE (persisted across pages via localStorage)
───────────────────────────────────────────── */
let isDark = localStorage.getItem('rdt-theme') === 'dark';

function applyTheme(){
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  const icon = document.getElementById('theme-icon');
  if(icon){
    icon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
    lucide.createIcons();
  }
}

function toggleTheme(){
  isDark = !isDark;
  localStorage.setItem('rdt-theme', isDark ? 'dark' : 'light');
  applyTheme();
  if(typeof buildGauges === 'function') buildGauges();
  if(typeof updateChartTheme === 'function') updateChartTheme();
  if(typeof rebuildTree === 'function') rebuildTree();
  // Leaflet dark tile swap is handled by CSS filter (see [data-theme="dark"] #leaflet-map)
}

// Apply saved theme immediately on every page load
applyTheme();

/* ─────────────────────────────────────────────
   NAVIGATION (sidebar links across pages)
───────────────────────────────────────────── */
function openAssetHierarchy(){
  window.location.href = 'asset_hierarchy.html';
}
function openOverview(){
  window.location.href = 'index.html';
}

/* ─────────────────────────────────────────────
   LOGOUT
───────────────────────────────────────────── */
function doLogout(){
  if(confirm('Are you sure you want to logout?')){
    window.location.href='Login.html';
  }
}

/* ─────────────────────────────────────────────
   SYSTEM HEALTH GAUGES (SVG circular)
   Only runs if #gauges-grid exists on the page
───────────────────────────────────────────── */
const gaugesData=[
  {label:'Engine Status', value:92, status:'Healthy', color:'#22c55e', trackL:'#dcfce7', trackD:'#14532d'},
  {label:'Brake Status',  value:88, status:'Healthy', color:'#f59e0b', trackL:'#fef3c7', trackD:'#451a03'},
  {label:'Power Status',  value:95, status:'Healthy', color:'#22c55e', trackL:'#dcfce7', trackD:'#14532d'},
  {label:'Comm. Status',  value:90, status:'Good',    color:'#06b6d4', trackL:'#cffafe', trackD:'#164e63'},
];
function buildGauges(){
  const grid=document.getElementById('gauges-grid');
  if(!grid) return;
  grid.innerHTML='';
  gaugesData.forEach(g=>{
    const R=30,circ=2*Math.PI*R;
    const offset=circ-(g.value/100)*circ;
    const track=isDark?g.trackD:g.trackL;
    const txtFill=isDark?'#f1f5f9':'#0f172a';
    const w=document.createElement('div');
    w.className='gw';
    w.innerHTML=`
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
      <p class="gl">${g.label}</p>`;
    grid.appendChild(w);
  });
}
buildGauges();

/* ─────────────────────────────────────────────
   DONUT CHART — Train Status
   Only runs if #donut-chart exists on the page
───────────────────────────────────────────── */
let donutChart=null;
const donutEl=document.getElementById('donut-chart');
if(donutEl){
  const donutCtx=donutEl.getContext('2d');
  donutChart=new Chart(donutCtx,{
    type:'doughnut',
    data:{
      labels:['Running','Stopped','Maintenance'],
      datasets:[{data:[10,1,1],backgroundColor:['#22c55e','#ef4444','#f97316'],borderWidth:0,hoverOffset:5}]
    },
    options:{
      cutout:'70%',
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'#1e293b',borderColor:'#475569',borderWidth:1,
          titleColor:'#f1f5f9',bodyColor:'#e2e8f0',
          titleFont:{size:11},bodyFont:{size:10},
          callbacks:{label:ctx=>` ${ctx.label}: ${ctx.parsed} trains`}
        }
      },
      animation:{animateRotate:true,duration:1000},
    }
  });
}

/* ─────────────────────────────────────────────
   SPEED CHART — Live Telemetry
   Only runs if #speed-chart exists on the page
───────────────────────────────────────────── */
let speedChart=null;
const speedEl=document.getElementById('speed-chart');
if(speedEl){
  const sCtx=speedEl.getContext('2d');
  const sGrad=sCtx.createLinearGradient(0,0,0,100);
  sGrad.addColorStop(0,'rgba(59,130,246,.35)');
  sGrad.addColorStop(1,'rgba(59,130,246,0)');
  const speedLabels=['09:41','09:46','09:51','09:56','10:01','10:06','10:11','10:16','10:21','10:26','10:31','10:36','10:41'];
  const speedVals=[88,102,115,120,118,125,130,128,122,132,128,135,128];
  speedChart=new Chart(sCtx,{
    type:'line',
    data:{
      labels:speedLabels,
      datasets:[{
        label:'Speed (km/h)',data:speedVals,
        borderColor:'#3b82f6',borderWidth:2,backgroundColor:sGrad,
        fill:true,tension:.45,pointRadius:1.5,pointBackgroundColor:'#3b82f6',pointHoverRadius:4,
      }]
    },
    options:{
      plugins:{legend:{display:false},tooltip:{backgroundColor:'#1e293b',borderColor:'#475569',borderWidth:1,titleColor:'#f1f5f9',bodyColor:'#60a5fa',callbacks:{label:ctx=>` ${ctx.parsed.y} km/h`}}},
      scales:{
        x:{ticks:{color:'#94a3b8',font:{size:7},maxRotation:0},grid:{color:'rgba(148,163,184,.12)'},border:{display:false}},
        y:{ticks:{color:'#94a3b8',font:{size:7},stepSize:50},grid:{color:'rgba(148,163,184,.12)'},border:{display:false},min:0,max:200}
      },
      animation:{duration:600},responsive:true,maintainAspectRatio:false,
    }
  });
}

/* ─────────────────────────────────────────────
   ROUTE CHART
   Only runs if #route-chart exists on the page
───────────────────────────────────────────── */
let routeChart=null;
const routeEl=document.getElementById('route-chart');
if(routeEl){
  const rCtx=routeEl.getContext('2d');
  const rGrad=rCtx.createLinearGradient(0,0,0,70);
  rGrad.addColorStop(0,'rgba(6,182,212,.35)');
  rGrad.addColorStop(1,'rgba(6,182,212,0)');
  routeChart=new Chart(rCtx,{
    type:'line',
    data:{
      labels:['Mumbai','Surat','Vadodara','Ahmedabad'],
      datasets:[{label:'km',data:[0,214,356,498],borderColor:'#06b6d4',borderWidth:2,backgroundColor:rGrad,fill:true,tension:.4,pointRadius:2.5,pointBackgroundColor:'#06b6d4',pointHoverRadius:5}]
    },
    options:{
      plugins:{legend:{display:false},tooltip:{backgroundColor:'#1e293b',borderColor:'#475569',borderWidth:1,titleColor:'#f1f5f9',bodyColor:'#06b6d4',callbacks:{label:ctx=>` ${ctx.parsed.y} km from origin`}}},
      scales:{
        x:{ticks:{color:'#94a3b8',font:{size:7}},grid:{color:'rgba(148,163,184,.12)'},border:{display:false}},
        y:{ticks:{color:'#94a3b8',font:{size:7},stepSize:150},grid:{color:'rgba(148,163,184,.12)'},border:{display:false},min:0,max:550}
      },
      animation:{duration:600},responsive:true,maintainAspectRatio:false,
    }
  });
}

function updateChartTheme(){
  const tc=isDark?'#64748b':'#94a3b8';
  const gc=isDark?'rgba(71,85,105,.18)':'rgba(148,163,184,.12)';
  [speedChart,routeChart].forEach(ch=>{
    if(!ch) return;
    ch.options.scales.x.ticks.color=tc;
    ch.options.scales.y.ticks.color=tc;
    ch.options.scales.x.grid.color=gc;
    ch.options.scales.y.grid.color=gc;
    ch.update('none');
  });
}

/* ─────────────────────────────────────────────
   REAL LEAFLET MAP — Western India railway network
   Only runs if #leaflet-map exists on the page
───────────────────────────────────────────── */

const CITIES={
  Mumbai:   [19.076, 72.877],
  Valsad:   [20.599, 72.934],
  Navsari:  [20.946, 72.952],
  Surat:    [21.170, 72.831],
  Bharuch:  [21.705, 72.996],
  Ankleshwar:[21.627, 73.001],
  Vadodara: [22.307, 73.181],
  Anand:    [22.557, 72.954],
  Ahmedabad:[23.022, 72.571],
  Rajkot:   [22.303, 70.802],
  Bhavnagar:[21.764, 72.152],
  Junagadh: [21.519, 70.457],
  Gandhidham:[23.083,70.133],
  Saurashtra:[22.200,71.000],
};

const TRAINS=[
  {id:'t1',name:'Train 01',lat:21.95, lng:73.09, speed:128, color:'#f59e0b',status:'Running',route:'Mumbai→Ahmedabad',next:'Vadodara'},
  {id:'t2',name:'Train 02',lat:22.44, lng:71.80, speed:96,  color:'#60a5fa',status:'Running',route:'Rajkot→Ahmedabad',next:'Ahmedabad'},
  {id:'t3',name:'Train 03',lat:21.50, lng:73.05, speed:0,   color:'#ef4444',status:'Stopped', route:'Mumbai→Surat',   next:'Surat'},
  {id:'t4',name:'Train 04',lat:22.75, lng:72.85, speed:78,  color:'#f59e0b',status:'Running',route:'Vadodara→Ahmedabad',next:'Ahmedabad'},
  {id:'t5',name:'Train 05',lat:22.19, lng:72.63, speed:110, color:'#22c55e',status:'Running',route:'Surat→Ahmedabad', next:'Vadodara'},
];

const ROUTES=[
  {color:'#f59e0b',weight:3, points:[
    [19.076,72.877],[20.599,72.934],[20.946,72.952],[21.170,72.831],
    [21.627,73.001],[21.705,72.996],[22.307,73.181],[22.557,72.954],[23.022,72.571]
  ]},
  {color:'#60a5fa',weight:3, points:[
    [22.303,70.802],[22.680,71.350],[22.900,71.880],[23.022,72.571]
  ]},
  {color:'#a78bfa',weight:2.5,points:[
    [21.764,72.152],[22.100,72.550],[22.307,73.181]
  ]},
  {color:'#34d399',weight:2.5,points:[
    [21.519,70.457],[21.900,70.620],[22.303,70.802]
  ]},
  {color:'#fb923c',weight:2.5,dashed:true,points:[
    [23.083,70.133],[23.040,70.500],[23.022,72.571]
  ]},
];

let mapInstance=null;
const markerLayers={};

function initLeafletMap(){
  if(!document.getElementById('leaflet-map')) return;
  mapInstance=L.map('leaflet-map',{
    center:[22.0,72.5],zoom:7,
    zoomControl:false,
    attributionControl:true,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
    attribution:'© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, © <a href="https://carto.com/">CARTO</a>',
    subdomains:'abcd',maxZoom:19,
  }).addTo(mapInstance);

  L.control.zoom({position:'topright'}).addTo(mapInstance);

  ROUTES.forEach(r=>{
    const opts={color:r.color,weight:r.weight||2.5,opacity:.85,lineJoin:'round'};
    if(r.dashed) opts.dashArray='8,5';
    L.polyline(r.points,opts).addTo(mapInstance);
  });

  Object.entries(CITIES).forEach(([name,coords])=>{
    const icon=L.divIcon({
      className:'',
      html:`<div style="
        width:8px;height:8px;border-radius:50%;
        background:#64748b;border:2px solid #fff;
        box-shadow:0 1px 4px rgba(0,0,0,.3);">
      </div>`,
      iconAnchor:[4,4],
    });
    const marker=L.marker(coords,{icon,interactive:false}).addTo(mapInstance);
    marker.bindTooltip(name,{
      permanent:true,direction:'right',offset:[6,0],
      className:'leaflet-city-label',
      opacity:.85,
    });
  });

  TRAINS.forEach(train=>{
    const icon=createTrainIcon(train);
    const m=L.marker([train.lat,train.lng],{icon,zIndexOffset:100})
      .addTo(mapInstance)
      .on('click',(e)=>{
        showGlobalTooltip(e.originalEvent,train.name,`${train.speed>0?train.speed+' km/h':'Stopped'}`,train.status,train.route,train.next,train.color);
      });
    markerLayers[train.id]=m;
  });
}

function createTrainIcon(train){
  const stopped=train.status==='Stopped';
  return L.divIcon({
    className:'',
    html:`
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <div style="
          width:16px;height:16px;border-radius:50%;
          background:${train.color};border:2.5px solid #fff;
          box-shadow:0 0 8px ${train.color}88,0 2px 6px rgba(0,0,0,.3);
          display:flex;align-items:center;justify-content:center;
          font-size:8px;">
          ${stopped?'✖':'▶'}
        </div>
        <div style="
          background:rgba(15,23,42,.85);backdrop-filter:blur(4px);
          color:${train.color};font-size:8.5px;font-weight:700;
          padding:2px 5px;border-radius:4px;white-space:nowrap;
          border:1px solid ${train.color}55;line-height:1.3;
          font-family:Inter,sans-serif;">
          ${train.name}<br>
          <span style="color:${stopped?'#ef4444':'#94a3b8'};font-weight:400">
            ${stopped?'Stopped':train.speed+' km/h'}
          </span>
        </div>
      </div>`,
    iconSize:[80,44],
    iconAnchor:[8,8],
    popupAnchor:[0,-12],
  });
}

const mapStyle=document.createElement('style');
mapStyle.textContent=`
  .leaflet-city-label{
    background:none!important;border:none!important;box-shadow:none!important;
    padding:0!important;font-size:9px!important;font-weight:600!important;
    color:#475569!important;font-family:Inter,sans-serif!important;
    white-space:nowrap!important;
  }
  [data-theme="dark"] .leaflet-city-label{color:#94a3b8!important}
  .leaflet-control-attribution{font-size:8px}
`;
document.head.appendChild(mapStyle);

window.addEventListener('load',()=>{
  setTimeout(initLeafletMap, 50);
});

function filterTrains(val){
  TRAINS.forEach(t=>{
    const m=markerLayers[t.id];
    if(!m) return;
    if(val==='all'||t.id===val){
      mapInstance&&m.addTo(mapInstance);
    } else {
      m.remove();
    }
  });
}

/* ─────────────────────────────────────────────
   GLOBAL TOOLTIP (outside map)
───────────────────────────────────────────── */
const tt=document.getElementById('train-tt');
let ttVisible=false;
function showGlobalTooltip(ev,name,speed,status,route,next,color){
  if(!tt) return;
  document.getElementById('tt-title').textContent=name;
  document.getElementById('tt-title').style.color=color;
  document.getElementById('tt-speed').textContent=speed;
  document.getElementById('tt-status').textContent=status;
  document.getElementById('tt-status').style.color=status==='Stopped'?'#ef4444':'#16a34a';
  document.getElementById('tt-route').textContent=route;
  document.getElementById('tt-next').textContent=next;
  document.getElementById('tt-upd').textContent='Last updated: just now';
  tt.style.left=Math.min(ev.clientX+14,window.innerWidth-200)+'px';
  tt.style.top=Math.max(ev.clientY-32,8)+'px';
  tt.style.display='block';
  ttVisible=true;
}
document.addEventListener('click',()=>{if(ttVisible){tt.style.display='none';ttVisible=false}});

/* ─────────────────────────────────────────────
   ASSET TREE (Asset Hierarchy page)
   Only runs if #asset-tree exists on the page
───────────────────────────────────────────── */
const TREE_DATA={
  id:'rn',label:'Railway Network',children:[
    {id:'wr',label:'Western Railway',children:[
      {id:'wr101',label:'Train 01 (WR-101)',badge:'Running',bClr:'#16a34a',bBg:'#dcfce7',bBgD:'rgba(34,197,94,.15)',children:[
        {id:'eng',label:'Engine',dot:'#22c55e'},
        {id:'c1', label:'Coach 1',dot:'#22c55e'},
        {id:'c2', label:'Coach 2',dot:'#22c55e'},
        {id:'bs', label:'Brake System',dot:'#22c55e'},
      ]},
      {id:'wr102',label:'Train 02 (WR-102)',badge:'Running',bClr:'#16a34a',bBg:'#dcfce7',bBgD:'rgba(34,197,94,.15)',children:[
        {id:'eng2',label:'Engine',dot:'#22c55e'},
        {id:'c21', label:'Coach 1',dot:'#22c55e'},
      ]},
      {id:'wr103',label:'Train 03 (WR-103)',badge:'Stopped',bClr:'#dc2626',bBg:'#fee2e2',bBgD:'rgba(220,38,38,.15)',children:[
        {id:'eng3',label:'Engine',dot:'#ef4444'},
        {id:'c31', label:'Coach 1',dot:'#22c55e'},
        {id:'c32', label:'Coach 2',dot:'#22c55e'},
      ]},
    ]}
  ]
};
const openNodes=new Set(['rn','wr','wr101']);

// Asset details shown to the right when a tree node is clicked
const ASSET_DETAILS={
  wr101:{id:'WR-101',type:'Electric',status:'Running',driver:'John Smith',location:'Vadodara',speed:'128 km/h',update:'10:45:30 AM'},
  wr102:{id:'WR-102',type:'Electric',status:'Running',driver:'Asha Rao',location:'Anand',speed:'96 km/h',update:'10:44:10 AM'},
  wr103:{id:'WR-103',type:'Diesel',  status:'Stopped', driver:'Vikram Singh',location:'Surat',speed:'0 km/h',update:'10:31:02 AM'},
  eng:{id:'WR-101-ENG',type:'Engine',status:'Healthy',driver:'-',location:'Vadodara',speed:'-',update:'10:45:30 AM'},
  c1:{id:'WR-101-C1',type:'Coach',status:'Healthy',driver:'-',location:'Vadodara',speed:'-',update:'10:45:30 AM'},
  c2:{id:'WR-101-C2',type:'Coach',status:'Healthy',driver:'-',location:'Vadodara',speed:'-',update:'10:45:30 AM'},
  bs:{id:'WR-101-BS',type:'Brake System',status:'Healthy',driver:'-',location:'Vadodara',speed:'-',update:'10:45:30 AM'},
};
let selectedAssetId='wr101';

function findNode(node,id){
  if(node.id===id) return node;
  if(!node.children) return null;
  for(const c of node.children){
    const r=findNode(c,id);
    if(r) return r;
  }
  return null;
}

function renderNode(node,depth){
  const has=node.children&&node.children.length>0;
  const open=openNodes.has(node.id);
  const div=document.createElement('div');
  const row=document.createElement('div');
  row.className=depth===0?'t-root':'t-node';
  row.style.paddingLeft=`${depth*13}px`;
  if(has){
    const chevSVG=`<svg class="t-chev${open?' open':''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
    row.innerHTML+=chevSVG;
    row.addEventListener('click',e=>{
      e.stopPropagation();
      openNodes.has(node.id)?openNodes.delete(node.id):openNodes.add(node.id);
      rebuildTree();
    });
  } else if(node.dot){
    const d=document.createElement('span');
    d.className='t-dot';d.style.background=node.dot;d.style.marginLeft='2px';
    row.appendChild(d);
  } else {
    row.innerHTML+='<span style="width:13px;display:inline-block;flex-shrink:0"></span>';
  }
  const lbl=document.createElement('span');lbl.className='t-lbl';lbl.textContent=node.label;
  row.appendChild(lbl);
  if(node.badge){
    const b=document.createElement('span');b.className='t-badge';b.textContent=node.badge;
    b.style.color=node.bClr;
    b.style.background=isDark?node.bBgD:node.bBg;
    row.appendChild(b);
  }
  if(ASSET_DETAILS[node.id]){
    row.style.cursor='pointer';
    if(node.id===selectedAssetId) row.style.background='var(--nav-hover)';
    row.addEventListener('click',e=>{
      if(has) return; // chevron click already handled above for parent nodes
      selectedAssetId=node.id;
      rebuildTree();
      renderAssetDetailsPanel();
    });
  }
  div.appendChild(row);
  if(has&&open){
    const kids=document.createElement('div');
    node.children.forEach(c=>kids.appendChild(renderNode(c,depth+1)));
    div.appendChild(kids);
  }
  return div;
}

function rebuildTree(){
  const c=document.getElementById('asset-tree');
  if(!c) return;
  c.innerHTML='';
  const h=document.createElement('div');h.className='t-root';
  h.style.cursor='pointer';
  h.innerHTML=`<svg style="width:11px;height:11px;color:var(--muted)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg><span class="t-lbl" style="font-weight:600">Railway Network</span>`;
  c.appendChild(h);
  TREE_DATA.children.forEach(ch=>c.appendChild(renderNode(ch,1)));
}
rebuildTree();

function renderAssetDetailsPanel(){
  const panel=document.getElementById('asset-details-panel');
  if(!panel) return;
  const node=findNode(TREE_DATA,selectedAssetId);
  const d=ASSET_DETAILS[selectedAssetId];
  if(!node||!d){
    panel.innerHTML=`<div style="padding:40px 0;text-align:center;color:var(--muted)">Select an asset from the hierarchy to view details</div>`;
    return;
  }
  const statusColor = d.status==='Running'||d.status==='Healthy' ? 'var(--green)' : (d.status==='Stopped' ? 'var(--red)' : 'var(--orange)');
  panel.innerHTML=`
    <div class="det-row"><span class="det-k">Asset ID</span><span class="det-v">${d.id}</span></div>
    <div class="det-row"><span class="det-k">Name</span><span class="det-v">${node.label}</span></div>
    <div class="det-row"><span class="det-k">Type</span><span class="det-v">${d.type}</span></div>
    <div class="det-row"><span class="det-k">Status</span><span class="det-v"><span class="run-dot" style="background:${statusColor}"></span>${d.status}</span></div>
    <div class="det-row"><span class="det-k">Driver</span><span class="det-v">${d.driver}</span></div>
    <div class="det-row"><span class="det-k">Location</span><span class="det-v">${d.location}</span></div>
    <div class="det-row"><span class="det-k">Speed</span><span class="det-v">${d.speed}</span></div>
    <div class="det-row" style="border:none"><span class="det-k">Last Update</span><span class="det-v">${d.update}</span></div>
  `;
}
renderAssetDetailsPanel();

/* ─────────────────────────────────────────────
   LIVE SPEED SIMULATION (updates every 2s)
   Only runs if speed chart + map exist
───────────────────────────────────────────── */
setInterval(()=>{
  if(speedChart){
    const d=speedChart.data.datasets[0].data;
    const prev=d[d.length-1];
    const next=Math.min(160,Math.max(80,Math.round(prev+(Math.random()-.47)*10)));
    d.push(next);
    const now=new Date();
    speedChart.data.labels.push(now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false}));
    if(d.length>14){d.shift();speedChart.data.labels.shift();}
    speedChart.update('none');
    const liveSpeedEl=document.getElementById('live-speed');
    if(liveSpeedEl) liveSpeedEl.textContent=next;
  }

  if(mapInstance){
    TRAINS.filter(t=>t.status==='Running').forEach(t=>{
      t.lat+=( Math.random()-.5)*0.001;
      t.lng+=( Math.random()-.5)*0.001;
      if(markerLayers[t.id]) markerLayers[t.id].setLatLng([t.lat,t.lng]);
    });
  }
},2000);

/* ─────────────────────────────────────────────
   FINAL ICON INIT (after dynamic content)
───────────────────────────────────────────── */
lucide.createIcons();