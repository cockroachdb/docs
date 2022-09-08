---
title: Managing Encryption for CockroachDB Self-Hosted
summary: Learn about the encryption features for secure CockroachDB clusters.
toc: true
docs_area: manage
---

This page outlines several procedures necessary for managing encryption in {{ site.data.products.core }} clusters.

## Generating store key files

Cockroach determines which encryption algorithm to use based on the size of the key file. The key file must contain random data making up the key ID (32 bytes) and the actual key (16, 24, or 32 bytes depending on the encryption algorithm).

| Algorithm | Key size | Key file size |
|-|-|-|
| AES-128 | 128 bits (16 bytes) | 48 bytes |
| AES-192 | 192 bits (24 bytes) | 56 bytes |
| AES-256 | 256 bits (32 bytes) | 64 bytes |

You can generate a store key for your cluster by using the `cockroach` CLI, the `openssl` CLI, or Hashicorp Vault.

### Use the `cockroach` CLI

**Prerequisite:** You must have the CockroachDB CLI installed on your machine

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach gen encryption-key -s 128 $CERTS_DIR/crdb.key
~~~

### Use [OpenSSL](https://www.openssl.org/docs/man1.1.1/man1/openssl.html)

**Prerequisite:** You must have OpenSSL installed on your machine.

{% include_cached copy-clipboard.html %}
~~~ shell
openssl rand -out $CERTS_DIR/crdb.key 48
~~~

### Use HashiCorp Vault

#### Prerequisites

- You must have access to a Vault cluster. For the purposes of the tutorial, any of the following are fine:
	- A cluster provisioned online through [HachiCorp Cloud Platform (HCP)](https://portal.cloud.hashicorp.com/services/vault).
	- A Vault cluster deployed by your organization.
	- A quickstart Vault cluster you deploy yourself in ["dev" mode](https://learn.hashicorp.com/tutorials/vault/getting-started-dev-server?in=vault/getting-started).
- Sufficient permissions on the cluster to enable secrets engines and create policies, either via the root access token for this cluster or through a [custom policy](https://learn.hashicorp.com/tutorials/vault/policies).
- You must have OpenSSL installed on your machine.

#### Enable the transit secret engine

{% include_cached copy-clipboard.html %}
~~~shell
vault secrets enable transit
~~~

#### Step 1: Generate the key

1. Create the exportable key in Vault

{% include_cached copy-clipboard.html %}
~~~shell
vault write -f transit/keys/crdb-key -exportable=true
~~~

1. Export the key to your local machine.

{% include_cached copy-clipboard.html %}
~~~shell
vault read /transit/export/encryption-key/crdb-key/1

~~~

~~~txt
Key     Value
---     -----
keys    map[1:6kkUAMq4EgIJKEmFxl97bQaBn0n9FL6FbRoUeCBtVhE=]
name    crdb-key
type    aes256-gcm96
~~~

#### Step 2: Add the key identifier

CockroachDB has an additional cryptographic requirement that the key file contain a 32 bit identifier. So our final key file will need to consist of the encryption key we just generated concatenated onto a 32 bit identifier.


1. Use OpenSSL to generate 32 bits of random data to serve as the key identifier.

{% include_cached copy-clipboard.html %}
~~~shell
openssl rand -out ${CERTS_DIR}/crdb.key 32
~~~

1. Add the encryption key exported from Vault to the key file.

{% include_cached copy-clipboard.html %}
~~~shell
base64 -d {path_to_vault_generated_key_file} >> ${CERTS_DIR}/crdb.key
~~~

## Starting a node with encryption

Encryption at Rest is configured at node start time using the `--enterprise-encryption` command line flag. The flag specifies the encryption options for one of the stores on the node. If multiple stores exist, the flag must be specified for each store.

The flag takes the form: `--enterprise-encryption=path=<store path>,key=<key file>,old-key=<old key file>,rotation-period=<period>`.

The allowed components in the flag are:

| Component | Requirement | Description |
|-|-|-|
| `path`            | Required | Path of the store to apply encryption to. |
| `key`             | Required | Path to the key file to encrypt data with, or `plain` for plaintext. |
| `old-key`         | Required | Path to the key file the data is encrypted with, or `plain` for plaintext. |
| `rotation-period` | Optional | How often data keys should be automatically rotated. Default: one week. |

The `key` and `old-key` components must **always** be specified. They allow for transitions between encryption algorithms, and between plaintext and encrypted.

Starting a node for the first time using AES-128 encryption can be done using:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start \
--store=cockroach-data \
--enterprise-encryption="path=${crdb_data_path}/cockroach-data,key=${CERTS_DIR}/crdb.key,old-key=plain"
~~~

{{site.data.alerts.callout_danger}}
Once specified for a given store, the `--enterprise-encryption` flag must always be present.
{{site.data.alerts.end}}

## Checking encryption status

Encryption status can be seen on the node's stores report, reachable through: `http(s)://nodeaddress:8080/#/reports/stores/local` (or replace `local` with the node ID). For example, if you are running a [local cluster](secure-a-cluster.html), you can see the node's stores report at `https://localhost:8080/#/reports/stores/local`.

The report shows encryption status for all stores on the selected node, including:

- Encryption algorithm.
- Active store key information.
- Active data key information.
- The fraction of files/bytes encrypted using the active data key.

CockroachDB relies on [storage layer](architecture/storage-layer.html) compactions to write new files using the latest encryption key. It may take several days for all files to be replaced. Some files are only rewritten at startup, and some keep older copies around, requiring multiple restarts. You can force storage compaction with the `cockroach debug compact` command (the node must first be [stopped](node-shutdown.html#perform-node-shutdown)).

Information about keys is written to [the logs](logging-overview.html), including:

- Active/old key information at startup.
- New key information after data key rotation.

Alternatively, you can use the [`cockroach debug encryption-active-key`](cockroach-debug-encryption-active-key.html) command to view information about a store's encryption algorithm and store key.

## Changing encryption algorithm or keys

Encryption type and keys can be changed at any time by restarting the node. To change keys or encryption type, the `key` component of the `--enterprise-encryption` flag is set to the new key, while the key previously used must be specified in the `old-key` component.

For example, we can switch from AES-128 to AES-256 using:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --store=cockroach-data --enterprise-encryption=path=cockroach-data,key=/path/to/my/aes-256.key,old-key=/path/to/my/aes-128.key
~~~

Upon starting, the node will read the existing data keys using the old encryption key (`aes-128.key`), then rewrite the data keys using the new key (`aes-256.key`). A new data key will be generated to match the desired AES-256 algorithm.

To check that the new key is active, use the stores report page in the DB Console to [check the encryption status](#checking-encryption-status).

To disable encryption, specify `key=plain`. The data keys will be stored in plaintext and new data will not be encrypted.

To rotate keys, specify `key=/path/to/my/new-aes-128.key` and `old-key=/path/to/my/old-aes-128.key`. The data keys will be decrypted using the old key and then encrypted using the new key. A new data key will also be generated.
