---
title: Flyway
summary: Learn how to use Flyway with CockroachDB.
toc: true
---

This page walks you through a series of simple database schema changes using Flyway, an open-source schema migration tool. For detailed information about using Flyway, see the [Flyway documentation site](https://flywaydb.org/documentation/).

## Watch the demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/xz4j5tU0ZRU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Before You Begin

Before you begin, do the following:

1. [Install CockroachDB](install-cockroachdb.html) and [start a secure cluster](secure-a-cluster.html).    
1. Download the latest version of the [Flyway comand-line tool](https://flywaydb.org/documentation/commandline/#download-and-installation). CockroachDB v21.1 is fully compatible with Flyway versions 7.1.0 and greater. 

## Step 1. Configure Flyway connect to CockroachDB

1. Extract the Flyway TAR file that you downloaded, and change directories to the extracted `flyway-x.x.x` folder. For example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ tar -xvf flyway-commandline-6.4.2-macosx-x64.tar.gz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cd flyway-6.4.2
    ~~~

1. Edit the `flyway-x.x.x/conf/flyway.conf` configuration file to specify the correct [connection parameters](connection-parameters.html) for your running, secure cluster. For example:

    {% include copy-clipboard.html %}
    ~~~ conf
    ...
    flyway.url=jdbc:postgresql://localhost:26257/bank?ssl=true&sslmode=require&sslrootcert=certs/ca.crt&sslkey=certs/client.max.key&sslcert=certs/client.max.crt
    flyway.user=max
    flyway.password=roach
    ...
    ~~~

    {{site.data.alerts.callout_info}}
    The SSL connection parameters in the connection URL must specify the full path to the certificates that you generated when you [started the secure cluster](secure-a-cluster.html). Also, the user that you specify (e.g., `max`) must also have [admin privileges](grant.html) on the database whose schema you want to change (e.g., `bank`).
    {{site.data.alerts.end}}

## Step 2. Create a schema migration

Flyway executes SQL statements defined in `.sql` files located in the `flyway-x.x.x/sql` subdirectory. The schema changes defined in these `.sql` files are known as *migrations*.

1. Create a `.sql` file with a name that follows the [Flyway naming conventions](https://flywaydb.org/documentation/migrations#naming). For example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ touch sql/V1__Add_accounts_table.sql
    ~~~

1. Edit the `.sql` file, adding a [`CREATE TABLE IF NOT EXISTS`](create-table.html) statement for the table that you want to create, and a simple [`INSERT`](insert.html) statement to initialize the table with some data. For example:

    {% include copy-clipboard.html %}
    ~~~ sql
    /* Create accounts table */
    CREATE TABLE IF NOT EXISTS accounts (
      id INT PRIMARY KEY,
      balance INT
    );

    /* Add initial data to accounts table */
    INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250);
    ~~~

## Step 3. Execute a schema migration

To execute the migration, run the following command from the top of the `flyway-x.x.x` directory:

{% include copy-clipboard.html %}
~~~ shell
$ ./flyway migrate
~~~

You should see output similar to the following:

~~~
Database: jdbc:postgresql://localhost:26257/bank (PostgreSQL 9.5)
Successfully validated 1 migration (execution time 00:00.011s)
Creating Schema History table "bank"."flyway_schema_history" ...
Current version of schema "bank": << Empty Schema >>
Migrating schema "bank" to version 1 - Add accounts table [non-transactional]
Successfully applied 1 migration to schema "bank" (execution time 00:00.081s)
~~~

The schema `"bank"` is now on version 1.

## Step 4. Add additional migrations

Suppose that you want to change the primary key of the `accounts` table from a simple, incrementing [integer](int.html) (in this case, `id`) to an auto-generated [UUID](uuid.html), to follow some [CockroachDB best practices](performance-best-practices-overview.html#unique-id-best-practices). You can make these changes to the schema by creating and executing an additional migration:

1. Create a second `.sql` schema migration file, and name the file following the [Flyway naming conventions](https://flywaydb.org/documentation/migrations#naming), to specify a new migration version. For example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ touch sql/V2__Alter_accounts_pk.sql
    ~~~

    This file will create a version 2 of the `"bank"` schema.

1. Edit the `V2__Alter_accounts_pk.sql` migration file, adding some SQL statements that will add a new column to the `accounts` table, and alter the table's primary key. For example:

    {% include copy-clipboard.html %}
    ~~~ sql
    /* Add new UUID-typed column */
    ALTER TABLE accounts ADD COLUMN unique_id UUID NOT NULL DEFAULT gen_random_uuid();

    /* Change primary key */
    ALTER TABLE accounts ALTER PRIMARY KEY USING COLUMNS (unique_id);
    ~~~

1. Execute the migration by running the `flyway migrate` command from the top of the `flyway-x.x.x` directory:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./flyway migrate
    ~~~

    You should see output similar to the following:

    ~~~
    Flyway Community Edition 6.4.2 by Redgate
    Database: jdbc:postgresql://localhost:26257/bank (PostgreSQL 9.5)
    Successfully validated 2 migrations (execution time 00:00.016s)
    Current version of schema "bank": 1
    Migrating schema "bank" to version 2 - Alter accounts pk [non-transactional]
    DB: primary key changes are finalized asynchronously; further schema changes on this table may be restricted until the job completes
    Successfully applied 1 migration to schema "bank" (execution time 00:00.508s)
    ~~~

    The schema `"bank"` is now on version 2.

1. Check the complete and pending Flyway migrations with the `flyway info` command:

    ~~~ shell
    $ ./flyway info
    ~~~

    ~~~
    Flyway Community Edition 6.4.2 by Redgate
    Database: jdbc:postgresql://localhost:26257/bank (PostgreSQL 9.5)
    Schema version: 2

    +-----------+---------+--------------------+------+---------------------+---------+
    | Category  | Version | Description        | Type | Installed On        | State   |
    +-----------+---------+--------------------+------+---------------------+---------+
    | Versioned | 1       | Add accounts table | SQL  | 2020-05-13 17:16:54 | Success |
    | Versioned | 2       | Alter accounts pk  | SQL  | 2020-05-14 13:27:27 | Success |
    +-----------+---------+--------------------+------+---------------------+---------+
    ~~~

## Flyway and Transactions

When used with most databases, [Flyway wraps the statements in a migration within a single transaction](https://flywaydb.org/documentation/migrations#transactions). When used with CockroachDB, Flyway does *not* wrap schema migrations in transactions. [Transaction boundaries](transactions.html) are instead handled by CockroachDB.

### Transaction retries

When multiple, concurrent transactions or statements are issued to a single CockroachDB cluster, [transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) can cause schema migrations to fail. In the event of transaction contention, CockroachDB returns a `40001 SQLSTATE` (i.e., a serialization failure), and Flyway automatically retries the migration. For more information about client-side transaction retries in CockroachDB, see [Transaction Retries](transactions.html#transaction-retries).

### Transactional schema changes

Support for [transactional schema changes](online-schema-changes.html) is limited in CockroachDB. As a result, if a migration with multiple schema changes fails at any point, the partial migration could leave the database schema in an incomplete state. If this happens, manual intervention will be required to determine the state of the schema, in addition to any possible fixes.

Note that this limitation also applies to single [`ALTER TABLE`](alter-table.html) statements that include multiple schema changes (e.g., `ALTER TABLE ... ALTER COLUMN ... RENAME ..., ADD COLUMN ...`).

## Report Issues with Flyway and CockroachDB

If you run into problems, please file an issue on the [Flyway issue tracker](https://github.com/flyway/flyway/issues), including the following details about the environment where you encountered the issue:

- CockroachDB version ([`cockroach version`](cockroach-version.html))
- Flyway version
- Operating system
- Steps to reproduce the behavior

## See Also

+ [Flyway documentation](https://flywaydb.org/documentation/)
+ [Flyway issue tracker](https://github.com/flyway/flyway/issues)
+ [Client connection parameters](connection-parameters.html)
+ [Third-Party Database Tools](third-party-database-tools.html)
+ [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
