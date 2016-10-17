---
title: View Node Details
summary: To view details for each node in the cluster, use the cockroach node command with the appropriate subcommands and flags.
toc: false
---

To view details for each node in the cluster, use the `cockroach node` [command](cockroach-commands.html) with the appropriate subcommands and flags.

<div id="toc"></div>

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

The `node` command and subcommands support the following flags, as well as [logging flags](cockroach-commands.html#logging-flags). 

Flag | Description 
-----|------------
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CA_CERT`
`--cert` | The path to the [client certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CERT`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** localhost
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--key` | The path to the [client key](create-security-certificates.html) protecting the client certificate. This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_KEY` 
`--port` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`

## Response

For the `node ls` command, only the `id` field is returned for each node. For the `node status` command, all of the following fields are returned for each node.

Field | Description
----------|------------
`id` | 
`address` | 
`build` |  
`updated_at` | 
`started_at` |   
`live_bytes` |  
`key_bytes` |  
`value_bytes` | 
`intent_bytes` | 
`system_bytes` | 
`leader_ranges` | 
`repl_ranges` | 
`avail_ranges` | 

## Examples

### List node IDs

~~~ shell
$ cockroach node ls
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
$ cockroach node status 1 
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
| id |     address     |           build           |     updated_at      |     started_at      | live_bytes | key_bytes | value_bytes | intent_bytes | system_bytes | leader_ranges | repl_ranges | avail_ranges |
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
|  1 | localhost:26257 | beta-20160421-42-g62a0fd2 | 2016-04-21 14:41:11 | 2016-04-21 14:12:21 |    4162883 |      4343 |     4159321 |            0 |         3459 |             4 |           4 |            4 |
+----+-----------------+---------------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+---------------+-------------+--------------+
~~~

### Show the status of all nodes

~~~ shell
$ cockroach node status
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