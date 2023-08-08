---
title: Manage Databases with Terraform
summary: Learn how to manage databases using the CockroachDB Cloud Terraform provider.
toc: true
docs_area: manage
---

[Terraform](https://terraform.io) is an infrastructure-as-code provisioning tool that uses configuration files to define application and network resources. You can manage SQL databases in CockroachDB Cloud by using the [CockroachDB Cloud Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) in your Terraform configuration files.

This page shows you how to manage your databases using the CockroachDB Cloud Terraform provider.

## Before you begin

Before you start this tutorial, you must have [the CockroachBDCloud Terraform provider](https://learn.hashicorp.com/tutorials/terraform/install-cli) set up. Follow the tutorial to [Provision a Cluster with Terraform](provision-a-cluster-with-terraform.html) to start using Terraform with a new cluster.

## Create a new database

1. Add the following variable to your `main.tf` file:

    {% include_cached copy-clipboard.html %}
    ~~~
    variable "{variable-name}" {
      type     = string
      nullable = false
    }
    ~~~
    
    Where `{variable-name}` is the name of the database variable that will be created.

1. Add the following resource to your `main.tf` file:

    {% include_cached copy-clipboard.html %}
    ~~~
    resource "cockroach_database" "{resource-name}" {
      name       = "{database-name}"
      cluster_id = cockroach_cluster.{cluster-name}.id
    }
    ~~~
    
    Where `{resource-name}` is the name of the database resource that will be created, `{database-name}` is the name of the database you want to create, and `{cluster-name}` is the cluster's resource name.
    
1. Add the following line to your  `terraform.tfvars` file:

    {% include_cached copy-clipboard.html %}
    ~~~
    {variable-name}={"database-name"}
    ~~~
    
    Where `{variable-name}` is the name of the database variable added in step 1, and `"database-name"` is the name of the new database you want to create.
    
1. Run the `terraform apply` command in your terminal.

    You will see output similar to the following:
    
    ~~~  
    You will be prompted to enter the value `yes` to apply the changes.

    Terraform used the selected providers to generate the following execution plan.
    Resource actions are indicated with the following symbols:
      + create

    Terraform will perform the following actions:

      # cockroach_database.example-2 will be created
      + resource "cockroach_database" "example-2" {
          + cluster_id  = "63ab0c76-2153-44e4-8957-d7e2b9cd3c89"
          + id          = (known after apply)
          + name        = "bluedog-db-2"
          + table_count = (known after apply)
        }

    Plan: 2 to add, 0 to change, 0 to destroy.

    Changes to Outputs:
      ~ connection_string = "postgresql://maxroach@blue-dog-krp.gcp-us-west2.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=$HOME/Library/CockroachCloud/certs/blue-dog-ca.crt" -> "postgresql://maxroach@blue-dog-krp.gcp-us-west2.cockroachlabs.cloud:26257/bluedog-db-2?sslmode=verify-full&sslrootcert=$HOME/Library/CockroachCloud/certs/blue-dog-ca.crt"

    Do you want to perform these actions?
      Terraform will perform the actions described above.
      Only 'yes' will be accepted to approve.

      Enter a value: yes

    cockroach_database.example-2: Creating...
    cockroach_database.example-2: Creation complete after 2s [id=63ab0c76-2153-44e4-8957-d7e2b9cd3c89:bluedog-db-2]
    ~~~

## Change the name of a database

To change the name of a database, you can edit the value of the database's `name` variable in your `terraform.tfvars` file:

{% include_cached copy-clipboard.html %}
~~~
{variable-name}={"database-renamed"}
~~~

Run the `terraform apply` command in your terminal to apply the changes.

You will see output similar to the following:

~~~
Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  + create
  ~ update in-place

Terraform will perform the following actions:

  # cockroach_database.example-2 will be updated in-place
  ~ resource "cockroach_database" "example-2" {
      ~ id          = "63ab0c76-2153-44e4-8957-d7e2b9cd3c89:bluedog-db-2" -> (known after apply)
      ~ name        = "bluedog-db-2" -> "bluedog-db-renamed"
      ~ table_count = 0 -> (known after apply)
        # (1 unchanged attribute hidden)
    }

Plan: 1 to add, 1 to change, 0 to destroy.

Changes to Outputs:
  ~ connection_string = "postgresql://maxroach@blue-dog-krp.gcp-us-west2.cockroachlabs.cloud:26257/bluedog-db-2?sslmode=verify-full&sslrootcert=$HOME/Library/CockroachCloud/certs/blue-dog-ca.crt" -> "postgresql://maxroach@blue-dog-krp.gcp-us-west2.cockroachlabs.cloud:26257/bluedog-db-renamed?sslmode=verify-full&sslrootcert=$HOME/Library/CockroachCloud/certs/blue-dog-ca.crt"

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

cockroach_database.example-2: Modifying... [id=63ab0c76-2153-44e4-8957-d7e2b9cd3c89:bluedog-db-2]
cockroach_database.example-2: Modifications complete after 0s [id=63ab0c76-2153-44e4-8957-d7e2b9cd3c89:bluedog-db-renamed]
~~~

## Delete a database

To delete a database, delete its corresponding resource and variable from your `main.tf` file, delete the variable value from your `terraform.tfvars` file, and then run the `terraform apply` command in your terminal to apply the changes.

Deleting a database will also permanently delete all data within the database.

You will see output similar to the following:

~~~
Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  - destroy

Terraform will perform the following actions:

  # cockroach_database.example-2 will be destroyed
  # (because cockroach_database.example-2 is not in configuration)
  - resource "cockroach_database" "example-2" {
      - cluster_id  = "63ab0c76-2153-44e4-8957-d7e2b9cd3c89" -> null
      - id          = "63ab0c76-2153-44e4-8957-d7e2b9cd3c89:bluedog-db-renamed" -> null
      - name        = "bluedog-db-renamed" -> null
      - table_count = 0 -> null
    }

Plan: 1 to add, 0 to change, 1 to destroy.

Changes to Outputs:
  ~ connection_string = "postgresql://maxroach@blue-dog-krp.gcp-us-west2.cockroachlabs.cloud:26257/bluedog-db-renamed?sslmode=verify-full&sslrootcert=$HOME/Library/CockroachCloud/certs/blue-dog-ca.crt" -> "postgresql://maxroach@blue-dog-krp.gcp-us-west2.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=$HOME/Library/CockroachCloud/certs/blue-dog-ca.crt"

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

cockroach_database.example-2: Destroying... [id=63ab0c76-2153-44e4-8957-d7e2b9cd3c89:bluedog-db-renamed]
cockroach_database.example-2: Destruction complete after 1s
~~~

## Learn more

- See the [CockroachDB Cloud Terraform provider reference docs](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs) for detailed information on the resources you can manage using Terraform.
- [Provision a Cluster with Terraform](provision-a-cluster-with-terraform.html).
- [Export Logs with Terraform](export-logs-terraform.html).
- [Export Metrics with Terraform](export-metrics-terraform.html).