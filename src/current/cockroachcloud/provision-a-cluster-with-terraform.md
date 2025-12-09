---
title: Use the CockroachDB Cloud Terraform provider
summary: Learn how to provision and manage clusters and other CockroachDB Cloud resources using the CockroachDB Cloud Terraform provider.
toc: true
docs_area: manage
---

[Terraform](https://terraform.io) is an infrastructure-as-code provisioning tool that uses configuration files to define application and network resources. You can provision CockroachDB Cloud clusters and cluster resources by using the [CockroachDB Cloud Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) in your Terraform configuration files.

This page shows how to use the CockroachDB Cloud Terraform provider to create and manage clusters in CockroachDB Cloud. This page is not exhaustive; you can browse an extensive set of [example recipes](https://github.com/cockroachdb/terraform-provider-cockroach/tree/main/examples) in the Terraform provider's GitHub repository.

{{site.data.alerts.callout_info}}
If you used the Terraform provider to manage CockroachDB {{ site.data.products.serverless }} clusters that have been migrated to CockroachDB {{ site.data.products.basic }}, your recipes must be updated to work with CockroachDB {{ site.data.products.basic }}.
{{site.data.alerts.end}}

Watch a demo where we use Terraform to create a CockroachDB Serverless cluster here:

{% include_cached youtube.html video_id="LEytD1eld8M" %}

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="basic"><strong>CockroachDB {{ site.data.products.basic }}</strong></button>
    <button class="filter-button page-level" data-scope="standard"><strong>CockroachDB {{ site.data.products.standard }}</strong></button>
    <button class="filter-button page-level" data-scope="advanced"><strong>CockroachDB {{ site.data.products.advanced }}</strong></button>
</div>

## Before you begin

Before you start this tutorial, you must

- [Install Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli).
- Create a [service account]({% link cockroachcloud/managing-access.md %}#manage-service-accounts) and [API key]({% link cockroachcloud/managing-access.md %}#api-access) in the [CockroachDB Cloud Console](https://cockroachlabs.cloud), and assign it the Cluster Creator or Cluster Admin role at the organization scope. Refer to [Service Accounts]({% link cockroachcloud/authorization.md %}#service-accounts).

## Create the Terraform configuration file

{% comment %}Steps that are common{% endcomment %}
{% capture remaining_steps %}
1. Create an environment variable named `COCKROACH_API_KEY`. Copy the [API key]({% link cockroachcloud/managing-access.md %}#api-access) from the CockroachDB Cloud console and create the `COCKROACH_API_KEY` environment variable:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export COCKROACH_API_KEY={API key}
    ~~~

    Where `{API key}` is the API key you copied from the CockroachDB Cloud Console.

## Provision a cluster

1. Initialize the provider:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    terraform init -upgrade
    ~~~

    This reads the `main.tf` configuration file. The `-upgrade` flag ensures you are using the latest version of the provider.

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

Terraform reports the actions it will take. Verify the details, then type `yes` to apply the changes.
{% endcapture %}

<section class="filter-content" markdown="1" data-scope="basic">

In this tutorial, you will create a CockroachDB {{ site.data.products.basic }} cluster.

1. In a terminal create a new file named `main.tf` with the following contents:

    {% include_cached copy-clipboard.html %}
    ~~~ hcl
    terraform {
      required_providers {
        cockroach = {
          source = "cockroachdb/cockroach"
        }
      }
    }

    resource "cockroach_cluster" "basic" {
      name           = "cockroach-basic"
      cloud_provider = "GCP"
      plan           = "BASIC"
      serverless     = {}
      regions = [
        {
          name = "us-east1"
        }
      ]
      delete_protection = false
    }
    ~~~
      - Optionally, include the `version` attribute in the `cockroach` nested block to specify a version of the provider. If you do not include the `version` attribute, Terraform will use the latest provider version.
      - Replace `cockroach-basic` with a name for the cluster.
      - Set `cloud_provider` to `AWS` `AZURE`, or `GCP`.
      - Under `serverless {}`, optionally set values for `resource_unit_limit` and `storage_mib_limits`.
      - Under `regions`, add the names of one or more regions for the cluster.
      - To optionally enable [deletion protection]({% link cockroachcloud/basic-cluster-management.md %}#enable-deletion-protection), set `delete_protection` to `true`.
{{ remaining_steps }}

{{site.data.alerts.callout_success}}
To change a cluster's plan in place between CockroachDB {{ site.data.products.basic }} and CockroachDB {{ site.data.products.standard }}, refer to [Change a cluster's plan](#change-a-clusters-plan).
{{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="standard">

{{site.data.alerts.callout_info}}
CockroachDB Standard is currently in [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

In this tutorial, you will create a CockroachDB {{ site.data.products.standard }} cluster.

1. In a terminal create a new file named `main.tf` with the following contents:

    {% include_cached copy-clipboard.html %}
    ~~~ hcl
    terraform {
      required_providers {
        cockroach = {
          source = "cockroachdb/cockroach"
        }
      }
    }

    resource "cockroach_cluster" "standard" {
      name           = "cockroach-standard"
      cloud_provider = "GCP"
      plan           = "STANDARD"
      serverless = {
        usage_limits = {
          provisioned_virtual_cpus = 2
        }
      }
      regions = [
        {
          name = "us-east1"
        }
      ]
      delete_protection = false
    }
    ~~~
      - Optionally, include the `version` attribute in the `cockroach` nested block to specify a version of the provider. If you do not include the `version` attribute, Terraform will use the latest provider version.
      - Replace `cockroach-standard` with a name for the cluster.
      - Set `cloud_provider` to `AWS` `AZURE`, or `GCP`.
      - Under `usage_limits`, set `provisioned_virtual_cpus` to the required maximum vCPUs for the cluster.
      - Under `regions`, add the names of one or more regions for the cluster.
      - To optionally enable [deletion protection]({% link cockroachcloud/basic-cluster-management.md %}#enable-deletion-protection), set `delete_protection` to `true`.

    {% include cockroachcloud/backups/provision-cluster-tf-managed-backups.md %}
{{ remaining_steps }}

{{site.data.alerts.callout_success}}
To change a cluster's plan in place between CockroachDB {{ site.data.products.basic }} and CockroachDB {{ site.data.products.standard }}, refer to [Change a cluster's plan](#change-a-clusters-plan).
{{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

In this tutorial, you will create a CockroachDB {{ site.data.products.advanced }} cluster.

1. In a terminal create a new file named `main.tf` with the following contents:

    {% include_cached copy-clipboard.html %}
    ~~~ hcl
    terraform {
      required_providers {
        cockroach = {
          source = "cockroachdb/cockroach"
        }
      }
    }

    resource "cockroach_cluster" "advanced" {
      name           = "cockroach-advanced"
      cloud_provider = "GCP"
      plan           = "ADVANCED"
      dedicated = {
        storage_gib = 15
        num_virtual_cpus = 4
      }
      regions = [
        {
          name       = "us-central1"
          node_count = 1
        }
      ]
      delete_protection = true
    }
    ~~~
      - Optionally, include the `version` attribute in the `cockroach` nested block to specify a version of the provider. If you do not include the `version` attribute, Terraform will use the latest provider version.
      - Replace `cockroach-advanced` with a name for the cluster.
      - Set `cloud_provider` to `AWS` `AZURE`, or `GCP`.
      - Under `dedicated`, set `storage_gib` to a value large enough to contain the cluster's expected data. Set `num_virtual_cpus` to the number of vCPUs per node.
      - Under `regions`, add the names of one or more regions for the cluster and specify the `node_count`, or the number of nodes, per region.
      - To optionally enable [deletion protection]({% link cockroachcloud/basic-cluster-management.md %}#enable-deletion-protection), set `delete_protection` to `true`.
    
    {% include cockroachcloud/backups/provision-cluster-tf-managed-backups.md %}
{{ remaining_steps }}

</section>

## Get information about a cluster

The `terraform show` command shows detailed information of your cluster resources.

{% include_cached copy-clipboard.html %}
~~~ shell
terraform show
~~~

## Change a cluster's plan

To change a CockroachDB {{ site.data.products.basic }} cluster's plan to CockroachDB {{ site.data.products.standard }} in place, or to change a CockroachDB {{ site.data.products.standard }} cluster to CockroachDB {{ site.data.products.basic }} using Terraform or the [CockroachDB {{ site.data.products.cloud }} API](https://cockroachlabs.com/docs/api/cloud/v1.html#patch-/api/v1/clusters/-cluster_id-).

{{site.data.alerts.callout_info}}
To migrate between CockroachDB {{ site.data.products.advanced }} and either CockroachDB {{ site.data.products.standard }} or CockroachDB {{ site.data.products.basic }}, you must create and configure a new cluster, create a self-managed backup of the existing cluster's data, and restore the backup to the new cluster. Refer to [Back up a CockroachDB {{ site.data.products.cloud }} cluster and restore into a new cluster]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}#back-up-a-cockroachdb-cloud-cluster-and-restore-into-a-new-cluster). Migration in place is not supported.
{{site.data.alerts.end}}

To migrate from CockroachDB {{ site.data.products.basic }} to CockroachDB {{ site.data.products.standard }} in place:

1. Edit the cluster's Terraform template:
    - Change `plan` to `STANDARD`.
    - Replace the contents of `serverless {}` (which may be empty) with the provisioned vCPUs for the cluster. This field is required for CockroachDB {{ site.data.products.standard }}. It is not possible to set storage limitations on CockroachDB {{ site.data.products.standard }}.
      {% include_cached copy-clipboard.html %}
      ~~~ hcl
        serverless = {
          usage_limits = {
            provisioned_virtual_cpus = 2
          }
        }
      ~~~
1. Apply the template:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    terraform apply
    ~~~

To change a cluster's plan from CockroachDB {{ site.data.products.standard }} to CockroachDB {{ site.data.products.basic }} in place:

1. Edit the cluster's Terraform template:
    -  Change `plan` to `BASIC`.
    - Replace the contents of `serverless {...}` with optional limits for Request Units and Storage. The `provisioned_virtual_cpus` field is not supported on CockroachDB {{ site.data.products.basic }}.
      {% include_cached copy-clipboard.html %}
      ~~~ hcl
        serverless = {
          usage_limits = {
            request_unit_limit = 4000
            storage_mib_limit = 2000
          }
        }
      ~~~
    - Remove configurations for features that are unsupported on CockroachDB {{ site.data.products.basic }}, such as private connectivity. Otherwise, applying the template will fail.
1. Apply the template:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    terraform apply
    ~~~

To use the CockroachDB {{ site.data.products.cloud }} API to switch a cluster's plan in place between {{ site.data.products.basic }} and {{ site.data.products.standard }}, send a `PATCH` request to the [`clusters/{cluster_id}` endpoint](https://cockroachlabs.com/docs/api/cloud/v1.html#patch-/api/v1/clusters/-cluster_id-) updating the `plan` and `serverless.usage_limits` as needed. The following example sets the `plan` to `STANDARD` and updates the `usage_limits` to provision VCPUs as required for a {{ site.data.products.standard }} plan:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PATCH \ --url  https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
--header "Authorization: Bearer <your_api_key>" \
--json '{"plan":"STANDARD","serverless":{"usage_limits":{"provisioned_virtual_cpus": 2}}}'
~~~

## Delete a cluster

{{site.data.alerts.callout_danger}}
Sending a `destory` command permanently deletes the cluster and all the data within the cluster. Deleted clusters can not be restored.
{{site.data.alerts.end}}

If you want to delete a cluster managed by Terraform, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
terraform destroy
~~~

Enter `yes` when prompted to delete the cluster.

## Next steps

- Read the [CockroachDB Cloud Terraform provider reference docs](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs) in the Terraform registry, which provide detailed information on the resources you can manage using Terraform.
- Browse the [example recipes](https://github.com/cockroachdb/terraform-provider-cockroach/tree/main/examples) in the Terraform Provider's GitHub repository.
- Refer to the [Managed Backups]({% link cockroachcloud/managed-backups.md %}#cockroachdb-cloud-terraform-provider) page to configure the managed backups for your CockroachDB {{ site.data.products.cloud }} cluster.
