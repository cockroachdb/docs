---
title: Create Security Certificates
toc: false
---

A secure CockroachDB cluster uses [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) for encrypted inter-node and client-node communication and requires CA, node, and client certificates and keys. To create these certificates and keys, use the `cockroach cert` command with the appropriate subcommand and flags. 

{{site.data.alerts.callout_info}}When you create node and client certificates, you need access to a local copy of the CA certificate and key. Therefore, it's recommended to create all certificates and keys in one place and then distribute node and client certificates and keys appropriately and store the CA key in a safe place. For a walkthrough of this process, see <a href="https://www.cockroachlabs.com/docs/manual-deployment.html">Manual Deployment</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Subcommands

Subcommand | Usage 
-----------|------
`create-ca` | Create the Certificate Authority (CA) certificate and key for the entire cluster.
`create-node` | Create a certificate and key for a specific node in the cluster.
`create-client` | Create a certificate and key for a specific user accessing the cluster from a client. 

## Synopsis

~~~ shell
# Create the CA certificate and key:
$ ./cockroach cert create-ca --ca-cert=<path-to-ca-cert> --ca-key=<path-to-ca-key> 

# Create a node certificate and key:
$ ./cockroach cert create-node <nodehost1> ... <nodehostN> --ca-cert=<path-to-ca-cert> --ca-key=<path-to-ca-key> --cert=<path-to-node-cert> --key=<path-to-node-key> 

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
`--ca-cert` | The path to the CA certificate. <br><br>This flag is required for all subcommands. When used with `create-ca` in particular, this flag defines where to create the certificate and what to call it; the specified directory must exist, and it's customary to use the `.cert` file extension. 
`--ca-key` | The path to the private key protecting the CA certificate. <br><br>This flag is required for all subcommands. When used with `create-ca` in particular, it defines where to create the certificate and what to call it; the specified directory must exist, and it's customary to use the `.key` file extension. 
`--cert` | The path to the node or client certificate. <br><br>This flag is required only for the `create-node` and `create-client` subcommands. It defines where to create the node or client certificate and what to call it; the specified directory must exist, and it's customary to use the `.cert` file extension.  
`--key` | The path to the private key protecting the node or client certificate. <br><br>This flag is required only for the `create-node` and `create-client` subcommands. It defines where to create the node or client key and what to call it; the specified directory must exist, and it's customary to use the `.key` file extension.
`--key-size` | The size of the CA, node, or client key, in bits.<br><br>**Default:** 2048 

## Examples

#### Create the CA certificate and key

~~~ shell
$ ./cockroach cert create-ca --ca-cert=/certs/ca.cert --ca-key=/certs/ca.key 
~~~

#### Create the certificate and key for a node

~~~ shell
$ ./cockroach cert create-node nodehostname1.com nodehostname2.com --ca-cert=/certs/ca.cert --ca-key=/certs/ca.key --cert=/certs/node.cert --key=/certs/node.key
~~~

#### Create the certificate and key for a client

~~~ shell
$ ./cockroach cert create-client maxroach --ca-cert=/certs/ca.cert --ca-key=/certs/ca.key --cert=/certs/client.cert --key=/certs/client.key
~~~
