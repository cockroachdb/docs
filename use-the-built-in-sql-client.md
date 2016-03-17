---
title: Use the Built-in SQL Client
toc: false
---

CockroachDB comes with a built-in client for executing SQL statements from an interactive shell or directly from the command line. To use this client, run the `cockroach sql` command as described below.  

<div id="toc"></div>

## Synopsis

~~~ shell
# Open the interactive SQL shell:
$ ./cockroach sql <flags>

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
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). If the cluster was started with security (i.e., without the `--insecure` flag), this flag is required. 
`--cert` | The path to the [client certificate](create-security-certificates.html). If the cluster was started with security (i.e., without the `--insecure` flag), this flag is required.
`--database`<br>`-d` | The database to connect to. The user specified in `--user` must have privileges to access the database. 
`--execute`<br>`-e` | Execute SQL statements directly from the command line, without opening a shell. This flag can be set multiple times, and each instance can contain one or more statements separated by semi-colons. See the [examples](#execute-sql-statements-from-the-command-line) below. <br><br>If an error occurs in any statement, the command exits with a non-zero status code and further statements are not executed. The results of each SQL statement are printed to the standard output.
`--host` | The address of the node to connect to. This can be the address of any node in the cluster.
`--insecure` | Whether or not the cluster is secure (authentication and encrypted client/node and inter-node communication). If the cluster is secure, set the `--ca-cert`, `--cert`, and `-key` flags but leave this flag out. If the cluster is insecure, set this flag.
`--key` | The path to [client key](create-security-certificates.html) protecting the client certificate. If the cluster was started with security (i.e., without the `--insecure` flag), this flag is required.
`--port`<br>`-p` | The port to connect to. <br><br>**Default:** 26257
`--url` | The connection URL. If you use this flag, do not set any other connection flags.<br><br>For insecure connections, the URL format is: <br>`--url=postgresql://<user>@<host>:<port>/<database>?sslmode=disable`<br><br>For secure connections, the URL format is:<br>`--url=postgresql://<user>@<host>:<port>/<database>`<br>with the following parameters in the query string:<br>`sslcert=<path-to-client-crt>`<br>`sslkey=<path-to-client-key>`<br>`sslmode=verify-full`<br>`sslrootcert=<path-to-ca-crt>` 
`--user`<br>`-u` | The user connecting to the database. The user must have privileges to access the database specified in `--database`. <br><br>**Default:** root

## Examples

#### Open a SQL shell using standard connection flags

~~~ shell
# Secure:
$ ./cockroach sql --ca-cert=certs/ca.cert --cert=certs/maxroach.cert --key=certs/maxroach.key --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb 

# Insecure:
$ ./cockroach sql --insecure --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb 
~~~

#### Open a SQL shell using the `--url` flag

~~~ shell
# Secure:
$ ./cockroach sql --url=postgresql://maxroach@roachcluster.com:26257/critterdb?sslcert=certs/maxroach.crt&sslkey=certs/maxroach.key&sslmode=verify-full&sslrootcert=certs/ca.crt 

# Insecure:
$ ./cockroach sql --insecure --url=postgresql://maxroach@roachnode1.com:26257/critterdb?sslmode=disable 
~~~

#### Execute SQL statements from the command line

~~~ shell
# Multiple statements in one `--execute` flag:
$ ./cockroach sql --execute='CREATE DATABASE roaches;CREATE TABLE roaches.countries (name STRING, code STRING, roach_population INT)' --insecure --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb 

# Multiple statements in separate `--execute` flags:
$ ./cockroach sql --execute='CREATE DATABASE roaches' --execute='CREATE TABLE roaches.countries (name STRING, code STRING, roach_population INT);INSERT INTO roaches.countries VALUES ('United States', 'US', 20000000000000)'  --insecure --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb  
~~~