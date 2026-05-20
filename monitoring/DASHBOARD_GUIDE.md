# ArcadeHub Monitoring - Pre-built Dashboard Instructions

## 🎯 Dashboard Options

You have two options to get monitoring dashboards:

### Option A: Use Community Dashboard (Easiest - Recommended for Beginners)

**Dashboard ID**: 11074 - "Docker Prometheus"

This pre-built dashboard includes:
- Container CPU usage
- Container memory usage
- Network I/O
- Disk I/O
- Container uptime

**Steps**:
1. In Grafana UI (http://localhost:3000), click **+** in left sidebar
2. Select **Import**
3. Enter **11074** in the dashboard ID field
4. Click **Load**
5. Select **Prometheus** from the datasource dropdown
6. Click **Import**

Done! The dashboard will appear in your dashboards list.

---

### Option B: Create Custom Dashboard (Advanced - Full Control)

Build your own dashboard tailored to your needs.

#### Step 1: Create New Dashboard

1. In Grafana, click **+** → **Dashboard**
2. Click **Add new panel**

#### Step 2: Add Panel - CPU Usage

**Panel Title**: Container CPU Usage (%)

**In Query Editor**:
- Select **Prometheus** datasource
- Paste this query:
```promql
rate(container_cpu_usage_seconds_total{name!=""}[5m]) * 100
```

**Panel Settings**:
- Visualization: **Graph** or **Time series**
- Title: Container CPU Usage (%)
- Unit: **Percent (0-100)**
- Y-axis min: 0, max: 100

#### Step 3: Add Panel - Memory Usage

**Panel Title**: Container Memory Usage (MB)

**Query**:
```promql
container_memory_usage_bytes{name!=""} / 1024 / 1024
```

**Panel Settings**:
- Visualization: **Graph**
- Unit: **Megabytes**

#### Step 4: Add Panel - Memory Limit

**Panel Title**: Container Memory Limit (MB)

**Query**:
```promql
container_memory_limit_bytes{name!=""} / 1024 / 1024
```

**Panel Settings**:
- Visualization: **Graph**
- Unit: **Megabytes**

#### Step 5: Add Panel - Network In

**Panel Title**: Network Bytes Received (Mbps)

**Query**:
```promql
rate(container_network_receive_bytes_total[5m]) * 8 / 1000 / 1000
```

**Panel Settings**:
- Visualization: **Graph**
- Unit: **Mbps**

#### Step 6: Add Panel - Network Out

**Panel Title**: Network Bytes Transmitted (Mbps)

**Query**:
```promql
rate(container_network_transmit_bytes_total[5m]) * 8 / 1000 / 1000
```

**Panel Settings**:
- Visualization: **Graph**
- Unit: **Mbps**

#### Step 7: Add Panel - Running Containers

**Panel Title**: Running Containers

**Query**:
```promql
count(up{job="cadvisor"} == 1)
```

**Panel Settings**:
- Visualization: **Stat**
- This shows a single number

#### Step 8: Save Dashboard

1. Click **Save** button (top right)
2. Name: "ArcadeHub Docker Monitoring"
3. Click **Save**

---

## 📊 Dashboard Layouts

### Layout 1: System Overview (2x3 grid)
```
┌─────────────────────────┬─────────────────────────┐
│   CPU Usage (%)         │  Memory Usage (MB)       │
├─────────────────────────┼─────────────────────────┤
│   Network In (Mbps)     │  Network Out (Mbps)     │
├─────────────────────────┼─────────────────────────┤
│   Running Containers    │  Container Uptime       │
└─────────────────────────┴─────────────────────────┘
```

### Layout 2: Focus on Performance (1 column)
```
┌─────────────────────────────────────────────────┐
│         CPU Usage (%)                           │
├─────────────────────────────────────────────────┤
│         Memory Usage (MB)                       │
├─────────────────────────────────────────────────┤
│         Network I/O (Mbps)                      │
├─────────────────────────────────────────────────┤
│         System Health                           │
└─────────────────────────────────────────────────┘
```

To change layout in Grafana:
1. Edit dashboard (pencil icon)
2. Drag panels to arrange
3. Resize by dragging corners
4. Save when done

---

## 🎨 Panel Visualization Types

### For Time-Series Data (CPU, Memory, Network)
- **Graph** (classic line chart)
- **Time Series** (modern, recommended)
- **Area** (filled areas for trends)

### For Current Values
- **Stat** (big number, good for KPIs)
- **Gauge** (circular, good for percentages)
- **Bar Gauge** (horizontal bar for comparison)

### For Comparing Multiple Values
- **Table** (row-based data)
- **Pie Chart** (proportion of total)
- **Heat Map** (time x value intensity)

---

## 🔍 Advanced: Filtering by Container

To show metrics for a specific container only, modify the query:

**Show only backend container CPU**:
```promql
rate(container_cpu_usage_seconds_total{name="arcadehub-backend"}[5m]) * 100
```

**Show only frontend container CPU**:
```promql
rate(container_cpu_usage_seconds_total{name="arcadehub-frontend"}[5m]) * 100
```

Note: Container names depend on your docker-compose service names.

---

## 🔄 Dashboard Variables (Optional - Advanced)

Create a dropdown to select containers dynamically.

1. Edit dashboard (pencil icon)
2. Dashboard settings (gear icon)
3. Variables
4. New variable:
   - Name: `container`
   - Type: Query
   - Data source: Prometheus
   - Query: `label_values(container_memory_usage_bytes, name)`
5. Save

Then modify queries to use `$container`:
```promql
rate(container_cpu_usage_seconds_total{name=~"$container"}[5m]) * 100
```

---

## 📈 Panel Refresh Rates

Control how often panels update:

1. Edit dashboard (pencil icon)
2. Top right: Set refresh interval
   - 30s (real-time monitoring)
   - 1m (default, balanced)
   - 5m (periodic check)

Or per-panel:
1. Edit panel
2. Panel options (right side)
3. Refresh interval dropdown

---

## 💾 Export Dashboard

Save dashboard configuration as JSON:

1. Dashboard settings (gear icon)
2. Export
3. Save JSON file
4. Share with team or backup

**Import saved dashboard**:
1. Click **+** → **Import**
2. Upload JSON file
3. Select Prometheus datasource
4. Import

---

## 🎯 Recommended First Dashboard

Start simple with these 3 panels:

1. **Container CPU (%)** - Spot CPU bottlenecks
2. **Container Memory (MB)** - Track memory growth
3. **Running Containers** - Quick health check

This gives you the essentials in 5 minutes.

---

## 🔒 Dashboard Security

### Shared Dashboards
- Right-click dashboard → Share
- Generate link with read-only access
- Control expiration

### Private vs Public
- Dashboard settings → Permissions
- Restrict to specific Grafana users
- Public links option

---

## ✨ Dashboard Tips

### Tip 1: Use Meaningful Titles
"CPU" ❌  
"Container CPU Usage (%)" ✅

### Tip 2: Set Appropriate Units
Grafana auto-formats with correct units (MB, Mbps, %)

### Tip 3: Color Code By Severity
- Green: Normal
- Yellow: Warning
- Red: Critical

Setup in panel → Thresholds

### Tip 4: Add Annotations
Mark events on graphs:
1. Panel → Annotations
2. Add important dates/events
3. Shows as vertical lines on graphs

### Tip 5: Use Time Series Visualization
Modern Grafana prefers "Time Series" over "Graph"
- Better performance
- More options
- Cleaner look

---

## 📚 Community Dashboards

Other useful Docker monitoring dashboards:

| Dashboard ID | Name |
|--------------|------|
| 11074 | Docker Prometheus |
| 1860 | Node Exporter (for host metrics) |
| 179 | Prometheus 2.0 Overview |
| 893 | Docker Container Stats |

Find more at: https://grafana.com/grafana/dashboards

---

## 🎓 Summary

**To get started quickly**: 
Import dashboard ID **11074** and you're done.

**To learn Grafana**: 
Build 3 simple panels manually.

**For production**: 
Create custom dashboards matching your monitoring needs.

---

Choose whichever approach fits your learning goals! 📊
