---
title: Prepare a CockroachDB Cloud BYOC Deployment
summary: Prepare a cloud service account to self-host a CockroachDB Cloud deployment with the BYOC model
toc: true
keywords: deployment, byoc
---

CockroachDB {{ site.data.products.cloud }} supports a "bring your own cloud" (BYOC) deployment model, where CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} is hosted in your own account rather than in an account managed by Cockroach Labs. This model allows you to take more control of security and take advantage of existing cloud service credits or discounts.

{{site.data.alerts.callout_info}}
The BYOC {{ site.data.products.cloud }} deployment option is currently in [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}). BYOC deployments are only supported in Microsoft Azure.
{{site.data.alerts.end}}

This page describes how to prepare a cloud service account to host a BYOC deployment of CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} in Microsoft Azure.

## Shared responsibility model for BYOC

In any CockroachDB {{ site.data.products.cloud }} deployment, responsibility for a successful and healthy deployment is [split between you and Cockroach Labs]({% link cockroachcloud/production-checklist.md %}). In a BYOC deployment, all of the [CockroachDB {{ site.data.products.cloud }} infrastructure]({% link cockroachcloud/plan-your-cluster-advanced.md %}#advanced-cluster-architecture) except the control plane lives in an account under your control which involves additional responsibilities under the shared model.

The following table describes the split of responsibilities between you and Cockroach Labs in the shared responsibility model for BYOC:

Area        | Cockroach Labs responsibility | Customer responsibility
:----------:|:-----------------------------:|:----------------------:
Uptime      | Ensure 99.999% cluster uptime | Ensure that clusters remain accessible
Deployments | Automate cluster provisioning and scaling, provide hardware best practices | Provision new cloud service accounts and grant IAM permissions for Cockroach Labs to create and manage clusters
Upgrades    | Provide automatic minor/patch upgrades and major upgrade automation via Terraform, APIs, or the {{ site.data.products.cloud }} Console | Initiate major version upgrades, set maintenance windows if applicable
Workload    | Troubleshoot problems as they pertain to cluster availability | Size clusters to manage workload requirements, tune performance, and adjust schema designs with support from Cockroach Labs
Backups     | Initialize backup schedule and write to customer-owned Cloud storage, ensure backup jobs run successfully | Configure backup schedule to meet RPO/RTO requirements
Support     | Reactively and proactively identify and resolve availability-impacting incidents | Ensure sufficient hardware is made available and appropriate IAM permissions are maintained at all times
Billing     | Meter vCPUs consumed, charge for vCPU consumption at the per-minute level | Negotiate with cloud service provider, manage infrastructure spend and discounts

## Prerequisites

- Create a CockroachDB {{ site.data.products.cloud }} organization if you do not already have one. 

- The BYOC deployment option is not available by default and must be requested. Reach out to your account team to have BYOC enabled for your {{ site.data.products.cloud }} organization.

- Cluster creation and management for BYOC deployments is handled using the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}). Create a service account and [API key]({% link cockroachcloud/managing-access.md %}#api-access) if you do not have one.

- Review the [Plan a CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %}) documentation to plan your cluster sizing and resource allocation.

## Step 1. Create a new Azure subscription

Provision a new Azure subscription with no existing infrastructure, dedicated to your Cockroach {{ site.data.products.cloud }} deployment. The account configuration for BYOC requires you to grant Cockroach Labs permissions to access and modify resources in this subscription, so this step is necessary to isolate these permissions from non-Cockroach Cloud resources. This subscription can be reused for multiple CockroachDB clusters.

## Step 2. Grant IAM permissions to Cockroach Labs

When BYOC is enabled for your account, Cockroach Labs provisions a multi-tenant App Registration associated with your CockroachDB {{ site.data.products.cloud }} organization and provides you with a URL to grant tenant-wide admin consent to the application. Visit this URL with a user account that is [authorized to consent on behalf of your organization](https://learn.microsoft.com/entra/identity/enterprise-apps/grant-admin-consent?pivots=portal#prerequisites).

Once the Cockroach Labs App Registration has been granted admin consent in the tenant, grant the following set of roles to the app:

- `Role Based Access Control Administrator`
- `Azure Kubernetes Service Cluster User Role`
- `Azure Kubernetes Service Contributor Role`
- `Azure Kubernetes Service RBAC Cluster Admin`
- `Managed Identity Contributor`
- `Network Contributor`
- `Storage Account Contributor`
- `Storage Blob Data Contributor`
- `Virtual Machine Contributor`
- A custom role, `Resource Group Manager`, with the following permissions:
  - `Microsoft.Resources/subscriptions/resourceGroups/read`
  - `Microsoft.Resources/subscriptions/resourceGroups/write`
  - `Microsoft.Resources/subscriptions/resourceGroups/delete`
  - `Microsoft.Resources/subscriptions/resourceGroups/moveResources/action`
  - `Microsoft.Resources/subscriptions/resourceGroups/validateMoveResources/action`
  - `Microsoft.Resources/subscriptions/resourcegroups/deployments/read`
  - `Microsoft.Resources/subscriptions/resourcegroups/deployments/write`
  - `Microsoft.Resources/subscriptions/resourcegroups/resources/read`
  - `Microsoft.Resources/subscriptions/resourcegroups/deployments/operations/read`
  - `Microsoft.Resources/subscriptions/resourcegroups/deployments/operationstatuses/read`

The custom `Resource Group Manager` role is required to create and manage resource groups in the subscription. This role is used instead of requesting the more broad `Contributor` role.

## Step 3. Register resource providers

Register the following [resource providers](https://learn.microsoft.com/azure/azure-resource-manager/management/resource-providers-and-types) in the Azure subscription:

- `Microsoft.ContainerService`
- `Microsoft.ManagedIdentity`
- `Microsoft.Network`
- `Microsoft.Quota`
- `Microsoft.Storage`

## Step 4. Create the CockroachDB {{ site.data.products.cloud }} cluster

In BYOC deployments, CockroachDB clusters are deployed with the {{ site.data.products.cloud }} API and must use the {{ site.data.products.advanced }} plan. Follow the API documentation to [create a CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} cluster]({% link cockroachcloud/cloud-api.md %}#create-an-advanced-cluster).

The following example request creates a 3-node {{ site.data.products.advanced }} cluster in the `centralus` region, specifying the `subscription-id` and `customer-tenant-id` associated with your Azure subscription:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
  --url https://cockroachlabs.cloud/api/v1/clusters \
  --header "Authorization: Bearer {secret_key}" \
  --json '{
    "name":"byoc-azure-cluster-1",
    "provider": "AZURE",
    "plan": "ADVANCED",
    "spec": {
      "customer_cloud_account": {
        "azure": {
          "subscription_id": "{subscription-id}",
          "tenant_id": "{customer-tenant-id}"
        }
      },
      "dedicated": {
        "hardware": {
          "machine_spec": {
            "num_virtual_cpus": 4
          },
          "storage_gib": 16
        },
        "region_nodes": {
          "centralus": 3
        }
      }
    }
  }'
~~~

## Next steps

- [Connect to your cluster]({% link cockroachcloud/connect-to-an-advanced-cluster.md %})
- [Manage your cluster using the {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %})
- [Prepare your deployment for production]({% link cockroachcloud/production-checklist.md %})