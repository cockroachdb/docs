---
title: Stop a Node
summary: To stop a CockroachDB node running in the background, run the cockroach quit command.
toc: false
---

To stop a CockroachDB node running in the background, run the `cockroach quit` [command](cockroach-commands.html) with appropriate flags. To stop a node running in the foreground, use **CTRL + C** or run `cockroach quit` from another shell. 

The `quit` command allows in-flight requests to complete and then shuts down the node. Once a node has been offline for approximately 5 minutes, CockroachDB automatically rebalances replicas from the missing node, using unaffected replicas on other nodes as sources. 

<div id="toc"></div>

## Synopsis

~~~ shell
# Stop a node:
$ cockroach quit <flags>

# View help:
$ cockroach help quit
~~~

## Flags

The `quit` command supports the following flags as well as [logging flags](cockroach-commands.html#logging-flags).

Flag | Description 
-----|------------
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CA_CERT`
`--cert` | The path to the [client certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CERT`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** localhost
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--key` | The path to the [client key](create-security-certificates.html) protecting the client certificate. This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_KEY` 
`--port` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`

## Example

#### Shut down a node

~~~ shell
# Insecure:
$ cockroach quit --host=nodehostname.com --port=26258

# Secure:
$ cockroach quit --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key --host=nodehostname.com --port=26258
~~~

## See Also

[Other Cockroach Commands](cockroach-commands.html)