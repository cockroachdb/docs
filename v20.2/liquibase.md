---
title: Liquibase
summary: Learn how to use Liquibase with CockroachDB.
toc: true
---

This page walks you through a series of simple database schema changes using the [Liquibase](https://www.liquibase.org/get-started/how-liquibase-works) command-line tool and the [CockroachDB SQL shell](cockroach-sql.html).

For detailed information about using Liquibase, see the [Liquibase documentation site](https://docs.liquibase.com/home.html).

## Before you begin

Before you begin the tutorial, do the following:

1. [Install CockroachDB](install-cockroachdb.html), and [start a secure cluster](secure-a-cluster.html). When starting your cluster, make sure that you generate cluster certificates, create the `bank` database, and create the `max` user.
1. Download and install a Java Development Kit. Liquibase supports JDK versions 8+. In this tutorial, we use [AdoptOpenJDK](https://adoptopenjdk.net/) 8, but you can follow along with any JDK version 8+.

## Step 1. Download and install Liquibase

To install the Liquibase binary on your machine:

1. Download the latest version of the [Liquibase comand-line tool](https://www.liquibase.org/download). CockroachDB is fully compatible with Liquibase versions 4.2.0 and greater. We use the binary download of Liquibase 4.20, for macOS.

    {{site.data.alerts.callout_info}}
    In this tutorial, we go through a manual installation, using a download of the binary version of the Liquibase command-line tool. If you are new to Liquibase, you can also use the [Liquibase Installer](https://www.liquibase.org/get-started/using-the-liquibase-installer) to get started. The installer comes with some example properties and changelog files, an example H2 database, and a distribution of AdoptOpenJDK.
    {{site.data.alerts.end}}

1. Make a new directory for your Liquibase installation:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir liquibase-4.2.0-bin
    ~~~

1. Extract the Liquibase download to the new directory:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ tar -xvf liquibase-4.2.0.tar.gz -C liquibase-4.2.0-bin
    ~~~

1. Append the full path of the `liquibase` binary (now located in the `liquibase-4.2.0-bin` folder) to your machine's `PATH` environment variable:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo "export PATH=$PATH:/full-path/liquibase-4.2.0-bin" >> ~/.bash_profile
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ source ~/.bash_profile
    ~~~

    {{site.data.alerts.callout_info}}
    If your terminal does not run `.bash_profile` at start-up, you can alternatively append the `liquibase` path to the `PATH` definition in `.bashrc` or `.profile`.
    {{site.data.alerts.end}}

1. To verify that the installation was successful, run the following command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ liquibase --version
    ~~~

    You should get output similar to the following:

    ~~~
    ####################################################
    ##   _     _             _ _                      ##
    ##  | |   (_)           (_) |                     ##
    ##  | |    _  __ _ _   _ _| |__   __ _ ___  ___   ##
    ##  | |   | |/ _` | | | | | '_ \ / _` / __|/ _ \  ##
    ##  | |___| | (_| | |_| | | |_) | (_| \__ \  __/  ##
    ##  \_____/_|\__, |\__,_|_|_.__/ \__,_|___/\___|  ##
    ##              | |                               ##
    ##              |_|                               ##
    ##                                                ##
    ##  Get documentation at docs.liquibase.com       ##
    ##  Get certified courses at learn.liquibase.com  ##
    ##  Get advanced features and support at          ##
    ##      liquibase.com/support                     ##
    ##                                                ##
    ####################################################
    Starting Liquibase at 13:38:36 (version 4.2.0 #18 built at 2020-11-13 16:49+0000)
    Liquibase Version: 4.2.0
    Liquibase Community 4.2.0 by Datical
    Running Java under /Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home/jre (Version 1.8.0_242)
    ~~~

## Step 2: Download the PostgreSQL JDBC driver

The Liquibase command-line tool uses the PostgreSQL JDBC driver to connect to CockroachDB as a Java application.

To install the driver for Liquibase:

1. Download the JDBC driver from [the PostgreSQL website](https://jdbc.postgresql.org/download.html).
1. Place the driver in the `lib` directory of the Liquibase binary. For example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp ~/Downloads/postgresql-42.2.9.jar liquibase-4.2.0-bin/lib/
    ~~~

{{site.data.alerts.callout_success}}
If you are using Liquibase in the context of a separate Java application, we recommend that you use a dependency management tool, like [Maven](https://docs.liquibase.com/tools-integrations/maven/home.html), to download the driver.
{{site.data.alerts.end}}

## Step 3. Generate TLS certificates for the `max` user

When you [started a secure CockroachDB cluster](secure-a-cluster.html), you should have created a user `max`. You should have also given this user the [`admin` role](authorization.html#admin-role), which grants all privileges to all databases on the cluster. In this tutorial, Liquibase runs schema changes as the `max` user.

To authenticate connection requests to CockroachDB from the Liquibase client, you need to generate some certificates for `max`. Use [`cockroach cert`](cockroach-cert.html#synopsis) to generate the certificates:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client max --certs-dir=certs --ca-key=my-safe-directory/ca.key --also-generate-pkcs8-key
~~~

The [`--also-generate-pkcs8-key` flag](cockroach-cert.html#flag-pkcs8) generates a key in [PKCS#8 format](https://tools.ietf.org/html/rfc5208), which is the standard key encoding format in Java. In this case, the generated PKCS8 key will be named `client.max.key.pk8`.

## Step 4: Create a changelog

Liquibase uses [changelog files](https://docs.liquibase.com/concepts/basic/changelog.html) to manage database schema changes. Changelog files include a list of instructions, known as [changesets](https://docs.liquibase.com/concepts/basic/changeset.html), that are executed against the database in a specified order. Liquibase supports XML, YAML, and SQL formats for changelogs and changesets.

Let's define a changelog with the [XML format](https://docs.liquibase.com/concepts/basic/xml-format.html):

1. Create a file named `changelog-main.xml`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ touch changelog-main.xml
    ~~~

1. Add the following to the blank `changelog-main.xml` file:

    {% include copy-clipboard.html %}
    ~~~ xml
      <?xml version="1.0" encoding="UTF-8"?>
    <databaseChangeLog
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
            xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
             http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.9.xsd">

        <changeSet id="1" author="max" runInTransaction="false">
            <validCheckSum>ANY</validCheckSum>
            <sqlFile path="create.sql"/>
        </changeSet>

    </databaseChangeLog>
    ~~~

    This first changeset uses [the `sqlFile` tag](https://docs.liquibase.com/change-types/community/sql-file.html), which tells Liquibase that an external `.sql` file contains some [SQL statements](https://docs.liquibase.com/concepts/basic/sql-format.html) to execute.

    {{site.data.alerts.callout_success}}
    CockroachDB has [limited support for online schema changes in transactions](online-schema-changes.html#limited-support-for-schema-changes-within-transactions). To avoid running into issues with incomplete transactions, we recommend setting the [`runInTransaction` attribute](https://docs.liquibase.com/concepts/basic/changeset.html#available-attributes) to `"false"` on all changesets.
    {{site.data.alerts.end}}


1. In the same directory, create the SQL file specified by the first changeset:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ touch create.sql
    ~~~

1. Add the following [`CREATE TABLE`](create-table.html) statement to the `create.sql` file:

    {% include copy-clipboard.html %}
    ~~~ sql
    create table account
    (
        id      int            not null primary key default unique_rowid(),
        balance numeric(19, 2) not null,
        name    varchar(128)   not null,
        type    varchar(25)    not null
    );
    ~~~

    When Liquibase runs, the first changeset will execute the statements in `create.sql`, creating a table named `account`.

1. Now let's use the [XML format](https://docs.liquibase.com/concepts/basic/xml-format.html) to define the second changeset. Directly after the first `changeSet` element in `changelog-main.xml`, add the following:

    {% include copy-clipboard.html %}
    ~~~ xml
    <changeSet id="2" author="max" runInTransaction="false">
        <insert tableName="account">
            <column name="id">1</column>
            <column name="name">Alice</column>
            <column name="balance" valueNumeric="500.00"/>
            <column name="type">asset</column>
        </insert>
        <insert tableName="account">
            <column name="id">2</column>
            <column name="name">Bob</column>
            <column name="balance" valueNumeric="500.00"/>
            <column name="type">expense</column>
        </insert>
        <insert tableName="account">
            <column name="id">3</column>
            <column name="name">Bobby Tables</column>
            <column name="balance" valueNumeric="500.00"/>
            <column name="type">asset</column>
        </insert>
        <insert tableName="account">
            <column name="id">4</column>
            <column name="name">Doris</column>
            <column name="balance" valueNumeric="500.00"/>
            <column name="type">expense</column>
        </insert>
    </changeSet>
    ~~~

    This second changeset uses the [Liquibase XML syntax](https://docs.liquibase.com/concepts/basic/xml-format.html) to specify a series of sequential `INSERT` statements that initialize the `account` table with some values.

When the application is started, all of the queries specified by the changesets are executed in the order specified by their `changeset` `id` values.

{{site.data.alerts.callout_success}}
When possible, we recommend limiting each changeset to a single statement, per the **one change per changeset** [Liquibase best practice](https://docs.liquibase.com/concepts/bestpractices.html). This is especially important for [online schema changes](online-schema-changes.html). For more information, see [Liquibase and transactions](#liquibase-and-transactions).
{{site.data.alerts.end}}

## Step 5. Configure a Liquibase properties file

Liquibase properties are defined in a file named [`liquibase.properties`](https://docs.liquibase.com/workflows/liquibase-community/creating-config-properties.html). These properties define the database connection information.

{{site.data.alerts.callout_info}}
You can also set Liquibase properties with the `liquibase` command-line tool.
{{site.data.alerts.end}}

To configure Liquibase properties:

1. In the same directory as `changelog-main.xml`, create a `liquibase.properties` file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ touch liquibase.properties
    ~~~

1. Add the following property definitions to the file:

    {% include copy-clipboard.html %}
    ~~~ yml
    changeLogFile: changelog-main.xml
    driver: org.postgresql.Driver
    url: jdbc:postgresql://localhost:26257/bank?sslmode=verify-full&sslrootcert=/full-path/certs/ca.crt&sslkey=/full-path/certs/client.max.key.pk8&sslcert=/full-path/certs/client.max.crt
    username: max
    ~~~

    {{site.data.alerts.callout_info}}
    For `url`, the SSL connection parameters must specify the full paths of the certificates that you generated.
    {{site.data.alerts.end}}

## Step 6. Run Liquibase

To run Liquibase from the command line, execute the following command from the directory containing your `liquibase.properties` and `changelog-main.xml` files:

{% include copy-clipboard.html %}
~~~ shell
$ liquibase update
~~~

You should see output similar to the following:

~~~
Liquibase Community 4.2.0 by Datical
####################################################
##   _     _             _ _                      ##
##  | |   (_)           (_) |                     ##
##  | |    _  __ _ _   _ _| |__   __ _ ___  ___   ##
##  | |   | |/ _` | | | | | '_ \ / _` / __|/ _ \  ##
##  | |___| | (_| | |_| | | |_) | (_| \__ \  __/  ##
##  \_____/_|\__, |\__,_|_|_.__/ \__,_|___/\___|  ##
##              | |                               ##
##              |_|                               ##
##                                                ##
##  Get documentation at docs.liquibase.com       ##
##  Get certified courses at learn.liquibase.com  ##
##  Get advanced features and support at          ##
##      liquibase.com/support                     ##
##                                                ##
####################################################
Starting Liquibase at 13:59:37 (version 4.2.0 #18 built at 2020-11-13 16:49+0000)
Liquibase: Update has been successful.
~~~

When the changelog is first executed, Liquibase also creates a table called [`databasechangelog`](https://docs.liquibase.com/concepts/databasechangelog-table.html) in the database where it performs changes. This table's rows log all completed changesets.

To see the completed changesets, open a new terminal, start the [built-in SQL shell](cockroach-sql.html), and query the `databasechangelog` table:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.databasechangelog;
~~~

~~~
  id | author |      filename      |           dateexecuted           | orderexecuted | exectype |               md5sum               |                                              description                                               | comments | tag  | liquibase | contexts | labels | deployment_id
-----+--------+--------------------+----------------------------------+---------------+----------+------------------------------------+--------------------------------------------------------------------------------------------------------+----------+------+-----------+----------+--------+----------------
  1  | max    | changelog-main.xml | 2020-11-30 13:59:38.40272+00:00  |             1 | EXECUTED | 8:567321cdb0100cbe76731a7ed414674b | sqlFile                                                                                                |          | NULL | 4.2.0     | NULL     | NULL   | 6762778263
  2  | max    | changelog-main.xml | 2020-11-30 13:59:38.542547+00:00 |             2 | EXECUTED | 8:c2945f2a445cf60b4b203e1a91d14a89 | insert tableName=account; insert tableName=account; insert tableName=account; insert tableName=account |          | NULL | 4.2.0     | NULL     | NULL   | 6762778263
(2 rows)
~~~

You can also query the `account` table directly to see the latest changes reflected in the table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.account;
~~~

~~~
  id | balance |     name     |  type
-----+---------+--------------+----------
   1 |  500.00 | Alice        | asset
   2 |  500.00 | Bob          | expense
   3 |  500.00 | Bobby Tables | asset
   4 |  500.00 | Doris        | expense
(4 rows)
~~~

{{site.data.alerts.callout_info}}
Liquibase does not [retry transactions](transactions.html#transaction-retries) automatically. If a changeset fails at startup, you might need to restart the application manually to complete the changeset.
{{site.data.alerts.end}}

## Step 7. Add additional changesets

Suppose that you want to change the primary key of the `accounts` table from a simple, incrementing [integer](int.html) (in this case, `id`) to an auto-generated [UUID](uuid.html), to follow some [CockroachDB best practices](performance-best-practices-overview.html#unique-id-best-practices). You can make these changes to the schema by creating and executing an additional changeset:

1. Create a SQL file to add a new UUID-typed column to the table:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ touch add_uuid.sql
    ~~~

    {{site.data.alerts.callout_success}}
    Using [SQL files](https://docs.liquibase.com/concepts/basic/sql-format.html) to define statements can be helpful when you want to execute statements that use syntax specific to CockroachDB.
    {{site.data.alerts.end}}

1. Add the following SQL statement to `add_uuid.sql`:

    {% include copy-clipboard.html %}
    ~~~
    /* Add new UUID-typed column */
    ALTER TABLE account ADD COLUMN unique_id UUID NOT NULL DEFAULT gen_random_uuid();
    ~~~

    This statement adds [a new `unique_id` column](add-column.html) to the `accounts` table, with the default value as [a randomly-generated UUID](performance-best-practices-overview.html#use-uuid-to-generate-unique-ids).

1. In the `changelog-main.xml` file, add the following after the second `changeSet` element:

    ~~~ xml
    <changeSet id="3" author="max" runInTransaction="false">
        <sqlFile path="add_uuid.sql"/>
    </changeSet>
    ~~~

1. Now create a SQL file to update the primary key for the table with the new column:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ touch update_pk.sql
    ~~~

1. Add the following SQL statement to `update_pk.sql`:

    {% include copy-clipboard.html %}
    ~~~
    /* Change primary key */
    ALTER TABLE account ALTER PRIMARY KEY USING COLUMNS (unique_id);
    ~~~

    This statement [alters the `accounts` primary key](alter-primary-key.html) to use the `unique_id` column.

1. In the `changelog-main.xml` file, add the following after the third `changeSet` element:

    ~~~ xml
    <changeSet id="4" author="max" runInTransaction="false">
        <sqlFile path="update_pk.sql"/>
    </changeSet>
    ~~~

1. To update the table, run `liquibase update` again:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ liquibase update
    ~~~

    You should see output similar to the following:

    ~~~
    Liquibase Community 4.2.0 by Datical
    ####################################################
    ##   _     _             _ _                      ##
    ##  | |   (_)           (_) |                     ##
    ##  | |    _  __ _ _   _ _| |__   __ _ ___  ___   ##
    ##  | |   | |/ _` | | | | | '_ \ / _` / __|/ _ \  ##
    ##  | |___| | (_| | |_| | | |_) | (_| \__ \  __/  ##
    ##  \_____/_|\__, |\__,_|_|_.__/ \__,_|___/\___|  ##
    ##              | |                               ##
    ##              |_|                               ##
    ##                                                ##
    ##  Get documentation at docs.liquibase.com       ##
    ##  Get certified courses at learn.liquibase.com  ##
    ##  Get advanced features and support at          ##
    ##      liquibase.com/support                     ##
    ##                                                ##
    ####################################################
    Starting Liquibase at 14:26:50 (version 4.2.0 #18 built at 2020-11-13 16:49+0000)
    Liquibase: Update has been successful.
    ~~~

To see the completed changesets, open a new terminal, start the [built-in SQL shell](cockroach-sql.html), and query the `databasechangelog` table:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.databasechangelog;
~~~

~~~
  id | author |      filename      |           dateexecuted           | orderexecuted | exectype |               md5sum               |                                              description                                               | comments | tag  | liquibase | contexts | labels | deployment_id
-----+--------+--------------------+----------------------------------+---------------+----------+------------------------------------+--------------------------------------------------------------------------------------------------------+----------+------+-----------+----------+--------+----------------
  1  | max    | changelog-main.xml | 2020-11-30 13:59:38.40272+00:00  |             1 | EXECUTED | 8:567321cdb0100cbe76731a7ed414674b | sqlFile                                                                                                |          | NULL | 4.2.0     | NULL     | NULL   | 6762778263
  2  | max    | changelog-main.xml | 2020-11-30 13:59:38.542547+00:00 |             2 | EXECUTED | 8:c2945f2a445cf60b4b203e1a91d14a89 | insert tableName=account; insert tableName=account; insert tableName=account; insert tableName=account |          | NULL | 4.2.0     | NULL     | NULL   | 6762778263
  3  | max    | changelog-main.xml | 2020-11-30 14:26:51.916768+00:00 |             3 | EXECUTED | 8:7b76f0ae200b1ae1d9f0c0f78979348b | sqlFile                                                                                                |          | NULL | 4.2.0     | NULL     | NULL   | 6764411427
  4  | max    | changelog-main.xml | 2020-11-30 14:26:52.609161+00:00 |             4 | EXECUTED | 8:fcaa0dca049c34c6372847af7a2646d9 | sqlFile                                                                                                |          | NULL | 4.2.0     | NULL     | NULL   | 6764411427
(4 rows)
~~~

You can also query the `account` table directly to see the latest changes reflected in the table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.account;
~~~

~~~
  id | balance |     name     |  type   |              unique_id
-----+---------+--------------+---------+---------------------------------------
   1 |  500.00 | Alice        | asset   | 3d2b7da4-0876-4ddd-8626-b980cef3323e
   2 |  500.00 | Bob          | expense | 8917ce09-c7d2-42a0-9ee4-8cb9cb3515ec
   3 |  500.00 | Bobby Tables | asset   | b5dccde6-25fe-4c73-b3a2-501225d8b235
   4 |  500.00 | Doris        | expense | f37dc62e-a2d5-4f63-801a-3eaa3fc68806
(4 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE bank.account;
~~~

~~~
      table_name      |                     create_statement
----------------------+------------------------------------------------------------
  bank.public.account | CREATE TABLE account (
                      |     id INT8 NOT NULL DEFAULT unique_rowid(),
                      |     balance DECIMAL(19,2) NOT NULL,
                      |     name VARCHAR(128) NOT NULL,
                      |     type VARCHAR(25) NOT NULL,
                      |     unique_id UUID NOT NULL DEFAULT gen_random_uuid(),
                      |     CONSTRAINT "primary" PRIMARY KEY (unique_id ASC),
                      |     UNIQUE INDEX account_id_key (id ASC),
                      |     FAMILY "primary" (id, balance, name, type, unique_id)
                      | )
(1 row)
~~~

## Liquibase and transactions

By default, Liquibase wraps each changeset within a single transaction. If the transaction fails to successfully commit, Liquibase rolls back the transaction.

CockroachDB has [limited support for online schema changes within transactions](online-schema-changes.html#limited-support-for-schema-changes-within-transactions). If a schema change fails, automatic rollbacks can lead to unexpected results. To avoid running into issues with incomplete transactions, we recommend setting the `runInTransaction` attribute on each of your changesets to `"false"`, as demonstrated throughout this tutorial.

{{site.data.alerts.callout_info}}
If `runInTransaction="false"` for a changeset, and an error occurs while Liquid is running the changeset, the `databasechangelog` table might be left in an invalid state and need to be fixed manually.
{{site.data.alerts.end}}

### Transaction retries

When multiple, concurrent transactions or statements are issued to a single CockroachDB cluster, [transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) can cause schema migrations to fail. In the event of transaction contention, CockroachDB returns a `40001 SQLSTATE` (i.e., a serialization failure).

Liquibase does not automatically retry transactions. To handle transaction failures, we recommend writing client-side transaction retry logic. For more information about client-side transaction retries in CockroachDB, see [Transaction Retries](transactions.html#transaction-retries).

## Liquibase integrations

You can run Liquibase in the context of a Java application framework, like Spring Boot. For examples of using Liquibase for schema management in a Spring Boot application built on CockroachDB, see [Build a Spring App with CockroachDB and JDBC](build-a-spring-app-with-cockroachdb-jdbc.html) and [Build a Spring App with CockroachDB and JPA](build-a-spring-app-with-cockroachdb-jpa.html).

For documentation on running Liquibase with other tooling, see [the Liquibase documentation site](https://docs.liquibase.com/workflows/liquibase-community/running.html).

## Report Issues with Liquibase and CockroachDB

If you run into problems, please file an issue on the [Liquibase issue tracker](https://github.com/liquibase/liquibase/issues), including the following details about the environment where you encountered the issue:

- CockroachDB version ([`cockroach version`](cockroach-version.html))
- Liquibase version
- Operating system
- Steps to reproduce the behavior

## See Also

+ [Liquibase documentation](https://docs.liquibase.com/home.html)
+ [Liquibase issue tracker](https://github.com/liquibase/liquibase/issues)
+ [Client connection parameters](connection-parameters.html)
+ [Third-Party Database Tools](third-party-database-tools.html)
+ [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
+ [Build a Spring App with CockroachDB and JDBC](build-a-spring-app-with-cockroachdb-jdbc.html)
+ [Build a Spring App with CockroachDB and JPA](build-a-spring-app-with-cockroachdb-jpa.html)
