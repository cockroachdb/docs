---
title: Customer-Managed Encryption Keys (CMEK)
summary: Use cryptographic keys that you manage to protect data at rest in a Cockroach Dedicated cluster.
toc: true
docs_area: manage.security
---

Customer-Managed Encryption Keys (CMEK) give you more control over data is protected in your {{ site.data.products.dedicated }} clusters where [Encryption At Rest](../{{site.versions["stable"]}}/encryption.html) is already enabled. When both Encryption At Rest and CMEK are enabled, your cluster's data is protected by an additional cryptographic key that is entirely within your control. You grant your cluster's service account the ability to encrypt and decrypt using the CMEK key. The service account never has direct access to the CMEK key materials and does not have the ability to manage or export your CMEK keys.

You create and manage your CMEK keys in your cloud tenant's key-management system (KMS). Support for Hashicorp Vault Secrets Manager means that you can use CMEK keys stored in multiple cloud tenants or providers. You can learn more about {{ site.data.products.dedicated }}'s [Hashicorp Vault Integration](../{{site.versions["stable"]}}/hashicorp-integration.html).

In addition, you can use CMEK keys that reside in multiple cloud tenants or providers by using Hashicorp Vault Secrets Manager. Hashicorp Vault Secrets Manager centralizes management of cryptographic keys in multiple cloud tenants, and you grant your {{ site.data.products.dedicated }} service account the ability to encrypt and decrypt using the key. Google Cloud KMS, AWS KMS, and Hashicorp Vault Secrets Manager, or a combination of the three. This article describes how CMEK works in {{ site.data.products.dedicated }} clusters. To enable CMEK on a cluster, see [Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated](managing-cmek.html).

## Overview of CMEK

This section briefly describes how Encryption At Rest works without CMEK, and then explains the differences when CMEK is enabled. For more details, see [Encryption At Rest](..{{site.versions["stable"]}}/encryption.html). To enable CMEK, see [Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated](managing-cmek.html).

When Encryption At Rest is enabled on a {{ site.data.products.dedicated }} cluster, data is always encrypted when writing to a database, and must be decrypted when reading from the database. Data in backups is also encrypted before being written to the target storage location. When you enable Encryption At Rest, CockroachDB creates two keys, distributes them to the cluster's nodes, and begins using them to encrypt and decrypt the cluster's data. This explanation describes single-region clusters. For a multi-region cluster, each region has a CMEK key, so the following steps happen for each node in a given region.

1. The _store key_ is a Key Encryption Key (KEK), and is used to protect the data key. The store key is accessed each time a cluster node is started.
1. The _data key_ is a Data Encryption Key (DEK), and is used to encrypt and decrypt data at rest in the cluster. Before the data key can be used to encrypt data, CockroachDB uses the store key to decrypt it. This happens each time a cluster node is restarted or a new node joins the cluster. The data key itself is accessed each time data is written to or read from the cluster.

