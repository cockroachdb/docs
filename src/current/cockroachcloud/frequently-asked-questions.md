---
title: CockroachDB Cloud FAQs
summary: Get answers to frequently asked questions about CockroachDB Cloud
toc: true
docs_area: get_started
---

This page answers the frequently asked questions about CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}.

{% include cockroachcloud/filter-tabs/cloud-faqs.md %}

## General

### In what clouds and regions is CockroachDB {{ site.data.products.cloud }} available?

Refer to [CockroachDB {{ site.data.products.cloud }} Regions]({% link cockroachcloud/regions.md %}) for the regions where CockroachDB {{ site.data.products.dedicated }} and {{ site.data.products.serverless-plan }} clusters can be deployed. To express interest in additional regions, [contact Support](https://support.cockroachlabs.com) or your Cockroach Labs account team.

### What is CockroachDB {{ site.data.products.dedicated }}?

CockroachDB {{ site.data.products.dedicated }} provides fully-managed, single-tenant CockroachDB clusters with no shared resources. CockroachDB {{ site.data.products.dedicated }} supports single and multi-region clusters in AWS and GCP.

### What is the difference between CockroachDB {{ site.data.products.dedicated }} standard and advanced?

CockroachDB {{ site.data.products.dedicated }} advanced clusters have access to features required for [PCI readiness]({% link cockroachcloud/pci-dss.md %}) in addition to all CockroachDB {{ site.data.products.dedicated }} standard features. You must be a contract customer to create a CockroachDB {{ site.data.products.dedicated }} advanced cluster. For more information, [contact us](https://www.cockroachlabs.com/contact-sales/).

### How do CockroachDB {{ site.data.products.dedicated }} free trials work?

CockroachDB {{ site.data.products.dedicated }} offers a 30-day free trial. Free trials require a credit card so we can validate that you are not a bot and provide a seamless transition into production. Free trials apply when you:

- Create the first cluster in your organization
- Select 9 or fewer nodes (we recommend starting with 3 so you can try scaling)
- Select up to 4 vCPUs of compute and 150 GiB of storage (the trial code will not apply to larger clusters)
- Select a single region or 3 regions
- Don't remove the pre-applied trial code at check out

Once the 30-day period is over, your cluster can be scaled beyond the trial period hardware limitations. You can create other paid clusters at any time. If Cockroach Labs has provided you with additional codes, you can use those on applicable clusters. For extended trial options, [contact us](https://www.cockroachlabs.com/contact-sales/).

### How do I connect to my cluster?

To connect to a cluster, you need to authorize your network, create a SQL user, download the CA certificate, and then generate a connection string or parameters. You can use this information to connect to your cluster through the CockroachDB SQL client or a PostgreSQL-compatible driver or ORM. For more details, see [Connect to Your CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %}).

## Security

### Is my cluster secure?

Yes. We create individual sub-accounts and VPCs for each cluster within the cloud provider. These VPCs are firewalled from each other and any other outside connection, unless allowlisted for SQL and Web UI ports.

The allowlist is comprised of IP addresses that you provide to us, and is an additional layer of protection for your cluster. Connections will only be accepted if they come from an allowlisted IP address, which protects against both compromised passwords and any potential bugs in the server.

We use separate certificate authorities for each cluster, and all connections to the cluster over the internet use TLS 1.2 or 1.3.

{% include common/tls-bad-cipher-warning.md %}

See the [Security Overview page](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/security-reference/security-overview) for more information, and for comparison of security options by CockroachDB product.

### Is encryption-at-rest enabled on CockroachDB {{ site.data.products.dedicated }}?

All data on CockroachDB {{ site.data.products.cloud }} is encrypted at rest by the cloud provider where your cluster is deployed. Refer to [persistent disk encryption](https://cloud.google.com/compute/docs/disks#pd_encryption) for GCP, [EBS encryption-at-rest](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html) for AWS, and [Azure disk encryption](https://learn.microsoft.com/azure/virtual-machines/disk-encryption) for Azure. With CockroachDB {{ site.data.products.dedicated }} advanced, [Customer Managed Encryption Keys (CMEK)](cmek.html) allows you to optionally protect cluster data at rest with cryptographic keys that are entirely within your control.

All data in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }} is encrypted at rest by the cloud provider where your cluster is deployed.

{{site.data.alerts.callout_info}}
CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }} users delegate responsibility for encryption-at-rest to the cloud provider. CockroachDB's proprietary storage-layer encryption-at-rest functionality is currently only available with an Enterprise license and is not currently available to users of CockroachDB {{ site.data.products.serverless }} or CockroachDB {{ site.data.products.dedicated }}.

As a result, encryption will appear to be disabled in the [DB Console](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-overview), since the console is unaware of cloud provider encryption.
{{site.data.alerts.end}}

See the [Security Overview page](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/security-reference/security-overview) for more information, and for comparison of security options by CockroachDB product.

