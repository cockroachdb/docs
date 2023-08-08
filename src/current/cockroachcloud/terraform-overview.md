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
Refer to the [CockroachDB Cloud Terraform provider reference docs](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs) for detailed information on the resources you can manage using Terraform.

## Code examples

The [`terraform-provider-cockroach`](https://github.com/cockroachdb/terraform-provider-cockroach) GitHub repository contains [workflow examples](https://github.com/cockroachdb/terraform-provider-cockroach/tree/main/examples/workflows) for the following resources:

- [{{ site.data.products.dedicated }} clusters](https://github.com/cockroachdb/terraform-provider-cockroach/tree/main/examples/workflows/cockroach_dedicated_cluster)
- [{{ site.data.products.serverless }} clusters](https://github.com/cockroachdb/terraform-provider-cockroach/tree/main/examples/workflows/cockroach_serverless_cluster)
- [AWS PrivateLink](https://github.com/cockroachdb/terraform-provider-cockroach/blob/main/examples/workflows/aws_privatelink)
- [Client CA certificates](https://github.com/cockroachdb/terraform-provider-cockroach/tree/main/examples/workflows/cockroach_client_ca_cert)
- [CMEK](https://github.com/cockroachdb/terraform-provider-cockroach/tree/main/examples/workflows/cockroach_cmek) 
- [Log export configuration](https://github.com/cockroachdb/terraform-provider-cockroach/tree/main/examples/workflows/cockroach_log_export_config)
- [Metrics export configuration](https://github.com/cockroachdb/terraform-provider-cockroach/tree/main/examples/workflows/cockroach_metric_export)
- [User role grants](https://github.com/cockroachdb/terraform-provider-cockroach/tree/main/examples/workflows/cockroach_user_role_grants)

The repository also contains [example code snippets for all available resources](https://github.com/cockroachdb/terraform-provider-cockroach/tree/main/examples/resources).

## Tutorials

The following detailed tutorials for managing {{ site.data.products.db }} clusters with Terraform are available:

- [Provision a cluster with Terraform](provision-a-cluster-with-terraform.html).
- [Manage Databases with Terraform](manage-database-terraform.html).
- [Export Metrics with Terraform](export-metrics-terraform.html) ({{ site.data.products.dedicated }} only).
- [Export Logs with Terraform](export-logs-terraform.html) ({{ site.data.products.dedicated }} only).
