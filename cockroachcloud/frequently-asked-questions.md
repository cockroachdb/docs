---
title: CockroachDB Cloud FAQs
summary: Get answers to frequently asked questions about CockroachDB Cloud
toc: true
docs_area: get_started
---

This page answers the frequently asked questions about {{ site.data.products.serverless }} and {{ site.data.products.dedicated }}.

{% include cockroachcloud/filter-tabs/cloud-faqs.md %}

## General

### What is {{ site.data.products.dedicated }}?

{{ site.data.products.dedicated }} provides fully-managed, single-tenant CockroachDB clusters with no shared resources. {{ site.data.products.dedicated }} supports single and multi-region clusters in AWS and GCP.

### In what clouds and regions is {{ site.data.products.dedicated }} available?

The following regions are available for {{ site.data.products.dedicated }}:

 GCP                                 | AWS                             
-------------------------------------|---------------------------------
 `asia-east1` (Changhua County)      | `ap-northeast-1` (Tokyo)        
 `asia-east2` (Hong Kong)            | `ap-northeast-2` (Seoul)        
 `asia-northeast1` (Tokyo)           | `ap-northeast-3` (Osaka)        
 `asia-southeast1` (Jurong West)     | `ap-south-1` (Mumbai)           
 `australia-southeast1` (Australia)  | `ap-southeast-1` (Singapore)    
 `europe-west1` (St. Ghislain)       | `ap-southeast-2` (Sydney)       
 `europe-west2` (London)             | `ca-central-1` (Central Canada) 
 `europe-west3` (Frankfurt)          | `eu-central-1` (Frankfurt)      
 `europe-west4` (Eemshaven)          | `eu-north-1` (Stockholm)        
 `northamerica-northeast1` (Montréal)| `eu-west-1` (Ireland)           
 `southamerica-east1` (São Paulo)    | `eu-west-2` (London)            
 `us-central1` (Iowa)                | `eu-west-3` (Paris)             
 `us-east1` (South Carolina)         | `sa-east-1` (São Paulo)         
 `us-west1` (Oregon)                 | `us-east-2` (Ohio)              
 `us-west2` (California)             | `us-west-2` (Oregon)            

