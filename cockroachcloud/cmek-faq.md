---
title: Customer-Managed Encryption Keys (CMEK) Frequently Asked Questions (FAQ)
summary: Frequently Asked Questions (FAQ)concerning Customer-Managed Encryption Keys (CMEK) for CockroachDB Cloud Dedicated
toc: true
docs_area: manage.security
---

## If we don’t enable CMEK for our CockroachDB Dedicated clusters, are those encrypted in some manner by default?

Yes, the {{ site.data.products.dedicated }} clusters are encrypted by default by the way of encrypting the cloud disks used to store the data, using cloud provider managed keys (unique to each cloud account).

## Is the data encryption key rotated at some set duration or periodically? If yes, is there a way to customize the duration?

Yes, the data encryption key is rotated automatically once every month. It’s not possible to customize that duration. The new key is used to encrypt new writes, while the previous data is still encrypted with the previous data keys unless it’s rewritten.

## Can we rotate the CMEK for a cluster after a certain time or at some periodic interval?

Not yet. Ability to rotate CMEK would be available at a later time. Once that’s ready, you could do it ad-hoc, or at a periodic interval using your own managed scheduling mechanism.

## If we enable CMEK for a cluster that has been in use for some time, is the existing data encrypted at that time?

{{ site.data.products.dedicated }} does not force encryption of the previous files but instead relies on normal storage engine churn for desired encryption. That means the new key is used to encrypt new writes, while the previous data remains unencrypted unless it’s rewritten.

## Are CockroachDB Cloud managed backups also encrypted using the CMEK?

Yes, the managed backups stored in CockroachDB Cloud infrastructure are also encrypted using the CMEK, by utilizing CoackroachDB’s backup encryption capability. Internally, a backup data key is wrapped by the CMEK, and then the backup data key is used for encrypting the backup.

## As part of managed backup encryption, is the same backup data key used to encrypt all backups for a cluster?

A different backup data key is used for each full cluster backup, while the same backup data key is used for incremental backups on top of a full cluster backup. In all cases, the backup data key is encrypted with CMEK for a CMEK-enabled cluster.

## How are the store key (Key Encryption Key) and the data key (Data Encryption Key) stored on the cluster?

The store key is only stored as encrypted by the CMEK, while it’s available as decrypted only in memory for the CockroachDB process to use. The data key is stored as encrypted by the store key, along with the data files on cluster disks.

## Can we use CockroachDB Cloud Console to enable or revoke CMEK for a cluster?

Not yet. User Interface experience for CMEK would be available at a later time. At this point, the capability is API-only.

## Can we enable CMEK when we add a new region to a cluster?

Not yet. Ability to enable CMEK for the new region addition would be available at a later time.

## Is it possible to self-serve restore a CMEK-enabled cluster in case of a cluster failure or disaster scenario?

Not yet. To restore a failed CMEK-enabled cluster, please create a support ticket for Cockroach Labs providing your cluster id and organization id.
