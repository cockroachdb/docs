import java.util.*;
import java.time.*;
import java.sql.*;
import javax.sql.DataSource;

import org.postgresql.ds.PGSimpleDataSource;

/*
  Download the Postgres JDBC driver jar from https://jdbc.postgresql.org.

  Then, compile and run this example like so:

  $ export CLASSPATH=.:/path/to/postgresql.jar
  $ javac BasicExample.java && java BasicExample

  To build the javadoc:

  $ javadoc -package -cp .:./path/to/postgresql.jar BasicExample.java

  At a high level, this code consists of two classes:

  1. BasicExample, which is where the application logic lives.

  2. BasicExampleDAO, which is used by the application to access the
     data store.

*/

public class BasicExample {

    public static void main(String[] args) {

        // Configure the database connection.
        PGSimpleDataSource ds = new PGSimpleDataSource();
        ds.setServerName("localhost");
        ds.setPortNumber(26257);
        ds.setDatabaseName("bank");
        ds.setUser("maxroach");
        ds.setPassword(null);
        ds.setReWriteBatchedInserts(true); // add `rewriteBatchedInserts=true` to pg connection string
        ds.setApplicationName("BasicExample");

        // Create DAO.
        BasicExampleDAO dao = new BasicExampleDAO(ds);

        // Test our retry handling logic if FORCE_RETRY is true.  This
        // method is only used to test the retry logic.  It is not
        // necessary in production code.
        dao.testRetryHandling();

        // Set up the 'accounts' table.
        dao.createAccounts();

        // Insert a few accounts "by hand", using INSERTs on the backend.
        Map<String, String> balances = new HashMap<String, String>();
        balances.put("1", "1000");
        balances.put("2", "250");
        int updatedAccounts = dao.updateAccounts(balances);
        System.out.printf("BasicExampleDAO.updateAccounts:\n    => %s total updated accounts\n", updatedAccounts);

        // How much money is in these accounts?
        int balance1 = dao.getAccountBalance(1);
        int balance2 = dao.getAccountBalance(2);
        System.out.printf("main:\n    => Account balances at time '%s':\n    ID %s => $%s\n    ID %s => $%s\n", LocalTime.now(), 1, balance1, 2, balance2);

        // Transfer $100 from account 1 to account 2
        int fromAccount = 1;
        int toAccount = 2;
        int transferAmount = 100;
        int transferredAccounts = dao.transferFunds(fromAccount, toAccount, transferAmount);
        if (transferredAccounts != -1) {
            System.out.printf("BasicExampleDAO.transferFunds:\n    => $%s transferred between accounts %s and %s, %s rows updated\n", transferAmount, fromAccount, toAccount, transferredAccounts);
        }

        balance1 = dao.getAccountBalance(1);
        balance2 = dao.getAccountBalance(2);
        System.out.printf("main:\n    => Account balances at time '%s':\n    ID %s => $%s\n    ID %s => $%s\n", LocalTime.now(), 1, balance1, 2, balance2);

        // Bulk insertion example using JDBC's batching support.
        int totalRowsInserted = dao.bulkInsertRandomAccountData();
        System.out.printf("\nBasicExampleDAO.bulkInsertRandomAccountData:\n    => finished, %s total rows inserted\n", totalRowsInserted);

        // Print out 10 account values.
        int accountsRead = dao.readAccounts(10);

        // Drop the 'accounts' table so this code can be run again.
        dao.tearDown();
    }
}

/**
 * Data access object used by 'BasicExample'.  Abstraction over some
 * common CockroachDB operations, including:
 *
 * - Auto-handling transaction retries in the 'runSQL' method
 *
 * - Example of bulk inserts in the 'bulkInsertRandomAccountData'
 *   method
 */

class BasicExampleDAO {

    private static final int MAX_RETRY_COUNT = 3;
    private static final String SAVEPOINT_NAME = "cockroach_restart";
    private static final String RETRY_SQL_STATE = "40001";
    private static final boolean FORCE_RETRY = false;

    private final DataSource ds;

    BasicExampleDAO(DataSource ds) {
        this.ds = ds;
    }

    /**
       Used to test the retry logic in 'runSQL'.  It is not necessary
       in production code.
    */
    void testRetryHandling() {
        if (this.FORCE_RETRY) {
            runSQL("SELECT crdb_internal.force_retry('1s':::INTERVAL)");
        }
    }

