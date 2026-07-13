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

        stage('Build Docker Images') {
    steps {
        sh '''
        docker build -t rentalscar-backend ./AMC
        docker build -t rentalscar-frontend ./AMC-Front
        '''
    }
}

        stage('Success') {
            steps {
                echo 'Build completed successfully!'
            }
        }
    }
}