### Is my cluster isolated? Does it share resources with any other clusters?

CockroachDB {{ site.data.products.dedicated }} is a single-tenant offering and resources are not shared among clusters.

### Who has access to my cluster data?

The Cockroach Labs SRE team has direct access to CockroachDB {{ site.data.products.cloud }} cluster data. They adhere to the confidentiality agreement described in our [Terms and Conditions](https://www.cockroachlabs.com/cloud-terms-and-conditions/).

## Cluster maintenance

### How do I change the configurations on my cluster?

You can [change your cluster's compute]({% link cockroachcloud/cluster-management.md %}#change-compute-for-a-cluster), [add and remove nodes]({% link cockroachcloud/cluster-management.md %}#add-or-remove-nodes-from-a-cluster), and [increase storage]({% link cockroachcloud/cluster-management.md %}#increase-storage-for-a-cluster) using the CockroachDB {{ site.data.products.cloud }} Console, the [Cloud API]({% link cockroachcloud/cloud-api.md %}), or [Terraform](provision-a-cluster-with-terraform.html). Due to cloud provider limitations, storage space cannot be removed from a node once added.

### How do I add nodes?

You can add nodes by accessing the **Clusters** page on the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud/) and clicking the **...** button for the cluster you want to add or delete nodes for. See [Cluster Management](cluster-management.html?filters=dedicated#add-or-remove-nodes-from-a-cluster) for more details..

{% include cockroachcloud/nodes-limitation.md %}

### Do you auto-scale?

We do not automatically scale nodes based on your capacity usage. To add or remove nodes, see [Cluster Management](cluster-management.html?filters=dedicated#add-or-remove-nodes-from-a-cluster).

### Who is responsible for backup?

Taking regular backups of your data is an operational best practice. Both a) frequently and securely backing up your data, and b) maintaining readiness to quickly restore from saved backups, are essential to resilience and [disaster recovery](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/disaster-recovery).

CockroachDB {{ site.data.products.cloud }} automatically runs full backups daily and incremental backups hourly for every CockroachDB {{ site.data.products.dedicated }} cluster. By default, full backups are retained for 30 days and incremental backups for 7 days. However, there are some cases where you will no longer be able to restore the managed backups even within the retainment window:

- Manually deleting the managed backup schedule.
- Enabling CMEK for a CockroachDB {{ site.data.products.dedicated }} cluster. Refer to [Backup and restore operations on a cluster with CMEK]({% link cockroachcloud/cmek.md %}#backup-and-restore-operations-on-a-cluster-with-cmek).

Once a cluster is deleted, Cockroach Labs retains the full backups for 30 days and incremental backups for 7 days. The retained backups are not available for restore using the Cloud Console. To restore a backup from a deleted cluster, you must contact the [Cockroach Labs Support team](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/support-resources). If an organization is deleted, you will lose access to all of the managed-service backups that Cockroach Labs has taken of the cluster.

In addition to these managed backups, you can also take manual backups and store them in your cloud storage buckets using the [`BACKUP`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup) statement.

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

Learn more:

- Refer to [Use Managed-Service Backups](use-managed-service-backups.html?filters=dedicated) to learn how to restore data from CockroachDB {{ site.data.products.cloud }}'s automatic backups in the Console.

- Refer to [Take and Restore Customer-Owned Backups on CockroachDB Cloud]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) for more information about using customer-managed backups.

- Refer to [Disaster Recovery](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/disaster-recovery) for information about more holistically maintaining a capacity to recover from potential disruptions.

- [Contact support](https://support.cockroachlabs.com).

#### Cloud provider considerations

The backups for AWS clusters are encrypted using [AWS S3’s server-side encryption](https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html) and the backups for GCP clusters are encrypted using [Google-managed server-side encryption keys](https://cloud.google.com/storage/docs/encryption/default-keys).

### Can I download the backups that CockroachDB {{ site.data.products.cloud }} takes for me?

CockroachDB {{ site.data.products.cloud }} automated backups cannot be downloaded, but you can manually [run a backup]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) to your own [storage location](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup#backup-file-urls) at any time. To do this, you will need either `admin` or `SELECT` privileges on the data you are backing up.

### Can I restore my self-hosted CockroachDB cluster to CockroachDB {{ site.data.products.dedicated }}?

Yes. You can [backup](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup) your self-hosted CockroachDB databases to an [external location](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup#backup-file-urls) and then [restore](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/restore) to your CockroachDB {{ site.data.products.cloud }} cluster.

{{site.data.alerts.callout_danger}}
If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter.
{{site.data.alerts.end}}

### Can I set up VPC peering or AWS PrivateLink after my cluster is created?

AWS clusters can set up a [PrivateLink connection]({% link cockroachcloud/network-authorization.md %}#aws-privatelink) at any time after the cluster is created.

GCP clusters can also set up VPC peering after the cluster is created, but you will be locked into our default IP range (`172.28.0.0/14`) unless you configure a different IP range during cluster creation. You can use the default IP range for VPC peering as long as it doesn't overlap with the IP ranges in your network. For more information, see [VPC peering]({% link cockroachcloud/network-authorization.md %}#vpc-peering).

Azure Private Link is not yet available for [CockroachDB {{ site.data.products.dedicated }} on Azure]({% link cockroachcloud/cockroachdb-dedicated-on-azure.md %}).

## Product features

### Are enterprise features available to me?

Yes, CockroachDB {{ site.data.products.dedicated }} clusters run the enterprise version of CockroachDB and all [enterprise features](https://www.cockroachlabs.com/docs/stable/enterprise-licensing) are available to you.

### Is there a public API for CockroachDB {{ site.data.products.cloud }}?

Yes, see the [Cloud API]({% link cockroachcloud/cloud-api.md %}) page for more information. We’re always looking for design partners and customer input for our features, so please [contact us](https://support.cockroachlabs.com/hc/en-us) if you have specific API requirements.

### Do you have a UI? How can I see details?

All customers of our CockroachDB {{ site.data.products.dedicated }} service can view and manage their clusters in the [Console](https://cockroachlabs.cloud/).

### What latency should I expect when making a call to CockroachDB {{ site.data.products.dedicated }}?

Response times are under 10ms for public access but typically much lower. Additionally, using [VPC peering]({% link cockroachcloud/network-authorization.md %}#vpc-peering) or [AWS PrivateLink]({% link cockroachcloud/network-authorization.md %}#aws-privatelink) will reduce latency.

## Support

### Where can I find the Support Policy and Service Level Agreement (SLA) for CockroachDB {{ site.data.products.dedicated }}?

The following pages can be found in our [Terms & Conditions](https://www.cockroachlabs.com/cloud-terms-and-conditions/):

- [CockroachDB {{ site.data.products.cloud }} Support Policy](https://www.cockroachlabs.com/cloud-terms-and-conditions/cockroach-support-policy/)
- [CockroachDB {{ site.data.products.cloud }} SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions/cockroachcloud-technical-service-level-agreement/)

For a detailed comparison of CockroachDB's SLA versus the major Cloud Service Provider databases, watch the following video:

{% include_cached youtube.html video_id="NXAsCinvgM0" %}

### Am I in control of upgrades for my CockroachDB {{ site.data.products.dedicated }} clusters?

Yes, an [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can apply major release upgrades directly [through the CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/upgrade-to-v23.2.md %}); however, patch version upgrades are automatically applied to all clusters. CockroachDB {{ site.data.products.dedicated }} clusters are restarted one node at a time for patch version upgrades, so previously established connections will need to be [reestablished after the restart](https://www.cockroachlabs.com/docs/v21.2/connection-pooling#validating-connections-in-a-pool). For more information, see the [CockroachDB Cloud Upgrade Policy](upgrade-policy.html).

### What is the support policy for older versions of the software?

CockroachDB {{ site.data.products.dedicated }} supports the latest major version of CockroachDB and the version immediately preceding it. We highly recommend running one of the two latest versions of CockroachDB, but we will never force a major upgrade to a cluster without your knowledge. You can contact [Support](https://support.cockroachlabs.com/hc/en-us) if you require an exception.

### How do I check to see if CockroachDB {{ site.data.products.cloud }} is down?

The [**CockroachDB {{ site.data.products.cloud }} Status** page](https://status.cockroachlabs.cloud) is a publicly available page that displays the current uptime status of the following services:

- [**CockroachDB {{ site.data.products.cloud }} Console**](https://cockroachlabs.cloud/clusters): The UI used for signing up for CockroachDB {{ site.data.products.cloud }}, cluster creation and management, and user management.
- **AWS**: The status reported here reflects the health of existing AWS CockroachDB {{ site.data.products.cloud }} clusters and the ability to provision new clusters in AWS.
- **GCP**: The status reported here reflects the health of existing GCP CockroachDB {{ site.data.products.cloud }} clusters and the ability to provision new clusters in GCP.

## Cluster troubleshooting

### What do I do if my queries are too slow?

To optimize schema design to achieve your performance goals, we recommend working with our Sales Engineering team before you set up your cluster. You can also read our [SQL Performance Best Practices](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/performance-best-practices-overview) and [Query Performance Optimization](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/make-queries-fast) docs for more information.

### Can I monitor my cluster with third-party tools?

Yes, CockroachDB {{ site.data.products.dedicated }} clusters support an integration with Datadog that enables data collection and alerting on a subset of CockroachDB metrics. Enabling the Datadog integration on your CockroachDB {{ site.data.products.dedicated }} cluster will apply additional charges to your **Datadog** bill. See [Monitor with Datadog]({% link cockroachcloud/tools-page.md %}#monitor-cockroachdb-dedicated-with-datadog) for more information.

If you need additional help, contact [Support](https://support.cockroachlabs.com/hc/en-us).
