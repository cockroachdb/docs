---
title: CockroachDB Dedicated on Azure
summary: Learn about limitations and FAQs about CockroachDB Dedicated on Microsoft Azure.
toc: true
toc_not_nested: true
docs_area: deploy
---

This page provides information about {{ site.data.products.dedicated }} clusters on Microsoft Azure, including frequently asked questions and limitations during [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html). To create a {{ site.data.products.dedicated }} cluster, refer to [Create Your Cluster](create-your-cluster.html).

{{site.data.alerts.callout_info}}
{% include feature-phases/azure-limited-access.md %}
{{site.data.alerts.end}}

## Limitations

During [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html), {{ site.data.products.dedicated }} clusters on Azure have the following temporary limitations. To express interest or request more information about a given limitation, contact your Cockroach Labs account team. For more details, refer to the [FAQs](#faqs).

### Regions

- Multi-region clusters are not yet available.
- Single-region clusters can be created in the following regions: `eastus2` (US East Coast - Virginia) and `westeurope` (Netherlands)

### Editing and scaling

- A cluster must have at minimum three nodes. Single-node clusters are not supported.
- After it is created, a cluster cannot yet be modified or scaled in place. Instead, create a new cluster with the desired configuration.

### Disaster recovery

- [Managed Service Backups](use-managed-service-backups.html) are not yet available during the limited access period. Customers can take and restore from their own backups on Azure storage (Blob Storage or ADLS Gen 2).

### Networking

- Azure Private Link is not yet available. [IP Allowlisting](network-authorization.html#ip-allowlisting) allows you to restrict the IP addresses that can connect to your cluster.

### Observability

- [Log Export](export-logs.html) is not yet available.
- Exporting metrics to Azure Monitor is not yet available, but metrics can be exported to [Datadog](tools-page.html). To express interest, contact your Cockroach Labs account team.

### Other features

[PCI-Ready](pci-dss.html) features are not yet available on Azure. To express interest, contact your Cockroach Labs account team.

- [Private Clusters](private-clusters.html)
- [Customer Managed Encryption Keys (CMEK)](cmek.html)
- [Egress Perimeter Controls](egress-perimeter-controls.html)

## FAQs

### What does limited access refer to regarding the availability of {{ site.data.products.dedicated }} on Azure?

{{ site.data.products.dedicated }} on Azure is fully managed, just like {{ site.data.products.dedicated }} on GCP or AWS. During [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html), your {{ site.data.products.db }} organization must be enrolled before you can start using {{ site.data.products.dedicated }} on Azure.

The clusters created during this period are recommended for proof-of-concept and testing, and are not suitable for production. The [{{ site.data.products.db }} Service Level Agreement (SLA)](https://cockroachlabs.com/cloud-terms-and-conditions/cockroachcloud-technical-service-level-agreement/) is not applicable to Azure clusters during limited access. Azure clusters are excluded from premium support agreements during limited access, and technical support is only available during business hours.

### Can we create multi-region dedicated clusters on Azure?

Not yet. During [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html), a cluster can be created only in a single region, and a cluster must have three or more nodes. A cluster's nodes are automatically placed in different [availability zones](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview) to ensure resiliency to failure of a single availability zone.

### Is it possible to horizontally scale a dedicated cluster on Azure?

Not yet.

### What Azure regions can we choose to create the dedicated clusters?

You can create a cluster in `eastus2` (US East Coast - Virginia) or `westeurope` (Netherlands) during the limited access period. Contact your account team to express interest in other regions.

### What kind of compute and storage resources are used for the dedicated clusters on Azure?

{{ site.data.products.dedicated }} clusters on Azure use [Dasv5-series VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/dasv5-dadsv5-series) and [Premium SSDs](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-types#premium-ssds). This configuration was selected for its optimum price-performance ratio after thorough performance testing across VM families and storage types.

### We use {{ site.data.products.db }} credits to pay for our usage on AWS or GCP. Is it possible to use those same credits for {{ site.data.products.dedicated }} clusters on Azure?

Yes, existing {{ site.data.products.db }} customers can pay for the usage of {{ site.data.products.dedicated }} clusters on Azure with their available credits. To add additional credits to your {{ site.data.products.db }} organization, contact your Cockroach Labs account team.

### Does the {{ site.data.products.db }} technical SLA cover the dedicated clusters on Azure?

During [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html), the [{{ site.data.products.db }} technical SLA](https://cockroachlabs.com/cloud-terms-and-conditions/cockroachcloud-technical-service-level-agreement/) does not apply to {{ site.data.products.dedicated }} clusters on Azure. For more details about the roadmap, contact your Cockroach Labs account team.

### Are backups available for {{ site.data.products.dedicated }} clusters on Azure? Can we take our own backups to Azure storage in our tenant?

Customers can [take and restore from their own backups on Azure storage](take-and-restore-customer-owned-backups.html) ([Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) or [ADLS Gen 2](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction)). Refer to the blog post [CockroachDB locality-aware Backups for Azure Blob](https://www.cockroachlabs.com/blog/locality-aware-backups-azure-blob/) for an example.

[Managed service backups](use-managed-service-backups.html?filters=dedicated) are not available during the limited access period.

### Is it possible to take encrypted backups for dedicated clusters in Azure?

Yes, customers can [take and restore from their own encrypted backups](take-and-restore-customer-owned-backups.html) on Azure storage by using an RSA key stored in [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/keys/about-keys).

### Are changefeeds available for dedicated clusters in Azure?

Yes, customers can create and configure [changefeeds](/docs/{{site.versions["stable"]}}/changefeed-messages.html) to send data events in real-time from a {{ site.data.products.dedicated }} cluster to a [downstream sink](https://www.cockroachlabs.com/docs/stable/changefeed-sinks.html) such as Kafka, Azure storage, or Webhook. [Azure Event Hubs](https://learn.microsoft.com/en-us/azure/event-hubs/azure-event-hubs-kafka-overview) provides an Azure-native service that can be used with a Kafka endpoint as a sink.

### Can we export logs and metrics from a dedicated cluster on Azure to Azure Monitor or a third-party observability service?

During [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html), exporting metrics to Datadog is supported. Refer to [Export Metrics From a {{ site.data.products.dedicated }} Cluster](export-metrics.html). It’s not possible to export cluster logs or metrics to Azure Monitor or to another third-party observability service during the limited access period. To express interest in this feature, contact your Cockroach Labs account team.

### Are CockroachDB user-defined functions available for dedicated clusters in Azure?

Yes, [user-defined functions](/docs/{{site.versions["stable"]}}/user-defined-functions.html) are supported for {{ site.data.products.dedicated }} clusters on Azure. The same CockroachDB binaries are used across {{ site.data.products.db }} deployment environments, and all SQL features behave the same on Azure as on GCP or AWS, with the exception of multi-region capabilities during the limited access period.

### Can we use {{ site.data.products.dedicated }} on Azure if we are coming from PostgreSQL?

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and the majority of PostgreSQL syntax. Refer to [Supported SQL Feature Support](/docs/{{site.versions["stable"]}}/sql-feature-support.html). The same CockroachDB binaries are used across {{ site.data.products.db }} deployment environments, and all SQL features behave the same on Azure as on GCP or AWS, with the exception of multi-region capabilities during the limited access period.

### How are {{ site.data.products.dedicated }} clusters on Azure isolated from each other? Do they follow a similar approach like on AWS and GCP?

We follow a similar tenant isolation approach on Azure as on GCP and AWS. During the limited access period, each {{ site.data.products.dedicated }} cluster is created its own unique Azure subscription on a [AKS cluster](https://azure.microsoft.com/en-us/products/kubernetes-service) in a unique [VNet](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview). Implementation details are subject to change.

### Can we use Single-Sign On to sign-in to {{ site.data.products.db }} and manage {{ site.data.products.dedicated }} clusters on Azure?

Yes, [Cloud Organization SSO](cloud-org-sso.html) is supported. This feature is unrelated to the cluster's deployment environment.

### Is it possible to use a secure and centralized authentication method for {{ site.data.products.dedicated }} clusters on Azure?

Human users can connect using [Cluster SSO](cloud-sso-sql.html), [client certificates](https://www.cockroachlabs.com/docs/stable/authentication.html#using-digital-certificates-with-cockroachdb), or the [`ccloud` command](https://www.cockroachlabs.com/docs/cockroachcloud/ccloud-get-started) or SQL clients.

Application users can connect using [JWT tokens](/docs/{{site.versions["stable"]}}/sso-sql.html) or [client certificates](https://www.cockroachlabs.com/docs/stable/authentication.html#using-digital-certificates-with-cockroachdb).

### What is the encryption posture for data stored in a {{ site.data.products.dedicated }} cluster on Azure?

Customer data at rest on cluster disks is encrypted using [server-side encryption of Azure disk storage](https://learn.microsoft.com/en-us/azure/virtual-machines/disk-encryption). CockroachDB’s [file-based encryption at rest](/docs/{{site.versions["stable"]}}/security-reference/encryption.html#cockroachdb-self-hosted-clusters) and [Customer-Managed Encryption Keys (CMEK)](cmek.html) are not available during the limited access period. To express interest, contact your Cockroach Labs account team.

All client connections to a {{ site.data.products.dedicated }} cluster on Azure, as well as connections between nodes, are encrypted using TLS.

### Are private connectivity methods, such as Private Link, available to securely connect to a {{ site.data.products.dedicated }} cluster on Azure?

You can configure IP allowlisting to limit the IP addresses or CIDR ranges that can access a {{ site.data.products.dedicated }} cluster on Azure. [Azure Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-overview) is not available during the limited access period. To express interest, contact your Cockroach Labs account team.
