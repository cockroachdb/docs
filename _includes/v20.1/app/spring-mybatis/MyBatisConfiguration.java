package com.example.cockroachdemo;

import javax.sql.DataSource;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.session.ExecutorType;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * This class configures MyBatis and sets up mappers for injection.
 * 
 * When using the Spring Boot Starter, using a class like this is completely optional unless you need to
 * have some mappers use the BATCH executor (as we do in this demo). If you don't have that requirement,
 * then you can remove this class. By Default, the MyBatis Spring Boot Starter will find all mappers
 * annotated with @Mapper and will automatically wire your Datasource to the underlying MyBatis
 * infrastructure.
 */
@Configuration
@MapperScan(basePackages = "com.example.cockroachdemo.mapper", annotationClass = Mapper.class)
@MapperScan(basePackages = "com.example.cockroachdemo.batchmapper", annotationClass = Mapper.class,
            sqlSessionTemplateRef = "batchSqlSessionTemplate")
public class MyBatisConfiguration {

    @Autowired
    private DataSource dataSource;

    @Bean
    public SqlSessionFactory sqlSessionFactory() throws Exception {
        SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
        factory.setDataSource(dataSource);
        return factory.getObject();
    }

    @Bean
    @Primary
    public SqlSessionTemplate sqlSessionTemplate() throws Exception {
        return new SqlSessionTemplate(sqlSessionFactory());
    }

    @Bean(name = "batchSqlSessionTemplate")
    public SqlSessionTemplate batchSqlSessionTemplate() throws Exception {
        return new SqlSessionTemplate(sqlSessionFactory(), ExecutorType.BATCH);
    }
}
