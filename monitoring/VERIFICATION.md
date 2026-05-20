# Monitoring Stack Verification Checklist

Use this checklist after running `docker-compose up -d` to verify everything is working correctly.

---

## ✅ Step 1: Check All Services Are Running (1 minute)

### Command
```bash
docker-compose ps
```

### Expected Output
All 5 services should show STATUS: `running`
```
NAME         SERVICE      STATUS
backend      backend      running
frontend     frontend     running
cadvisor     cadvisor     running
prometheus   prometheus   running
grafana      grafana      running
```

### If a service shows `exited`:
```bash
# View error logs
docker-compose logs servicename

# Restart it
docker-compose up -d servicename
```

### If a service shows `unhealthy`:
Wait 30 seconds and check again. Services take time to start.

---

## ✅ Step 2: Verify Application Services (2 minutes)

### Test Frontend
```bash
# Windows
curl http://localhost:5173

# Should return HTML
```

### Test Backend API
```bash
# Windows
curl http://localhost:5000/api

# Should return JSON or API response
```

If either fails:
- Check logs: `docker-compose logs backend` or `docker-compose logs frontend`
- Verify MONGO_URI is set in your .env file
- Ensure port 5000 and 5173 are not in use

---

## ✅ Step 3: Check cAdvisor (2 minutes)

### Test cAdvisor Metrics Endpoint
```bash
curl http://localhost:8080/metrics | head -20
```

### Expected
Should see Prometheus format metrics starting with:
```
# HELP container_cpu_usage_seconds_total Total CPU time used
# TYPE container_cpu_usage_seconds_total counter
container_cpu_usage_seconds_total{...}
```

### If no output or error:
```bash
# Check cAdvisor logs
docker-compose logs cadvisor

# Verify Docker socket access
docker exec cadvisor ls -la /var/run/docker.sock
```

---

## ✅ Step 4: Check Prometheus (3 minutes)

### Access Prometheus UI
Open browser: http://localhost:9090

### Should See
- Page title: "Prometheus"
- Query box at top
- "Targets" link in navbar

### Check Targets
1. Click "Status" in top navbar
2. Click "Targets"
3. Should see two jobs:
   - **prometheus**: UP
   - **cadvisor**: UP

### If cadvisor is DOWN:
- Wait 30 seconds (first scrape takes time)
- Refresh page
- Check cAdvisor logs: `docker-compose logs cadvisor`

### Run a Test Query
1. Go to http://localhost:9090
2. In query box, type: `up`
3. Click "Execute"
4. Should see results showing metric values

---

## ✅ Step 5: Check Grafana (3 minutes)

### Access Grafana
Open browser: http://localhost:3000

### Login
- Username: `admin`
- Password: `admin`

### Verify Prometheus Datasource
1. Click settings icon (gear) → "Configuration"
2. Select "Data sources"
3. Should see "Prometheus" listed
4. Click on it
5. Check green checkmark next to "Data source is working"
6. Verify URL shows: `http://prometheus:9090`

### If datasource shows error:
```bash
# Check Grafana logs
docker-compose logs grafana

# Verify datasource file
docker exec grafana cat /etc/grafana/provisioning/datasources/prometheus-datasource.yml
```

---

## ✅ Step 6: Verify Metrics Are Being Collected (5 minutes)

### In Prometheus UI
1. Go to http://localhost:9090
2. Click "Graph" tab (left side)
3. Type this query: `container_memory_usage_bytes{name!=""}`
4. Click "Execute"
5. Should see:
   - Graph with lines
   - Table below with values for each container

### If no results appear:
- Wait 30 seconds (first metrics take time to collect)
- Refresh the page
- Try simpler query: `up`
- Check: docker-compose logs cadvisor

---

## ✅ Step 7: Try Common Metrics

In Prometheus UI, test these queries one by one:

### CPU Usage
```promql
rate(container_cpu_usage_seconds_total[5m]) * 100
```
Should show percentage values

### Memory Usage
```promql
container_memory_usage_bytes / 1024 / 1024
```
Should show values in MB

### Container Count
```promql
count(up{job="cadvisor"})
```
Should show number: 5 (or however many containers)

---

## ✅ Step 8: Create Your First Grafana Dashboard (10 minutes)

