---
title: Create Security Certificates
toc: false
---

A secure CockroachDB cluster uses [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) for encrypted inter-node and client-node communication and requires CA, node, and client certificates. To create these certificates, use the `cockroach cert` command with the appropriate subcommands and flags. 

<div id="toc"></div>

## Synopsis

~~~ shell
# Create the CA certificate and key:
$ ./cockroach cert create-ca <flags>

# Create a node certificate and key:
$ ./cockroach cert create-node <flags>

# Create a client certificate and key:
$ ./cockroach cert create-client <flags>

# View help:
$ ./cockroach help cert
$ ./cockroach help cert create-ca
$ ./cockroach help cert create-node
$ ./cockroach help cert create-client
~~~

## Subcommands

Subcommand | Usage 
-----------|------
`create-ca` | Create the Certificate Authority (CA) certificate and key for the entire cluster.
`create-node` | Create a certificate and key for a specific node in the cluster.
`create-client` | Create a certificate and key for a specific user accessing the cluster from a client. 

## Flags 

The `cert` command and subcommands support the following flags, as well as [logging flags](cockroach-commands.html#logging-flags). 

- [For `create-ca` subcommand](#create-ca)
- [For `create-node` subcommand](#create-node)
- [For `create-client` subcommand](#create-client)

### `create-ca`

Flag | Description
-----|------------
`--ca-cert` | The path to the directory where the CA certificate will be created. The directory must exist, and it's customary to use the `.cert` file extension.
`--ca-key` |  The path the the directory where the CA key will be created. The directory must exist, and it's customary to use the `.key` file extension. 
`--key-size` | The size of the CA key, in bits.<br><br>**Default:** 2048 

### `create-node`

Flag | Description
-----|------------
`--ca-cert` | The path to the directory where the CA certificate will be created. The directory must exist, and it's customary to use the `.cert` file extension.
`--ca-key` |  The path the the directory where the CA key will be created. The directory must exist, and it's customary to use the `.key` file extension. 
`--key-size` | The size of the RSA public key, in bits. <br><br>**Default:** 2048 

### `create-client`

Flag | Description
-----|------------
`--ca-cert` | The path to the directory where the CA certificate will be created. The directory must exist, and it's customary to use the `.cert` file extension.
`--ca-key` |  The path the the directory where the CA key will be created. The directory must exist, and it's customary to use the `.key` file extension. 
`--key-size` | The size of the CA key, in bits.<br><br>**Default:** 2048 


### For `create-client`

## Examples
