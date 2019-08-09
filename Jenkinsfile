pipeline {
    agent {
        docker {
            image 'node:6-alpine'
            args '-p 3000:3000'
        }
    }
    stages {
        stage('Install') {
            steps {
                sh 'yarn install'
            }
        }
        stage('Test') { 
            steps {
                sh 'yarn test'
            }
        }
        stage('Build') { 
            steps {
                sh 'yarn build'
            }
        }
    }
}
