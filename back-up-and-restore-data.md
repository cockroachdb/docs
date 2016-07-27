---
title: Back Up and Restore Data
summary: Learn how to back up and restore a CockroachDB cluster.
toc: false
---

The `cockroach dump` [command](cockroach-commands.html) outputs the SQL statements required to recreate a specific table and all its rows. This command can be used to back up each table of each database in a cluster. The output should also be suitable for importing into other relational databases, with minimal adjustments.

When `cockroach dump` is executed:

- The table data is dumped as it appears at the time that the command is started. Any changes after the command starts will not be included in the dump.
- If the dump takes longer than the [`ttlseconds`](configure-replication-zones.html) replication setting for the table (24 hours by default), the dump may fail. 
- Reads, writes, and schema changes can happen while the dump is in progress.

{{site.data.alerts.callout_info}}The user must have the <code>SELECT</code> privilege on the target table.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

~~~ shell
# Dump a table to stdout:
$ cockroach dump <database> <table> <flags>

# Dump a table to a file:
$ cockroach dump <database> <table> <flags> > dump-file.sql

# View help:
$ cockroach help dump
~~~

## Flags

The `cockroach dump` command supports the following flags as well as [logging flags](cockroach-commands.html#logging-flags).

Flag | Description 
-----|------------
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CA_CERT` 
`--cert` | The path to the [client certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CERT`
`--database`<br>`-d` | Not valid for the `dump` command. This flag will eventually be removed.
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** localhost
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--key` | The path to the [client key](create-security-certificates.html) protecting the client certificate. This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_KEY`
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--pretty` | Not valid for the `dump` command. This flag will eventually be removed.
`--url` | The connection URL. If you use this flag, do not set any other connection flags.<br><br>For insecure connections, the URL format is: <br>`--url=postgresql://<user>@<host>:<port>/<database>?sslmode=disable`<br><br>For secure connections, the URL format is:<br>`--url=postgresql://<user>@<host>:<port>/<database>`<br>with the following parameters in the query string:<br>`sslcert=<path-to-client-crt>`<br>`sslkey=<path-to-client-key>`<br>`sslmode=verify-full`<br>`sslrootcert=<path-to-ca-crt>` <br><br>**Env Variable:** `COCKROACH_URL`
`--user`<br>`-u` | The user executing the `dump` command. The user must have the `SELECT` privilege on the target table.<br><br>**Default:** `root`

## Examples

### Dump a table to the standard output

In this example, a user that has the `SELECT` privilege on the `accounts` table dumps the table to the standard output.

~~~ shell
$ cockroach dump bank accounts --user=maxroach
CREATE TABLE accounts (
    id INT NOT NULL DEFAULT unique_rowid(),
    username STRING NULL,
    CONSTRAINT "primary" PRIMARY KEY (id),
    FAMILY f1 (id, username)
);

INSERT INTO accounts VALUES
    (160742616544116737, 'aberry'),
    (160742616544149505, 'bcompton'),
    (160742616544182273, 'cdouglas'),
    (160742616544215041, 'dellsinger'),
    (160742616544247809, 'efranklin'),
    (160742616544280577, 'fgoldberg');
~~~

### Dump a table to a file

In this example, a user that has the `SELECT` privilege on the `accounts` table dumps the table to a file.

~~~ shell
$ cockroach dump bank accounts --user=maxroach > accounts-backup.sql

$ cat accounts-backup.sql
CREATE TABLE accounts (
    id INT NOT NULL DEFAULT unique_rowid(),
    username STRING NULL,
    CONSTRAINT "primary" PRIMARY KEY (id),
    FAMILY f1 (id, username)
);

INSERT INTO accounts VALUES
    (160742616544116737, 'aberry'),
    (160742616544149505, 'bcompton'),
    (160742616544182273, 'cdouglas'),
    (160742616544215041, 'dellsinger'),
    (160742616544247809, 'efranklin'),
    (160742616544280577, 'fgoldberg');
~~~

### Dump fails (user does not have `SELECT` privilege)

In this example, the `dump` command fails for a user that does not have the `SELECT` privilege on the `accounts` table. 

~~~ shell
$ cockroach dump bank accounts --user=leslieroach

CREATE TABLE accounts (
    id INT NOT NULL DEFAULT unique_rowid(),
    username STRING NULL,
    CONSTRAINT "primary" PRIMARY KEY (id),
    FAMILY f1 (id, username)
);
Error: pq: user leslieroach does not have SELECT privilege on table accounts
Failed running "dump"
~~~

### Restore a table from a backup file

In this example, a user that has the `CREATE` privilege on the `bank` database uses the [`cockroach sql`](use-the-built-in-sql-client.html) command to recreate a table, based on a file created by the `dump` command. 

~~~ shell
$ cat accounts-backup.sql
CREATE TABLE accounts (
    id INT NOT NULL DEFAULT unique_rowid(),
    username STRING NULL,
    CONSTRAINT "primary" PRIMARY KEY (id),
    FAMILY f1 (id, username)
);

INSERT INTO accounts VALUES
    (160742616544116737, 'aberry'),
    (160742616544149505, 'bcompton'),
    (160742616544182273, 'cdouglas'),
    (160742616544215041, 'dellsinger'),
    (160742616544247809, 'efranklin'),
    (160742616544280577, 'fgoldberg');

$ cockroach sql --database=bank --user=maxroach < accounts-backup.sql
CREATE TABLE
INSERT 6
~~~

## See Also

- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
