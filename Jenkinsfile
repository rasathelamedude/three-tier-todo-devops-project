pipeline{
  agent any

  environment {
    BACKEND_DOCKER_IMAGE = "rasyar/todo-backend"
    FRONTEND_DOCKER_IMAGE = "rasyar/todo-frontend"
  }

  options {
    disableConcurrentBuilds()
  }

  stages {
    stage("Detect code changes") {
      steps{
        script {
          echo "Detecting code changes..."

          def hasChanges = !currentBuild.changeSets.isEmpty()
          env.CODE_CHANGES = hasChanges.toString()
          echo "Code changes detected: ${env.CODE_CHANGES}"
        }
      }
    }
    stage('Run tests') {
      steps {
        echo "Running tests..."
        sh "cd backend && bun install && bun run test"
        echo "Tests completed successfully!"
      }
    }
    stage('Build docker images') {
      when {
        expression {
          return env.BRANCH_NAME == 'main' && env.CODE_CHANGES == 'true'
        }
      }
      steps {
        echo 'Building docker images...'
        sh "docker build -t ${env.BACKEND_DOCKER_IMAGE}:${BUILD_NUMBER} ./backend"
        sh "docker build -t ${env.FRONTEND_DOCKER_IMAGE}:${BUILD_NUMBER} ./frontend"
        echo "Docker images built successfully!"
      }
    }
    stage("Push docker images to docker hub") {
      when{
          expression {
            return env.BRANCH_NAME == 'main' && env.CODE_CHANGES == 'true'
          }
      }
      steps{
          echo "Pushing docker images..."
          withCredentials([usernamePassword(
              credentialsId: '46c78a62-3b4a-4a17-a9a8-bc741207781d',
              usernameVariable: 'DOCKER_HUB_USERNAME',
              passwordVariable: 'DOCKER_HUB_PASSWORD'
          )]) {
            sh "echo $DOCKER_HUB_PASSWORD | docker login -u $DOCKER_HUB_USERNAME --password-stdin"
            sh "docker push ${env.BACKEND_DOCKER_IMAGE}:${BUILD_NUMBER}"
            sh "docker push ${env.FRONTEND_DOCKER_IMAGE}:${BUILD_NUMBER}"
          }
          echo "Docker images pushed successfully!"
      }
    }
    stage('Deploy') {
      when{
          expression {
            return env.BRANCH_NAME == 'main' && env.CODE_CHANGES == 'true'
          }
      }
      steps {
        script {
          withCredentials([file(credentialsId: 'k3s-kubeconfig', variable: 'KUBECONFIG')]) {
            echo "Deploying to Kubernetes cluster..."
            
            sh "kubectl apply -f k8s/"
            sh "kubectl set image deployment/backend-app backend-app=${env.BACKEND_DOCKER_IMAGE}:${BUILD_NUMBER}"
            sh "kubectl set image deployment/frontend-app frontend-app=${env.FRONTEND_DOCKER_IMAGE}:${BUILD_NUMBER}"
            sh "kubectl rollout status deployment/backend-app --timeout=60s"
            sh "kubectl rollout status deployment/frontend-app --timeout=60s"
          }
        }
      }
    }
  }
  post{
      success {
        echo "Pipeline job finished!"
        echo "Sending success notifications..."
      }
      failure {
        echo "Pipeline job finished!"
        echo "Sending failure notifications..."
      }
  }
}
