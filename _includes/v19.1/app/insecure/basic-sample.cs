using System;
using System.Data;
using Npgsql;

namespace Cockroach
{
  class MainClass
  {
    static void Main(string[] args)
    {
      var connStringBuilder = new NpgsqlConnectionStringBuilder();
      connStringBuilder.Host = "localhost";
      connStringBuilder.Port = 26257;
      connStringBuilder.SslMode = SslMode.Disable;
      connStringBuilder.Username = "maxroach";
      connStringBuilder.Database = "bank";
      Simple(connStringBuilder.ConnectionString);
    }

    static void Simple(string connString)
    {
      using (var conn = new NpgsqlConnection(connString))
      {
        conn.Open();

        // Create the "accounts" table.
        new NpgsqlCommand("CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)", conn).ExecuteNonQuery();

        // Insert two rows into the "accounts" table.
        using (var cmd = new NpgsqlCommand())
        {
          cmd.Connection = conn;
          cmd.CommandText = "UPSERT INTO accounts(id, balance) VALUES(@id1, @val1), (@id2, @val2)";
          cmd.Parameters.AddWithValue("id1", 1);
          cmd.Parameters.AddWithValue("val1", 1000);
          cmd.Parameters.AddWithValue("id2", 2);
          cmd.Parameters.AddWithValue("val2", 250);
          cmd.ExecuteNonQuery();
        }

        // Print out the balances.
        System.Console.WriteLine("Initial balances:");
        using (var cmd = new NpgsqlCommand("SELECT id, balance FROM accounts", conn))
        using (var reader = cmd.ExecuteReader())
          while (reader.Read())
            Console.Write("\taccount {0}: {1}\n", reader.GetValue(0), reader.GetValue(1));
      }
    }
  }
}