We run {{ site.data.products.dedicated }} in EKS and GKE - the managed Kubernetes offerings for AWS and GCP respectively - and support all regions in which their offerings are available. If a particular region is not available on the {{ site.data.products.db }} Console, it is usually due to the cloud provider not supporting EKS or GKE in that region. See
[list of EKS regions](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/) and [list of GKE regions](https://cloud.google.com/about/locations/) for details.

**Known issue:** In addition to the non-GKE regions, we had to temporarily disable the following GCP regions due to GCP's quota restrictions:

- Mumbai (`asia-south1`)
- Osaka (`asia-northeast2`)
- Hamina (`europe-north1`)
- Frankfurt (`europe-west3`)
- Zurich (`europe-west6`)

If you want to create a cluster in a disabled region, please [contact Support](https://support.cockroachlabs.com).

### How do {{ site.data.products.dedicated }} free trials work?

{{ site.data.products.dedicated }} offers a 30-day free trial. Free trials require a credit card so we can validate that you are not a bot and provide a seamless transition into production. Free trials apply when you:

- Create the first cluster in your organization
- Select 9 or fewer nodes (we recommend starting with 3 so you can try scaling)
- Select up to 4 vCPUs of compute and 150 GiB of storage (the trial code will not apply to larger clusters)
- Select a single region or 3 regions
- Don't remove the pre-applied trial code at check out

Once the 30-day period is over, your cluster can be scaled beyond the trial period hardware limitations. You can create other paid clusters at any time. If Cockroach Labs has provided you with additional codes, you can use those on applicable clusters. For extended trial options, [contact us](https://www.cockroachlabs.com/contact-sales/).

### How do I connect to my cluster?

To connect to a cluster, you need to authorize your network, create a SQL user, download the CA certificate, and then generate a connection string or parameters. You can use this information to connect to your cluster through the CockroachDB SQL client or a PostgreSQL-compatible driver or ORM. For more details, see [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html).

## Security

### Is my cluster secure?

Yes. We create individual sub-accounts and VPCs for each cluster within the cloud provider. These VPCs are firewalled from each other and any other outside connection, unless allowlisted for SQL and Web UI ports.

The allowlist is comprised of IP addresses that you provide to us, and is an additional layer of protection for your cluster. Connections will only be accepted if they come from an allowlisted IP address, which protects against both compromised passwords and any potential bugs in the server.

We use separate certificate authorities for each cluster, and all connections to the cluster over the internet use TLS 1.2 or 1.3.

See the [Security Overview page](../{{site.versions["cloud"]}}/security-reference/security-overview.html) for more information, and for comparison of security options by CockroachDB product.

### Is encryption-at-rest enabled on {{ site.data.products.dedicated }}?

All data in {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} is encrypted-at-rest by your chosen infrastructre-as-a-service provider, Google Cloud Platform (GCP) or Amazon Web Services (AWS), at the infrastructure level.

{{site.data.alerts.callout_info}}
{{ site.data.products.serverless }} and {{ site.data.products.dedicated }} users delegate responsibility for encryption-at-rest to the cloud provider. Hence, CockroachDB's proprietary storage-layer encryption-at-rest functionality is currently only available with an Enterprise license and is not currently available to users of {{ site.data.products.serverless }} or {{ site.data.products.dedicated }}.

As a result, encryption will appear to be disabled in the [DB Console](../{{site.versions["cloud"]}}/ui-overview.html), since the console is unaware of cloud provider encryption.
{{site.data.alerts.end}}


See the [Security Overview page](../{{site.versions["cloud"]}}/security-reference/security-overview.html) for more information, and for comparison of security options by CockroachDB product.



### Is my cluster isolated? Does it share resources with any other clusters?

{{ site.data.products.dedicated }} is a single-tenant offering and resources are not shared between clusters.

### Who has access to my cluster data?

The Cockroach Labs SRE team has direct access to {{ site.data.products.db }} cluster data. They adhere to the confidentiality agreement described in our [Terms and Conditions](https://www.cockroachlabs.com/cloud-terms-and-conditions/).

## Cluster maintenance

### How do I change the configurations on my cluster?

Contact [Support](https://support.cockroachlabs.com/hc/en-us) to change your cluster configuration.

### How do I add nodes?

You can add nodes by accessing the **Clusters** page on the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/) and clicking the **...** button for the cluster you want to add or delete nodes for. See [Cluster Mangement](cluster-management.html?filters=dedicated#add-or-remove-nodes-from-a-cluster) for more details.

{% include cockroachcloud/nodes-limitation.md %}

### Do you auto-scale?

Today, we do not automatically scale nodes based on your capacity usage. To add or remove nodes, see [Cluster Mangement](cluster-management.html?filters=dedicated#add-or-remove-nodes-from-a-cluster). There are plans to allow auto-scaling in the future.

### Who is responsible for backup?

Cockroach Labs runs full backups daily and incremental backups hourly for every {{ site.data.products.dedicated }} cluster. The full backups are retained for 30 days and incremental backups for 7 days. Only {{ site.data.products.dedicated }} cluster backups are available to users at this time.

The backups for AWS clusters are encrypted using [AWS S3’s server-side encryption](https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html) and the backups for GCP clusters are encrypted using [Google-managed server-side encryption keys](https://cloud.google.com/storage/docs/encryption/default-keys).

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

You can also [backup and restore](run-bulk-operations.html) data on your own. If you need additional help, [contact us](https://support.cockroachlabs.com).

### Can I download the backups that {{ site.data.products.db }} takes for me?

{{ site.data.products.db }} automated backups cannot be downloaded, but you can manually [run a backup](run-bulk-operations.html) to your own [storage location](../{{site.versions["cloud"]}}/backup.html#backup-file-urls) at any time. To do this, you will need either `admin` or `SELECT` privileges on the data you are backing up.

### Can I restore my self-hosted CockroachDB cluster to {{ site.data.products.dedicated }}?

Yes. You can [backup](../{{site.versions["cloud"]}}/backup.html) your self-hosted CockroachDB databases to an [external location](../{{site.versions["cloud"]}}/backup.html#backup-file-urls) and then [restore](../{{site.versions["cloud"]}}/restore.html) to your {{ site.data.products.db }} cluster.

{{site.data.alerts.callout_danger}}
If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter.
{{site.data.alerts.end}}

### Can I set up VPC peering or AWS PrivateLink after my cluster is created?

AWS clusters can set up a [PrivateLink connection](network-authorization.html#aws-privatelink) at any time after the cluster is created.

GCP clusters can also set up VPC peering after the cluster is created, but you will be locked into our default IP range (`172.28.0.0/14`) unless you configure a different IP range during cluster creation. You can use the default IP range for VPC peering as long as it doesn't overlap with the IP ranges in your network. For more information, see [VPC peering](network-authorization.html#vpc-peering).

## Product features

### Are enterprise features available to me?

Yes, {{ site.data.products.dedicated }} clusters run the enterprise version of CockroachDB and all [enterprise features](../stable/enterprise-licensing.html) are available to you.

### Is there a public API for {{ site.data.products.db }}?

Yes, see the [Cloud API](cloud-api.html) page for more information. We’re always looking for design partners and customer input for our features, so please [contact us](https://support.cockroachlabs.com/hc/en-us) if you have specific API requirements.

### Do you have a UI? How can I see details?

All customers of our {{ site.data.products.dedicated }} service can view and manage their clusters in the [Console](https://cockroachlabs.cloud/).

### What latency should I expect when making a call to {{ site.data.products.dedicated }}?

Response times are under 10ms for public access but typically much lower. Additionally, using [VPC peering](network-authorization.html#vpc-peering) or [AWS PrivateLink](network-authorization.html#aws-privatelink) will reduce latency.

## Support

### Where can I find the Support Policy and Service Level Agreement (SLA) for {{ site.data.products.dedicated }}?

The following pages can be found in our [Terms & Conditions](https://www.cockroachlabs.com/cloud-terms-and-conditions/):

- [{{ site.data.products.db }} Support Policy](https://www.cockroachlabs.com/cloud-terms-and-conditions/cockroach-support-policy/)
- [{{ site.data.products.db }} SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions/cockroachcloud-technical-service-level-agreement/)

### Am I in control of upgrades for my {{ site.data.products.dedicated }} clusters?

Yes, a Console Admin can apply major release upgrades directly [through the {{ site.data.products.db }} Console](upgrade-to-v21.2.html); however, patch release upgrades are automatically applied to all clusters. {{ site.data.products.dedicated }} clusters are restarted one node at a time for patch version updates, so previously established connections will need to be [reestablished after the restart](../v21.2/connection-pooling.html#validating-connections-in-a-pool). For more information, see the [Upgrade Policy](upgrade-policy.html).

### What is the support policy for older versions of the software?

{{ site.data.products.dedicated }} supports the latest major version of CockroachDB and the version immediately preceding it. We highly recommend running one of the two latest versions of CockroachDB, but we will never force a major upgrade to a cluster without your knowledge. You can contact [Support](https://support.cockroachlabs.com/hc/en-us) if you require an exception.

### How do I check to see if {{ site.data.products.db }} is down?

The [**{{ site.data.products.db }} Status** page](https://status.cockroachlabs.cloud) is a publicly available page that displays the current uptime status of the following services:

- [**{{ site.data.products.db }} Console**](https://cockroachlabs.cloud/clusters): The UI used for signing up for {{ site.data.products.db }}, cluster creation and management, and user management.
- **AWS**: The status reported here reflects the health of existing AWS {{ site.data.products.db }} clusters and the ability to provision new clusters in AWS.
- **GCP**: The status reported here reflects the health of existing GCP {{ site.data.products.db }} clusters and the ability to provision new clusters in GCP.

## Cluster troubleshooting

### What do I do if my queries are too slow?

To optimize schema design to achieve your performance goals, we recommend working with our Sales Engineering team before you set up your cluster. You can also read our [SQL Performance Best Practices](../{{site.versions["cloud"]}}/performance-best-practices-overview.html) and [Query Performance Optimization](../{{site.versions["cloud"]}}/make-queries-fast.html) docs for more information.

### Can I monitor my cluster with third-party tools?

Yes, {{ site.data.products.dedicated }} clusters support an integration with Datadog that enables data collection and alerting on a subset of CockroachDB metrics. Enabling the Datadog integration on your {{ site.data.products.dedicated }} cluster will apply additional charges to your **Datadog** bill. See [Monitor with Datadog](monitoring-page.html#monitor-cockroachdb-dedicated-with-datadog) for more information.

If you need additional help, contact [Support](https://support.cockroachlabs.com/hc/en-us).
