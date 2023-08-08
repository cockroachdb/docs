---
title: Provision a CockroachDB Cloud Cluster with Terraform
summary: Learn how to provision a cluster using the CockroachDB Cloud Terraform provider.
toc: true
docs_area: manage
---

[Terraform](https://terraform.io) is an infrastructure-as-code provisioning tool that uses configuration files to define application and network resources. You can provision CockroachDB Cloud clusters and cluster resources by using the [CockroachDB Cloud Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) in your Terraform configuration files.

## Requirements

To start using {{ site.data.products.db }} with Terraform, you must complete the following prerequisites:

- [Install Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli).
- Create a [service account](managing-access.html#manage-service-accounts) and [API key](managing-access.html#api-access) in the [CockroachDB Cloud Console](https://cockroachlabs.cloud), and assign `admin` privilege or Cluster Creator / Cluster Admin role at the organization scope. Refer to: [Service Accounts](authorization.html#service-accounts)

## Capabilities

Terraform configuration files use two kinds of information, "resources" and "data sources".
The to [CockroachDB Cloud Terraform provider reference docs](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs) for detailed information on the resources you can manage using Terraform.

## Tutorials

The following tutorials are available (note that exporting metrics and logs is not available for {{ site.data.products.serverless }} clusters):

- [Provision a cluster with Terraform](provision-a-cluster-with-terraform.html).
- [Manage Databases with Terraform](manage-database-terraform.html).
- [Export Metrics with Terraform](export-metrics-terraform.html).
- [Export Logs with Terraform](export-logs-terraform.html).
