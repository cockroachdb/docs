---
title: Back Up and Restore Data
summary: Learn how to back up and restore a CockroachDB cluster.
toc: false
---

{{site.data.alerts.callout_danger}}The feature described here is a simple form of backup and restore that writes to and reads from a local flat file. A production-suitable solution that uses cloud storage and efficiently manages the time and load on the nodes of the cluster is under development for our 1.0 release. For more details about the upcoming solution, see the original <a href="https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/backup_restore.md">RFC</a>.{{site.data.alerts.end}}

The `cockroach dump` [command](cockroach-commands.html) outputs the SQL statements required to recreate one or more tables and all their rows. This command can be used to back up each database in a cluster. The output should also be suitable for importing into other relational databases, with minimal adjustments.

When `cockroach dump` is executed:

- Table schema and data are dumped as they appear at the time that the command is started, or at the time specified in the `--as-of` flag. Any changes after the command starts, or after the timestamp specified in `--as-of`, will not be included in the dump.
- If the dump takes longer than the [`ttlseconds`](configure-replication-zones.html) replication setting for the table (24 hours by default), the dump may fail.
- Reads, writes, and schema changes can happen while the dump is in progress.

{{site.data.alerts.callout_info}}The user must have the <code>SELECT</code> privilege on the target table(s).{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

~~~ shell
# Dump the schema and data of specific tables to stdout:
$ cockroach dump <database> <table> <table...> <flags>

# Dump just the data of specific tables to stdout:
$ cockroach dump <database> <table> <table...> --dump-mode=data <other flags>

# Dump just the schema of specific tables to stdout:
$ cockroach dump <database> <table> <table...> --dump-mode=schema <other flags>

# Dump the schema and data of all tables in a database to stdout:
$ cockroach dump <database> <flags>

# Dump just the schema of all tables in a database to stdout:
$ cockroach dump <database> --dump-mode=schema <other flags>

# Dump just the data of all tables in a database to stdout:
$ cockroach dump <database> --dump-mode=data <other flags>

# Dump to a file:
$ cockroach dump <database> <table> <flags> > dump-file.sql

# View help:
$ cockroach dump --help
~~~

## Flags

The `cockroach dump` command supports the following flags as well as [logging flags](cockroach-commands.html#logging-flags).

Flag | Description
-----|------------
`--as-of` | Dump table schema and/or data as they appear at the specified [timestamp](timestamp.html). See this [example](#dump-table-data-as-of-a-specific-time) for a demonstraion.<br><br>Note that historical data is available only within the garbage collection window, which is determined by the [`ttlseconds`](configure-replication-zones.html) replication setting for the table (24 hours by default). If this timestamp is earlier than that window, the dump will fail.<br><br>**Default:** Current time
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CA_CERT`
`--cert` | The path to the [client certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CERT`
`--database`<br>`-d` | Not valid for the `dump` command. This flag will eventually be removed.
`--dump-mode` | Whether to dump table schema, table data, or both.<br><br>To dump just table schema, set this to `schema`. To dump just table data, set this to `data`. To dump both table schema and data, leave this flag out or set it to `both`.<br><br>**Default:** `both`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--key` | The path to the [client key](create-security-certificates.html) protecting the client certificate. This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_KEY`
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--url` | The connection URL. If you use this flag, do not set any other connection flags.<br><br>For insecure connections, the URL format is: <br>`--url=postgresql://<user>@<host>:<port>/<database>?sslmode=disable`<br><br>For secure connections, the URL format is:<br>`--url=postgresql://<user>@<host>:<port>/<database>`<br>with the following parameters in the query string:<br>`sslcert=<path-to-client-crt>`<br>`sslkey=<path-to-client-key>`<br>`sslmode=verify-full`<br>`sslrootcert=<path-to-ca-crt>` <br><br>**Env Variable:** `COCKROACH_URL`
`--user`<br>`-u` | The [user](create-and-manage-users.html) executing the `dump` command. The user must have the `SELECT` privilege on the target table.<br><br>**Default:** `root`

## Examples

{{site.data.alerts.callout_info}}All but the last example use our sample startrek database and assume that the <code>maxroach</code> user has been <a href="grant.html">granted</a> the <code>SELECT</code> privilege on all target tables. You can add the sample startrek database to a cluster via the <a href="generate-cli-utilities-and-example-data.html#generate-example-data"><code>cockroach gen</code></a> command.{{site.data.alerts.end}}

### Dump a table's schema and data

~~~ shell
$ cockroach dump startrek episodes --user=maxroach > backup.sql
~~~

~~~ shell
$ cat backup.sql
CREATE TABLE episodes (
    id INT NOT NULL,
    season INT NULL,
    num INT NULL,
    title STRING NULL,
    stardate DECIMAL NULL,
    CONSTRAINT "primary" PRIMARY KEY (id),
    FAMILY "primary" (id, season, num),
    FAMILY fam_1_title (title),
    FAMILY fam_2_stardate (stardate)
);

INSERT INTO episodes (id, season, num, title, stardate) VALUES
    (1, 1, 1, 'The Man Trap', 1531.1),
    (2, 1, 2, 'Charlie X', 1533.6),
    (3, 1, 3, 'Where No Man Has Gone Before', 1312.4),
    (4, 1, 4, 'The Naked Time', 1704.2),
    (5, 1, 5, 'The Enemy Within', 1672.1),
    (6, 1, 6, e'Mudd\'s Women', 1329.8),
    (7, 1, 7, 'What Are Little Girls Made Of?', 2712.4),
    (8, 1, 8, 'Miri', 2713.5),
    (9, 1, 9, 'Dagger of the Mind', 2715.1),
    (10, 1, 10, 'The Corbomite Maneuver', 1512.2),
    ...
~~~

### Dump just a table's schema

~~~ shell
$ cockroach dump startrek episodes --user=maxroach --dump-mode=schema > backup.sql
~~~

~~~ shell
$ cat backup.sql
CREATE TABLE episodes (
    id INT NOT NULL,
    season INT NULL,
    num INT NULL,
    title STRING NULL,
    stardate DECIMAL NULL,
    CONSTRAINT "primary" PRIMARY KEY (id),
    FAMILY "primary" (id, season, num),
    FAMILY fam_1_title (title),
    FAMILY fam_2_stardate (stardate)
);
~~~

### Dump just a table's data

~~~ shell
$ cockroach dump startrek episodes --user=maxroach --dump-mode=data > backup.sql
~~~

~~~ shell
$ cat backup.sql
INSERT INTO episodes (id, season, num, title, stardate) VALUES
    (1, 1, 1, 'The Man Trap', 1531.1),
    (2, 1, 2, 'Charlie X', 1533.6),
    (3, 1, 3, 'Where No Man Has Gone Before', 1312.4),
    (4, 1, 4, 'The Naked Time', 1704.2),
    (5, 1, 5, 'The Enemy Within', 1672.1),
    (6, 1, 6, e'Mudd\'s Women', 1329.8),
    (7, 1, 7, 'What Are Little Girls Made Of?', 2712.4),
    (8, 1, 8, 'Miri', 2713.5),
    (9, 1, 9, 'Dagger of the Mind', 2715.1),
    (10, 1, 10, 'The Corbomite Maneuver', 1512.2),
    ...
~~~

### Dump all tables in a database

~~~ shell
$ cockroach dump startrek --user=maxroach > backup.sql
~~~

~~~ shell
$ cat backup.sql
CREATE TABLE episodes (
    id INT NOT NULL,
    season INT NULL,
    num INT NULL,
    title STRING NULL,
    stardate DECIMAL NULL,
    CONSTRAINT "primary" PRIMARY KEY (id),
    FAMILY "primary" (id, season, num),
    FAMILY fam_1_title (title),
    FAMILY fam_2_stardate (stardate)
);

CREATE TABLE quotes (
    quote STRING NULL,
    characters STRING NULL,
    stardate DECIMAL NULL,
    episode INT NULL,
    INDEX quotes_episode_idx (episode),
    FAMILY "primary" (quote, rowid),
    FAMILY fam_1_characters (characters),
    FAMILY fam_2_stardate (stardate),
    FAMILY fam_3_episode (episode)
);

INSERT INTO episodes (id, season, num, title, stardate) VALUES
    (1, 1, 1, 'The Man Trap', 1531.1),
    (2, 1, 2, 'Charlie X', 1533.6),
    (3, 1, 3, 'Where No Man Has Gone Before', 1312.4),
    (4, 1, 4, 'The Naked Time', 1704.2),
    (5, 1, 5, 'The Enemy Within', 1672.1),
    (6, 1, 6, e'Mudd\'s Women', 1329.8),
    (7, 1, 7, 'What Are Little Girls Made Of?', 2712.4),
    (8, 1, 8, 'Miri', 2713.5),
    (9, 1, 9, 'Dagger of the Mind', 2715.1),
    (10, 1, 10, 'The Corbomite Maneuver', 1512.2),
    ...

INSERT INTO quotes (quote, characters, stardate, episode) VALUES
    ('"... freedom ... is a worship word..." "It is our worship word too."', 'Cloud William and Kirk', NULL, 52),
    ('"Beauty is transitory." "Beauty survives."', 'Spock and Kirk', NULL, 72),
    ('"Can you imagine how life could be improved if we could do away with jealousy, greed, hate ..." "It can also be improved by eliminating love, tenderness, sentiment -- the other side of the coin"', 'Dr. Roger Corby and Kirk', 2712.4, 7),
    ...
~~~

### Dump fails (user does not have `SELECT` privilege)

In this example, the `dump` command fails for a user that does not have the `SELECT` privilege on the `episodes` table.

~~~ shell
$ cockroach dump startrek episodes --user=leslieroach > backup.sql
~~~

~~~ shell
Error: pq: user leslieroach has no privileges on table episodes
Failed running "dump"
~~~

### Restore a table from a backup file

In this example, a user that has the `CREATE` privilege on the `startrek` database uses the [`cockroach sql`](use-the-built-in-sql-client.html) command to recreate a table, based on a file created by the `dump` command.

~~~ shell
$ cat backup.sql
CREATE TABLE quotes (
    quote STRING NULL,
    characters STRING NULL,
    stardate DECIMAL NULL,
    episode INT NULL,
    INDEX quotes_episode_idx (episode),
    FAMILY "primary" (quote, rowid),
    FAMILY fam_1_characters (characters),
    FAMILY fam_2_stardate (stardate),
    FAMILY fam_3_episode (episode)
);

INSERT INTO quotes (quote, characters, stardate, episode) VALUES
    ('"... freedom ... is a worship word..." "It is our worship word too."', 'Cloud William and Kirk', NULL, 52),
    ('"Beauty is transitory." "Beauty survives."', 'Spock and Kirk', NULL, 72),
    ('"Can you imagine how life could be improved if we could do away with jealousy, greed, hate ..." "It can also be improved by eliminating love, tenderness, sentiment -- the other side of the coin"', 'Dr. Roger Corby and Kirk', 2712.4, 7),
    ...
~~~

~~~ shell
$ cockroach sql --database=startrek --user=maxroach < backup.sql
~~~

~~~ shell
CREATE TABLE
INSERT 100
INSERT 100
~~~

### Dump table data as of a specific time

In this example, we assume there were several inserts into a table both before and after `2017-03-07 19:55:00`.

First, let's use the built-in SQL client to view the table at the current time:

~~~ shell
$ cockroach sql --execute="SELECT * FROM db1.dump_test"
~~~

~~~
+--------------------+------+
|         id         | name |
+--------------------+------+
| 225594758537183233 | a    |
| 225594758537248769 | b    |
| 225594758537281537 | c    |
| 225594758537314305 | d    |
| 225594758537347073 | e    |
| 225594758537379841 | f    |
| 225594758537412609 | g    |
| 225594758537445377 | h    |
| 225594991654174721 | i    |
| 225594991654240257 | j    |
| 225594991654273025 | k    |
| 225594991654305793 | l    |
| 225594991654338561 | m    |
| 225594991654371329 | n    |
| 225594991654404097 | o    |
| 225594991654436865 | p    |
+--------------------+------+
(16 rows)
~~~

Next, let's use a [time-travel query](select.html#select-historical-data-time-travel) to view the contents of the table as of `2017-03-07 19:55:00`:

~~~ shell
$ cockroach sql --execute="SELECT * FROM db1.dump_test AS OF SYSTEM TIME '2017-03-07 19:55:00'"
~~~

~~~
+--------------------+------+
|         id         | name |
+--------------------+------+
| 225594758537183233 | a    |
| 225594758537248769 | b    |
| 225594758537281537 | c    |
| 225594758537314305 | d    |
| 225594758537347073 | e    |
| 225594758537379841 | f    |
| 225594758537412609 | g    |
| 225594758537445377 | h    |
+--------------------+------+
(8 rows)
~~~

Finally, let's use `cockroach dump` with the `--as-of` flag set to dump the contents of the table as of `2017-03-07 19:55:00`.

~~~ shell
$ cockroach dump db1 dump_test --dump-mode=data --as-of='2017-03-07 19:55:00'
~~~

~~~
INSERT INTO dump_test (id, name) VALUES
    (225594758537183233, 'a'),
    (225594758537248769, 'b'),
    (225594758537281537, 'c'),
    (225594758537314305, 'd'),
    (225594758537347073, 'e'),
    (225594758537379841, 'f'),
    (225594758537412609, 'g'),
    (225594758537445377, 'h');
~~~

As you can see, the results of the dump are identical to the earlier time-travel query.

## See Also

- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
