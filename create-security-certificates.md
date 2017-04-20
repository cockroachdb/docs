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

## Certificate Directory

The `create-*` subcommands generate the CA certificate and all node and client certificates and keys in a single directory specified by the `--certs-dir` flag and names the files as follows:

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate
`node.crt`   | Server certificate
`node.key`   | Key for server certificate
`client.<user>.crt` | Client certificate for `<user>` (eg: `client.root.crt` for user `root`)
`client.<user>.key` | Key for the client certificate

Note the following:

- The CA key is never loaded automatically by `cockroach` commands, so it should be created in a separate directory, identified by the `--ca-key` flag.

- Keys (files ending in `.key`) must not have group or world permissions (maximum permissions are 0700, or `rwx------`). This check can be disabled by setting the environment variable `COCKROACH_SKIP_KEY_PERMISSION_CHECK=true`.

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
`--certs-dir` | The path to the [certificate directory](#certificate-directory) containing all certificates and keys needed by `cockroach` commands.<br><br>This flag is used by all subcommands.<br><br>**Default:** `${HOME}/.cockroach-certs/`
`--ca-key` | The path to the private key protecting the CA certificate. <br><br>This flag is required for all `create-*` subcommands. When used with `create-ca` in particular, it defines where to create the CA key; the specified directory must exist.<br><br>**Env Variable:** `COCKROACH_CA_KEY`
`--allow-ca-key-reuse` | When running the `create-ca` subcommand, pass this flag to re-use an existing CA key identified by `--ca-key`. Otherwise, a new CA key will be generated.<br><br>This flag is used only by the `create-ca` subcommand. It helps avoid accidentally re-using an existing CA key.
`--overwrite` | When running `create-*` subcommands, pass this flag to allow existing files in the certificate directory (`--certs-dir`) to be overwritten.<br><br>This flag helps avoid accidentally overwriting sensitive certificates and keys.
`--lifetime` | The lifetime of the certificate, in hours, minutes, and seconds. <br><br>Certificates are valid from the time they are created through the duration specified in `--lifetime`.<br><br>**Default:** `43800h0m0s` (5 years) for the CA certificate, and `8760h0m0s` (1 year) for node and client certificates
`--key-size` | The size of the CA, node, or client key, in bits.<br><br>**Default:** `2048`


## Examples

### Create the CA certificate and key pair

1. 	Create a safe directory for the CA key:

	~~~ shell
	$ mkdir my-safe-directory
	~~~

2. 	Generate the CA certificate and key:

	~~~ shell
	$ cockroach cert create-ca \
	--certs-dir=certs \
	--ca-key=my-safe-directory/ca.key

	$ ls -l certs
	~~~

	~~~
	-rw-r--r--  1 maxroach  maxroach  1.1K Apr 19 09:35 ca.crt
	~~~

### Create the certificate and key pairs for nodes

1. 	Create the certificate and key for the first node:

	~~~ shell
	$ cockroach cert create-node \
	node1.example.com \
	node1.another-example.com \
	--certs-dir=certs \
	--ca-key=my-safe-directory/ca.key

	$ ls -l certs
	~~~

	~~~
	-rw-r--r--  1 maxroach  maxroach  1.1K Apr 19 09:35 ca.crt
	-rw-r--r--  1 maxroach  maxroach  1.2K Apr 19 09:36 node.crt
	-rw-------  1 maxroach  maxroach  1.6K Apr 19 09:36 node.key
	~~~

2. 	Upload the files to the first node.

3. 	Create the certificate and key for the second node, using the `--overwrite` flag to replace the files created for the first node:

	~~~ shell
	$ cockroach cert create-node \
	node2.example.com \
	node2.another-example.com \
	--certs-dir=certs \
	--ca-key=my-safe-directory/ca.key \
	--overwrite

	$ ls -l certs
	~~~

	~~~
	-rw-r--r--  1 maxroach  maxroach  1.1K Apr 19 09:35 ca.crt
	-rw-r--r--  1 maxroach  maxroach  1.2K Apr 19 09:40 node.crt
	-rw-------  1 maxroach  maxroach  1.6K Apr 19 09:40 node.key
	~~~

4. 	Upload the files to the second node.

5. 	Repeat for each additional node.

### Create the certificate and key pair for a client

~~~ shell
$ cockroach cert create-client \
maxroach \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key

$ ls -l certs
~~~

~~~
-rw-r--r--  1 maxroach  maxroach  1.1K Apr 19 09:35 ca.crt
-rw-r--r--  1 maxroach  maxroach  1.1K Apr 19 09:39 client.maxroach.crt
-rw-------  1 maxroach  maxroach  1.6K Apr 19 09:39 client.maxroach.key
-rw-r--r--  1 maxroach  maxroach  1.2K Apr 19 09:36 node.crt
-rw-------  1 maxroach  maxroach  1.6K Apr 19 09:36 node.key
~~~

### List certificates and keys

~~~ shell
$ cockroach cert list \
--certs-dir=certs
~~~

~~~
Certificate directory: certs
+-----------------------+---------------------+---------------------+---------------+
|         Usage         |  Certificate File   |      Key File       |     Notes     |
+-----------------------+---------------------+---------------------+---------------+
| Certificate Authority | ca.crt              |                     |               |
| Node                  | node.crt            | node.key            |               |
| Client                | client.maxroach.crt | client.maxroach.key | user=maxroach |
+-----------------------+---------------------+---------------------+---------------+
~~~

## See Also

- [Manual Deployment](manual-deployment.html): Walkthrough starting a multi-node secure cluster and accessing it from a client.
- [Start a Node](start-a-node.html): Learn more about the flags you pass when adding a node to a secure cluster.
- [Other Cockroach Commands](cockroach-commands.html)
