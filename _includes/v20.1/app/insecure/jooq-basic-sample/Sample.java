package com.cockroachlabs;

import com.cockroachlabs.example.jooq.db.Tables;
import com.cockroachlabs.example.jooq.db.tables.records.AccountsRecord;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.Source;
import org.jooq.conf.RenderQuotedNames;
import org.jooq.conf.Settings;
import org.jooq.exception.DataAccessException;
import org.jooq.impl.DSL;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Function;

import static com.cockroachlabs.example.jooq.db.Tables.ACCOUNTS;

public class Sample {

    private static final Random RAND = new Random();
    private static final boolean FORCE_RETRY = false;
    private static final String RETRY_SQL_STATE = "40001";
    private static final int MAX_ATTEMPT_COUNT = 6;

    private static Function<DSLContext, Long> addAccounts() {
        return ctx -> {
            long rv = 0;

            ctx.delete(ACCOUNTS).execute();
            ctx.batchInsert(
                new AccountsRecord(1L,   1000L),
                new AccountsRecord(2L,    250L),
                new AccountsRecord(3L, 314159L)
            ).execute();

            rv = 1;
            System.out.printf("APP: addAccounts() --> %d\n", rv);
            return rv;
        };
    }

    private static Function<DSLContext, Long> transferFunds(long fromId, long toId, long amount) {
        return ctx -> {
            long rv = 0;

            AccountsRecord fromAccount = ctx.fetchSingle(ACCOUNTS, ACCOUNTS.ID.eq(fromId));
            AccountsRecord toAccount = ctx.fetchSingle(ACCOUNTS, ACCOUNTS.ID.eq(toId));

            if (!(amount > fromAccount.getBalance())) {
                fromAccount.setBalance(fromAccount.getBalance() - amount);
                toAccount.setBalance(toAccount.getBalance() + amount);

                ctx.batchUpdate(fromAccount, toAccount).execute();
                rv = amount;
                System.out.printf("APP: transferFunds(%d, %d, %d) --> %d\n", fromId, toId, amount, rv);
            }

            return rv;
        };
    }

    // Test our retry handling logic if FORCE_RETRY is true.  This
    // method is only used to test the retry logic.  It is not
    // intended for production code.
    private static Function<DSLContext, Long> forceRetryLogic() {
        return ctx -> {
            long rv = -1;
            try {
                System.out.printf("APP: testRetryLogic: BEFORE EXCEPTION\n");
                ctx.execute("SELECT crdb_internal.force_retry('1s')");
            } catch (DataAccessException e) {
                System.out.printf("APP: testRetryLogic: AFTER EXCEPTION\n");
                throw e;
            }
            return rv;
        };
    }

    private static Function<DSLContext, Long> getAccountBalance(long id) {
        return ctx -> {
            AccountsRecord account = ctx.fetchSingle(ACCOUNTS, ACCOUNTS.ID.eq(id));
            long balance = account.getBalance();
            System.out.printf("APP: getAccountBalance(%d) --> %d\n", id, balance);
            return balance;
        };
    }

