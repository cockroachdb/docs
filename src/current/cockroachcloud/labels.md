---
title: Organize CockroachDB Cloud Resources Using Labels
summary: Learn how to use labels to organize CockroachDB Cloud clusters and folders.
toc: true
docs_area: manage
---

CockroachDB {{ site.data.products.cloud }} supports labels as a flexible way to categorize and manage your [clusters]({% link cockroachcloud/cluster-management.md %}) and [folders]({% link cockroachcloud/folders.md %}). Labels help you track usage, analyze [billing]({% link cockroachcloud/billing-management.md %}#view-credits-balance), automate operations, and streamline reporting across your organization.

## What are labels?

Labels are customizable key-value pairs you can attach to CockroachDB {{ site.data.products.cloud }} resources. Unlike folders, which allow only one-to-many relationships, labels support many-to-many relationships—ideal for complex environments with overlapping ownership or multiple tagging criteria.

### Example

You might apply these labels to a cluster:

- `team:payments`
- `env:production`
- `application:checkout-service`

These labels help filter resources, allocate costs, and integrate with automated workflows.

## Why use labels?

- **Flexible Organization**: Tag clusters and folders by team, environment, application, or any category relevant to your workflows.
- **Cost Allocation**: Analyze your invoice data by label values to track spending across departments or services.
- **Automation**: Use labels in API calls and Terraform configurations to automate operations.
- **Enhanced Reporting**: Export label metadata for use in external analytics tools.

## Label structure

- Labels use key-value pairs.
- Each key can have multiple values.
- Labels are visible across your organization once created.

## Edit labels

You can apply labels to your cluster or folder through the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud/).

Adding or deleting labels on a cluster requires the [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-administrator) or [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator) role.

    1. Navigate to the cluster on the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page) and click the menu button in the **Action** column. Alternatively, navigate to the [**Overview** page]({% link cockroachcloud/cluster-management.md %}#view-cluster-overview) for the cluster and click **Actions** in the top right corner.
    1. In the dropdown menu, select **Edit labels** to open the **Edit labels** window.

Adding or deleting labels on a folder requires the [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin) role. 

    1. Navigate to the folder on the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page) and click the menu button in the **Action** column.
    1. In the dropdown menu, select **Edit labels** to open the **Edit labels** window.

### Add labels

To add a label in the **Edit labels** window:

1. Enter a label key and an optional label value. Autocomplete helps avoid typos and duplicates.
1. Click **+ Add**. The label appears under **Labels applied**.
1. Repeat steps 1 and 2 to add more labels.
1. Click **Add/Update Labels** to apply the labels.

### Delete labels

To delete a label in the **Edit labels** window:

1. Under **Labels applied**, click the **X** on the right of the label you want to delete.
1. Repeat step 1 to delete more labels.
1. Click **Update Labels** to remove the labels.

To change a label, delete the existing label and add a new one.

## Cost and billing integration

Labels appear in invoices on the [Billing page]({% link cockroachcloud/billing-management.md %}#view-credits-balance).

## Best Practices

- Define a consistent labeling taxonomy (e.g., `team`, `env`, `app`) across your organization.
- Use autocomplete in the console to prevent key duplication.
- Review and remove unused or outdated labels regularly.
