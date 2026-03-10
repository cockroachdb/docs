---
title: Bulk-delete Data
summary: How to delete a large amount of data from a cluster
toc: true
docs_area: develop
---

There are several techniques to delete large amounts of data in CockroachDB.

The simplest method is to use [TTL expressions](#batch-delete-expired-data) on rows to define when the data is expired, and then let CockroachDB handle the delete operations.

To [manually delete a large number of rows](#manually-delete-data-using-batches) (i.e., tens of thousands of rows or more), we recommend iteratively deleting subsets of the rows that you want to delete, until all of the unwanted rows have been deleted. You can write a script to do this, or you can write a loop into your application.

{{site.data.alerts.callout_success}}
If you want to delete all of the rows in a table (and not just a large subset of the rows), use a [`TRUNCATE` statement](#delete-all-of-the-rows-in-a-table).
{{site.data.alerts.end}}

## Batch-delete "expired" data

{% include {{page.version.version}}/sql/row-level-ttl.md %}

For more information, see [Batch delete expired data with Row-Level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}).

## Manually delete data using batches

This section provides guidance on batch deleting with the `DELETE` query filter [on an indexed column](#batch-delete-on-an-indexed-column) and [on a non-indexed column](#batch-delete-on-a-non-indexed-column). Filtering on an indexed column is both simpler to implement and more efficient, but adding an index to a table can slow down insertions to the table and may cause bottlenecks. Queries that filter on a non-indexed column must perform at least one full-table scan, a process that takes time proportional to the size of the entire table.

{{site.data.alerts.callout_danger}}
Exercise caution when batch deleting rows from tables with foreign key constraints and explicit [`ON DELETE` foreign key actions]({% link {{ page.version.version }}/foreign-key.md %}#foreign-key-actions). To preserve `DELETE` performance on tables with foreign key actions, we recommend using smaller batch sizes, as additional rows updated or deleted due to `ON DELETE` actions can make batch loops significantly slower.
{{site.data.alerts.end}}

### Before you begin

Before reading this page, do the following:

- [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/quickstart.md %}) or [start a local cluster]({% link cockroachcloud/quickstart.md %}?filters=local).
- [Install a Driver or ORM Framework]({% link {{ page.version.version }}/install-client-drivers.md %}).
- [Connect to the database]({% link {{ page.version.version }}/connect-to-the-database.md %}).
- [Insert data]({% link {{ page.version.version }}/insert-data.md %}) that you now want to delete.

    For the example on this page, we load a cluster with the [`tpcc` database]({% link {{ page.version.version }}/cockroach-workload.md %}#tpcc-workload) and data from [`cockroach workload`]({% link {{ page.version.version }}/cockroach-workload.md %}).

### Batch delete on an indexed column

For high-performance batch deletes, we recommending filtering the `DELETE` query on an [indexed column]({% link {{ page.version.version }}/indexes.md %}).

{{site.data.alerts.callout_info}}
Having an indexed filtering column can make delete operations faster, but it might lead to bottlenecks in execution, especially if the filtering column is a [timestamp]({% link {{ page.version.version }}/timestamp.md %}). To reduce bottlenecks, we recommend using a [hash-sharded index]({% link {{ page.version.version }}/hash-sharded-indexes.md %}).
{{site.data.alerts.end}}

Each iteration of a batch-delete loop should execute a transaction containing a single `DELETE` query. When writing this `DELETE` query:

- Use a `WHERE` clause to filter on a column that identifies the unwanted rows. If the filtering column is not the primary key, the column should have [a secondary index]({% link {{ page.version.version }}/indexes.md %}). Note that if the filtering column is not already indexed, it is not beneficial to add an index just to speed up batch deletes. Instead, consider [batch deleting on non-indexed columns](#batch-delete-on-a-non-indexed-column).
- To ensure that rows are efficiently scanned in the `DELETE` query, add an [`ORDER BY`]({% link {{ page.version.version }}/order-by.md %}) clause on the filtering column.
- Use a [`LIMIT`]({% link {{ page.version.version }}/limit-offset.md %}) clause to limit the number of rows to the desired batch size. To determine the optimal batch size, try out different batch sizes (1,000 rows, 10,000 rows, 100,000 rows, etc.) and monitor the change in performance.
- Add a `RETURNING` clause to the end of the query that returns the filtering column values of the deleted rows. Then, using the values of the deleted rows, update the filter to match only the subset of remaining rows to delete. This narrows each query's scan to the fewest rows possible, and [preserves the performance of the deletes over time]({% link {{ page.version.version }}/delete.md %}#preserving-delete-performance-over-time). This pattern assumes that no new rows are generated that match on the `DELETE` filter during the time that it takes to perform the delete.

#### Examples

Choose the language for the example code.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="python"><strong>Python (psycopg2)</strong></button>
    <button class="filter-button page-level" data-scope="java"><strong>Java (JDBC)</strong></button>
    <button class="filter-button page-level" data-scope="csharp"><strong>C# (Npgsql)</strong></button>
</div>

For example, suppose that you want to delete all rows in the [`tpcc`]({% link {{ page.version.version }}/cockroach-workload.md %}#tpcc-workload) `new_order` table where `no_w_id` is less than `5`, in batches of 5,000 rows. To do this, you can write a query that loops over batches of 5,000 rows, following the `DELETE` query guidance provided above. Note that in this case, `no_w_id` is the first column in the primary index, and, as a result, you do not need to create a secondary index on the column.

<section class="filter-content" markdown="1" data-scope="python">

In Python using the psycopg2 driver, the script would look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ python
#!/usr/bin/env python3

import psycopg2
import psycopg2.sql
import os

conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
filter = 4
lastrow = None

while True:
  with conn:
    with conn.cursor() as cur:
        if lastrow:
            filter = lastrow[0]
        query = psycopg2.sql.SQL("DELETE FROM new_order WHERE no_w_id <= %s ORDER BY no_w_id DESC LIMIT 5000 RETURNING no_w_id")
        cur.execute(query, (filter,))
        print(cur.statusmessage)
        if cur.rowcount == 0:
            break
        lastrow = cur.fetchone()

conn.close()
~~~

</section>

<section class="filter-content" markdown="1" data-scope="java">

A simple JDBC application that bulk deletes rows in batches of 5000 would look like this:

{% include_cached copy-clipboard.html %}
~~~ java
package com.cockroachlabs.bulkdelete;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

import org.postgresql.ds.PGSimpleDataSource;

public class App {

    public static void deleteData(Connection conn) {
        boolean cont = true;
        // the initial warehouse ID we will delete orders from
        int warehouseId = 4;
        try {
            do {
                System.out.println("Deleting data from warehouses <= to " + warehouseId);
                String sql = "DELETE FROM new_order WHERE no_w_id <= ? ORDER BY no_w_id DESC LIMIT 5000 RETURNING no_w_id";
                // use a prepared statement and the current warehouse ID
                PreparedStatement ps = conn.prepareStatement(sql, ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
                ps.setInt(1, warehouseId);
                ResultSet results = ps.executeQuery();
                if (!results.next()) {
                    cont = false;
                } else {
                    results.last();
                    System.out.println("Deleted " + results.getRow() + " rows.");
                    // get the warehouse ID of the last row of this batch
                    warehouseId = results.getInt(1);
                    System.out.println("Warehouse ID is now " + warehouseId);
                }
            } while (cont);
        }
        catch(Exception e) {
            return;
        }
    }

    public static void main(String[] args) throws SQLException {
        // create the datasource for the JDBC driver
        PGSimpleDataSource ds = new PGSimpleDataSource();
        ds.setApplicationName("docs_bulk_delete_java");
        // get the cluster JDBC URL from an environment variable
        ds.setUrl(Optional.ofNullable(System.getenv("JDBC_DATABASE_URL")).orElseThrow(
              () -> new IllegalArgumentException("JDBC_DATABASE_URL is not set.")));
        try (Connection connection = ds.getConnection()) {
            // call the method to perform the deletes
            deleteData(connection);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="csharp">

A simple C# Npgsql application that bulk deletes rows in batches of 5000 would look like this:

{% include_cached copy-clipboard.html %}
~~~ csharp
using System;
using System.Data;
using System.Net.Security;
using Npgsql;

namespace Cockroach
{
  class MainClass
  {
    static void Main(string[] args)
    {
      // create the connection string from the connection parameters
      var connStringBuilder = new NpgsqlConnectionStringBuilder();
      connStringBuilder.Host = "cluster-name-743.g95.cockroachlabs.cloud";
      connStringBuilder.Port = 26257;
      connStringBuilder.SslMode = SslMode.VerifyFull;
      connStringBuilder.Username = "maxroach";
      connStringBuilder.Password = "notAGoodPassword";
      connStringBuilder.Database = "tpcc";
      connStringBuilder.ApplicationName = "docs_bulk_delete_csharp";
      // call the method to perform the deletes
      DeleteRows(connStringBuilder.ConnectionString);
    }

    static void DeleteRows(string connString)
    {
      // create the data source with the connection string
      using var dataSource = NpgsqlDataSource.Create(connString);
      {
        using var connection = dataSource.OpenConnection();
        bool cont = true;
        // the initial warehouse ID we will delete orders from
        int warehouseId = 4;
        do {
          Console.WriteLine("Deleting data from warehouse <= to " + warehouseId);
          using var cmd = new NpgsqlCommand("DELETE FROM new_order WHERE no_w_id <= (@p1) ORDER BY no_w_id DESC LIMIT 5000 RETURNING no_w_id", connection)
          {
            Parameters =
            {
              // using a prepared statement and the current warehouse ID
              new("p1", warehouseId)
            }
          };
          using (var reader = cmd.ExecuteReader())
          {
            if (reader.HasRows)
            {
              while (reader.Read())
              {
                // Get the warehouse ID. When the result set is empty this will be
                // the warehouse ID of the final row of this batch.
                warehouseId = reader.GetInt32(0);
              }
              Console.WriteLine("Warehouse ID is now " + warehouseId);
            }
            else {
              // All the rows have been deleted, so break out of the loop
              cont = false;
            }
            Console.WriteLine("Deleted " + reader.RecordsAffected + " rows.");
          }
        } while (cont);
      }
    }
  }
}
~~~

</section>

This example iteratively deletes rows in batches of 5,000, until all of the rows where `no_w_id <= 4` are deleted. Note that at each iteration, the filter is updated to match a narrower subset of rows.

### Batch delete on a non-indexed column

If you cannot index the column that identifies the unwanted rows, we recommend defining the batch loop to execute separate read and write operations at each iteration:

1. Execute a [`SELECT` query]({% link {{ page.version.version }}/selection-queries.md %}) that returns the primary key values for the rows that you want to delete. When writing the `SELECT` query:
    - Use a `WHERE` clause that filters on the column identifying the rows.
    - If you need to avoid [transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) you can use an [`AS OF SYSTEM TIME` clause]({% link {{ page.version.version }}/as-of-system-time.md %}) at the end of the selection subquery, or run the selection query in a separate, read-only transaction with [`SET TRANSACTION AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}#use-as-of-system-time-in-transactions). If you add an `AS OF SYSTEM TIME` clause, make sure your selection query to get the batches of rows is run outside of the window of the `AS OF SYSTEM TIME` clause. That is, if you use `AS OF SYSTEM TIME '-5s'` to find the rows to delete, you should wait at least 5 seconds before rerunning the select query. Otherwise you will retrieve rows that have already been deleted.
    - Use a [`LIMIT`]({% link {{ page.version.version }}/limit-offset.md %}) clause to limit the number of rows queried to a subset of the rows that you want to delete. To determine the optimal `SELECT` batch size, try out different sizes (10,000 rows, 100,000 rows, 1,000,000 rows, etc.), and monitor the change in performance. Note that this `SELECT` batch size can be much larger than the batch size of rows that are deleted in the subsequent `DELETE` query.
    - To ensure that rows are efficiently scanned in the subsequent `DELETE` query, include an [`ORDER BY`]({% link {{ page.version.version }}/order-by.md %}) clause on the primary key.

1. Write a nested `DELETE` loop over the primary key values returned by the `SELECT` query, in batches smaller than the initial `SELECT` batch size. To determine the optimal `DELETE` batch size, try out different sizes (1,000 rows, 10,000 rows, 100,000 rows, etc.), and monitor the change in performance. Where possible, we recommend executing each `DELETE` in a separate transaction.

For example, suppose that you want to delete all rows in the [`tpcc`]({% link {{ page.version.version }}/cockroach-workload.md %}#tpcc-workload) `history` table that are older than a month. You can create a script that loops over the data and deletes unwanted rows in batches, following the query guidance provided above.

#### Examples

Choose the language for the example code.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="python"><strong>Python (psycopg2)</strong></button>
    <button class="filter-button page-level" data-scope="java"><strong>Java (JDBC)</strong></button>
    <button class="filter-button page-level" data-scope="csharp"><strong>C# (Npgsql)</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="python">

In Python, the script would look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ python
#!/usr/bin/env python3

import psycopg2
import os
import time
import logging


def main():
  try:
    dsn = os.environ.get("DATABASE_URL")
    conn = psycopg2.connect(dsn)
  except Exception as e:
    logging.fatal("database connection failed")
    logging.fatal(e)
    exit

  while True:
    with conn:
      with conn.cursor() as cur:
        cur.execute("SET TRANSACTION AS OF SYSTEM TIME '-5s'")
        cur.execute("SELECT h_w_id, rowid FROM tpcc.history WHERE h_date < current_date() - INTERVAL '1 MONTH' ORDER BY h_w_id, rowid LIMIT 20000")
        pkvals = list(cur)
    if not pkvals:
      return
    while pkvals:
      batch = pkvals[:5000]
      pkvals = pkvals[5000:]
      with conn:
        with conn.cursor() as cur:
          cur.execute("DELETE FROM tpcc.history WHERE (h_w_id, rowid) = ANY %s", (batch,))
          print(cur.statusmessage)
      del batch
    del pkvals
    time.sleep(5)

  conn.close()

if __name__ == "__main__":
  main()
~~~

</section>

<section class="filter-content" markdown="1" data-scope="java">

In Java, the code would look similar to:

{% include_cached copy-clipboard.html %}
~~~ java
public static void deleteDataNonindexed(Connection conn) {
    boolean cont = true;
    try {
        do {
            // select the rows using the primary key
            String select = "SELECT h_w_id, rowid FROM history WHERE h_date < current_date() - INTERVAL '1 MONTH' ORDER BY h_w_id, rowid LIMIT 20000";
            Statement st = conn.createStatement();
            ResultSet results = st.executeQuery(select);
            List<KeyFields> pkeys = new ArrayList<>();
            if (!results.isBeforeFirst()) {
                cont = false;
            } else {
                System.out.println("Found results, deleting rows.");
                while (results.next()) {
                    KeyFields kf = new KeyFields();
                    kf.hwid = results.getInt(1);
                    kf.rowId = UUID.fromString(results.getString(2));
                    pkeys.add(kf);
                }
            }
            while (pkeys.size() > 0) {
                // check the size of the list of primary keys
                // if it is smaller than the batch size, set the last
                // index of the batch size to the size of the list
                int size = pkeys.size();
                int lastIndex;
                if (size > 5000) {
                    lastIndex = 5000;
                } else {
                    lastIndex = size;
                }
                // slice the list of primary keys to the batch size
                String pkeyList = String.join(",", pkeys.subList(0, lastIndex).toString());
                String deleteStatement = new String("DELETE FROM history WHERE (h_w_id, rowid) = ANY ( ARRAY " + pkeyList + ")");
                int deleteCount = conn.createStatement().executeUpdate(deleteStatement);
                System.out.println("Deleted " + deleteCount + " rows.");
                // remove the deleted rows primary keys
                pkeys.subList(0, lastIndex).clear();
            }
        } while (cont);
    } catch(Exception e) {
        e.printStackTrace();
        return;
    }
}

// inner class to store the primary key data
public static class KeyFields {
    public int hwid;
    public UUID rowId;

    @Override
    public String toString() {
        return "( " + hwid + ", '" + rowId.toString() + "' )";
    }
}
~~~

The `KeyFields` class encapsulates the compound primary key for the `history` table, and is used in the typed collection of primary keys returned by the `SELECT` query.

</section>

<section class="filter-content" markdown="1" data-scope="csharp">

In C# the code would look similar to:

{% include_cached copy-clipboard.html %}
~~~ csharp
public class KeyFields {
    public Int32 hwid;
    public Guid rowId;

    public override String ToString()
    {
        return "( " + hwid.ToString() + ", '" + rowId.ToString() + "' )";
    }

}

static void DeleteRows(string connString)
{
    using var dataSource = NpgsqlDataSource.Create(connString);
    {
        using var connection = dataSource.OpenConnection();
        bool cont = true;
        do
        {
            using (var cmdSelect = new NpgsqlCommand("SELECT h_w_id, rowid FROM history WHERE h_date < current_date() - INTERVAL '1 MONTH' ORDER BY h_w_id, rowid LIMIT 20000", connection))
            {
                List<KeyFields> pkeys = new List<KeyFields>();
                using (var reader = cmdSelect.ExecuteReader())
                {
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            KeyFields kf = new KeyFields();
                            kf.hwid = reader.GetInt32(0);
                            kf.rowId = reader.GetGuid(1);
                            pkeys.Add(kf);
                        }
                    }
                    else
                    {
                        // All the rows have been deleted, so break out of the loop
                        cont = false;
                    }
                }
                while (pkeys.Count > 0) {
                    // get the size of the list of primary keys
                    // if it is smaller than the batch size, set the last
                    // index of the batch size to the size of the list
                    Int32 size = pkeys.Count;
                    Int32 lastIndex;
                    if (size > 5000)
                    {
                        lastIndex = 5000;
                    } else
                    {
                        lastIndex = size;
                    }
                    List<KeyFields> batch = pkeys.GetRange(0, lastIndex);
                    String pkeyList = String.Join(',', batch);
                    String deleteStatement = new String("DELETE FROM history WHERE (h_w_id, rowid) = ANY ( ARRAY [ " + pkeyList + "])");
                    using (var cmdDelete = new NpgsqlCommand(deleteStatement, connection))
                    {
                        Int32 deleteCount = cmdDelete.ExecuteNonQuery();
                        Console.WriteLine("Deleted " + deleteCount + " rows.");
                    }
                    pkeys.RemoveRange(0, lastIndex);
                }
            }
        } while (cont);
    }
}
~~~

The `KeyFields` class encapsulates the compound primary key for the `history` table, and is used in the typed collection of primary keys returned by the `SELECT` query.

</section>

At each iteration, the selection query returns the primary key values of up to 20,000 rows of matching historical data from 5 seconds in the past, in a read-only transaction. Then, a nested loop iterates over the returned primary key values in smaller batches of 5,000 rows. At each iteration of the nested `DELETE` loop, a batch of rows is deleted. After the nested `DELETE` loop deletes all of the rows from the initial selection query, a time delay ensures that the next selection query reads historical data from the table after the last iteration's `DELETE` final delete.

{{site.data.alerts.callout_info}}
CockroachDB records the timestamp of each row created in a table in the `crdb_internal_mvcc_timestamp` metadata column. In the absence of an explicit timestamp column in your table, you can use `crdb_internal_mvcc_timestamp` to filter expired data.

`crdb_internal_mvcc_timestamp` cannot be indexed. If you plan to use `crdb_internal_mvcc_timestamp` as a filter for large deletes, you must follow the [non-indexed column pattern](#batch-delete-on-a-non-indexed-column).

**Exercise caution when using `crdb_internal_mvcc_timestamp` in production, as the column is subject to change without prior notice in new releases of CockroachDB. Instead, we recommend creating a column with an [`ON UPDATE` expression]({% link {{ page.version.version }}/create-table.md %}#on-update-expressions) to avoid any conflicts due to internal changes to `crdb_internal_mvcc_timestamp`.**
{{site.data.alerts.end}}

### Delete all of the rows in a table

To delete all of the rows in a table, use a [`TRUNCATE` statement]({% link {{ page.version.version }}/truncate.md %}).

For example, to delete all rows in the [`tpcc`]({% link {{ page.version.version }}/cockroach-workload.md %}#tpcc-workload) `new_order` table, execute the following SQL statement:

{% include_cached copy-clipboard.html %}
~~~ sql
TRUNCATE new_order;
~~~

You can execute the statement from a compatible SQL client (e.g., the [CockroachDB SQL client]({% link {{ page.version.version }}/cockroach-sql.md %})), or in a script or application.

#### Examples

Choose the language for the example code.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="python"><strong>Python (psycopg2)</strong></button>
    <button class="filter-button page-level" data-scope="java"><strong>Java (JDBC)</strong></button>
    <button class="filter-button page-level" data-scope="csharp"><strong>C# (Npgsql)</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="python">

For example, in Python, using the `psycopg2` client driver:

{% include_cached copy-clipboard.html %}
~~~ python
#!/usr/bin/env python3

import psycopg2
import os

conn = psycopg2.connect(os.environ.get('DB_URI'))

with conn:
  with conn.cursor() as cur:
      cur.execute("TRUNCATE new_order")
~~~

</section>

<section class="filter-content" markdown="1" data-scope="java">

In Java, the code would look similar to this:

{% include_cached copy-clipboard.html %}
~~~ java
public static void truncateTable (Connection conn) {
    try {
        int results = conn.createStatement().executeUpdate("TRUNCATE new_order");
        System.out.println("Truncated table new_order. Result: " + results);
    } catch (Exception e) {
        e.printStackTrace();
        return;
    }
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="csharp">

In C# the code would look similar to this:

{% include_cached copy-clipboard.html %}
~~~ csharp
static void TruncateTable(string connString)
{
    using var dataSource = NpgsqlDataSource.Create(connString);
    using var connection = dataSource.OpenConnection();
    using (var cmdTruncate = new NpgsqlCommand("TRUNCATE new_order", connection))
    {
        Int32 results = cmdTruncate.ExecuteNonQuery();
        Console.WriteLine("Dropped " + results + " rows in new_order");
    }
}
~~~

</section>

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `TRUNCATE` statement, including additional examples, see the [`TRUNCATE` syntax page]({% link {{ page.version.version }}/truncate.md %}).
{{site.data.alerts.end}}

## See also

- [Delete data]({% link {{ page.version.version }}/delete-data.md %})
- [Batch Delete Expired Data with Row-Level TTL]({% link {{ page.version.version }}/row-level-ttl.md %})
- [`DELETE`]({% link {{ page.version.version }}/delete.md %})
- [`TRUNCATE`]({% link {{ page.version.version }}/truncate.md %})
