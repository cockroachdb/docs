---
title: cockroach cert
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication.
toc: true
key: create-security-certificates.html
docs_area: reference.cli
---

The CockroachDB CLI's `cockroach cert` command allows you to generate [private key/public certificate pairs for TLS authentication and encryption in communication between CockroachDB nodes, and from SQL clients to the cluster.

To learn more, explore:

- [Transport Layer Security (TLS) and Public Key Infrastructure (PKI)](security-reference/transport-layer-security.html)
- [Using the CockroachDB CLI to provision a development cluster](manage-certs-cli.html).
- [Using Google Cloud Platform to manage PKI certificates](manage-certs-gcloud.html).

{{site.data.alerts.callout_info}}

The ability to rapidly and locally generate private key/public certificate pairs is handy for development, but careful management of security certificates is an essential component of cluster security, and performing these tasks with a cloud-native tool such as Google Cloud Platform's Certificate Authority Service (CAS) offers many security advantages.

{{site.data.alerts.end}}

The CLI offers the following functionality:

- Generate a root certificate authority (CA) certificate for your cluster, and use it to sign public certificates.
- Generate key pair for use by a CockroachDB node.
- Generate a key pair for use by a TLS-authenticated CockroachDB client.

## Subcommands

### `create-ca`

Create a certificate authorit a self-signed certificate authority (CA) key pair (private key and public certificate), which you'll use to create and authenticate certificates for your entire cluster.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach cert create-ca \
 --certs-dir=[path-to-certs-directory] \
 --ca-key=[path-to-ca-key]
~~~

### `create-node`

Create a certificate and key for a specific node in the cluster. You specify all addresses at which the node can be reached and pass appropriate flags.

Create a node certificate and key:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach cert create-node \
  [node-hostname] \
  [node-other-hostname] \
  [node-yet-another-hostname] \
  [hostname-in-wildcard-notation] \
  --certs-dir=[path-to-certs-directory] \
  --ca-key=[path-to-ca-key]
~~~

### `create-client`

Create a certificate and key for a [specific user](create-user.html) accessing the cluster from a client. You specify the username of the user who will use the certificate and pass appropriate flags.

Create a client certificate and key:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach cert create-client \
 [username] \
 --certs-dir=[path-to-certs-directory] \
 --ca-key=[path-to-ca-key]
~~~

### `list`

List certificates and keys found in the certificate directory.

~~~ shell
cockroach cert list \
 --certs-dir=[path-to-certs-directory]
~~~

### View help

For the `cert` command overall:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach cert --help
~~~

For a subcommand:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach cert <subcommand> --help
~~~

## Flags

