---
title: Customer-Managed Encryption Keys (CMEK)
summary: Use cryptographic keys that you manage to protect data at rest in a Cockroach Dedicated cluster.
toc: true
docs_area: manage.security
---

Customer-Managed Encryption Keys (CMEK) give you more control over how a {{ site.data.products.dedicated }} cluster's data is protected at rest on the cluster's nodes. When CMEK  enabled, your cluster's data is protected by an additional cryptographic key that is entirely within your control, hosted in a supported key-management systems (KMS) platform. This key is called the _CMEK key_. You grant your cluster's service account the permission to encrypt and decrypt using the CMEK key. The CMEK key is never persisted in a cluster, and {{ site.data.products.db }} uses the KMS platform's API to encrypt and decrypt using the CMEK key. The service account never has direct access to the CMEK key materials and does not have the ability to manage or export your CMEK keys.

You can create and manage your CMEK keys in AWS KMS, Google Cloud KMS, and Hashicorp Vault Secrets Manager. Hashicorp Vault Secrets Manager enables you to access CMEK keys stored in multiple KMS platforms. You can learn more about {{ site.data.products.dedicated }}'s [Hashicorp Vault Integration](/docs/{{site.versions["stable"]}}/hashicorp-integration.html).

This article describes how CMEK works in {{ site.data.products.dedicated }} clusters. To configure CMEK, see [Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated](managing-cmek.html).

## Overview of CMEK

This section describes how CMEK works on a {{ site.data.products.dedicated }} cluster. To learn more about encryption in CockroachDB, see [Encryption At Rest](/docs/{{site.versions["stable"]}}/encryption.html). To enable CMEK, see [Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated](managing-cmek.html).

When you create a {{ site.data.products.dedicated }} cluster, two encryption keys are created automatically:

1. The _store key_ is a Key Encryption Key (KEK), and is used to protect the data key. The store key is accessed each time a cluster node is started.
1. The _data key_ is a Data Encryption Key (DEK), and is used to encrypt and decrypt cluster data before it is read from or written to a cluster node's filesystem. Each time the cluster is started or restarted, and each time a node joins the cluster, CockroachDB uses the store key to encrypt and decrypt data keys.

  By default, data keys are rotated weekly, and CockroachDB keeps a registry of all data keys that have ever been used to write data to the cluster. When data is read from the cluster, it is first decrypted using the data key that was used to encrypt it. When data is written to a cluster, it is first encrypted using the current data key.

When CMEK is enabled for a cluster, the store key itself is encrypted using a symmetric key that you create and manage in a supported KMS platform. This key, which is also a KEK, is called the _CMEK key_. After the store key is encrypted, a new data key is created and encrypted using the new store key. The new store key and data key are propagated to the cluster's nodes and the previous (unencrypted) store key is deleted from the cluster's nodes.

To grant your cluster the ability to decrypt and encrypt using the CMEK key, you use an IAM role in your key-management system.

During start-up of a CMEK-enabled cluster, CockroachDB uses the KMS platform's's API to decrypt the encrypted store key in memory using the CMEK key, and the decrypted store key is used to decrypt the data key. Data can be written to and read from the cluster only when the CMEK key is available to the cluster. In addition, the cluster's backups can be read or restored only when the CMEK key is available.

{{site.data.alerts.callout_danger}}
If the CMEK key is destroyed, the cluster's data can't be recovered or restored. 
{{site.data.alerts.end}}

