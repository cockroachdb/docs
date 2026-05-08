---
title: CockroachDB Advanced on Azure
summary: Learn about limitations and FAQs about CockroachDB Advanced on Microsoft Azure.
toc: true
toc_not_nested: true
docs_area: deploy
---

This page provides information about CockroachDB {{ site.data.products.advanced }} clusters on Microsoft Azure, including frequently asked questions and limitations. To create a cluster, refer to [Create a CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/create-an-advanced-cluster.md %}).

To express interest or request more information about a given limitation, contact your Cockroach Labs account team.

CockroachDB {{ site.data.products.advanced }} clusters on Azure have the following temporary limitations. To express interest or request more information about a given limitation, contact your Cockroach Labs account team.

- A cluster must have at minimum three nodes. A multi-region cluster must have at minimum three nodes per region. Single-node clusters are not supported on Azure.
- CockroachDB {{ site.data.products.advanced }} on Azure meets or exceeds the requirements of SOC 2 Type 2, and now supports [PCI DSS]({% link cockroachcloud/pci-dss.md %}) and HIPAA compliance. (Refer to [Regulatory Compliance in CockroachDB {{ site.data.products.advanced }}]({% link cockroachcloud/compliance.md %}).) Note that the following features required for PCI DSS and HIPAA compliance are in Preview for Azure:
  - [Customer Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %})
  - [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %})

  You can configure IP allowlisting to limit the IP addresses or CIDR ranges that can access a CockroachDB {{ site.data.products.advanced }} cluster on Azure, and you can use [Azure Private Link](https://learn.microsoft.com/azure/private-link/private-link-overview) to connect your applications in Azure to your cluster and avoid exposing your cluster or applications to the public internet. Refer to [Connect to your cluster]({% link cockroachcloud/connect-to-your-cluster.md %}#azure-private-link).

## Change data capture

CockroachDB {{ site.data.products.advanced }} supports [changefeeds](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/changefeed-messages), which allow your cluster to send data events in real-time to a [downstream sink](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/changefeed-sinks.html). [Azure Event Hubs](https://learn.microsoft.com/azure/event-hubs/azure-event-hubs-kafka-overview) provides an Azure-native service that can be used with a Kafka endpoint as a sink.

## Disaster recovery

[Managed backups]({% link cockroachcloud/managed-backups.md %}?filters=advanced) automatically back up clusters in CockroachDB {{ site.data.products.cloud }}.

You can [take and restore from manual backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) to Azure ([Blob Storage](https://azure.microsoft.com/products/storage/blobs) or [ADLS Gen 2](https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction)). Refer to the blog post [CockroachDB locality-aware Backups for Azure Blob](https://www.cockroachlabs.com/blog/locality-aware-backups-azure-blob/) for an example. To encrypt manual backups using an RSA key, refer to the [Azure Key Vault](https://learn.microsoft.com/azure/key-vault/keys/about-keys) documentation.
