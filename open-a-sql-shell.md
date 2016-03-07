---
title: Open a SQL Shell
toc: false
---

To open the built-in SQL shell, run the `cockroach sql` command with appropriate flags. 

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
`--database` | The name of the databse to connect to. The user specified in `--user` must have privileges to access the database. 
`--host` | The address of the node to connect to. This can be the address of any node in the cluster.
`--insecure` | Whether or not the cluster is secure (authentication and encrypted client/node and inter-node communication). If the cluster is secure, set the `--certs` flag but leave this flag out. If the cluster is insecure, set this flag.
`--port` | The port to connect to. <br><br>**Default:** 26257
`--url` | Connection URL. This URL is provided in the standard output upon starting a node. If you set this flag, you do not need to set any others.
`--user` | Database user name. <br><br>**Default:** root

## Examples

####Shut down a secure node:

~~~ shell
$ ./cockroach quit --certs=/nodecerts --host=nodehostname.com --port=26260 
~~~

####Shut down an insecure node:

~~~ shell
$ ./cockroach quit --insecure --host=nodehostname.com --port=26260 
~~~