package io.roach.data.jdbc;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PagedAccountHelper extends org.springframework.data.repository.Repository<Account, Long> {
    @Query("SELECT * FROM account LIMIT :pageSize OFFSET :offset")
    List<Account> findAll(@Param("pageSize") int pageSize, @Param("offset") long offset);

    @Query("SELECT count(id) FROM account")
    long countAll();
}
