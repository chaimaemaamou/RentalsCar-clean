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
                docker build -t ${BACKEND_IMAGE}:latest ./AMC
                docker build -t ${FRONTEND_IMAGE}:latest ./AMC-Front
                '''
            }
        }

        stage('Trivy Scan') {
    steps {
        sh '''
        echo "===== Scan Backend ====="
        trivy image --severity CRITICAL ${BACKEND_IMAGE}:latest

        echo "===== Scan Frontend ====="
        trivy image --severity CRITICAL ${FRONTEND_IMAGE}:latest
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

                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:latest

                    docker logout
                    '''
                }
            }
        }

        stage('Success') {
            steps {
                echo 'Pipeline completed successfully!'
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Build, Scan and Push completed.'
        }

        failure {
            echo 'FAILED: Trivy found CRITICAL vulnerabilities or another stage failed.'
        }
    }
}
