# Railway Digital Twin Platform - Design Guidelines

## 1. Overview

This document provides design guidelines for the Railway Digital Twin Monitoring Platform. Use this as a reference when creating new pages or modifying existing ones.

---

## 2. Color System

### Light Theme (Default)
| Usage | Color | Hex |
|-------|-------|-----|
| Background | `#f0f4f8` | Light gray-blue |
| Cards/Content | `#ffffff` | White |
| Sidebar | `#ffffff` | White |
| Text Primary | `#0f172a` | Dark navy |
| Text Muted | `#64748b` | Gray |
| Accent/Primary | `#3b82f6` | Blue |
| Success | `#16a34a` | Green |
| Danger | `#dc2626` | Red |
| Warning | `#ea580c` | Orange |
| Border | `#e2e8f0` | Light gray |

### Dark Theme (Toggle)
| Usage | Color | Hex |
|-------|-------|-----|
| Background | `#0f172a` | Dark navy |
| Cards/Content | `#1e293b` | Slate |
| Sidebar | `#111827` | Dark slate |
| Text Primary | `#f1f5f9` | White |
| Accent/Primary | `#60a5fa` | Light blue |
| Border | `rgba(71,85,105,.4)` | Transparent gray |

---

## 3. Typography

| Element | Font Size | Weight | Usage |
|---------|-----------|--------|-------|
| Page Title | 15px | 700 | Topbar heading |
| Card Title | 11.5px | 700 | Panel headers |
| KPI Value | 18-20px | 800 | Dashboard numbers |
| Body Text | 13px | 400 | General content |
| Labels | 9-10px | 400-600 | Field labels, metadata |
| Small Text | 8-9px | 400-600 | Badges, timestamps, subtitles |

**Font Family:** `'Inter', system-ui, sans-serif`

---

## 4. Icons

**Icon Library:** Lucide Icons (https://lucide.dev)

**Common Icons Used:**
| Icon | Name | Usage |
|------|------|-------|
| `layout-dashboard` | Overview | Dashboard icon |
| `layers` | Asset Hierarchy | Asset pages |
| `box` | 3D Twin | 3D viewer |
| `radio` | Telemetry | Live data |
| `map` | GIS | Map views |
| `globe` | Earth View | 3D globe |
| `route` | Route | Route visualization |
| `cpu` | Devices | Device monitoring |
| `settings` | Settings | Configuration |
| `bell` | Alerts | Notification |
| `sun` / `moon` | Theme | Dark/light toggle |

---

## 5. Sidebar

### Structure
```
Logo → Overview → MONITORING (section) → Pages → MANAGEMENT (section) → Settings → MONITORING (section) → Alerts → Logout → Train Image → Footer
```

### Key Features
- Active page highlighted with blue background
- Collapsible to icons only on small screens (<900px)
- Train image at bottom with hover effect
- Dark/light theme aware

---

## 6. Layout Components

### Topbar
```
[Icon] [Page Title]                [Date] [Time] [Theme Toggle] [Notifications] [Admin Chip]
```

### Content Area
- 12px padding around content
- 10px gap between elements
- Cards with 10px border-radius
- 8px box-shadow

### Cards
```css
background: var(--card);
border: 1px solid var(--border);
border-radius: 10px;
box-shadow: 0 1px 4px rgba(0,0,0,.08);
padding: 10px 12px;
```

---

## 7. Status Colors

| Status | Color | CSS Variable |
|--------|-------|--------------|
| Online/Running | Green | `var(--green)` |
| Warning | Orange | `var(--orange)` |
| Offline/Stopped | Red | `var(--red)` |
| Info | Blue | `var(--accent)` |

### Badge/Pill Classes
```html
<span class="pill green">● Online</span>
<span class="pill red">● Offline</span>
<span class="pill orange">● Warning</span>
<span class="pill blue">● Info</span>
```

---

## 8. Spacing Guidelines

| Element | Value |
|---------|-------|
| Content padding | 12px 14px |
| Card padding | 10px 12px |
| Gap between items | 10px |
| Panel header padding | 9px 12px 7px |
| Sidebar item padding | 8px 12px |

---

## 9. Responsive Breakpoints

| Screen Size | Behavior |
|-------------|----------|
| >1200px | Full layout |
| 900-1200px | Sidebar width reduces to 190px |
| 600-900px | Sidebar collapses to icons only (56px) |
| <600px | Stack layout, single column |

---

## 10. Images

| Image | Location | Description |
|-------|----------|-------------|
| Train image | `assets/images/train_img.png` | Sidebar footer image |

---

## 11. File Structure

```
project/
├── index.html              # Overview page
├── asset_hierarchy.html    # Asset Hierarchy
├── asset_details.html      # Asset Details
├── 3d_twin.html           # 3D Digital Twin
├── live_telemetry.html     # Live Telemetry
├── gis_monitoring.html     # GIS Monitoring
├── googleEarthView.html    # Google Earth View
├── route_visualization.html # Route Visualization
├── devices.html           # Devices
├── settings.html          # Settings
├── alerts.html            # Alerts
├── sidebar.css            # Sidebar styles (shared)
├── sidebar.js             # Sidebar logic (shared)
└── assets/
    └── images/
        └── train_img.png  # Sidebar train image
```

---

## 12. Theme Toggle

Theme preference is stored in localStorage:
```javascript
localStorage.getItem('rdt-theme') === 'dark'  // Dark mode enabled
```

---

## 13. Page Creation Checklist

When creating a new page:

- [ ] Copy template from existing page
- [ ] Update page title in `<title>` tag
- [ ] Add page to `SIDEBAR_CONFIG` in `sidebar.js`
- [ ] Set active state in sidebar (auto-detected)
- [ ] Use consistent card/panel structure
- [ ] Apply dark/light theme variables
- [ ] Make responsive (mobile friendly)
- [ ] Add Lucide icons where needed

---

## 14. Quick Reference

### CSS Variables
```css
var(--bg)          /* Page background */
var(--card)        /* Card background */
var(--text)        /* Primary text */
var(--muted)       /* Secondary text */
var(--border)      /* Border color */
var(--accent)      /* Primary accent */
var(--green)       /* Success */
var(--red)         /* Danger */
var(--orange)      /* Warning */
```

### Common Classes
```css
.panel   /* Card container */
.ph      /* Panel header */
.pb      /* Panel body */
.pill    /* Status badge */
.dim     /* Dim text */
.muted   /* Muted text */
```

---

**Last Updated:** June 2026

For questions, contact the development team.