    /**
     * Run SQL code in a way that automatically handles the
     * transaction retry logic so we don't have to duplicate it in
     * various places.
     *
     * @param sqlCode a String containing the SQL code you want to
     * execute.  Can have placeholders, e.g., "INSERT INTO accounts
     * (id, balance) VALUES (?, ?)".
     *
     * @param args String Varargs to fill in the SQL code's
     * placeholders.
     * @return Integer Number of rows updated, or -1 if an error is thrown.
     */
    public Integer runSQL(String sqlCode, String... args) {

        // This block is only used to emit class and method names in
        // the program output.  It is not necessary in production
        // code.
        StackTraceElement[] stacktrace = Thread.currentThread().getStackTrace();
        StackTraceElement elem = stacktrace[2];
        String callerClass = elem.getClassName();
        String callerMethod = elem.getMethodName();

        int rv = 0;

        try (Connection connection = ds.getConnection()) {

            // We're managing the commit lifecycle ourselves so we can
            // automatically issue transaction retries.
            connection.setAutoCommit(false);

            int retryCount = 0;

            while (retryCount < MAX_RETRY_COUNT) {

                Savepoint sp = connection.setSavepoint(SAVEPOINT_NAME);

                // This block is only used to test the retry logic.
                // It is not necessary in production code.  See also
                // the method 'testRetryHandling()'.
                if (FORCE_RETRY) {
                    forceRetry(connection); // SELECT 1
                }

                try (PreparedStatement pstmt = connection.prepareStatement(sqlCode)) {

                    // Loop over the args and insert them into the
                    // prepared statement based on their types.  In
                    // this simple example we classify the argument
                    // types as "integers" and "everything else"
                    // (a.k.a. strings).
                    for (int i=0; i<args.length; i++) {
                        int place = i + 1;
                        String arg = args[i];

                        try {
                            int val = Integer.parseInt(arg);
                            pstmt.setInt(place, val);
                        } catch (NumberFormatException e) {
                            pstmt.setString(place, arg);
                        }
                    }

                    if (pstmt.execute()) {
                        // We know that `pstmt.getResultSet()` will
                        // not return `null` if `pstmt.execute()` was
                        // true
                        ResultSet rs = pstmt.getResultSet();
                        ResultSetMetaData rsmeta = rs.getMetaData();
                        int colCount = rsmeta.getColumnCount();

                        // This printed output is for debugging and/or demonstration
                        // purposes only.  It would not be necessary in production code.
                        System.out.printf("\n%s.%s:\n    '%s'\n", callerClass, callerMethod, pstmt);

                        while (rs.next()) {
                            for (int i=1; i <= colCount; i++) {
                                String name = rsmeta.getColumnName(i);
                                String type = rsmeta.getColumnTypeName(i);

                                // In this "bank account" example we know we are only handling
                                // integer values (technically 64-bit INT8s, the CockroachDB
                                // default).  This code could be made into a switch statement
                                // to handle the various SQL types needed by the application.
                                if (type == "int8") {
                                    int val = rs.getInt(name);

                                    // This printed output is for debugging and/or demonstration
                                    // purposes only.  It would not be necessary in production code.
                                    System.out.printf("    %-8s => %10s\n", name, val);
                                }
                            }
                        }
                    } else {
                        int updateCount = pstmt.getUpdateCount();
                        rv += updateCount;

                        // This printed output is for debugging and/or demonstration
                        // purposes only.  It would not be necessary in production code.
                        System.out.printf("\n%s.%s:\n    '%s'\n", callerClass, callerMethod, pstmt);
                    }

                    connection.releaseSavepoint(sp);
                    connection.commit();
                    break;

                } catch (SQLException e) {

                    if (RETRY_SQL_STATE.equals(e.getSQLState())) {
                        System.out.printf("retryable exception occurred:\n    sql state = [%s]\n    message = [%s]\n    retry counter = %s\n",
                                          e.getSQLState(), e.getMessage(), retryCount);
                        connection.rollback(sp);
                        retryCount++;
                        rv = -1;
                    } else {
                        rv = -1;
                        throw e;
                    }
                }
            }
        } catch (SQLException e) {
            System.out.printf("BasicExampleDAO.runSQL ERROR: { state => %s, cause => %s, message => %s }\n",
                              e.getSQLState(), e.getCause(), e.getMessage());
            rv = -1;
        }

        return rv;
    }

