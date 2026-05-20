# Quick Reference: Commands & Queries

## 🚀 Essential Commands

### Start Everything
```bash
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f prometheus
docker-compose logs -f grafana
docker-compose logs -f cadvisor

# Last 100 lines
docker-compose logs --tail=100
```

### Stop Everything
```bash
docker-compose down
```

### Restart a Service
```bash
docker-compose restart prometheus
docker-compose restart grafana
docker-compose restart cadvisor
```

### Delete All Data (Reset)
```bash
docker-compose down -v
```

---

## 🌐 Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| React App | http://localhost:5173 | Your frontend |
| Express API | http://localhost:5000/api | Your backend |
| cAdvisor | http://localhost:8080 | Raw metrics |
| Prometheus | http://localhost:9090 | Metrics queries |
| Grafana | http://localhost:3000 | Dashboards |

---

## 📊 Prometheus Queries (Copy & Paste)

### CPU

**Container CPU usage %**
```promql
rate(container_cpu_usage_seconds_total{name!=""}[5m]) * 100
```

**CPU per container**
```promql
rate(container_cpu_usage_seconds_total{name!=""}[5m]) by (name) * 100
```

---

### Memory

**Memory usage in MB**
```promql
container_memory_usage_bytes{name!=""} / 1024 / 1024
```

**Memory limit in MB**
```promql
container_memory_limit_bytes{name!=""} / 1024 / 1024
```

**Memory usage %**
```promql
(container_memory_usage_bytes{name!=""} / container_memory_limit_bytes{name!=""}) * 100
```

---

### Network

**Incoming bandwidth (Mbps)**
```promql
rate(container_network_receive_bytes_total[5m]) * 8 / 1000 / 1000
```

**Outgoing bandwidth (Mbps)**
```promql
rate(container_network_transmit_bytes_total[5m]) * 8 / 1000 / 1000
```

**Total network errors**
```promql
rate(container_network_receive_errors_total[5m]) + rate(container_network_transmit_errors_total[5m])
```

---

### Container Health

**Running containers**
```promql
count(up{job="cadvisor"} == 1)
```

**Container uptime (hours)**
```promql
(time() - container_start_time_seconds{name!=""}) / 3600
```

**Containers restarted today**
```promql
count(increase(container_last_seen{name!=""}[1d]))
```

---

### System Level

**Total CPU cores available**
```promql
machine_cpu_cores
```

**Total memory available (MB)**
```promql
machine_memory_bytes / 1024 / 1024
```

**Docker daemon health**
```promql
up{job="cadvisor"}
```

---

## 🎨 Dashboard Setup Steps

### Quick Method (Import Existing)

1. Login to Grafana (admin/admin)
2. Click **+** → **Import**
3. Enter ID: **11074**
4. Select **Prometheus**
5. Click **Import**

### Manual Method (Create Custom)

1. **New Dashboard** → **Add Panel**
2. **Metrics Tab** → Select **Prometheus**
3. Paste query from above
4. Adjust time range (top right)
5. Change visualization type (right panel)
6. **Apply** → **Save Dashboard**

---

## 🔧 Grafana Configuration

### Change Admin Password
Edit docker-compose.yml:
```yaml
grafana:
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=YourNewPassword123
```
Then: `docker-compose up -d grafana`

### Add Email Notifications
In Grafana UI:
1. Configuration → Notification channels
2. Create new channel (Email)
3. Configure SMTP settings
4. Create alert rule to send emails

### Export Dashboard
1. Go to dashboard settings (gear icon)
2. Export → Save as JSON
3. Share with team or backup

### Import Dashboard from JSON
1. Click **+** → **Import**
2. Paste JSON or upload file
3. Select Prometheus datasource
4. Import

---

## 🐛 Troubleshooting Checklist

### Services won't start
```bash
# Check Docker daemon
docker ps

# View error logs
docker-compose logs

# Rebuild images
docker-compose down
docker-compose build
docker-compose up -d
```

### Prometheus not scraping cAdvisor
```bash
# Check cAdvisor is running
docker-compose ps cadvisor

# Check metrics endpoint
curl http://localhost:8080/metrics | head -20

# Check Prometheus targets
# Visit: http://localhost:9090/targets
```

