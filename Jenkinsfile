pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "chomiiii"
        BACKEND_IMAGE = "chomiiii/rentalscar-backend"
        FRONTEND_IMAGE = "chomiiii/rentalscar-frontend"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('AMC') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                docker build -t $BACKEND_IMAGE:latest ./AMC
                docker build -t $FRONTEND_IMAGE:latest ./AMC-Front
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                trivy image --severity HIGH,CRITICAL $BACKEND_IMAGE:latest
                trivy image --severity HIGH,CRITICAL $FRONTEND_IMAGE:latest
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                    docker push $BACKEND_IMAGE:latest
                    docker push $FRONTEND_IMAGE:latest

                    docker logout
                    '''
                }
            }
        }

        stage('Success') {
            steps {
                echo 'Images pushed successfully to Docker Hub!'
            }
        }
    }
}
