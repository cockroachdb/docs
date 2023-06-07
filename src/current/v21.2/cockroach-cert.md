---
title: cockroach cert
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication.
toc: true
key: create-security-certificates.html
docs_area: reference.cli
---

To secure your CockroachDB cluster's inter-node and client-node communication, you need to provide a Certificate Authority (CA) certificate that has been used to sign keys and certificates (SSLs) for:

- Nodes
- Clients
- DB Console (optional)

To create these certificates and keys, use the `cockroach cert` [commands](cockroach-commands.html) with the appropriate subcommands and flags, use [`openssl` commands](https://wiki.openssl.org/index.php/), or use a [custom CA](create-security-certificates-custom-ca.html) (for example, a public CA or your organizational CA).

{% include {{ page.version.version }}/filter-tabs/security-cert.md %}

{{site.data.alerts.callout_success}}For details about when and how to change security certificates without restarting nodes, see <a href="rotate-certificates.html">Rotate Security Certificates</a>.{{site.data.alerts.end}}

## How security certificates work

1. Using the `cockroach cert` command, you create a CA certificate and key and then node and client certificates that are signed by the CA certificate. Since you need access to a copy of the CA certificate and key to create node and client certs, it's best to create everything in one place.

2. You then upload the appropriate node certificate and key and the CA certificate to each node, and you upload the appropriate client certificate and key and the CA certificate to each client.

3. When nodes establish contact to each other, and when clients establish contact to nodes, they use the CA certificate to verify each other's identity.

## Subcommands

Subcommand | Usage
-----------|------
`create-ca` | Create the self-signed certificate authority (CA), which you'll use to create and authenticate certificates for your entire cluster.
`create-node` | Create a certificate and key for a specific node in the cluster. You specify all addresses at which the node can be reached and pass appropriate flags.
`create-client` | Create a certificate and key for a [specific user](create-user.html) accessing the cluster from a client. You specify the username of the user who will use the certificate and pass appropriate flags.
`list` | List certificates and keys found in the certificate directory.

## Certificate directory

When using `cockroach cert` to create node and client certificates, you will need access to a local copy of the CA certificate and key. It is therefore recommended to create all certificates and keys in one place and then distribute node and client certificates and keys appropriately. For the CA key, be sure to store it somewhere safe and keep a backup; if you lose it, you will not be able to add new nodes or clients to your cluster. For a tutorial of this process, see [Manual Deployment](manual-deployment.html).

## Required keys and certificates

The `create-*` subcommands generate the CA certificate and all node and client certificates and keys in a single directory specified by the `--certs-dir` flag, with the files named as follows:

### Node key and certificates

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate.
`node.crt`   | Server certificate. <br><br>`node.crt` must be signed by `ca.crt` and must have `CN=node` and the list of IP addresses and DNS names listed in `Subject Alternative Name` field. CockroachDB also supports [wildcard notation in DNS names](https://en.wikipedia.org/wiki/Wildcard_certificate).
`node.key`   | Key for server certificate.

### Client key and certificates

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate.
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`). <br><br> Must be signed  by `ca.crt`. Also, `client.<username>.crt` must have `CN=<user>` (for example, `CN=marc` for `client.marc.crt`)
`client.<user>.key` | Key for the client certificate.

Optionally, if you have a certificate issued by a public CA to securely access the DB Console, you need to place the certificate and key (`ui.crt` and `ui.key` respectively) in the directory specified by the `--certs-dir` flag. For more information, refer to [Use a UI certificate and key to access the DB Console](create-security-certificates-custom-ca.html#accessing-the-db-console-for-a-secure-cluster).

Note the following:

- By default, the `node.crt` is multi-functional, as in the same certificate is used for both incoming connections (from SQL and DB Console clients, and from other CockroachDB nodes) and for outgoing connections to other CockroachDB nodes. To make this possible, the `node.crt` created using the `cockroach cert` command has `CN=node` and the list of IP addresses and DNS names listed in `Subject Alternative Name` field.

- The CA key is never loaded automatically by `cockroach` commands, so it should be created in a separate directory, identified by the `--ca-key` flag.

### Key file permissions

{{site.data.alerts.callout_info}}
This check is only relevant on macOS, Linux, and other UNIX-like systems.
{{site.data.alerts.end}}

To reduce the likelihood of a malicious user or process accessing a certificate key (files ending in ".key"), we require that the certificate key be owned by one of the following system users:

- The user that the CockroachDB process runs as.
- The system `root` user (not to be confused with the [CockroachDB `root` user](security-reference/authorization.html#root-user)) and the group that the CockroachDB process runs in.

For example, if running the CockroachDB process as a system user named `cockroach`, we can use the `id cockroach` command to list each group the `cockroach` user is a member of:

```shell
id cockroach
uid=1000(cockroach) gid=1000(cockroach) groups=1000(cockroach),1000(cockroach)
```

In the output, we can see that the system user `cockroach` is in the `cockroach` group (with the group ID or gid `1000`).

If the key file is owned by the system `root` user (who has user ID `0`), CockroachDB won't be able to read it unless it has permission to read because of its group membership. Because we know that CockroachDB user is a member of the `cockroach` group, we can allow CockroachDB to read the key by changing the group owner of the key file to the `cockroach` group. We then give the group read permissions by running `chmod`. Notice that the `others` group has no permissions (the `0` of `740`). Only the `cockroach` user, a member of the `cockroach` group, or the system `root` user has permission to read the key.

```shell
sudo chgrp cockroach ui.key
sudo chmod 0740 ui.key
```

However, if the `ui.key` file is owned by the `cockroach` system user, CockroachDB ignores the group ownership of the file, and requires that the permissions only allow the `cockroach` system user to interact with it (`0700` or `rwx------`).

Note the following:

- When running in Kubernetes, you will not be able to change the user that owns a certificate file mounted from a Secret or another Volume, but you will be able to override the group by setting the `fsGroup` flag in a Pod or Container's Security Context. In our example above, you would set `fsGroup` to "1000". You will also need to set the key's "mode" using the `mode` flag on individual items or the `defaultMode` flag if applying to the entire secret.

- This check can be disabled by setting the environment variable `COCKROACH_SKIP_KEY_PERMISSION_CHECK` to `true`.

## Synopsis

Create the CA certificate and key:

~~~ shell
$ cockroach cert create-ca \
 --certs-dir=[path-to-certs-directory] \
 --ca-key=[path-to-ca-key]
~~~

Create a node certificate and key:

~~~ shell
$ cockroach cert create-node \
 [node-hostname] \
 [node-other-hostname] \
 [node-yet-another-hostname] \
 [hostname-in-wildcard-notation] \
 --certs-dir=[path-to-certs-directory] \
 --ca-key=[path-to-ca-key]
~~~

Create a client certificate and key:

~~~ shell
$ cockroach cert create-client \
 [username] \
 --certs-dir=[path-to-certs-directory] \
 --ca-key=[path-to-ca-key]
~~~

List certificates and keys:

~~~ shell
$ cockroach cert list \
 --certs-dir=[path-to-certs-directory]
~~~

View help:

~~~ shell
$ cockroach cert --help
~~~
~~~ shell
$ cockroach cert <subcommand> --help
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
- [Orchestrated Deployment](kubernetes-overview.html)
- [Local Deployment](secure-a-cluster.html)
- [Other Cockroach Commands](cockroach-commands.html)
