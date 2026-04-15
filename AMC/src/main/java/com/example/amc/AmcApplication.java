package com.example.amc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.example.amc.repository")
@ComponentScan(basePackages = {"com.example.amc"})
public class AmcApplication {

	public static void main(String[] args) {
		SpringApplication.run(AmcApplication.class, args);
	}

}
