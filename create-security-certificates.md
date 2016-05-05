---
title: Create Security Certificates
toc: false
---

A secure CockroachDB cluster uses [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) for encrypted inter-node and client-node communication and requires CA, node, and client certificates and keys. To create these certificates and keys, use the `cockroach cert` [command](cockroach-commands.html) with the appropriate subcommands and flags. 

When using <code>cockroach cert</code> to create node and client certificates, you will need access to a local copy of the CA certificate and key. It is therefore recommended to create all certificates and keys in one place and then distribute node and client certificates and keys appropriately. For the CA key, be sure to store it somewhere safe and keep a backup; if you lose it, you will not be able to add new nodes or clients to your cluster. For a walkthrough of this process, see [Manual Deployment](manual-deployment.html).

<div id="toc"></div>

## Subcommands

Subcommand | Usage 
-----------|------
`create-ca` | Create the self-signed CA certificate and key for the entire cluster.
`create-node` | Create a certificate and key for a specific node in the cluster. You specify all addresses at which the node can be reached and pass appropriate flags.
`create-client` | Create a certificate and key for a specific user accessing the cluster from a client. You specify the username of the user who will use the certificate and pass appropriate flags.  

## Synopsis

~~~ shell
# Create the CA certificate and key:
$ ./cockroach cert create-ca --ca-cert=<path-to-ca-cert> --ca-key=<path-to-ca-key> 

# Create a node certificate and key, specifying all addresses at which the node can be reached:
$ ./cockroach cert create-node <node-hostname> <node-other-hostname> <node-yet-another-hostname> --ca-cert=<path-to-ca-cert> --ca-key=<path-to-ca-key> --cert=<path-to-node-cert> --key=<path-to-node-key> 

# Create a client certificate and key:
$ ./cockroach cert create-client <username> --ca-cert=<path-to-ca-cert> --ca-key=<path-to-ca-key> --cert=<path-to-client-cert> --key=<path-to-client-key>

# View help:
$ ./cockroach help cert
$ ./cockroach help cert create-ca
$ ./cockroach help cert create-node
$ ./cockroach help cert create-client
~~~

## Flags

The `cert` command and subcommands support the following flags, as well as [logging flags](cockroach-commands.html#logging-flags). 

Flag | Description
-----|------------
`--ca-cert` | The path to the CA certificate. <br><br>This flag is required for all subcommands. When used with `create-ca` in particular, this flag defines where to create the certificate and what to call it; the specified directory must exist. 
`--ca-key` | The path to the private key protecting the CA certificate. <br><br>This flag is required for all subcommands. When used with `create-ca` in particular, it defines where to create the certificate and what to call it; the specified directory must exist. 
`--cert` | The path to the node or client certificate. <br><br>This flag is used only with the `create-node` and `create-client` subcommands. It defines where to create the node or client certificate and what to call it; the specified directory must exist.  
`--key` | The path to the private key protecting the node or client certificate. <br><br>This flag is used only with the `create-node` and `create-client` subcommands. It defines where to create the node or client key and what to call it; the specified directory must exist.
`--key-size` | The size of the CA, node, or client key, in bits.<br><br>**Default:** `2048`

## Examples

### Create the CA certificate and key

~~~ shell
$ ./cockroach cert create-ca --ca-cert=certs/ca.cert --ca-key=certs/ca.key 
~~~

### Create the certificate and key for a node

~~~ shell
$ ./cockroach cert create-node node1.example.com node1.another-example.com --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/node.cert --key=certs/node.key
~~~

### Create the certificate and key for a client

~~~ shell
$ ./cockroach cert create-client maxroach --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/maxroach.cert --key=certs/maxroach.key
~~~

## See Also

- [Manual Deployment](manual-deployment.html): Walkthrough starting a multi-node secure cluster and accessing it from a client. 
- [Start a Node](start-a-node.html): Learn more about the flags you pass when adding a node to a secure cluster.
- [Other Cockroach Commands](cockroach-commands.html)