### Grafana not showing data
```bash
# Wait 30+ seconds for first scrape
# Check datasource
# Visit: http://localhost:3000/connections/datasources

# Test query in Prometheus first
# Visit: http://localhost:9090

# Verify your query syntax
```

### High disk usage
```bash
# Check Prometheus storage
docker exec prometheus du -sh /prometheus

# Reduce retention
# Edit docker-compose.yml Prometheus command:
# --storage.tsdb.retention.time=7d  (instead of 15d)
```

---

## 📝 Pro Tips

### Tip 1: Use Labels in Queries
Filter by container name:
```promql
container_cpu_usage_seconds_total{name="my-container"}
```

### Tip 2: Time Range Shortcuts
- Prometheus UI: Use dropdown (1h, 6h, 1d, 1w)
- Grafana panels: Use `$__range` variable

### Tip 3: Compare Multiple Metrics
Use arithmetic in Prometheus:
```promql
(container_memory_usage_bytes / container_memory_limit_bytes) * 100
```

### Tip 4: Alerting
Set up simple threshold alert in Grafana:
1. Edit panel
2. Alert tab
3. Create new alert rule
4. Set condition (e.g., CPU > 80%)

### Tip 5: Backup Before Changes
```bash
docker-compose exec prometheus tar czf - /prometheus | gzip > prometheus-backup.tar.gz
```

---

## 📚 Grafana Panel Types

| Type | Best For |
|------|----------|
| **Graph** | Line charts over time |
| **Stat** | Single number / percentage |
| **Gauge** | Current value on scale |
| **Bar Gauge** | Multiple values with bars |
| **Table** | Multiple metrics in table |
| **Heat Map** | Intensity over time |
| **Pie Chart** | Proportions |
| **Time Series** | Modern time-based chart |

---

## 🎯 Common Scenarios

### Scenario: Website got slow, debug with metrics

1. Open Grafana
2. Check CPU panel - is it maxed out?
3. Check Memory panel - is it near limit?
4. Check Network panel - is bandwidth maxed?
5. Correlate with timestamps of slowness
6. Adjust container limits if needed:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 2G
   ```

### Scenario: Container keeps restarting

1. Check container uptime:
   ```promql
   (time() - container_start_time_seconds) / 60
   ```
2. View logs: `docker-compose logs backend`
3. Check for OOMKilled: `docker inspect <container> | grep OOM`
4. Increase memory limit if needed

### Scenario: Disk space warning

1. Check Prometheus disk usage:
   ```bash
   docker exec prometheus du -sh /prometheus
   ```
2. Reduce retention in docker-compose.yml
3. Or clean old data and restart

---

## 🔄 Maintenance Routine

### Weekly
- [ ] Check dashboard for anomalies
- [ ] Verify all containers running
- [ ] Review error rates

### Monthly
- [ ] Export dashboards as backup
- [ ] Review and optimize queries
- [ ] Check disk usage trends

### Quarterly
- [ ] Update container images
- [ ] Review retention settings
- [ ] Document any customizations

---

## 📞 Quick Help

**Prometheus web UI offline?**
- Service stopped: `docker-compose up -d prometheus`
- Port conflict: `netstat -an | grep 9090` (Windows: `netstat -ano | findstr :9090`)

**Grafana won't login?**
- Reset admin user: `docker-compose exec grafana grafana-cli admin reset-admin-password newpassword`

**Lost all metrics?**
- This happens when volumes are deleted
- Restart collection: `docker-compose up -d`
- Wait 1 minute for data to appear

**Need to backup everything?**
```bash
docker-compose exec prometheus tar czf - /prometheus > prometheus.tar.gz
docker-compose exec grafana tar czf - /var/lib/grafana > grafana.tar.gz
```

---

## 🎓 What You've Learned

- Container monitoring with cAdvisor ✓
- Metrics collection with Prometheus ✓
- Dashboard creation with Grafana ✓
- PromQL query language ✓
- Docker Compose production patterns ✓
- DevOps observability concepts ✓

You now have production-grade monitoring! 🚀
