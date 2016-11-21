---
title: Use the Built-in SQL Client
summary: CockroachDB comes with a built-in client for executing SQL statements from an interactive shell or directly from the command line.
toc: false
---

CockroachDB comes with a built-in client for executing SQL statements from an interactive shell or directly from the command line. To use this client, run the `cockroach sql` [command](cockroach-commands.html) as described below.  

To exit the interactive shell, use **CTRL + D**, **CTRL + C**, or `\q`.

<div id="toc"></div>

## Synopsis

~~~ shell
# Start the interactive SQL shell:
$ cockroach sql <flags>

# Execute SQL from the command line:
$ cockroach sql --execute="<sql statement>;<sql statement>" --execute="<sql-statement>" <flags>
$ echo "<sql statement>;<sql statement>" | cockroach sql <flags>
$ cockroach sql <flags> < file-containing-statements.sql
 
# View help:
$ cockroach sql --help
~~~

## Flags

The `cockroach sql` command supports the following flags as well as [logging flags](cockroach-commands.html#logging-flags).

- To start an interactive SQL shell, run `cockroach sql` with all appropriate connection flags or use just the `--url` flag, which includes connection details. 
- To execute SQL statements from the command line, use the `--execute` flag.

Flag | Description 
-----|------------
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CA_CERT` 
`--cert` | The path to the [client certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CERT`
`--database`<br>`-d` | The database to connect to.<br><br>**Env Variable:** `COCKROACH_DATABASE`  
`--execute`<br>`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons. If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each statement are printed to the standard output (see `--pretty` for formatting options).<br><br>For a demonstration of this and other ways to execute SQL from the command line, see the [examples](#execute-sql-statements-from-the-command-line) below. 
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--key` | The path to the [client key](create-security-certificates.html) protecting the client certificate. This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_KEY`
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--pretty` | When this flag is used in conjunction with `--execute`, table rows printed to the standard output are formatted using ASCII art and look the same as within the interactive SQL shell. Also, special characters are printed unescaped.<br><br>When `--execute` is used without the `--pretty` flag, table rows are printed as tab-separated values, and special characters are escaped. This makes the output easy to parse by other programs.
`--url` | The connection URL. If you use this flag, do not set any other connection flags.<br><br>For insecure connections, the URL format is: <br>`--url=postgresql://<user>@<host>:<port>/<database>?sslmode=disable`<br><br>For secure connections, the URL format is:<br>`--url=postgresql://<user>@<host>:<port>/<database>`<br>with the following parameters in the query string:<br>`sslcert=<path-to-client-crt>`<br>`sslkey=<path-to-client-key>`<br>`sslmode=verify-full`<br>`sslrootcert=<path-to-ca-crt>` <br><br>**Env Variable:** `COCKROACH_URL`
`--user`<br>`-u` | The [user](create-and-manage-users.html) connecting to the database. The user must have [privileges](privileges.html) for any statement executed.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## SQL Shell Commands

The following commands can be used within the interactive SQL shell:

Command | Usage
--------|------------
`\q`<br>**CTRL + D**<br>**CTRL + C** | Exit the shell.
`\!` | Run an external command and print its results to `stdout`. See the [example](#run-external-commands-from-the-sql-shell) below.
`\|` | Run the output of an external command as SQL statements. See the [example](#run-external-commands-from-the-sql-shell) below.
`\set <option>` | Enable a client-side option. See the table below for available options.<br><br>To see current settings, use `\set` without any options.
`\unset <option>` | Disable a client-side option. See the table below for available options.
`\?`<br>`help` | View this help within the shell.

Client Options | Description
---------------|------------
`CHECK_SYNTAX` | Validate SQL syntax on the client-side before it is sent to the server. This ensures that a typo or mistake during user entry does not inconveniently abort an ongoing transaction previously started from the interactive shell.<br><br>This option is enabled by default. To disable it, run `\unset CHECK_SYNTAX`.
`NORMALIZE_HISTORY` | Store normalized syntax in the shell history, e.g., capitalize keywords, normalize spacing, and recall multi-line statements as a single line.<br><br>This option is enabled by default. However, it is respected only when `CHECK_SYNTAX` is enabled as well. To disable this option, run `\unset NORMALIZE_HISTORY`.
`ERREXIT` | Exit the SQL shell upon encountering an error.<br><br>This option is disabled by default. To enable it, run `\set ERREXIT`.

## SQL Shell Shortcuts

The SQL shell supports many shortcuts, such as **CTRL + R** for searching the shell history. For full details, see this [Readline Shortcut](https://github.com/chzyer/readline/blob/master/doc/shortcut.md) reference.

## Examples

### Start a SQL shell

In these examples, we connect a SQL shell to a **secure cluster**.

~~~ shell
# Using standard connection flags:
$ cockroach sql --user=maxroach --ca-cert=certs/ca.cert --cert=certs/maxroach.cert --key=certs/maxroach.key  --host=roachcluster.com --port=26257 --database=critterdb 

# Using the --url flag:
$ cockroach sql --url="postgresql://maxroach@roachcluster.com:26257/critterdb?sslcert=certs/maxroach.crt&sslkey=certs/maxroach.key&sslmode=verify-full&sslrootcert=certs/ca.crt"
~~~

In these examples, we connect a SQL shell to an **insecure cluster**.

~~~ shell
# Using standard connection flags:
$ cockroach sql --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb 

# Using the --url flag:
$ cockroach sql --url="postgresql://maxroach@roachnode1.com:26257/critterdb?sslmode=disable"
~~~

### Execute SQL statement within the SQL shell

This example assume that we have already started the SQL shell (see examples above).

~~~ sql
> CREATE TABLE animals (id SERIAL PRIMARY KEY, name STRING);

> INSERT INTO animals (name) VALUES ('bobcat'), ('🐢 '), ('barn owl');

> SELECT * FROM animals;
~~~
~~~
+--------------------+----------+
|         id         |   name   |
+--------------------+----------+
| 148899952591994881 | bobcat   |
| 148899952592060417 | 🐢        |
| 148899952592093185 | barn owl |
+--------------------+----------+
~~~

### Execute SQL statements from the command line

In these examples, we use the `--execute` flag to execute statements from the command line.

~~~ shell
# Statements with a single --execute flag:
$ cockroach sql --execute="CREATE TABLE roaches (name STRING, country STRING); INSERT INTO roaches VALUES ('American Cockroach', 'United States'), ('Brownbanded Cockroach', 'United States')" --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb
CREATE TABLE
INSERT 2 

# Statements with multiple --execute flags:
$ cockroach sql --execute="CREATE TABLE roaches (name STRING, country STRING)" --execute="INSERT INTO roaches VALUES ('American Cockroach', 'United States'), ('Brownbanded Cockroach', 'United States')" --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb   
CREATE TABLE
INSERT 2
~~~

In this example, we use the `echo` command to execute statements from the command line.

~~~ shell
# Statements with the echo command:
$ echo "SHOW TABLES; SELECT * FROM roaches;" | cockroach sql --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb
+----------+
|  Table   |
+----------+
| roaches  |
+----------+
+-----------------------+---------------+
|         name          |    country    |
+-----------------------+---------------+
| American Cockroach    | United States |
| Brownbanded Cockroach | United States |
+-----------------------+---------------+
~~~

In these examples, we show tables and special characters printed with and without the `--pretty` flag. Note that when not using `--pretty`, table rows are printed as tab-separated values, and special characters are escaped; thus, the output is easy to parse by other programs.

~~~ shell
# Using the --pretty flag in conjunction with --execute:
$ cockroach sql --pretty --execute="INSERT INTO emojis VALUES ('🐥 '), ('🐢 ') RETURNING *;"
+----+
| a  |
+----+
| 🐥  |
| 🐢  |
+----+

# Using --execute without the --pretty flag:
$ cockroach sql --execute="INSERT INTO emojis VALUES ('🐥 '), ('🐢 ') RETURNING *;"
2 rows
a
"\U0001f425 "
"\U0001f422 "
~~~

### Execute SQL statements from a file

In this example, we show and then execute the contents of a file containing SQL statements.

~~~ shell
$ cat statements.sql
CREATE TABLE roaches (name STRING, country STRING);
INSERT INTO roaches VALUES ('American Cockroach', 'United States'), ('Brownbanded Cockroach', 'United States');

$ cockroach sql --user=maxroach --host=roachcluster.com ---port=26257 --database=critterdb < statements.sql
CREATE TABLE
INSERT 2
~~~

### Run external commands from the SQL shell

In this example, we use `\!` to look at the rows in a CSV file before creating a table and then using `\|` to insert those rows into the table.

{{site.data.alerts.callout_info}}This example works only if the values in the CSV file are numbers. For values in other formats, use an online CSV-to-SQL converter or make your own import program.{{site.data.alerts.end}}

~~~ sql
> \! cat test.csv
~~~
~~~
12, 13, 14
10, 20, 30
~~~
~~~ sql
> CREATE TABLE csv (x INT, y INT, z INT);

> \| IFS=","; while read a b c; do echo "insert into csv values ($a, $b, $c);"; done < test.csv;

> SELECT * FROM csv;
~~~
~~~
+----+----+----+
| x  | y  | z  |
+----+----+----+
| 12 | 13 | 14 |
| 10 | 20 | 30 |
+----+----+----+
~~~

In this example, we create a table and then use `\|` to programmatically insert values.

~~~ sql
> CREATE TABLE for_loop (x INT);

> \| for ((i=0;i<10;++i)); do echo "INSERT INTO for_loop VALUES ($i);"; done

> SELECT * FROM for_loop;
~~~
~~~
+---+
| x |
+---+
| 0 |
| 1 |
| 2 |
| 3 |
| 4 |
| 5 |
| 6 |
| 7 |
| 8 |
| 9 |
+---+
~~~

## See Also

- [Other Cockroach Commands](cockroach-commands.html)
- [SQL Statements](sql-statements.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)