For more details, see the [How CMEK works](#how-cmek-works) section.

CMEK can help you to meet business or regulatory requirements such as:

- **Separation of concerns**: You can delegate management of your CMEK key to specialized groups within your organization, and these groups do not need access to your clusters or data.

- **Data lifecycle management**: To temporarily and reversibly disable access to data in the cluster, such as when investigating suspicious activity, you can revoke the {{ site.data.products.dedicated }} service account's permission to use the CMEK key. To reinstate access to the data, you can re-grant permission to use the key.

  To permanently disable access to the data in the cluster, you can permanently destroy the CMEK key. For example, if you need extra assurance that a cluster's data is permanently deleted when you delete the cluster, you can revoke the cluster's ability to use the CMEK key. This will trigger a cluster restart, which will fail because the CMEK key is unavailable. After verifying that the restart has failed, you can delete the cluster in {{ site.data.products.db }}. For more details, see [Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated](managing-cmek.html).

  {{site.data.alerts.callout_danger}}
  Keep these points in mind before destroying a CMEK key:

  - If a CMEK key is destroyed, the cluster's data can't be recovered by you or by Cockroach Labs, even by restoring from a backup. Consider disabling the CMEK key initially instead, so you can restore it if disabling it leads to unexpected results.

  - To protect against inadvertent data loss, your KMS platform may impose a waiting period before a key is permanently deleted. Check the documentation for your KMS platform for details about how long a deleted key can still be accessed.
  {{site.data.alerts.end}}

- **Infrastructure flexibility**: If all of your clusters are deployed using the same Information-as-a-Service (IAAS) provider where your cryptographic keys are stored, CockroachDB can access CMEK keys using the IAAS's key-management API..

  If your clusters are deployed on a different IAAS platform provider from where you manage your keys, or if your CMEK keys are stored in multiple KMS platforms, you can use Hashicorp Vault Key Management Secrets Engine to give your clusters access to your CMEK keys. Hashicorp Vault Key Management Secrets Engine provides support for additional KMS platforms. For more information about using Hashicorp Vault with {{ site.data.products.dedicated }}, see [Hashicorp Vault Integration](/docs/{{site.versions["stable"]}}/hashicorp-integration.html).

  - **Enforcement of encryption requirements**: With CMEK, you have control the CMEK key's encryption strength. The CMEK key can be 128, 256, or 512 bytes long.

## How CMEK works

  This section describes how data is read from or written to a {{ site.data.products.dedicated }} cluster when CMEK is enabled. For detailed instructions, see [Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated](managing-cmek.html).

  CMEK is configured per cluster region. You can configure a separate CMEK key for each cluster region or you can use the same key for each of a cluster's regions. Similarly, you can use a separate CMEK key for each cluster or use the same key for a group of clusters.

### Single-region clusters

   To enable CMEK, you use the [Cloud API](/docs/cockroachcloud/cloud-api.html) to specify the CMEK key's type, URI, and the IAM role that grants the cluster the ability to encrypt and decrypt using the CMEK key. You must provide a CMEK key for each of the cluster's regions.

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

When you enable CMEK on a multi-region cluster, you must use the [Cloud API](/docs/cockroachcloud/cloud-api.html) to specify the CMEK for each region. You can use a separate CMEK key for each of a cluster's regions, or you can use the same CMEK key for all regions. You can use the same CMEK key or set of keys to protect multiple clusters, or you can use unique keys for each region of each cluster. For keys stored in AWS KMS, [multi-region](https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html) keys are supported. IAM roles in AWS are account-level objects, so the same IAM role can be used with CMEK keys in multiple regions.

.. note:: Protecting only some of a cluster's regions with CMEK is not supported. Enabling CMEK on an existing multi-region cluster is also not supported.

### Encrypted backups

This section describes backing up and restoring data in a cluster with CMEK enabled.

{{site.data.alerts.callout_danger}}
It's not possible to restore from a backup that was taken before CMEK was enabled on a cluster. This limitation helps to prevent a situation where you have a mix of encrypted and unencrypted data at rest in a cluster.
{{site.data.alerts.end}}

Backups in {{ site.data.products.dedicated }} are triggered in two ways:

- {{ site.data.products.db }} automatically backs up clusters on a set schedule that is not configurable. You can view, manage, or restore from these backups using the {{ site.data.products.db }} Console. Managed backups operate on all databases, tables, views, and scheduled jobs in the cluster. Full backups are taken daily and incremental backups are taken hourly. Full managed backups are retained for 30 days and incremental managed backups are retained for 7 days. Managed backups can be restored only to the cluster where they were taken.

  Automatic managed backups are encrypted using a data key that is separate from the data key used to protect data at rest in the cluster. **When CMEK is enabled, the data key used to encrypt automatic managed backups in CockroachCloud is encrypted using the CMEK key before it is written to persistent storage.** The CMEK key must be available when you restore data from an automatic backup.

- Manual backups are triggered using the `BACKUP` SQL command. When you initiate a manual backup, you can back up all cluster objects or you can supply a list of databases, tables, views, and scheduled jobs. You can restore a manual backup to a different cluster from where it was taken. You also must provide the persistent storage location where the backup will be written. **Manual backups are not automatically encrypted**. You have the option to encrypt the backup using a key stored in AWS KMS, Google Cloud KMS, or locally. The backup is encrypted using this key before it is written to persistent storage. The key that was used to encrypt a manual backup must also be available when you restore it. For more details about taking and restoring encrypted backups, see [Take and Restore Encrypted Backups](/docs/stable/take-and-restore-encrypted-backups.html).

## CMEK FAQs

The following FAQs distill important information that is also covered in the preceding sections, as well as in the [Limitations](#limitations) section below.

### How are the store key and data key stored in the cluster?

If CMEK is enabled, the store key is encrypted by the CMEK key, which is never persisted to the cluster and never resides within {{ site.data.products.db }}. Otherwise, the store is not encrypted at rest, but it is still protected by the storage-level encryption on each of the cluster's nodes.

Data keys are encrypted at rest by the store key.

### If CMEK is not enabled, is data at rest in a {{ site.data.products.dedicated }} cluster encrypted by default?

Yes. Data at rest in a {{ site.data.products.dedicated }} cluster is encrypted in persistent storage by your IAAS provider. For more details, check the documentation for your IAAS provider.

### Can the CMEK key be automatically or manually rotated?

It's not possible to rotate the CMEK key.

### Are managed backups in CockroachDB Cloud encrypted using the CMEK key?

When CMEK is enabled, managed backups in {{ site.data.products.db }} are encrypted using the CMEK key before being written to persistent storage, and the CMEK key must be available when you restore from an automatic backup. In addition, backups taken before CMEK was enabled cannot be restored to the cluster.

### Can I enable CMEK on an existing cluster?

We do not recommend enabling CMEK on an existing cluster, to prevent a situation where some data is protected with the CMEK key and other data isn't. For the same reason, we recommend that you configure CMEK after creating the cluster but before loading any data into it or giving users access to it.

This limitation also applies to adding a new region to an existing cluster. Enabling CMEK for new regions of existing clusters is not supported. Instead, create a new multi-region cluster and enable CMEK on it. For more information about using CMEK with multi-region clusters, see [Multi-region Clusters](#multi-region-clusters).

### Can I enable CMEK from Cockroach Cloud Console?

It's not possible to enable CMEK from {{ site.data.products.db }} Console. Instead, you must use the [Cloud API](/docs/cockroachcloud/cloud-api.html).

### After enabling CMEK, can I disable it?

It's not possible to disable CMEK from a cluster where it has been enabled.

## Limitations

- To enable CMEK, you must use the [Cloud API](/docs/cockroachcloud/cloud-api.html). It's not possible to enable CMEK using the Cloud Console.
- The CMEK key can be stored in Amazon Web Services KMS, Google Cloud KMS, or Hashicorp Vault Secrets Managers.
- Rotating a CMEK key is not supported.
- Only symmetric AES-GCM software keys are supported.
- Keys stored in an HSM are not supported. The PCKS #11 API is not supported.

## See also

- [Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated](managing-cmek.html)
- [Encryption At Rest](/docs/{{site.versions["stable"]}}/encryption.html).
