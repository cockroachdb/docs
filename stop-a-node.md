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
$ cockroach quit --help
~~~

## Flags

The `quit` command supports the following flags:

Flag | Description
-----|------------
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). The directory must contain valid certificates if running in secure mode.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:**`localhost`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--port` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`

### Logging

By default, the `quit` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can also change its [logging behavior](debug-and-error-logs.html).

## Example

#### Shut down a node

~~~ shell
# Insecure:
$ cockroach quit --insecure --host=nodehostname.com --port=26258

# Secure:
$ cockroach quit --certs-dir=certs --host=nodehostname.com --port=26258
~~~

## See Also

[Other Cockroach Commands](cockroach-commands.html)
