pipeline {
  agent any

  environment {
    CLIENT_DIR = 'client'
    SERVER_DIR = 'server'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Frontend Dependencies') {
      steps {
        script {
          docker.image('node:20-alpine').inside('-u root:root -v /var/run/docker.sock:/var/run/docker.sock') {
            dir(env.CLIENT_DIR) {
              sh 'npm ci'
            }
          }
        }
      }
    }

    stage('Validate Frontend Build') {
      steps {
        script {
          docker.image('node:20-alpine').inside('-u root:root -v /var/run/docker.sock:/var/run/docker.sock') {
            dir(env.CLIENT_DIR) {
              sh 'npm run build'
            }
          }
        }
      }
    }

    stage('Install Backend Dependencies') {
      steps {
        script {
          docker.image('node:20-alpine').inside('-u root:root -v /var/run/docker.sock:/var/run/docker.sock') {
            dir(env.SERVER_DIR) {
              sh 'npm ci'
            }
          }
        }
      }
    }

    stage('Validate Backend Manifest') {
      steps {
        script {
          docker.image('node:20-alpine').inside('-u root:root -v /var/run/docker.sock:/var/run/docker.sock') {
            dir(env.SERVER_DIR) {
              sh 'node -e "require(\'./package.json\'); console.log(\'Backend package.json syntax valid\')"'
            }
          }
        }
      }
    }

    stage('Optional Docker Compose Validation') {
      steps {
        script {
          docker.image('docker:24.0.5-cli').inside('-u root:root -v /var/run/docker.sock:/var/run/docker.sock') {
            sh 'if command -v docker >/dev/null; then docker compose config; else echo \"Docker CLI unavailable, skipping compose validation\"; fi'
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'client/build/**', allowEmptyArchive: true
      junit allowEmptyResults: true, testResults: '**/test-results/*.xml'
    }
  }
}
