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
          return env.BRANCH_NAME == 'dev' || env.BRANCH_NAME == 'main'
        }
      }
      steps {
        echo 'Building...'
      }
    }
    stage('Test docker images') {
      steps {
        echo 'Testing docker images...'
      }
    }
    stage("Push docker images to docker hub") {
      steps{
          echo "Pushing..."
      }
    }
    stage('Deploy') {
      when{
          expression {
            BRANCH_NAME == 'main'
          }
      }
      steps {
        echo 'Running the Docker images with Docker Compose...'
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
