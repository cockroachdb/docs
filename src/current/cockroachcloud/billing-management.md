---
title: Billing Management
summary: Manage billing for your organization
toc: true
docs_area:
---

The **Billing** page contains an overview of your charges and the payment details on file for your CockroachDB {{ site.data.products.cloud }} organization. To view the **Billing** page, [log in](https://cockroachlabs.cloud/) and click **Billing**.

Users with the [Billing Coordinator]({% link cockroachcloud/authorization.md %}#billing-coordinator) role can manage billing for the organization.

## Set up billing for an organization

1. On the **Billing** page, select the **Payment details** tab.
1. Click **Add a credit card** in the **Payment method** field.
1. In the **Edit payment method** dialog, enter the credit or debit card details.
1. Click **Save card**.
1. Click **Add a billing email** in the **Billing contact info** section.
1. In the **Edit billing email*** the email address at which you want to get invoices for the organization.
1. Click **Submit**.
1. Click **Add a billing address** in the **Billing contact info** section.
1. Enter the address associated with your payment method. This address appears on your monthly invoice and should be the legal address of your home or business.
1. Click **Submit**.

## Change the billing email address

1. On the **Billing** page, select the **Payment details** tab.
1. Click the pencil icon for the **Email** field under **Billing contact info**.
1. Enter the new email address at which you want get invoices for the organization.
1. Click **Submit**.

## Change the payment method

1. On the **Billing** page, select the **Payment details** tab.
1. Click the pencil icon for the **Payment method** field.
1. In the **Edit payment method** dialog, enter the credit or debit card details.
1. Click **Save card**.
1. In the **Billing contact info** section, click the pencil icon for the **Billing address** field.
1. Enter the address associated with your new payment method. This address appears on your monthly invoice and should be the legal address of your home or business.
1. Click **Submit**.

## Delete your credit card information

We keep a card on file after the associated organization is deleted so we can process pending charges. You can [contact Support](https://support.cockroachlabs.com) to remove your card once your charges are settled.

## Check trial code details

If you used a CockroachDB {{ site.data.products.dedicated }} trial code while [creating a cluster]({% link cockroachcloud/create-your-cluster.md %}#step-6-enter-billing-details), you can check the trial expiration details on the **Overview** tab of the **Billing** page.

{{site.data.alerts.callout_info}}
Your credit card will be charged after the trial ends.
{{site.data.alerts.end}}

## View Credits balance

If your organization has an annual contract with CockroachDB {{ site.data.products.cloud }}, the **Overview** tab of the **Billing** page will display the amount of available CockroachDB {{ site.data.products.cloud }} Credits you have remaining and the average number of Credits your organization consumes per day. At the end of each billing period, invoice payments will be deducted from your organization's Credits.

Under the **Credits** section, you can see more information about each of your organization's contracts. Contracts are listed in the order in which they will be used.

Under the **Spend over time** section, you can see a table of each of your organization's clusters and the costs they have accrued.

## View invoices

You can view all of your organization's past invoices on the **Invoices** tab of the **Billing** page. Click any invoice to view the details of your charges for a billing period.

If you're using [folders]({% link cockroachcloud/folders.md %}) to organize your clusters, billing is grouped by folder. Click any folder to view invoices for individual clusters in the folder or its descendants. Within a folder, click any subfolder to view its details.
