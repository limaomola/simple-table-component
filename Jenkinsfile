pippipeline {
    agent {
        docker {
            image 'node:6-alpine'
        }
    }
    stages {
        stage('install') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') { 
            steps {
                sh 'npm test'
            }
        }
        stage('Build') { 
            steps {
                sh 'npm build'
            }
        }
    }
}
