---
title: Encryption At Rest
summary: Encryption At Rest encrypts node data on local disk transparently.
toc: false
---

<span class="version-tag">New in v2.1:</span>
Encryption At Rest provides transparent encryption for node data on local disk.

<div id="toc"></div>

## Terminology

* store key: user-provided key, used to encrypt data keys
* data key: automatically-generated key, used to encrypt data
TODO(mberhault): add more

## Background

TODO(mberhault): explain store vs data keys, rotation, etc...

## Example

### Generating key files

Cockroach determines which encryption algorithm to use based on the size of the key file.
The key file must contain random data making up the key ID (32 bytes) and the actual key (16, 24, or 32
bytes depending on the encryption algorithm).

| Algorithm | Key size | Key file size |
|-|-|-|
| AES-128 | 128 bits (16 bytes) | 48 bytes |
| AES-192 | 192 bits (24 bytes) | 56 bytes |
| AES-256 | 256 bits (32 bytes) | 64 bytes |

Generating a key file can be done using [openssl](https://www.openssl.org/docs/man1.0.2/apps/openssl.html)
command line tool. For example, we can create an AES-128 key using:

{% include copy-clipboard.html %}
~~~ shell
$ openssl rand -out /path/to/my/aes-128.key 48
~~~

### Starting a node with encryption

Encryption is configured at node start time using the `--enterprise-encryption` command line flag.
The flag specifies the encryption options for one of the stores on the node. If multiple stores exist,
the flag must be specified for each store.

The flag takes the form: `--enterprise-encryption=path=<store path>,key=<key file>,old-key=<old key file>,rotation-period=<period>`.

The allowed components in the flag are:

| Component | Requirement | Description |
|-|-|-|
| path            | required | Path of the store to apply encryption to |
| key             | required | Path to the key file to encrypt data with, or `plain` for plaintext |
| old-key         | required | Path to key file the data is encrypted with, or `plain` for plaintext |
| rotation-period | optional | How often data keys should be automatically rotated |

The `key` and `old-key` components must **always** be specified. They allow for transitions between
encryption algorithms, and between plaintext and encrypted.

Starting node for the first time using AES-128 encryption can be done using:
{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --store=cockroach-data --enterprise-encryption=path=cockroach-data,key=/path/to/my/aes-128.key,old-key=plain
~~~

**WARNING**: once specified for a given store, the `--enterprise-encryption` flag must always be present.

### Checking encryption status

Encryption status can be see on the node's stores report, reachable through: `http(s)://nodeaddress:8080/#/reports/stores/local`.

The report shows the currently-active store key as well as the currently-active data key. The `encryption_type` field
reflects the algorithm currently in use.

### Changing encryption algorithm or keys

Encryption type and keys can be changed at any time by restarting the node.
To change keys or encryption type, the `key` component of the `--enterprise-encryption` flag is set to the new key,
while the key previously used must be specified in the `old-key` component.

For example, we can switch from AES-128 to AES-256 using:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --store=cockroach-data --enterprise-encryption=path=cockroach-data,key=/path/to/my/aes-256.key,old-key=/path/to/my/aes-128.key
~~~

Upon starting, the node will read the existing data keys using the old encryption key (`aes-128.key`), then rewrite
the data keys using the new key (`aes-256.key`). A new data key will be generated to match the desired `AES-256` algorithm.

The new key can be seen as active in the admin UI under the stores report page.

To disable encryption, specify `key=plain`. The data keys will be stored in plaintext and new data will not be encrypted.

To rotate keys, specify `key=/path/to/my/new-aes-128.key` and `key=/path/to/my/old-aes-128.key`. The data keys
will be decrypted using the old key then encrypted using the new key. A new data key will also be generated.

## See Also

TODO(mberhault): links to external resources, report page details, flag descriptions.
