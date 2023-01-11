---
title: Provision a CockroachDB Cloud Cluster with Terraform
summary: Learn how to provision a cluster using the CockroachDB Cloud Terraform provider.
toc: true
docs_area: manage
---

[Terraform](https://terraform.io) is an infrastructure-as-code provisioning tool that uses configuration files to define application and network resources. You can provision CockroachDB Cloud clusters and cluster resources by using the [CockroachDB Cloud Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) in your Terraform configuration files.

This tutorial shows you how to provision a CockroachDB Cloud cluster using the CockroachDB Cloud Terraform provider.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="serverless"><strong>{{ site.data.products.serverless }}</strong></button>
    <button class="filter-button page-level" data-scope="dedicated"><strong>{{ site.data.products.dedicated }}</strong></button>
</div>

## Before you begin

Before you start this tutorial, you must

- [Install Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli).
- Install the [`wget` command line utility](https://www.gnu.org/software/wget/).
- Create a [service account](console-access-management.html#service-accounts) and [API key](console-access-management.html#api-access) in the [CockroachDB Cloud Console](https://cockroachlabs.cloud).

## Create the Terraform configuration files

Terraform uses a infrastructure-as-code approach to managing resources. Terraform configuration files allow you to define resources declaratively and let Terraform manage their lifecycle.

<section class="filter-content" markdown="1" data-scope="serverless">

In this tutorial, you will create a {{ site.data.products.serverless }} cluster with a spend limit of $0.

1. In a terminal create a new directory and use `wget` to download the {{ site.data.products.serverless }} `main.tf` example file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    wget https://raw.githubusercontent.com/cockroachdb/terraform-provider-cockroach/main/examples/workflows/cockroach_serverless_cluster/main.tf
    ~~~

1. In a text editor create a new file `terraform.tfvars` with the following settings:
    
    {% include_cached copy-clipboard.html %}
    ~~~
    cluster_name = "{cluster name}"
    sql_user_name = "{SQL user name}"
    sql_user_password = "{SQL user password}"
    ~~~

    Where:
    - `{cluster name}` is the name of the cluster you want to create.
    - `{SQL user name}` is the name of the SQL user you want to create.
    - `{SQL user password}` is the password for the SQL user you want to create.

    For example, the following `terraform.tfvars` file creates a {{ site.data.products.serverless }} with a `maxroach` SQL user.

    {% include_cached copy-clipboard.html %}
    ~~~
    cluster_name = "dim-dog"
    sql_user_name = "maxroach"
    sql_user_password = "NotAGoodPassword"
    ~~~

1. Create an environment variable named `COCKROACH_API_KEY`. Copy the [API key](console-access-management.html#api-access) from the CockroachDB Cloud console and create the `COCKROACH_API_KEY` environment variable:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export COCKROACH_API_KEY={API key}
    ~~~

    Where `{API key}` is the API key you copied from the CockroachDB Cloud Console.

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

In this tutorial, you will create a {{ site.data.products.dedicated }} cluster

1. In a terminal create a new directory and use `wget` to download the {{ site.data.products.dedicated }} `main.tf` example file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    wget https://raw.githubusercontent.com/cockroachdb/terraform-provider-cockroach/main/examples/workflows/cockroach_dedicated_cluster/main.tf
    ~~~

1. In a text editor create a new file `terraform.tfvars` with the following settings:

    {% include_cached copy-clipboard.html %}
    ~~~
    cluster_name = "{cluster name}"
    sql_user_name = "{SQL user name}"
    sql_user_password = "{SQL user password}"
    cloud_provider = "{cloud provider}"
    cloud_provider_regions = ["{cloud provider region}"]
    cluster_node_count = {number of nodes}
    storage_gib = {storage in GiB}
    machine_type = "{cloud provider machine type}"
    allow_list_name = "{allow list name}"
    cidr_ip = "{allow list CIDR IP}"
    cidr_mask = {allow list CIDR mask}
    ~~~

    Where:
       - `{cluster name}` is the name of the cluster you want to create.
       - `{SQL user name}` is the name of the SQL user you want to create.
       - `{SQL user password}` is the password for the SQL user you want to create.
       - `{cloud provider}` is the cloud infrastructure provider. Possible values are `GCP` or `AWS`.
       - `{cloud provider regions}` is the region code or codes for the cloud infrastructure provider. For multi-region clusters, separate each region with a comma.
       - `{number of nodes}` is the number of nodes in each region. Cockroach Labs recommends at least 3 nodes per region, and the same number of nodes in each region for multi-region clusters.
       - `{storage in GiB}` is the amount of storage specified in GiB.
       - `{cloud provider machine type}` is the machine type for the cloud infrastructure provider.
       - `{allow list name}` is the name for the [IP allow list](network-authorization.html#ip-allowlisting). Use a descriptive name to identify the IP allow list.
       - `{allow list CIDR IP}` is the Classless Inter-Domain Routing (CIDR) IP address base.
       - `{allow list CIDR mask}` is the CIDR mask.

    For example, the following `terraform.tfvars` file creates a single region 3 node {{ site.data.products.dedicated }} cluster and sets an IP allowlist for a single IP address.

    {% include_cached copy-clipboard.html %}
    ~~~
    cluster_name = "dim-dog"
    sql_user_name = "maxroach"
    sql_user_password = "NotAGoodPassword"
    cloud_provider = "GCP"
    cloud_provider_regions = ["us-west2"]
    cluster_node_count = 3
    storage_gib = 15
    machine_type = "n1-standard-2"
    allow_list_name = "Max's home network"
    cidr_ip = "1.2.3.4"
    cidr_mask = 32
    ~~~

1. Create an environment variable named `COCKROACH_API_KEY`. Copy the [API key](console-access-management.html#api-access) from the CockroachDB Cloud console and create the `COCKROACH_API_KEY` environment variable:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export COCKROACH_API_KEY={API key}
    ~~~

    Where `{API key}` is the API key you copied from the CockroachDB Cloud Console.

</section>

## Provision the cluster

1. Initialize the provider:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    terraform init -upgrade
    ~~~

    This reads the `main.tf` configuration file and uses the `terraform.tfvars` file for settings specific to your cluster. The `-upgrade` flag ensures you are using the latest version of the provider.

1. Create the Terraform plan. This shows the actions the provider will take, but won't perform them:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    terraform plan
    ~~~

1. Create the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    terraform apply
    ~~~

    Enter `yes` when prompted to apply the plan and create the cluster.

You will see output similar to the following:

<section class="filter-content" markdown="1" data-scope="serverless">

~~~
Terraform used the selected providers to generate the following execution
plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # cockroach_cluster.example will be created
  + resource "cockroach_cluster" "example" {
      + account_id        = (known after apply)
      + cloud_provider    = "GCP"
      + cockroach_version = (known after apply)
      + creator_id        = (known after apply)
      + id                = (known after apply)
      + name              = "dim-dog"
      + operation_status  = (known after apply)
      + plan              = (known after apply)
      + regions           = [
          + {
              + name       = "us-central1"
              + node_count = (known after apply)
              + sql_dns    = (known after apply)
              + ui_dns     = (known after apply)
            },
        ]
      + serverless        = {
          + routing_id  = (known after apply)
          + spend_limit = 0
        }
      + state             = (known after apply)
    }

  # cockroach_sql_user.example will be created
  + resource "cockroach_sql_user" "example" {
      + cluster_id = (known after apply)
      + id         = (known after apply)
      + name       = "maxroach"
      + password   = (sensitive value)
    }

Plan: 2 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

cockroach_cluster.example: Creating...
cockroach_cluster.example: Creation complete after 5s [id=1aaae1f8-19e2-4653-ba62-db16de2a84b9]
cockroach_sql_user.example: Creating...
cockroach_sql_user.example: Creation complete after 2s [id=1aaae1f8-19e2-4653-ba62-db16de2a84b9:maxroach]

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.
~~~

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

~~~
Terraform used the selected providers to generate the following execution
plan. Resource actions are indicated with the following symbols:
  + create
 <= read (data resources)

Terraform will perform the following actions:

  # data.cockroach_cluster.example will be read during apply
  # (config refers to values not yet known)
 <= data "cockroach_cluster" "example" {
      + account_id        = (known after apply)
      + cloud_provider    = (known after apply)
      + cockroach_version = (known after apply)
      + creator_id        = (known after apply)
      + dedicated         = {
          + disk_iops        = (known after apply)
          + machine_type     = (known after apply)
          + memory_gib       = (known after apply)
          + num_virtual_cpus = (known after apply)
          + storage_gib      = (known after apply)
        } -> (known after apply)
      + id                = (known after apply)
      + name              = (known after apply)
      + operation_status  = (known after apply)
      + plan              = (known after apply)
      + regions           = [
        ] -> (known after apply)
      + serverless        = {
          + routing_id  = (known after apply)
          + spend_limit = (known after apply)
        } -> (known after apply)
      + state             = (known after apply)
    }

  # cockroach_allow_list.example will be created
  + resource "cockroach_allow_list" "example" {
      + cidr_ip    = "1.2.3.4"
      + cidr_mask  = 32
      + cluster_id = (known after apply)
      + id         = (known after apply)
      + name       = "Max's home network"
      + sql        = true
      + ui         = true
    }

  # cockroach_cluster.example will be created
  + resource "cockroach_cluster" "example" {
      + account_id        = (known after apply)
      + cloud_provider    = "GCP"
      + cockroach_version = "v22.2"
      + creator_id        = (known after apply)
      + dedicated         = {
          + disk_iops        = (known after apply)
          + machine_type     = "n1-standard-2"
          + memory_gib       = (known after apply)
          + num_virtual_cpus = (known after apply)
          + storage_gib      = 15
        }
      + id                = (known after apply)
      + name              = "dim-dog"
      + operation_status  = (known after apply)
      + plan              = (known after apply)
      + regions           = [
          + {
              + name       = "us-west2"
              + node_count = 3
              + sql_dns    = (known after apply)
              + ui_dns     = (known after apply)
            },
        ]
      + state             = (known after apply)
    }

  # cockroach_sql_user.example will be created
  + resource "cockroach_sql_user" "example" {
      + cluster_id = (known after apply)
      + id         = (known after apply)
      + name       = "maxroach"
      + password   = (sensitive value)
    }

Plan: 3 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + cluster = {
      + account_id        = (known after apply)
      + cloud_provider    = (known after apply)
      + cockroach_version = (known after apply)
      + creator_id        = (known after apply)
      + dedicated         = (known after apply)
      + id                = (known after apply)
      + name              = (known after apply)
      + operation_status  = (known after apply)
      + plan              = (known after apply)
      + regions           = (known after apply)
      + serverless        = (known after apply)
      + state             = (known after apply)
    }

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

cockroach_cluster.example: Creating...
...
cockroach_cluster.example: Still creating... [22m10s elapsed]
cockroach_cluster.example: Creation complete after 22m14s [id=2697e5de-73e6-4d67-a4b4-2b2075dc2dfe]
data.cockroach_cluster.example: Reading...
cockroach_sql_user.example: Creating...
cockroach_allow_list.example: Creating...
data.cockroach_cluster.example: Read complete after 0s [id=2697e5de-73e6-4d67-a4b4-2b2075dc2dfe]
cockroach_allow_list.example: Creation complete after 0s [id=2697e5de-73e6-4d67-a4b4-2b2075dc2dfe:76.14.55.13/32]
cockroach_sql_user.example: Creation complete after 2s [id=2697e5de-73e6-4d67-a4b4-2b2075dc2dfe:maxroach]

Apply complete! Resources: 3 added, 0 changed, 0 destroyed.

Outputs:

cluster = {
  "account_id" = tostring(null)
  "cloud_provider" = "GCP"
  "cockroach_version" = "v22.2.0"
  "creator_id" = tostring(null)
  "dedicated" = {
    "disk_iops" = 450
    "machine_type" = "n1-standard-2"
    "memory_gib" = 7.5
    "num_virtual_cpus" = 2
    "storage_gib" = 15
  }
  "id" = "2697e5de-73e6-4d67-a4b4-2b2075dc2dfe"
  "name" = "dim-dog"
  "operation_status" = "CLUSTER_STATUS_UNSPECIFIED"
  "plan" = "DEDICATED"
  "regions" = tolist([
    {
      "name" = "us-west2"
      "node_count" = 3
      "sql_dns" = "dim-dog-gwq.gcp-us-west2.cockroachlabs.cloud"
      "ui_dns" = "admin-dim-dog-gwq.gcp-us-west2.cockroachlabs.cloud"
    },
  ])
  "serverless" = null /* object */
  "state" = "CREATED"
}
~~~

</section>

## Get information about your cluster

The `terraform show` command shows detailed information of your cluster resources.

{% include_cached copy-clipboard.html %}
~~~ shell
terraform show
~~~

This will show the following output:

<section class="filter-content" markdown="1" data-scope="serverless">

~~~
# cockroach_cluster.example:
resource "cockroach_cluster" "example" {
    cloud_provider    = "GCP"
    cockroach_version = "v22.1"
    creator_id        = "98e75f0a-072b-44dc-95d2-cc36cd425cab"
    id                = "1aaae1f8-19e2-4653-ba62-db16de2a84b9"
    name              = "dim-dog"
    operation_status  = "CLUSTER_STATUS_UNSPECIFIED"
    plan              = "SERVERLESS"
    regions           = [
        # (1 unchanged element hidden)
    ]
    serverless        = {
        routing_id  = "dim-dog-6821"
        spend_limit = 0
    }
    state             = "CREATED"
}

# cockroach_sql_user.example:
resource "cockroach_sql_user" "example" {
    cluster_id = "1aaae1f8-19e2-4653-ba62-db16de2a84b9"
    id         = "1aaae1f8-19e2-4653-ba62-db16de2a84b9:maxroach"
    name       = "maxroach"
    password   = (sensitive value)
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

~~~
# cockroach_allow_list.example:
resource "cockroach_allow_list" "example" {
    cidr_ip    = "1.2.3.4"
    cidr_mask  = 32
    cluster_id = "2697e5de-73e6-4d67-a4b4-2b2075dc2dfe"
    id         = "2697e5de-73e6-4d67-a4b4-2b2075dc2dfe:76.14.55.13/32"
    name       = "Max's home network"
    sql        = true
    ui         = true
}

# cockroach_cluster.example:
resource "cockroach_cluster" "example" {
    account_id        = "crl-prod-gwq"
    cloud_provider    = "GCP"
    cockroach_version = "v22.2"
    creator_id        = "98e75f0a-072b-44dc-95d2-cc36cd425cab"
    dedicated         = {
        disk_iops        = 450
        machine_type     = "n1-standard-2"
        memory_gib       = 7.5
        num_virtual_cpus = 2
        storage_gib      = 15
    }
    id                = "2697e5de-73e6-4d67-a4b4-2b2075dc2dfe"
    name              = "dim-dog"
    operation_status  = "CLUSTER_STATUS_UNSPECIFIED"
    plan              = "DEDICATED"
    regions           = [
        # (1 unchanged element hidden)
    ]
    state             = "CREATED"
}

# cockroach_sql_user.example:
resource "cockroach_sql_user" "example" {
    cluster_id = "2697e5de-73e6-4d67-a4b4-2b2075dc2dfe"
    id         = "2697e5de-73e6-4d67-a4b4-2b2075dc2dfe:maxroach"
    name       = "maxroach"
    password   = (sensitive value)
}

# data.cockroach_cluster.example:
data "cockroach_cluster" "example" {
    cloud_provider    = "GCP"
    cockroach_version = "v22.2.0"
    dedicated         = {
        disk_iops        = 450
        machine_type     = "n1-standard-2"
        memory_gib       = 7.5
        num_virtual_cpus = 2
        storage_gib      = 15
    }
    id                = "2697e5de-73e6-4d67-a4b4-2b2075dc2dfe"
    name              = "dim-dog"
    operation_status  = "CLUSTER_STATUS_UNSPECIFIED"
    plan              = "DEDICATED"
    regions           = [
        # (1 unchanged element hidden)
    ]
    state             = "CREATED"
}


Outputs:

cluster = {
    account_id        = null
    cloud_provider    = "GCP"
    cockroach_version = "v22.2.0"
    creator_id        = null
    dedicated         = {
        disk_iops        = 450
        machine_type     = "n1-standard-2"
        memory_gib       = 7.5
        num_virtual_cpus = 2
        storage_gib      = 15
    }
    id                = "2697e5de-73e6-4d67-a4b4-2b2075dc2dfe"
    name              = "dim-dog"
    operation_status  = "CLUSTER_STATUS_UNSPECIFIED"
    plan              = "DEDICATED"
    regions           = [
        {
            name       = "us-west2"
            node_count = 3
            sql_dns    = "dim-dog-gwq.gcp-us-west2.cockroachlabs.cloud"
            ui_dns     = "admin-dim-dog-gwq.gcp-us-west2.cockroachlabs.cloud"
        },
    ]
    serverless        = null
    state             = "CREATED"
}
~~~

</section>

## Delete the cluster

If you want to delete the cluster, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
terraform destroy
~~~

Enter `yes` when prompted to delete the cluster.

You will see output similar to the following:

<section class="filter-content" markdown="1" data-scope="serverless">

~~~
cockroach_cluster.example: Refreshing state... [id=1aaae1f8-19e2-4653-ba62-db16de2a84b9]
cockroach_sql_user.example: Refreshing state... [id=1aaae1f8-19e2-4653-ba62-db16de2a84b9:maxroach]

Terraform used the selected providers to generate the following execution
plan. Resource actions are indicated with the following symbols:
  - destroy

Terraform will perform the following actions:

  # cockroach_cluster.example will be destroyed
...
Plan: 0 to add, 0 to change, 2 to destroy.

Do you really want to destroy all resources?
  Terraform will destroy all your managed infrastructure, as shown above.
  There is no undo. Only 'yes' will be accepted to confirm.

  Enter a value: yes

cockroach_sql_user.example: Destroying... [id=1aaae1f8-19e2-4653-ba62-db16de2a84b9:maxroach]
cockroach_sql_user.example: Destruction complete after 1s
cockroach_cluster.example: Destroying... [id=1aaae1f8-19e2-4653-ba62-db16de2a84b9]
cockroach_cluster.example: Destruction complete after 1s

Destroy complete! Resources: 2 destroyed.
~~~

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

~~~
cockroach_cluster.example: Refreshing state... [id=2697e5de-73e6-4d67-a4b4-2b2075dc2dfe]
cockroach_sql_user.example: Refreshing state... [id=2697e5de-73e6-4d67-a4b4-2b2075dc2dfe:maxroach]
cockroach_allow_list.example: Refreshing state... [id=2697e5de-73e6-4d67-a4b4-2b2075dc2dfe:76.14.55.13/32]
data.cockroach_cluster.example: Reading...
data.cockroach_cluster.example: Read complete after 0s [id=2697e5de-73e6-4d67-a4b4-2b2075dc2dfe]

Terraform used the selected providers to generate the following execution
plan. Resource actions are indicated with the following symbols:
  - destroy

Terraform will perform the following actions:

  # cockroach_allow_list.example will be destroyed
...

Plan: 0 to add, 0 to change, 3 to destroy.

...

Do you really want to destroy all resources?
  Terraform will destroy all your managed infrastructure, as shown above.
  There is no undo. Only 'yes' will be accepted to confirm.

  Enter a value: yes

cockroach_sql_user.example: Destroying... [id=2697e5de-73e6-4d67-a4b4-2b2075dc2dfe:maxroach]
cockroach_allow_list.example: Destroying... [id=2697e5de-73e6-4d67-a4b4-2b2075dc2dfe:76.14.55.13/32]
cockroach_allow_list.example: Destruction complete after 1s
cockroach_sql_user.example: Destruction complete after 3s
cockroach_cluster.example: Destroying... [id=2697e5de-73e6-4d67-a4b4-2b2075dc2dfe]
cockroach_cluster.example: Destruction complete after 2s

Destroy complete! Resources: 3 destroyed.
~~~

</section>

## Next steps

The [CockroachDB Cloud Terraform provider reference docs](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs) provide detailed information on the resources you can manage using Terraform.