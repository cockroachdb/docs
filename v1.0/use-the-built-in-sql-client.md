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

The `sql` command supports the following [general-use](#general) and [logging](#logging) flags.

### General

- To start an interactive SQL shell, run `cockroach sql` with all appropriate connection flags or use just the `--url` flag, which includes connection details.
- To execute SQL statements from the command line, use the `--execute` flag.

Flag | Description
-----|------------
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). The directory must contain valid certificates if running in secure mode.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--database`<br>`-d` | The database to connect to.<br><br>**Env Variable:** `COCKROACH_DATABASE`
`--execute`<br>`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons. If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each statement are printed to the standard output (see `--pretty` for formatting options).<br><br>For a demonstration of this and other ways to execute SQL from the command line, see the [examples](#execute-sql-statements-from-the-command-line) below.
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--pretty` | Format table rows printed to the standard output using ASCII art and disable escaping of special characters.<br><br>When disabled with `--pretty=false`, or when the standard output is not a terminal, table rows are printed as tab-separated values, and special characters are escaped. This makes the output easy to parse by other programs.<br><br>**Default:** `true` when output is a terminal, `false` otherwise
`--url` | The connection URL. If you use this flag, do not set any other connection flags.<br><br>For insecure connections, the URL format is: <br>`--url=postgresql://<user>@<host>:<port>/<database>?sslmode=disable`<br><br>For secure connections, the URL format is:<br>`--url=postgresql://<user>@<host>:<port>/<database>`<br>with the following parameters in the query string:<br>`sslcert=<path-to-client-crt>`<br>`sslkey=<path-to-client-key>`<br>`sslmode=verify-full`<br>`sslrootcert=<path-to-ca-crt>` <br><br>**Env Variable:** `COCKROACH_URL`
`--user`<br>`-u` | The [user](create-and-manage-users.html) connecting to the database. The user must have [privileges](privileges.html) for any statement executed.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

### Logging

By default, the `sql` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## SQL Shell Commands

The following commands can be used within the interactive SQL shell:

Command | Usage
--------|------------
`\q`<br>**CTRL + D**<br>**CTRL + C** | Exit the shell.
`\!` | Run an external command and print its results to `stdout`. See the [example](#run-external-commands-from-the-sql-shell) below.
` \\| ` | Run the output of an external command as SQL statements. See the [example](#run-external-commands-from-the-sql-shell) below.
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
$ cockroach sql \
--certs-dir=certs \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb

# Using the --url flag:
$ cockroach sql \
--url="postgresql://maxroach@12.345.67.89:26257/critterdb?sslcert=certs/client.maxroach.crt&sslkey=certs/client.maxroach.key&sslmode=verify-full&sslroot=certs/ca.crt"
~~~

In these examples, we connect a SQL shell to an **insecure cluster**.


~~~ shell
# Using standard connection flags:
$ cockroach sql --insecure \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb

# Using the --url flag:
$ cockroach sql \
--url="postgresql://maxroach@12.345.67.89:26257/critterdb?sslmode=disable"
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
$ cockroach sql --insecure \
--execute="CREATE TABLE roaches (name STRING, country STRING); INSERT INTO roaches VALUES ('American Cockroach', 'United States'), ('Brownbanded Cockroach', 'United States')" \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb
~~~

~~~
CREATE TABLE
INSERT 2
~~~

~~~ shell
# Statements with multiple --execute flags:
$ cockroach sql --insecure \
--execute="CREATE TABLE roaches (name STRING, country STRING)" \
--execute="INSERT INTO roaches VALUES ('American Cockroach', 'United States'), ('Brownbanded Cockroach', 'United States')" \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb
~~~

~~~
CREATE TABLE
INSERT 2
~~~

In this example, we use the `echo` command to execute statements from the command line.

~~~ shell
# Statements with the echo command:
$ echo "SHOW TABLES; SELECT * FROM roaches;" | cockroach sql --insecure --user=maxroach --host=12.345.67.89 --port=26257 --database=critterdb
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

### Print with or without pretty output

In these examples, we show tables and special characters printed with and without pretty output. When pretty output is enabled, tables are printed with ASCII art and special characters are not escaped for easy human consumption. When pretty output is disabled, table rows are printed as tab-separated values, and special characters are escaped; thus, the output is easy to parse by other programs.

When the standard output is a terminal, pretty output is enabled by default, but you can explicitly disable it with `--pretty=false`:

~~~ shell
# Using the default pretty output:
$ cockroach sql --insecure \
--pretty \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb
~~~

~~~
+-------+--------+
| chick | turtle |
+-------+--------+
| 🐥    | 🐢     |
+-------+--------+
~~~

~~~ shell
# Explicitly disabling pretty output:
$ cockroach sql --insecure \
--pretty=false \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb
~~~

~~~
1 row
chick turtle
"\U0001f425"  "\U0001f422"
~~~

When piping output to another command or a file, the default is reversed. Pretty output is disabled by default, but you can explicitly request it with `--pretty`:

~~~ shell
# Using the default non-pretty output:
$ cockroach sql --insecure \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" > out.txt \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb

$ cat out.txt
~~~

~~~
1 row
chick turtle
"\U0001f425"  "\U0001f422"
~~~

~~~ shell
# Explicitly requesting pretty output:
$ cockroach sql --insecure \
--pretty \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" > out.txt \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb

$ cat out.txt
~~~

~~~
+-------+--------+
| chick | turtle |
+-------+--------+
| 🐥    | 🐢     |
+-------+--------+
~~~

If `--pretty` is specified without `--execute`, it will apply to the format of every table's output in the resulting interactive SQL shell.

### Execute SQL statements from a file

In this example, we show and then execute the contents of a file containing SQL statements.

~~~ shell
$ cat statements.sql
~~~

~~~
CREATE TABLE roaches (name STRING, country STRING);
INSERT INTO roaches VALUES ('American Cockroach', 'United States'), ('Brownbanded Cockroach', 'United States');
~~~

~~~ shell
$ cockroach sql --insecure \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb \
< statements.sql
~~~

~~~
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
- [Import Data](import-data.html)
