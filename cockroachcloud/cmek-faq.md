---
title: Customer-Managed Encryption Keys (CMEK) Frequently Asked Questions (FAQ)
summary: Frequently Asked Questions (FAQ)concerning Customer-Managed Encryption Keys (CMEK) for CockroachDB Cloud Dedicated
toc: true
docs_area: manage.security
---

This article provides answers to common questions about [Customer-Managed Encryption Keys (CMEK)](cmek.html).

{% include cockroachcloud/cockroachcloud-ask-admin.md %}

## If we don’t enable CMEK for our {{ site.data.products.dedicated }} clusters, are those encrypted in some manner by default?

Yes, the {{ site.data.products.dedicated }} clusters are encrypted by default by the way of encrypting the cloud disks used to store the data, using cloud provider managed keys.

## What steps should I take before enabling CMEK for a cluster?

Contact your Cockroach Labs account team to enroll your organization in limited access for CMEK. CMEK can only be enabled on a private cluster, so your organization must also be enrolled in limited access for private clusters.

## Can we enable CMEK for an existing cluster that wasn't created as a private cluster?

CMEK can be enabled only on a private cluster. Contact your account team for advice about how to migrate or restore your existing cluster's data to a new private cluster.

## If we enable CMEK for a cluster that has been in use for some time, is the existing data encrypted at that time?

{{ site.data.products.dedicated }} does not force encryption of previously-written data but instead relies on normal storage engine churn for desired encryption. That means the new key is used to encrypt newly-written data, while previously-written data remains unencrypted unless it’s rewritten.

## Can we enable CMEK when we add a new region to a cluster?

Yes, when you add a new CMEK-enabled region to a cluster, you must also enable CMEK on its existing regions if it is not already enabled. Refer to [Activate CMEK for your {{ site.data.products.dedicated }} Cluster](/docs/cockroachcloud/managing-cmek.html#step-4-activate-cmek-for-your-cockroachdb-dedicated-cluster) and [Add a Region to a CMEK-enabled Cluster](/docs/cockroachcloud/managing-cmek.html#add-a-region-to-a-cmek-enabled-cluster).

## Is the data encryption key rotated at some set duration or periodically? If yes, is there a way to customize the duration?

Yes, the data encryption key is rotated automatically once every month. It’s not possible to customize that duration. The new key is used to encrypt new writes, while the old data is still encrypted with the old data keys unless it’s rewritten.

## Can we rotate the CMEK for a cluster after a certain time or at some periodic interval?

{% include cockroachcloud/cmek-rotation-types.md %}

To learn more about rotating a CMEK key using the {{ site.data.products.db }} API, visit [Rotate a CMEK key](managing-cmek.html#rotate-a-cmek-key).

## Are {{ site.data.products.dedicated }} managed backups also encrypted using the CMEK?

Yes, the [managed backups](use-managed-service-backups.html) stored in {{ site.data.products.db }} infrastructure are also encrypted using the CMEK, by utilizing CoackroachDB’s backup encryption capability. Internally, a backup data key is wrapped by the CMEK, and then the backup data key is used for encrypting the backup.

See: [Take and Restore Encrypted Backups](../{{site.current_cloud_version}}/take-and-restore-encrypted-backups.html)

## As part of managed backup encryption, is the same backup data key used to encrypt all backups for a cluster?

A different backup data key is used for each full cluster backup, while the same backup data key is used for incremental backups on top of a full cluster backup. In all cases, the backup data key is encrypted with CMEK for a CMEK-enabled cluster.

## How are the store key (Key Encryption Key) and the data key (Data Encryption Key) stored on the cluster?

The store key is only stored as encrypted by the CMEK, while it’s available as decrypted only in memory for the CockroachDB process to use. The data key is stored as encrypted by the store key, along with the data files on cluster disks.

## Can we use {{ site.data.products.db }} Console to enable or revoke CMEK for a cluster?

Not yet. User Interface experience for CMEK would be available at a later time. At this point, the capability is API-only.

## Is it possible to self-serve restore a CMEK-enabled cluster in case of a cluster failure or disaster scenario?

Not yet. To restore a failed CMEK-enabled cluster, please create a support ticket for Cockroach Labs providing your cluster ID and organization ID.