### Import Pre-built Dashboard
1. In Grafana UI, click **+** icon in left sidebar
2. Select **Import**
3. Enter dashboard ID: **11074**
4. Click **Load**
5. Select **Prometheus** from datasource dropdown
6. Click **Import**

### Result
You should see a dashboard with panels showing:
- Container CPU usage
- Container memory
- Network statistics
- Container metrics

If it works, you're done! ✅

---

## 🔍 Detailed Troubleshooting

### Problem: "Connection refused" when accessing services

**Solution**:
```bash
# Verify services are running
docker-compose ps

# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :9090
netstat -ano | findstr :8080

# If in use, kill the process or use different ports
# Or restart Docker
docker-compose down
docker-compose up -d
```

### Problem: Prometheus shows cAdvisor as DOWN

**Solution**:
```bash
# Check cAdvisor is running
docker ps | grep cadvisor

# Check if it's responding
curl http://localhost:8080/metrics

# If not, restart
docker-compose restart cadvisor

# Check logs
docker-compose logs cadvisor
```

### Problem: Grafana won't show metrics

**Solution**:
1. Wait 30-60 seconds (first data collection takes time)
2. Refresh Grafana page
3. Verify datasource: Configuration → Data sources → Prometheus → Check connection
4. Try query in Prometheus first: http://localhost:9090
5. If Prometheus shows data but Grafana doesn't, restart Grafana: `docker-compose restart grafana`

### Problem: Services exit immediately

**Solution**:
```bash
# View error logs
docker-compose logs

# For specific service
docker-compose logs prometheus
docker-compose logs grafana
docker-compose logs cadvisor

# Common causes:
# - Port already in use (change in docker-compose.yml)
# - Insufficient disk space
# - Volume mount permissions
# - Docker daemon not running

# Try full reset
docker-compose down -v
docker-compose up -d
```

---

## 📊 Performance Check

### Check Disk Usage
```bash
# Prometheus metrics
docker exec prometheus du -sh /prometheus

# Grafana data
docker exec grafana du -sh /var/lib/grafana

# cAdvisor cache
docker volume inspect arcadehub_cadvisor-cache
```

### Normal Sizes
- Prometheus: 100MB - 1GB (depending on retention)
- Grafana: 50MB - 200MB (depending on dashboards)
- cAdvisor cache: 10MB - 50MB

If any are much larger, it may indicate a problem.

---

## 🚀 Verification Completed Checklist

- [ ] All 5 services running (`docker-compose ps`)
- [ ] Frontend accessible (http://localhost:5173)
- [ ] Backend API responsive (http://localhost:5000)
- [ ] cAdvisor metrics accessible (http://localhost:8080/metrics)
- [ ] Prometheus UI loads (http://localhost:9090)
- [ ] cAdvisor shows UP in Prometheus targets
- [ ] Prometheus query returns data (query: `up`)
- [ ] Grafana UI loads (http://localhost:3000)
- [ ] Grafana datasource connected (shows green checkmark)
- [ ] Prometheus metrics visible in Grafana
- [ ] Dashboard imported (ID: 11074)
- [ ] Dashboard shows container statistics

If all boxes are checked: **Your monitoring stack is working! 🎉**

---

## 🔄 What to Do Next

### If Everything Works:
1. Read: `monitoring/SETUP_GUIDE.md` for full documentation
2. Explore: Create custom dashboards
3. Learn: Try various Prometheus queries (see `monitoring/QUICK_REFERENCE.md`)

### If Something Doesn't Work:
1. Check the "Detailed Troubleshooting" section above
2. Read: `monitoring/SETUP_GUIDE.md` → Troubleshooting section
3. Check logs: `docker-compose logs servicename`
4. Verify: Environment variables in `.env` files

### For Production:
1. Read: `monitoring/ARCHITECTURE.md` for production considerations
2. Update credentials in `docker-compose.yml`
3. Configure email notifications (optional)
4. Set up backup strategy

---

## 📞 Additional Help

| Issue | Quick Fix |
|-------|-----------|
| Service won't start | Check logs: `docker-compose logs` |
| Port in use | Change port in `docker-compose.yml` |
| No metrics | Wait 30s and refresh |
| Datasource error | Restart Grafana: `docker-compose restart grafana` |
| Disk full | Check sizes: `docker volume ls` |
| Want to reset | `docker-compose down -v` then `up -d` |

---

**Verification complete! Your monitoring stack is ready to use.** ✅📊
