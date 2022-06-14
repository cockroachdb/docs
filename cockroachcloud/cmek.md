---
title: Customer-Managed Encryption Keys (CMEK)
summary: Use cryptographic keys that you manage to protect data at rest in a CockroachDB Dedicated cluster.
toc: true
docs_area: manage.security
---

Customer-Managed Encryption Keys (CMEK) give you more control over how a {{ site.data.products.dedicated }} cluster's data is protected at rest on the cluster's nodes. When CMEK is enabled, your cluster's data is protected by an additional cryptographic key that is entirely within your control, hosted in a supported key-management systems (KMS) platform. This key is called the _CMEK key_.

You create and manage your CMEK keys in one of the following supported KMS platforms:

- Amazon Web Services (AWS) KMS
- Google Cloud Platform (GCP) KMS
- Hashicorp Vault Secrets Manager

{{ site.data.products.db }} communicates with a supported KMS using the KMS platform's API, and you manage {{ site.data.products.db }}'s access to the CMEK key using the KMS platform's identity and access management (IAM) system. The CMEK key is never persisted in a cluster, and {{ site.data.products.db }} never has direct access to the CMEK key material. When CMEK is enabled, neither the cluster nor its newly-written data can be accessed without the CMEK key.

This article describes how CMEK works in {{ site.data.products.dedicated }} clusters. To configure CMEK, see [Managing Customer-Managed Encryption Keys (CMEK) for [{{ site.data.products.dedicated }}](managing-cmek.html).

## Benefits of CMEK

This section describes some of the ways that CMEK can help you protect your data and meet business and regulatory requirements, even when you don't own the underlying infrastructure that hosts your data.

- **Separation of concerns**: You can delegate management of your CMEK keys to a specialized group within your organization, and group members do not need access to your clusters or data.

- **Responsiveness to security events**: As part of the investigation of a security incident, you can temporarily and reversibly disable access to data in the cluster by revoking the cluster's access to use the CMEK key. When the investigation has concluded, you can reinstate the cluster's access to the CMEK key.

- **Enforcement of data retention policies**: To ensure that a cluster's data is permanently inaccessible, you can destroy the CMEK key or keys that protect its data.

  {{site.data.alerts.callout_danger}}
  Keep these points in mind before destroying a CMEK key:

  - If a CMEK key is destroyed, the cluster's data can't be recovered by you or by Cockroach Labs, even by restoring from a backup. Consider disabling the CMEK key initially instead, so you can restore it if disabling it leads to unexpected results.

  - To protect against inadvertent data loss, your KMS platform may impose a waiting period before a key is permanently deleted. Check the documentation for your KMS platform for details about how long before a key deletion is permanent and irreversible.
  {{site.data.alerts.end}}

- **Enforcement of data domiciling and locality requirements**: In a multi-region cluster, you can confine an individual database to a single region or multiple regions. For more information and limitations, see [Data Domiciling with CockroachDB](/docs/stable/data-domiciling.html). When you enable CMEK on a multi-region cluster, you can optionally assign a separate CMEK key to each region, or use the same CMEK key for multiple related regions.

- **Enforcement of encryption requirements**: With CMEK, you have control the CMEK key's encryption strength. The CMEK key can be 128, 256, or 512 bytes long.

- **Infrastructure flexibility**: If your clusters are deployed on a different IAAS platform provider from where you manage your keys, or if your CMEK keys are stored in multiple KMS platforms, you can use Hashicorp Vault Key Management Secrets Engine to give your clusters access to your CMEK keys. Hashicorp Vault Key Management Secrets Engine provides support for additional KMS platforms.

The following example shows some of the ways that CMEK can help you meet business and regulatory requirements.

Imagine that you have a business requirement to verify that a cluster's data is permanently destroyed when you delete the cluster. Cloud computing makes such requirements more difficult to verifiably meet, because you don't have visibility into what happens to the cluster's resources after the cluster disappears from your view. This sort of requirement might make it more challenging for your organization to move some workloads to the cloud.

CMEK helps you to enforce such business rules on {{ site.data.products.db }} clusters. With CMEK, you can actively and verifiably enforce this requirement without waiting for {{ site.data.products.db }} to destroy the cluster's resources. Instead, with a single operation you can revoke the cluster's ability to use the CMEK key. This will trigger a cluster restart, and the restart will fail because the CMEK key is unavailable. After verifying that the restart has failed, you can delete the cluster in {{ site.data.products.db }}.

## How CMEK works

When you create a {{ site.data.products.dedicated }} cluster, two encryption keys are created automatically:

1. The _store key_ is a Key Encryption Key (KEK), and is used to protect the data key. The store key is accessed each time a cluster node is started.
1. The _data key_ is a Data Encryption Key (DEK), and is used to encrypt and decrypt cluster data before it is read from or written to a cluster node's filesystem. Each time the cluster is started or restarted, and each time a node joins the cluster, CockroachDB uses the store key to encrypt and decrypt data keys.

For more details about encryption in {{ site.data.products.db }}, see [Encryption At Rest](/docs/{{site.versions["stable"]}}/encryption.html).

Enabling CMEK changes how the cluster's store keys and data keys are handled going forward, but has no effect on the cluster's existing store keys, data keys, or data.

{{site.data.alerts.callout_success}}
CMEK is configured per cluster region. A single-region cluster is actually a multi-region cluster with only a single region. The following steps occur for each of a cluster's regions.
{{site.data.alerts.end}}

At the time that you enable CMEK for a cluster, {{ site.data.products.db }}:

1. Rotates the store key and encrypts it using the CMEK key.
1. Rotates the data key and encrypts it using the encrypted store key.
1. Propagates the new store key and data key to cluster nodes.

Going forward:

1. The cluster can start only when the CMEK key is available. If the CMEK key becomes unavailable or you revoke the cluster's access to the key, the cluster can't start until access is restored.
1. Each time the store key is rotated, the new store key is also encrypted using the CMEK key.
1. Each time the data key is rotated, the new data key is encrypted using the encrypted store key.
1. Newly-written data is written using the current data key. Data is read using the data key that was used to encrypt it.

{{site.data.alerts.callout_danger}}
If the CMEK key is destroyed, the cluster's data can't be recovered or restored. 
{{site.data.alerts.end}}

## Backing up and restoring to a cluster with CMEK

This section describes how enabling CMEK changes backup and restore operations on a cluster.

Backups in {{ site.data.products.dedicated }} are triggered in two ways, only one of which is affected by CMEK.

- You can perform a manual backup by using the `BACKUP` SQL command to back up database objects in a cluster. To restore from a manual backup, you use the `RESTORE` SQL command. Manual backups are not automatically encrypted, but you can optionally encrypt a manual backup by specifying an encryption key when you run the `BACKUP` command. Enabling CMEK has no impact on manual backups. To learn about encrypting manual backups, see [Take and Restore Encrypted Backups](/docs/stable/take-and-restore-encrypted-backups.html).

- {{ site.data.products.db }} automatically backs up clusters on a set schedule that is not configurable. You can view, manage, or restore from these backups using the {{ site.data.products.db }} Console. Managed backups operate on all databases, tables, views, and scheduled jobs in the cluster. Full backups are taken daily and incremental backups are taken hourly. Full managed backups are retained for 30 days and incremental managed backups are retained for 7 days. Managed backups can be restored only to the cluster where they were taken. Managed backups are automatically encrypted using data keys that are distinct from those used to encrypt the cluster's data.

  When CMEK is enabled for a cluster, managed backups change in the following ways:

  - You can no longer restore from a managed backup that was taken before CMEK was enabled.
  - The data keys used to encrypt managed backups in {{ site.data.products.db }} are encrypted using the CMEK key before being written to persistent storage.
  - The CMEK key must be available before you can restore from an automatic backup.

## CMEK FAQs
<!-- TODO: De-duplicate with the standalone topic -->
The following FAQs distill important information that is also covered in the preceding sections, as well as in the [Limitations](#limitations) section below.

### How are the store key and data key stored in the cluster?

If CMEK is enabled, the store key is encrypted by the CMEK key, which is never persisted to the cluster and never resides within {{ site.data.products.db }}. Otherwise, the store key is not encrypted at rest, but it is still protected by the storage-level encryption on each of the cluster's nodes.

Data keys are encrypted at rest by the store key, which is protected by the CMEK key.

### If CMEK is not enabled, is data at rest in a {{ site.data.products.dedicated }} cluster encrypted by default?

Yes. Data at rest in a {{ site.data.products.dedicated }} cluster is encrypted in persistent storage by your IAAS provider. For more details, check the documentation for your IAAS provider.

### Can the CMEK key be automatically or manually rotated?

It's not possible to rotate the CMEK key.

### Are managed backups in CockroachDB Cloud encrypted using the CMEK key?

When CMEK is enabled, managed backups in {{ site.data.products.db }} are encrypted using the CMEK key before being written to persistent storage, and the CMEK key must be available when you restore from an automatic backup. In addition, backups taken before CMEK was enabled cannot be restored to the cluster.

### Can I enable CMEK on an existing cluster?

We do not recommend enabling CMEK on an existing cluster, to prevent a situation where some data is protected with the CMEK key and other data isn't. For the same reason, we recommend that you configure CMEK after creating the cluster but before loading any data into it or giving users access to it.

This limitation also applies to adding a new region to an existing cluster. Adding a new region to a multi-region cluster that has CMEK enabled is not recommended, because the new region's data at rest will not be encrypted by the CMEK key.

### Can I enable CMEK from Cockroach Cloud Console?

It's not possible to enable CMEK from {{ site.data.products.db }} Console. Instead, you must use the [Cloud API](/docs/cockroachcloud/cloud-api.html).

### After enabling CMEK, can I disable it?

CMEK can't be disabled on a cluster after it has been enabled.

## Limitations
The CMEK feature has the following limitations:

- CMEK can be enabled only on clusters created after April 1, 2022 (AWS) or June 9, 2022 (GCP).
- To enable CMEK, you must use the [Cloud API](/docs/cockroachcloud/cloud-api.html). It's not possible to enable CMEK using the {{ site.data.products.db }} Console.
- Adding a region to a cluster with CMEK enabled is not recommended because currently, the new region will not be protected by the CMEK key.
- Rotating a CMEK key is not supported.
- Only symmetric AES-GCM software keys are supported.
- Software-backed keys are supported. The PCKS #11 API is not supported.

## See also

- [Managing Customer-Managed Encryption Keys (CMEK) for {{ site.data.products.dedicated }}](managing-cmek.html)
- [Encryption At Rest](/docs/{{site.versions["stable"]}}/encryption.html)
