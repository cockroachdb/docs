---
title: Using the CockroachDB CLI to provision a development cluster
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication.
toc: true
docs_area: manage.security
---


The CockroachDB CLI's [`cockroach cert`](cockroach-cert.html) command allows you to generate [private key/public certificate pairs for TLS authentication and encryption](security-reference/transport-layer-security.html) in communication between CockroachDB nodes, and from SQL clients to the cluster.

{{site.data.alerts.callout_info}}

The ability to rapidly and locally generate private key/public certificate pairs is handy for development, but careful management of security certificates is an essential component of cluster security, and performing these tasks with a cloud-native tool such as Google Cloud Platform's Certificate Authority Service (CAS) offers many security advantages.

See [Using Google Cloud Platform to manage PKI certificates](manage-certs-gcloud.html).

{{site.data.alerts.end}}


## Create the CA certificate and key pair

1. Create two directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir my-safe-directory
    ~~~
    - `certs`: You'll generate your CA certificate and all node and client certificates and keys in this directory and then upload some of the files to your nodes.
    - `my-safe-directory`: You'll generate your CA key in this directory and then reference the key when generating node and client certificates. After that, you'll keep the key safe and secret; you will not upload it to your nodes.

2. Generate the CA certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ls -l certs
    ~~~

    ~~~
    total 8
    -rw-r--r--  1 maxroach  maxroach  1.1K Jul 10 14:12 ca.crt
    ~~~

## Create the certificate and key pairs for nodes

1. Generate the certificate and key for the first node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    node1.example.com \
    node1.another-example.com \
    *.dev.another-example.com \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include copy-clipboard.html %}
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

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create the certs directory:
    $ ssh <username>@<node1 address> "mkdir certs"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    # Upload the CA certificate and node certificate and key:
    $ scp certs/ca.crt \
    certs/node.crt \
    certs/node.key \
    <username>@<node1 address>:~/certs
    ~~~

3. Delete the local copy of the first node's certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm certs/node.crt certs/node.key
    ~~~

    {{site.data.alerts.callout_info}}This is necessary because the certificates and keys for additional nodes will also be named <code>node.crt</code> and <code>node.key</code> As an alternative to deleting these files, you can run the next <code>cockroach cert create-node</code> commands with the <code>--overwrite</code> flag.{{site.data.alerts.end}}

4. Create the certificate and key for the second node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    node2.example.com \
    node2.another-example.com \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include copy-clipboard.html %}
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

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create the certs directory:
    $ ssh <username>@<node2 address> "mkdir certs"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    # Upload the CA certificate and node certificate and key:
    $ scp certs/ca.crt \
    certs/node.crt \
    certs/node.key \
    <username>@<node2 address>:~/certs
    ~~~

6. Repeat steps 3 - 5 for each additional node.

## Create the certificate and key pair for a client

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client \
maxroach \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

- [Security overview](security-overview.html)
- [Authentication](authentication.html)
- [Client Connection Parameters](connection-parameters.html)
- [Rotate Security Certificates](rotate-certificates.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestrated Deployment](orchestration.html)
- [Local Deployment](secure-a-cluster.html)
- [Other Cockroach Commands](cockroach-commands.html)
