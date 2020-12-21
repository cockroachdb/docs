---
title: cockroach dump
summary: Learn how to dump schemas and data from a CockroachDB cluster.
toc: true
redirect_from: sql-dump.html
key: sql-dump.html
---

{{site.data.alerts.callout_danger}}
`cockroach dump` is no longer recommended and has been deprecated in v20.2. Instead, back up your data in a [full backup](take-full-and-incremental-backups.html), [export](export.html) your data in plain text format, or view table schema in plaintext with [`SHOW CREATE TABLE`](show-create.html).</li></ul>
{{site.data.alerts.end}}

The `cockroach dump` [command](cockroach-commands.html) outputs the SQL statements required to recreate tables, views, and sequences. This command can be used to back up or export each database in a cluster. The output should also be suitable for importing into other relational databases, with minimal adjustments.

## Considerations

When `cockroach dump` is executed:

- Table, sequence, and view schemas and table data are dumped as they appeared at the time that the command is started. Any changes after the command starts will not be included in the dump.
- Table and view schemas are dumped in the order in which they can successfully be recreated. This is true of sequences as well.
- If the dump takes longer than the [`ttlseconds`](configure-replication-zones.html) replication setting for the table (25 hours by default), the dump may fail.
- Reads, writes, and schema changes can happen while the dump is in progress, but will not affect the output of the dump.

{{site.data.alerts.callout_info}}
The user must have the `SELECT` privilege on the target table(s).
{{site.data.alerts.end}}

## Synopsis

Dump the schemas and data of specific tables to stdout:

~~~ shell
$ cockroach dump <database> <table> <table...> <flags>
~~~

Dump just the data of specific tables to stdout:

~~~ shell
$ cockroach dump <database> <table> <table...> --dump-mode=data <other flags>
~~~

Dump just the schemas of specific tables to stdout:

~~~ shell
$ cockroach dump <database> <table> <table...> --dump-mode=schema <other flags>
~~~

Dump the schemas and data of all tables in a database to stdout:

~~~ shell
$ cockroach dump <database> <flags>
~~~

Dump just the schemas of all tables in a database to stdout:

~~~ shell
$ cockroach dump <database> --dump-mode=schema <other flags>
~~~

Dump just the data of all tables in a database to stdout:

~~~ shell
$ cockroach dump <database> --dump-mode=data <other flags>
~~~

 Dump all non-system databases:

~~~ shell
$ cockroach dump --dump-all
~~~

Dump to a file:

~~~ shell
$ cockroach dump <database> <table> <flags> > dump-file.sql
~~~

View help:

~~~ shell
$ cockroach dump --help
~~~

## Flags

