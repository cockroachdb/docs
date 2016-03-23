import java.sql.*;

/*
You can compile and run this example with a command like:
  javac BasicSample.java && java -cp .:~/path/to/postgresql-9.4.1208.jar BasicSample
You can download the postgres JDBC driver jar from https://jdbc.postgresql.org.
*/
public class BasicSample {
    public static void main(String[] args) throws ClassNotFoundException, SQLException {
        // Load the postgres JDBC driver.
        Class.forName("org.postgresql.Driver");

        // Connect to the "bank" DB on a local cockroach node.
        Connection db = DriverManager.getConnection("jdbc:postgresql://127.0.0.1:26257/bank?sslmode=disable", "root", "");

        // Create the "bank" database.
        db.createStatement().execute("CREATE DATABASE bank");
        // Create an "accounts" table in the "bank" database.
        db.createStatement().execute("CREATE TABLE accounts (id INT PRIMARY KEY, balance int)");
        // Insert two rows into the table.
        db.createStatement().execute("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 230)");

        // Print out the starting balances.
        System.out.println("Before transaction:");
        ResultSet res = db.createStatement().executeQuery("SELECT id, balance FROM accounts");
        while (res.next()) {
            System.out.printf("\taccount %s: %s\n", res.getInt("id"), res.getBigDecimal("balance"));
        }

        // Transfer $100 from account 1 to account 2.
        System.out.println("Transfer 100 in a transaction from 1 to 2.");
        // Start a transaction.
        db.setAutoCommit(false);
        // Subtract $100 from account 1.
        db.createStatement().executeUpdate("UPDATE accounts SET balance = balance - 100 WHERE id = 1");
        // Add $100 to account 2.
        db.createStatement().executeUpdate("UPDATE accounts SET balance = balance + 100 WHERE id = 2");
        // Finish the transaction.
        db.commit();

        // Re-enabling committing each query as it is issued.
        db.setAutoCommit(true);

        // Print out the balances again.
        System.out.println("After transaction:");
        res = db.createStatement().executeQuery("SELECT id, balance FROM accounts");
        while (res.next()) {
            System.out.printf("\taccount %s: %s\n", res.getInt("id"), res.getBigDecimal("balance"));
        }
        // Close the database connection.
        db.close();
    }
}
