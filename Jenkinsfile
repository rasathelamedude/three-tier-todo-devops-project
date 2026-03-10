pipeline{
  agent any
  environment {
    CODE_CHANGES = getGitChanges()
    DOCKER_HUB_CREDENTIALS = credentials('46c78a62-3b4a-4a17-a9a8-bc741207781d') // Docker hub 
  }
  stages {
    stage('Build docker images') {
      when {
        expression {
          ${{ BRANCH_NAME }} == 'dev' || ${{ BRANCH_NAME }} == 'main' || ${{ CODE_CHANGES }} == 'true'
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
        echo 'Running the docker images with docker compose...'
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
