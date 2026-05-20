# Jenkins Integration Setup

This document explains how Jenkins has been integrated into the ArcadeHub project and how to start, configure, and use it safely without disturbing the existing stack.

## What Was Added

- `Jenkinsfile` in the project root
- Jenkins service added to `docker-compose.yml`
- `jenkins/` directory containing a custom Jenkins Docker image
- Jenkins persistence via `jenkins-data` Docker volume
- Pipeline configuration suitable for a MERN project

## Jenkins Service Configuration

### Docker Compose Service
The new service is:
- **Service name**: `jenkins`
- **Host port**: `8081`
- **Container port**: `8080`
- **SSH agent port**: `50000`
- **Volume**:
  - `jenkins-data:/var/jenkins_home`
  - `/var/run/docker.sock:/var/run/docker.sock`

This keeps Jenkins isolated from the existing app and monitoring stack.

### Jenkins Image
A custom Jenkins image is built from `jenkins/Dockerfile` and includes:
- official Jenkins LTS image
- Docker CLI installed for optional compose validation
- Jenkins plugins for pipeline and Docker workflow

## Starting Jenkins

From the project root, run:

```bash
docker-compose up -d jenkins
```

This starts Jenkins without affecting the existing frontend, backend, or monitoring services.

## Accessing Jenkins UI

Open this URL in your browser:

```text
http://localhost:8081
```

## Unlocking Jenkins

When Jenkins starts for the first time, it requires an initial admin password.

### Find the password

Run this command in your project root:

```bash
docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Copy the password and paste it into the Jenkins unlock screen.

## Initial Jenkins Setup

1. Open `http://localhost:8081`
2. Enter the initial admin password
3. Choose **Install suggested plugins**
4. Create the first admin user
5. Continue to the Jenkins dashboard

## Required Jenkins Plugins

The Jenkins image installs these plugins automatically:
- **Git**
- **Pipeline** / **workflow-aggregator**
- **Docker Pipeline** (`docker-workflow`)
- **Pipeline Stage View**

These are enough for a basic Jenkins pipeline that checks out code, installs dependencies, builds, and optionally validates Docker Compose.

## Creating the Pipeline Job

### Option A: Declarative Pipeline Job
1. Click **New Item**
2. Enter a name like `ArcadeHub-CI`
3. Choose **Pipeline**
4. Click **OK**
5. In the Pipeline section, set **Definition** to `Pipeline script from SCM`
6. Choose **Git**
7. Enter your repository URL
8. Set **Branch Specifier** to `*/main`
9. Set **Script Path** to `Jenkinsfile`
10. Click **Save**

### Option B: Multibranch Pipeline (recommended)
1. Click **New Item**
2. Choose **Multibranch Pipeline**
3. Provide a name like `ArcadeHub-Multibranch`
4. In Branch Sources add your repository URL
5. Configure credentials if needed
6. Save the job

## Running the Jenkins Pipeline

1. Open the job in Jenkins
2. Click **Build Now**
3. Click the build number in the build history
4. View the console output to follow the pipeline steps

## What the Pipeline Does

The `Jenkinsfile` performs these steps:
- checks out the repository code
- installs frontend dependencies in `client`
- builds frontend assets with `npm run build`
- installs backend dependencies in `server`
- validates backend package manifest
- optionally validates `docker compose config`

The pipeline uses Docker container agents to keep the Jenkins host clean and reproduce the Node environment.

## Verifying Successful Execution

A successful build shows:
- green stage status
- `npm ci` completed in both `client` and `server`
- `npm run build` completed successfully
- optional Docker Compose validation passed or was skipped cleanly

To inspect logs after a build:
1. Open the build entry
2. Click **Console Output**
3. Review each stage for success messages

## How to Stop Jenkins

```bash
docker-compose stop jenkins
```

## How to Remove Jenkins Data

```bash
docker-compose down -v jenkins
docker volume rm devops_project_jenkins-data
```

> Note: removing the Jenkins volume deletes credentials, jobs, and configuration.

## Important Notes

- The existing Docker, Prometheus, Grafana, and application setup are preserved.
- Jenkins runs as an additional infrastructure service.
- The GitHub Actions CI workflow remains untouched.
- This Jenkins configuration is intended for CI demonstration and validation, not automatic production deployment.
