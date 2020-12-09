package io.roach.data.jdbc;

import java.math.BigDecimal;


import org.springframework.data.domain.Page;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.transaction.annotation.Propagation.MANDATORY;

/**
 * The main account repository, notice there's no implementation needed since its auto-proxied by
 * spring-data.
 */
@Repository
@Transactional(propagation = MANDATORY)
public interface AccountRepository extends PagingAndSortingRepository<Account, Long> {

    @Query("SELECT * FROM account LIMIT :pageSize OFFSET :offset")
    Page<Account> findAll(@Param("pageSize") int pageSize, @Param("offset") long offset);

    @Query("SELECT count(id) FROM account")
    long countAll();

    @Query(value = "SELECT balance FROM account WHERE id=:id")
    BigDecimal getBalance(@Param("id") Long id);

    @Modifying
    @Query("UPDATE account SET balance = balance + :balance WHERE id=:id")
    void updateBalance(@Param("id") Long id, @Param("balance") BigDecimal balance);
}
