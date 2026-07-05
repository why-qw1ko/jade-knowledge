package com.jade;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchDataAutoConfiguration;
import org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchClientAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchRestClientAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {
        ElasticsearchDataAutoConfiguration.class,
        ElasticsearchRestClientAutoConfiguration.class,
        ElasticsearchClientAutoConfiguration.class,
        ElasticsearchRepositoriesAutoConfiguration.class
})
@MapperScan("com.jade.mapper")
@EnableScheduling
public class JadeKnowledgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(JadeKnowledgeApplication.class, args);
    }
}
