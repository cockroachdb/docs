---
title: Back Up and Restore Data
summary: Learn how to back up and restore a CockroachDB cluster.
toc: false
---

The `cockroach dump` [command](cockroach-commands.html) lets you back up a specific table by outputting the SQL statements required to recreate the table and all its rows. Using this command, you can back up each table of each database in your cluster. Note also that the output should be suitable for importing into other relational databases as well, with minimal adjustments.

When you run `cockroach dump`:

- The table data is dumped as it appears at the time that the command is started. Any changes after the command starts will not be included in the dump.
- If the dump takes longer than the `ttlseconds` [replication zone](configure-replication-zones.html) setting for the table (24 hours by default), the dump may fail. 
- Reads and schema changes can happen while a dump is in progress.
{{site.data.alerts.callout_info}}Currently, only the <code>root</code> user can run the <code>cockroach dump</code> command.{{site.data.alerts.end}}

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
`--user`<br>`-u` | Not yet valid for the `dump` command. Once the command is available to more than just the `root` user, this flag will be meaningful.

## Examples

### Dump a table to the standard output

In this example, we dump the contents of the `accounts` table in the `bank` database to the standard output.

~~~ shell
$ cockroach dump bank accounts
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

In this example, we dump the contents of the `accounts` table in the `bank` database to a file.

~~~ shell
$ cockroach dump bank accounts > accounts-backup.sql

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

### Restore a table from a backup file

In this example, we use the [`cockroach sql`](use-the-built-in-sql-client.html) command to recreate a table, based on a file created by the `cockroach dump` command. 

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

$ cockroach sql --database=bank < accounts-backup.sql
CREATE TABLE
INSERT 6
~~~

## See Also

- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
