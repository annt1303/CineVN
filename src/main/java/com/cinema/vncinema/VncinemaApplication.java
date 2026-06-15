package com.cinema.vncinema;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VncinemaApplication {

    public static void main(String[] args) {
        SpringApplication.run(VncinemaApplication.class, args);
    }

}
