package io.roach.data.jdbc;

import java.math.BigDecimal;

import org.springframework.data.annotation.Id;

/**
 * Domain entity mapped to the account table.
 */
public class Account {
    @Id
    private Long id;

    private String name;

    private AccountType type;

    private BigDecimal balance;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public AccountType getType() {
        return type;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}
