using System;
using System.Data;
using System.Security.Cryptography.X509Certificates;
using Npgsql;

namespace Cockroach
{
  class MainClass
  {
    static void Main(string[] args)
    {
      var connStringBuilder = new NpgsqlConnectionStringBuilder();
      connStringBuilder.Port = 26257;
      connStringBuilder.Host = "localhost";
      connStringBuilder.SslMode = SslMode.Require;
      connStringBuilder.TrustServerCertificate = true;
      Simple(connStringBuilder.ConnectionString);
    }

    static void ProvideClientCertificatesCallback(X509CertificateCollection clientCerts)
    {
      // To be able to add a certificate with a private key included, we must convert it to
      // a PKCS #12 format. The following openssl command does this:
      // openssl pkcs12 -inkey cert.key -in cert.crt -export -out cert.pfx -passout pass:
      clientCerts.Add(new X509Certificate2("cert.pfx"));
    }

    static void Simple(string connString)
    {
      using(var conn = new NpgsqlConnection(connString))
      {
        conn.ProvideClientCertificatesCallback += new ProvideClientCertificatesCallback(ProvideClientCertificatesCallback);
        conn.Open();

        // Create the database if it doesn't exist.
        new NpgsqlCommand("CREATE DATABASE IF NOT EXISTS bank", conn).ExecuteNonQuery();

        // Create the "accounts" table.
        new NpgsqlCommand("CREATE TABLE IF NOT EXISTS bank.accounts (id INT PRIMARY KEY, balance INT)", conn).ExecuteNonQuery();

        // Insert two rows into the "accounts" table.
        using(var cmd = new NpgsqlCommand())
        {
          cmd.Connection = conn;
          cmd.CommandText = "UPSERT INTO bank.accounts(id, balance) VALUES(@id1, @val1), (@id2, @val2)";
          cmd.Parameters.AddWithValue("id1", 1);
          cmd.Parameters.AddWithValue("val1", 1000);
          cmd.Parameters.AddWithValue("id2", 2);
          cmd.Parameters.AddWithValue("val2", 250);
          cmd.ExecuteNonQuery();
        }

        // Print out the balances.
        System.Console.WriteLine("Initial balances:");
        using(var cmd = new NpgsqlCommand("SELECT id, balance FROM bank.accounts", conn))
        using(var reader = cmd.ExecuteReader())
        while (reader.Read())
          Console.Write("\taccount {0}: {1}\n", reader.GetString(0), reader.GetString(1));
      }
    }
  }
}
