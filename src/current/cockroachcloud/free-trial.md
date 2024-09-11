---
title: Try CockroachDB Cloud for free [WIP]
summary: Learn about free trial credits for CockroachDB Cloud
toc: true
cloud: true
--- 

When you sign up for CockroachDB Cloud, your new organization's account starts with $400 in free credits, allowing you to try the product at no cost.

## Free trial credits

Free trial credits are applied to the first $400 in costs for all clusters created in your organization, regardless of the plan: CockroachDB Standard, Advanced, or Basic.

Monthly billing begins when the free trial ends: on the day that the last credit is used, or when any remaining credits expire. By the end of the trial, you must provide a payment method to prevent interruptions in service or loss of data.

### Eligibility

For a user who signs up with CockroachDB Cloud, only their first organization is eligible for free trial credits. Users invited to an organization do not qualify for additional credits. If provided with necessary permissions, they can create clusters that will share the organization's existing credits.

Only organizations charged monthly by credit card are eligible for the free trial. The free trial offer does not apply to organizations that are billed by invoice.

### View your credit balance

To check your free credit balance and see how much time is remaining before your free credit expires, navigate to <TODO> in the CockroachDB Cloud Console.

## Free trial notifications

During your free trial, you will receive email notifications from Cockroach Labs with information about the status of your trial. These emails are sent to the user who originally signed up for CockroachDB Cloud.

An email is sent when:

- The trial begins, providing terms and resources for getting started.  
- 50% of credits have been consumed or 50% of the time until credits expire has elapsed.
- 75% of credits have been consumed or less than 7 days remain before credits expire.  
- The trial ends (all credits have been consumed or have expired).  
- Less than 24 hours remain in a post-expiration grace period.  
- The grace period ends, and trial clusters are deleted.

If you enter a payment method before the end of your free trial, you will not receive further email notifications about the trial. For more details, refer to [Add payment methods](#add-payment-methods).

## Estimate costs

To understand how costs vary per tier and begin to estimate future expenses, refer to [CockroachDB Cloud Costs]({% link cockroachcloud/costs.md %}).

## Add payment methods

During the free trial, an Organization Admin can add a credit card in the CockroachDB Cloud Console. To avoid service disruption and possible data loss, be sure to enter a payment method before your free trial ends.

You can also contact Sales during the trial to learn more about CockroachDB and available billing methods.

If the trial ends and a credit card has not been provided, a grace period begins where the cluster's capabilities are limited, data remains accessible, and the cluster will be fully restored if a credit card is added. Any charges accrued during the grace period will be billed to the credit card. If the end of the grace period is reached and no credit card has been added, the cluster is deleted.

## Get started

[Create an Account]({% link cockroachcloud/create-an-account.md %}) or learn more about [CockroachDB Cloud](https://www.cockroachlabs.com/docs/cockroachcloud/).
