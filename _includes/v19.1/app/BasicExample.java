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
*/

// At a high level, this code consists of two classes:
// 1. BasicExample, which is where the application logic lives
// 2. BasicExampleDAO, which is used by the application to access the
// data store

public class BasicExample {

    public static void main(String[] args) {

        // Configure the database connection.
        final PGSimpleDataSource ds = new PGSimpleDataSource();
        ds.setServerName("localhost");
        ds.setPortNumber(26257);
        ds.setDatabaseName("bank");
        ds.setUser("maxroach");
        ds.setPassword(null);
        ds.setReWriteBatchedInserts(true); // add `rewriteBatchedInserts=true` to pg connection string
        ds.setApplicationName("BasicExample");

        // Create DAO.
        BasicExampleDAO dao = new BasicExampleDAO(ds);

        // Test our retry handling logic, maybe (if FORCE_RETRY is
        // true).  This method is only used to test the retry logic.
        // It is not necessary in production code.
        dao.testRetryHandling();

        // Set up the 'accounts' table.
        dao.createAccounts();

        // Insert a few accounts "by hand", using INSERTs on the backend.
        Map<String, String> balances = new HashMap<String, String>();
        balances.put("1", "1000");
        balances.put("2", "250");
        dao.updateAccounts(balances);

        // How much money is in account ID 1?
        int balance1 = dao.getAccountBalance(1);
        int balance2 = dao.getAccountBalance(2);
        System.out.printf("main:\n    => Account balances at time '%s':\n    ID %s => $%s\n    ID %s => $%s\n", LocalTime.now(), 1, balance1, 2, balance2);

        // Transfer $100 from account 1 to account 2
        dao.transferFunds(1, 2, 100);

        balance1 = dao.getAccountBalance(1);
        balance2 = dao.getAccountBalance(2);
        System.out.printf("main:\n    => Account balances at time '%s':\n    ID %s => $%s\n    ID %s => $%s\n", LocalTime.now(), 1, balance1, 2, balance2);

        // Bulk insertion example using JDBC's batching support.
        dao.bulkInsertRandomAccountData();

        // Print out 10 account values.
        dao.readAccounts(10);

        // Drop the 'accounts' table so this code can be run again.
        dao.tearDown();
    }
}

class BasicExampleDAO {

    private static final int MAX_RETRY_COUNT = 3;
    private static final String SAVEPOINT_NAME = "cockroach_restart";
    private static final String RETRY_SQL_STATE = "40001";
    private static final boolean FORCE_RETRY = false;

    private final DataSource ds;

    BasicExampleDAO(DataSource ds) {
        this.ds = ds;
    }

    // This helper method is only used to test the retry logic in
    // 'runSQL'.  It is not necessary in production code.  Note that
    // this calls an internal CockroachDB function that can only be
    // run by the 'root' user, and will fail with an insufficient
    // privileges error if you try to run it as user 'maxroach'.
    void testRetryHandling() {
        if (this.FORCE_RETRY) {
            runSQL("SELECT crdb_internal.force_retry('1s':::INTERVAL)");
        }
    }

