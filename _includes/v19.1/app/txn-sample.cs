using System;
using System.Data;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;
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
      connStringBuilder.SslMode = SslMode.Require;
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
        conn.ProvideClientCertificatesCallback += ProvideClientCertificatesCallback;
        conn.UserCertificateValidationCallback += UserCertificateValidationCallback;

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

    static void ProvideClientCertificatesCallback(X509CertificateCollection clientCerts)
    {
      // To be able to add a certificate with a private key included, we must convert it to
      // a PKCS #12 format. The following openssl command does this:
      // openssl pkcs12 -inkey client.maxroach.key -in client.maxroach.crt -export -out client.maxroach.pfx
      // As of 2018-12-10, you need to provide a password for this to work on macOS.
      // See https://github.com/dotnet/corefx/issues/24225
      clientCerts.Add(new X509Certificate2("client.maxroach.pfx", "pass"));
    }

    // By default, .Net does all of its certificate verification using the system certificate store.
    // This callback is necessary to validate the server certificate against a CA certificate file.
    static bool UserCertificateValidationCallback(object sender, X509Certificate certificate, X509Chain defaultChain, SslPolicyErrors defaultErrors)
    {
      X509Certificate2 caCert = new X509Certificate2("ca.crt");
      X509Chain caCertChain = new X509Chain();
      caCertChain.ChainPolicy = new X509ChainPolicy()
      {
        RevocationMode = X509RevocationMode.NoCheck,
        RevocationFlag = X509RevocationFlag.EntireChain
      };
      caCertChain.ChainPolicy.ExtraStore.Add(caCert);

      X509Certificate2 serverCert = new X509Certificate2(certificate);

      caCertChain.Build(serverCert);
      if (caCertChain.ChainStatus.Length == 0)
      {
        // No errors
        return true;
      }

      foreach (X509ChainStatus status in caCertChain.ChainStatus)
      {
        // Check if we got any errors other than UntrustedRoot (which we will always get if we don't install the CA cert to the system store)
        if (status.Status != X509ChainStatusFlags.UntrustedRoot)
        {
          return false;
        }
      }
      return true;      
    }
  }
}
