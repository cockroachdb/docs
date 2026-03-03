---
title: Customer-Managed Encryption Keys (CMEK) Overview
summary: Use cryptographic keys that you manage to protect data at rest in a CockroachDB Advanced cluster.
toc: true
docs_area: manage.security
cloud: true
---

Customer-Managed Encryption Keys (CMEK) allow you to protect data at rest in a CockroachDB {{ site.data.products.advanced }} [private cluster]({% link cockroachcloud/private-clusters.md %}) using a cryptographic key that is entirely within your control, hosted in a supported cloud provider key-management system (KMS). This key is called the _CMEK key_.

You can manage your CMEK keys using one or more of the following services:

- Amazon Web Services (AWS) KMS
- Google Cloud Platform (GCP) KMS
- Microsoft Azure Key Vault

To learn more, visit [Managing Customer-Managed Encryption Keys (CMEK) for CockroachDB {{ site.data.products.advanced }}]({% link cockroachcloud/managing-cmek.md %}).

CockroachDB {{ site.data.products.advanced }} includes support for referring to CMEK keys in [HashiCorp Vault Secrets Manager](https://www.vaultproject.io/docs/secrets/key-management), which can distribute keys stored in multiple KMS systems, as long as the actual keys are stored in AWS KMS, GCP KMS, or Azure Key Vault.

{{site.data.alerts.callout_success}}
You can learn more about the [supported integrations between CockroachDB and HashiCorp Vault]({% link {{site.current_cloud_version}}/hashicorp-integration.md %}).
{{site.data.alerts.end}}

CockroachDB {{ site.data.products.cloud }} communicates with the KMS platform using the KMS platform's API, and you manage CockroachDB {{ site.data.products.cloud }}'s access to the CMEK key using the KMS platform's identity and access management (IAM) system. The CMEK key is never present in a cluster and CockroachDB {{ site.data.products.cloud }} never has direct access to the CMEK key material. When CMEK is enabled, the CMEK key must be available before the cluster can start and the cluster's newly-written data at rest can be accessed.

This article describes how CMEK works in CockroachDB {{ site.data.products.advanced }} clusters. To configure CMEK, see [Manage Customer-Managed Encryption Keys (CMEK) for CockroachDB {{ site.data.products.advanced }}]({% link cockroachcloud/managing-cmek.md %}).

## Benefits of CMEK

This section describes some of the ways that CMEK can help you protect your data and meet business and regulatory requirements, even when you don't own the underlying infrastructure that hosts your data.

- **Enforcement of data retention policies**: To ensure that a cluster's data is permanently inaccessible, you can destroy the CMEK key or keys that protect its data.
    {{site.data.alerts.callout_danger}}
    Keep these points in mind before destroying a CMEK key:

    <ul><li><p>If a CMEK key is destroyed, the cluster's data can't be recovered by you or by CockroachDB {{ site.data.products.cloud }}, even by restoring from a CockroachDB {{ site.data.products.cloud }}-managed backup. After enabling CMEK, do not disable, schedule for destruction, or destroy a CMEK that is in use by clusters. Instead, first rotate the cluster to use a new CMEK or decommission the cluster, and then use your KMS platform's audit logs to verify that the CMEK is no longer being used.</p></li><li><p>To protect against inadvertent data loss, your KMS platform may impose a waiting period before a key is permanently deleted. This waiting period may be configurable when you create the key. Check the documentation for your KMS platform for details about how long before a key deletion is permanent and irreversible.</p></li></ul>
    {{site.data.alerts.end}}
- **Enforcement of data domiciling and locality requirements**: In a multi-region cluster, you can confine an individual database to a single region or multiple regions. For more information and limitations, see [Data Domiciling with CockroachDB]({% link {{site.current_cloud_version}}/data-domiciling.md %}). When you enable CMEK on a multi-region cluster, you can optionally assign a separate CMEK key to each region, or use the same CMEK key for multiple related regions.
- **Enforcement of encryption requirements**: With CMEK, you have control the CMEK key's encryption strength. The CMEK key's size is determined by what your KMS provider supports.

    You can use your KMS platform's controls to configure the regions where the CMEK key is available, enable automatic rotation schedules for CMEK keys, and view audit logs that show each time the CMEK key is used by CockroachDB {{ site.data.products.cloud }}. CockroachDB {{ site.data.products.cloud }} does not need any visibility into these details.
- **Separation of concerns**: With CMEK, you give CockroachDB {{ site.data.products.cloud }} permission to encrypt and decrypt using the CMEK, but Cockroach Labs has no access to the CMEK's key material. The ability to create keys and manage IAM access to them can be delegated to a limited group of trusted individuals, who may be distinct from the organization's cluster admins.
- **Infrastructure flexibility**: If your CMEK keys are stored in multiple KMS systems or tenants, you can use HashiCorp Vault Key Management Secrets Engine to give your cluster access to your CMEK keys, as long as the cluster and keys are stored in the same deployment environment (AWS, GCP, or Azure).

The following example shows some of the ways that CMEK can help you meet business and regulatory requirements.

Imagine that you have a business requirement to verify that a cluster's data is inaccessible when you delete the cluster. Software as a Service (SaaS) makes such requirements more difficult to verifiably meet, because you don't have visibility into what happens to the cluster's resources after the cluster disappears from your view. This sort of requirement might make it more challenging for your organization to move some workloads to SaaS.

CMEK helps you to enforce such business rules on CockroachDB {{ site.data.products.cloud }} clusters. With CMEK, you can actively and verifiably enforce this requirement without waiting for CockroachDB {{ site.data.products.cloud }} to destroy the cluster's resources. Instead, with a single operation you can revoke the cluster's ability to use the CMEK key. This will trigger a cluster restart, and the restart will fail because the CMEK key is unavailable. After verifying that the restart has failed, you can delete the cluster in CockroachDB {{ site.data.products.cloud }}.

## How CMEK works

When you create a CockroachDB {{ site.data.products.advanced }} cluster, its data at rest on cluster disks is not encrypted by default. However, the disks themselves are automatically encrypted by cryptographic keys owned and managed by the cloud provider using keys that are accessible only by the cloud provider.

When you enable CMEK on a CockroachDB {{ site.data.products.advanced }} [private cluster]({% link cockroachcloud/private-clusters.md %}), CockroachDB {{ site.data.products.cloud }} creates two kinds of encryption keys and begins to use them to protect newly-written data at rest. CockroachDB {{ site.data.products.cloud }} manages these encryption keys and propagates them to cluster nodes.

1. The _data key_ is a Data Encryption Key (DEK), and is used to encrypt and decrypt cluster data before it is read from or written to disks attached to a cluster's nodes. Each time the cluster is started or restarted, and each time a node and related disks are added to a cluster, CockroachDB {{ site.data.products.advanced }} uses the store key to encrypt and decrypt data keys. Each cluster node maintains its own list of data keys. The data key is automatically rotated monthly and is always encrypted at rest by the store key.

1. The _store key_ is a Key Encryption Key (KEK) that encrypts the data keys at rest. It is encrypted at rest by the CMEK key before being propagated to cluster nodes, and is decrypted in memory on each node when the cluster starts. The CMEK must be available for the cluster to be able to read the store key. The store key is not automatically rotated.

For more details about encryption in CockroachDB {{ site.data.products.cloud }}, see [Encryption At Rest]({% link {{site.current_cloud_version}}/encryption.md %}).

Enabling CMEK has no impact on a cluster's existing data. For that reason, it is recommended to enable CMEK before creating databases or inserting data.

{{site.data.alerts.callout_success}}
CMEK is configured per cluster region. A single-region cluster is actually a multi-region cluster with only a single region. The following steps occur for each of a cluster's regions.
{{site.data.alerts.end}}

At the time that you enable CMEK for a cluster, CockroachDB {{ site.data.products.cloud }}:

1. Encrypts the store key using the CMEK.
1. Rotates the data key to encrypt it using the encrypted store key.
1. Propagates the CMEK-encrypted store key and data key to cluster nodes.
1. Starts the cluster.

Going forward:

1. The cluster can start only when the CMEK key is available to decrypt the store key. If the CMEK key becomes unavailable or you revoke the cluster's access to the key, the cluster can't start until access is restored.
1. Each time the store key is rotated, the new key is also encrypted using the CMEK key.
1. Each time the data key is rotated, the new key is encrypted using the encrypted store key.
1. Each time a node writes new data to disk, it is encrypted using the current data key. Data is read using the data key that was used to encrypt it.

{{site.data.alerts.callout_danger}}
If a CMEK key is disabled, scheduled for destruction, or destroyed:

- Nodes that were using the CMEK will not be able to rejoin the cluster if they are restarted. This could lead to regional cluster unavailability. Even if the CMEK is subsequently restored after being disabled or scheduled for destruction, nodes will not automatically recover. If you encounter issues, contact [support](https://support.cockroachlabs.com/).
- A cluster's managed backups will begin to fail.
- The cluster's data can't be recovered or restored from a managed backup in CockroachDB {{ site.data.products.cloud }} or from a manual backup to the same cluster. It may be possible to restore a manual backup to a new cluster, if the backup was not encrypted with the CMEK. However, it may not be possible to take a manual backup if some nodes are already offline due to the CMEK's unavailability.
{{site.data.alerts.end}}

## Rotation of a CMEK key

{% include cockroachcloud/cmek-rotation-types.md %}

To learn more about rotating a CMEK key in CockroachDB {{ site.data.products.cloud }}, read [Rotate a CMEK key]({% link cockroachcloud/managing-cmek.md %}#rotate-a-cmek-key).

## Backup and restore operations on a cluster with CMEK

This section describes how enabling CMEK changes backup and restore operations on a cluster.

Backups in CockroachDB {{ site.data.products.advanced }} are triggered in two ways, only one of which is affected by CMEK.

- You can perform a manual backup by using the `BACKUP` SQL command to back up database objects in a cluster. To restore from a manual backup, you use the `RESTORE` SQL command. Manual backups are not automatically encrypted, but you can optionally encrypt a manual backup by specifying an encryption key when you run the `BACKUP` command. Enabling CMEK has no impact on manual backups. To learn about encrypting manual backups, refer to [Take and Restore Encrypted Backups]({% link {{ site.current_cloud_version }}/take-and-restore-encrypted-backups.md %}).

- CockroachDB {{ site.data.products.cloud }} automatically backs up {{ site.data.products.advanced }} and {{ site.data.products.standard }} clusters on a configurable schedule. You can view, manage, or restore from these backups using the CockroachDB {{ site.data.products.cloud }} Console. Managed backups operate on all databases, tables, views, and scheduled jobs in the cluster. Managed backups are automatically encrypted using data keys that are distinct from those used to encrypt the cluster's data.

  When CMEK is enabled for a cluster, **managed backups** change in the following ways:

  - You can no longer restore from a managed backup that was taken before CMEK was enabled.
  - The data keys used to encrypt managed backups for the cluster are encrypted using the CMEK key before being written to persistent storage in CockroachDB {{ site.data.products.cloud }}. If the CMEK is not available, managed backups will fail to run.
  - The CMEK that was used to encrypt a managed backup must be available to restore that backup.

## FAQs

This section provides answers to frequently-asked questions (FAQs) about CMEK.

#### If we don’t enable CMEK for our CockroachDB {{ site.data.products.advanced }} clusters, are those encrypted in some manner by default?

Yes, CockroachDB {{ site.data.products.advanced }} cluster disks are encrypted by default using keys managed by each cloud provider.

#### What steps should I take before enabling CMEK for a cluster?

CMEK can be enabled only on a private cluster on CockroachDB {{ site.data.products.advanced }} with advanced security features enabled. Advanced security features can be enabled only when the cluster is created. Refer to [Private Clusters]({% link cockroachcloud/private-clusters.md %}) and [Enable advanced security features]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-6-configure-advanced-security-features).

#### Can we enable CMEK for an existing cluster that wasn't created as a private cluster?

An existing cluster cannot be migrated to a private cluster. Instead, create a new CockroachDB {{ site.data.products.advanced }} cluster with advanced security features enabled, manually back up the cluster data to a secure location, then manually import the data to the new cluster. Refer to [Enable advanced security features]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-6-configure-advanced-security-features).

If backing up and restoring to a new cluster is not feasible, contact your account team for advice about how to migrate or restore your existing cluster's data.

#### Can we enable CMEK for a new region when it's added to a CMEK-enabled cluster?

Yes, when you add a new region to a CMEK-enabled cluster, you must enable CMEK for that region. Refer to [Add a Region to a CMEK-enabled Cluster]({% link cockroachcloud/managing-cmek.md %}#add-a-region-to-a-cmek-enabled-cluster).

#### Is the data encryption key rotated at some set duration or periodically? If yes, is there a way to customize the duration?

Yes, the data encryption key is rotated automatically once every month. It’s not possible to customize that duration. The new key is used to encrypt new writes, while the old data is still encrypted with the old data keys unless it’s rewritten.

#### Can we rotate the CMEK for a cluster after a certain time or at some periodic interval?

{% include cockroachcloud/cmek-rotation-types.md %}

To learn more about rotating a CMEK key in CockroachDB {{ site.data.products.cloud }}, read [Rotate a CMEK key]({% link cockroachcloud/managing-cmek.md %}#rotate-a-cmek-key).

#### Are CockroachDB {{ site.data.products.advanced }} managed backups also encrypted using the CMEK?

Yes, the [managed backups]({% link cockroachcloud/managed-backups.md %}) stored in CockroachDB {{ site.data.products.cloud }} infrastructure are also encrypted using the CMEK, using CoackroachDB’s [encrypted backup]({% link {{site.current_cloud_version}}/take-and-restore-encrypted-backups.md %}) capability. Internally, a backup data key is wrapped by the CMEK, and then the backup data key is used for encrypting the backup.

#### As part of managed backup encryption, is the same backup data key used to encrypt all backups for a cluster?

A different backup data key is used for each full cluster backup, while the same backup data key is used for incremental backups on top of a full cluster backup. In all cases, the backup data key is encrypted with CMEK for a CMEK-enabled cluster.

#### How are the store key (Key Encryption Key) and the data key (Data Encryption Key) stored on the cluster?

The store key is only stored as encrypted by the CMEK, while it’s available as decrypted only in memory for the CockroachDB process to use. The data key is stored as encrypted by the store key, along with the data files on cluster disks.

#### Can we use the CockroachDB {{ site.data.products.cloud }} Console to enable or revoke a CMEK for a cluster?

Yes. You can use the CockroachDB {{ site.data.products.cloud }} Console, the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}), or the [CockroachDB Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach/latest). The Console UI is available in [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}#features-in-preview) and you can request to have the UI enabled for your {{ site.data.products.cloud }} organization.

#### Is it possible to self-serve restore a CMEK-enabled cluster in case of a cluster failure or disaster scenario?

Not yet. To restore a failed CMEK-enabled cluster, please create a support ticket for Cockroach Labs providing your cluster ID and organization ID.

## Limitations

CMEK has the following limitations:

- If you add a new region to a cluster with CMEK enabled, you must configure a CMEK for the new region to protect its data.
- If the CMEK is not available due to a misconfiguration or a KMS outage, a cluster's managed backups will begin to fail, but no customer notification is sent from CockroachDB {{ site.data.products.cloud }} via email. However, Cockroach Labs support is notified if such a failure occurs.

## See also

- [Managing Customer-Managed Encryption Keys (CMEK) for CockroachDB {{ site.data.products.advanced }}]({% link cockroachcloud/managing-cmek.md %})
- [Create Private Clusters]({% link cockroachcloud/private-clusters.md %})
- [Encryption At Rest]({% link {{site.current_cloud_version}}/encryption.md %})