    /**
     * Helper method called by 'testRetryHandling'.  It simply issues
     * a "SELECT 1" inside the transaction to force a retry.  This is
     * necessary to take the connection's session out of the AutoRetry
     * state, since otherwise the other statements in the session will
     * be retried automatically, and the client (us) will not see a
     * retry error. Note that this information is taken from the
     * following test:
     * https://github.com/cockroachdb/cockroach/blob/master/pkg/sql/logictest/testdata/logic_test/manual_retry
     *
     * @param connection Connection
     */
    private void forceRetry(Connection connection) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("SELECT 1")){
            statement.executeQuery();
        }
    }

    /**
     * Creates a fresh, empty accounts table in the database.
     */
    public void createAccounts() {
        runSQL("CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT, CONSTRAINT balance_gt_0 CHECK (balance >= 0))");
    };

    /**
     * Update accounts by passing in a Map of (ID, Balance) pairs.
     *
     * @param accounts (Map)
     * @return The number of updated accounts (int)
     */
    public int updateAccounts(Map<String, String> accounts) {
        int rows = 0;
        for (Map.Entry<String, String> account : accounts.entrySet()) {

            String k = account.getKey();
            String v = account.getValue();

            String[] args = {k, v};
            rows += runSQL("INSERT INTO accounts (id, balance) VALUES (?, ?)", args);
        }
        return rows;
    }

    /**
     * Transfer funds between one account and another.  Handles
     * transaction retries in case of conflict automatically on the
     * backend.
     * @param fromId (int)
     * @param toId (int)
     * @param amount (int)
     * @return The number of updated accounts (int)
     */
    public int transferFunds(int fromId, int toId, int amount) {
            String sFromId = Integer.toString(fromId);
            String sToId = Integer.toString(toId);
            String sAmount = Integer.toString(amount);

            // We have omitted explicit BEGIN/COMMIT statements for
            // brevity.  Individual statements are treated as implicit
            // transactions by CockroachDB (see
            // https://www.cockroachlabs.com/docs/stable/transactions.html#individual-statements).

            String sqlCode = "UPSERT INTO accounts (id, balance) VALUES" +
                "(?, ((SELECT balance FROM accounts WHERE id = ?) - ?))," +
                "(?, ((SELECT balance FROM accounts WHERE id = ?) + ?))";

            return runSQL(sqlCode, sFromId, sFromId, sAmount, sToId, sToId, sAmount);
    }

    /**
     * Get the account balance for one account.
     *
     * We skip using the retry logic in 'runSQL()' here for the
     * following reasons:
     *
     * 1. Since this is a single read ("SELECT"), we don't expect any
     *    transaction conflicts to handle
     *
     * 2. We need to return the balance as an integer
     *
     * @param id (int)
     * @return balance (int)
     */
    public int getAccountBalance(int id) {
        int balance = 0;

        try (Connection connection = ds.getConnection()) {

                // Check the current balance.
                ResultSet res = connection.createStatement()
                    .executeQuery("SELECT balance FROM accounts WHERE id = "
                                  + id);
                if(!res.next()) {
                    System.out.printf("No users in the table with id %i", id);
                } else {
                    balance = res.getInt("balance");
                }
        } catch (SQLException e) {
            System.out.printf("BasicExampleDAO.getAccountBalance ERROR: { state => %s, cause => %s, message => %s }\n",
                              e.getSQLState(), e.getCause(), e.getMessage());
        }

        return balance;
    }

    /**
     * Insert randomized account data (ID, balance) using the JDBC
     * fast path for bulk inserts.  The fastest way to get data into
     * CockroachDB is the IMPORT statement.  However, if you must bulk
     * ingest from the application using INSERT statements, the best
     * option is the method shown here. It will require the following:
     *
     * 1. Add `rewriteBatchedInserts=true` to your JDBC connection
     *    settings (see the connection info in 'BasicExample.main').
     *
     * 2. Inserting in batches of 128 rows, as used inside this method
     *    (see BATCH_SIZE), since the PGJDBC driver's logic works best
     *    with powers of two, such that a batch of size 128 can be 6x
     *    faster than a batch of size 250.
     * @return The number of new accounts inserted (int)
     */
    public int bulkInsertRandomAccountData() {

        Random random = new Random();
        int BATCH_SIZE = 128;
        int totalNewAccounts = 0;

        try (Connection connection = ds.getConnection()) {

            // We're managing the commit lifecycle ourselves so we can
            // control the size of our batch inserts.
            connection.setAutoCommit(false);

            // In this example we are adding 500 rows to the database,
            // but it could be any number.  What's important is that
            // the batch size is 128.
            try (PreparedStatement pstmt = connection.prepareStatement("INSERT INTO accounts (id, balance) VALUES (?, ?)")) {
                for (int i=0; i<=(500/BATCH_SIZE);i++) {
                    for (int j=0; j<BATCH_SIZE; j++) {
                        int id = random.nextInt(1000000000);
                        int balance = random.nextInt(1000000000);
                        pstmt.setInt(1, id);
                        pstmt.setInt(2, balance);
                        pstmt.addBatch();
                    }
                    int[] count = pstmt.executeBatch();
                    totalNewAccounts += count.length;
                    System.out.printf("\nBasicExampleDAO.bulkInsertRandomAccountData:\n    '%s'\n", pstmt.toString());
                    System.out.printf("    => %s row(s) updated in this batch\n", count.length);
                }
                connection.commit();
            } catch (SQLException e) {
                System.out.printf("BasicExampleDAO.bulkInsertRandomAccountData ERROR: { state => %s, cause => %s, message => %s }\n",
                                  e.getSQLState(), e.getCause(), e.getMessage());
            }
        } catch (SQLException e) {
            System.out.printf("BasicExampleDAO.bulkInsertRandomAccountData ERROR: { state => %s, cause => %s, message => %s }\n",
                              e.getSQLState(), e.getCause(), e.getMessage());
        }
        return totalNewAccounts;
    }

    /**
     * Read out a subset of accounts from the data store.
     *
     * @param limit (int)
     * @return Number of accounts read (int)
     */
    public int readAccounts(int limit) {
        return runSQL("SELECT id, balance FROM accounts LIMIT ?", Integer.toString(limit));
    }

    /**
     * Perform any necessary cleanup of the data store so it can be
     * used again.
     */
    public void tearDown() {
        runSQL("DROP TABLE accounts;");
    }
}
