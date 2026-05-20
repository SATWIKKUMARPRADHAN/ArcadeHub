# ArcadeHub Monitoring Architecture & Implementation

## 🏗️ Architecture Overview

### Components

#### 1. cAdvisor (Container Advisor)
- **Purpose**: Collects container metrics from Docker
- **Container Image**: `gcr.io/cadvisor/cadvisor:latest`
- **Port**: 8080
- **Key Metrics**: CPU, memory, network I/O, disk I/O, uptime
- **Docker Integration**: Mounts `/var/run/docker.sock` to read container data

#### 2. Prometheus
- **Purpose**: Time-series database for metrics storage
- **Container Image**: `prom/prometheus:latest`
- **Port**: 9090
- **Configuration**: `monitoring/prometheus/prometheus.yml`
- **Storage**: `prometheus-data` volume
- **Retention**: 15 days (configurable)
- **Update Interval**: Scrapes every 15 seconds

#### 3. Grafana
- **Purpose**: Visualization and dashboarding
- **Container Image**: `grafana/grafana:latest`
- **Port**: 3000
- **Datasource**: Prometheus (auto-configured)
- **Storage**: `grafana-data` volume for dashboards and settings
- **Default Credentials**: admin / admin

---

## 🔗 Communication Flow

```
1. cAdvisor collects metrics from Docker daemon
   └─> Exposes metrics at http://cadvisor:8080/metrics

2. Prometheus pulls metrics from cAdvisor
   └─> Stores in time-series database (prometheus-data volume)
   └─> Makes metrics queryable at http://prometheus:9090

3. Grafana queries Prometheus for visualization
   └─> Renders dashboards at http://grafana:3000
   └─> Users interact with dashboards via web UI
```

---

## 📊 Key Metrics Collected

### CPU Metrics
- `container_cpu_usage_seconds_total` - Total CPU time used by container
- `container_cpu_throttled_seconds_total` - CPU throttling time
- **Example Dashboard Panel**: CPU usage % = `rate(container_cpu_usage_seconds_total[5m]) * 100`

### Memory Metrics
- `container_memory_usage_bytes` - Current memory used by container
- `container_memory_max_usage_bytes` - Peak memory usage
- `container_memory_limit_bytes` - Memory limit set for container
- **Example Dashboard Panel**: Memory in GB = `container_memory_usage_bytes / 1024 / 1024 / 1024`

### Network Metrics
- `container_network_receive_bytes_total` - Bytes received
- `container_network_transmit_bytes_total` - Bytes transmitted
- `container_network_receive_errors_total` - Network errors
- **Example Dashboard Panel**: Network throughput = `rate(container_network_receive_bytes_total[5m])`

### Container Metadata
- `container_start_time_seconds` - Container start timestamp
- `container_last_seen` - Last time container was seen (uptime indicator)
- `up{job="cadvisor"}` - cAdvisor scrape health

---

## 📁 Configuration Files Explained

### prometheus.yml

```yaml
global:
  scrape_interval: 15s          # How often to collect metrics
  scrape_timeout: 10s           # Timeout for each scrape
  external_labels:              # Labels added to all metrics
    monitor: 'arcadehub-monitor'

scrape_configs:
  - job_name: 'prometheus'      # Monitor Prometheus itself
    static_configs:
      - targets: ['localhost:9090']
      
  - job_name: 'cadvisor'        # Scrape container metrics
    static_configs:
      - targets: ['cadvisor:8080']  # Docker DNS resolves "cadvisor" to cAdvisor service
```

**Key Concepts**:
- `scrape_interval`: Frequency of metric collection (15s = balance between accuracy and data volume)
- `targets`: Services to scrape (using Docker DNS names)
- `cadvisor:8080`: Docker Compose networking allows service-to-service communication

### prometheus-datasource.yml

```yaml
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090    # Docker DNS resolves "prometheus" to Prometheus service
    isDefault: true               # This datasource is used by default
    access: proxy                 # Grafana acts as proxy (recommended)
```

Grafana automatically loads this file and connects to Prometheus on startup.

---

## 🐳 Docker Compose Integration

### Service Dependencies

```
cadvisor
    ↓ (metrics pulled by)
prometheus
    ↓ (datasource for)
grafana
```

### Container Networking

Docker Compose creates an internal network where services communicate by name:
- `backend` can reach `frontend` via `http://frontend:5173`
- `prometheus` can reach `cadvisor` via `http://cadvisor:8080`
- All services share the default network

### Volume Management

