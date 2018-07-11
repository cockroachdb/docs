---
title: View Node Details
summary: To view details for each node in the cluster, use the cockroach node command with the appropriate subcommands and flags.
toc: true
---

To view details for each node in the cluster, use the `cockroach node` [command](cockroach-commands.html) with the appropriate subcommands and flags.


## Subcommands

Subcommand | Usage
-----------|------
`ls` | List the ID of each node in the cluster.
`status` | View the status of one or all nodes.

## Synopsis

~~~ shell
# List node IDs:
$ cockroach node ls <flags>

# Show the status of nodes:
$ cockroach node status <optional node ID> <flags>

# View help:
$ cockroach node --help
$ cockroach node ls --help
$ cockroach node status --help
~~~

## Flags

The `node` command and subcommands support the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). The directory must contain valid certificates if running in secure mode.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--port` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--pretty` | Format table rows printed to the standard output using ASCII art and disable escaping of special characters.<br><br>When disabled with `--pretty=false`, or when the standard output is not a terminal, table rows are printed as tab-separated values, and special characters are escaped. This makes the output easy to parse by other programs.<br><br>**Default:** `true` when output is a terminal, `false` otherwise

### Logging

By default, the `node` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Response

For the `node ls` command, only the `id` field is returned for each node. For the `node status` command, all of the following fields are returned for each node.

Field | Description
----------|------------
`id` | The ID of the node.<br><br>**Required flag:** None
`address` | The address of the node.<br><br>**Required flag:** None
`build` | The version of CockroachDB running on the node. If the binary was built from source, this will be the SHA hash of the commit used.<br><br>**Required flag:** None
`updated_at` | The date and time when the node last recorded the information displayed in this command's output. When healthy, a new status should be recorded every 10 seconds or so, but when unhealthy this command's stats may be much older.<br><br>**Required flag:** None
`started_at` | The date and time when the node was started.<br><br>**Required flag:** None
`live_bytes` | The amount of live data used by both applications and the CockroachDB system. This excludes historical and deleted data.<br><br>**Required flag:** `--stats` or `--all`
`key_bytes` | The amount of live and non-live data from keys in the key-value storage layer. This does not include data used by the CockroachDB system.<br><br>**Required flag:** `--stats` or `--all`
`value_bytes` | The amount of live and non-live data from values in the key-value storage layer. This does not include data used by the CockroachDB system.<br><br>**Required flag:** `--stats` or `--all`
`intent_bytes` | The amount of non-live data associated with uncommitted (or recently-committed) transactions.<br><br>**Required flag:** `--stats` or `--all`
`system_bytes` | The amount of data used just by the CockroachDB system.<br><br>**Required flag:** `--stats` or `--all`
`replicas_leaders` | The number of range replicas on the node that are the Raft leader for their range. See `replicas_leaseholders` below for more details.<br><br>**Required flag:** `--ranges` or `--all`
`replicas_leaseholders` | The number of range replicas on the node that are the leaseholder for their range. A "leaseholder" replica handles all read requests for a range and directs write requests to the range's Raft leader (usually the same replica as the leaseholder).<br><br>**Required flag:** `--ranges` or `--all`
`ranges` | The number of ranges that have replicas on the node.<br><br>**Required flag:** `--ranges` or `--all`
`ranges_unavailable` | The number of unavailable ranges that have replicas on the node.<br><br>**Required flag:** `--ranges` or `--all`
`ranges_underreplicated` | The number of underreplicated ranges that have replicas on the node.<br><br>**Required flag:** `--ranges` or `--all`

## Examples

### List node IDs

~~~ shell
$ cockroach node ls --insecure
~~~

~~~
+----+
| id |
+----+
|  1 |
|  2 |
|  3 |
+----+
~~~

### Show the status of a single node

~~~ shell
$ cockroach node status 1 --insecure
~~~

~~~
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
| id |     address     |           build           |     updated_at      |     started_at      | live_bytes | key_bytes | value_bytes | intent_bytes | system_bytes | leader_ranges | repl_ranges | avail_ranges |
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
|  1 | localhost:26257 | beta-20160421-42-g62a0fd2 | 2016-04-21 14:41:11 | 2016-04-21 14:12:21 |    4162883 |      4343 |     4159321 |            0 |         3459 |             4 |           4 |            4 |
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
~~~

### Show the status of all nodes

~~~ shell
$ cockroach node status --insecure
~~~

~~~
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
| id |     address     |           build           |     updated_at      |     started_at      | live_bytes | key_bytes | value_bytes | intent_bytes | system_bytes | leader_ranges | repl_ranges | avail_ranges |
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
|  1 | localhost:26257 | beta-20160421-42-g62a0fd2 | 2016-04-21 14:41:51 | 2016-04-21 14:12:21 |    4260491 |      4343 |     4256929 |            0 |         3459 |             4 |           4 |            4 |
|  2 | localhost:26258 | beta-20160421-42-g62a0fd2 | 2016-04-21 14:41:53 | 2016-04-21 14:12:53 |    4268625 |      4343 |     4265063 |            0 |         3459 |             1 |           1 |            1 |
|  3 | localhost:26259 | beta-20160421-42-g62a0fd2 | 2016-04-21 14:41:48 | 2016-04-21 14:13:18 |    4252357 |      4343 |     4248795 |            0 |         3459 |             0 |           0 |            0 |
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
~~~

## See Also

[Other Cockroach Commands](cockroach-commands.html)
