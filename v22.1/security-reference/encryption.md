---
title: Encryption in CockroachDB
summary: Overview of CockroachDB encryption in flight and at rest
toc: true
docs_area: reference.security
---

This page offers an overview of CockroachDB's encryption features.

## Encryption in flight

CockroachDB uses either TLS 1.2 or TLS 1.3 for inter-node and client-node [authentication](authentication.html) as well as setting up a secure communication channel. Once the secure channel is set up, all inter-node and client-node network communication is encrypted using a [shared encryption key](https://en.wikipedia.org/wiki/Transport_Layer_Security) as per the TLS 1.2 protocol. This feature is enabled by default for all secure clusters and needs no additional configuration.

## Encryption at rest

Industry standard encryption-at-rest is provided at the infrastructure level by your chosen infrastructure-as-a-service (IAAS) provider, either Google Cloud Platform (GCP) or Amazon Web Services (AWS). This helps to protect cloud resources from authorized access over the Information-As-A-Service (IAAS) platform's infrastructure. See documentation for [GCP persistent disk encryption](https://cloud.google.com/compute/docs/disks#pd_encryption) or [AWS Elastic Block Storage](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html).

In addition to encryption for cluster resources at the infrastructure level, {{ site.data.products.db }} and {{ site.data.products.core }} each include additional optional safeguards for data at rest on cluster disks.

### {{ site.data.products.dedicated }} clusters

Customer-Managed Encryption Keys (CMEK) allow you to protect data at rest in a {{ site.data.products.dedicated }} cluster using a cryptographic key that is entirely within your control, hosted in a supported key-management systems (KMS) platform. This key is called the _CMEK key_. The CMEK key is never present in the cluster. Using the KMS's identity access management (IAM) system, you manage CockroachDB's permission to use the key for encryption and decryption. If the key is unavailable, or if CockroachDB no longer has permission to decrypt using the key, the cluster cannot start. To temporarily make the cluster and its data unavailable, such as during a security investigation, you can revoke CockroachDB's access to use the CMEK key or temporarily disable the key within the KMS's infrastructure. To permanently make the cluster's data unavailable, you can delete the CMEK key from the KMS. CockroachDB never has access to the CMEK key materials, and the CMEK key never leaves the KMS.

To learn more, see [Customer-Managed Encryption Keys](/docs/cockroachcloud/cmek.html) and [Managing Customer-Managed Encryption Keys (CMEK) for {{ site.data.products.dedicated }}](/docs/cockroachcloud/managing-cmek.html).

{{site.data.alerts.callout_success}}
When CMEK is enabled, the **Encryption** option appears to be disabled in the [DB Console](../ui-overview.html), because this option refers to [Encryption At Rest (Enterprise)](#encryption-at-rest-enterprise), which is a feature of {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

<a id="encryption-at-rest-enterprise"></a>
### {{ site.data.products.core }} clusters

In the context of {{ site.data.products.core }}, customers are responsible for managing encryption at rest for each cluster. Usage of recommended IAAS providers such as GCP and AWS includes the encryption at rest services they offer by default.

In addition, the [Encryption at Rest (Enterprise) feature](../enterprise-licensing.html) provides transparent encryption of data on cluster disks. It allows encryption of all files on disk using [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) in [counter mode](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Counter_(CTR)), with all key sizes allowed.

Encryption is performed in the [storage layer](../architecture/storage-layer.html) and configured per store. All files used by the store, regardless of contents, are encrypted with the desired algorithm.

For more details about the encryption keys used by CockroachDB, as well as how to handle them, see [Encryption keys used by CockroachDB](#encryption-keys-used-by-cockroachdb-self-hosted-clusters). The following sections provide more information and recommendations for the Encryption at Rest (Enterprise) feature.

#### Rotating keys

Key rotation is necessary for Encryption at Rest for multiple reasons:

- To prevent key reuse with the same encryption parameters (after encrypting many files).
- To reduce the risk of key exposure.

Store keys are specified by the user and must be rotated by specifying different keys. This is done by restarting each node and setting the `key` parameter of the `--enterprise-encryption` flag to the path to the new key, and `old-key` to the previously used key. For an example, see [Changing Encryption Type](#changing-encryption-type).

Data keys will automatically be rotated at startup if any of the following conditions are met:

- The active store key has changed.
- The encryption type has changed (different key size, or plaintext to/from encryption).
- The current data key is `rotation-period` old or more.

Data keys will automatically be rotated at runtime if the current data key is `rotation-period` old or more.

Once rotated, an old store key cannot be made the active key again.

Upon store key rotation the data keys registry is decrypted using the old key and encrypted with the new
key. The newly-generated data key is used to encrypt all new data from this point on.

#### Changing encryption type

The user can change the encryption type from plaintext to encryption, between different encryption algorithms (using various key sizes), or from encryption to plaintext.

When changing the encryption type to plaintext, the data key registry is no longer encrypted and all previous data keys are readable by anyone. All data on the store is effectively readable.

When changing from plaintext to encryption, it will take some time for all data to eventually be re-written and encrypted.

#### Recommendations

There are a number of considerations to keep in mind when running with encryption.

##### Deployment configuration

To prevent key leakage, production deployments should:

* Use encrypted swap, or disable swap entirely.
* Disable core files.

CockroachDB attempts to disable core files at startup when encryption is requested, but it may fail.

##### Key handling

Key management is the most dangerous aspect of encryption. The following rules should be kept in mind:

* Make sure that only the UNIX user running the `cockroach` process has access to the keys.
* Do not store the keys on the same partition/drive as the CockroachDB data. It is best to load keys at run time from a separate system (e.g., [Keywhiz](https://square.github.io/keywhiz/), <a href="https://www.hashicorp.com/product/vault" data-proofer-ignore>Vault</a>).
* Rotate store keys frequently (every few weeks to months).
* Keep the data key rotation period low (default is one week).

##### Other recommendations

A few other recommendations apply for best security practices:

- Do not switch from encrypted to plaintext, this leaks data keys. When plaintext is selected, all previously encrypted data must be considered reachable.
- Do not copy the encrypted files, as the data keys are not easily available.
- If encryption is desired, start a node with it enabled from the first run, without ever running in plaintext.

{{site.data.alerts.callout_danger}}
Note that backups taken with the [`BACKUP`](../backup.html) statement **are not encrypted** even if Encryption at Rest is enabled. Encryption at Rest only applies to the CockroachDB node's data on the local disk. If you want encrypted backups, you will need to encrypt your backup files using your preferred encryption method.
{{site.data.alerts.end}}

### Encryption keys used by {{ site.data.products.core }} clusters

To allow arbitrary rotation schedules and ensure security of the keys, CockroachDB uses multiple layers of keys:

- **Store key**: A cluster's _store key_ is a _key encryption key (KEK) that CockroachDB uses to encrypt the cluster's data keys (see below).

  For CockroachDB Self-Hosted clusters, you provide the store key and give its location to CockroachDB when starting the cluster. The store key file must contain 32 bytes (the key ID) followed by the key (16, 24, or 32 bytes). The size of the key dictates the version of AES to use (AES-128, AES-192, or AES-256). For an example showing how to create a store key, see [Generating Key Files](/docs/{{site.versions["stable"]}}/encryption.html#generating-store-key-files).

  The store key is created automatically when the cluster is created.

  Since very little data is encrypted using this key, it can have a very long lifetime without risk of reuse.

- **Data key**: A cluster's data keys are _data encryption keys_ used to protect your cluster's data on each node's filesystem. Data keys are persisted in a key registry file that is encrypted using the cluster's store key.

  The data key is always the same length as the store key. CockroachDB generates a new data key in the following circumstances:

  - If encryption has just been enabled.
  - If the store key size has changed.
  - When the data key lifetime has expired (by default every 7 days).

  When data is written to the cluster, the current data key is used to encrypt it. When data is read from the cluster, it is decrypted using the data key that was used to encrypt it.

  CockroachDB does not currently force re-encryption of older files but instead relies on normal [storage engine](../architecture/storage-layer.html) churn to slowly rewrite all data with the desired encryption.

  Data keys have short lifetimes to avoid reuse.

### Encrypted backups (Enterprise)

See [Take and Restore Encrypted Backups](../take-and-restore-encrypted-backups.html).

### Encryption caveats

#### Higher CPU utilization

Enabling Encryption at Rest might result in a higher CPU utilization. We estimate a 5-10% increase in CPU utilization.

#### Encryption for touchpoints with other services

- S3 backup encryption
- Encrypted comms with Kafka


## See also

- [Customer-Managed Encryption Keys (CMEK)](/docs/cockroachcloud/cmek.html)
- [Client Connection Parameters](../connection-parameters.html)
- [Manual Deployment](../manual-deployment.html)
- [Orchestrated Deployment](../orchestration.html)
- [Local Deployment](../secure-a-cluster.html)
- [Other Cockroach Commands](../cockroach-commands.html)
