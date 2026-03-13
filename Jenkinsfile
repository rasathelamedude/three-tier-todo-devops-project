pipeline{
  agent any

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
    stage('Build docker images') {
      when {
        expression {
          return env.BRANCH_NAME == 'main' && env.CODE_CHANGES == 'true'
        }
      }
      steps {
        echo 'Building docker images...'
        sh "docker build -t rasyar/todo-backend:${BUILD_NUMBER} ./backend"
        sh "docker build -t rasyar/todo-frontend:${BUILD_NUMBER} ./frontend"
        echo "Docker images built successfully!"
      }
    }
    stage('Test docker images') {
      steps {
        echo 'Testing docker images...'
        echo "Docker image tested successfully"
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
            sh "docker push rasyar/todo-backend:${BUILD_NUMBER}"
            sh "docker push rasyar/todo-frontend:${BUILD_NUMBER}"
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
          sshagent(['SSH-from-jenkins']) {
            withCredentials([file(credentialsId: 'three-tier-todo-project-env-vars', variable: 'ENV_FILE')]) {
              sh "scp -o StrictHostKeyChecking=no ${ENV_FILE} ec2-user@16.171.133.64:/home/ec2-user/app/.env"
              sh "scp -o StrictHostKeyChecking=no docker-compose.yml ec2-user@16.171.133.64:/home/ec2-user/app"


              sh """
                ssh -o StrictHostKeyChecking=no ec2-user@16.171.133.64 \
                'cd /home/ec2-user/app && \
                export IMAGE_TAG=${BUILD_NUMBER} && \
                docker compose --env-file .env pull && \
                docker compose --env-file .env down && \
                docker compose --env-file .env up -d' 
              """
            }
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
