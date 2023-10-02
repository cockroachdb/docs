---
title: CockroachDB Dedicated on Azure
summary: Learn about limitations and FAQs about CockroachDB Dedicated on Microsoft Azure.
toc: true
toc_not_nested: true
docs_area: deploy
---

This page provides information about CockroachDB {{ site.data.products.dedicated }} clusters on Microsoft Azure, including frequently asked questions and limitations. To create a cluster, refer to [Create a CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/create-your-cluster.md %}).

## Limitations

CockroachDB {{ site.data.products.dedicated }} clusters on Azure have the following temporary limitations. To express interest or request more information about a given limitation, contact your Cockroach Labs account team. For more details, refer to the [FAQs](#faqs).

### Regions

For the list of supported Azure regions, refer to [Azure Regions]({% link cockroachcloud/regions.md %}?filters=dedicated#azure-regions).

### Editing and scaling

- A cluster must have at minimum three nodes. Single-node clusters are not supported.
- After it is created, a cluster's regions cannot yet be modified.
- After it is created, a cluster's storage can be increased in place, but cannot subsequently be decreased or removed.

### Networking

- Azure Private Link is not yet available. [IP Allowlisting]({% link cockroachcloud/network-authorization.md %}#ip-allowlisting) allows you to restrict the IP addresses that can connect to your cluster.

### Observability

- Exporting metrics to [Datadog](https://www.datadoghq.com/) is available. Enable the Datadog integration in the [CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/tools-page.md %}#monitor-cockroachdb-dedicated-with-datadog) or with the [Cloud API]({% link cockroachcloud/export-metrics.md %}?filters=datadog-metrics-export).
- Exporting metrics to Azure Monitor is not yet available. To express interest, contact your Cockroach Labs account team.
- [Log Export]({% link cockroachcloud/export-logs.md %}) is not yet available.

### Other features

[PCI-Ready]({% link cockroachcloud/pci-dss.md %}) features are not yet available on Azure. To express interest, contact your Cockroach Labs account team.

- [Private Clusters]({% link cockroachcloud/private-clusters.md %})
- [Customer Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %})
- [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %})

## FAQs

The following sections provide more details about CockroachDB {{ site.data.products.dedicated }} on Azure.

### Are multi-region clusters supported?

Yes.

### Can CockroachDB {{ site.data.products.serverless }} clusters be deployed on Azure?

CockroachDB {{ site.data.products.serverless }} is not currently available on Azure.

### Are horizontal and vertical scaling supported?

Yes. Refer to [Cluster Management]({% link cockroachcloud/cluster-management.md %}).

### What Azure regions can we choose?

Refer to [Azure Regions]({% link cockroachcloud/regions.md %}?filters=dedicated#azure-regions).

### What kind of compute and storage resources are used?

{{ site.data.products.dedicated }} clusters on Azure use [Dsv4-series VMs](https://learn.microsoft.com/azure/virtual-machines/dv4-dsv4-series) and [Premium SSDs](https://learn.microsoft.com/azure/virtual-machines/disks-types#premium-ssds). This configuration was selected for its optimum price-performance ratio after thorough performance testing across VM families and storage types.

### Can we use {{ site.data.products.db }} credits to pay for clusters on Azure?

Yes, existing CockroachDB {{ site.data.products.cloud }} customers can pay for the usage of CockroachDB {{ site.data.products.dedicated }} clusters on Azure with their available credits. To add additional credits to your CockroachDB {{ site.data.products.cloud }} organization, contact your Cockroach Labs account team.

### What backup and restore options are available for clusters on Azure?

[Managed-service backups]({% link cockroachcloud/use-managed-service-backups.md %}?filters=dedicated) automatically back up clusters on Azure, and customers can [take and restore from manual backups to Azure storage]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) ([Blob Storage](https://azure.microsoft.com/products/storage/blobs) or [ADLS Gen 2](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction)). Refer to the blog post [CockroachDB locality-aware Backups for Azure Blob](https://www.cockroachlabs.com/blog/locality-aware-backups-azure-blob/) for an example.

### Is it possible to take encrypted backups?

Yes, customers can [take and restore from encrypted backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) on Azure storage by using an RSA key stored in [Azure Key Vault](https://learn.microsoft.com/azure/key-vault/keys/about-keys).

### Are changefeeds available?

Yes, customers can create and configure [changefeeds](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/changefeed-messages) to send data events in real-time from a CockroachDB {{ site.data.products.dedicated }} cluster to a [downstream sink](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/changefeed-sinks.html) such as Kafka, Azure storage, or Webhook. [Azure Event Hubs](https://learn.microsoft.com/azure/event-hubs/azure-event-hubs-kafka-overview) provides an Azure-native service that can be used with a Kafka endpoint as a sink.

### Can we export logs and metrics from a cluster on Azure to Azure Monitor or a third-party observability service?

Exporting metrics to Datadog is supported. Refer to [Export Metrics From a CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/export-metrics.md %}). It’s not yet possible to export cluster logs or metrics to Azure Monitor or to another third-party observability service. To express interest in this feature, contact your Cockroach Labs account team.

### Are CockroachDB user-defined functions available for clusters on Azure?

Yes, [user-defined functions](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/user-defined-functions) are supported for CockroachDB {{ site.data.products.dedicated }} clusters on Azure. The same CockroachDB binaries are used across CockroachDB {{ site.data.products.cloud }} deployment environments, and all SQL features behave the same on Azure as on GCP or AWS.

### Can we migrate from PostgreSQL to CockroachDB {{ site.data.products.dedicated }} on Azure?

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and the majority of PostgreSQL syntax. Refer to [Supported SQL Feature Support](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/sql-feature-support). The same CockroachDB binaries are used across CockroachDB {{ site.data.products.cloud }} deployment environments, and all SQL features behave the same on Azure as on GCP or AWS.

### How are clusters on Azure isolated from each other? Do they follow a similar approach as on AWS and GCP?

CockroachDB {{ site.data.products.cloud }} follows a similar tenant isolation approach on Azure as on GCP and AWS. Each {{ site.data.products.dedicated }} cluster is created on an [AKS cluster](https://azure.microsoft.com/products/kubernetes-service) in a unique [VNet](https://learn.microsoft.com/azure/virtual-network/virtual-networks-overview). Implementation details are subject to change.

### Can we use Single-Sign On to sign-in to {{ site.data.products.db }} and manage clusters on Azure?

Yes, [Cloud Organization SSO]({% link cockroachcloud/cloud-org-sso.md %}) is supported. This feature is unrelated to the cluster's deployment environment.

### What secure and centralized authentication methods are available for {{ site.data.products.dedicated }} clusters on Azure?

Human users can connect using [Cluster SSO]({% link cockroachcloud/cloud-sso-sql.md %}), [client certificates](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/authentication.html#using-digital-certificates-with-cockroachdb), or the [`ccloud` command]({% link cockroachcloud/ccloud-get-started.md %}) or SQL clients.

Application users can connect using [JWT tokens](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/sso-sql) or [client certificates](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/authentication.html#using-digital-certificates-with-cockroachdb).

### How is data encrypted at rest in a cluster on Azure?

Customer data at rest on cluster disks is encrypted using [server-side encryption of Azure disk storage](https://learn.microsoft.com/azure/virtual-machines/disk-encryption). CockroachDB’s [file-based encryption at rest](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/security-reference/encryption#cockroachdb-self-hosted-clusters) and [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %}) are not yet available. To express interest, contact your Cockroach Labs account team.

All client connections to a CockroachDB {{ site.data.products.dedicated }} cluster on Azure, as well as connections between nodes, are encrypted using TLS.

### Can we use private connectivity methods, such as Private Link, to securely connect to a cluster on Azure?

You can configure IP allowlisting to limit the IP addresses or CIDR ranges that can access a CockroachDB {{ site.data.products.dedicated }} cluster on Azure. [Azure Private Link](https://learn.microsoft.com/azure/private-link/private-link-overview) is not yet available. To express interest, contact your Cockroach Labs account team.
