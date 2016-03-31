---
title: Configure Replication Zones
toc: false
---

Intro

<div id="toc"></div>

## Subcommands

Subcommand | Usage 
-----------|------
`get` | Create the self-signed CA certificate and key for the entire cluster.
`ls` | Create a certificate and key for a specific node in the cluster. You specify all addresses at which the node can be reached and pass appropriate flags.
`rm` | Create a certificate and key for a specific user accessing the cluster from a client. You specify the username of the user who will use the certificate and pass appropriate flags.  
`set` | Create a certificate and key for a specific user accessing the cluster from a client. You specify the username of the user who will use the certificate and pass appropriate flags.  

## Synopsis

~~~ shell

# View help:
$ ./cockroach help zone
$ ./cockroach help zone get
$ ./cockroach help zone ls
$ ./cockroach help zone rm
$ ./cockroach help zone set
~~~

## Flags

The `cert` command and subcommands support the following flags, as well as [logging flags](cockroach-commands.html#logging-flags). 

Flag | Description
-----|------------
`--ca-cert` | The path to the CA certificate. <br><br>This flag is required for all subcommands. When used with `create-ca` in particular, this flag defines where to create the certificate and what to call it; the specified directory must exist. 
`--ca-key` | The path to the private key protecting the CA certificate. <br><br>This flag is required for all subcommands. When used with `create-ca` in particular, it defines where to create the certificate and what to call it; the specified directory must exist. 
`--cert` | The path to the node or client certificate. <br><br>This flag is used only with the `create-node` and `create-client` subcommands. It defines where to create the node or client certificate and what to call it; the specified directory must exist.  
`--key` | The path to the private key protecting the node or client certificate. <br><br>This flag is used only with the `create-node` and `create-client` subcommands. It defines where to create the node or client key and what to call it; the specified directory must exist.
`--key-size` | The size of the CA, node, or client key, in bits.<br><br>**Default:** 2048 

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