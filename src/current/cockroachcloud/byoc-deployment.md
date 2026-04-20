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

In any CockroachDB {{ site.data.products.cloud }} deployment, responsibility for a successful and healthy deployment is [split between you and Cockroach Labs]({% link cockroachcloud/production-checklist.md %}). In a BYOC deployment, all of the [CockroachDB {{ site.data.products.cloud }} infrastructure]({% link cockroachcloud/plan-your-cluster-advanced.md %}#advanced-cluster-architecture) except the control plane lives in an account under your control, which means that you incur additional responsibilities under the shared model.

The following table describes the split of responsibilities between you and Cockroach Labs in the shared responsibility model for BYOC:

Area        | Cockroach Labs responsibility | Customer responsibility
:----------:|:-----------------------------:|:----------------------:
Uptime      | Ensure 99.999% cluster uptime | Ensure that clusters remain accessible
Deployments | Automate cluster provisioning and scaling, provide hardware best practices | Provision new cloud service accounts and grant IAM permissions for Cockroach Labs to create and manage clusters
Upgrades    | Provide automatic minor/patch upgrades and major upgrade automation via Terraform, APIs, or the {{ site.data.products.cloud }} Console | Initiate [major version upgrades]({% link cockroachcloud/upgrade-cockroach-version.md %}), [set maintenance windows]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window) if applicable
Workload    | Troubleshoot problems as they pertain to cluster availability | [Size clusters]({% link cockroachcloud/advanced-cluster-management.md %}#scale-your-cluster) to manage workload requirements, [tune performance]({% link {{ site.versions["stable"] }}/performance-recipes.md %}), and adjust schema designs with support from Cockroach Labs
Backups     | Initialize a default backup schedule and write to customer-owned Cloud storage, ensure backup jobs run successfully | Configure a backup schedule as needed to meet RPO/RTO requirements
Support     | Reactively and proactively identify and resolve availability-impacting incidents | Ensure sufficient hardware is made available and appropriate IAM permissions are maintained at all times
Billing     | Meter vCPUs consumed, [charge for vCPU consumption]({% link cockroachcloud/costs.md %}) at the per-minute level | Negotiate with cloud service provider, manage infrastructure spend and discounts

## Prerequisites

- [Create a CockroachDB {{ site.data.products.cloud }} organization]({% link cockroachcloud/create-an-account.md %}) if you do not already have one. 

- The BYOC deployment option is not available by default and must be requested. Reach out to your account team to express interest in BYOC.

- Cluster creation and management for BYOC deployments is handled using the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}). Create a service account and [API key]({% link cockroachcloud/managing-access.md %}#api-access) if you do not have one.

- Review the [Plan a CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %}) documentation to plan your cluster sizing and resource allocation.

## Step 1. Create a new Azure subscription

Provision a new Azure subscription with no existing infrastructure, dedicated to your Cockroach {{ site.data.products.cloud }} deployment. The account configuration for BYOC requires you to grant Cockroach Labs permissions to access and modify resources in this subscription, so this step is necessary to isolate these permissions from non-Cockroach Cloud resources. This subscription can be reused for multiple CockroachDB clusters.

{{ site.data.alerts.callout_danger }}

Once this Azure subscription has been created and configured to host CockroachDB {{ site.data.products.cloud }} clusters, do not make additional modifications to the account. Changes to the cloud account can cause unexpected problems with cluster operations.

{{ site.data.alerts.end }}

## Step 2. Set up the admin App Registration

When BYOC is enabled for your account, Cockroach Labs dynamically provisions a multi-tenant admin **App Registration** associated with your CockroachDB {{ site.data.products.cloud }} organization and provides you with a URL to grant tenant-wide admin consent to the application. Granting admin consent creates an admin **Service Principal** in your tenant, which is used by Cockroach Labs support to act on the Kubernetes cluster, running automation that initializes support infrastructure.

