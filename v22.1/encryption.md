---
title: Managing Encryption for CockroachDB Self-Hosted
summary: Learn about the encryption features for secure CockroachDB clusters.
toc: true
docs_area: manage
---

This page walks outlines several procedures necessary for managing encryption in {{ site.data.products.core }} clusters.

## Generating store key files

Cockroach determines which encryption algorithm to use based on the size of the key file.
The key file must contain random data making up the key ID (32 bytes) and the actual key (16, 24, or 32
bytes depending on the encryption algorithm).

| Algorithm | Key size | Key file size |
|-|-|-|
| AES-128 | 128 bits (16 bytes) | 48 bytes |
| AES-192 | 192 bits (24 bytes) | 56 bytes |
| AES-256 | 256 bits (32 bytes) | 64 bytes |

Generating a key file can be done using the `cockroach` CLI:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen encryption-key -s 128 /path/to/my/aes-128.key
~~~

Or the equivalent [openssl](https://www.openssl.org/docs/man1.1.1/man1/openssl.html) CLI command:

{% include copy-clipboard.html %}
~~~ shell
$ openssl rand -out /path/to/my/aes-128.key 48
~~~

## Starting a node with encryption

Encryption at Rest is configured at node start time using the `--enterprise-encryption` command line flag.
The flag specifies the encryption options for one of the stores on the node. If multiple stores exist,
the flag must be specified for each store.

The flag takes the form: `--enterprise-encryption=path=<store path>,key=<key file>,old-key=<old key file>,rotation-period=<period>`.

The allowed components in the flag are:

| Component | Requirement | Description |
|-|-|-|
| `path`            | Required | Path of the store to apply encryption to. |
| `key`             | Required | Path to the key file to encrypt data with, or `plain` for plaintext. |
| `old-key`         | Required | Path to the key file the data is encrypted with, or `plain` for plaintext. |
| `rotation-period` | Optional | How often data keys should be automatically rotated. Default: one week. |

The `key` and `old-key` components must **always** be specified. They allow for transitions between
encryption algorithms, and between plaintext and encrypted.

Starting a node for the first time using AES-128 encryption can be done using:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --store=cockroach-data --enterprise-encryption=path=cockroach-data,key=/path/to/my/aes-128.key,old-key=plain
~~~

{{site.data.alerts.callout_danger}}
Once specified for a given store, the `--enterprise-encryption` flag must always be present.
{{site.data.alerts.end}}

## Checking encryption status

Encryption status can be seen on the node's stores report, reachable through: `http(s)://nodeaddress:8080/#/reports/stores/local` (or replace `local` with the node ID). For example, if you are running a [local cluster](secure-a-cluster.html), you can see the node's stores report at `https://localhost:8080/#/reports/stores/local`.

The report shows encryption status for all stores on the selected node, including:

* Encryption algorithm.
* Active store key information.
* Active data key information.
* The fraction of files/bytes encrypted using the active data key.

CockroachDB relies on [storage layer](architecture/storage-layer.html) compactions to write new files using the latest encryption key. It may take several days for all files to be replaced. Some files are only rewritten at startup, and some keep older copies around, requiring multiple restarts. You can force storage compaction with the `cockroach debug compact` command (the node must first be [stopped](node-shutdown.html#perform-node-shutdown)).

Information about keys is written to [the logs](logging-overview.html), including:

* Active/old key information at startup.
* New key information after data key rotation.

Alternatively, you can use the [`cockroach debug encryption-active-key`](cockroach-debug-encryption-active-key.html) command to view information about a store's encryption algorithm and store key.

## Changing encryption algorithm or keys

Encryption type and keys can be changed at any time by restarting the node.
To change keys or encryption type, the `key` component of the `--enterprise-encryption` flag is set to the new key,
while the key previously used must be specified in the `old-key` component.

For example, we can switch from AES-128 to AES-256 using:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --store=cockroach-data --enterprise-encryption=path=cockroach-data,key=/path/to/my/aes-256.key,old-key=/path/to/my/aes-128.key
~~~

Upon starting, the node will read the existing data keys using the old encryption key (`aes-128.key`), then rewrite
the data keys using the new key (`aes-256.key`). A new data key will be generated to match the desired AES-256 algorithm.

To check that the new key is active, use the stores report page in the DB Console to [check the encryption status](#checking-encryption-status).

To disable encryption, specify `key=plain`. The data keys will be stored in plaintext and new data will not be encrypted.

To rotate keys, specify `key=/path/to/my/new-aes-128.key` and `old-key=/path/to/my/old-aes-128.key`. The data keys
will be decrypted using the old key and then encrypted using the new key. A new data key will also be generated.

## Configuring Customer Managed Encryption Keys (CMEK)

Customer Managed Encryption Keys (CMEK) give you more control over how your cluster's data is protected on your cluster's filesystem. When CMEK is enabled, your store key is protected by an additional cryptographic key that is entirely within your control, called the CMEK key. To learn more, see [Customer Managed Encryption Keys (CMEK)](/docs/cockroachcloud/cmek.html) and [Encryption in CockroachDB](security-reference/encryption.html).
