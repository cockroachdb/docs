package com.example.cockroachdemo;

import java.time.LocalTime;

import com.example.cockroachdemo.model.Account;
import com.example.cockroachdemo.model.BatchResults;
import com.example.cockroachdemo.service.AccountService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class BasicExample implements CommandLineRunner {
    @Autowired
    private AccountService accountService;

    @Override
    public void run(String... args) throws Exception {
        accountService.createAccountsTable();
        deleteAllAccounts();
        insertAccounts();
        printNumberOfAccounts();
        printBalances();
        transferFunds();
        printBalances();
        bulkInsertRandomAccountData();
        printNumberOfAccounts();
    }

    private void deleteAllAccounts() {
		int numDeleted = accountService.deleteAllAccounts();
		System.out.printf("deleteAllAccounts:\n    => %s total deleted accounts\n", numDeleted);
    }

    private void insertAccounts() {
		Account account1 = new Account();
		account1.setId(1);
		account1.setBalance(1000);

		Account account2 = new Account();
		account2.setId(2);
		account2.setBalance(250);
		BatchResults results = accountService.addAccounts(account1, account2);
		System.out.printf("insertAccounts:\n    => %s total new accounts in %s batches\n", results.getTotalRowsAffected(), results.getNumberOfBatches());
    }
    
    private void printBalances() {
        int balance1 = accountService.getAccount(1).map(Account::getBalance).orElse(-1);
        int balance2 = accountService.getAccount(2).map(Account::getBalance).orElse(-1);

        System.out.printf("printBalances:\n    => Account balances at time '%s':\n    ID %s => $%s\n    ID %s => $%s\n",
            LocalTime.now(), 1, balance1, 2, balance2);
    }

    private void printNumberOfAccounts() {
        System.out.printf("printNumberOfAccounts:\n    => Number of accounts at time '%s':\n    => %s total accounts\n",
            LocalTime.now(), accountService.findCountOfAccounts());
    }

    private void transferFunds() {
        int fromAccount = 1;
        int toAccount = 2;
        int transferAmount = 100;
        int transferredAccounts = accountService.transferFunds(fromAccount, toAccount, transferAmount);
        System.out.printf("transferFunds:\n    => $%s transferred between accounts %s and %s, %s rows updated\n",
            transferAmount, fromAccount, toAccount, transferredAccounts);
    }

    private void bulkInsertRandomAccountData() {
        BatchResults results = accountService.bulkInsertRandomAccountData(500);
        System.out.printf("bulkInsertRandomAccountData:\n    => finished, %s total rows inserted in %s batches\n",
            results.getTotalRowsAffected(), results.getNumberOfBatches());
    }
}
