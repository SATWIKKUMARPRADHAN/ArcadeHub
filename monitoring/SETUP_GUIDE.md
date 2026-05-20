# ArcadeHub Monitoring Stack Setup Guide

## 🎯 Overview

This guide explains how to set up and use the Prometheus + Grafana + cAdvisor monitoring stack for your ArcadeHub MERN application.

The monitoring infrastructure has been integrated into your existing Docker Compose setup and provides:
- **Real-time container metrics** (CPU, memory, network)
- **Historical data storage** via Prometheus
- **Visual dashboards** via Grafana
- **Zero impact** on existing application code

---

## 📁 Directory Structure

```
monitoring/
├── prometheus/
│   └── prometheus.yml              # Prometheus configuration & scrape targets
└── grafana/
    └── provisioning/
        └── datasources/
            └── prometheus-datasource.yml    # Auto-configuration for Prometheus datasource
```

---

## 🚀 Quick Start

### 1. Start the Monitoring Stack

```bash
# From the project root directory
docker-compose up -d
```

This will start:
- Your existing **backend** (port 5000)
- Your existing **frontend** (port 5173)
- **cAdvisor** (port 8080) - Docker metrics collector
- **Prometheus** (port 9090) - Metrics storage & API
- **Grafana** (port 3000) - Dashboard & visualization

### 2. Access the Services

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | React application |
| **Backend** | http://localhost:5000 | Express API |
| **cAdvisor** | http://localhost:8080 | Container metrics |
| **Prometheus** | http://localhost:9090 | Metrics database & queries |
| **Grafana** | http://localhost:3000 | Monitoring dashboards |

### 3. Log into Grafana

- **URL**: http://localhost:3000
- **Username**: `admin`
- **Password**: `admin`
- ⚠️ **Change these credentials in production** (edit `docker-compose.yml` GF_SECURITY_* variables)

---

## 📊 How It Works

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Compose Network                      │
│                                                                   │
│  ┌──────────┐      ┌──────────┐      ┌────────────┐              │
│  │ Backend  │      │ Frontend │      │  cAdvisor  │              │
│  │ :5000   │      │ :5173   │      │  :8080    │              │
│  └──────────┘      └──────────┘      └────────────┘              │
│                                             │                    │
│                                   Collects metrics                │
│                                   from Docker                     │
│                                             │                    │
│                                             ▼                    │
│                                      ┌──────────────┐             │
│                                      │  Prometheus  │             │
│                                      │  :9090      │             │
│                                      │              │             │
│                      Stores 15 days of              │             │
│                      time-series data               │             │
│                                      └──────────────┘             │
│                                             │                    │
│                              Queries & visualizes                │
│                                             │                    │
│                                             ▼                    │
│                                      ┌──────────────┐             │
│                                      │   Grafana    │             │
│                                      │  :3000      │             │
│                                      │ (Dashboards) │             │
│                                      └──────────────┘             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Collection Flow

1. **cAdvisor** continuously monitors Docker containers via the Docker socket
2. **Prometheus** scrapes cAdvisor metrics every 15 seconds
3. **Grafana** queries Prometheus for metrics and renders them in dashboards
4. Historical data is stored in Prometheus for 15 days

---

## ✅ Verify the Setup

### 1. Check All Services are Running

```bash
docker-compose ps
```

Expected output shows all 5 services running:
```
NAME         SERVICE      STATUS      PORTS
backend      backend      running     0.0.0.0:5000->5000/tcp
frontend     frontend     running     0.0.0.0:5173->5173/tcp
cadvisor     cadvisor     running     0.0.0.0:8080->8080/tcp
prometheus   prometheus   running     0.0.0.0:9090->9090/tcp
grafana      grafana      running     0.0.0.0:3000->3000/tcp
```

### 2. Check Prometheus is Scraping cAdvisor

1. Visit http://localhost:9090/targets
2. Under the **cadvisor** job, you should see `State: UP`
3. This confirms metrics are being collected

### 3. Query a Metric in Prometheus

1. Visit http://localhost:9090 (Prometheus UI)
2. In the query box, try these metrics:
   - `container_cpu_usage_seconds_total` - CPU time used by containers
   - `container_memory_usage_bytes` - Memory used by containers
   - `up` - Shows which targets are running
3. Click **Execute** to see live data

### 4. Verify Grafana Datasource

1. Visit http://localhost:3000 (Grafana)
2. Login with `admin` / `admin`
3. Go to **Configuration** → **Data Sources**
4. You should see **Prometheus** listed with a green checkmark
5. Click it and check the **Connection** section shows `Data source is working`

---

## 📈 Setting Up Monitoring Dashboards

### Option 1: Import a Pre-built Dashboard (Recommended for Beginners)

Grafana includes a community dashboard for Docker monitoring:

1. In Grafana, click the **+** icon in the left sidebar
2. Select **Import**
3. Enter dashboard ID: **11074** (Docker Prometheus monitoring)
4. Click **Load**
5. Select your **Prometheus** datasource from the dropdown
6. Click **Import**

This will create a dashboard showing:
- Container CPU usage
- Container memory usage
- Network I/O
- Disk I/O
- Container uptime

