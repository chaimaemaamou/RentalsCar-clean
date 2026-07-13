pipeline {
    agent any

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

        stage('Build Backend Docker Image') {
            steps {
                sh 'docker build -t rentalscar-backend ./AMC'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh 'docker build -t rentalscar-frontend ./AMC-Front'
            }
        }

        stage('Success') {
            steps {
                echo 'Build completed successfully!'
            }
        }
    }
}
