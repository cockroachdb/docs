---
title: Billing Management
summary: Manage billing for your Organization
toc: true
---

The **Billing** page displays the current charges, next scheduled payment date, and payment details on file for your {{ site.data.products.db }} Organization. To view the **Billing** page, [log in](https://cockroachlabs.cloud/) and click **Billing**.

[Console Admins](console-access-management.html#console-admin) can set up and manage billing for the Organization.

{{site.data.alerts.callout_info}}
Setting up billing information for your Organization allows you to create a maximum of 10 Serverless clusters and use [cloud storage for bulk operations](run-bulk-operations.html). Organizations without billing information are limited to five Serverless clusters and [using `userfile` storage for bulk operations](run-bulk-operations.html).
{{site.data.alerts.end}}

## Set up billing for an Organization

1. On the **Billing** page, click the pencil icon for the **Payment method** field.
1. In the **Edit payment method** dialog, enter the credit or debit card details.
1. Click **Save card**.
1. On the **Billing** page, click the pencil icon for the **Billing email address** field.
1. Enter the email address at which you want to get invoices for the Organization.
1. Click **Submit**.
1. On the **Billing** page, click the pencil icon for the **Billing address** field.
1. Enter the address associated with your payment method. This address appears on your monthly invoice and should be the legal address of your home or business.
1. Click **Submit**.

## Change the billing email address

1. On the **Billing** page, click the pen icon for the **Billing email address** field.
1. In the **Edit payment method** dialog, enter the new email address at which you want get invoices for the Organization.
1. Click **Add card**.

## Change the payment method

1. On the **Billing** page, click the pencil icon for the **Payment method** field.
1. In the **Edit payment method** dialog, enter the credit or debit card details.
1. Click **Save card**.
1. On the **Billing** page, click the pencil icon for the **Billing address** field.
1. Enter the address associated with your new payment method. This address appears on your monthly invoice and should be the legal address of your home or business.
1. Click **Submit**.

## Delete your credit card information

We keep a card on file after the associated Organization is deleted so we can process pending charges. You can [contact Support](https://support.cockroachlabs.com) to remove your card once your charges are settled.

## Check trial code details

If you had used a {{ site.data.products.dedicated }} trial code while [creating a cluster](create-your-cluster.html#step-8-enter-billing-details), you can check the trial expiration details on the **Billing page**.

{{site.data.alerts.callout_info}}
Your credit card will be charged after the trial ends. You can check the expiration date of the code on the **Billing** page.
{{site.data.alerts.end}}