---
title: Use the CockroachDB CLI to provision a development cluster
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication.
toc: true
docs_area: manage.security
---


The CockroachDB CLI's [`cockroach cert`]({{ page.version.version }}/cockroach-cert.md) command allows you to generate [private key/public certificate pairs for TLS authentication and encryption]({{ page.version.version }}/security-reference/transport-layer-security.md) in communication between CockroachDB nodes, and from SQL clients to the cluster.

{{site.data.alerts.callout_info}}

The ability to rapidly and locally generate private key/public certificate pairs is important for development, but careful management of security certificates is an essential component of cluster security. We recommend that you use a cloud-native tool, such as Google Cloud Platform's Certificate Authority Service (CAS), to manage security certificates.

Learn more: [Manage PKI certificates for a CockroachDB deployment with HashiCorp Vault]({{ page.version.version }}/manage-certs-vault.md).


{{site.data.alerts.end}}


## Create the CA certificate and key pair

1. Create two directories:

    ~~~ shell
    $ mkdir certs
    ~~~

    ~~~ shell
    $ mkdir my-safe-directory
    ~~~
    - `certs`: You'll generate your CA certificate and all node and client certificates and keys in this directory and then upload some of the files to your nodes.
    - `my-safe-directory`: You'll generate your CA key in this directory and then reference the key when generating node and client certificates. Keep the key safe and secret; do not upload it to your nodes.

1. Generate the CA certificate and key:

    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    ~~~ shell
    $ ls -l certs
    ~~~

    ~~~
    total 8
    -rw-r--r--  1 maxroach  maxroach  1.1K Jul 10 14:12 ca.crt
    ~~~

## Create the certificate and key pairs for nodes

1. Generate the certificate and key for the first node:

    ~~~ shell
    $ cockroach cert create-node \
    node1.example.com \
    node1.another-example.com \
    *.dev.another-example.com \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    ~~~ shell
    $ ls -l certs
    ~~~

    ~~~
    total 24
    -rw-r--r--  1 maxroach  maxroach  1.1K Jul 10 14:12 ca.crt
    -rw-r--r--  1 maxroach  maxroach  1.2K Jul 10 14:16 node.crt
    -rw-------  1 maxroach  maxroach  1.6K Jul 10 14:16 node.key
    ~~~

1. Upload certificates to the first node:

    ~~~ shell
    # Create the certs directory:
    $ ssh <username>@<node1 address> "mkdir certs"
    ~~~

    ~~~ shell
    # Upload the CA certificate and node certificate and key:
    $ scp certs/ca.crt \
    certs/node.crt \
    certs/node.key \
    <username>@<node1 address>:~/certs
    ~~~

1. Delete the local copy of the first node's certificate and key:

    ~~~ shell
    $ rm certs/node.crt certs/node.key
    ~~~

    {{site.data.alerts.callout_info}}This is necessary because the certificates and keys for additional nodes will also be named <code>node.crt</code> and <code>node.key</code> As an alternative to deleting these files, you can run the next <code>cockroach cert create-node</code> commands with the <code>--overwrite</code> flag.{{site.data.alerts.end}}

1. Create the certificate and key for the second node:

    ~~~ shell
    $ cockroach cert create-node \
    node2.example.com \
    node2.another-example.com \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    ~~~ shell
    $ ls -l certs
    ~~~

    ~~~
    total 24
    -rw-r--r--  1 maxroach  maxroach  1.1K Jul 10 14:12 ca.crt
    -rw-r--r--  1 maxroach  maxroach  1.2K Jul 10 14:17 node.crt
    -rw-------  1 maxroach  maxroach  1.6K Jul 10 14:17 node.key
    ~~~

1. Upload certificates to the second node:

    ~~~ shell
    # Create the certs directory:
    $ ssh <username>@<node2 address> "mkdir certs"
    ~~~

    ~~~ shell
    # Upload the CA certificate and node certificate and key:
    $ scp certs/ca.crt \
    certs/node.crt \
    certs/node.key \
    <username>@<node2 address>:~/certs
    ~~~

1. Repeat steps 3 - 5 for each additional node.

## Create the certificate and key pair for a client
To create a certificate and a key pair for a client, use the `create-client` subcommand.

~~~ shell
$ cockroach cert create-client \
maxroach \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

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

## List certificates and keys

To list the certificates and keys in a directory, use the `create-client` subcommand.

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

- [Security overview]({{ page.version.version }}/security-reference/security-overview.md)
- [Authentication]({{ page.version.version }}/authentication.md)
- [Client Connection Parameters]({{ page.version.version }}/connection-parameters.md)
- [Rotate Security Certificates]({{ page.version.version }}/rotate-certificates.md)
- [Manual Deployment]({{ page.version.version }}/manual-deployment.md)
- [Orchestrated Deployment]({{ page.version.version }}/kubernetes-overview.md)
- [Local Deployment]({{ page.version.version }}/secure-a-cluster.md)
- [Other Cockroach Commands]({{ page.version.version }}/cockroach-commands.md)