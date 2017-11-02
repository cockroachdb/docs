import java.sql.*;

/*
  You can compile and run this example with a command like:
  javac TxnSample.java && java -cp .:~/path/to/postgresql-9.4.1208.jar TxnSample
  You can download the postgres JDBC driver jar from https://jdbc.postgresql.org.
*/

class AmbiguousResultException extends Exception{}
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
        throws SQLException, InsufficientBalanceException, AccountNotFoundException, AmbiguousResultException;
}

public class TxnSample {
    public static RetryableTransaction transferFunds(int from, int to, int amount) {
        return new RetryableTransaction() {
            public void run(Connection conn)
                throws SQLException, InsufficientBalanceException, AccountNotFoundException, AmbiguousResultException {
                // Check the current balance.
                ResultSet res = conn.createStatement().executeQuery("SELECT balance FROM accounts WHERE id = " + from);
                if(!res.next()) {
                    throw new AccountNotFoundException(from);
                }
                int balance = res.getInt("balance");
                if(balance < from) {
                    throw new InsufficientBalanceException();
                }
                // Perform the transfer.
                conn.createStatement().executeUpdate("UPDATE accounts SET balance = balance - " + amount + " where id = " + from);
                conn.createStatement().executeUpdate("UPDATE accounts SET balance = balance + " + amount + " where id = " + to);
            }
        };
    }

    public static void retryTransaction(Connection conn, RetryableTransaction tx)
        throws SQLException, InsufficientBalanceException, AccountNotFoundException, AmbiguousResultException {
        Savepoint sp = conn.setSavepoint("cockroach_restart");
        while(true) {
            try {
                // Attempt the transaction.
                tx.run(conn);

                // If we reach this point, release the savepoint.
                conn.releaseSavepoint(sp);
                break;
            } catch(SQLException e) {
                // Check if the error code indicates a SERIALIZATION_FAILURE.
                if(e.getErrorCode() == 40001) {
                    // Signal the database that we will attempt a retry.
                    conn.rollback(sp);
                } else {
                    // This is a not a serialization failure, pass it up the chain.
                    throw e;
                }
            }
        }
        // Commit the transaction.
        try {
            conn.commit();
        } catch(SQLException e) {
            if(e.getErrorCode() % 1000 == 0) {
                // It's ambiguous whether the commit succeeded or not.
                // TODO(andrei): taking recommendations for what this comment should say.
                throw new AmbiguousResultException();
            }
        }
    }

    public static void main(String[] args) throws ClassNotFoundException, SQLException {
        // Load the postgres JDBC driver.
        Class.forName("org.postgresql.Driver");

        // Connect to the "bank" database.
        Connection db = DriverManager.getConnection("jdbc:postgresql://127.0.0.1:26257/bank?sslmode=disable", "maxroach", "");
            try {
                // We need to turn off autocommit mode to allow for
                // multi-statement transactions.
                db.setAutoCommit(false);
                // Perform the transfer. This assumes the table has
                // already been set up as in the "Build a Test App"
                // tutorial.
                RetryableTransaction transfer = transferFunds(1, 2, 100);
                retryTransaction(db, transfer);
                // Check balances after transfer.
                ResultSet res = db.createStatement().executeQuery("SELECT id, balance FROM accounts");
                while (res.next()) {
                    System.out.printf("\taccount %s: %s\n", res.getInt("id"), res.getInt("balance"));
                }
            } catch(InsufficientBalanceException e) {
                System.out.println("Insufficient balance");
            } catch(AccountNotFoundException e) {
                System.out.println("No users in the table with id " + e.account);
            } catch(SQLException e) {
                System.out.println("SQLException encountered:" + e);
            } catch(AmbiguousResultException e) {
                System.out.println("Ambiguous result encountered: " +e);
            } finally {
                // Close the database connection.
                db.close();
            }
    }
}
