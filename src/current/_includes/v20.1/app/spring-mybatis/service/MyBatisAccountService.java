package com.example.cockroachdemo.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import com.example.cockroachdemo.batchmapper.BatchAccountMapper;
import com.example.cockroachdemo.mapper.AccountMapper;
import com.example.cockroachdemo.model.Account;
import com.example.cockroachdemo.model.BatchResults;

import org.apache.ibatis.executor.BatchResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MyBatisAccountService implements AccountService {
    @Autowired
    private AccountMapper mapper;
    @Autowired
    private BatchAccountMapper batchMapper;
    private Random random = new Random();

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createAccountsTable() {
        mapper.createAccountsTable();
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public BatchResults addAccounts(Account...accounts) {
        for (Account account : accounts) {
            batchMapper.insertAccount(account);
        }
        List<BatchResult> results = batchMapper.flush();

        return new BatchResults(1, calculateRowsAffectedBySingleBatch(results));
    }

    private int calculateRowsAffectedBySingleBatch(List<BatchResult> results) {
        return results.stream()
            .map(BatchResult::getUpdateCounts)
            .flatMapToInt(Arrays::stream)
            .sum();
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public BatchResults bulkInsertRandomAccountData(int numberToInsert) {
        int BATCH_SIZE = 128;
        List<List<BatchResult>> results = new ArrayList<>();

        for (int i = 0; i < numberToInsert; i++) {
            Account account = new Account();
            account.setId(random.nextInt(1000000000));
            account.setBalance(random.nextInt(1000000000));
            batchMapper.insertAccount(account);
            if ((i + 1) % BATCH_SIZE == 0) {
                results.add(batchMapper.flush());
            }
        }
        if(numberToInsert % BATCH_SIZE != 0) {
            results.add(batchMapper.flush());
        }
        return new BatchResults(results.size(), calculateRowsAffectedByMultipleBatches(results));
    }

    private int calculateRowsAffectedByMultipleBatches(List<List<BatchResult>> results) {
        return results.stream()
            .mapToInt(this::calculateRowsAffectedBySingleBatch)
            .sum();
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<Account> getAccount(int id) {
        return mapper.findAccountById(id);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int transferFunds(int fromId, int toId, int amount) {
        return mapper.transfer(fromId, toId, amount);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public long findCountOfAccounts() {
        return mapper.findCountOfAccounts();
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int deleteAllAccounts() {
        return mapper.deleteAllAccounts();
    }
}
