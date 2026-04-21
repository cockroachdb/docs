---
title: Prepare a CockroachDB Cloud BYOC Deployment in Google Cloud Platform
summary: Prepare a Google Cloud Platform account to host a BYOC deployment of CockroachDB
toc: true
keywords: deployment, byoc
---

This page describes how to prepare a cloud service account to host a [BYOC deployment]({% link cockroachcloud/byoc-overview.md %}) of CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} in Google Cloud Platform (GCP).

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

## Prerequisites

{% include cockroachcloud/byoc/byoc-common-prerequisites.md %}

- Create an [API service account]({% link cockroachcloud/managing-access.md %}#create-api-keys) to use the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) with your {{ site.data.products.cloud }} organization.

## Step 1. Create a new GCP project

Provision a fresh **GCP project** with no existing infrastructure, dedicated to your CockroachDB {{ site.data.products.cloud }} deployment. The project configuration for BYOC requires you to grant Cockroach Labs permissions to access and modify resources in this project, so this step is necessary to isolate these permissions from non-CockroachDB Cloud resources. This project can be reused for multiple CockroachDB clusters.

The following requirements apply to the GCP project used for your BYOC deployment:

- The project ID **must not** begin with the reserved prefix `crl-`.
- [Enable](https://docs.cloud.google.com/endpoints/docs/openapi/enable-api) the Service Usage API and the Cloud Resource Manager APIs for this project. Cockroach Labs will enable additional APIs as needed, but these two must be initialized first.

## Step 2. Grant permissions to the Cockroach Labs service account

Cockroach Labs uses cross-account service account impersonation to provision and manage resources in your GCP project. This requires two service accounts:

- A service account owned by Cockroach Labs which must be granted roles to view and access service accounts in your GCP project.
- An intermediary service account in your GCP project which must be granted roles to create and manage infrasturcture. This service account is the target used by Cockroach Labs for cross-account impersonation.

In this step, use the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) to collect the email address of the Cockroach Labs service account and grant it the necessary roles.

Send a `GET` request to the `/v1/organization` endpoint of the [CockroachDB {{ site.data.products.cloud }} API](https://www.cockroachlabs.com/docs/api/cloud/v1.html#get-/api/v1/organization) similar to the following example:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/organization \
  --header 'Authorization: Bearer {secret_key}'
~~~

Record the value of `cockroach_cloud_service_principals.gcp.service_account_email` in the response:

~~~ json
{
  "cockroach_cloud_service_principals": {
    "gcp": {
      "service_account_email": "example@email.com"
    }
  }
}
~~~

Grant this service account the following roles in the GCP IAM Console:

- `Service Account Token Creator (roles/iam.serviceAccountTokenCreator)`
- `View Service Accounts (roles/iam.serviceAccountViewer)`

## Step 3. Configure the intermediate service account

In this step, create the intermediate service account in your GCP project and grant it the necessary roles in your GCP project.

Follow these steps to create the intermediate service account:

1. Open the GCP IAM Console.
2. Create a new service account. The account's name is arbitrary and can be whatever you want, but be sure to note down the email address of the account.
3. Grant the following IAM roles to the service account:
    - `Compute Instance Admin (v1) (roles/compute.instanceAdmin.v1)`
    - `Compute Network Admin (roles/compute.networkAdmin)`
    - `Compute Security Admin (roles/compute.securityAdmin)`
    - `Kubernetes Engine Admin (roles/container.admin)`
    - `Role Administrator (roles/iam.roleAdmin)`
    - `Service Account Admin (roles/iam.serviceAccountAdmin)`
    - `Service Account Key Admin (roles/iam.serviceAccountKeyAdmin)`
    - `Service Account Token Creator (roles/iam.serviceAccountTokenCreator)`
    - `Service Account User (roles/iam.serviceAccountUser)`
    - `Logs Configuration Writer (roles/logging.configWriter)`
    - `Project IAM Admin (roles/resourcemanager.projectIamAdmin)`
    - `Project Mover (roles/resourcemanager.projectMover)`
    - `Service Usage Admin (roles/serviceusage.serviceUsageAdmin)`
    - `Storage Admin (roles/storage.admin)`


## Step 4. Create the CockroachDB {{ site.data.products.cloud }} cluster

In BYOC deployments, CockroachDB clusters can be deployed in the {{ site.data.products.cloud }} Console or with the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}).

### Create a cluster with the {{ site.data.products.cloud }} Console

Follow these steps to create a CockroachDB cluster in the {{ site.data.products.cloud }} console:

1. Open the {{ site.data.products.cloud }} and select the organization that has been enabled for BYOC.
1. Click **Create cluster**.
1. Under **Select a plan**, click **{{ site.data.products.advanced }}**.
1. Under **Cloud & Regions**, click **Bring Your Own Cloud** and select Google Cloud.
1. Under **Cloud account**, click **Select your cloud account > Add new cloud account**. Enter the service account email associated with your intermediate service account.
1. Follow the rest of the **Create Cluster** steps to configure your cluster's regions, capacity, and features as desired. Read the [Plan a CockroachDB {{ site.data.products.advanced}} Cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %}) documentation for more details.

### Create a cluster with the {{ site.data.products.cloud }} API

Send a `POST` request to the the `/v1/clusters` endpoint to [create a CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} cluster]({% link cockroachcloud/cloud-api.md %}#create-an-advanced-cluster).

The following example request creates a 3-node {{ site.data.products.advanced }} cluster in the `us-east1` region, specifying the `service_account_email` associated with the intermediate service account you created:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
    --url https://cockroachlabs.cloud/api/v1/clusters \
    --header "Authorization: Bearer {secret_key}" \
    --json '{
        "name": "byoc-gcp-cluster-1",
        "plan": "ADVANCED",
        "provider": "GCP",
        "spec": {
          "customer_cloud_account": {
            "gcp": {
              "service_account_email": "{intermediate_service_account_email}"
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
              "us-east1": 3
            }
          }
        }
      }'
~~~

## Next steps

- [Connect to your cluster]({% link cockroachcloud/connect-to-an-advanced-cluster.md %})
- [Manage your cluster using the {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %})
- [Prepare your deployment for production]({% link cockroachcloud/production-checklist.md %})