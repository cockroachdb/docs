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
      TxnSample(connStringBuilder.ConnectionString);
    }

    static void TransferFunds(NpgsqlConnection conn, NpgsqlTransaction tran, int from, int to, int amount)
    {
      int balance = 0;
      using (var cmd = new NpgsqlCommand(String.Format("SELECT balance FROM accounts WHERE id = {0}", from), conn, tran))
      using (var reader = cmd.ExecuteReader())
      {
        if (reader.Read())
        {
          balance = reader.GetInt32(0);
        }
        else
        {
          throw new DataException(String.Format("Account id={0} not found", from));
        }
      }
      if (balance < amount)
      {
        throw new DataException(String.Format("Insufficient balance in account id={0}", from));
      }
      using (var cmd = new NpgsqlCommand(String.Format("UPDATE accounts SET balance = balance - {0} where id = {1}", amount, from), conn, tran))
      {
        cmd.ExecuteNonQuery();
      }
      using (var cmd = new NpgsqlCommand(String.Format("UPDATE accounts SET balance = balance + {0} where id = {1}", amount, to), conn, tran))
      {
        cmd.ExecuteNonQuery();
      }
    }

    static void TxnSample(string connString)
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

        try
        {
          using (var tran = conn.BeginTransaction())
          {
            tran.Save("cockroach_restart");
            while (true)
            {
              try
              {
                TransferFunds(conn, tran, 1, 2, 100);
                tran.Commit();
                break;
              }
              catch (NpgsqlException e)
              {
                // Check if the error code indicates a SERIALIZATION_FAILURE.
                if (e.ErrorCode == 40001)
                {
                  // Signal the database that we will attempt a retry.
                  tran.Rollback("cockroach_restart");
                }
                else
                {
                  throw;
                }
              }
            }
          }
        }
        catch (DataException e)
        {
          Console.WriteLine(e.Message);
        }

        // Now printout the results.
        Console.WriteLine("Final balances:");
        using (var cmd = new NpgsqlCommand("SELECT id, balance FROM accounts", conn))
        using (var reader = cmd.ExecuteReader())
        while (reader.Read())
          Console.Write("\taccount {0}: {1}\n", reader.GetValue(0), reader.GetValue(1));
      }
    }
  }
}
