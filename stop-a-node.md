---
title: Stop a Node
toc: false
---

To stop a CockroachDB node running in the background, run the `cockroach quit` command with appropriate flags. To stop a node running in the foreground, use **control + c** or run `cockroach quit` from another shell. 

The `quit` command allows in-flight requests to complete and then shuts down the node. Once a node has been offline for approximately 5 minutes, CockroachDB automatically rebalances replicas from the missing node, using unaffected replicas on other nodes as sources. 

<div id="toc"></div>

## Synopsis

~~~ shell
# Stop a node:
$ ./cockroach quit <flags>

# View help:
$ ./cockroach help quit
~~~

## Flags

The `quit` command supports the following flags as well as [logging flags](cockroach-commands.html#logging-flags).


Flag | Description 
-----|------------
`--certs` | The path to the directory containing the node's [security certificates](create-security-certificates.html). If the node was started with security (i.e., without the `--insecure` flag), the `--certs` flag is required. <br><br> **Default:** certs
`--host` | A valid address for reaching the node. <br><br>**Default:** localhost
`--insecure` | Whether or not the cluster is secure (authentication and encrypted client/node and inter-node communication). If the cluster is secure, set the `--certs` flag but leave this flag out. If the cluster is insecure, set this flag.
`--port` | The port that the node listens on for internal and client communication. <br><br>**Default:** 26257

## Examples

#### Shut down a node

~~~ shell
# Secure:
$ ./cockroach quit --certs=/nodecerts --host=nodehostname.com --port=26260 

# Insecure:
$ ./cockroach quit --insecure --host=nodehostname.com --port=26260 
~~~