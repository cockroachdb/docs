package com.cockroachlabs;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Random;
import java.util.function.Function;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.JDBCException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;

public class Sample implements Serializable {

    private static final Random RAND = new Random();
    private static final boolean FORCE_RETRY = false;
    private static final String RETRY_SQL_STATE = "40001";
    private static final int MAX_ATTEMPT_COUNT = 6;

    private static Function<Session, BigDecimal> addAccounts() throws JDBCException {
        Function<Session, BigDecimal> f = s -> {
            BigDecimal rv = new BigDecimal(0);
            try {
                s.save(new Account(1, 1000));
                s.save(new Account(2, 250));
                s.save(new Account(3, 314159));
                rv = BigDecimal.valueOf(1);
                System.out.printf("APP: addAccounts() --> %.2f\n", rv);
            } catch (JDBCException e) {
                throw e;
            }
            return rv;
        };
        return f;
    }

    private static Function<Session, BigDecimal> transferFunds(long fromId, long toId, BigDecimal amount) throws JDBCException {
        Function<Session, BigDecimal> f = s -> {
            BigDecimal rv = new BigDecimal(0);
            try {
                Account fromAccount = (Account) s.get(Account.class, fromId);
                Account toAccount = (Account) s.get(Account.class, toId);
                if (!(amount.compareTo(fromAccount.getBalance()) > 0)) {
                    fromAccount.balance = fromAccount.balance.subtract(amount);
                    toAccount.balance = toAccount.balance.add(amount);
                    s.save(fromAccount);
                    s.save(toAccount);
                    rv = amount;
                    System.out.printf("APP: transferFunds(%d, %d, %.2f) --> %.2f\n", fromId, toId, amount, rv);
                }
            } catch (JDBCException e) {
                throw e;
            }
            return rv;
        };
        return f;
    }

    // Test our retry handling logic if FORCE_RETRY is true.  This
    // method is only used to test the retry logic.  It is not
    // intended for production code.
    private static Function<Session, BigDecimal> forceRetryLogic() throws JDBCException {
        Function<Session, BigDecimal> f = s -> {
            BigDecimal rv = new BigDecimal(-1);
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

    private static Function<Session, BigDecimal> getAccountBalance(long id) throws JDBCException {
        Function<Session, BigDecimal> f = s -> {
            BigDecimal balance;
            try {
                Account account = s.get(Account.class, id);
                balance = account.getBalance();
                System.out.printf("APP: getAccountBalance(%d) --> %.2f\n", id, balance);
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
    private static BigDecimal runTransaction(Session session, Function<Session, BigDecimal> fn) {
        BigDecimal rv = new BigDecimal(0);
        int attemptCount = 0;

        while (attemptCount < MAX_ATTEMPT_COUNT) {
            attemptCount++;

            if (attemptCount > 1) {
                System.out.printf("APP: Entering retry loop again, iteration %d\n", attemptCount);
            }

            Transaction txn = session.beginTransaction();
            System.out.printf("APP: BEGIN;\n");

            if (attemptCount == MAX_ATTEMPT_COUNT) {
                String err = String.format("hit max of %s attempts, aborting", MAX_ATTEMPT_COUNT);
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
                if (!rv.equals(-1)) {
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
                    System.out.printf("APP: retryable exception occurred:\n    sql state = [%s]\n    message = [%s]\n    retry counter = %s\n", e.getSQLState(), e.getMessage(), attemptCount);
                    System.out.printf("APP: ROLLBACK;\n");
                    txn.rollback();
                    int sleepMillis = (int) (Math.pow(2, attemptCount) * 100) + RAND.nextInt(100);
                    System.out.printf("APP: Hit 40001 transaction retry error, sleeping %s milliseconds\n", sleepMillis);
                    try {
                        Thread.sleep(sleepMillis);
                    } catch (InterruptedException ignored) {
                        // no-op
                    }
                    rv = BigDecimal.valueOf(-1);
                } else {
                    throw e;
                }
            }
        }
        return rv;
    }

    public static void main(String[] args) {
        // Create a SessionFactory based on our hibernate.cfg.xml configuration
        // file, which defines how to connect to the database.
        SessionFactory sessionFactory
                = new Configuration()
                        .configure("hibernate.cfg.xml")
                        .addAnnotatedClass(Account.class)
                        .buildSessionFactory();

        try (Session session = sessionFactory.openSession()) {
            long fromAccountId = 1;
            long toAccountId = 2;
            BigDecimal transferAmount = BigDecimal.valueOf(100);

            if (FORCE_RETRY) {
                System.out.printf("APP: About to test retry logic in 'runTransaction'\n");
                runTransaction(session, forceRetryLogic());
            } else {

                runTransaction(session, addAccounts());
                BigDecimal fromBalance = runTransaction(session, getAccountBalance(fromAccountId));
                BigDecimal toBalance = runTransaction(session, getAccountBalance(toAccountId));
                if (!fromBalance.equals(-1) && !toBalance.equals(-1)) {
                    // Success!
                    System.out.printf("APP: getAccountBalance(%d) --> %.2f\n", fromAccountId, fromBalance);
                    System.out.printf("APP: getAccountBalance(%d) --> %.2f\n", toAccountId, toBalance);
                }

                // Transfer $100 from account 1 to account 2
                BigDecimal transferResult = runTransaction(session, transferFunds(fromAccountId, toAccountId, transferAmount));
                if (!transferResult.equals(-1)) {
                    // Success!
                    System.out.printf("APP: transferFunds(%d, %d, %.2f) --> %.2f \n", fromAccountId, toAccountId, transferAmount, transferResult);

                    BigDecimal fromBalanceAfter = runTransaction(session, getAccountBalance(fromAccountId));
                    BigDecimal toBalanceAfter = runTransaction(session, getAccountBalance(toAccountId));
                    if (!fromBalanceAfter.equals(-1) && !toBalanceAfter.equals(-1)) {
                        // Success!
                        System.out.printf("APP: getAccountBalance(%d) --> %.2f\n", fromAccountId, fromBalanceAfter);
                        System.out.printf("APP: getAccountBalance(%d) --> %.2f\n", toAccountId, toBalanceAfter);
                    }
                }
            }
        } finally {
            sessionFactory.close();
        }
    }
}