Visit this URL with a user account that is [authorized to consent on behalf of your organization](https://learn.microsoft.com/entra/identity/enterprise-apps/grant-admin-consent?pivots=portal#prerequisites). Once the Cockroach Labs App Registration has been granted admin consent in the tenant, grant the following set of roles to the admin Service Principal:

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

## Step 3. Set up the reader App Registration

In addition to the admin application, Cockroach Labs provisions the CockroachDB {{ site.data.products.cloud }} BYOC Reader App Registration. This App Registration is used by Cockroach Labs support for read access to Kubernetes infrastructure.

This reader application also requires admin consent to deploy the reader Service Principal:

1. Log in to the Azure portal as a user with Global Administrator or Privileged Role Administrator permissions.
2. Open the following URL in your browser:
    {% include_cached copy-clipboard.html %}
    ~~~ text
    https://login.microsoftonline.com/adminconsent?client_id=7f6538cb-f687-4411-9bbe-2f96bfbce028
    ~~~
    
    If you have multiple tenants, replace `customer-tenant-id` in the following URL with the tenant containing your newly-created Azure subscription:
    
    {% include_cached copy-clipboard.html %}
    ~~~ text
    https://login.microsoftonline.com/<customer-tenant-id>/adminconsent?client_id=7f6538cb-f687-4411-9bbe-2f96bfbce028
    ~~~
3. Review the requested permissions and click **Accept**.
4. Once the CockroachDB Cloud BYOC Reader App Registration has been granted admin consent in the tenant, grant the following set of roles to the reader Service Principal:
      - `Reader`
      - `Azure Kubernetes Service Cluster User`
      - `Azure Kubernetes Service RBAC Reader`

## Step 4. Grant persmissions to Entra groups with Azure Lighthouse

Use [Azure Lighthouse](https://learn.microsoft.com/azure/lighthouse/overview) to enable cross-tenant management that establishes the support infrastructure that allows Cockroach Labs to assist in the event of a support escalation. Permissions are granted least-privilege access and full visibility, allowing you to review and remove access at any time from the Azure portal.

This Azure Lighthouse deployment grants permissions to Cockroach Labs's managed tenant, which has a tenant ID of `a4611215-941c-4f86-b53b-348514e57b45`, by assigning the following roles to the reader and admin Entra groups within the tenant:

- Reader Entra group:
  - `Reader`
  - `Azure Kubernetes Service Cluster User Role`
- Admin Entra group:
  - `Azure Kubernetes Service Contributor Role`
  - `Azure Kubernetes Service Cluster Admin`
  - `Managed Identity Contributor`
  - `Network Contributor`
  - `Storage Account Contributor`
  - `Virtual Machine Contributor`

Follow these steps to enable secure, scoped access for Cockroach Labs to your subscription using Azure Lighthouse:

1. Save the following ARM template to a file named `byoc-lighthouse.json`:
    {% include_cached copy-clipboard.html %}
    ~~~ json
    {
    "$schema": "https://schema.management.azure.com/schemas/2019-08-01/subscriptionDeploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
      "mspOfferName": {
      "type": "string",
      "metadata": {
        "description": "Specify a unique name for your offer"
      },
      "defaultValue": "CockroachDB Cloud BYOC"
      },
      "mspOfferDescription": {
      "type": "string",
      "metadata": {
        "description": "Name of the Managed Service Provider offering"
      },
      "defaultValue": "Template for secure access to customer clusters in CockroachDB Cloud BYOC"
      }
    },
    "variables": {
      "mspRegistrationName": "[guid(parameters('mspOfferName'))]",
      "mspAssignmentName": "[guid(parameters('mspOfferName'))]",
      "managedByTenantId": "a4611215-941c-4f86-b53b-348514e57b45",
      "authorizations": [
      {
        "principalId": "c4139366-960c-431d-afad-29c65fd68087",
        "roleDefinitionId": "acdd72a7-3385-48ef-bd42-f606fba81ae7",
        "principalIdDisplayName": "CockroachDB Cloud BYOC Reader Entra Group"
      },
      {
        "principalId": "c4139366-960c-431d-afad-29c65fd68087",
        "roleDefinitionId": "4abbcc35-e782-43d8-92c5-2d3f1bd2253f",
        "principalIdDisplayName": "CockroachDB Cloud BYOC Reader Entra Group"
      },
      {
        "principalId": "6532a4f2-3fa1-4b10-a4c2-05368c87c89a",
        "roleDefinitionId": "ed7f3fbd-7b88-4dd4-9017-9adb7ce333f8",
        "principalIdDisplayName": "CockroachDB Cloud BYOC Admin Entra Group"
      },
      {
        "principalId": "6532a4f2-3fa1-4b10-a4c2-05368c87c89a",
        "roleDefinitionId": "0ab0b1a8-8aac-4efd-b8c2-3ee1fb270be8",
        "principalIdDisplayName": "CockroachDB Cloud BYOC Admin Entra Group"
      },
      {
        "principalId": "6532a4f2-3fa1-4b10-a4c2-05368c87c89a",
        "roleDefinitionId": "e40ec5ca-96e0-45a2-b4ff-59039f2c2b59",
        "principalIdDisplayName": "CockroachDB Cloud BYOC Admin Entra Group"
      },
      {
        "principalId": "6532a4f2-3fa1-4b10-a4c2-05368c87c89a",
        "roleDefinitionId": "4d97b98b-1d4f-4787-a291-c67834d212e7",
        "principalIdDisplayName": "CockroachDB Cloud BYOC Admin Entra Group"
      },
      {
        "principalId": "6532a4f2-3fa1-4b10-a4c2-05368c87c89a",
        "roleDefinitionId": "17d1049b-9a84-46fb-8f53-869881c3d3ab",
        "principalIdDisplayName": "CockroachDB Cloud BYOC Admin Entra Group"
      },
      {
        "principalId": "6532a4f2-3fa1-4b10-a4c2-05368c87c89a",
        "roleDefinitionId": "9980e02c-c2be-4d73-94e8-173b1dc7cf3c",
        "principalIdDisplayName": "CockroachDB Cloud BYOC Admin Entra Group"
      }
      ]
    },
    "resources": [
      {
      "type": "Microsoft.ManagedServices/registrationDefinitions",
      "apiVersion": "2022-10-01",
      "name": "[variables('mspRegistrationName')]",
      "properties": {
        "registrationDefinitionName": "[parameters('mspOfferName')]",
        "description": "[parameters('mspOfferDescription')]",
        "managedByTenantId": "[variables('managedByTenantId')]",
        "authorizations": "[variables('authorizations')]"
      }
      },
      {
      "type": "Microsoft.ManagedServices/registrationAssignments",
      "apiVersion": "2022-10-01",
      "name": "[variables('mspAssignmentName')]",
      "dependsOn": [
        "[resourceId('Microsoft.ManagedServices/registrationDefinitions/', variables('mspRegistrationName'))]"
      ],
      "properties": {
        "registrationDefinitionId": "[resourceId('Microsoft.ManagedServices/registrationDefinitions/', variables('mspRegistrationName'))]"
      }
      }
    ],
    "outputs": {
      "mspOfferName": {
      "type": "string",
      "value": "[concat('Managed by', ' ', parameters('mspOfferName'))]"
      },
      "authorizations": {
      "type": "array",
      "value": "[variables('authorizations')]"
      }
    }
    }
    ~~~
2. Deploy the template at the subscription scope using [Azure CLI, Azure PowerShell, or Azure Portal](https://learn.microsoft.com/azure/lighthouse/how-to/onboard-customer?tabs=azure-portal#deploy-the-azure-resource-manager-template). The following example command uses the Azure CLI:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    az deployment sub create \
      --name cockroach-byoc-lighthouse \
      --location <region> \
      --template-file byoc-lighthouse.json
    ~~~

## Step 5. Register resource providers

Register the following [resource providers](https://learn.microsoft.com/azure/azure-resource-manager/management/resource-providers-and-types) in the Azure subscription:

- `Microsoft.ContainerService`
- `Microsoft.ManagedIdentity`
- `Microsoft.Network`
- `Microsoft.Quota`
- `Microsoft.Storage`

## Step 6. Create the CockroachDB {{ site.data.products.cloud }} cluster

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