The `dump` command supports the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--as-of` | Dump table schema and/or data as they appear at the specified [timestamp](timestamp.html). See this [example](#dump-table-data-as-of-a-specific-time) for a demonstration.<br><br>Note that historical data is available only within the garbage collection window, which is determined by the [`ttlseconds`](configure-replication-zones.html) replication setting for the table (25 hours by default). If this timestamp is earlier than that window, the dump will fail.<br><br>**Default:** Current time
`--dump-all` |  [Dump all non-system databases](#dump-all-databases), their table schemas, and data.
`--dump-mode` | Whether to dump table and view schemas, table data, or both.<br><br>To dump just table and view schemas, set this to `schema`. To dump just table data, set this to `data`. To dump both table and view schemas and table data, leave this flag out or set it to `both`.<br><br>Table and view schemas are dumped in the order in which they can successfully be recreated. For example, if a database includes a table, a second table with a foreign key dependency on the first, and a view that depends on the second table, the dump will list the schema for the first table, then the schema for the second table, and then the schema for the view.<br><br>**Default:** `both`
`--echo-sql` | Reveal the SQL statements sent implicitly by the command-line utility.

### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

See [Client Connection Parameters](connection-parameters.html) for more details.

{{site.data.alerts.callout_info}}
The user specified with `--user` must have the `SELECT` privilege on the target tables.
{{site.data.alerts.end}}

### Logging

By default, the `dump` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Examples

{{site.data.alerts.callout_info}}
These examples use our sample `startrek` database, which you can add to a cluster via the [`cockroach gen`](cockroach-gen.html#generate-example-data) command. Also, the examples assume that the `maxroach` user has been [granted](grant.html) the `SELECT` privilege on all target tables.
{{site.data.alerts.end}}

### Dump a table's schema and data

{% include copy-clipboard.html %}
~~~ shell
$ cockroach dump startrek episodes --insecure --user=maxroach > backup.sql
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cat backup.sql
~~~

~~~
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach dump startrek episodes --insecure --user=maxroach --dump-mode=schema > backup.sql
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cat backup.sql
~~~

~~~
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach dump startrek episodes --insecure --user=maxroach --dump-mode=data > backup.sql
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cat backup.sql
~~~

~~~
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach dump startrek --insecure --user=maxroach > backup.sql
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cat backup.sql
~~~

~~~
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

## Dump all databases

 To dump all non-system databases, their table schemas, and data:

~~~ shell
$ cockroach dump --dump-all
~~~

~~~
CREATE DATABASE IF NOT EXISTS movr;
USE movr;

CREATE TABLE promo_codes (
	code VARCHAR NOT NULL,
	description VARCHAR NULL,
	creation_time TIMESTAMP NULL,
	expiration_time TIMESTAMP NULL,
	rules JSONB NULL,
	CONSTRAINT "primary" PRIMARY KEY (code ASC),
	FAMILY "primary" (code, description, creation_time, expiration_time, rules)
);

CREATE TABLE users (
	...
);

CREATE TABLE vehicles (
	...
);

CREATE TABLE rides (
	...
);

CREATE TABLE user_promo_codes (
	...
);

CREATE TABLE vehicle_location_histories (
	...
);

INSERT INTO promo_codes (code, description, creation_time, expiration_time, rules) VALUES
	('0_explain_theory_something', 'Live sing car maybe. Give safe edge chair discuss resource. Stop entire look support instead. Sister focus long agency like argue.', '2018-12-27 03:04:05+00:00', '2019-01-02 03:04:05+00:00', '{"type": "percent_discount", "value": "10%"}'),
	('100_address_garden_certain', 'Hour industry himself student position international. Southern traditional rest name prepare. Tough sign little into class. Money general care guy.', '2018-12-27 03:04:05+00:00', '2019-01-13 03:04:05+00:00', '{"type": "percent_discount", "value": "10%"}'),

  ...
~~~

### Dump fails (user does not have `SELECT` privilege)

In this example, the `dump` command fails for a user that does not have the `SELECT` privilege on the `episodes` table.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach dump startrek episodes --insecure --user=leslieroach > backup.sql
~~~

~~~
Error: pq: user leslieroach has no privileges on table episodes
Failed running "dump"
~~~

### Restore a table from a backup file

In this example, a user that has the `CREATE` privilege on the `startrek` database uses the [`cockroach sql`](cockroach-sql.html) command to recreate a table, based on a file created by the `dump` command.

{% include copy-clipboard.html %}
~~~ shell
$ cat backup.sql
~~~

~~~
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --database=startrek --user=maxroach < backup.sql
~~~

~~~
CREATE TABLE
INSERT 100
INSERT 100
~~~

### Dump table data as of a specific time

In this example, we assume there were several inserts into a table both before and after `2017-03-07 19:55:00`.

First, let's use the built-in SQL client to view the table at the current time:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --execute="SELECT * FROM db1.dump_test"
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

Next, let's use a [time-travel query](select-clause.html#select-historical-data-time-travel) to view the contents of the table as of `2017-03-07 19:55:00`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --execute="SELECT * FROM db1.dump_test AS OF SYSTEM TIME '2017-03-07 19:55:00'"
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach dump db1 dump_test --insecure --dump-mode=data --as-of='2017-03-07 19:55:00'
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

## See also

- [Import Data](import-data.html)
- [`IMPORT`](import.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)
