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
    }
}
