---
title: CockroachDB Dedicated on Azure
summary: Learn about limitations and FAQs about CockroachDB Dedicated on Microsoft Azure.
toc: true
toc_not_nested: true
docs_area: deploy
---

This page provides information about CockroachDB {{ site.data.products.dedicated }} clusters on Microsoft Azure, including frequently asked questions and limitations during [limited access](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroachdb-feature-availability). To create a CockroachDB {{ site.data.products.dedicated }} cluster, refer to [Create Your Cluster]({% link cockroachcloud/create-your-cluster.md %}).

{{site.data.alerts.callout_info}}
{% include feature-phases/azure-limited-access.md %}
{{site.data.alerts.end}}

## Limitations

During [limited access](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroachdb-feature-availability), CockroachDB {{ site.data.products.dedicated }} clusters on Azure have the following temporary limitations. To express interest or request more information about a given limitation, contact your Cockroach Labs account team. For more details, refer to the [FAQs](#faqs).

### Regions

- Multi-region clusters are not yet available.
- Single-region clusters can be created in the following regions: `eastus2` (US East Coast - Virginia) and `westeurope` (Netherlands)

### Editing and scaling

- A cluster must have at minimum three nodes. Single-node clusters are not supported.
- After it is created, a cluster cannot yet be modified or scaled in place. Instead, create a new cluster with the desired configuration.

### Disaster recovery

- [Managed Service Backups]({% link cockroachcloud/use-managed-service-backups.md %}) are not yet available during the limited access period. Customers can take and restore from their own backups on Azure storage (Blob Storage or ADLS Gen 2).

### Networking

- Azure Private Link is not yet available. [IP Allowlisting]({% link cockroachcloud/network-authorization.md %}#ip-allowlisting) allows you to restrict the IP addresses that can connect to your cluster.

### Observability

- [Log Export]({% link cockroachcloud/export-logs.md %}) is not yet available.
- Exporting metrics to Azure Monitor is not yet available, but metrics can be exported to [Datadog]({% link cockroachcloud/tools-page.md %}). To express interest, contact your Cockroach Labs account team.

### Other features

[PCI-Ready]({% link cockroachcloud/pci-dss.md %}) features are not yet available on Azure. To express interest, contact your Cockroach Labs account team.

- [Private Clusters]({% link cockroachcloud/private-clusters.md %})
- [Customer Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %})
- [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %})

## FAQs

### What does limited access refer to regarding the availability of CockroachDB {{ site.data.products.dedicated }} on Azure?

CockroachDB {{ site.data.products.dedicated }} on Azure is fully managed, just like CockroachDB {{ site.data.products.dedicated }} on GCP or AWS. During [limited access](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroachdb-feature-availability), your CockroachDB {{ site.data.products.cloud }} organization must be enrolled before you can start using CockroachDB {{ site.data.products.dedicated }} on Azure.

