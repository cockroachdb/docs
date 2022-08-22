### Start a SQL shell

In these examples, we connect a SQL shell to a **secure cluster**.

{% include_cached copy-clipboard.html %}
~~~ shell
# Using the --url flag:
$ cockroach-sql \
--url="postgresql://maxroach@12.345.67.89:26257/critterdb?sslcert=certs/client.maxroach.crt&sslkey=certs/client.maxroach.key&sslmode=verify-full&sslrootcert=certs/ca.crt"
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
# Using standard connection flags:
$ cockroach-sql \
--certs-dir=certs \
--user=maxroach \
--host=12.345.67.89 \
--database=critterdb
~~~

In these examples, we connect a SQL shell to an **insecure cluster**.

{% include_cached copy-clipboard.html %}
~~~ shell
# Using the --url flag:
$ cockroach-sql \
--url="postgresql://maxroach@12.345.67.89:26257/critterdb?sslmode=disable"
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
# Using standard connection flags:
$ cockroach-sql --insecure \
--user=maxroach \
--host=12.345.67.89 \
--database=critterdb
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
          id         |   name
---------------------+-----------
  710907071259213825 | bobcat
  710907071259279361 | 🐢
  710907071259312129 | barn owl
(3 rows)
~~~

### Execute SQL statements from the command line

In these examples, we use the `--execute` flag to execute statements from the command line:

{% include_cached copy-clipboard.html %}
~~~ shell
# Statements with a single --execute flag:
$ cockroach-sql --insecure \
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
$ cockroach-sql --insecure \
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
$ echo "SHOW TABLES; SELECT * FROM roaches;" | cockroach-sql --insecure --user=maxroach --host=12.345.67.89 --database=critterdb
~~~

~~~
  schema_name | table_name | type  | owner | estimated_row_count | locality
--------------+------------+-------+-------+---------------------+-----------
  public      | animals    | table | demo  |                   0 | NULL
  public      | roaches    | table | demo  |                   0 | NULL
(2 rows)

          name          |    country
------------------------+----------------
  American Cockroach    | United States
  Brownbanded Cockroach | United States
~~~

### Control how table rows are printed

In these examples, we show tables and special characters printed in various formats.

When the standard output is a terminal, `--format` defaults to `table` and tables are printed with ASCII art and special characters are not escaped for easy human consumption:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --insecure \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" \
--user=maxroach \
--host=12.345.67.89 \
--database=critterdb
~~~

~~~
  chick | turtle
--------+---------
  🐥    | 🐢
~~~

However, you can explicitly set `--format` to another format (e.g., `tsv` or `html`):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --insecure \
--format=tsv \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" \
--user=maxroach \
--host=12.345.67.89 \
--database=critterdb
~~~

~~~
chick	turtle
🐥	🐢
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --insecure \
--format=html \
--execute="SELECT '🐥' AS chick, '🐢' AS turtle" \
--user=maxroach \
--host=12.345.67.89 \
--database=critterdb
~~~

~~~
<table>
<thead><tr><th>row</th><th>chick</th><th>turtle</th></tr></thead>
<tbody>
<tr><td>1</td><td>🐥</td><td>🐢</td></tr>
</tbody>
<tfoot><tr><td colspan=3>1 row</td></tr></tfoot></table>
~~~

When piping output to another command or a file, `--format` defaults to `tsv`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --insecure \
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

However, you can explicitly set `--format` to another format (e.g., `table`):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --insecure \
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
  chick | turtle
--------+---------
  🐥    | 🐢
(1 row)
~~~

### Show borders around the statement output within the SQL shell

