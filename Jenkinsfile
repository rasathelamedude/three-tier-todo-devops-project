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
