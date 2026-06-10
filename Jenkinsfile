pipeline {
    agent any
    
    stages {
        stage('Clean Old Images') {
            steps {
                script {
                    sh 'docker system prune -f'
                }
            }
        }
        
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
        
        stage('Deploy') {
            steps {
                script {
                    sh 'docker-compose down --remove-orphans'
                    sh 'docker-compose up -d --force-recreate'
                }
            }
        }
        
        stage('Clean Up') {
            steps {
                script {
                    sh 'docker image prune -f'
                }
            }
        }
    }
}
