---
title: Create Security Certificates
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication and requires CA, node, and client certificates and keys.
toc: false
---

A secure CockroachDB cluster uses [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) for encrypted inter-node and client-node communication and requires CA, node, and client certificates and keys. To create these certificates and keys, use the `cockroach cert` [command](cockroach-commands.html) with the appropriate subcommands and flags.

When using <code>cockroach cert</code> to create node and client certificates, you will need access to a local copy of the CA certificate and key. It is therefore recommended to create all certificates and keys in one place and then distribute node and client certificates and keys appropriately. For the CA key, be sure to store it somewhere safe and keep a backup; if you lose it, you will not be able to add new nodes or clients to your cluster. For a walkthrough of this process, see [Manual Deployment](manual-deployment.html).

<div id="toc"></div>

## Subcommands

Subcommand | Usage
-----------|------
`create-ca` | Create the self-signed certificate authority (CA), which you'll use to create and authenticate certificates for your entire cluster.
`create-node` | Create a certificate and key for a specific node in the cluster. You specify all addresses at which the node can be reached and pass appropriate flags.
`create-client` | Create a certificate and key for a [specific user](create-and-manage-users.html) accessing the cluster from a client. You specify the username of the user who will use the certificate and pass appropriate flags.
`list` | List certificates and keys found in the certificate directory.

## Certificate directory

The certificate directory holds all certificates and keys needed by the cockroach [commands](cockroach-commands.html).

Files inside the directory are interpreted based on the following naming scheme:

File pattern | File usage
-------------|------------
`ca.crt`     | CA certificate
`node.crt`   | Server certificate
`node.key`   | Key for server certificate
`client.<user>.crt` | Client certificate for `<user>` (eg: `client.root.crt` for user `root`)
`client.<user>.key` | Key for the client certificate

The CA key is never loaded automatically, it must be specified on the certificate-generation commands.

Keys (files ending in `.key`) must not have group or world permissions (maximum permissions are 0700, or `rwx------`). This check can be disabled by setting the environment variable `COCKROACH_SKIP_KEY_PERMISSION_CHECK=false`.

## Synopsis

~~~ shell
# Create the CA certificate and key:
$ cockroach cert create-ca \
 --certs-dir=<path-to-certs-directory> \
 --ca-key=<path-to-ca-key>

# Create a node certificate and key, specifying all addresses at which the node can be reached:
$ cockroach cert create-node \
 <node-hostname> \
 <node-other-hostname> \
 <node-yet-another-hostname> \
 --certs-dir=<path-to-certs-directory> \
 --ca-key=<path-to-ca-key>

# Create a client certificate and key:
$ cockroach cert create-client \
 <username> \
 --certs-dir=<path-to-certs-directory> \
 --ca-key=<path-to-ca-key>

# List certificates and keys:
$ cockroach cert list \
 --certs-dir=<path-to-certs-directory>

# View help:
$ cockroach cert --help
$ cockroach cert create-ca --help
$ cockroach cert create-node --help
$ cockroach cert create-client --help
$ cockroach cert list --help
~~~

## Flags

The `cert` command and subcommands support the following flags, as well as [logging flags](cockroach-commands.html#logging-flags).


Flag | Description
-----|-----------
`--certs-directory` | The path to the certificate directory. <br><br>This flag is used by all subcommands.
`--ca-key` | The path to the private key protecting the CA certificate. <br><br>This flag is required for all `create-*` subcommands. When used with `create-ca` in particular, it defines where to create the CA key; the specified directory must exist.
`--allow-ca-key-reuse` | If the CA key exists, use it rather than generating a new file. <br><br>This is to avoid unintentional re-use of a CA key. Applies to the `create-ca` subcommand only.
`--overwrite` | Allow overwrite of existing files. <br><br>The cert subcommands fail by default if files already exist. This is to avoid accidentally overwriting sensitive certificates and keys.
`--lifetime` | Lifetime of the certificate. <br><br>Certificates are valid from the time they are created and for `--lifetime`. Defaults vary for CA certificates and server/client certificates.
`--key-size` | The size of the CA, node, or client key, in bits.<br><br>**Default:** `2048`


## Examples

### Create the CA certificate and key

~~~ shell
$ ls ${HOME}/.cockroach-certs/
ls: ${HOME}/.cockroach-certs: No such file or directory

$ cockroach cert create-ca \
--ca-key=my-safe-directory/ca.key

$ ls -l ${HOME}/.cockroach-certs/
-rw-r--r--  1 maxroach  maxroach  1111 Apr 19 09:35 ca.crt
~~~

### Create the certificate and key for a node

~~~ shell
$ cockroach cert create-node \
node1.example.com \
node1.another-example.com \
--ca-key=my-safe-directory/ca.key

$ ls -l ${HOME}/.cockroach-certs/
-rw-r--r--  1 maxroach  maxroach  1111 Apr 19 09:35 ca.crt
-rw-r--r--  1 maxroach  maxroach  1192 Apr 19 09:36 node.crt
-rw-------  1 maxroach  maxroach  1675 Apr 19 09:36 node.key
~~~

### Create the certificate and key for a client

~~~ shell
$ cockroach cert create-client \
maxroach \
--ca-key=my-safe-directory/ca.key

$ ls -l ${HOME}/.cockroach-certs/
-rw-r--r--  1 maxroach  maxroach  1111 Apr 19 09:35 ca.crt
-rw-r--r--  1 maxroach  maxroach  1107 Apr 19 09:39 client.maxroach.crt
-rw-------  1 maxroach  maxroach  1679 Apr 19 09:39 client.maxroach.key
-rw-r--r--  1 maxroach  maxroach  1192 Apr 19 09:36 node.crt
-rw-------  1 maxroach  maxroach  1675 Apr 19 09:36 node.key
~~~

### List certificates and keys

~~~ shell
$ cockroach cert list
Certificate directory: ${HOME}/.cockroach-certs
+-----------------------+---------------------+---------------------+---------------+
|         Usage         |  Certificate File   |      Key File       |     Notes     |
+-----------------------+---------------------+---------------------+---------------+
| Certificate Authority | ca.crt              |                     |
| Node                  | node.crt            | node.key            |
| Client                | client.maxroach.crt | client.maxroach.key | user=maxroach |
+-----------------------+---------------------+---------------------+---------------+
~~~

## See Also

- [Manual Deployment](manual-deployment.html): Walkthrough starting a multi-node secure cluster and accessing it from a client.
- [Start a Node](start-a-node.html): Learn more about the flags you pass when adding a node to a secure cluster.
- [Other Cockroach Commands](cockroach-commands.html)
