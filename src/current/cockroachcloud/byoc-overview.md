---
title: CockroachDB BYOC Overview
summary: Learn about the Bring-Your-Own-Cloud deployment option for CockroachDB
toc: true
keywords: deployment, byoc
---

CockroachDB {{ site.data.products.cloud }} supports a ["bring your own cloud" (BYOC) deployment model](https://www.cockroachlabs.com/product/cloud/bring-your-own-cloud/), where CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} is hosted in your own account rather than in an account managed by Cockroach Labs. This model allows you to take more control of security and take advantage of existing cloud service credits or discounts.

{{site.data.alerts.callout_info}}
The BYOC {{ site.data.products.cloud }} deployment option is currently in [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

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

## Next steps

CockroachDB supports BYOC deployments in Amazon Web Services, Microsoft Azure, and Google Cloud Platform. Read the corresponding deployment guides:

- [Prepare a CockroachDB Cloud BYOC Deployment in Amazon Web Services]({% link cockroachcloud/byoc-aws-deployment.md %}).
- [Prepare a CockroachDB Cloud BYOC Deployment in Azure]({% link cockroachcloud/byoc-azure-deployment.md %}).
- [Prepare a CockroachDB Cloud BYOC Deployment in Google Cloud Platform]({% link cockroachcloud/byoc-gcp-deployment.md %}).