---
title: Stop a Node
toc: false
---

To stop a CockroachDB node, run the `cockroach quit` command. This allows in-flight requests to complete and then shuts down the node; all new requests are ignored. 

Once a node has been offline for 10 minutes, CockroachDB automatically rebalances replicas from the missing node, using the unaffected replicas as sources. Using capacity information from the gossip network, new locations in the cluster are identified and the missing replicas are re-replicated in a distributed fashion using all available nodes and the aggregate disk and network bandwidth of the cluster.

<div id="toc"></div>

## Synopsis

~~~
$ ./cockroach quit [flags]
~~~

## Flags

The `quit` command supports the following flags.  

| Flag | Description |
|------|-------------|
| `certs` | The path to the directory containing [security certificates](create-security-certificates.html). This flag is required when the `--insecure` flag is absent or set to `false`, i.e., when the node is running in secure mode. <br><br> **Default:** certs |
| [`host`](#host) | Database server host. When running as a server, the node will advertise itself using this hostname; it must resolve from other nodes in the cluster. When running the sql command shell, this is a hostname of a node in the cluster.|
| `insecure` | When the node is running without security (no authentication or encryption), this flag is required. When the node is running with security, this flag must be absent or set to `false`. |
| [`port`](#port) | The port to bind to for inter-node and node-client communication. |

## Examples