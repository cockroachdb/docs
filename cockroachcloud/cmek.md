---
title: Customer-Managed Encryption Keys (CMEK)
summary: Use cryptographic keys that you manage to protect data at rest in a {{ site.data.products.dedicated }} cluster.
toc: true
docs_area: manage.security
---

Customer-Managed Encryption Keys (CMEK) allow you to protect data at rest in a {{ site.data.products.dedicated }} cluster using a cryptographic key that is entirely within your control, hosted in a supported key-management system (KMS) platform. This key is called the _CMEK key_.

{{site.data.alerts.callout_info}}
{% include feature-phases/preview-opt-in.md %}
{{site.data.alerts.end}}

You can manage your CMEK keys using one or more of the following services:

- Amazon Web Services (AWS) KMS
- Google Cloud Platform (GCP) KMS

To learn more, visit [Managing Customer-Managed Encryption Keys (CMEK) for {{ site.data.products.dedicated }}](managing-cmek.html).

{{ site.data.products.dedicated }} includes support for referring to CMEK keys in [Hashicorp Vault Secrets Manager](https://www.vaultproject.io/docs/secrets/key-management), which can distribute keys stored in multiple KMS systems, as long as the actual keys are stored in AWS KMS or GCP KMS.

{{site.data.alerts.callout_success}}
You can learn more about the [supported integrations between CockroachDB and Hashicorp Vault](/docs/{{site.versions["stable"]}}/hashicorp-integration.html).
{{site.data.alerts.end}}

{{ site.data.products.db }} communicates with the KMS platform using the KMS platform's API, and you manage {{ site.data.products.db }}'s access to the CMEK key using the KMS platform's identity and access management (IAM) system. The CMEK key is never present in a cluster and {{ site.data.products.db }} never has direct access to the CMEK key material. When CMEK is enabled, the CMEK key must be available before the cluster can start and the cluster's newly-written data at rest can be accessed.

This article describes how CMEK works in {{ site.data.products.dedicated }} clusters. To configure CMEK, see [Managing Customer-Managed Encryption Keys (CMEK) for {{ site.data.products.dedicated }}](managing-cmek.html).

## Benefits of CMEK

This section describes some of the ways that CMEK can help you protect your data and meet business and regulatory requirements, even when you don't own the underlying infrastructure that hosts your data.

- **Enforcement of data retention policies**: To ensure that a cluster's data is permanently inaccessible, you can destroy the CMEK key or keys that protect its data.
    {{site.data.alerts.callout_danger}}
    Keep these points in mind before destroying a CMEK key:

    <ul><li><p>If a CMEK key is destroyed, the cluster's data can't be recovered by you or by {{ site.data.products.db }}, even by restoring from a {{ site.data.products.db }}-managed backup. Consider disabling the CMEK key initially instead, so you can restore it if disabling it leads to unexpected results. To take or restore from an encrypted backup using database commands, visit [Take and Restore Encrypted Backups](/docs/{{site.versions["stable"]}}/take-and-restore-encrypted-backups.html).</p></li><li><p>To protect against inadvertent data loss, your KMS platform may impose a waiting period before a key is permanently deleted. Check the documentation for your KMS platform for details about how long before a key deletion is permanent and irreversible.</p></li></ul>
    {{site.data.alerts.end}}
- **Enforcement of data domiciling and locality requirements**: In a multi-region cluster, you can confine an individual database to a single region or multiple regions. For more information and limitations, see [Data Domiciling with CockroachDB](/docs/{{site.versions["stable"]}}/data-domiciling.html). When you enable CMEK on a multi-region cluster, you can optionally assign a separate CMEK key to each region, or use the same CMEK key for multiple related regions.
- **Enforcement of encryption requirements**: With CMEK, you have control the CMEK key's encryption strength. The CMEK key's size is determined by what your KMS provider supports.

    You can use your KMS platform's controls to configure the regions where the CMEK key is available, enable automatic rotation schedules for CMEK keys, and view audit logs that show each time the CMEK key is used by {{ site.data.products.db }}. {{ site.data.products.db }} does not need any visibility into these details.
- **Infrastructure flexibility**: If your CMEK keys are stored in multiple KMS systems or tenants, you can use Hashicorp Vault Key Management Secrets Engine to give your cluster access to your CMEK keys, as long as the cluster and keys are stored in the same deployment environment (GCP or AWS).

The following example shows some of the ways that CMEK can help you meet business and regulatory requirements.

Imagine that you have a business requirement to verify that a cluster's data is inaccessible when you delete the cluster. Software as a Service (SaaS) makes such requirements more difficult to verifiably meet, because you don't have visibility into what happens to the cluster's resources after the cluster disappears from your view. This sort of requirement might make it more challenging for your organization to move some workloads to SaaS.

CMEK helps you to enforce such business rules on {{ site.data.products.db }} clusters. With CMEK, you can actively and verifiably enforce this requirement without waiting for {{ site.data.products.db }} to destroy the cluster's resources. Instead, with a single operation you can revoke the cluster's ability to use the CMEK key. This will trigger a cluster restart, and the restart will fail because the CMEK key is unavailable. After verifying that the restart has failed, you can delete the cluster in {{ site.data.products.db }}.

## How CMEK works

When you create a {{ site.data.products.dedicated }} cluster, its data at rest on cluster disks is not encrypted by default. However, the disks themselves are automatically encrypted by cryptographic keys owned and managed by the cloud providers themselves.

When you enable CMEK on a {{ site.data.products.dedicated }} cluster, {{ site.data.products.db }} creates two encryption keys and begins to use them to protect newly-written data at rest. {{ site.data.products.db }} manages these encryption keys and propagates them to cluster nodes.

1. The _data key_ is a Data Encryption Key (DEK), and is used to encrypt and decrypt cluster data before it is read from or written to disks attached to a cluster's nodes. Each time the cluster is started or restarted, and each time a node and related disks are added to a cluster, {{ site.data.products.dedicated }} uses the store key to encrypt and decrypt data keys. Each cluster node maintains its own list of data keys. The data key is automatically rotated monthly and is always encrypted at rest by the store key.

1. The _store key_ is a Key Encryption Key (KEK) that encrypts the data keys at rest. It is encrypted at rest by the CMEK key before being propagated to cluster nodes, and is decrypted in memory on each node when the cluster starts. The store key is not automatically rotated. 

For more details about encryption in {{ site.data.products.db }}, see [Encryption At Rest](/docs/{{site.versions["stable"]}}/encryption.html).

Enabling CMEK has no impact on a cluster's existing data.

{{site.data.alerts.callout_success}}
CMEK is configured per cluster region. A single-region cluster is actually a multi-region cluster with only a single region. The following steps occur for each of a cluster's regions.
{{site.data.alerts.end}}

At the time that you enable CMEK for a cluster, {{ site.data.products.db }}:

1. Creates the store key and encrypts it using the CMEK key.
1. Creates the data key and encrypts it using the encrypted store key.
1. Propagates the store key and data key to cluster nodes.
1. Starts the cluster.

Going forward:

1. The cluster can start only when the CMEK key is available to decrypt the store key. If the CMEK key becomes unavailable or you revoke the cluster's access to the key, the cluster can't start until access is restored.
1. Each time the store key is rotated, the new store key is also encrypted using the CMEK key.
1. Each time the data key is rotated, the new data key is encrypted using the encrypted store key.
1. Each time a node writes new data to disk, it is encrypted using the current data key. Data is read using the data key that was used to encrypt it.

{{site.data.alerts.callout_danger}}
If the CMEK key is destroyed, the cluster's data can't be recovered or restored from a managed backup in {{ site.data.products.db }} or from a manual backup to the same cluster. It may be possible to restore a manual backup to a new cluster. 
{{site.data.alerts.end}}

## Rotation of a CMEK key

{% include cockroachcloud/cmek-rotation-types.md %}

To learn more about rotating a CMEK key using the {{ site.data.products.db }} API, visit [Rotate a CMEK key](managing-cmek.html#rotate-a-cmek-key).

## Backup and restore operations on a cluster with CMEK

This section describes how enabling CMEK changes backup and restore operations on a cluster.

Backups in {{ site.data.products.dedicated }} are triggered in two ways, only one of which is affected by CMEK.

- You can perform a manual backup by using the `BACKUP` SQL command to back up database objects in a cluster. To restore from a manual backup, you use the `RESTORE` SQL command. Manual backups are not automatically encrypted, but you can optionally encrypt a manual backup by specifying an encryption key when you run the `BACKUP` command. Enabling CMEK has no impact on manual backups. To learn about encrypting manual backups, see [Take and Restore Encrypted Backups](/docs/stable/take-and-restore-encrypted-backups.html).

- {{ site.data.products.db }} automatically backs up clusters on a set schedule that is not configurable. You can view, manage, or restore from these backups using the {{ site.data.products.db }} Console. Managed backups operate on all databases, tables, views, and scheduled jobs in the cluster. Managed backups can be restored only to the cluster where they were taken. Managed backups are automatically encrypted using data keys that are distinct from those used to encrypt the cluster's data.

  When CMEK is enabled for a cluster, managed backups change in the following ways:

  - You can no longer restore from a managed backup that was taken before CMEK was enabled.
  - The data keys used to encrypt managed backups in {{ site.data.products.db }} are encrypted using the CMEK key before being written to persistent storage.
  - The CMEK key must be available before you can restore from an automatic backup.

## Limitations
The CMEK feature has the following limitations:

- CMEK can be enabled only on clusters created after April 1, 2022 (AWS) or June 9, 2022 (GCP).
- To enable or revoke CMEK on a cluster, you must use the [Cloud API](/docs/cockroachcloud/cloud-api.html). It's not possible to enable CMEK using the {{ site.data.products.db }} Console.
- If you add a new region to a cluster with CMEK enabled, the new region will not be automatically protected by the CMEK key.

## See also

- [Managing Customer-Managed Encryption Keys (CMEK) for {{ site.data.products.dedicated }}](managing-cmek.html)
- [Customer-Managed Encryption Keys (CMEK) Frequently Asked Questions (FAQ)](cmek-faq.html)
- [Encryption At Rest](/docs/{{site.versions["stable"]}}/encryption.html)
