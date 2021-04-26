---
title: Frequently Asked Questions
summary: Get answers to frequently asked questions about CockroachCloud
toc: true
redirect_from:
- ../v20.2/cockroachcloud-frequently-asked-questions.html
---

This page answers the frequently asked questions about the paid version of CockroachCloud. For answers to frequently asked questions about the CockroachCloud Free (beta), see [CockroachCloud Free (beta) FAQs](free-faqs.html).

## Cluster basics

### Why can't I use certain regions in AWS and  GCP?

We run CockroachCloud in EKS and GKE - the managed Kubernetes offerings for AWS and GCP respectively - and support all regions that the offerings are available in. If a particular region is not available on the CockroachCloud Console, that is due to the cloud provider not supporting the managed Kubernetes offering in that region. See
[list of EKS regions](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/) and [list of GKE regions](https://cloud.google.com/about/locations/) for details.

**Known issue:** In addition to the non-GKE regions, we had to temporarily disable the following 4 GCP regions due to technical limitations that we are actively trying to resolve:

- `asia-northeast2`
- `europe-north1`
- `europe-west3`
- `europe-west6`

### How do CockroachCloud free trials work?

CockroachCloud offers a 30-day free trial. Free trials require a credit card so we can validate that you are not a bot and provide a seamless transition into production. Free trials apply when you:

- Create the first cluster in your organization
- Select 4 or fewer nodes (we recommend starting with 3 so you can try scaling)
- Don't remove the pre-applied trial code at check out

Once the 30-day period is over, your trial cluster can be scaled beyond 4 nodes. You can create other paid clusters at any time. If Cockroach Labs has provided you with additional codes, you can use those on applicable clusters. For extended trial options, [contact us](https://www.cockroachlabs.com/contact-sales/).

### How do I connect to my cluster?

To connect to a cluster, you need to authorize your network, create a SQL user, download the CA certificate, and then generate a connection string or parameters. You can use this information to connect to your cluster through the CockroachDB SQL client or a Postgres-compatible driver or ORM. For more details, see [Connect to Your CockroachCloud Cluster](connect-to-your-cluster.html).

## Security

### Is my cluster secure?

Yes. We create individual sub-accounts and VPCs for each cluster within the cloud provider. These VPCs are firewalled from each other and any other outside connection, unless allowlisted for SQL and Web UI ports.

The allowlist is comprised of IP addresses that you provide to us, and is an additional layer of protection for your cluster. Connections will only be accepted if they come from an allowlisted IP address, which protects against both compromised passwords and any potential bugs in the server.

We use separate certificate authorities for each cluster, and all connections to the cluster over the internet use TLS 1.2.

### Is encryption-at-rest enabled on CockroachCloud?

Yes. All data on CockroachCloud is encrypted-at-rest using the tools provided by the cloud provider that your cluster is running in.

Because we are relying on the cloud provider's encryption implementation, we do not enable CockroachDB's [internal implementation of encryption-at-rest](../{{site.versions["stable"]}}/encryption.html#encryption-at-rest-enterprise). This means that encryption will appear to be disabled in the [DB Console](../{{site.versions["stable"]}}/ui-overview.html), since it is unaware of cloud provider encryption. For more information, see the [Security Overview](security-overview.html).

### Is my cluster isolated? Does it share resources with any other clusters?

CockroachCloud is a single-tenant offering and resources are not shared between clusters.

### Who has access to my cluster data?

The Cockroach Labs SRE team has direct access to CockroachCloud cluster data. They adhere to the confidentiality agreement described in our [Terms and Conditions](https://www.cockroachlabs.com/cloud-terms-and-conditions).

## Cluster maintenance

### How do I change the configurations on my cluster?

Contact [Support](https://support.cockroachlabs.com/hc/en-us) to change your cluster configuration.

### How do I add nodes?

You can add nodes by accessing the **Clusters** page on the [CockroachCloud Console](https://cockroachlabs.cloud/) and clicking the **...** button for the cluster you want to add or delete nodes for. See [Cluster Mangement](cluster-management.html?filters=dedicated#add-or-remove-nodes-from-a-cluster) for more details.

### Do you auto-scale?

Today, we do not automatically scale nodes based on your capacity usage. To add nodes, please contact [Support](https://support.cockroachlabs.com/hc/en-us). There are plans to allow auto-scaling in the future.

### Who is responsible for backup?

Cockroach Labs runs full backups daily and incremental backups hourly for every CockroachCloud cluster. The full backups are retained for 30 days and incremental backups for 7 days.

The backups for AWS clusters are encrypted using [AWS S3’s server-side encryption](https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html) and the backups for GCP clusters are encrypted using [Google-managed server-side encryption keys](https://cloud.google.com/storage/docs/encryption/default-keys).

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

You can also [backup and restore](backups-page.html#back-up-and-restore-data-manually) data on your own. If you need additional help, [contact us](https://support.cockroachlabs.com).

### Can I download the backups that CockroachCloud takes for me?

CockroachCloud automated backups cannot be downloaded, but you can manually [run a backup](backups-page.html#back-up-and-restore-data-manually) to your own [storage location](../{{site.versions["stable"]}}/backup.html#backup-file-urls) at any time. To do this, you will need either `admin` or `SELECT` privileges on the data you are backing up.

### Can I restore my self-hosted CockroachDB cluster to CockroachCloud?

Yes. You can [backup](../{{site.versions["stable"]}}/backup.html) your self-hosted CockroachDB databases to an [external location](../{{site.versions["stable"]}}/backup.html#backup-file-urls) and then [restore](../{{site.versions["stable"]}}/restore.html) to your CockroachCloud cluster.

{{site.data.alerts.callout_danger}}
If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter.
{{site.data.alerts.end}}

## Product features

### Are enterprise features like partitioning or change data capture available to me?

Yes, CockroachCloud clusters run the enterprise version of CockroachDB and all enterprise features are available to you. We encourage you to [contact Support](https://support.cockroachlabs.com/hc/en-us) to set up [partitioning](../{{site.versions["stable"]}}/partitioning.html), [change data capture](../{{site.versions["stable"]}}/change-data-capture.html), and other advanced features, as we have best practices and reference architectures we would be happy to share with you.

### Is there a public API for CockroachCloud?

Our team is currently working on creating a public API for CockroachCloud. The initial work is focused on core automation requirements, such as creation, modification, and deletion of clusters. We’re always looking for design partners and customer input for our features, so please [contact us](https://support.cockroachlabs.com/hc/en-us) if you have specific API requirements.

### Do you have a UI? How can I see details?

All customers of our CockroachCloud service can view and manage their clusters in the [Console](https://cockroachlabs.cloud/).

### What latency should I expect when making a call to CockroachCloud?

Response times are under 10ms for public access but typically much lower. Additionally, using [VPC peering](network-authorization.html#vpc-peering) or [AWS PrivateLink](network-authorization.html#aws-privatelink) will reduce latency.

## Support

### Where can I find the Support Policy and Service Level Agreement (SLA) for CockroachCloud?

The following pages can be found in our [Terms & Conditions](https://www.cockroachlabs.com/cloud-terms-and-conditions):

- [CockroachCloud Support Policy](https://www.cockroachlabs.com/cloud-terms-and-conditions/cockroach-support-policy)
- [CockroachCloud SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions/cockroachcloud-technical-service-level-agreement)

### Am I in control of upgrades for my CockroachCloud clusters?

Yes, you can apply major release upgrades directly [through the CockroachCloud Console](upgrade-to-v20.2.html); however, minor release upgrades are automatically applied to all clusters. CockroachCloud clusters are restarted for minor version updates, so previously established connections will need to be [reestablished after the restart](../v21.1/connection-pooling.html#validating-connections-in-a-pool). For more information, see the [Upgrade Policy](upgrade-policy.html).

### What is the support policy for older versions of the software?

CockroachCloud supports the latest major version of CockroachDB and the version immediately preceding it. We highly recommend running one of the two latest versions of CockroachDB, but we will never force a major upgrade to a cluster without your knowledge. You can contact [Support](https://support.cockroachlabs.com/hc/en-us) if you require an exception.

### How do I check to see if CockroachCloud is down?

The [**CockroachCloud Status** page](https://status.cockroachlabs.cloud) is a publicly available page that displays the current uptime status of the following services:

- [**CockroachCloud Console**](https://cockroachlabs.cloud/clusters): The UI used for signing up for CockroachCloud, cluster creation and management, and user management.
- **AWS**: The status reported here reflects the health of existing AWS CockroachCloud clusters and the ability to provision new clusters in AWS.
- **GCP**: The status reported here reflects the health of existing GCP CockroachCloud clusters and the ability to provision new clusters in GCP.

## Cluster troubleshooting

### What do I do if my queries are too slow?

To optimize schema design to achieve your performance goals, we recommend working with our Sales Engineering team before you set up your cluster. You can also read our [SQL Performance Best Practices](../{{site.versions["stable"]}}/performance-best-practices-overview.html) and [Performance Tuning](../{{site.versions["stable"]}}/performance-tuning.html) docs for more information.

If you need additional help, contact [Support](https://support.cockroachlabs.com/hc/en-us).
