---
title: Managing Customer Managed Encryption Keys (CMEK) for Cockroach Dedicated
summary: Tutorial for getting a dedicated cluster up and running with Customer Managed Encryption Keys (CMEK)
toc: true
docs_area: manage.security
---

Customer Managed Encryption Keys (CMEK) for {{ site.data.products.dedicated }} allows the customer to delegate responsibility for the work of encrypting their application data to Cockroach Labs, while maintaining the ability to completely revoke Cockroach Labs' access with a single operation.

This page walks the user through the process of enabling Customer Managed Encryption Keys (CMEK) for your {{ site.data.products.dedicated }} cluster.

See also:

- [Customer Managed Encryption Key (CMEK) frequently asked questions (FAQ)](cmek-faq.html)
- [Encryption at Rest (enterprise)](../{{site.versions["stable"]}}/security-reference/encryption.html#encryption-at-rest-enterprise)

## Overview of CMEK management procedures

This section gives a high level sketch of the operations involved with implementing CMEK with your CockroachDB cluster.

### Enabling CMEK

[To enable CMEK](#enable-cmek) for a {{ site.data.products.dedicated }} requires several steps:

- Turning on the {{ site.data.products.dedicated }} feature.
- Provisioning an encryption key with your infrastructure provider's key management service (KMS).
- Granting {{ site.data.products.db }} access to the CMEK i.e. the key you control.
- Switching your cluster to use the CMEK.

### Checking CMEK status

An API call displays information about your cluster's use of CMEK: [Check CMEK status](#check-cmek-status)

### Revoking CMEK for a cluster

[Revoke CMEK for a cluster](#revoking-cmek-for-a-cluster) by revoking {{ site.data.products.db }}'s access to your key at the IAM level with your infrastructure provider. This will immediately prevent all access to your data, but can be reversed by reauthorizing access to the key.

Deleting the key will permanently prevent decryption of your data, preventing all possible access and rendering the database unusable and data inaccessible.

### Restoring CMEK following a revokation event 

[Restore CMEK following a revokation event](#step-3a-restore-cmek-following-a-revokation-event) by reauthorizing {{ site.data.products.db }} to use your key, and coordinating with our service team to assist in recovering your Organization.

### Disabling CMEK

[Disabling CMEK to return to {{ site.data.products.db }}-managed encryption](#step-3b-disable-cmek): The {{ site.data.products.dedicated }} feature can disabled, allowing your cluster to return to the default state of using encryption keys managed by Cockroach Labs.


## Enable CMEK

### Step 1. Prepare your {{ site.data.products.dedicated }} Organization

To start the process, contact Cockroach Labs by reaching out to your account team, or [creating a support ticket](https://support.cockroachlabs.com/). You must provide your **Organization ID**, which you can find in your [Organization settings page](https://cockroachlabs.cloud/settings).

They will enable Cloud API and CMEK for your {{ site.data.products.dedicated }} Organization.

{{site.data.alerts.callout_info}}
The upgrade process will generate a new Organization ID.
{{site.data.alerts.end}}

### Step 2. Provision your cluster

Create a new {{ site.data.products.dedicated }} cluster from the {{ site.data.products.db }} console [clusters page](https://cockroachlabs.cloud/cluster), or by [using the Cloud API](cloud-api.html#create-a-new-cluster).

### Step 3. Provision IAM and KMS in your IaaS

In IAAS: Create the IAM user/service account for encrypting decrypting with the key. (is this a cross account IAM role with key privileges, or a cross account IAM role for adopting an IAM role with key privileges, there are two stories here...)

- [Provisioning KMS for CMEK in AWS](cmek-ops-aws.html)
- [Provisioning KMS for CMEK in GCP](TBD???) 

### Step 4. Enable CMEK for your CockroachDB Cluster




## Check CMEK status

{% include_cached copy-clipboard.html %}
```shell
GET api/v1/clusters/{CLUSTER_ID}/cmek
```

```txt

```

## Revoking CMEK for a cluster

Revoking access to the CMEK means disabling all encryption/decryption of data in your database, which means preventing reading and writing any data from or to your database. This likely implies a shutdown of your service, with significant business implications. This is a disaster mitigation tactic to be used only in scenario involving a severe, business critical security breach.

This can be done temporarily or permanently. This action is performed at the level of your infrastructure (IaaS).

### Step 1. Revoke IAM access

Revoke the cross-account IAM policy that gives Cockroach Labs access to your CMEK.

### Step 2. Assess and resolve the situation

Eventually, you'll resolve the security incident and re-authorize CMEK for your cluster to return to normal operations.

### Step 3a. Restore CMEK following a revokation event

Create a new IAM role, renew the permissions on the old role...

### Step 3b. Disable CMEK

It is possible to disable the CMEK feature to return to using {{ site.data.products.db }}-managed encryption.
1. You, the customer, provision a symmetric encryption key in your own organization's infrastructure account, either Google Cloud Platform (GCP) or Amazon Web Services (AWS).

1. You create a service account in your organization that has permission to encrypt and decrypt with that key