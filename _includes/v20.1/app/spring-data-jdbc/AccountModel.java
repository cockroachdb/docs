package io.roach.data.jdbc;

import java.math.BigDecimal;

import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;

/**
 * Account resource represented in HAL+JSON via REST API.
 */
@Relation(value = "account", collectionRelation = "accounts")
public class AccountModel extends RepresentationModel<AccountModel> {
    private String name;

    private AccountType type;

    private BigDecimal balance;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AccountType getType() {
        return type;
    }

    public void setType(AccountType type) {
        this.type = type;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}
