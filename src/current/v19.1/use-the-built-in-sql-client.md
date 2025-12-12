---
title: Use the Built-in SQL Client
summary: CockroachDB comes with a built-in client for executing SQL statements from an interactive shell or directly from the command line.
toc: true
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
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
#
# Server version: CCL {{page.release_info.version}} (darwin amd64, built 2017/07/13 11:43:06, go1.10.1) (same version as client)
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
`\q`<br>`quit`<br>`exit`<br>`ctrl-d` | Exit the shell.<br><br>When no text follows the prompt, `ctrl-c` exits the shell as well; otherwise, `ctrl-c` clears the line.
`\!` | Run an external command and print its results to `stdout`. See the [example](#run-external-commands-from-the-sql-shell) below.
<code>&#92;&#124;</code> | Run the output of an external command as SQL statements. See the [example](#run-external-commands-from-the-sql-shell) below.
`\set <option>`<br>`\unset <option>` | Enable or disable a client-side option. For more details, see [Client-side options](#client-side-options).<br><br>As of v2.1, you can also use the [`--set` flag](#general) to enable or disable client-side options before starting the SQL shell.
`\?`<br>`help` | View this help within the shell.
`\h <statement>`<br>`\hf <function>` | View help for specific SQL statements or functions. See [SQL shell help](#help) for more details.

### Client-side options

- To view option descriptions and how they are currently set, use `\set` without any options.
- To enable or disable an option, use `\set <option> <value>` or `\unset <option> <value>`. As of v2.1, you can also use the form `<option>=<value>`.
- If an option accepts a boolean value:
    - `\set <option>` without `<value>` is equivalent to `\set <option> true`, and `\unset <option>` without `<value>` is equivalent to `\set <option> false`.
    - As of v2.1, `on` and `0` are aliases for `true`, and `off` and `1` are aliases for `false`.

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
  https://www.cockroachlabs.com/docs/stable/update.html
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
  https://www.cockroachlabs.com/docs/stable/functions-and-operators.html
~~~

### Shortcuts

The SQL shell supports many shortcuts, such as `ctrl-r` for searching the shell history. For full details, see this [Readline Shortcut](https://github.com/chzyer/readline/blob/master/doc/shortcut.md) reference.

## Examples

### Start a SQL shell

In these examples, we connect a SQL shell to a **secure cluster**.

{% include copy-clipboard.html %}
~~~ shell
# Using standard connection flags:
$ cockroach sql \
--certs-dir=certs \
--user=maxroach \
--host=12.345.67.89 \
--database=critterdb
~~~

{% include copy-clipboard.html %}
~~~ shell
# Using the --url flag:
$ cockroach sql \
--url="postgresql://maxroach@12.345.67.89:26257/critterdb?sslcert=certs/client.maxroach.crt&sslkey=certs/client.maxroach.key&sslmode=verify-full&sslrootcert=certs/ca.crt"
~~~

In these examples, we connect a SQL shell to an **insecure cluster**.

{% include copy-clipboard.html %}
~~~ shell
# Using standard connection flags:
$ cockroach sql --insecure \
--user=maxroach \
--host=12.345.67.89 \
--database=critterdb
~~~

{% include copy-clipboard.html %}
~~~ shell
# Using the --url flag:
$ cockroach sql \
--url="postgresql://maxroach@12.345.67.89:26257/critterdb?sslmode=disable"
~~~

### Execute SQL statement within the SQL shell

This example assume that we have already started the SQL shell (see examples above).

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE animals (id INT PRIMARY KEY DEFAULT unique_rowid(), name STRING);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO animals (name) VALUES ('bobcat'), ('🐢 '), ('barn owl');
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" > out.txt \
--user=maxroach \
--host=12.345.67.89 \
--database=critterdb
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cat out.txt
~~~

~~~
1 row
chick	turtle
🐥	🐢
~~~

However, you can explicitly set `--format` to another format, for example, `table`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--format=table \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" > out.txt \
--user=maxroach \
--host=12.345.67.89 \
--database=critterdb
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--format=raw \
--user=maxroach \
--host=12.345.67.89 \
--database=critterdb
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ shell
$ cat statements.sql
~~~

~~~
CREATE TABLE roaches (name STRING, country STRING);
INSERT INTO roaches VALUES ('American Cockroach', 'United States'), ('Brownbanded Cockroach', 'United States');
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> \! cat test.csv
~~~

~~~
12, 13, 14
10, 20, 30
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE csv (x INT, y INT, z INT);
~~~

{% include copy-clipboard.html %}
~~~ sql
> \| IFS=","; while read a b c; do echo "insert into csv values ($a, $b, $c);"; done < test.csv;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE for_loop (x INT);
~~~

{% include copy-clipboard.html %}
~~~ sql
> \| for ((i=0;i<10;++i)); do echo "INSERT INTO for_loop VALUES ($i);"; done
~~~

{% include copy-clipboard.html %}
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

    {% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --execute="DELETE FROM db1.t1"
~~~

~~~
Error: pq: rejected: DELETE without WHERE clause (sql_safe_updates = true)
Failed running "sql"
~~~

However, to allow an "unsafe" statement, you can set `--safe-updates=false`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --safe-updates=false --execute="DELETE FROM db1.t1"
~~~

~~~
DELETE 10
~~~

{{site.data.alerts.callout_info}}Potentially unsafe SQL statements can also be allowed/disallowed for an entire session via the <code>sql_safe_updates</code> <a href="set-vars.html">session variable</a>.{{site.data.alerts.end}}

### Reveal the SQL statements sent implicitly by the command-line utility

In this example, we use the `--execute` flag to execute statements from the command line and the `--echo-sql` flag to reveal SQL statements sent implicitly:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--user=maxroach \
--host=12.345.67.89 \
--database=db1
~~~

{% include copy-clipboard.html %}
~~~ sql
> \set echo
~~~

{% include copy-clipboard.html %}
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

## See also

- [Client Connection Parameters](connection-parameters.html)
- [`cockroach demo`](cockroach-demo.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [SQL Statements](sql-statements.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