    // This helper method lets us run SQL code in a way that
    // automatically handles the transaction retry logic so we don't
    // have to duplicate it in various places.
    public void runSQL(String sqlCode, String... args) {

        // This block is only used to emit class and method names in
        // the program output.  It is not necessary in production
        // code.
        StackTraceElement[] stacktrace = Thread.currentThread().getStackTrace();
        StackTraceElement elem = stacktrace[2];
        String callerClass = elem.getClassName();
        String callerMethod = elem.getMethodName();

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
                    int place = 1; // Prepared statement uses 1-based indexing.
                    for (String arg : args) {

                        if (Integer.parseInt(arg) > 0) {
                            int val = Integer.parseInt(arg);

                            pstmt.setInt(place, val);
                            place++;
                        }
                        else {
                            pstmt.setString(place, arg);
                            place++;
                        }
                    }

                    if (pstmt.execute()) {
                        final ResultSet rs = pstmt.getResultSet();
                        ResultSetMetaData rsmeta = rs.getMetaData();
                        int colCount = rsmeta.getColumnCount();

                        System.out.printf("\n%s.%s:\n\n    '%s'\n\n", callerClass, callerMethod, pstmt);

                        while (rs.next()) {
                            for (int i=1; i <= colCount; i++) {
                                String name = rsmeta.getColumnName(i);
                                String type = rsmeta.getColumnTypeName(i);

                                // In this "bank account" example we
                                // know we are only handling integer
                                // values (technically 64-bit INT8s,
                                // the CockroachDB default).  This
                                // code could be made into a switch
                                // statement to handle the various SQL
                                // types needed by the application.
                                if (type == "int8") {
                                    int val = rs.getInt(name);
                                    System.out.printf("    %-8s => %10s\n", name, val);
                                }
                            }
                        }
                    }
                    else {
                        int updateCount = pstmt.getUpdateCount();
                        System.out.printf("\n%s.%s:\n\n    '%s'\n    => %s row(s) updated\n\n",
                                          callerClass, callerMethod, pstmt, updateCount);
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
                    } else {
                        throw e;
                    }
                }
            }

            connection.setAutoCommit(true);

        } catch (SQLException e) {
            System.out.printf("BasicExampleDAO.runSQL ERROR: { state => %s, cause => %s, message => %s }\n",
                              e.getSQLState(), e.getCause(), e.getMessage());
        }
    }

    public void forceRetry(Connection connection) throws SQLException {
        // The SELECT 1 is necessary to take the connection's session
        // out of the AutoRetry state, since otherwise the other
        // statements in the session will be retried automatically,
        // and we will not see a retry error.  We must issue a SELECT
        // 1 in order to force the retry error to be returned to the
        // client.  This information is taken from the following test:
        // https://github.com/cockroachdb/cockroach/blob/master/pkg/sql/logictest/testdata/logic_test/manual_retry
        try (PreparedStatement statement = connection.prepareStatement("SELECT 1")){
            statement.executeQuery();
        }
    }

    public void createAccounts() {
        runSQL("CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)");
    };

    public void updateAccounts(Map<String, String> accounts) {
        for (Map.Entry<String, String> account : accounts.entrySet()) {

            String k = account.getKey();
            String v = account.getValue();

            String[] args = {k, v};
            runSQL("INSERT INTO accounts (id, balance) VALUES (?, ?)", args);
        }
    }

    public void transferFunds(int fromId, int toId, int amount) {

        int fromBalance = getAccountBalance(fromId);
        int toBalance = getAccountBalance(toId);

        if (amount > fromBalance) {
            System.out.println("Insufficient balance");
        }
        else {
            String sFromId = Integer.toString(fromId);
            String sToId = Integer.toString(toId);
            String sNewFromBalance = Integer.toString(fromBalance - amount);
            String sNewToBalance = Integer.toString(toBalance + amount);
            runSQL("UPSERT INTO accounts (id, balance) values (?, ?), (?, ?)", sFromId, sNewFromBalance, sToId, sNewToBalance);
        }
    }

    // We skip using the retry logic in 'runSQL()' here for the following reasons:
    // 1. Since this is a read (SELECT), we don't expect conflicts
    // 2. We need to return the balance as an integer
    public int getAccountBalance(int id) {
        String sid = Integer.toString(id);
        int balance = 0;

        try (Connection connection = ds.getConnection()) {

                // Check the current balance.
                ResultSet res = connection.createStatement()
                    .executeQuery("SELECT balance FROM accounts WHERE id = "
                                  + id);
                if(!res.next()) {
                    System.out.printf("No users in the table with id %i", id);
                }
                else {
                    balance = res.getInt("balance");
                }
        }
        catch (SQLException e) {
            System.out.printf("BasicExampleDAO.getAccountBalance ERROR: { state => %s, cause => %s, message => %s }\n",
                              e.getSQLState(), e.getCause(), e.getMessage());
        }

        return balance;
    }

    public void bulkInsertRandomAccountData() {

        Random random = new Random();

        // A batch size of 128 is recommended because PGJDBC's batch
        // insertion logic works best with powers of two, such that a
        // batch of size 128 can be 6x faster than a batch of size
        // 250.
        int BATCH_SIZE = 128;

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
                    System.out.printf("\nBasicExampleDAO.bulkInsertRandomAccountData:\n\n    '%s'\n\n", pstmt.toString());
                    System.out.printf("    => %s row(s) updated in this batch\n", count.length);
                }
                connection.commit();
            }
            catch (SQLException e) {
                System.out.printf("BasicExampleDAO.bulkInsertRandomAccountData ERROR: { state => %s, cause => %s, message => %s }\n",
                                  e.getSQLState(), e.getCause(), e.getMessage());
            }
        }
        catch (SQLException e) {
            System.out.printf("BasicExampleDAO.bulkInsertRandomAccountData ERROR: { state => %s, cause => %s, message => %s }\n",
                              e.getSQLState(), e.getCause(), e.getMessage());
        }
    }

    public void readAccounts() {
        runSQL("SELECT id, balance FROM accounts");
    }

    public void readAccounts(int limit) {
        runSQL("SELECT id, balance FROM accounts LIMIT ?", Integer.toString(limit));
    }

    public void tearDown() {
        runSQL("DROP TABLE accounts;");
    }
}
