---
title: Stop a Node
toc: false
---

To stop a CockroachDB node, run the `cockroach quit` command with appropriate flags. This allows in-flight requests to complete and then shuts down the node.

Once a node has been offline for approximately 5 minutes, CockroachDB automatically rebalances replicas from the missing node, using unaffected replicas on other nodes as sources. 

<div id="toc"></div>

## Synopsis

~~~ shell
# Run the command:
$ ./cockroach quit <flags>

# View help directly in your shell:
$ ./cockroach help quit
~~~

## Flags

The `quit` command supports the following flags as well as [logging flags](cockroach-commands.html#logging-flags) that can be set on any command.


Flag | Description 
-----|------------
`--certs` | The path to the directory containing the node's [security certificates](create-security-certificates.html). If the node was started with security (i.e., without the `--insecure` flag), the `--certs` flag is required. <br><br> **Default:** certs
`--host` | A valid address for reaching the node. If the node advertises itself on multiple addresses (internal hostname, internal ip, external hostname, external ip, etc.), this can be any one of them. <br><br>**Default:** localhost
`--insecure` | Whether or not the cluster is secure (authentication and encrypted client/node and inter-node communication). If the cluster is secure, set the `--certs` flag but leave this flag out. If the cluster is insecure, set this flag.
`--port` | The port over which the node communicates to the rest of the cluster and clients communicate to the node. <br><br>**Default:** 26257

## Examples

####Shut down a secure node:

~~~ shell
$ ./cockroach quit --certs=/nodecerts --host=nodehostname.com --port=26260 
~~~

####Shut down an insecure node:

~~~ shell
$ ./cockroach quit --insecure --host=nodehostname.com --port=26260 
~~~