The data key is automatically rotated on a monthly basis, and data is always written using the latest version of the key. Data is always decrypted using the version of the key that was used to encrypt it, as long as that key version remains available. When the data key is rotated, the new version is also encrypted using the store key.

  Clusters running in {{ site.data.products.dedicated }} are automatically backed up on a schedule: Full backups run daily and incremental backups run hourly within a day. These backups are always encrypted using a data key that is different from the data key used to protect data at rest. Before each full managed backup runs, the data key used for backups is rotated. Each full managed backup (and its dependent incremental backups) is encrypted using a new version of the backup data key.

  Using a _Customer-Managed Encryption Key (CMEK)_ gives you more control over how data at rest is protected in your cluster.

  When CMEK is not enabled for a cluster, the store key itself is not encrypted at rest. When CMEK is enabled for a cluster, the store key is encrypted using a symmetric key that you create and manage. This key, which is also a KEK, is called the _CMEK key_. The CMEK key is stored and managed within AWS KMS, Google Cloud KMS, or Hashicorp Vault Secrets Manager. Hashicorp Vault Secrets Manager can manage and distribute keys to multiple cloud providers. To grant your cluster the ability to decrypt and encrypt using the CMEK key, you use an IAM role in your key-management system.

  During start-up of a CMEK-enabled cluster, the CMEK key is used to decrypt the store key, and the decrypted store key is used to decrypt the data key. Data can be written to and read from the cluster only when the CMEK key is available to the cluster. In addition, the cluster's backups can be read or restored only when the CMEK key is available. For more details, see the [How CMEK works](#how-cmek-works) section.

  CMEK can help you to meet business or regulatory requirements such as:

  - **Separation of concerns**: You can delegate management of your CMEK key to specialized groups within your organization, and these groups do not need access to your clusters or data.

  - **Data lifecycle management**: To temporarily and reversibly disable access to data in the cluster, such as when investigating suspicious activity, you can revoke the {{ site.data.products.dedicated }} service account's permission to use the CMEK key, using your key-management system's native interface. To re-enable access to the data, you can re-grant permission to use the key. To permanently disable access to the data in the cluster, you can permanently delete the CMEK key.

    {{site.data.alerts.callout_danger}}
    To protect against inadvertent data loss, your cloud provider may impose a waiting period before a key is permanently deleted. Check the documentation for your cloud provider for details about how long a deleted key can still be accessed.
    {{site.data.alerts.end}}

  - **Infrastructure flexibility**: If all of your clusters and cryptographic keys are stored in the same cloud provider, you can access CMEK keys using that cloud provider's key-management system directly.

    If your clusters or your CMEK keys are stored in multiple cloud providers, you can use Hashicorp Vault Key Management Secrets Engine to give your clusters access to your CMEK keys. Hashicorp Vault Key Management Secrets Engine provides a consistent workflow for distribution and lifecycle management of cryptographic keys in various key-management service (KMS) providers, including Google Cloud KMS and AWS KMS, while still taking advantage of the cryptographic capabilities of each KMS provider. For more information about using Hashicorp Vault with {{ site.data.products.dedicated }}, see [Hashicorp Vault Integration](../{{site.versions["stable"]}}/hashicorp-integration.html).

  - **Enforcement of encryption requirements**: With CMEK, you have control the CMEK key's encryption strength. The CMEK key can be 128, 256, or 512 bytes long.

## How CMEK works

  This section describes how data is read from or written to a {{ site.data.products.dedicated }} cluster work when CMEK is enabled. For detailed instructions, see [Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated](managing-cmek.html).

  For a given cluster, CMEK is configured per cluster region. You can configure a separate CMEK key for each cluster region or you can use the same key for each of a cluster's regions. Similarly, you can use a separate set of CMEK keys for each cluster or use the same keys for all clusters.

  The following sections describe how CMEK works in a single-region cluster, but CMEK works the same way for each region in a multi-region cluster.

### Single-region clusters

   1. Before you can enable CMEK on a cluster, you first enable Encryption At Rest for the cluster by running `cockroach start` and setting `--enterprise-encryption` to the location of the store key.
   1. Next, you use the [Cloud API](/docs/cockroachcloud/cloud-api.html) to specify the CMEK key's type, URI, and the IAM role that grants the cluster the ability to encrypt and decrypt using the CMEK key. You must provide a CMEK key for each of the cluster's regions. For a single-region cluster, you need to do this only once.

  .. note:: Rotating the CMEK key is not supported.

  When the cluster starts:

  1. CockroachDB uses the CMEK key to decrypt the store key.
  1. The store key is used to decrypt the data key.
  1. Data can be read from and written to the cluster.


  Each time data is read from the cluster:

  1. The data key is used to decrypt the data at rest.
  1. The decrypted data is read from the cluster's storage.

  Each time data is written to the cluster:

  1. The data key is used to encrypt the data.
  1. The encrypted data is written to the cluster's storage.

  If the CMEK key is unavailable, data cannot be read from or written to the cluster.

### Multi-region clusters

For multi-region clusters, a different store key is used for each region, to protect the data key for that region. You specify the store key when you add the region to the cluster.

When you enable CMEK on a multi-region cluster, you must use the [Cloud API](/docs/cockroachcloud/cloud-api.html) to specify the CMEK for that region, providing the key's type, URI, and the IAM role that grants the cluster the ability to encrypt and decrypt using the CMEK key. You can use a separate CMEK key for each of a cluster's regions, or you can use the same CMEK key for all regions. You can use the same CMEK key or set of keys to protect multiple clusters, or you can use unique keys for each region of each cluster. For keys stored in AWS KMS, [multi-region](https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html) keys are supported. IAM roles in AWS are account-level objects, so the same IAM role can be used with CMEK keys in multiple regions.

