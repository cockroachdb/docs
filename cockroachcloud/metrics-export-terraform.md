---
title: Export Metrics with Terraform
summary: Learn how to use the CockroachDB Cloud Terraform provider to export metrics.
toc: true
docs_area: manage
---

[Terraform](https://terraform.io) is an infrastructure-as-code provisioning tool that uses configuration files to define application and network resources. You can use the [CockroachDB Cloud Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) to configure metrics export to [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) or [Datadog](https://www.datadoghq.com/). Once the export is configured, metrics will flow from all nodes in all regions of your {{ site.data.products.dedicated }} cluster to your chosen cloud metrics sink.

Exporting metrics to AWS CloudWatch is only available on {{ site.data.products.dedicated }} clusters which are hosted on AWS, and were created after August 11, 2022. Metrics export to Datadog is supported on all {{ site.data.products.dedicated }} clusters regardless of creation date.

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/preview.md %}
{{site.data.alerts.end}}

## Before you begin

Before you start this tutorial, you must have [the CockroachBDCloud Terraform provider](https://learn.hashicorp.com/tutorials/terraform/install-cli) set up. These instructions apply to an existing {{ site.data.products.dedicated }} cluster that you are managing with Terraform. Follow the tutorial to [Provision a Cluster with Terraform](provision-a-cluster-with-terraform.html?filters=dedicated) to start using Terraform with a new cluster.

## Create a new database

1. Add the following snippet of code to your `main.tf` file:

    ~~~
    resource "cockroach_database" "<resource-name>" {
      name       = "<database-name>"
      cluster_id = cockroach_cluster.<cluster-name>.id
    }
    ~~~
    
    Where `<resource-name>` is the name of the database resource that will be created, `<database-name>` is the name of the database you want to create, and `<cluster-name>` is the cluster's resource name.
    
1. Run the `terraform apply` command in your terminal.
    
    You will be prompted to enter the value `yes` to apply the changes.

## Change the name of a database

To change the name of a database, you can edit the database's `name` variable in your `main.tf` file. The following snippet will rename the database [created](#create-a-new-database) in the previous example:

    ~~~
    resource "cockroach_database" "<resource-name>" {
      name       = "<database-new-name>"
      cluster_id = cockroach_cluster.<cluster-name>.id
    }
    ~~~

Run the `terraform apply` command in your terminal to apply the changes.

## Delete a database

To delete a database, you can delete its corresponding resource from your `main.tf` file and run the `terraform apply` command in your terminal to apply the changes.

## Learn more

- See the [CockroachDB Cloud Terraform provider reference docs](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs) for detailed information on the resources you can manage using Terraform.
- Read about how to [provision a cluster with Terraform](provision-a-cluster-with-terraform.html).
- Read about how to [manage databases with Terraform](manage-database-terraform.html).
- Read about how to [export logs with Terraform](log-export-terraform.html)