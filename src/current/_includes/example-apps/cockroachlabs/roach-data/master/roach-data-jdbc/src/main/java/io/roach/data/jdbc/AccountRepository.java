package io.roach.data.jdbc;

import java.math.BigDecimal;

import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
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
public interface AccountRepository extends CrudRepository<Account, Long>, PagedAccountRepository {
    @Query(value = "SELECT balance FROM account WHERE id=:id FOR UPDATE")
    BigDecimal getBalance(@Param("id") Long id);

    @Modifying
    @Query("UPDATE account SET balance = balance + :balance WHERE id=:id")
    void updateBalance(@Param("id") Long id, @Param("balance") BigDecimal balance);
}
