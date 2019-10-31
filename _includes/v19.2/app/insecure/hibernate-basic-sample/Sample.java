package com.cockroachlabs;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.JDBCException;
import org.hibernate.cfg.Configuration;

import java.util.*;
import java.util.function.Function;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

public class Sample {
    // Create a SessionFactory based on our hibernate.cfg.xml configuration
    // file, which defines how to connect to the database.
    private static final SessionFactory sessionFactory =
        new Configuration()
        .configure("hibernate.cfg.xml")
        .addAnnotatedClass(Account.class)
        .buildSessionFactory();

    // Account is our model, which corresponds to the "accounts" database table.
    @Entity
    @Table(name="accounts")
    public static class Account {
        @Id
        @Column(name="id")
        public long id;

        public long getId() {
            return id;
        }

        @Column(name="balance")
        public long balance;
        public long getBalance() {
            return balance;
        }
        public void setBalance(long newBalance) {
            this.balance = newBalance;
        }

        // Convenience constructor.
        public Account(int id, int balance) {
            this.id = id;
            this.balance = balance;
        }

        // Hibernate needs a default (no-arg) constructor to create model objects.
        public Account() {}
    }

    private static Random rand = new Random();
    private static final boolean FORCE_RETRY = false;

    static Function addAccounts(Session s1) throws JDBCException{
        Function f = (Function<Session, Integer>) s -> {
            Integer rv = 0;
            try {
                s.save(new Account(1, 1000));
                s.save(new Account(2, 250));
                s.save(new Account(3, 314159));
                rv = 1;
                System.out.printf("APP: addAccounts() --> %d\n", rv);
            } catch (JDBCException e) {
                rv = -1;
                throw e;
            }
            return rv;
        };
        return f;
    }

    static Function transferFunds(long fromId, long toId, long amount) throws JDBCException{
        Function f = (Function<Session, Long>) s -> {
            long rv = 0;
            try {
                Account fromAccount = (Account) s.get(Account.class, fromId);
                Account toAccount = (Account) s.get(Account.class, toId);
                if (!(amount > fromAccount.getBalance())) {
                    fromAccount.balance -= amount;
                    toAccount.balance += amount;
                    s.save(fromAccount);
                    s.save(toAccount);
                    rv = amount;
                    System.out.printf("APP: transferFunds(%d, %d, %d) --> %d\n", fromId, toId, amount, rv);
                }
            } catch (JDBCException e) {
                rv = -1;
                throw e;
            }
            return rv;
        };
        return f;
    }

    // Test our retry handling logic if FORCE_RETRY is true.  This
    // method is only used to test the retry logic.  It is not
    // necessary in production code.
    static Function testRetryLogic() throws JDBCException {
        Function f = (Function<Session, Integer>) s -> {
            Integer rv = -1;
            try {
                System.out.printf("APP: testRetryLogic: BEFORE EXCEPTION\n");
                s.createNativeQuery("SELECT crdb_internal.force_retry('1s')").executeUpdate();
            } catch (JDBCException e) {
                System.out.printf("APP: testRetryLogic: AFTER EXCEPTION\n");
                throw e;
            }
            return rv;
        };
        return f;
    }

    static Function getAccountBalance(long id) throws JDBCException{
        Function f = (Function<Session, Long>) s -> {
            long balance;
            try {
                Account account = (Account) s.get(Account.class, id);
                balance = account.getBalance();
                System.out.printf("APP: getAccountBalance(%d) --> %d\n", id, balance);
            } catch (JDBCException e) {
                throw e;
            }
            return balance;
        };
        return f;
    }

