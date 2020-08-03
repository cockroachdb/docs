package com.example.cockroachdemo.batchmapper;

import java.util.List;

import com.example.cockroachdemo.model.Account;

import org.apache.ibatis.annotations.Flush;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.executor.BatchResult;

@Mapper
public interface BatchAccountMapper {
    @Insert("upsert into accounts(id, balance) values(#{id}, #{balance})")
    void insertAccount(Account account);

    @Flush
    List<BatchResult> flush();
}
