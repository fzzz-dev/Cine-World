pipeline {
    agent any
    
    stages {
        stage('Build Backend') {
            steps {
                script {
                    docker.build("cineworld-backend:prod", "-f ./server/Dockerfile.prod ./server")
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                script {
                    docker.build("cineworld-frontend:prod", "-f ./client/Dockerfile.prod ./client")
                }
            }
        }
        
        stage('Deploy with Compose') {
            steps {
                script {
                    sh 'docker-compose down'
                    sh 'docker-compose up -d'
                }
            }
        }
    }
}
