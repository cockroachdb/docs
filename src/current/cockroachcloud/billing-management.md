---
title: Billing Management
summary: Manage billing for your organization
toc: true
docs_area:
---

The **Billing** page contains an overview of your charges and the payment details on file for your CockroachDB {{ site.data.products.cloud }} organization.

## View billing for an organization

Users with the [Billing Coordinator]({% link cockroachcloud/authorization.md %}#billing-coordinator) or [Billing Viewer]({% link cockroachcloud/authorization.md %}#billing-viewer) role can view billing details, invoices, and usage for the organization. To view the **Billing** page, [log in](https://cockroachlabs.cloud/) and click **Billing**.

## Set up billing for an organization

Users with the [Billing Coordinator]({% link cockroachcloud/authorization.md %}#billing-coordinator) role can manage billing for the organization.

You can pay for CockroachDB {{ site.data.products.cloud }} by using a credit card, or you can set up billing through [AWS Marketplace](https://aws.amazon.com/marketplace) or [Google Cloud Marketplace](https://cloud.google.com/marketplace).

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="credit-card">Credit card</button>
    <button class="filter-button page-level" data-scope="aws">AWS Marketplace</button>
    <button class="filter-button page-level" data-scope="gcp">Google Cloud Marketplace</button>
</div>

<section class="filter-content" markdown="1" data-scope="credit-card">

## Add a credit card

1. On the **Billing** page, select the **Payment details** tab.
1. Click **Add a credit card** in the **Payment method** field.
1. In the **Edit payment method** dialog, enter the credit card details.
1. Click **Save card**.
1. Click **Add a billing email** in the **Billing contact info** section.
1. In **Edit billing email** enter the email address at which you want to receive invoices for the organization.
1. Click **Submit**.
1. Click **Add a billing address** in the **Billing contact info** section.
1. Enter the address associated with your payment method. This address appears on your monthly invoice and should be the legal address of your home or business.
1. Click **Submit**.

## Change the billing email address

1. On the **Billing** page, select the **Payment details** tab.
1. Click the pencil icon for the **Email** field under **Billing contact info**.
1. Enter the new email address at which you want to receive invoices for the organization.
1. Click **Submit**.

## Change the payment method

1. On the **Billing** page, select the **Payment details** tab.
1. Click the pencil icon for the **Payment method** field.
1. In the **Edit payment method** dialog, enter the credit card details.
1. Click **Save card**.
1. In the **Billing contact info** section, click the pencil icon for the **Billing address** field.
1. Enter the address associated with your new payment method. This address appears on your monthly invoice and should be the legal address of your home or business.
1. Click **Submit**.

## Delete your credit card information

We keep a card on file after the associated organization is deleted so we can process pending charges. You can [contact Support](https://support.cockroachlabs.com) to remove your card once your charges are settled.

</section>

<section class="filter-content" markdown="1" data-scope="aws">

## Subscribe through AWS Marketplace

To subscribe to CockroachDB {{ site.data.products.cloud }} through the AWS Marketplace:

1. From the [AWS Marketplace page for CockroachDB (pay-as-you-go)](https://aws.amazon.com/marketplace/pp/prodview-n3xpypxea63du),  click **View purchase options** to open the **Subscribe to CockroachDB Cloud** page
1. Click **Subscribe**, then click **Set up your account**. You will be redirected to the CockroachDB {{ site.data.products.cloud }} console.
1. [Register]({% link cockroachcloud/create-an-account.md %}#register-a-new-account) a new CockroachDB {{ site.data.products.cloud }} account or sign in to your existing account.
1. If you have access to multiple CockroachDB {{ site.data.products.cloud }} organizations, select an organization to update its billing configuration.

    {{site.data.alerts.callout_info}}
    Organizations that are configured for invoice billing or are already linked to a cloud marketplace are not listed.
    {{site.data.alerts.end}}


1. Click **Subscribe to AWS Marketplace**.


## Unsubscribe from AWS Marketplace

{{ site.data.alerts.callout_danger }}
After you unsubscribe your CockroachDB {{ site.data.products.cloud }} from AWS Marketplace billing, clusters will be deleted and applications may be disrupted unless you add an alternate payment method within 6 hours after you unsubscribe from AWS Marketplace billing.
{{ site.data.alerts.end }}


To unsubscribe from CockroachDB {{ site.data.products.cloud }}:

1. From [AWS Marketplace](https://aws.amazon.com/marketplace), click **Manage Subscriptions**.
1. In the list of subscriptions, click **CockroachDB (pay-as-you-go)**.
1. In the **Agreement** section, click **Actions**, then click **Cancel Subscription**.
1. Review the details in the confirmation dialog, then click **Accept** to unsubscribe your organization from billing through AWS Marketplace.

</section>

<section class="filter-content" markdown="1" data-scope="gcp">

## Subscribe through Google Cloud Marketplace

To subscribe to CockroachDB Cloud through the Google Cloud Marketplace:

1. From the [Google Cloud Marketplace page for CockroachDB (pay-as-you-go)](https://console.cloud.google.com/marketplace/product/cockroachlabs/cockroachdb-pay-as-you-go), click **Subscribe** to open the **Order Summary** page  
2. **Select a billing account** and agree to **Additional Terms**, then click **Subscribe**.   
3. Click **Go to Product Page**. You will be redirected to the [Google Cloud Marketplace page for CockroachDB (pay-as-you-go)](https://console.cloud.google.com/marketplace/product/cockroachlabs/cockroachdb-pay-as-you-go).
4. From the product page, click **Sign up with Cockroach Labs**. You will be redirected to the CockroachDB Cloud console.
5. [Register]({% link cockroachcloud/create-an-account.md %}#register-a-new-account) a new CockroachDB Cloud account or sign in to your existing account.
6. If you have access to multiple CockroachDB Cloud organizations, select an organization to update its billing configuration.
    {{site.data.alerts.callout_info}}
    Organizations that are configured for invoice billing or are already linked to a cloud marketplace are not listed.
    {{site.data.alerts.end}}
7. Click **Subscribe to Google Cloud Marketplace**.
    {{site.data.alerts.callout_info}}
    If your Google Account was previously subscribed to CockroachDB (pay-as-you-go) through the Google Cloud Marketplace and you are unable to re-subscribe, please contact our [support team](https://support.cockroachlabs.com) for assistance.
    {{site.data.alerts.end}}   

## Unsubscribe from Google Cloud Marketplace

{{ site.data.alerts.callout_danger }}
After you unsubscribe your CockroachDB {{ site.data.products.cloud }} from Google Cloud Marketplace billing, clusters will be deleted and applications may be disrupted unless you add an alternate payment method within 6 hours after you unsubscribe.
{{ site.data.alerts.end }}

To unsubscribe from CockroachDB Cloud:

1. On the [Google Cloud Marketplace orders](https://console.cloud.google.com/marketplace/orders) page, **Select a billing account** from the dropdown.
2. In the list of subscriptions, find **CockroachDB (pay-as-you-go)**.
3. Click **Cancel Order** from the actions menu.
4. Follow the instructions in the Cancel Order dialog, then click **Cancel Order** to unsubscribe your organization from billing through Google Cloud Marketplace.

</section>

## View Credits balance

If your organization has an annual contract with CockroachDB {{ site.data.products.cloud }}, the **Overview** tab of the **Billing** page displays the amount of available CockroachDB {{ site.data.products.cloud }} Credits you have remaining and the average number of Credits your organization consumes per day. At the end of each billing period, invoice payments are deducted from your organization's Credits.

Under the **Credits** section, you can see more information about each of your organization's contracts. Contracts are listed in the order in which they will be used.

The **Current billing period** section displays a table listing your organization's clusters and the Credits they have accrued. The table also includes the cluster type and associated [labels]({% link cockroachcloud/labels.md %}).

## View invoices
 
You can review an in-progress invoice for the current billing period on the **Overview** tab of the **Billing** page. You can view all of your organization's past invoices on the **Invoices** tab of the **Billing** page. Click any invoice to view the details of your charges for a billing period.

If you're using [folders]({% link cockroachcloud/folders.md %}) to organize your clusters, billing is grouped by folder. Click any folder to view invoices for individual clusters in the folder or its descendants. Within a folder, click any subfolder to view its details.

You can also use the Cloud API to [get invoices for an organization]({% link cockroachcloud/cloud-api.md %}#get-invoices-for-an-organization).

### Export invoices

You can export invoice data in CSV or PDF format. From the **Invoices** tab, on the row of any billing period, click the **...** button under the **Download** column and select **Export CSV** or **Export PDF**.

- The CSV file includes line items for all clusters in your organization for the selected billing period. It includes the same information that is available when viewing invoices within the Console.

- The PDF renders invoice information from the Console into a traditional invoice format. This format includes the high level information from the Console, a summary of total usage, the organization's billing address, and a CockroachDB letterhead.

If you're using [folders]({% link cockroachcloud/folders.md %}) to organize your clusters, the full path for each cluster is provided under the **Cluster path** column.

## Non-payment

{% include cockroachcloud/non-payment.md %}
