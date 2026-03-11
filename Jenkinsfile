pipeline{
  agent any
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
          return env.BRANCH_NAME == 'main'
        }
      }
      steps {
        echo 'Building docker images...'
        sh "docker build -t rasyar/todo-backend:1.0 ./backend"
        sh "docker build -t rasyar/todo-frontend:1.0 ./frontend"
        echo "Docker images built successfully!"
      }
    }
    stage('Test docker images') {
      steps {
        echo 'Testing docker images...'
      }
    }
    stage("Push docker images to docker hub") {
      when{
          equals expected: 'main', actual: env.BRANCH_NAME
      }
      steps{
          echo "Pushing docker images..."
          withCredentials([usernamePassword(
              credentialsId: '46c78a62-3b4a-4a17-a9a8-bc741207781d',
              usernameVariable: 'DOCKER_HUB_USERNAME',
              passwordVariable: 'DOCKER_HUB_PASSWORD'
          )]) {
            sh "echo $DOCKER_HUB_PASSWORD | docker login -u $DOCKER_HUB_USERNAME --password-stdin"
            sh "docker push rasyar/todo-backend:1.0"
            sh "docker push rasyar/todo-frontend:1.0"
          }
          echo "Docker images pushed successfully!"
      }
    }
    stage('Deploy') {
      when{
          equals expected: 'main', actual: env.BRANCH_NAME
      }
      steps {
        echo 'Deploying the Docker images with Docker Compose...'
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
