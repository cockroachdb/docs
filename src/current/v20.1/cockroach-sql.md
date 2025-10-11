---
title: cockroach sql
summary: CockroachDB comes with a built-in client for executing SQL statements from an interactive shell or directly from the command line.
toc: true
key: use-the-built-in-sql-client.html
---

CockroachDB comes with a built-in client for executing SQL statements from an interactive shell or directly from the command line. To use this client, run the `cockroach sql` [command](cockroach-commands.html) as described below.

To exit the interactive shell, use `\q`, `quit`, `exit`, or `ctrl-d`.

{{site.data.alerts.callout_success}}
If you want to experiment with CockroachDB SQL but do not have a cluster already running, you can use the [`cockroach demo`](cockroach-demo.html) command to open a shell to a temporary, in-memory cluster.
{{site.data.alerts.end}}

## Synopsis

Start the interactive SQL shell:

~~~ shell
$ cockroach sql <flags>
~~~

Execute SQL from the command line:

~~~ shell
$ cockroach sql --execute="<sql statement>;<sql statement>" --execute="<sql-statement>" <flags>
~~~
~~~ shell
$ echo "<sql statement>;<sql statement>" | cockroach sql <flags>
~~~
~~~ shell
$ cockroach sql <flags> < file-containing-statements.sql
~~~

Exit the interactive SQL shell:

~~~ shell
$ \q
~~~
~~~ shell
$ quit
~~~
~~~ shell
$ exit
~~~
~~~ shell
ctrl-d
~~~

View help:

~~~ shell
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
`--echo-sql` | Reveal the SQL statements sent implicitly by the command-line utility. For a demonstration, see the [example](#reveal-the-sql-statements-sent-implicitly-by-the-command-line-utility) below.<br><br>This can also be enabled within the interactive SQL shell via the `\set echo` [shell command](#commands).
<a name="sql-flag-execute"></a> `--execute`<br />`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons. If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each statement are printed to the standard output (see `--format` for formatting options).<br><br>For a demonstration of this and other ways to execute SQL from the command line, see the [example](#execute-sql-statements-from-the-command-line) below.
<a name="sql-flag-format"></a> `--format` | How to display table rows printed to the standard output. Possible values: `tsv`, `csv`, `table`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `table` for sessions that [output on a terminal](#session-and-output-types); `tsv` otherwise<br /><br />This flag corresponds to the `display_format` [client-side option](#client-side-options).
`--safe-updates` | Disallow potentially unsafe SQL statements, including `DELETE` without a `WHERE` clause, `UPDATE` without a `WHERE` clause, and `ALTER TABLE ... DROP COLUMN`.<br><br>**Default:** `true` for [interactive sessions](#session-and-output-types); `false` otherwise<br /><br />Potentially unsafe SQL statements can also be allowed/disallowed for an entire session via the `sql_safe_updates` [session variable](set-vars.html).
`--set` | Set a [client-side option](#client-side-options) before starting the SQL shell or executing SQL statements from the command line via `--execute`. This flag may be specified multiple times, once per option.<br><br>After starting the SQL shell, the `\set` and `unset` commands can be use to enable and disable client-side options as well.  
`--watch` | Repeat the SQL statements specified with `--execute` or `-e` until a SQL error occurs or the process is terminated. `--watch` applies to all `--execute` or `-e` flags in use.<br />You must also specify an interval at which to repeat the statement, followed by a time unit. For example, to specify an interval of 5 seconds, use `5s`.<br /><br /> Note that this flag is intended for simple monitoring scenarios during development and testing. See the [example](#repeat-a-sql-statement) below.

### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

See [Client Connection Parameters](connection-parameters.html) for more details.

### Logging

By default, the `sql` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Session and output types

`cockroach sql` exhibits different behaviors depending on whether or not the session is interactive and/or whether or not the session outputs on a terminal.

- A session is **interactive** when `cockroach sql` is invoked without the `--execute` flag and input is not redirected from a file. In such cases:
    - The [`errexit` option](#sql-option-errexit) defaults to `false`.
    - The [`check_syntax` option](#sql-option-check-syntax) defaults to `true` if supported by the CockroachDB server (this is checked when the shell starts up).
    - **Ctrl+C** at the prompt will only terminate the shell if no other input was entered on the same line already.
    - The shell will attempt to set the `safe_updates` [session variable](set-vars.html) to `true` on the server.
- A session **outputs on a terminal** when output is not redirected to a file. In such cases:
    - The [`--format` flag](#sql-flag-format) and its corresponding [`display_format` option](#sql-option-display-format) default to `table`. These default to `tsv` otherwise.
    - The `show_times` option defaults to `true`.

When a session is both interactive and outputs on a terminal, `cockroach sql` also activates the interactive prompt with a line editor that can be used to modify the current line of input. Also, command history becomes active.

## SQL shell

### Welcome message

When the SQL shell connects (or reconnects) to a CockroachDB node, it prints a welcome text with some tips and CockroachDB version and cluster details:

~~~ shell
#
# Welcome to the CockroachDB SQL shell.
# All statements must be terminated by a semicolon.
# To exit, type: \q.
#
# Server version: CockroachDB CCL {{page.release_info.version}} (x86_64-apple-darwin17.7.0, built 2019/09/13 00:07:19, go1.12.6) (same version as client)
# Cluster ID: 7fb9f5b4-a801-4851-92e9-c0db292d03f1
#
# Enter \? for a brief introduction.
#
>
~~~

The **Version** and **Cluster ID** details are particularly noteworthy:

- When the client and server versions of CockroachDB are the same, the shell prints the `Server version` followed by `(same version as client)`.
- When the client and server versions are different, the shell prints both the `Client version` and `Server version`. In this case, you may want to [plan an upgrade](upgrade-cockroach-version.html) of older client or server versions.
- Since every CockroachDB cluster has a unique ID, you can use the `Cluster ID` field to verify that your client is always connecting to the correct cluster.

### Commands

The following commands can be used within the interactive SQL shell:

Command | Usage
--------|------------
`\?`<br>`help` | View this help within the shell.
`\q`<br>`quit`<br>`exit`<br>`ctrl-d` | Exit the shell.<br><br>When no text follows the prompt, `ctrl-c` exits the shell as well; otherwise, `ctrl-c` clears the line.
`\!` | Run an external command and print its results to `stdout`. See the [example](#run-external-commands-from-the-sql-shell) below.
<code>&#92;&#124;</code> | Run the output of an external command as SQL statements. See the [example](#run-external-commands-from-the-sql-shell) below.
`\set <option>`<br>`\unset <option>` | Enable or disable a client-side option. For more details, see [Client-side options](#client-side-options).<br><br>You can also use the [`--set` flag](#general) to enable or disable client-side options before starting the SQL shell.
`\show` | During a multi-line statement or transaction, show the SQL entered so far.
`\h <statement>`<br>`\hf <function>` | View help for specific SQL statements or functions. See [SQL shell help](#help) for more details.
`\l` | List all databases in the CockroachDB cluster. This command is equivalent to [`SHOW DATABASES`](show-databases.html).
`\dt`<br>`d` | Show the tables of the current schema in the current database. These commands are equivalent to [`SHOW TABLES`](show-tables.html).
`\du` | List the users for all databases. This command is equivalent to [`SHOW USERS`](show-users.html).
`\d <table>` | Show details about columns in the specified table. This command is equivalent to [`SHOW COLUMNS`](show-columns.html).

### Client-side options

- To view option descriptions and how they are currently set, use `\set` without any options.
- To enable or disable an option, use `\set <option> <value>` or `\unset <option> <value>`. You can also use the form `<option>=<value>`.
- If an option accepts a boolean value:
    - `\set <option>` without `<value>` is equivalent to `\set <option> true`, and `\unset <option>` without `<value>` is equivalent to `\set <option> false`.
    - `on` and `0` are aliases for `true`, and `off` and `1` are aliases for `false`.

Client Options | Description
---------------|------------
<a name="sql-option-auto-trace"></a> `auto_trace` | For every statement executed, the shell also produces the trace for that statement in a separate result below. A trace is also produced in case the statement produces a SQL error.<br><br>**Default:** `off`<br><br>To enable this option, run `\set auto_trace on`.
<a name="sql-option-display-format"></a> `display_format` | How to display table rows printed within the interactive SQL shell. Possible values: `tsv`, `csv`, `table`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `table` for sessions that [output on a terminal](#session-and-output-types); `tsv` otherwise<br /><br />To change this option, run `\set display_format <format>`. For a demonstration, see the [example](#make-the-output-of-show-statements-selectable) below.
`echo` | Reveal the SQL statements sent implicitly by the SQL shell.<br><br>**Default:** `false`<br><br>To enable this option, run `\set echo`. For a demonstration, see the [example](#reveal-the-sql-statements-sent-implicitly-by-the-command-line-utility) below.
<a name="sql-option-errexit"></a> `errexit` | Exit the SQL shell upon encountering an error.<br /><br />**Default:** `false` for [interactive sessions](#session-and-output-types); `true` otherwise<br><br>To enable this option, run `\set errexit`.
<a name="sql-option-check-syntax"></a> `check_syntax` | Validate SQL syntax. This ensures that a typo or mistake during user entry does not inconveniently abort an ongoing transaction previously started from the interactive shell.<br /><br />**Default:** `true` for [interactive sessions](#session-and-output-types); `false` otherwise.<br><br>To disable this option, run `\unset check_syntax`.
`show_times` | Reveal the time a query takes to complete.<br><br>**Default:** `true`<br><br>To disable this option, run `\unset show_times`.
<a name="sql-option-smart-prompt"></a> `smart_prompt` | Query the server for the current transaction status and return it to the prompt. Note that this option is respected only when `ECHO` is enabled as well.<br /><br />**Default:** `true` for [interactive sessions](#session-and-output-types); `false` otherwise<br><br>To disable this option, run `\unset smart_prompt`.

### Help

Within the SQL shell, you can get interactive help about statements and functions:

Command | Usage
--------|------
`\h`<br>`??` | List all available SQL statements, by category.
`\hf` | List all available SQL functions, in alphabetical order.
`\h <statement>`<br>or `<statement> ?` | View help for a specific SQL statement.
`\hf <function>`<br>or `<function> ?` | View help for a specific SQL function.

#### Examples

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
  https://www.cockroachlabs.com/docs/v2.1/update.html
~~~

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
  https://www.cockroachlabs.com/docs/v2.1/functions-and-operators.html
~~~

### Shortcuts

The SQL shell supports many shortcuts, such as `ctrl-r` for searching the shell history. For full details, see this [Readline Shortcut](https://github.com/chzyer/readline/blob/master/doc/shortcut.md) reference.

### Error messages and `SQLSTATE` codes

When CockroachDB encounters a SQL error, it returns the following information to the client (whether `cockroach sql` or another [client application](developer-guide-overview.html)):

1. An error message, prefixed with [the "Severity" field of the PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol-error-fields.html). For example, `ERROR: insert on table "shipments" violates foreign key constraint "fk_customers"`.
2. A [5-digit `SQLSTATE` error code](https://en.wikipedia.org/wiki/SQLSTATE) as defined by the SQL standard. For example, `SQLSTATE: 23503`.

For example, the following query (taken from [this example of adding multiple foreign key constraints](foreign-key.html#add-multiple-foreign-key-constraints-to-a-single-column)) results in a SQL error, and returns both an error message and a `SQLSTATE` code as described above.

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO shipments (carrier, status, customer_id) VALUES ('DHL', 'At facility', 2000);
~~~

~~~
ERROR: insert on table "shipments" violates foreign key constraint "fk_customers"
SQLSTATE: 23503
DETAIL: Key (customer_id)=(2000) is not present in table "customers".
~~~

The [`SQLSTATE` code](https://en.wikipedia.org/wiki/SQLSTATE) in particular can be helpful in the following ways:

- It is a standard SQL error code that you can look up in documentation and search for on the web. For any given error state, CockroachDB tries to produce the same `SQLSTATE` code as PostgreSQL.
- If you are developing automation that uses the CockroachDB SQL shell, it is more reliable to check for `SQLSTATE` values than for error message strings, which are likely to change.

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
--database=critterdb
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
# Using the --url flag:
$ cockroach sql \
--url="postgresql://maxroach@12.345.67.89:26257/critterdb?sslmode=disable"
~~~

### Execute SQL statement within the SQL shell

This example assume that we have already started the SQL shell (see examples above).

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
$ echo "SHOW TABLES; SELECT * FROM roaches;" | cockroach sql --insecure --user=maxroach --host=12.345.67.89 --database=critterdb
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

When the standard output is a terminal, `--format` defaults to `table` and tables are printed with ASCII art and special characters are not escaped for easy human consumption:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" \
--user=maxroach \
--host=12.345.67.89 \
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

However, you can explicitly set `--format` to another format, for example, `table`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--format=table \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" > out.txt \
--user=maxroach \
--host=12.345.67.89 \
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
--database=critterdb
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE customers;
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

When `--format` is not set to `raw`, you can use the `display_format` [SQL shell option](#client-side-options) to change the output format within the interactive session:

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
$ cat statements.sql
~~~

~~~
CREATE TABLE roaches (name STRING, country STRING);
INSERT INTO roaches VALUES ('American Cockroach', 'United States'), ('Brownbanded Cockroach', 'United States');
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--user=maxroach \
--host=12.345.67.89 \
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
~~~ sql
> \| IFS=","; while read a b c; do echo "insert into csv values ($a, $b, $c);"; done < test.csv;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
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
~~~ sql
> \| for ((i=0;i<10;++i)); do echo "INSERT INTO for_loop VALUES ($i);"; done
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
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

### Edit SQL statements in an external editor

In applications that use [GNU Readline](https://tiswww.case.edu/php/chet/readline/rltop.html) (such as [bash](https://www.gnu.org/software/bash/)), you can edit a long line in your preferred editor by typing `Ctrl-x Ctrl-e`.  However, CockroachDB uses the BSD-licensed [libedit](https://thrysoee.dk/editline/), which does not include this functionality.

If you would like to be able to edit the current line in an external editor by typing `C-x C-e` as in `bash`, do the following:

1. Install the `vipe` program (from the [moreutils](https://joeyh.name/code/moreutils/) suite of tools).
2. Edit your `~/.editrc` to add the following line, which takes advantage of the SQL client's ability to [run external commands](#run-external-commands-from-the-sql-shell):

    {% include_cached copy-clipboard.html %}
    ~~~
    cockroach:bind -s ^X^E '^A^K\\\| echo \"^Y\" | vipe\r'
    ~~~

This tells libedit to translate `C-x C-e` into the following commands:

1. Move to the beginning of the current line.
2. Cut the whole line.
3. Paste the line into your editor via `vipe`.
4. Pass the edited file back to the SQL client when `vipe` exits.

{{site.data.alerts.callout_info}}
Future versions of the SQL client may opt to use a different back-end for reading input, in which case please refer to this page for additional updates.
{{site.data.alerts.end}}

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

### Repeat a SQL statement

Repeating SQL queries on a table can be useful for monitoring purposes. With the `--watch` flag, you can repeat the statements specified with a `--execute` or `-e` flag periodically, until a SQL error occurs or the process is terminated.

For example, if you want to monitor the number of queries running on the current node, you can use `cockroach sql` with the `--watch` flag to query the node's `crdb_internal.node_statement_statistics` table for the query count:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--execute="SELECT SUM(count) FROM crdb_internal.node_statement_statistics" \
--watch 1m
~~~

~~~
  sum
+-----+
  926
(1 row)
  sum
+------+
  4227
(1 row)
^C
~~~

In this example, the statement is executed every minute. We let the process run for a couple minutes before stopping it with Ctrl+C.

### Connect to a cluster listening for Unix domain socket connections

<span class="version-tag">New in v20.1:</span> To connect to a cluster that is running on the same machine as your client and is listening for [Unix domain socket](https://en.wikipedia.org/wiki/Unix_domain_socket) connections, [specify a Unix domain socket URI](connection-parameters.html#example-uri-for-a-unix-domain-socket) with the `--url` connection parameter.

For example, suppose you start a single-node cluster with the following [`cockroach start-single-node`](cockroach-start-single-node.html) command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start-single-node --insecure --socket-dir=/tmp
~~~

~~~
CockroachDB node starting at 2020-04-22 15:07:17.232326 +0000 UTC (took 0.9s)
build:               CCL v20.1.0 @ 2020/04/22 13:54:06 (go1.13.4)
webui:               http://localhost:8080
sql:                 postgresql://root@localhost:26257?sslmode=disable
RPC client flags:    ./cockroach <client cmd> --host=localhost:26257 --insecure
socket:              /tmp/.s.PGSQL.26257
logs:                /path/cockroach/cockroach-data/logs
temp dir:            /path/cockroach/cockroach-data/cockroach-temp919020614
external I/O path:   /path/cockroach/cockroach-data/extern
store[0]:            path=/path/cockroach/cockroach-data
storage engine:      rocksdb
status:              restarted pre-existing node
clusterID:           9ce204b4-4b79-4809-83b5-2dc54c190cb2
nodeID:              1
~~~

To connect to this cluster with a socket:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --url='postgres://@?host=/tmp&port=26257'
~~~

## See also

- [Client Connection Parameters](connection-parameters.html)
- [`cockroach demo`](cockroach-demo.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [SQL Statements](sql-statements.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