    // Run SQL code in a way that automatically handles the
    // transaction retry logic so we don't have to duplicate it in
    // various places.
    private static Number runTransaction(Session session, Function<Session, ? extends Number> fn) {
        Number rv = 0;
        int retryCount = 0;
        int MAX_RETRY_COUNT = 6;
        String RETRY_SQL_STATE = "40001";

        while (retryCount < MAX_RETRY_COUNT) {
            if (retryCount > 1) {
                System.out.printf("APP: Entering retry loop again, iteration %d\n", retryCount);
            }

            Transaction txn = session.beginTransaction();
            System.out.printf("APP: BEGIN;\n");

            if (retryCount == MAX_RETRY_COUNT) {
                String err = String.format("hit max of %s retries, aborting", MAX_RETRY_COUNT);
                throw new RuntimeException(err);
            }

            // This block is only used to test the retry logic.
            // It is not necessary in production code.  See also
            // the method 'testRetryLogic()'.
            if (FORCE_RETRY) {
                session.createNativeQuery("SELECT now()").list();
            }

            try {
                rv = fn.apply(session);
                if (rv.intValue() != -1) {
                    txn.commit();
                    System.out.printf("APP: COMMIT;\n");
                    break;
                }
            } catch (JDBCException e) {
                if (RETRY_SQL_STATE.equals(e.getSQLState())) {
                    // Since this is a transaction retry error, we
                    // roll back the transaction and sleep a little
                    // before trying again.  Each time through the
                    // loop we sleep for a little longer than the last
                    // time (A.K.A. exponential backoff).
                    System.out.printf("APP: retryable exception occurred:\n    sql state = [%s]\n    message = [%s]\n    retry counter = %s\n", e.getSQLState(), e.getMessage(), retryCount);
                    System.out.printf("APP: ROLLBACK;\n");
                    retryCount++;
                    txn.rollback();
                    int sleepMillis = (int)(Math.pow(2, retryCount) * 100) + rand.nextInt(100);
                    System.out.printf("APP: Hit 40001 transaction retry error, sleeping %s milliseconds\n", sleepMillis);
                    try {
                        Thread.sleep(sleepMillis);
                    } catch (InterruptedException ignored) {
                        // Necessary to allow the retry loop to continue.
                    }
                    rv = -1;
                } else {
                    rv = -1;
                    throw e;
                }
            }
        }
        return rv;
    }

    public static void main(String[] args) {
        Session session = sessionFactory.openSession();
        try {
            long fromAccountId = 1;
            long toAccountId = 2;
            long transferAmount = 100;

            if (FORCE_RETRY) {
                System.out.printf("APP: About to test retry logic in 'runTransaction'\n");
                runTransaction(session, testRetryLogic());
            } else {

                runTransaction(session, addAccounts(session));
                Number fromBalance = runTransaction(session, getAccountBalance(fromAccountId));
                Number toBalance = runTransaction(session, getAccountBalance(toAccountId));
                if (fromBalance.intValue() != -1 && toBalance.intValue() != -1) {
                    // Success!
                    System.out.printf("APP: getAccountBalance(%d) --> %d\n", fromAccountId, fromBalance);
                    System.out.printf("APP: getAccountBalance(%d) --> %d\n", toAccountId, toBalance);
                }

                // Transfer $100 from account 1 to account 2
                Number transferResult = runTransaction(session, transferFunds(fromAccountId, toAccountId, transferAmount));
                if (transferResult.intValue() != -1) {
                    // Success!
                    System.out.printf("APP: transferFunds(%d, %d, %d) --> %d \n", fromAccountId, toAccountId, transferAmount, transferResult);

                    Number fromBalanceAfter = runTransaction(session, getAccountBalance(fromAccountId));
                    Number toBalanceAfter = runTransaction(session, getAccountBalance(toAccountId));
                    if (fromBalanceAfter.intValue() != -1 && toBalanceAfter.intValue() != -1) {
                        // Success!
                        System.out.printf("APP: getAccountBalance(%d) --> %d\n", fromAccountId, fromBalanceAfter);
                        System.out.printf("APP: getAccountBalance(%d) --> %d\n", toAccountId, toBalanceAfter);
                    }
                }
            }
        } finally {
            session.close();
            sessionFactory.close();
        }
    }
}
