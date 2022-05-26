---
title: Customer Managed Encryption Keys (CMEK)
summary: Use cryptographic keys that you manage to protect data at rest in CockroachDB.
toc: true
docs_area: TODO
---

Customer Managed Encryption Keys (CMEK) give you more control over how your cluster's data is protected on your cluster's filesystem. When CMEK is enabled, your cluster's data is protected by an additional cryptographic key that is entirely within your control. This article describes how CMEK works in CockroachDB clusters. To enable CMEK on a cluster, see [TODO](TODO).

## Overview of CMEK

This section briefly describes how Encryption At Rest works without CMEK, and then explains the differences when CMEK is enabled. For more details, see [Encryption At Rest](/docs/stable/security-reference/encryption.md).

When Encryption At Rest is enabled on a CockroachDB cluster, data is always encrypted when writing to a database, and must be decrypted when reading from the database. Data in backups is also encrypted at rest. When you enable Encryption At Rest, CockroachDB creates two keys, distributes them to the cluster's nodes, and begins using them to encrypt and decrypt the cluster's data:

  - The _store key_ is a Key Encryption Key (KEK), and is used to protect the data key.
  - The _data key_ is a Data Encryption Key (DEK), and is used to encrypt and decrypt data at rest in the cluster and in backups. Before the data key can be used to encrypt data, CockroachDB uses the store key to decrypt it.

  Using a _Customer Managed Encryption Key (CMEK)_ gives you more control over how data at rest is protected in your cluster. When CMEK is enabled for a cluster, the store key is encrypted using a symmetric key that you create and manage. This key, which is also a KEK, is called the _CMEK key_. Data can be written to and read from the cluster only when the CMEK key is available to the CockroachDB cluster. In addition, the cluster's backups can be read only when the CMEK key is available. For more details, see [How CMEK works](#how-cmek-works). You manage the CMEK key either within your cloud tenant or centrally Hashicorp Vault Secrets Manager, which can manage and distribute keys created in multiple cloud providers.

  CMEK can help you to meet business or regulatory requirements such as:

  - **Separation of concerns**: You can delegate management of your CMEK key to specialized groups within your organization, and these groups do not need access to your CockroachDB clusters or data.

  - **Data lifecycle management**: To temporarily and reversibly disable access to data in the cluster, such as when investigating suspicious activity, you can revoke the CockroachDB service account's permission to use the CMEK key, using your cloud tenant's management interface or Hashicorp Vault. To re-enable access to the data, you can re-grant permission to use the key. To permanently disable access to the data in the cluster, you can permanently delete the CMEK key.

    .. important:: To protect against inadvertent data loss, your cloud provider may impose a waiting period before a key is permanently deleted. Check the documentation for your cloud provider for details how long a deleted key can still be accessed.

  - **Infrastructure flexibility**: If all of your CockroachDB clusters and cryptographic keys are stored in the same cloud provider, you can access CMEK keys using that cloud provider's key-management system directly.

    If your clusters or your CMEK keys are stored in multiple cloud provider you can take advantage of CockroachDB's support for Hashicorp Vault Key Management Secrets Engine. Hashicorp Vault Key Mnagement Secrets Engine provides a consistent workflow for distribution and lifecycle management of cryptographic keys in various key management service (KMS) providers, including Google Cloud KMS and AWS KMS, while still taking advantage of cryptographic capabilities native to each KMS provider. For more information about using Hashicorp Vault with CockroachDB, see [Hashicorp Vault Integration](/hashicorp-integration.md).

  - **Enforcement of encryption requirements**: With CMEK, you have control control the CMEK key's encryption strength. The CMEK key can be 128, 256, or 512 bytes long.

## How CMEK works

  This section describes how data is read from or written to a CockroachDB cluster work when CMEK is enabled. For detailed instructions, see [TODO](TODO).

  To enable CMEK on a cluster, you run `cockroach start` and set `--enterprise-encryption` to the location of the CMEK key. You can specify a local filesystem path or a URI.

  Each time data is read from the cluster:

  1. CockroachDB uses the CMEK key to decrypt the store key.
  1. The store key is used to decrypt the data key.
  1. The data key is used to decrypt the data at rest.
  1. The decrypted data is read from the cluster's storage.

  Each time data is written to the cluster:

  1. CockroachDB uses the CMEK to decrypt the store key.
  1. The store key is used to decrypt the data key.
  1. The data key is used to encrypt the data.
  1. The encrypted data is written to the cluster's storage.

  If the CMEK key is unavailable, data cannot be read from or written to the cluster.

  CMEK is configured at the level of the cluster. You can configure a separate CMEK key for each cluster or you can use the same CMEK key for multiple clusters.

  To learn more or to configure CMEK for a cluster, see [TODO](TODO).

## Limitations

- The CMEK key can be stored in Amazon Web Services KMS, Google Cloud KMS, Hashicorp Vault Secrets Manager, or on the filesystems of your cluster's nodes.
- Rotating the CMEK key is not supported.
- Only symmetric AES-GCM software keys are supported.
- Keys stored in an HSM are not supported. The PCKS #11 API is not supported.

## Next steps

- [TODO](TODO)
- [Encryption At Rest](/docs/stable/security-reference/encryption.md).
