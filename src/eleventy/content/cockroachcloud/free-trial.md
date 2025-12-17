---
title: Try CockroachDB Cloud for free
summary: Learn about free trial credits for CockroachDB Cloud
toc: true
cloud: true
---

When you sign up for CockroachDB Cloud, your new organization's account starts with $400 in free credits, allowing you to try the product at no cost. Pay-as-you-go accounts with CockroachDB {{ site.data.products.basic }} clusters are also elegible for an additional $15 per month of resource utilization.

{{site.data.alerts.callout_info}}
Customers with annual or multi-year contracts are not eligible for the free monthly resource benefit.
{{site.data.alerts.end}}

## Free trial credits

Free trial credits are applied to the first $400 in costs for all clusters created in your organization, regardless of the plan: CockroachDB {{ site.data.products.standard }}, CockroachDB {{ site.data.products.advanced }}, or CockroachDB {{ site.data.products.basic }}.

Monthly billing begins when the free trial ends: on the day that the last credit is used, or upon expiration of credit, if any remains. By the end of the trial, you must provide a payment method for continued billing to prevent interruptions in service or loss of data.

### Eligibility

For a user who signs up with CockroachDB Cloud, only their first organization is eligible for free trial credits. Users invited to an organization do not qualify for additional credits. If provided with necessary permissions, such users can create clusters that will share the organization's existing credits.

The free trial offer does not apply to organizations that are billed by invoice.

### View your credit balance

To check your free credit balance and see how much time is remaining before your free credit expires, navigate to the [Get Started](https://cockroachlabs.cloud/get-started) page or your [Billing](https://cockroachlabs.cloud/billing/overview) overview in the CockroachDB Cloud Console.

## Monthly free {{ site.data.products.basic }} credits

Accounts with CockroachDB {{ site.data.products.basic }} clusters receive $15 of free resource utilization (equivalent to 50 million [Request Units]({% link "cockroachcloud/plan-your-cluster-basic.md" %}#request-units) and 10 GiB storage) across all clusters. This benefit applies as a $15 credit on their monthly invoice.

A payment method must be added to the account to be elegible for this benefit, though it will only be charged for any usage above the $15 of free credits. Customers with annual or multi-year contracts are not elegible for the free monthly resource benefit.

## Free trial notifications

During your free trial, you will receive email notifications from Cockroach Labs with information about the status of your trial. These emails are sent to Organization Admins and Billing Coordinators.

An email is sent when:

* The trial begins, providing terms and resources for getting started.
* 50% of credits have been consumed or less than 15 days remain before credits expire.
* 75% of credits have been consumed or less than 7 days remain before credits expire.
* The trial ends (all credits have been consumed or have expired).
* Less than 24 hours remain in a post-expiration grace period.
* The grace period ends, and trial clusters are deleted.

If you enter a payment method before the end of your free trial, you will not receive further email notifications about the trial. For more details, refer to [Add payment methods](#add-payment-methods).

## Estimate costs

To understand how costs vary per tier and begin to estimate future expenses, refer to [CockroachDB Cloud Costs]({% link "cockroachcloud/costs.md" %}).

## Add payment methods

During the free trial, a [Billing Coordinator]({% link "cockroachcloud/authorization.md" %}) can [add a credit card]({% link "cockroachcloud/billing-management.md" %}) in the CockroachDB Cloud Console or subscribe through the [AWS Marketplace]({% link "cockroachcloud/billing-management.md" %}?filters=aws) or [Google Cloud Marketplace]({% link "cockroachcloud/billing-management.md" %}?filters=gcp) for monthly, pay-as-you-go payment. You can also [contact Sales](https://cockroachlabs.com/contact-sales) during the trial to learn more about CockroachDB and consider an initial purchse of credits as part of an annual or multi-year contract.

{{site.data.alerts.callout_info}}
To avoid service disruption and possible data loss, be sure to enter a payment method or be in communication with Sales before your free trial ends.
{{site.data.alerts.end}}

If the trial ends and a payment method has not been provided, a 30 day grace period begins where your organization’s clusters are throttled, and you are restricted from modifying their configuration, for example, to scale up or down, or update regions.

The cluster will be fully restored if a payment method is added. Any charges accrued during the grace period will be billed to the payment method.

{{site.data.alerts.callout_danger}}
If the end of the grace period is reached and no payment method has been added, all clusters in the organization are deleted. Deleted clusters can not be restored.
{{site.data.alerts.end}}

## Get started

[Create an Account]({% link "cockroachcloud/create-an-account.md" %}) or learn more about [CockroachDB Cloud](https://www.cockroachlabs.com/docs/cockroachcloud/).
