---
title: Use the Built-in SQL Client
toc: false
---

CockroachDB comes with a built-in client for executing SQL statements from an interactive shell or directly from the command line. To use this client, run the `cockroach sql` [command](cockroach-commands.html) as described below.  

To exit the interactive shell, use **CTRL + D**, **CTRL + C**, or `\q`.

<div id="toc"></div>

## Synopsis

~~~ shell
# Open the interactive SQL shell:
$ ./cockroach sql <flags>

# Run external commands from the SQL shell:
> \! <external command>    <-- Run command and print its results to stdout
> \| <external command>    <-- Run output of command as SQL statements

# Execute SQL from the command line:
$ ./cockroach sql --execute='<sql-statement>;<sql-statement>' --execute='<sql-statement>' <flags>
 
# View help:
$ ./cockroach help sql
~~~

## Flags

The `cockroach sql` command supports the following flags as well as [logging flags](cockroach-commands.html#logging-flags).

- To open an interactive SQL shell, run `cockroach sql` with all appropriate connection flags or use just the `--url` flag, which includes connection details. 
- To execute SQL statements from the command line, use the `--execute` flag.

Flag | Description 
-----|------------
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CA_CERT` 
`--cert` | The path to the [client certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CERT`
`--database`<br>`-d` | The database to connect to.<br><br>**Env Variable:** `COCKROACH_DATABASE`  
`--execute`<br>`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons. See the [examples](#execute-sql-statements-from-the-command-line) below. <br><br>If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each SQL statement are printed to the standard output.
`--host` | The address of the node to connect to. This can be the address of any node in the cluster.<br><br>**Env Variable:** `COCKROACH_HOST`
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--key` | The path to the [client key](create-security-certificates.html) protecting the client certificate. This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_KEY`
`--port`<br>`-p` | The port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--url` | The connection URL. If you use this flag, do not set any other connection flags.<br><br>For insecure connections, the URL format is: <br>`--url=postgresql://<user>@<host>:<port>/<database>?sslmode=disable`<br><br>For secure connections, the URL format is:<br>`--url=postgresql://<user>@<host>:<port>/<database>`<br>with the following parameters in the query string:<br>`sslcert=<path-to-client-crt>`<br>`sslkey=<path-to-client-key>`<br>`sslmode=verify-full`<br>`sslrootcert=<path-to-ca-crt>` <br><br>**Env Variable:** `COCKROACH_URL`
`--user`<br>`-u` | The user connecting to the database. The user must have [privileges](privileges.html) for any statement executed.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## Examples

#### Open a SQL shell using standard connection flags

~~~ shell
# Secure:
$ ./cockroach sql --ca-cert=certs/ca.cert --cert=certs/maxroach.cert --key=certs/maxroach.key --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb 

# Insecure:
$ ./cockroach sql --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb 
~~~

#### Open a SQL shell using the `--url` flag

~~~ shell
# Secure:
$ ./cockroach sql --url=postgresql://maxroach@roachcluster.com:26257/critterdb?sslcert=certs/maxroach.crt&sslkey=certs/maxroach.key&sslmode=verify-full&sslrootcert=certs/ca.crt 

# Insecure:
$ ./cockroach sql --url=postgresql://maxroach@roachnode1.com:26257/critterdb?sslmode=disable 
~~~

#### Execute SQL statements from the command line

~~~ shell
# Multiple statements in one `--execute` flag:
$ ./cockroach sql --execute='CREATE DATABASE roaches;CREATE TABLE roaches.countries (name STRING, code STRING, roach_population INT)' --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb 

# Multiple statements in separate `--execute` flags:
$ ./cockroach sql --execute='CREATE DATABASE roaches' --execute='CREATE TABLE roaches.countries (name STRING, code STRING, roach_population INT);INSERT INTO roaches.countries VALUES ('United States', 'US', 20000000000000)' --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb  
~~~

#### Run external commands from the SQL shell:

From within the SQL shell, you use `\!` to run an external command and print its results to stdout, and you use `\|` to run the output of an external command as SQL statements. 

For example, here we use `\!` to look at the rows in a csv file before creating a table and then using `\|` to insert those rows into the table. 

~~~ shell
> \! cat test.csv
12, 13, 14
10, 20, 30

> CREATE TABLE csv (x INT, y INT, z INT);
CREATE TABLE

> \| IFS=","; while read a b c; do echo "insert into csv values ($a, $b, $c);"; done < test.csv;
INSERT 1

> SELECT * FROM csv;
+----+----+----+
| x  | y  | z  |
+----+----+----+
| 12 | 13 | 14 |
| 10 | 20 | 30 |
+----+----+----+
~~~

In this example, we create a table and then use `\|` to programmatically insert values.

~~~ shell
> CREATE TABLE for_loop (x INT);
CREATE TABLE

> \| for ((i=0;i<10;++i)); do echo "INSERT INTO for_loop VALUES ($i);"; done
INSERT 1

> SELECT * FROM for_loop;
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

[Other Cockroach Commands](cockroach-commands.html)