    // Run SQL code in a way that automatically handles the
    // transaction retry logic so we don't have to duplicate it in
    // various places.
    private static long runTransaction(DSLContext session, Function<DSLContext, Long> fn) {
        AtomicLong rv = new AtomicLong(0L);
        AtomicInteger attemptCount = new AtomicInteger(0);

        while (attemptCount.get() < MAX_ATTEMPT_COUNT) {
            attemptCount.incrementAndGet();

            if (attemptCount.get() > 1) {
                System.out.printf("APP: Entering retry loop again, iteration %d\n", attemptCount.get());
            }

            if (session.connectionResult(connection -> {
                connection.setAutoCommit(false);
                System.out.printf("APP: BEGIN;\n");

                if (attemptCount.get() == MAX_ATTEMPT_COUNT) {
                    String err = String.format("hit max of %s attempts, aborting", MAX_ATTEMPT_COUNT);
                    throw new RuntimeException(err);
                }

                // This block is only used to test the retry logic.
                // It is not necessary in production code.  See also
                // the method 'testRetryLogic()'.
                if (FORCE_RETRY) {
                    session.fetch("SELECT now()");
                }

                try {
                    rv.set(fn.apply(session));
                    if (rv.get() != -1) {
                        connection.commit();
                        System.out.printf("APP: COMMIT;\n");
                        return true;
                    }
                } catch (DataAccessException | SQLException e) {
                    String sqlState = e instanceof SQLException ? ((SQLException) e).getSQLState() : ((DataAccessException) e).sqlState();

                    if (RETRY_SQL_STATE.equals(sqlState)) {
                        // Since this is a transaction retry error, we
                        // roll back the transaction and sleep a little
                        // before trying again.  Each time through the
                        // loop we sleep for a little longer than the last
                        // time (A.K.A. exponential backoff).
                        System.out.printf("APP: retryable exception occurred:\n    sql state = [%s]\n    message = [%s]\n    retry counter = %s\n", sqlState, e.getMessage(), attemptCount.get());
                        System.out.printf("APP: ROLLBACK;\n");
                        connection.rollback();
                        int sleepMillis = (int)(Math.pow(2, attemptCount.get()) * 100) + RAND.nextInt(100);
                        System.out.printf("APP: Hit 40001 transaction retry error, sleeping %s milliseconds\n", sleepMillis);
                        try {
                            Thread.sleep(sleepMillis);
                        } catch (InterruptedException ignored) {
                            // no-op
                        }
                        rv.set(-1L);
                    } else {
                        throw e;
                    }
                }

                return false;
            })) {
                break;
            }
        }

        return rv.get();
    }

    public static void main(String[] args) throws Exception {
        try (Connection connection = DriverManager.getConnection(
                "jdbc:postgresql://localhost:26257/bank?sslmode=disable",
                "maxroach",
                ""
        )) {
            DSLContext ctx = DSL.using(connection, SQLDialect.COCKROACHDB, new Settings()
                .withExecuteLogging(true)
                .withRenderQuotedNames(RenderQuotedNames.NEVER));

            // Initialise database with db.sql script
            try (InputStream in = Sample.class.getResourceAsStream("/db.sql")) {
                ctx.parser().parse(Source.of(in).readString()).executeBatch();
            }

            long fromAccountId = 1;
            long toAccountId = 2;
            long transferAmount = 100;

            if (FORCE_RETRY) {
                System.out.printf("APP: About to test retry logic in 'runTransaction'\n");
                runTransaction(ctx, forceRetryLogic());
            } else {

                runTransaction(ctx, addAccounts());
                long fromBalance = runTransaction(ctx, getAccountBalance(fromAccountId));
                long toBalance = runTransaction(ctx, getAccountBalance(toAccountId));
                if (fromBalance != -1 && toBalance != -1) {
                    // Success!
                    System.out.printf("APP: getAccountBalance(%d) --> %d\n", fromAccountId, fromBalance);
                    System.out.printf("APP: getAccountBalance(%d) --> %d\n", toAccountId, toBalance);
                }

                // Transfer $100 from account 1 to account 2
                long transferResult = runTransaction(ctx, transferFunds(fromAccountId, toAccountId, transferAmount));
                if (transferResult != -1) {
                    // Success!
                    System.out.printf("APP: transferFunds(%d, %d, %d) --> %d \n", fromAccountId, toAccountId, transferAmount, transferResult);

                    long fromBalanceAfter = runTransaction(ctx, getAccountBalance(fromAccountId));
                    long toBalanceAfter = runTransaction(ctx, getAccountBalance(toAccountId));
                    if (fromBalanceAfter != -1 && toBalanceAfter != -1) {
                        // Success!
                        System.out.printf("APP: getAccountBalance(%d) --> %d\n", fromAccountId, fromBalanceAfter);
                        System.out.printf("APP: getAccountBalance(%d) --> %d\n", toAccountId, toBalanceAfter);
                    }
                }
            }
        }
    }
}