.. note:: Protecting only some of a cluster's regions with CMEK is not supported. Enabling CMEK on an existing multi-region cluster is also not supported.

### Encrypted backups

Backups in {{ site.data.products.dedicated }} are triggered in two ways:

- For clusters running in Cockroach Cloud, automatic managed backups occur on a set schedule that is not configurable. You can view, manage, or restore from these backups using the Cockroach Cloud Console. Managed backups operate on all databases, tables, views, and scheduled jobs in the cluster. Full backups are taken daily and incremental backups are taken hourly. Full managed backups are retained for 30 days and incremental managed backups are retained for 7 days. Managed backups can be restored only to the cluster where they were taken.

  Automatic managed backups are encrypted using a data key that is separate from the data key used to protect data at rest in the cluster. **When CMEK is enabled, the data key used to encrypt automatic managed backups in CockroachCloud is encrypted using the CMEK key before it is written to persistent storage.** The CMEK key must be available when you restore data from an automatic backup.

- Manual backups are triggered using the `BACKUP` SQL command. When you initiate a manual backup, you can back up all cluster objects or you can supply a list of databases, tables, views, and scheduled jobs. You can restore a manual backup to a different cluster from where it was taken. You also must provide the persistent storage location where the backup will be written. **Manual backups are not automatically encrypted**. You have the option to encrypt the backup using a key stored in AWS KMS, Google Cloud KMS, or locally. The backup is encrypted using this key before it is written to persistent storage. The key that was used to encrypt a manual backup must also be available when you restore it. For more details about taking and restoring encrypted backups, see [Take and Restore Encrypted Backups](/docs/stable/take-and-restore-encrypted-backups.html)).

## CMEK FAQs

The following FAQs distill important information that is also covered in the preceding sections, as well as in the [Limitations](#limitations) section below.

### How are the store key and data key stored in the cluster?

The store key is always encrypted, and is decrypted only in memory for use by CockroachDB processes. If CMEK is enabled, the store key is encrypted by the CMEK key. Otherwise, it is not encrypted, but it is still protected by the storage-level encryption on each of the cluster's nodes.

The data key and data files on the disks of cluster nodes are encrypted by the store key.

### If CMEK is not enabled, is data at rest in a {{ site.data.products.dedicated }} cluster encrypted by default?

Yes. Data at rest in a {{ site.data.products.dedicated }} cluster is stored in persistent storage in your cloud tenant. This persistent storage is always encrypted by the cloud provider, using unique keys for each cloud tenant. For more details, check the documentation for your cloud provider.

### Can the CMEK key be automatically or manually rotated?

Rotating the CMEK key is not currently supported.

### Are managed backups in CockroachDB Cloud encrypted using the CMEK key?

When CMEK is enabled, managed backups in Cockroach Cloud are encrypted using the CMEK key before being written to persistent storage, and the CMEK key must be available when you restore from an automatic backup.

### Can I enable CMEK on an existing cluster?

We do not support enabling CMEK on an existing cluster, to prevent a situation where some data is protected with the CMEK key and other data isn't. For the same reason, we recommend that you configure CMEK after creating the cluster but before loading any data into it or giving users access to it.

This limitation also applies to adding a new region to an existing cluster. Enabling CMEK for new regions of existing clusters is not supported. Instead, create a new multi-region cluster and enable CMEK on it. For more information about using CMEK with multi-region clusters, see [Multi-region Clusters](#multi-region-clusters).

### Can I enable CMEK from Cockroach Cloud Console?

It's not possible to enable CMEK from Cockroach Cloud Console. Instead, you must use the [Cloud API](/docs/cockroachcloud/cloud-api.html).

## Limitations

- To enable CMEK, you must use the [Cloud API](/docs/cockroachcloud/cloud-api.html). It's not possible to enable CMEK using the Cloud Console.
- CMEK can be enabled only when creating a new {{ site.data.products.dedicated }} cluster. It's not possible to enable CMEK on an existing cluster.
- The CMEK key can be stored in Amazon Web Services KMS, Google Cloud KMS, Hashicorp Vault Secrets Manager, or on the filesystems of your cluster's nodes.
- Rotating a CMEK key is not supported.
- Only symmetric AES-GCM software keys are supported.
- Keys stored in an HSM are not supported. The PCKS #11 API is not supported.

## See also

- [Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated](managing-cmek.html)
- [Encryption At Rest](..{{site.versions["stable"]}}/encryption.html).
