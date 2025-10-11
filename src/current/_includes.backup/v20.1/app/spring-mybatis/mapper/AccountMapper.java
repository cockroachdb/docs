package com.example.cockroachdemo.mapper;

import java.util.List;
import java.util.Optional;

import com.example.cockroachdemo.model.Account;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface AccountMapper {
    @Delete("delete from accounts")
    int deleteAllAccounts();

    @Update("update accounts set balance=#{balance} where id=${id}")
    void updateAccount(Account account);

    @Select("select id, balance from accounts where id=#{id}")
    Optional<Account> findAccountById(int id);

    @Select("select id, balance from accounts order by id")
    List<Account> findAllAccounts();

    @Update({
        "upsert into accounts (id, balance) values",
        "(#{fromId}, ((select balance from accounts where id = #{fromId}) - #{amount})),",
        "(#{toId}, ((select balance from accounts where id = #{toId}) + #{amount}))",
    })
    int transfer(@Param("fromId") int fromId, @Param("toId") int toId, @Param("amount") int amount);

    @Update("CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT, CONSTRAINT balance_gt_0 CHECK (balance >= 0))")
    void createAccountsTable();

    @Select("select count(*) from accounts")
    Long findCountOfAccounts();
}