The clusters created during this period are recommended for proof-of-concept and testing, and are not suitable for production. The [CockroachDB {{ site.data.products.cloud }} Service Level Agreement (SLA)](https://cockroachlabs.com/cloud-terms-and-conditions/cockroachcloud-technical-service-level-agreement/) is not applicable to Azure clusters during limited access. Azure clusters are excluded from premium support agreements during limited access, and technical support is only available during business hours.

### Can we create multi-region dedicated clusters on Azure?

Not yet. During [limited access](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroachdb-feature-availability), a cluster can be created only in a single region, and a cluster must have three or more nodes. A cluster's nodes are automatically placed in different [availability zones](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview) to ensure resiliency to failure of a single availability zone.

### Is it possible to horizontally scale a dedicated cluster on Azure?

Not yet.

### What Azure regions can we choose to create the dedicated clusters?

You can create a cluster in `eastus2` (US East Coast - Virginia) or `westeurope` (Netherlands) during the limited access period. Contact your account team to express interest in other regions.

### What kind of compute and storage resources are used for the dedicated clusters on Azure?

CockroachDB {{ site.data.products.dedicated }} clusters on Azure use [Dasv5-series VMs](https://learn.microsoft.com/azure/virtual-machines/dasv5-dadsv5-series) and [Premium SSDs](https://learn.microsoft.com/azure/virtual-machines/disks-types#premium-ssds). This configuration was selected for its optimum price-performance ratio after thorough performance testing across VM families and storage types.

### We use CockroachDB {{ site.data.products.cloud }} credits to pay for our usage on AWS or GCP. Is it possible to use those same credits for CockroachDB {{ site.data.products.dedicated }} clusters on Azure?

Yes, existing CockroachDB {{ site.data.products.cloud }} customers can pay for the usage of CockroachDB {{ site.data.products.dedicated }} clusters on Azure with their available credits. To add additional credits to your CockroachDB {{ site.data.products.cloud }} organization, contact your Cockroach Labs account team.

### Does the CockroachDB {{ site.data.products.cloud }} technical SLA cover the dedicated clusters on Azure?

During [limited access](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroachdb-feature-availability), the [CockroachDB {{ site.data.products.cloud }} technical SLA](https://cockroachlabs.com/cloud-terms-and-conditions/cockroachcloud-technical-service-level-agreement/) does not apply to CockroachDB {{ site.data.products.dedicated }} clusters on Azure. For more details about the roadmap, contact your Cockroach Labs account team.

### Are backups available for CockroachDB {{ site.data.products.dedicated }} clusters on Azure? Can we take our own backups to Azure storage in our tenant?

Customers can [take and restore from their own backups on Azure storage]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) ([Blob Storage](https://azure.microsoft.com/products/storage/blobs) or [ADLS Gen 2](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction)). Refer to the blog post [CockroachDB locality-aware Backups for Azure Blob](https://www.cockroachlabs.com/blog/locality-aware-backups-azure-blob/) for an example.

[Managed service backups]({% link cockroachcloud/use-managed-service-backups.md %}?filters=dedicated) are not available during the limited access period.

### Is it possible to take encrypted backups for dedicated clusters in Azure?

Yes, customers can [take and restore from their own encrypted backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) on Azure storage by using an RSA key stored in [Azure Key Vault](https://learn.microsoft.com/azure/key-vault/keys/about-keys).

### Are changefeeds available for dedicated clusters in Azure?

Yes, customers can create and configure [changefeeds](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/changefeed-messages) to send data events in real-time from a CockroachDB {{ site.data.products.dedicated }} cluster to a [downstream sink](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/changefeed-sinks.html) such as Kafka, Azure storage, or Webhook. [Azure Event Hubs](https://learn.microsoft.com/azure/event-hubs/azure-event-hubs-kafka-overview) provides an Azure-native service that can be used with a Kafka endpoint as a sink.

### Can we export logs and metrics from a dedicated cluster on Azure to Azure Monitor or a third-party observability service?

During [limited access](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroachdb-feature-availability), exporting metrics to Datadog is supported. Refer to [Export Metrics From a CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/export-metrics.md %}). It’s not possible to export cluster logs or metrics to Azure Monitor or to another third-party observability service during the limited access period. To express interest in this feature, contact your Cockroach Labs account team.

### Are CockroachDB user-defined functions available for dedicated clusters in Azure?

Yes, [user-defined functions](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/user-defined-functions) are supported for CockroachDB {{ site.data.products.dedicated }} clusters on Azure. The same CockroachDB binaries are used across CockroachDB {{ site.data.products.cloud }} deployment environments, and all SQL features behave the same on Azure as on GCP or AWS, with the exception of multi-region capabilities during the limited access period.

### Can we use CockroachDB {{ site.data.products.dedicated }} on Azure if we are coming from PostgreSQL?

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and the majority of PostgreSQL syntax. Refer to [Supported SQL Feature Support](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/sql-feature-support). The same CockroachDB binaries are used across CockroachDB {{ site.data.products.cloud }} deployment environments, and all SQL features behave the same on Azure as on GCP or AWS, with the exception of multi-region capabilities during the limited access period.

### How are CockroachDB {{ site.data.products.dedicated }} clusters on Azure isolated from each other? Do they follow a similar approach like on AWS and GCP?

We follow a similar tenant isolation approach on Azure as on GCP and AWS. During the limited access period, each CockroachDB {{ site.data.products.dedicated }} cluster is created its own unique Azure subscription on a [AKS cluster](https://azure.microsoft.com/products/kubernetes-service) in a unique [VNet](https://learn.microsoft.com/azure/virtual-network/virtual-networks-overview). Implementation details are subject to change.

### Can we use Single-Sign On to sign-in to CockroachDB {{ site.data.products.cloud }} and manage CockroachDB {{ site.data.products.dedicated }} clusters on Azure?

Yes, [Cloud Organization SSO]({% link cockroachcloud/cloud-org-sso.md %}) is supported. This feature is unrelated to the cluster's deployment environment.

### Is it possible to use a secure and centralized authentication method for CockroachDB {{ site.data.products.dedicated }} clusters on Azure?

Human users can connect using [Cluster SSO]({% link cockroachcloud/cloud-sso-sql.md %}), [client certificates](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/authentication.html#using-digital-certificates-with-cockroachdb), or the [`ccloud` command]({% link cockroachcloud/ccloud-get-started.md %}) or SQL clients.

Application users can connect using [JWT tokens](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/sso-sql) or [client certificates](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/authentication.html#using-digital-certificates-with-cockroachdb).

### What is the encryption posture for data stored in a CockroachDB {{ site.data.products.dedicated }} cluster on Azure?

Customer data at rest on cluster disks is encrypted using [server-side encryption of Azure disk storage](https://learn.microsoft.com/azure/virtual-machines/disk-encryption). CockroachDB’s [file-based encryption at rest](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/security-reference/encryption#cockroachdb-self-hosted-clusters) and [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %}) are not available during the limited access period. To express interest, contact your Cockroach Labs account team.

All client connections to a CockroachDB {{ site.data.products.dedicated }} cluster on Azure, as well as connections between nodes, are encrypted using TLS.

### Are private connectivity methods, such as Private Link, available to securely connect to a CockroachDB {{ site.data.products.dedicated }} cluster on Azure?

You can configure IP allowlisting to limit the IP addresses or CIDR ranges that can access a CockroachDB {{ site.data.products.dedicated }} cluster on Azure. [Azure Private Link](https://learn.microsoft.com/azure/private-link/private-link-overview) is not available during the limited access period. To express interest, contact your Cockroach Labs account team.
