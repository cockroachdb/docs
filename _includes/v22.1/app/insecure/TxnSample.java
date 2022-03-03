import java.sql.*;
import java.util.Properties;

/*
  Download the Postgres JDBC driver jar from https://jdbc.postgresql.org.

  Then, compile and run this example like so:

  $ export CLASSPATH=.:/path/to/postgresql.jar
  $ javac TxnSample.java && java TxnSample
*/

// Ambiguous whether the transaction committed or not.
class AmbiguousCommitException extends SQLException{
    public AmbiguousCommitException(Throwable cause) {
        super(cause);
    }
}

class InsufficientBalanceException extends Exception {}

class AccountNotFoundException extends Exception {
    public int account;
    public AccountNotFoundException(int account) {
        this.account = account;
    }
}

// A simple interface that provides a retryable lambda expression.
interface RetryableTransaction {
    public void run(Connection conn)
        throws SQLException, InsufficientBalanceException,
               AccountNotFoundException, AmbiguousCommitException;
}

public class TxnSample {
    public static RetryableTransaction transferFunds(int from, int to, int amount) {
        return new RetryableTransaction() {
            public void run(Connection conn)
                throws SQLException, InsufficientBalanceException,
                       AccountNotFoundException, AmbiguousCommitException {

                // Check the current balance.
                ResultSet res = conn.createStatement()
                    .executeQuery("SELECT balance FROM accounts WHERE id = "
                                  + from);
                if(!res.next()) {
                    throw new AccountNotFoundException(from);
                }

                int balance = res.getInt("balance");
                if(balance < from) {
                    throw new InsufficientBalanceException();
                }

                // Perform the transfer.
                conn.createStatement()
                    .executeUpdate("UPDATE accounts SET balance = balance - "
                                   + amount + " where id = " + from);
                conn.createStatement()
                    .executeUpdate("UPDATE accounts SET balance = balance + "
                                   + amount + " where id = " + to);
            }
        };
    }

    public static void retryTransaction(Connection conn, RetryableTransaction tx)
        throws SQLException, InsufficientBalanceException,
               AccountNotFoundException, AmbiguousCommitException {

        Savepoint sp = conn.setSavepoint("cockroach_restart");
        while(true) {
            boolean releaseAttempted = false;
            try {
                tx.run(conn);
                releaseAttempted = true;
                conn.releaseSavepoint(sp);
            }
            catch(SQLException e) {
                String sqlState = e.getSQLState();

                // Check if the error code indicates a SERIALIZATION_FAILURE.
                if(sqlState.equals("40001")) {
                    // Signal the database that we will attempt a retry.
                    conn.rollback(sp);
                    continue;
                } else if(releaseAttempted) {
                    throw new AmbiguousCommitException(e);
                } else {
                    throw e;
                }
            }
            break;
        }
        conn.commit();
    }

    public static void main(String[] args)
        throws ClassNotFoundException, SQLException {

        // Load the Postgres JDBC driver.
        Class.forName("org.postgresql.Driver");

        // Connect to the 'bank' database.
        Properties props = new Properties();
        props.setProperty("user", "maxroach");
        props.setProperty("sslmode", "disable");

        Connection db = DriverManager
            .getConnection("jdbc:postgresql://127.0.0.1:26257/bank", props);


        try {
                // We need to turn off autocommit mode to allow for
                // multi-statement transactions.
                db.setAutoCommit(false);

                // Perform the transfer. This assumes the 'accounts'
                // table has already been created in the database.
                RetryableTransaction transfer = transferFunds(1, 2, 100);
                retryTransaction(db, transfer);

                // Check balances after transfer.
                db.setAutoCommit(true);
                ResultSet res = db.createStatement()
                    .executeQuery("SELECT id, balance FROM accounts");
                while (res.next()) {
                    System.out.printf("\taccount %s: %s\n", res.getInt("id"),
                                      res.getInt("balance"));
                }

            } catch(InsufficientBalanceException e) {
                System.out.println("Insufficient balance");
            } catch(AccountNotFoundException e) {
                System.out.println("No users in the table with id " + e.account);
            } catch(AmbiguousCommitException e) {
                System.out.println("Ambiguous result encountered: " + e);
            } catch(SQLException e) {
                System.out.println("SQLException encountered:" + e);
            } finally {
                // Close the database connection.
                db.close();
            }
    }
}