To display outside and inside borders in the statement output, set the `border` [SQL shell option](#client-side-options) to `3`.

{% include_cached copy-clipboard.html %}
~~~ sql
\set border=3
SELECT * FROM animals;
~~~

~~~
+--------------------+----------+
|         id         |   name   |
+--------------------+----------+
| 710907071259213825 | bobcat   |
+--------------------+----------+
| 710907071259279361 | 🐢       |
+--------------------+----------+
| 710907071259312129 | barn owl |
+--------------------+----------+
~~~

### Make the output of `SHOW` statements selectable

To make it possible to select from the output of `SHOW` statements, set `--format` to `raw`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --insecure \
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
$ cockroach-sql --insecure \
--user=maxroach \
--host=12.345.67.89 \
--database=critterdb \
-f statements.sql
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
  x  | y  | z
-----+----+-----
  12 | 13 | 14
  10 | 20 | 30
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
  x
-----
  0
  1
  2
  3
  4
  5
  6
  7
  8
  9
~~~

### Allow potentially unsafe SQL statements

The `--safe-updates` flag defaults to `true`. This prevents SQL statements that may have broad, undesired side effects. For example, by default, we cannot use `DELETE` without a `WHERE` clause to delete all rows from a table:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --insecure --execute="SELECT * FROM db1.t1"
~~~

~~~
  id | name
-----+-------
   1 | a
   2 | b
   3 | c
   4 | d
   5 | e
   6 | f
   7 | g
   8 | h
   9 | i
  10 | j
-----+-------
(10 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --insecure --execute="DELETE FROM db1.t1"
~~~

~~~
Error: pq: rejected: DELETE without WHERE clause (sql_safe_updates = true)
Failed running "sql"
~~~

However, to allow an "unsafe" statement, you can set `--safe-updates=false`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --insecure --safe-updates=false --execute="DELETE FROM db1.t1"
~~~

~~~
DELETE 10
~~~

{{site.data.alerts.callout_info}}
Potentially unsafe SQL statements can also be allowed/disallowed for an entire session via the `sql_safe_updates` [session variable](set-vars.html).
{{site.data.alerts.end}}

### Reveal the SQL statements sent implicitly by the command-line utility

In this example, we use the `--execute` flag to execute statements from the command line and the `--echo-sql` flag to reveal SQL statements sent implicitly:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --insecure \
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
$ cockroach-sql --insecure \
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

For example, if you want to monitor the number of queries running on the current node, you can use `cockroach-sql` with the `--watch` flag to query the node's `crdb_internal.node_statement_statistics` table for the query count:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --insecure \
--execute="SELECT SUM(count) FROM crdb_internal.node_statement_statistics" \
--watch 1m
~~~

~~~
  sum
-------
  926
(1 row)
  sum
--------
  4227
(1 row)
^C
~~~

In this example, the statement is executed every minute. We let the process run for a couple minutes before terminating it with **Ctrl+C**.

### Connect to a cluster listening for Unix domain socket connections

To connect to a cluster that is running on the same machine as your client and is listening for [Unix domain socket](https://en.wikipedia.org/wiki/Unix_domain_socket) connections, [specify a Unix domain socket URI](connection-parameters.html#example-uri-for-a-unix-domain-socket) with the `--url` connection parameter.

For example, suppose you start a single-node cluster with the following [`cockroach start-single-node`](cockroach-start-single-node.html) command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start-single-node --insecure --socket-dir=/tmp
~~~

~~~
CockroachDB node starting at {{ now | date: "%Y-%m-%d %H:%M:%S.%6 +0000 UTC" }} (took 1.3s)
build:               CCL {{page.release_info.version}} @ {{page.release_info.build_time}}
webui:               http://Jesses-MBP-2:8080
sql:                 postgresql://root@Jesses-MBP-2:26257?sslmode=disable
RPC client flags:    ./cockroach <client cmd> --host=Jesses-MBP-2:26257 --insecure
socket:              /tmp/.s.PGSQL.26257
logs:                /Users/jesseseldess/Downloads/cockroach-{{ page.release-info.version }}.darwin-10.9-amd64/cockroach-data/logs
temp dir:            /Users/jesseseldess/Downloads/cockroach-{{ page.release-info.version }}.darwin-10.9-amd64/cockroach-data/cockroach-temp805054895
external I/O path:   /Users/jesseseldess/Downloads/cockroach-{{ page.release-info.version }}.darwin-10.9-amd64/cockroach-data/extern
store[0]:            path=/Users/jesseseldess/Downloads/cockroach-{{ page.release-info.version }}.darwin-10.9-amd64/cockroach-data
storage engine:      pebble
status:              initialized new cluster
clusterID:           455ad71d-21d4-424a-87ad-8097b6b5b99f
nodeID:              1
~~~

To connect to this cluster with a socket:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach-sql --url='postgres://root@?host=/tmp&port=26257'
~~~
