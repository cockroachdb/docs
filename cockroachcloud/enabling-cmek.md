---
title: Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated
summary: Tutorial for getting a dedicated cluster up and running with Customer Managed Encryption Keys (CMEK)
toc: true
docs_area: manage.security
---

Customer Managed Encryption Keys (CMEK) for {{ site.data.products.dedicated }} allows the customer to delegate responsibility for the work of encrypting their application data to Cockroach Labs, while maintaining the ability to completely revoke Cockroach Labs' access with a single operation.

This page walks the user through the process of enabling Customer Managed Encryption Keys (CMEK) for your {{ site.data.products.dedicated }} cluster.

## Overview of CMEK management procedures

This section gives a high level sketch of the operations involved with implementing CMEK with your CockroachDB cluster.

- [Enabling CMEK](#enabling-cmek) for a {{ site.data.products.dedicated }} requires several steps:
	- Turning on the {{ site.data.products.dedicated }} feature.
	- Provisioning an encryption key with your infrastructure provider's key management service (KMS).
	- Granting {{ site.data.products.db }} access to the CMEK i.e. the key you control.
	- Switching your cluster to use the CMEK.
- [Checking CMEK status](#checking-cmek-status): An API call displays information about your cluster's use of CMEK.
- [Revoking CMEK for a cluster](#revoking-cmek-for-a-cluster): Revoking {{ site.data.products.db }}'s access to the key will immediately prevent all access to your data. Deleting the key will permanently prevent all access to your data.
- [Restoring CMEK following a revokation event](#restoring-cmek-following-a-revocation-event): Restoring service means reauthorizing {{ site.data.products.db }} to use your key and coordinating with our service team.
- [Disabling CMEK to return to {{ site.data.products.db }}-managed encryption](#disabling-cmek): The {{ site.data.products.dedicated }} feature can disabled, allowing your cluster to return to the default state of using encryption keys managed by Cockroach Labs.

### Restoring CMEK following a revokation event

Restoring full operation of your cluster following a revokation event requires renewing access and coordinating with our support team.

### Disabling CMEK to return to {{ site.data.products.db }}-managed encryption


## Enabling CMEK

1. Enable Cloud API and CMEK for your CockroachDB Organization

1. Create a new cluster (only works for new clusters post v22.1? confirm???)

1. In IAAS: Create the IAM user/service account for encrypting decrypting with the key. (is this a cross account IAM role with key privileges, or a cross account IAM role for adopting an IAM role with key privileges, there are two stories here...)

1. In IAAS: Create the key.

1. Enable CMEK for your CockroachDB Cluster

## Checking CMEK status


{% include_cached copy-clipboard.html %}
```shell
GET api/v1/clusters/{CLUSTER_ID}/cmek
```

```txt

```

## Revoking CMEK for a cluster


Revoking access to the CMEK means disabling all encryption/decryption of data in your database, which means preventing reading and writing any data from or to your database. This likely implies a shutdown of your service, with significant business implications. This is a disaster mitigation tactic to be used only in scenario involving a severe, business critical security breach.

This can be done temporarily or permanently. This action is performed at the level of your infrastructure (IaaS).

1. Revoke the cross-account IAM policy that gives Cockroach Labs access to your CMEK.

Eventually, you'll resolve the security incident and re-authorize CMEK for your cluster to return to normal operations.

## Restoring CMEK following a revokation event

Create a new IAM role, renew the permissions on the old role...

## Disabling CMEK

It is possible to disable the CMEK feature to return to using {{ site.data.products.db }}-managed encryption.
1. You, the customer, provision a symmetric encryption key in your own organization's infrastructure account, either Google Cloud Platform (GCP) or Amazon Web Services (AWS).

1. You create a service account in your organization that has permission to encrypt and decrypt with that key








## CMEK Frequently asked questions (FAQ)

### If we don’t enable CMEK for our CockroachDB Dedicated clusters, are those encrypted in some manner by default?

Yes, the CockroachDB Dedicated clusters are encrypted by default by the way of encrypting the cloud disks used to store the data, using cloud provider managed keys (unique to each cloud account).

### Is the data encryption key rotated at some set duration or periodically? If yes, is there a way to customize the duration?

Yes, the data encryption key is rotated automatically once every month. It’s not possible to customize that duration. The new key is used to encrypt new writes, while the old data is still encrypted with the old data keys unless it’s rewritten.

### Can we rotate the CMEK for a cluster after a certain time or at some periodic interval?

Not yet. Ability to rotate CMEK would be available at a later time. Once that’s ready, you could do it ad-hoc, or at a periodic interval using your own managed scheduling mechanism.

### If we enable CMEK for a cluster that has been in use for some time, is the existing data encrypted at that time?

CockroachDB Dedicated does not force encryption of the older files but instead relies on normal storage engine churn for desired encryption. That means the new key is used to encrypt new writes, while the old data remains unencrypted unless it’s rewritten.

### Are CockroachDB Cloud managed backups also encrypted using the CMEK?

Yes, the managed backups stored in CockroachDB Cloud infrastructure are also encrypted using the CMEK, by utilizing CoackroachDB’s backup encryption capability. Internally, a backup data key is wrapped by the CMEK, and then the backup data key is used for encrypting the backup.

### As part of managed backup encryption, is the same backup data key used to encrypt all backups for a cluster?

A different backup data key is used for each full cluster backup, while the same backup data key is used for incremental backups on top of a full cluster backup. In all cases, the backup data key is encrypted with CMEK for a CMEK-enabled cluster.

### How are the store key (Key Encryption Key) and the data key (Data Encryption Key) stored on the cluster?

The store key is only stored as encrypted by the CMEK, while it’s available as decrypted only in memory for the CockroachDB process to use. The data key is stored as encrypted by the store key, along with the data files on cluster disks.

### Can we use CockroachDB Cloud Console to enable or revoke CMEK for a cluster?

Not yet. User Interface experience for CMEK would be available at a later time. At this point, the capability is API-only.

### Can we enable CMEK when we add a new region to a cluster?

Not yet. Ability to enable CMEK for the new region addition would be available at a later time.

### Is it possible to self-serve restore a CMEK-enabled cluster in case of a cluster failure or disaster scenario?

Not yet. To restore a failed CMEK-enabled cluster, please create a support ticket for Cockroach Labs providing your cluster id and organization id.




