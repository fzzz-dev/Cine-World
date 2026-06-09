pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo "Code cloned successfully"
            }
        }
        
        stage('Build Backend Image') {
            steps {
                script {
                    docker.build("cineworld-backend:latest", "./server")
                }
            }
        }
    }
}
