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
        Connection db = DriverManager.getConnection("jdbc:postgresql://127.0.0.1:26257/bank?sslmode=disable", "root", "");

        db.createStatement().execute("DROP DATABASE IF EXISTS bank");
        db.createStatement().execute("CREATE DATABASE bank");
        db.createStatement().execute("CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL)");
        db.createStatement().execute("INSERT INTO accounts (id, balance) VALUES (1, DECIMAL '1000'), (2, DECIMAL '230.50')");
        System.out.println("Before transaction:");
        ResultSet res = db.createStatement().executeQuery("SELECT id, balance FROM accounts");
        while (res.next()) {
            System.out.printf("\taccount %s: $%s\n", res.getInt("id"), res.getBigDecimal("balance"));
        }

        System.out.println("Transfer $100 in a transaction from 1 to 2.");
        db.setAutoCommit(false);
        db.createStatement().executeUpdate("UPDATE accounts SET balance = balance - DECIMAL '100' WHERE id = 1");
        db.createStatement().executeUpdate("UPDATE accounts SET balance = balance + DECIMAL '100' WHERE id = 2");
        db.commit();
        db.setAutoCommit(true);

        System.out.println("After transaction:");
        res = db.createStatement().executeQuery("SELECT id, balance FROM accounts");
        while (res.next()) {
            System.out.printf("\taccount %s: $%s\n", res.getInt("id"), res.getBigDecimal("balance"));
        }
        db.close();
    }
}