### Option 2: Create a Custom Dashboard

#### Create a New Dashboard

1. In Grafana, click the **+** icon and select **Dashboard**
2. Click **Add new panel**

#### Add CPU Usage Panel

**Panel Title**: Container CPU Usage

**Prometheus Query**:
```promql
rate(container_cpu_usage_seconds_total{name!=""}[5m])
```

**Panel Type**: Graph or Time series

#### Add Memory Usage Panel

**Panel Title**: Container Memory Usage

**Prometheus Query**:
```promql
container_memory_usage_bytes{name!=""} / 1024 / 1024
```

**Panel Type**: Graph or Gauge (for current value)

#### Add Container Count Panel

**Panel Title**: Running Containers

**Prometheus Query**:
```promql
count(container_last_seen)
```

**Panel Type**: Stat (shows a single number)

#### Save Your Dashboard

- Click **Save** in the top right
- Give your dashboard a name like "Docker Monitoring"
- Choose a folder or create a new one

---

## 🔍 Useful Prometheus Queries

Here are some queries you can use in Grafana panels:

```promql
# CPU usage percentage per container
(rate(container_cpu_usage_seconds_total[5m]) * 100)

# Memory usage in GB
(container_memory_usage_bytes / 1024 / 1024 / 1024)

# Network bytes received (delta over 5 minutes)
rate(container_network_receive_bytes_total[5m])

# Network bytes transmitted (delta over 5 minutes)
rate(container_network_transmit_bytes_total[5m])

# Container uptime in seconds
time() - container_start_time_seconds

# Available metrics matching a pattern
container_*
```

---

## 🛠️ Common Tasks

### Change Grafana Admin Password

Edit `docker-compose.yml` and update:
```yaml
environment:
  - GF_SECURITY_ADMIN_PASSWORD=your_new_password
```

Then restart:
```bash
docker-compose up -d grafana
```

### Increase Prometheus Data Retention

Edit `docker-compose.yml` and change the Prometheus command:
```yaml
command:
  - '--storage.tsdb.retention.time=30d'  # Keep 30 days instead of 15
```

Restart:
```bash
docker-compose up -d prometheus
```

### Stop the Monitoring Stack

```bash
docker-compose down
```

### Remove All Monitoring Data (Reset)

```bash
docker-compose down -v
```

This will delete all volumes, clearing stored metrics and Grafana dashboards.

---

## 🔒 Production Considerations

When deploying to production:

1. **Change Grafana Credentials**
   - Set strong `GF_SECURITY_ADMIN_PASSWORD`
   - Configure `GF_USERS_ALLOW_SIGN_UP=false`

2. **Secure Access**
   - Use environment-specific `.env` files
   - Configure reverse proxy (nginx/traefik) with authentication
   - Don't expose ports directly to the internet

3. **Increase Resource Limits**
   - Scale up memory/CPU allocations if monitoring grows
   - Monitor Prometheus disk usage

4. **Enable Persistence**
   - Ensure volumes are backed up
   - Use external storage for critical environments

5. **Add Alerting**
   - Configure alert rules in Prometheus
   - Set up notification channels in Grafana (email, Slack, etc.)

6. **Update Credentials in CI/CD**
   - Keep `.env` and `docker-compose.yml` in git (with sensitive values in .env.example)
   - Use GitHub Secrets for production values

---

## ❓ Troubleshooting

### Prometheus shows cAdvisor as DOWN

- Check if cAdvisor container is running: `docker ps | grep cadvisor`
- Check cAdvisor logs: `docker-compose logs cadvisor`
- Verify Docker socket is mounted: `docker-compose exec cadvisor ls -la /var/run/docker.sock`

### Grafana datasource not connecting

- Check Prometheus is running: `docker-compose logs prometheus`
- Verify the URL is `http://prometheus:9090` (not localhost)
- Restart Grafana: `docker-compose restart grafana`

### Memory usage seems high

- This is normal for monitoring. Prometheus and Grafana cache data
- Check actual container limits: `docker stats`
- Resource limits are set in `docker-compose.yml`

### No metrics appearing in Grafana

- Wait 30 seconds for initial scrape
- Check Prometheus targets: http://localhost:9090/targets
- Verify your query syntax in Prometheus first
- Check Grafana query: scroll down and verify "No data" isn't selected

---

## 📚 Additional Resources

- **Prometheus Docs**: https://prometheus.io/docs
- **Grafana Docs**: https://grafana.com/docs
- **cAdvisor Docs**: https://github.com/google/cadvisor
- **Prometheus Query Language**: https://prometheus.io/docs/prometheus/latest/querying/basics/

---

## 📝 Summary

Your monitoring stack is now integrated into your MERN application:

✅ **Non-invasive** - No changes to your React/Express code  
✅ **Production-ready** - Docker Compose with proper volumes and networking  
✅ **Scalable** - Metrics retained for 15 days, easily adjustable  
✅ **Observable** - See real-time container health and performance  

The existing application is completely unaffected while you gain full infrastructure visibility.

Happy monitoring! 📊
