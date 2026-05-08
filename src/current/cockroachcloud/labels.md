---
title: Organize CockroachDB Cloud Resources Using Labels
summary: Learn how to use labels to organize CockroachDB Cloud clusters and folders.
toc: true
docs_area: manage
---

CockroachDB {{ site.data.products.cloud }} supports labels as a flexible way to categorize and manage your [clusters]({% link cockroachcloud/cluster-management.md %}) and [folders]({% link cockroachcloud/folders.md %}). Labels help you track usage, analyze [billing]({% link cockroachcloud/billing-management.md %}#view-credits-balance), automate operations, and streamline reporting across your organization.

## What are labels?

Labels are customizable key-value pairs that you can attach to CockroachDB {{ site.data.products.cloud }} resources. Unlike folders, which allow one-to-many relationships, labels support many-to-many relationships, ideal for complex environments which require a variety of tagging criteria.

## Common use cases

You can set labels for:

- **Environment tracking**: Distinguish between stages like `environment:production`, `environment:staging`, or `environment:test` to simplify deployment workflows and access control.
- **Cost allocation**: Use labels like `team:analytics` or `cost_center:finance` to track usage and spending across departments in billing exports.
- **Ownership and accountability**: Assign operational responsibility with labels such as `team:order-management` or `owner:platform-engineering`.
- **Automation and lifecycle management**: Automate actions using labels like `state:active`, `state:archive`, or `state:ready-to-delete` in scripts and infrastructure-as-code tools.
- **Custom organization**: Apply labels based on application, region, or any other criteria relevant to your workflows, e.g. the application, workload, or region applicable to a cluster.

These labels can then be used to:

- Filter and group resources in the Console.
- Power cost reports and analytics.
- Drive automation through APIs or Terraform.
- Provide consistent metadata across teams and environments.

## Requirements for labels

The labels applied to a resource must meet the following requirements:

- Each resource can have up to 50 labels.
- Label keys are required, and must start with a lowercase letter and can include lowercase letters, numbers, underscores, and dashes (up to 63 characters).
- Label values can include only lowercase letters, numbers, dashes, and must be between 0 and 63 characters.
- Keys are unique per resource. For example, if cluster A has a label `environment:production`, it cannot also have a label `environment:development`.
- Across the organization, each key can have multiple values. For example, folder A can have a label `environment:development`, folder B can have a label `environment:testing`, and folder C can have a label `environment:production`.
- Labels are visible across your organization once created.

## Edit labels

You can apply labels to your cluster or folder through the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud/) or using the CockroachDB Cloud API (refer to the schema for creating a [cluster](https://www.cockroachlabs.com/docs/api/cloud/v1#post-/api/v1/clusters) or [folder](https://www.cockroachlabs.com/docs/api/cloud/v1#post-/api/v1/folders)) or [Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs).

Adding or deleting labels on a cluster requires the [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) or [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator) role.

1. Navigate to the cluster on the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page) and click the menu button in the **Action** column. Alternatively, navigate to the [**Overview** page]({% link cockroachcloud/cluster-management.md %}#view-cluster-overview) for the cluster and click **Actions** in the top right corner.
1. In the dropdown menu, select **Edit cluster labels** to open the **Edit labels** window.

Adding or deleting labels on a folder requires the [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin) role. 

1. Navigate to the folder on the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page) and click the menu button in the **Action** column.
1. In the dropdown menu, select **Edit folder labels** to open the **Edit labels** window.

### Add labels

To add a label in the **Edit labels** window:

1. Enter a label key and an optional label value. Autocomplete helps avoid typos and duplicates.
1. Click **+ Add**. The label appears under **Labels applied**.
1. Repeat steps 1 and 2 to add more labels.
1. Click **Add/Update Labels** to apply the changes. A success or failure notification will appear at the top right.

### Delete labels

To delete a label in the **Edit labels** window:

1. Under **Labels applied**, click the **X** on the right of the label you want to delete.
1. Repeat step 1 to delete more labels.
1. Click **Update Labels** to apply the changes. A success or failure notification will appear at the top right.

To change a label, delete the existing label and add a new one.

## Cost and billing integration

Labels appear in invoices on the [**Billing** page]({% link cockroachcloud/billing-management.md %}#view-credits-balance).

## Best Practices

- Define a consistent labeling taxonomy (e.g., `team`, `env`, `app`) across your organization.
- Use autocomplete in the console to prevent the duplication of keys.
- Regularly review and remove unused or outdated labels.
