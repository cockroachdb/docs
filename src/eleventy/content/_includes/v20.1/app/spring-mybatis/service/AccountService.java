package com.example.cockroachdemo.service;

import java.util.Optional;

import com.example.cockroachdemo.model.Account;
import com.example.cockroachdemo.model.BatchResults;

public interface AccountService {
    void createAccountsTable();
    Optional<Account> getAccount(int id);
    BatchResults bulkInsertRandomAccountData(int numberToInsert);
    BatchResults addAccounts(Account...accounts);
    int transferFunds(int fromAccount, int toAccount, int amount);
    long findCountOfAccounts();
    int deleteAllAccounts();
}