| Volume | Purpose | Location |
|--------|---------|----------|
| `prometheus-data` | Stores 15 days of time-series metrics | `/prometheus` in container |
| `grafana-data` | Stores dashboards, users, settings | `/var/lib/grafana` in container |
| `cadvisor-cache` | Performance cache for cAdvisor | `/var/lib/cadvisor` in container |
| Docker socket | Real-time container access | `/var/run/docker.sock` (host) |

---

## 🔐 Design Decisions

### 1. Why cAdvisor?
- Native Docker integration (reads from Docker socket)
- No agent installation required on containers
- Automatic discovery of containers
- Lightweight and well-maintained by Google

### 2. Why Prometheus?
- Industry-standard metrics database
- Time-series storage optimized for monitoring
- Powerful query language (PromQL)
- Integrates seamlessly with Grafana

### 3. Why Grafana?
- Beautiful dashboards out of the box
- Pre-built community dashboards available
- Easy drag-and-drop panel creation
- Role-based access control

### 4. Why Not Modify Application Code?
- Monitoring added at infrastructure layer
- Zero impact on business logic
- Easier to maintain and upgrade
- Production monitoring best practice

---

## 📈 Scalability Considerations

### Current Setup
- Metrics scraped every 15 seconds
- 15 days of retention
- Suitable for single Docker Compose instance

### For Production Scale
1. **Increase Retention**: Change `--storage.tsdb.retention.time=30d` or more
2. **Increase Resources**: 
   ```yaml
   deploy:
     resources:
       limits:
         memory: 4G    # Increase for large deployments
   ```
3. **Add Alerting**: Configure alert rules in Prometheus
4. **Use Remote Storage**: Send metrics to external system (optional)

---

## 🚨 Monitoring Stack Monitoring

The stack includes built-in self-monitoring:
- **Prometheus self-metrics** at `http://localhost:9090/metrics`
- **Grafana metrics** provide insight into dashboard performance
- **cAdvisor metrics** show its own resource consumption

---

## 🔄 Update Process

### Update Monitoring Services

```bash
# Pull latest images
docker-compose pull prometheus grafana cadvisor

# Restart with new images
docker-compose up -d
```

### Update Prometheus Configuration

1. Edit `monitoring/prometheus/prometheus.yml`
2. Reload configuration: `docker-compose restart prometheus`
3. No data loss - metrics continue collecting

### Backup Metrics

```bash
# Backup Prometheus data
docker-compose cp prometheus:/prometheus ./prometheus-backup

# Backup Grafana data
docker-compose cp grafana:/var/lib/grafana ./grafana-backup
```

---

## 🧪 Testing the Setup

### 1. Verify All Services Started

```bash
docker-compose ps
```

### 2. Check Metrics Collection

```bash
# Query container CPU via cAdvisor
curl http://localhost:8080/metrics | grep container_cpu

# Query via Prometheus
curl 'http://localhost:9090/api/v1/query?query=up'
```

### 3. Load Test (Optional)

Generate traffic to see metrics change:
```bash
# Visit frontend multiple times
for i in {1..100}; do curl http://localhost:5173; done

# Check memory in Prometheus
# Query: container_memory_usage_bytes
```

---

## 📋 Implementation Checklist

- [x] Created `monitoring/` directory structure
- [x] Created `prometheus.yml` with cAdvisor scrape config
- [x] Created Grafana datasource provisioning
- [x] Updated `docker-compose.yml` with 3 monitoring services
- [x] Added resource limits to prevent monitoring overhead
- [x] Added Docker socket mounting for cAdvisor
- [x] Added persistent volumes for data
- [x] Added service labels for identification
- [x] Added service dependencies
- [ ] Import Docker monitoring dashboard (manual step)
- [ ] Create custom dashboards (manual step)

---

## 🎓 Learning Outcomes

By using this monitoring setup, you've learned:

✅ **Containerized monitoring** - How infrastructure monitoring works with Docker  
✅ **Time-series databases** - How Prometheus stores and retrieves metrics  
✅ **Metrics architecture** - Collection → Storage → Visualization pipeline  
✅ **Docker networking** - Service-to-service communication  
✅ **DevOps observability** - Industry-standard monitoring patterns  
✅ **Production readiness** - How to add observability without breaking deployments  

---

## 📞 Support & References

| Topic | Reference |
|-------|-----------|
| cAdvisor metrics | https://github.com/google/cadvisor/blob/master/docs/storage/prometheus.md |
| Prometheus queries | https://prometheus.io/docs/prometheus/latest/querying/basics/ |
| Grafana dashboards | https://grafana.com/grafana/dashboards/ |
| Docker socket security | https://docs.docker.com/engine/security/protect-client/ |
| Docker Compose networking | https://docs.docker.com/compose/networking/ |

---

**This monitoring setup demonstrates production-grade observability while maintaining simplicity and stability.** 🚀
