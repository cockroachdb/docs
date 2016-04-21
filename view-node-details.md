---
title: View Node Details
toc: false
---

XXX

<div id="toc"></div>

## Subcommands

Subcommand | Usage 
-----------|------
`ls` | List the ID of each node in the cluster.
`status` | View the status of one or all nodes.  

## Synopsis

~~~ shell
# List node IDs:
$ ./cockroach node ls <flags> 

# Show the status of nodes:
$ ./cockroach node status <optional node ID> <flags>

# View help:
$ ./cockroach help node
$ ./cockroach help node ls
$ ./cockroach help node status
~~~

## Flags

The `node` command and subcommands support the following flags, as well as [logging flags](cockroach-commands.html#logging-flags). 

Flag | Description 
-----|------------
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required in a secure cluster.<br><br>**Env Variable:** `COCKROACH_CA_CERT`
`--cert` | The path to the [node certificate](create-security-certificates.html). This flag is required in a secure cluster.<br><br>**Env Variable:** `COCKROACH_CERT`
`--host` | A valid address for reaching the node. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** localhost
`--http-port` | The port that the node listens on for HTTP requests. <br><br>**Env Variable:** `COCKROACH_HTTP_PORT`<br>**Default:** `8080`
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--key` | The path to the [node key](create-security-certificates.html) protecting the node certificate. This flag is required in a secure cluster.<br><br>**Env Variable:** `COCKROACH_KEY` 

## Response


## Examples

#### Create the CA certificate and key

~~~ shell
$ ./cockroach cert create-ca --ca-cert=certs/ca.cert --ca-key=certs/ca.key 
~~~

#### Create the certificate and key for a node

~~~ shell
$ ./cockroach cert create-node node1.example.com node1.another-example.com --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/node.cert --key=certs/node.key
~~~

#### Create the certificate and key for a client

~~~ shell
$ ./cockroach cert create-client maxroach --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/maxroach.cert --key=certs/maxroach.key
~~~

## Related Topics

- [Manual Deployment](manual-deployment.html): Walkthrough starting a multi-node secure cluster and accessing it from a client. 
- [Start a Node](start-a-node.html): Learn more about the flags you pass when adding a node to a secure cluster.

## See Also

[Other Cockroach Commands](cockroach-commands.html)