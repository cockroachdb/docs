---
title: Open a SQL Shell
toc: false
---

To open the built-in SQL shell, run the `cockroach sql` command with appropriate flags. You can either set all connection flags individually or use the `--url` flag, which includes connection details.

<div id="toc"></div>

## Synopsis

~~~ shell
# Run the command:
$ ./cockroach sql <flags>

# View help directly in your shell:
$ ./cockroach help sql
~~~

## Flags

The `sql` command supports the following flags as well as [logging flags](cockroach-commands.html#logging-flags).

Flag | Description 
-----|------------
`--certs` | The path to the directory containing the client's [security certificates](create-security-certificates.html). If the cluster was started with security (i.e., without the `--insecure` flag), the `--certs` flag is required. <br><br> **Default:** certs
`--database` | The database to connect to. The user specified in `--user` must have privileges to access the database. 
`--host` | The address of the node to connect to. This can be the address of any node in the cluster.
`--insecure` | Whether or not the cluster is secure (authentication and encrypted client/node and inter-node communication). If the cluster is secure, set the `--certs` flag but leave this flag out. If the cluster is insecure, set this flag.
`--port` | The port to connect to. <br><br>**Default:** 26257
`--url` | The connection URL. If you use this flag, do not set any other connection flags.<br><br>For insecure connections, the URL format is: <br>`--url=postgresql://<user>@<host>:<port>/<database>?sslmode=disable`<br><br>For secure connections, the URL format is:<br>`--url=postgresql://<user>@<host>:<port>/<database>`<br>with the following parameters in the query string:<br>`sslcert=<path-to-client.crt>`<br>`sslkey=<path-to-cleint.key>`<br>`sslmode=verify-full`<br>`sslrootcert=<path-to-ca.crt>` 
`--user` | The user connecting to the database. The user must have privileges to access the database specified in `--database`. <br><br>**Default:** root

## Examples

####Open a SQL shell using standard connection flags

~~~ shell
# Secure:
$ ./cockroach sql --certs=certs --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb 

# Insecure:
$ ./cockroach sql --insecure --user=maxroach --host=roachcluster.com --port=26257 --database=critterdb 
~~~

####Open a SQL shell using the `--url` flag

~~~ shell
# Secure:
$ ./cockroach sql --url=postgresql://maxroach@roachcluster.com:26257/critterdb?sslcert=certs/maxroach.client.crt&sslkey=certs/maxroach.client.key&sslmode=verify-full&sslrootcert=certs/ca.crt 

# Insecure:
$ ./cockroach sql --insecure --url=postgresql://maxroach@roachnode1.com:26257/critterdb?sslmode=disable 
~~~