The `cert` command and subcommands support the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|-----------
`--certs-dir` | The path to the [certificate directory](#certificate-directory) containing all certificates and keys needed by `cockroach` commands.<br><br>This flag is used by all subcommands.<br><br>**Default:** `${HOME}/.cockroach-certs/`
`--ca-key` | The path to the private key protecting the CA certificate. <br><br>This flag is required for all `create-*` subcommands. When used with `create-ca` in particular, it defines where to create the CA key; the specified directory must exist.<br><br>**Env Variable:** `COCKROACH_CA_KEY`
`--allow-ca-key-reuse` | When running the `create-ca` subcommand, pass this flag to re-use an existing CA key identified by `--ca-key`. Otherwise, a new CA key will be generated.<br><br>This flag is used only by the `create-ca` subcommand. It helps avoid accidentally re-using an existing CA key.
`--overwrite` | When running `create-*` subcommands, pass this flag to allow existing files in the certificate directory (`--certs-dir`) to be overwritten.<br><br>This flag helps avoid accidentally overwriting sensitive certificates and keys.
`--lifetime` | The lifetime of the certificate, in hours, minutes, and seconds. <br><br>Certificates are valid from the time they are created through the duration specified in `--lifetime`.<br><br>**Default:** `87840h0m0s` (10 years)
`--key-size` | The size of the CA, node, or client key, in bits.<br><br>**Default:** `2048`
<a name="flag-pkcs8"></a> `--also-generate-pkcs8-key` | Also create a key in [PKCS#8 format](https://tools.ietf.org/html/rfc5208), which is the standard key encoding format used by Java.  For example usage, see [Build a Java App with CockroachDB](build-a-java-app-with-cockroachdb.html).

### Logging

[The `--log` and `--log-config-file` flags can be used to configure logging behavior for all CockroachDB CLI commands](../configure-logs.html), including `cockroach cert`.
{% include {{ page.version.version }}/misc/logging-defaults.md %}

## Examples

### Create the CA certificate and key pair

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir my-safe-directory
    ~~~
    - `certs`: You'll generate your CA certificate and all node and client certificates and keys in this directory and then upload some of the files to your nodes.
    - `my-safe-directory`: You'll generate your CA key in this directory and then reference the key when generating node and client certificates. After that, you'll keep the key safe and secret; you will not upload it to your nodes.

2. Generate the CA certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ls -l certs
    ~~~

    ~~~
    total 8
    -rw-r--r--  1 maxroach  maxroach  1.1K Jul 10 14:12 ca.crt
    ~~~

### Create the certificate and key pairs for nodes

1. Generate the certificate and key for the first node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    node1.example.com \
    node1.another-example.com \
    *.dev.another-example.com \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ls -l certs
    ~~~

    ~~~
    total 24
    -rw-r--r--  1 maxroach  maxroach  1.1K Jul 10 14:12 ca.crt
    -rw-r--r--  1 maxroach  maxroach  1.2K Jul 10 14:16 node.crt
    -rw-------  1 maxroach  maxroach  1.6K Jul 10 14:16 node.key
    ~~~

2. Upload certificates to the first node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Create the certs directory:
    $ ssh <username>@<node1 address> "mkdir certs"
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Upload the CA certificate and node certificate and key:
    $ scp certs/ca.crt \
    certs/node.crt \
    certs/node.key \
    <username>@<node1 address>:~/certs
    ~~~

3. Delete the local copy of the first node's certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm certs/node.crt certs/node.key
    ~~~

    {{site.data.alerts.callout_info}}This is necessary because the certificates and keys for additional nodes will also be named <code>node.crt</code> and <code>node.key</code> As an alternative to deleting these files, you can run the next <code>cockroach cert create-node</code> commands with the <code>--overwrite</code> flag.{{site.data.alerts.end}}

4. Create the certificate and key for the second node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    node2.example.com \
    node2.another-example.com \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ls -l certs
    ~~~

    ~~~
    total 24
    -rw-r--r--  1 maxroach  maxroach  1.1K Jul 10 14:12 ca.crt
    -rw-r--r--  1 maxroach  maxroach  1.2K Jul 10 14:17 node.crt
    -rw-------  1 maxroach  maxroach  1.6K Jul 10 14:17 node.key
    ~~~

5. Upload certificates to the second node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Create the certs directory:
    $ ssh <username>@<node2 address> "mkdir certs"
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Upload the CA certificate and node certificate and key:
    $ scp certs/ca.crt \
    certs/node.crt \
    certs/node.key \
    <username>@<node2 address>:~/certs
    ~~~

6. Repeat steps 3 - 5 for each additional node.

### Create the certificate and key pair for a client

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client \
maxroach \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ ls -l certs
~~~

~~~
total 40
-rw-r--r--  1 maxroach  maxroach  1.1K Jul 10 14:12 ca.crt
-rw-r--r--  1 maxroach  maxroach  1.1K Jul 10 14:13 client.maxroach.crt
-rw-------  1 maxroach  maxroach  1.6K Jul 10 14:13 client.maxroach.key
-rw-r--r--  1 maxroach  maxroach  1.2K Jul 10 14:17 node.crt
-rw-------  1 maxroach  maxroach  1.6K Jul 10 14:17 node.key
~~~

### List certificates and keys

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert list \
--certs-dir=certs
~~~

~~~
Certificate directory: certs
+-----------------------+---------------------+---------------------+------------+--------------------------------------------------------+-------+
|         Usage         |  Certificate File   |      Key File       |  Expires   |                         Notes                          | Error |
+-----------------------+---------------------+---------------------+------------+--------------------------------------------------------+-------+
| Certificate Authority | ca.crt              |                     | 2027/07/18 | num certs: 1                                           |       |
| Node                  | node.crt            | node.key            | 2022/07/14 | addresses: node2.example.com,node2.another-example.com |       |
| Client                | client.maxroach.crt | client.maxroach.key | 2022/07/14 | user: maxroach                                         |       |
+-----------------------+---------------------+---------------------+------------+--------------------------------------------------------+-------+
(3 rows)
~~~

## See also

- [Security overview](security-reference/security-overview.html)
- [Authentication](authentication.html)
- [Client Connection Parameters](connection-parameters.html)
- [Rotate Security Certificates](rotate-certificates.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestrated Deployment](orchestration.html)
- [Local Deployment](secure-a-cluster.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
