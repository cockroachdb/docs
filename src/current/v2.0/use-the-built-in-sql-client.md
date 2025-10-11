---
title: Use the Built-in SQL Client
summary: CockroachDB comes with a built-in client for executing SQL statements from an interactive shell or directly from the command line.
toc: true
---

CockroachDB comes with a built-in client for executing SQL statements from an interactive shell or directly from the command line. To use this client, run the `cockroach sql` [command](cockroach-commands.html) as described below.

To exit the interactive shell, use `\q` or `ctrl-d`.


## Synopsis

{% include_cached copy-clipboard.html %}
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

The `sql` command supports the following types of flags:

- [General Use](#general)
- [Client Connection](#client-connection)
- [Logging](#logging)

### General

- To start an interactive SQL shell, run `cockroach sql` with all appropriate connection flags or use just the [`--url` flag](#sql-flag-url), which includes [connection details](connection-parameters.html#connect-using-a-url).
- To execute SQL statements from the command line, use the [`--execute` flag](#sql-flag-execute).

Flag | Description
-----|------------
`--database`<br>`-d` | A database name to use as [current database](sql-name-resolution.html#current-database) in the newly created session.
`--echo-sql` | <span class="version-tag">New in v1.1:</span> Reveal the SQL statements sent implicitly by the command-line utility. For a demonstration, see the [example](#reveal-the-sql-statements-sent-implicitly-by-the-command-line-utility) below.<br><br>This can also be enabled within the interactive SQL shell via the `\set echo` [shell command](#sql-shell-commands).
<a name="sql-flag-execute"></a> `--execute`<br />`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons. If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each statement are printed to the standard output (see `--format` for formatting options).<br><br>For a demonstration of this and other ways to execute SQL from the command line, see the [example](#execute-sql-statements-from-the-command-line) below.
<a name="sql-flag-format"></a> `--format` | How to display table rows printed to the standard output. Possible values: `tsv`, `csv`, `pretty`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `pretty` for [interactive sessions](#interactive-sessions), `tsv` for non-interactive sessions<br /><br />Corresponds to the [`display_format`](#sql-option-display-format) SQL shell option for use in interactive sessions.
`--safe-updates` | <span class="version-tag">Changed in v2.0:</span> Disallow potentially unsafe SQL statements, including `DELETE` without a `WHERE` clause, `UPDATE` without a `WHERE` clause, and `ALTER TABLE ... DROP COLUMN`.<br><br>**Default:** `true` for [interactive sessions](#interactive-sessions), `false` otherwise.<br /><br />Potentially unsafe SQL statements can also be allowed/disallowed for an entire session via the `sql_safe_updates` [session variable](set-vars.html).

### Client Connection

{% include {{ page.version.version }}/sql/connection-parameters-with-url.md %}

See [Client Connection Parameters](connection-parameters.html) for more details.

### Logging

By default, the `sql` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## SQL Shell Welcome

When the SQL shell connects (or reconnects) to a CockroachDB node, it prints a welcome text with some tips and CockroachDB version and cluster details:

~~~ shell
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
#
# Server version: CCL {{page.release_info.version}} (darwin amd64, built 2017/07/13 11:43:06, go1.8) (same version as client)
# Cluster ID: 7fb9f5b4-a801-4851-92e9-c0db292d03f1
#
# Enter \? for a brief introduction.
#
>
~~~

<span class="version-tag">New in v1.1:</span> The **Version** and **Cluster ID** details are particularly noteworthy:

- When the client and server versions of CockroachDB are the same, the shell prints the `Server version` followed by `(same version as client)`.
- When the client and server versions are different, the shell prints both the `Client version` and `Server version`. In this case, you may want to [plan an upgrade](upgrade-cockroach-version.html) of older client or server versions.
- Since every CockroachDB cluster has a unique ID, you can use the `Cluster ID` field to verify that your client is always connecting to the correct cluster.

## Interactive Sessions

`cockroach sql` distinguishes between an *interactive session* and other sessions that generate terminal output. An interactive session is one where there's a user manually entering queries and looking at the results. This is detected using the following criteria:

- The `cockroach sql` command is used
- Standard input is a terminal, not redirected
- The [`--execute` flag](#sql-flag-execute) is not used

When an interactive session is detected, the following options have their defaults changed:

+ The [`--format` flag](#sql-flag-format) (and its corresponding [`display_format` option](#sql-option-display-format)) default to `pretty`.
+ The [`errexit` option](#sql-option-errexit) defaults to `false`.
+ The [`check_syntax` option](#sql-option-check-syntax) defaults to `true`.
+ The [`smart_prompt` option](#sql-option-smart-prompt) defaults to `true`.

## SQL Shell Commands

The following commands can be used within the interactive SQL shell:

Command | Usage
--------|------------
`\q`<br>`ctrl-d` | Exit the shell.<br><br>When no text follows the prompt, `ctrl-c` exits the shell as well; otherwise, `ctrl-c` clears the line.
`\!` | Run an external command and print its results to `stdout`. See the [example](#run-external-commands-from-the-sql-shell) below.
<code>&#92;&#124;</code> | Run the output of an external command as SQL statements. See the [example](#run-external-commands-from-the-sql-shell) below.
`\set <option>` | Enable a client-side option. For available options, see [SQL Shell Options](#sql-shell-options).<br><br>To view help and the current settings, use `\set` without any options.
`\unset <option>` | Disable a client-side option. For available options, see [SQL Shell Options](#sql-shell-options).
`\?`<br>`help` | View this help within the shell.
`\h <statement>`<br>`\hf <function>` | <span class="version-tag">New in v1.1:</span> View help for specific SQL statements or functions. See [SQL Shell Help](#sql-shell-help) for more details.

### SQL Shell Options

To view help and the current settings, use `\set` without any options. To enable or disable a shell option, use `\set <option>` or `\unset <option>`.

Client Options | Description
---------------|------------
<a name="sql-option-display-format"></a> `display_format` | <span class="version-tag">Updated in v2.0:</span> How to display table rows printed within the interactive SQL shell. Possible values: `tsv`, `csv`, `pretty`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `pretty` when the output goes to a terminal and the [`--format` flag](#sql-flag-format) is not passed at startup, `tsv` otherwise.<br /><br />To change this option, run `\set display_format <format>`. For a demonstration, see the [example](#make-the-output-of-show-statements-selectable) below.
`echo` | <span class="version-tag">New in v1.1:</span> Reveal the SQL statements sent implicitly by the SQL shell.<br><br>**Default:** `false`. To enable it, run `\set echo`. For a demonstration, see the [example](#reveal-the-sql-statements-sent-implicitly-by-the-command-line-utility) below.
<a name="sql-option-errexit"></a> `errexit` | <span class="version-tag">Updated in v2.0:</span> Exit the SQL shell upon encountering an error.<br /><br />**Default:** `false` for [interactive sessions](#interactive-sessions), `true` otherwise. To enable it, run `\set errexit`.
<a name="sql-option-check-syntax"></a> `check_syntax` | Validate SQL syntax. This ensures that a typo or mistake during user entry does not inconveniently abort an ongoing transaction previously started from the interactive shell.<br /><br />**Default:** `true` for [interactive sessions](#interactive-sessions), `false` otherwise. To disable it, run `\unset check_syntax`.
`show_times` | <span class="version-tag">New in v1.1:</span> Reveal the time a query takes to complete.<br><br>**Default:** `true`. To disable it, run `\unset show_times`.
<a name="sql-option-smart-prompt"></a> `smart_prompt` | <span class="version-tag">New in v1.1:</span> Query the server for the current transaction status and return it to the prompt.<br /><br />**Default:** `true` for [interactive sessions](#interactive-sessions), `false` otherwise. However, it is respected only when `ECHO` is enabled as well. To disable this option, run `\unset smart_prompt`.

### SQL Shell Help

Within the SQL shell, you can get interactive help about statements and functions:

Command | Usage
--------|------
`\h`<br>`??` | List all available SQL statements, by category.
`\hf` | List all available SQL functions, in alphabetical order.
`\h <statement>`<br>or `<statement> ?` | View help for a specific SQL statement.
`\hf <function>`<br>or `<function> ?` | View help for a specific SQL function.

#### Examples

{% include_cached copy-clipboard.html %}
~~~ sql
> \h UPDATE
~~~

~~~
Command:     UPDATE
Description: update rows of a table
Category:    data manipulation
Syntax:
UPDATE <tablename> [[AS] <name>] SET ... [WHERE <expr>] [RETURNING <exprs...>]

See also:
  SHOW TABLES
  INSERT
  UPSERT
  DELETE
  https://www.cockroachlabs.com/docs/v1.1/update.html
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> \hf uuid_v4
~~~

~~~
Function:    uuid_v4
Category:    built-in functions
Returns a UUID.

Signature          Category
uuid_v4() -> bytes [ID Generation]

See also:
  https://www.cockroachlabs.com/docs/v1.1/functions-and-operators.html
~~~
### SQL Shell Shortcuts

The SQL shell supports many shortcuts, such as `ctrl-r` for searching the shell history. For full details, see this [Readline Shortcut](https://github.com/chzyer/readline/blob/master/doc/shortcut.md) reference.

## Examples

### Start a SQL shell

In these examples, we connect a SQL shell to a **secure cluster**.

{% include_cached copy-clipboard.html %}
~~~ shell
# Using standard connection flags:
$ cockroach sql \
--certs-dir=certs \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
# Using the --url flag:
$ cockroach sql \
--url="postgresql://maxroach@12.345.67.89:26257/critterdb?sslcert=certs/client.maxroach.crt&sslkey=certs/client.maxroach.key&sslmode=verify-full&sslrootcert=certs/ca.crt"
~~~

In these examples, we connect a SQL shell to an **insecure cluster**.

{% include_cached copy-clipboard.html %}
~~~ shell
# Using standard connection flags:
$ cockroach sql --insecure \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb
~~~

{% include_cached copy-clipboard.html %}
~~~
# Using the --url flag:
$ cockroach sql \
--url="postgresql://maxroach@12.345.67.89:26257/critterdb?sslmode=disable"
~~~

### Execute SQL statement within the SQL shell

This example assumes that we have already started the SQL shell (see examples above).

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE animals (id INT PRIMARY KEY DEFAULT unique_rowid(), name STRING);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO animals (name) VALUES ('bobcat'), ('🐢 '), ('barn owl');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
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

In these examples, we use the `--execute` flag to execute statements from the command line:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

In this example, we use the `echo` command to execute statements from the command line:

{% include_cached copy-clipboard.html %}
~~~ shell
# Statements with the echo command:
$ echo "SHOW TABLES; SELECT * FROM roaches;" | cockroach sql --insecure --user=maxroach --host=12.345.67.89 --port=26257 --database=critterdb
~~~

~~~
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

### Control how table rows are printed

In these examples, we show tables and special characters printed in various formats.

When the standard output is a terminal, `--format` defaults to `pretty` and tables are printed with ASCII art and special characters are not escaped for easy human consumption:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
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

However, you can explicitly set `--format` to another format, for example, `tsv` or `html`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--format=tsv \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb
~~~

~~~
1 row
chick	turtle
🐥	🐢
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--format=html \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb
~~~

~~~
<table>
<thead><tr><th>chick</th><th>turtle</th></tr></head>
<tbody>
<tr><td>🐥</td><td>🐢</td></tr>
</tbody>
</table>
~~~

When piping output to another command or a file, `--format` defaults to `tsv`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" > out.txt \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat out.txt
~~~

~~~
1 row
chick	turtle
🐥	🐢
~~~

However, you can explicitly set `--format` to another format, for example, `pretty`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--format=pretty \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" > out.txt \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat out.txt
~~~

~~~
+-------+--------+
| chick | turtle |
+-------+--------+
| 🐥    | 🐢     |
+-------+--------+
(1 row)
~~~

### Make the output of `SHOW` statements selectable

To make it possible to select from the output of `SHOW` statements, set `--format` to `raw`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--format=raw \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=critterdb
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE customers;
~~~

~~~
# 2 columns
# row 1
## 14
test.customers
## 185
CREATE TABLE customers (
	id INT NOT NULL,
	email STRING NULL,
	CONSTRAINT "primary" PRIMARY KEY (id ASC),
	UNIQUE INDEX customers_email_key (email ASC),
	FAMILY "primary" (id, email)
)
# 1 row
~~~

When `--format` is not set to `raw`, you can use the `display_format` [SQL shell option](#sql-shell-options) to change the output format within the interactive session:

{% include_cached copy-clipboard.html %}
~~~ sql
> \set display_format raw
~~~

~~~
# 2 columns
# row 1
## 14
test.customers
## 185
CREATE TABLE customers (
  id INT NOT NULL,
  email STRING NULL,
  CONSTRAINT "primary" PRIMARY KEY (id ASC),
  UNIQUE INDEX customers_email_key (email ASC),
  FAMILY "primary" (id, email)
)
# 1 row
~~~

### Execute SQL statements from a file

In this example, we show and then execute the contents of a file containing SQL statements.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat > statements.sql
~~~

{% include_cached copy-clipboard.html %}
~~~
CREATE TABLE roaches (name STRING, country STRING);
INSERT INTO roaches VALUES ('American Cockroach', 'United States'), ('Brownbanded Cockroach', 'United States');
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> \! cat test.csv
~~~

~~~
12, 13, 14
10, 20, 30
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE csv (x INT, y INT, z INT);
~~~

{% include_cached copy-clipboard.html %}
~~~
> \| IFS=","; while read a b c; do echo "insert into csv values ($a, $b, $c);"; done < test.csv;
~~~

{% include_cached copy-clipboard.html %}
~~~
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE for_loop (x INT);
~~~

{% include_cached copy-clipboard.html %}
~~~
> \| for ((i=0;i<10;++i)); do echo "INSERT INTO for_loop VALUES ($i);"; done
~~~

{% include_cached copy-clipboard.html %}
~~~
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

### Allow potentially unsafe SQL statements

The `--safe-updates` flag defaults to `true`. This prevents SQL statements that may have broad, undesired side-effects. For example, by default, we cannot use `DELETE` without a `WHERE` clause to delete all rows from a table:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --execute="SELECT * FROM db1.t1"
~~~

~~~
+----+------+
| id | name |
+----+------+
|  1 | a    |
|  2 | b    |
|  3 | c    |
|  4 | d    |
|  5 | e    |
|  6 | f    |
|  7 | g    |
|  8 | h    |
|  9 | i    |
| 10 | j    |
+----+------+
(10 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --execute="DELETE FROM db1.t1"
~~~

~~~
Error: pq: rejected: DELETE without WHERE clause (sql_safe_updates = true)
Failed running "sql"
~~~

However, to allow an "unsafe" statement, you can set `--safe-updates=false`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --safe-updates=false --execute="DELETE FROM db1.t1"
~~~

~~~
DELETE 10
~~~

{{site.data.alerts.callout_info}}Potentially unsafe SQL statements can also be allowed/disallowed for an entire session via the <code>sql_safe_updates</code> <a href="set-vars.html">session variable</a>.{{site.data.alerts.end}}

### Reveal the SQL statements sent implicitly by the command-line utility

In this example, we use the `--execute` flag to execute statements from the command line and the `--echo-sql` flag to reveal SQL statements sent implicitly:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--execute="CREATE TABLE t1 (id INT PRIMARY KEY, name STRING)" \
--execute="INSERT INTO t1 VALUES (1, 'a'), (2, 'b'), (3, 'c')" \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=db1
--echo-sql
~~~

~~~
# Server version: CockroachDB CCL f8f3c9317 (darwin amd64, built 2017/09/13 15:05:35, go1.8) (same version as client)
# Cluster ID: 847a4ba5-c78a-465a-b1a0-59fae3aab520
> SET sql_safe_updates = TRUE
> CREATE TABLE t1 (id INT PRIMARY KEY, name STRING)
CREATE TABLE
> INSERT INTO t1 VALUES (1, 'a'), (2, 'b'), (3, 'c')
INSERT 3
~~~

In this example, we start the interactive SQL shell and enable the `echo` shell option to reveal SQL statements sent implicitly:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--user=maxroach \
--host=12.345.67.89 \
--port=26257 \
--database=db1
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> \set echo
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO db1.t1 VALUES (4, 'd'), (5, 'e'), (6, 'f');
~~~

~~~
> INSERT INTO db1.t1 VALUES (4, 'd'), (5, 'e'), (6, 'f');
INSERT 3

Time: 2.426534ms

> SHOW TRANSACTION STATUS
> SHOW DATABASE
~~~

## See Also

- [Client Connection Parameters](connection-parameters.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [SQL Statements](sql-statements.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
- [Import Data](import-data.html)
