import java.sql.*;
import java.util.Properties;

/*
  Download the Postgres JDBC driver jar from https://jdbc.postgresql.org.

  Then, compile and run this example like so:

  $ export CLASSPATH=.:/path/to/postgresql.jar
  $ javac BasicSample.java && java BasicSample
*/

public class BasicSample {
    public static void main(String[] args)
        throws ClassNotFoundException, SQLException {

        // Load the Postgres JDBC driver.
        Class.forName("org.postgresql.Driver");

        // Connect to the "bank" database.
        Properties props = new Properties();
        props.setProperty("user", "maxroach");
        props.setProperty("sslmode", "disable");

        Connection db = DriverManager
            .getConnection("jdbc:postgresql://127.0.0.1:26257/bank", props);

        try {
            // Create the "accounts" table.
            db.createStatement()
                .execute("CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)");

            // Insert two rows into the "accounts" table.
            db.createStatement()
                .execute("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)");

            // Print out the balances.
            System.out.println("Initial balances:");
            ResultSet res = db.createStatement()
                .executeQuery("SELECT id, balance FROM accounts");
            while (res.next()) {
                System.out.printf("\taccount %s: %s\n",
                                  res.getInt("id"),
                                  res.getInt("balance"));
            }
        } finally {
            // Close the database connection.
            db.close();
        }
    }
}
