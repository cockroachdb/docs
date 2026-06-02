---
title: CockroachDB Cloud Releases
summary: Changelog for CockroachDB Cloud.
toc: true
toc_not_nested: true
docs_area: releases
---

<a href="https://www.cockroachlabs.com/docs/cockroachcloud/index">CockroachDB {{ site.data.products.cloud }}</a> supports major versions of CockroachDB according to the schedule in the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy">CockroachDB {{ site.data.products.cloud }} Upgrade Policy</a>. On that page, select a supported version to view its feature highlights. Updates that are specific to CockroachDB {{ site.data.products.cloud }} are exclusively listed on this page.

CockroachDB {{ site.data.products.cloud }} supports the latest major version of CockroachDB and the version immediately preceding it. For more information, see the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy">CockroachDB {{ site.data.products.cloud }} Upgrade Policy</a>.

Get future release notes emailed to you:

{% include marketo.html formId=1083 %}

## May 2026 Highlights

**OAuth Apps Page for MCP Redirect URI Management** — Added OAuth apps page in the management console for managing redirect URIs in Multi-Cloud Platform configurations. (GA, All tiers).

**Cluster Filter for Billing Forecast Tab** — Users can now filter clusters in the billing forecast tab to better analyze costs and usage projections. (GA, All tiers).

**Enhanced Navigation V2 Layout** — Improved cluster navigation with persistent ClusterDetailHeader displaying page titles, Connect button, action menu, and page-specific actions. (GA, All tiers).

**Azure Private Endpoint Egress Pricing** — Added pricing support for Azure private endpoint egress traffic in billing calculations. (GA, Dedicated).

**Jobs v2 Schema Support** — Added support for Jobs v2 schema changes to improve job management and monitoring capabilities. (GA, All tiers).

**Improved Cluster Settings Panel** — Fixed settings panel width issues when clusters have many labels for better display and usability. (GA, All tiers).

## April 2026 highlights

<div id="feature-highlights">

<table>
 <thead>
  <tr>
   <th class="center-align">Feature</th>
   <th class="center-align">Availability</th>
   <th>{{ site.data.products.basic }} </th>
   <th>{{ site.data.products.standard }} </th>
   <th>{{ site.data.products.advanced }} </th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td>
    <p class="feature-summary">CockroachDB Cloud CLI</p>
    <p class="feature-description">The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/ccloud-get-started">CockroachDB Cloud CLI</a> has been redesigned with updated commands for managing clusters, users, and cloud resources from the terminal.</p>
   </td>
   <td class="icon-center">GA</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
  </tr>
  <tr>
   <td>
    <p class="feature-summary">Bring Your Own Cloud (BYOC)</p>
    <p class="feature-description">You can deploy <a href="https://www.cockroachlabs.com/docs/cockroachcloud/byoc-overview">CockroachDB {{ site.data.products.cloud }} clusters within your own AWS, Azure, or GCP account</a>. This gives you access to your existing cloud savings and control over networking, security, and data residency while retaining the managed database operations of CockroachDB {{ site.data.products.cloud }}.</p>
   </td>
   <td class="icon-center">Preview</td>
   <td class="icon-center">{% include icon-no.html %}</td>
   <td class="icon-center">{% include icon-no.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
  </tr>
  <tr>
   <td>
    <p class="feature-summary">Model Context Protocol (MCP) server</p>
    <p class="feature-description">The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-the-cockroachdb-cloud-mcp-server">CockroachDB {{ site.data.products.cloud }} MCP server</a> allows your AI agents and LLM-powered applications to connect to CockroachDB using the Model Context Protocol (MCP).</p>
   </td>
   <td class="icon-center">GA</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
  </tr>
  <tr>
   <td>
    <p class="feature-summary">Fault tolerance demo</p>
    <p class="feature-description">Run a built-in <a href="https://www.cockroachlabs.com/docs/{{ site.versions["stable"] }}/demo-cockroachdb-resilience#run-a-guided-demo-in-cockroachdb-cloud">fault tolerance demo</a> in the CockroachDB {{ site.data.products.cloud }} Console that allows you to monitor query execution during a simulated failure and recovery.</p>
   </td>
   <td class="icon-center">Preview</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
  </tr>
  <tr>
   <td>
    <p class="feature-summary">Cross-cluster restore for {{ site.data.products.standard }} tier</p>
    <p class="feature-description">{{ site.data.products.standard }} tier clusters now support <a href="https://www.cockroachlabs.com/docs/cockroachcloud/take-and-restore-self-managed-backups">cross-cluster restore</a>, allowing you to restore backups from one cluster to another for disaster recovery and testing scenarios.</p>
   </td>
   <td class="icon-center">GA</td>
   <td class="icon-center">{% include icon-no.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
  </tr>
  <tr>
   <td>
    <p class="feature-summary">Larger instance sizes for {{ site.data.products.advanced }} clusters</p>
    <p class="feature-description">{{ site.data.products.advanced }} clusters now support instance sizes larger than 32 vCPUs per node, enabling higher-performance workloads and greater vertical scaling options.</p>
   </td>
   <td class="icon-center">GA</td>
   <td class="icon-center">{% include icon-no.html %}</td>
   <td class="icon-center">{% include icon-no.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
  </tr>
  <tr>
   <td>
    <p class="feature-summary">Azure Qatar Central region</p>
    <p class="feature-description">CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} clusters can now be deployed in the Azure Qatar Central (qatarcentral) region.</p>
   </td>
   <td class="icon-center">GA</td>
   <td class="icon-center">{% include icon-no.html %}</td>
   <td class="icon-center">{% include icon-no.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
  </tr>
  <tr>
   <td>
    <p class="feature-summary">Cluster Overview page redesign</p>
    <p class="feature-description">The {{ site.data.products.cloud }} Console <a href="https://www.cockroachlabs.com/docs/cockroachcloud/overview-page">Cluster Overview page</a> has been redesigned with an improved layout and user experience for monitoring cluster health and metrics.</p>
   </td>
   <td class="icon-center">GA</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
   <td class="icon-center">{% include icon-yes.html %}</td>
  </tr>
 </tbody>
</table>

</div>

## Older updates

<details>

<h3>Aug 5, 2025</h3>

Console users with the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#billing-coordinator">Billing Coordinator role</a> can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/billing-management#export-invoices">export invoices</a> in a PDF format, rendering billing information into a traditional invoice format for ease of distribution.

<h3>Aug 4, 2025</h3>

CockroachDB v25.3 is now generally available (GA) for CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} clusters. CockroachDB v25.3 is an <a href="https://www.cockroachlabs.com/docs/releases/index#release-schedule">Innovation release</a>.

For release notes, refer to <a href="https://www.cockroachlabs.com/docs/releases/v25.3">What's New in v25.3</a>.

To get started with v25.3, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-an-advanced-cluster">Create a CockroachDB {{ site.data.products.advanced }} cluster</a> or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-cockroach-version">Upgrade a Cluster in CockroachDB {{ site.data.products.cloud }}</a>.

<h3>July 31, 2025</h3>

<h4>Customer-Managed Encryption Keys (CMEK) for CockroachDB {{ site.data.products.advanced }} for Azure</h4>

This release introduces Customer-Managed Encryption Keys (CMEK) for CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} clusters on Microsoft Azure. This feature provides enhanced data security and supports PCI DSS compliance.

CMEK enables customers to control the encryption keys used to protect their data at rest within CockroachDB {{ site.data.products.cloud }} on Azure. Keys are managed via the customer's Azure Key Vault.

Key benefits:

<ul>
<li><b>Enhanced Data Security</b>: Customers control key lifecycle (creation, rotation, revocation), improving data protection.</li>
<li><b>PCI DSS Compliance</b>: Addresses PCI DSS Requirement 3 for protecting stored cardholder data.</li>
<li><b>Operational Control</b>: Provides greater control and visibility over data encryption strategy.</li>
<li><b>Data Revocation Capability</b>: Enables immediate data access revocation by disabling the encryption key in Azure Key Vault.</li>
</ul>

This functionality is critical for organizations handling sensitive data and seeking PCI DSS compliance on the Azure {{ site.data.products.advanced }} Tier of CockroachDB {{ site.data.products.cloud }}.

For more information, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cmek">Customer-Managed Encryption Keys (CMEK) Overview</a> and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-cmek">Manage CMEK for CockroachDB {{ site.data.products.advanced }} </a>.

<h3>May 12, 2025</h3>

CockroachDB v25.2 is now generally available (GA) for CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} clusters. CockroachDB v25.2 is a <a href="https://www.cockroachlabs.com/docs/releases/index#release-schedule">Regular release</a>.

For release notes, refer to <a href="https://www.cockroachlabs.com/docs/releases/v25.2">What's New in v25.2</a>.

To get started with v25.2, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-an-advanced-cluster">Create a CockroachDB {{ site.data.products.advanced }} cluster</a> or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-cockroach-version">Upgrade a Cluster in CockroachDB {{ site.data.products.cloud }}</a>.

<h3>April 30, 2025</h3>

You can now use the CockroachDB {{ site.data.products.cloud }} Console to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/labels">edit the labels of a cluster or folder</a>.

<h3>April 3, 2025</h3>

You can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/change-plan-between-basic-and-standard">change cluster plans between {{ site.data.products.basic }} and {{ site.data.products.standard }}</a> from the CockroachDB {{ site.data.products.cloud }} Console.

<h3>February 18, 2025</h3>

CockroachDB v25.1 is now generally available for select CockroachDB {{ site.data.products.cloud }} {{ site.data.products.advanced }} clusters. CockroachDB v25.1 is an <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy#innovation-releases">Innovation release</a>. Refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-an-advanced-cluster">Create a CockroachDB {{ site.data.products.advanced }} cluster</a> or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-cockroach-version">Upgrade to v25.1</a>.

<h3>January 16, 2025</h3>

<h4 id="2025-01-10-general-updates"> General updates </h4>

<ul>
<li>GCP Private Service Connect and Azure Private Link have been promoted from Preview to <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">GA</a>.

    For information about these features, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization">Network Authorization</a>.</li>
</ul>

<h3>December 17, 2024</h3>

<h4 id="2024-12-16-general-updates"> General updates </h4>

<ul>
<li>CockroachDB {{ site.data.products.cloud }} is now available as a pay-as-you-go offering on the Google Cloud Marketplace. This allows Google Cloud customers to pay for CockroachDB {{ site.data.products.cloud }} charges via their Google Cloud accounts, with no up-front commitments. For more detail, refer to:
<ul>
<li><a href="https://console.cloud.google.com/marketplace/product/cockroachlabs/cockroachdb-pay-as-you-go">CockroachDB (pay-as-you-go)</a> on the Google Cloud Marketplace.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/billing-management?filters=gcp#subscribe-through-aws-marketplace">Subscribe through the Google Cloud Marketplace</a> in the CockroachDB {{ site.data.products.cloud }} documentation.</li>
</ul>
</li>
</ul>

<h3>December 3, 2024</h3>

You can now use the CockroachDB {{ site.data.products.cloud }} Console to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/organization-audit-logs-in-cloud-console">view and filter audit logs</a>, providing greater visibility into user activity across your CockroachDB {{ site.data.products.cloud }} organization.

<h3>December 1, 2024</h3>

As of December 1, 2024, <a href="https://www.cockroachlabs.com/pricing/new/">updated pricing</a> that was recently <a href="https://www.cockroachlabs.com/blog/improved-cockroachdb-cloud-pricing/">announced</a> for CockroachDB {{ site.data.products.cloud }} is now in effect for all customers except those with annual or multi-year contracts that began prior to December 1, 2024. For those customers, the updated pricing, including new usage-based costs, goes into effect upon contract renewal. Prior to renewal, line items for usage of data transfer, backups, and changefeeds are displayed in the <a href="https://cockroachlabs.cloud/billing">Billing</a> interface and on invoices with a $0 charge, while showing actual usage metrics to help estimate future costs.

For further detail, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/costs">Understand CockroachDB {{ site.data.products.cloud }} Costs</a>.

<h3>November 18, 2024</h3>

CockroachDB v24.3 is now generally available for select CockroachDB {{ site.data.products.cloud }} clusters. CockroachDB v24.3 is a <a href="https://www.cockroachlabs.com/docs/releases/release-support-policy#regular-releases">Regular release</a>. Refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">Create a CockroachDB {{ site.data.products.standard }} cluster</a> or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-cockroach-version">Upgrade to v24.3</a>.

<h3>November 8, 2024</h3>

You can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#change-a-team-members-role">grant roles</a> to a user after you <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#invite-team-members-to-an-organization">invite them</a> to join your CockroachDB {{ site.data.products.cloud }} organization. Previously, a user was required to accept the invitation and create an account before roles could be granted.

<h3>November 1, 2024</h3>

Cockroach Labs has announced <a href="https://www.cockroachlabs.com/blog/improved-cockroachdb-cloud-pricing/">updated pricing</a> for CockroachDB {{ site.data.products.cloud }}. This new pricing model goes into effect December 1, 2024 for new customers and existing pay-as-you-go customers, and upon renewal for annual or multi-year contract customers.

A Preview of metering for usage-based billing of data transfer, backups, and changefeeds remains in effect through November 30, 2024. During this Preview, line items with a charge of $0 will be shown on your monthly invoice for these items. Customers with existing annual or multi-year contracts may continue to preview these line items until charges begin upon contract renewal.

For more information, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/costs">CockroachDB {{ site.data.products.cloud }} Costs</a> and the <a href="https://www.cockroachlabs.com/pricing/">CockroachDB Pricing</a> page.

<h3>October 29, 2024</h3>

The new official <a href="https://www.cockroachlabs.com/docs/cockroachcloud/configure-cloud-org-sso#add-a-custom-authentication-method">Cockroach Labs Okta app integration</a> eases the configuration of OIDC and SAML SSO authentication methods for CockroachDB {{ site.data.products.cloud }} organizations. Previously, a custom OIDC or SAML app integration in Okta was required.

<h3>October 28, 2024</h3>

<h4 id="2024-10-28-general-updates"> General updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/releases/v24.3#v24-3-0-beta-2">CockroachDB v24.3.0-beta.2</a> is available to CockroachDB {{ site.data.products.advanced }} clusters as a Pre-Production Preview release for testing and experimentation. An <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-admin">Organization Admin</a> can upgrade your CockroachDB {{ site.data.products.advanced }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. To learn more, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-cockroach-version">Upgrade a cluster in CockroachDB {{ site.data.products.cloud }}</a> and the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy">CockroachDB {{ site.data.products.cloud }} Upgrade Policy</a>.</li>
</ul>

<h3>October 22, 2024</h3>

<ul>
<li>The deprecated <code>is_regex</code> field has been removed from the <a href="https://cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/jwt-issuers">CockroachDB {{ site.data.products.cloud }} API for Java Web Tokens (JWTs)</a>. The API now handles regular expressions seamlessly.</li>
</ul>

<h3>October 1, 2024</h3>

<a href="https://www.cockroachlabs.com/docs/cockroachcloud/costs">Metering</a> for usage-based billing of data transfer, managed backup storage, and changefeeds is now in <a href="https://www.cockroachlabs.com/docs/stable/cockroachdb-feature-availability#features-in-preview">Preview</a> for all CockroachDB {{ site.data.products.cloud }} organizations.

<ul>
<li>Usage metrics for data transfer, managed backup storage, and changefeeds are now visible for CockroachDB {{ site.data.products.standard }} and {{ site.data.products.advanced }} clusters in the CockroachDB {{ site.data.products.cloud }} Console. You can view your usage across these metrics on the <a href="https://cockroachlabs.cloud/billing/overview">Billing page</a> and on invoices.</li>
<li>There will be no usage-based charges associated with these metrics during the Preview period, which is in effect through November 30, 2024\. During this time, line items with a charge of $0 will be shown for each metric on your monthly invoice.</li>
<li>We will share pricing for these usage-based costs by November 1, 2024\.</li>
<li>On December 1, 2024, once the Preview has ended, pricing for these metrics goes into effect immediately for new customers and for existing pay-as-you-go customers (e.g. paying monthly by credit card). Customers with annual or multi-year contracts will continue to preview these line items without incurring charges for them (i.e. expending credits) through the end of their current contract term.</li>
</ul>

<h3>September 25, 2024</h3>

<a href="https://www.cockroachlabs.com/docs/cockroachcloud/index">CockroachDB {{ site.data.products.cloud }}</a> <a href="https://cockroachlabs.com/pricing/">plans</a> have been updated, and existing clusters have been transitioned to the new plans. There is no impact on the functionality or availability of existing clusters.

<ul>
<li>CockroachDB {{ site.data.products.serverless }} clusters have been renamed to <b>CockroachDB {{ site.data.products.basic }}</b>.</li>
<li><b>CockroachDB {{ site.data.products.standard }}</b> is a new plan in <a href="https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroachdb-feature-availability#features-in-preview">Preview</a>. You can easily <a href="https://www.cockroachlabs.com/docs/cockroachcloud/provision-a-cluster-with-terraform#change-a-clusters-plan">switch</a> a {{ site.data.products.basic }} cluster to CockroachDB {{ site.data.products.standard }} in place or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">start a new {{ site.data.products.standard }} cluster</a>. New {{ site.data.products.cloud }} organizations can benefit from a <a href="https://www.cockroachlabs.com/docs/cockroachcloud/free-trial">free trial</a>.

    CockroachDB {{ site.data.products.standard }} offers the benefits of a scalable, shared architecture, along with many enterprise-ready features, including:

    <ul>
    <li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster#establish-private-connectivity">Private Connectivity</a> to AWS Privatelink, GCP VPC Peering, and GCP Private Service Connect.</li>
    <li>Customer control of <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#manage-cluster-upgrades">major version upgrades</a>.</li>
    <li>Customer-configurable <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups">Managed Backups</a>.</li>
    <li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics">Metrics export</a> to Amazon CloudWatch, Datadog, and Prometheus.</li>
    <li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics">Log export</a> to Amazon CloudWatch and GCP Cloud Logging.</li>
    </ul>
</li>
<li>CockroachDB {{ site.data.products.dedicated }} clusters have been renamed to <b>CockroachDB {{ site.data.products.advanced }}</b>. Former CockroachDB {{ site.data.products.dedicated }} {{ site.data.products.advanced }} clusters are now CockroachDB {{ site.data.products.advanced }} clusters with <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-an-advanced-cluster#step-6-configure-advanced-security-features">advanced security features</a> enabled.</li>
</ul>

For more details, refer to the <a href="https://cockroachlabs.com/blog/roachfest-24-product-updates">CockroachDB Blog</a> and learn more about <a href="https://cockroachlabs.com/pricing/">CockroachDB {{ site.data.products.cloud }} Costs across plans</a>.

In addition, this release includes the following features:

<ul>
<li>A collection of <a href="https://www.cockroachlabs.com/docs/cockroachcloud/metrics#cockroachdb-cloud-console-metrics-page">Metrics graphs</a> in the {{ site.data.products.cloud }} Console for all plans.</li>
<li>Configurable backup frequency and retention for <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups">Managed Backups</a> on CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.advanced }} clusters, so you can meet your Disaster Recovery requirements.</li>
<li>Updates to the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api">CockroachDB {{ site.data.products.cloud }} API</a> and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/provision-a-cluster-with-terraform">Terraform Provider</a> to support the new plans and features.</li>
</ul>

<h3>August 12, 2024</h3>

<h4 id="2024-08-12-general-updates"> General updates </h4>

<ul>
<li>CockroachDB v24.2 is now generally available for CockroachDB {{ site.data.products.dedicated }}. CockroachDB v24.2 is an optional <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy#innovation-releases">Innovation release</a>. Refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">Create a CockroachDB {{ site.data.products.dedicated }} cluster</a> or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-cockroach-version">Upgrade to v24.2</a>.</li>

<li>As of v24.2, Cockroach Labs releases a major version of CockroachDB once per quarter, alternating between releases classified as a _Regular release_ or an _Innovation release_.

  <ul>
  <li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy#regular-releases">Regular releases</a> are required; they must be applied to CockroachDB {{ site.data.products.dedicated }} clusters, and they are applied automatically to CockroachDB {{ site.data.products.serverless }} clusters. Regular releases are produced twice a year, alternating with Innovation releases. They are supported for one year. Upgrading CockroachDB {{ site.data.products.dedicated }} directly from one regular release to the next regular release, skipping the intervening Innovation release, is supported.</li>
  <li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy#innovation-releases">Innovation releases</a> are optional and can be skipped for CockroachDB {{ site.data.products.dedicated }} but are required for CockroachDB {{ site.data.products.serverless }}. Innovation releases are produced twice a year, alternating with Regular releases. An innovation release is supported for 6 months, at which time a CockroachDB {{ site.data.products.dedicated }} cluster must be upgraded to the next Regular release. At a a given time, only one Innovation release is typically supported. Upgrading CockroachDB {{ site.data.products.dedicated }} directly from one Innovation release to the next innovation release is not supported.

    {{site.data.alerts.callout_info}}
    To opt out of Innovation releases entirely and hide them from your CockroachDB organization, contact <a href="https://support.cockroachlabs.com/hc">Support</a>.
    {{site.data.alerts.end}}</li>
  </ul>

  To learn more, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy">CockroachDB {{ site.data.products.cloud }} Support and Upgrade Policy</a>.</li>
</ul>

<h3>July 31, 2024</h3>

<h4 id="2024-07-24-general-updates"> General updates </h4>

<ul>
<li>When creating a new CockroachDB {{ site.data.products.advanced }} cluster, you can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-an-advanced-cluster#step-9-select-the-cockroachdb-version">select the cluster's major version</a>. The default option is the latest stable version. At any given time, you may be able to choose from additional stable releases or experimental <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy#pre-production-preview-upgrades">Pre-Production Preview</a> releases. Patch releases within a major version are applied automatically.</li>
</ul>

<h3>July 19, 2024</h3>

<h4 id="2024-07-19-general-updates"> General updates </h4>

<ul>
<li>CockroachDB {{ site.data.products.cloud }} is now available as a pay-as-you-go offering on the AWS Marketplace. This allows AWS customers to pay for CockroachDB {{ site.data.products.cloud }} charges via their AWS accounts, with no up-front commitments. For more detail, refer to:
<ul>
<li><a href="https://aws.amazon.com/marketplace/pp/prodview-n3xpypxea63du">CockroachDB (pay-as-you-go)</a> on AWS Marketplace.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/billing-management?filters=aws#subscribe-through-aws-marketplace">Subscribe through AWS Marketplace</a> in the CockroachDB {{ site.data.products.cloud }} documentation.</li>
</ul>
</li>
</ul>

<h3>July 18, 2024</h3>

<h4 id="2024-07-18-security-updates"> Security updates </h4>

<ul>
<li>The maximum number of <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#ip-allowlisting">IP allowlist</a> entries has increased from 7 to 20 for CockroachDB {{ site.data.products.dedicated }} on AWS.</li>
</ul>

<h3>June 26, 2024</h3>

<h4 id="2024-06-26-general-updates"> General updates </h4>

<ul>
<li>The <code>qatarcentral</code> (Doha) region has been disabled for CockroachDB {{ site.data.products.dedicated }} clusters on Azure due to capacity issues. To express interest in this region, contact your account team.</li>
</ul>

<h3>June 17, 2024</h3>

<h4 id="2024-06-17-security-updates"> Security updates </h4>

<ul>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-sso#cloud-organization-sso">IdP-initiated SAML flow</a> is now enabled by default. When you configure a <a href="https://www.cockroachlabs.com/docs/cockroachcloud/configure-cloud-org-sso#saml">{{ site.data.products.cloud }} Organization SSO SAML connection</a>, your users can optionally sign in to CockroachDB {{ site.data.products.cloud }} directly from your IdP, such as by using a tile in Okta.</li>
</ul>

<h3>June 14, 2024</h3>

<h4 id="2024-06-14-general-updates"> General updates </h4>

<ul>
<li>Deletion protection, which helps to prevent a cluster in CockroachDB {{ site.data.products.cloud }} from being deleted by mistake, is generally available for CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }} clusters. A user with permission to delete a cluster can enable deletion protection for the cluster. Refer to the instructions for <a href="https://www.cockroachlabs.com/docs/cockroachcloud/basic-cluster-management#enable-deletion-protection">CockroachDB {{ site.data.products.serverless }}</a> and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#enable-deletion-protection">CockroachDB {{ site.data.products.dedicated }}</a>.</li>
</ul>

<h3>June 12, 2024</h3>

<h4 id="2024-06-12-general-updates"> General updates </h4>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} on AWS is now available in new <a href="https://www.cockroachlabs.com/docs/cockroachcloud/regions?filters=dedicated#aws-regions">regions</a>:
    <ul>
    <li><code>ap-east-1</code> (Hong Kong)</li>
    <li><code>ap-southeast-3</code> (Jakarta)</li>
    <li><code>ca-west-1</code> (Calgary)</li>
    <li><code>eu-south-1</code> (Milan)</li>
    <li><code>il-central-1</code> (Tel Aviv)</li>
    <li><code>me-south-1</code> (Bahrain)</li>
    </ul>
</li>
</ul>

<h4 id="2024-06-12-security-updates"> Security updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster#azure-private-link">Configuring private connectivity using Azure Private Link</a> is available in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">preview</a> for CockroachDB {{ site.data.products.dedicated }} clusters on Azure. <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#options-for-controlling-network-access">Private connectivity</a> allows you to establish SQL access to a CockroachDB {{ site.data.products.dedicated }} cluster entirely through cloud provider private infrastructure, without exposing the cluster to the public internet, affording enhanced security and performance.</li>
</ul>

<h3>May 20, 2024</h3>

<h4 id="2024-05-20-general-updates"> General updates </h4>

<ul>
<li>CockroachDB v24.1 is now generally available for CockroachDB {{ site.data.products.dedicated }}, and is scheduled to be made available for CockroachDB {{ site.data.products.core }} on June 3, 2024{% comment %}Verify{% endcomment %}. For more information, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">Create a CockroachDB {{ site.data.products.dedicated }} Cluster</a> or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-cockroach-version">Upgrade to CockroachDB v24.1</a>.</li>
<li>CockroachDB {{ site.data.products.dedicated }} on AWS is now available in the <code>me-central-1</code>(United Arab Emirates) <a href="https://www.cockroachlabs.com/docs/cockroachcloud/regions#aws-regions"> region</a>.</li>
<li>CockroachDB {{ site.data.products.dedicated }} on GCP is now available in new <a href="https://www.cockroachlabs.com/docs/cockroachcloud/regions#gcp-regions">regions</a>:
    <ul>
    <li><code>europe-southwest1</code> (Madrid)</li>
    <li><code>europe-west8</code> (Milan)</li>
    <li><code>europe-west12</code> (Paris)</li>
    <li><code>me-central1</code> (Doha)</li>
    <li><code>me-west1</code> (Tel Aviv)</li>
    <li><code>us-east5</code> (Columbus)</li>
    <li><code>us-south1</code> (Dallas)</li>
    </ul>
</li>
</ul>

<h4 id="2024-05-20-security-updates"> Security updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster#gcp-private-service-connect">Configuring private connectivity using Google Cloud Private Service Connect</a> is available in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">preview</a> for CockroachDB {{ site.data.products.dedicated }} clusters on GCP. <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#options-for-controlling-network-access">Private connectivity</a> allows you to establish SQL access to a CockroachDB {{ site.data.products.dedicated }} cluster entirely through cloud provider private infrastructure, without exposing the cluster to the public internet, affording enhanced security and performance.</li>
</ul>

<h3>May 12, 2024</h3>

<h4 id="2024-05-12-security-updates"> Security updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/folders">Folders</a> are now available in <a href="https://www.cockroachlabs.com/docs/stable/cockroachdb-feature-availability">preview</a>.</li>
<li>The initial <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-admin">Organization Admin</a> is now automatically assigned the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#folder-admin">Folder Admin</a> role.</li>
<li>A <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#folder-admin">Folder Admin</a> can now view all users and service accounts.</li>
</ul>

<h3>April 18, 2024</h3>

<h4 id="2024-04-18-general-updates"> General updates </h4>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} clusters on Azure can now be created in the following <a href="https://www.cockroachlabs.com/docs/cockroachcloud/regions">regions</a>:

    <table>
    <tr>
    <th>Geographic Area</th>
    <th>Region Name</th>
    <th>Location</th>
    </tr>
    <tr>
    <td>Africa</td>
    <td><code>southafricanorth</code></td>
    <td>Johannesburg</td>
    </tr>
    <tr>
    <td>Asia Pacific</td>
    <td><code>japaneast</code></td>
    <td>Tokyo</td>
    </tr>
    <tr>
    <td></td>
    <td><code>koreacentral</code></td>
    <td>Seoul</td>
    </tr>
    <tr>
    <td>Middle East</td>
    <td><code>qatarcentral</code></td>
    <td>Doha</td>
    </tr>
    <tr>
    <td></td>
    <td><code>uaenorth</code></td>
    <td>Dubai</td>
    </tr>
    <tr>
    <td></td>
    <td><code>southcentralus</code></td>
    <td>Texas</td>
    </tr>
    <tr>
    <td></td>
    <td><code>westus3</code></td>
    <td>Washington</td>
    </tr>
    <tr>
    <td>Western Europe</td>
    <td><code>francecentral</code></td>
    <td>Paris</td>
    </tr>
    <tr>
    <td></td>
    <td><code>norwayeast</code></td>
    <td>Oslo</td>
    </tr>
    <tr>
    <td></td>
    <td><code>polandcentral</code></td>
    <td>Warsaw</td>
    </tr>
    <tr>
    <td></td>
    <td><code>swedencentral</code></td>
    <td>Gävle</td>
    </tr>
    <tr>
    <td></td>
    <td><code>switzerlandnorth</code></td>
    <td>Zürich</td>
    </tr>
    </table>
</li>
</ul>

<h3>April 17, 2024</h3>

<h4 id="2024-04-17-general-updates"> General updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/releases/v24.1#v24-1-0-beta-1">CockroachDB v24.1.0-beta.1</a> is available to CockroachDB {{ site.data.products.dedicated }} clusters as a Pre-Production Preview release for testing and experimentation. An <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-admin">Organization Admin</a> can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. To learn more, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-cockroach-version">Upgrade to v24.1 Pre-Production Preview</a> and the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy">CockroachDB {{ site.data.products.cloud }} Upgrade Policy</a>.</li>
</ul>

<h3>April 9, 2024</h3>

<h4 id="2024-04-09-security-updates"> Security updates </h4>

<ul>
<li>The <code>paths</code> field of an <a href="https://www.cockroachlabs.com/docs/cockroachcloud/egress-perimeter-controls">Egress Perimeter Control</a> egress rule is now deprecated and will be removed in the future. The CockroachDB {{ site.data.products.cloud }} API ignores this field and applies an egress rule to all egress requests to the specified network destination.</li>
</ul>

<h3>March 20, 2024</h3>

<h4 id="2024-03-20-security-updates"> Security updates </h4>

<ul>
<li>All CockroachDB {{ site.data.products.cloud }} organizations have been migrated to use <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles">fine-grained roles</a>. The following deprecated legacy roles have been removed:
    <ul>
    <li>Org Administrator (Legacy)</li>
    <li>Org Developer (Legacy)</li>
    </ul>
</li>
</ul>

<h3>March 19, 2024</h3>

<h4 id="2024-03-19-general-updates"> General updates </h4>

<ul>
<li>You can now use the CockroachDB {{ site.data.products.cloud }} Console to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/advanced-cluster-management#add-or-remove-regions-from-a-cluster">add or remove regions</a> for an existing CockroachDB {{ site.data.products.dedicated }} cluster on Azure.</li>
</ul>

<h3>March 8, 2024</h3>

<h4 id="2024-03-08-general-updates"> General updates </h4>

<ul>
<li>You can now add or remove regions from an existing CockroachDB {{ site.data.products.dedicated }} cluster on Azure, rather than only during cluster creation.</li>
</ul>

<h3>February 6, 2024</h3>

<h4 id="2024-02-06-general-updates"> General updates </h4>

<ul>
<li>Folder names can now include apostrophes. For details about folder naming, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/folders#folder-naming">Folder Naming</a>.</li>
</ul>

<h3>February 5, 2024</h3>

<h4 id="2024-02-05-console-changes"> Console changes </h4>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} clusters now have a <a href="https://www.cockroachlabs.com/docs/cockroachcloud/metrics-essential"><b>Metrics</b> page</a> in the Console with charts to <b>Monitor SQL Activity</b> and <b>Identify SQL Problems</b>. On the <b>Metrics</b> page, a <b>Custom</b> tab takes you to the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/custom-metrics-chart-page"><b>Custom Metrics Chart</b> page</a> (available in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">preview</a>) where you can create custom charts showing the time series data for an available metric or combination of metrics.</li>
</ul>

<h3>January 29, 2024</h3>

<h4 id="2024-01-29-general-updates"> General updates </h4>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} clusters now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics#the-metricexport-endpoint">export metrics</a> to third-party monitoring tool <a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics?filters=prometheus-metrics-export">Prometheus</a>. This feature is available in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">preview</a>.</li>
</ul>

<h3>January 25, 2024</h3>

<h4 id="2024-01-17-general-updates"> General updates </h4>

<ul>
<li>The single-page CockroachDB {{ site.data.products.cloud }} <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-a-basic-cluster">Create cluster</a> and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/basic-cluster-management">Edit cluster</a> have been updated to use multi-step wizards.</li>
</ul>

<h3>January 17, 2024</h3>

<h4 id="2024-01-17-general-updates"> General updates </h4>

<ul>
<li>CockroachDB v23.2 is now generally available for CockroachDB {{ site.data.products.dedicated }}, and is scheduled to be made available for CockroachDB {{ site.data.products.core }} on February 5, 2024. For more information, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">Create a CockroachDB {{ site.data.products.dedicated }} Cluster</a> or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-cockroach-version">Upgrade to CockroachDB v23.2</a>.</li>
</ul>

<h3>December 21, 2023</h3>

<h4 id="2023-12-21-general-updates"> General updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/releases/v23.2#v23-2-0-rc-1">CockroachDB v23.2.0-rc.1</a> is available to CockroachDB {{ site.data.products.dedicated }} clusters as a Pre-Production Preview release for testing and experimentation. An <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-admin">Organization Admin</a> can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. For clusters previously upgraded to the v23.2.0-beta.3 Pre-Production Preview release, v23.2.0-rc.1 will be applied automatically as a patch upgrade unless you choose to manually upgrade. To learn more, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-cockroach-version">Upgrade to v23.2 Pre-Production Preview</a> and the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy">CockroachDB {{ site.data.products.cloud }} Upgrade Policy</a>.</li>
</ul>

<h3>December 19, 2023</h3>

<h4 id="2023-12-19-general-updates"> General updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/releases/v23.2#v23-2-0-beta-3">CockroachDB v23.2.0-beta.3</a> is available to CockroachDB {{ site.data.products.dedicated }} clusters as a Pre-Production Preview release for testing and experimentation. An <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-admin">Organization Admin</a> can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. To learn more, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-cockroach-version">Upgrade to v23.2 Pre-Production Preview</a> and the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy">CockroachDB {{ site.data.products.cloud }} Upgrade Policy</a>.</li>
</ul>

<h3>December 14, 2023</h3>

<h4 id="2023-12-14-security-updates"> Security updates </h4>

<ul>
<li>Organizations enrolled in <a href="https://cockroachlabs.com/docs/cockroachcloud/folders">CockroachDB {{ site.data.products.cloud }} Folders (Limited Access)</a> can now use the CockroachDB {{ site.data.products.cloud }} Console to create and manage access to folders and clusters, in addition to the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api">CockroachDB {{ site.data.products.cloud }} API</a> and the <a href="https://registry.terraform.io/providers/cockroachdb/cockroach">Terraform provider</a> v1.1.0 or above. To learn more, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/folders">Organize CockroachDB {{ site.data.products.cloud }} Clusters Using Folders</a>.</li>
</ul>

<h3>November 29, 2023</h3>

<h4 id="2023-11-29-security-updates"> Security updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/client-certs-advanced">Authenticating to CockroachDB {{ site.data.products.dedicated }} clusters using public key infrastructure (PKI) security certificates</a> is now <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">Generally Available</a> to all CockroachDB {{ site.data.products.cloud }} organizations.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/configure-scim-provisioning">SCIM Provisioning</a>, which centralizes provisioning and management of CockroachDB {{ site.data.products.cloud }} organization members in an identity provider (IdP) such as Okta using <a href="https://www.rfc-editor.org/rfc/rfc7644">System for Cross-Domain Identity Management SCIM</a>, is now <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">Generally Available</a> to all CockroachDB {{ site.data.products.cloud }} organizations.</li>
</ul>

<h3>November 08, 2023</h3>

<h4 id="2023-11-08"> General changes </h4>

<ul>
<li>For CockroachDB {{ site.data.products.dedicated }} clusters, the ability to add and remove regions through the CockroachDB {{ site.data.products.cloud }} Console has now been restored.</li>
</ul>

<h3>October 17, 2023</h3>

<h4 id="2023-10-17-general-changes"> General changes </h4>

<ul>
<li>New CockroachDB {{ site.data.products.dedicated }} clusters on Azure can be created in the Pune (<code>centralindia</code>) <a href="https://www.cockroachlabs.com/docs/cockroachcloud/regions?filters=dedicated#azure-regions">cloud region</a>.</li>
</ul>

<h3>October 4, 2023</h3>

<h4 id="2023-10-04-general-changes"> General changes </h4>

<ul>
<li>New CockroachDB {{ site.data.products.dedicated }} clusters on Azure can be created in the Singapore (<code>southeastasia</code>) <a href="https://www.cockroachlabs.com/docs/cockroachcloud/regions?filters=dedicated#azure-regions">cloud region</a>.</li>
</ul>

<h3>October 2, 2023</h3>

<h4 id="2023-10-02-general-changes"> General changes </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/cockroachdb-advanced-on-azure">CockroachDB {{ site.data.products.advanced }} on Azure</a> is <a href="https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroachdb-feature-availability#feature-availability-phases">generally available</a>.</li>
</ul>

<h4 id="2023-10-02-console-changes"> Console changes </h4>

<ul>
<li>CockroachDB {{ site.data.products.serverless }} clusters now have a <a href="https://www.cockroachlabs.com/docs/cockroachcloud/custom-metrics-chart-page"><b>Custom Metrics Chart</b> page</a> available in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">preview</a>. From the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/metrics-essential"><b>Metrics</b> page</a> in the Console, navigate to the <b>Custom</b> tab to create custom charts showing the time series data for an available metric or combination of metrics.</li>
</ul>

<h3>September 29, 2023</h3>

<h4 id="2023-09-29-general-changes"> General changes </h4>

<ul>
<li>Multi-region CockroachDB {{ site.data.products.serverless }} clusters are now <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">generally available</a>, and <a href="https://www.cockroachlabs.com/pricing">cross-region network charges</a> are now accounted for in RU consumption.</li>
</ul>

<h3>September 27, 2023</h3>

<h4 id="2023-09-27-general-changes"> General changes </h4>

<ul>
<li>The {{ site.data.products.cloud }} Console's <a href="https://www.cockroachlabs.com/docs/cockroachcloud/sql-shell">SQL Shell</a> is now available in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">preview</a> to all CockroachDB {{ site.data.products.cloud }} users with the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-access">Cluster Admin role</a>.</li>
</ul>

<h3>September 22, 2023</h3>

<h4 id="2023-09-22-general-changes"> General changes </h4>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} clusters on Azure can now be modified, <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management">horizontally or vertically scaled</a>, <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy">upgraded</a>, have their <a href="https://www.cockroachlabs.com/docs/cockroachcloud/advanced-cluster-management#increase-storage-for-a-cluster">storage increased</a>, and have <a href="https://www.cockroachlabs.com/docs/cockroachcloud/advanced-cluster-management#set-a-maintenance-window">maintenance windows</a> set. To learn more, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cockroachdb-advanced-on-azure">CockroachDB {{ site.data.products.dedicated }} on Azure</a>.</li>
</ul>

<h3>September 11, 2023</h3>

<h4 id="2023-09-11-general-changes"> General changes </h4>

<ul>
<li>The {{ site.data.products.cloud }} Console's <a href="https://www.cockroachlabs.com/docs/cockroachcloud/sql-shell">SQL Shell</a> is now available in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">limited access</a>. This feature enables you to run queries on your cluster directly from the {{ site.data.products.cloud }} Console. To enroll your organization, contact your Cockroach Labs account team.</li>
</ul>

<h3>September 8, 2023</h3>

<h4 id="2023-09-08-general-changes"> General changes </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups?filters=dedicated">Managed backups</a> are now available for <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cockroachdb-advanced-on-azure">CockroachDB {{ site.data.products.dedicated }} clusters on Azure (Limited Access)</a>.</li>

<li>You can now create new <a href="https://www.cockroachlabs.com/docs/stable/multiregion-overview">multi-region</a> CockroachDB {{ site.data.products.dedicated }} clusters on Azure.</li>
</ul>

{% capture regions_list %}
  <ul>
  <li><code>australiaeast</code></li>
  <li><code>canadacentral</code></li>
  <li><code>centralus</code></li>
  <li><code>eastasia</code></li>
  <li><code>eastus</code></li>
  <li><code>germanywestcentral</code></li>
  <li><code>northeurope</code></li>
  <li><code>uksouth</code></li>
  <li><code>westus2</code></li>
  </ul>
{% endcapture %}

<ul>
<li>New CockroachDB {{ site.data.products.dedicated }} clusters on Azure can be created in additional <a href="https://www.cockroachlabs.com/docs/cockroachcloud/regions?filters=dedicated#azure-regions">cloud regions</a>:

    {{regions_list}}</li>
</ul>

<h3>September 6, 2023</h3>

<h4 id="2023-09-06-general-changes"> General changes </h4>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} <a href="https://www.cockroachlabs.com/docs/cockroachcloud/advanced-cluster-management#set-a-maintenance-window">maintenance windows</a> now include all kinds of cluster maintenance operations in addition to patch upgrades.</li>
</ul>

<h3>September 1, 2023</h3>

<h4 id="2023-09-01-general-changes"> General changes </h4>

<ul>
<li>Configuring <a href="https://cockroachlabs.com/docs/cockroachcloud/aws-privatelink">private endpoint trusted owners</a> for CockroachDB {{ site.data.products.dedicated }} clusters on AWS is available in <a href="https://www.cockroachlabs.com/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability">limited access</a>. To enroll your organization, contact your Cockroach Labs account team.</li>
</ul>

<h3>August 22, 2023</h3>

<h4 id="2023-08-16-general-changes"> General changes </h4>

<ul>
<li>In the {{ site.data.products.cloud }} Console, you can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/folders">add regions and change the primary region</a> for multi-region CockroachDB {{ site.data.products.serverless }} clusters. You cannot currently edit the region configuration for a single-region cluster once it has been created, and you cannot remove a region once it has been added.</li>
</ul>

<h3>August 16, 2023</h3>

<h4 id="2023-08-16-general-changes"> General changes </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/folders">Organizing clusters using folders</a> is available in <a href="https://www.cockroachlabs.com/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability">limited access</a>. To enroll your organization, contact your Cockroach Labs account team.</li>
</ul>

<h3>August 9, 2023</h3>

<h4 id="2023-08-09-console-changes"> Console changes </h4>

<ul>
<li>The <b>Updating</b> cluster status in the {{ site.data.products.db }} Console has been replaced with the <b>Available (Maintenance in Progress)</b> status to clarify that clusters are available for reading and writing data during maintenance upgrades.</li>
</ul>

<h3>August 1, 2023</h3>

<h4 id="2023-08-01-general-changes"> General changes </h4>

<ul>
<li>{{ site.data.products.serverless }} pricing changes that went into effect for newly-created organizations beginning on  <a href="https://www.cockroachlabs.com/docs/#may-1-2023">May 1, 2023</a> are now in effect for all organizations. Review the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster-basic#pricing">new pricing</a>, and review your current <a href="https://www.cockroachlabs.com/docs/../cockroachcloud/basic-cluster-management.html#edit-cluster-capacity">resource limits</a> to prevent disruptions to your service.</li>
</ul>

<h3>July 31, 2023</h3>

<h4 id="2023-07-31-console-changes"> Console changes </h4>

<ul>
<li>The primary navigation to the <b>Clusters</b>, <b>Billing</b>, <b>Alerts</b>, and <b>Organization</b> pages in the CockroachDB {{ site.data.products.cloud }} Console is now displayed at the top of the page instead of on the left.</li>
</ul>

<h3>July 24, 2023</h3>

<h4 id="2023-07-24-security-changes"> Security updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs//docs/cockroachcloud/aws-privatelink.html?filters=serverless">Configuring private connectivity using AWS PrivateLink</a> is available in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">limited access</a> for multi-region CockroachDB {{ site.data.products.serverless }} clusters on AWS. To enroll your organization, contact your Cockroach Labs account team.</li>
</ul>

<h4 id="2023-07-24-console-changes"> Console changes </h4>

<ul>
<li><code>ccloud</code> <a href="https://www.cockroachlabs.com/docs/cockroachcloud/ccloud-get-started#install-ccloud">v0.5.11</a> is now available. This update includes a new <a href="https://www.cockroachlabs.com/docs/cockroachcloud/ccloud-reference#skip-the-ip-allowlist-check-when-connecting-to-your-cluster"><code>--skip-ip-check</code> flag</a> that allows users to skip the client-side IP allowlist check when connecting to a cluster using the <code>ccloud cluster sql</code> command.</li>
</ul>

<h3>July 21, 2023</h3>

<h4 id="2023-07-21-security-changes"> Security updates </h4>

<ul>
<li><b>Health Insurance Portability and Accountability Act (HIPAA)</b>: When configured appropriately for <a href="https://www.cockroachlabs.com/docs/cockroachcloud/pci-dss">PCI DSS Compliance</a>, CockroachDB {{ site.data.products.dedicated }} advanced also meets the requirements of the Health Insurance Portability and Accountability Act of 1996, commonly referred to as _HIPAA_. HIPAA defines standards for the storage and handling of personally-identifiable information (PII) related to patient healthcare and health insurance, which is also known as protected-health information (PHI). To learn more, refer to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/compliance">Regulatory Compliance in CockroachDB {{ site.data.products.dedicated }} </a>.</li>
</ul>

<h3>July 10, 2023</h3>

<h4 id="2023-07-10-general-changes"> General changes </h4>

<ul>
<li>Previously, a default setting in the Amazon CloudWatch exporter could cause redundant cardinality in <a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics">metrics exported</a> from CockroachDB {{ site.data.products.dedicated }} clusters, which unnecessarily increased costs. This option is now disabled to reduce AWS costs.</li>
</ul>

<h4 id="2023-07-10-console-changes"> Console changes </h4>

<ul>
<li>The <b>Add database</b> button on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/databases-page"><b>Databases</b> page</a> of the Console is temporarily disabled.</li>
<li>CockroachDB {{ site.data.products.dedicated }} <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups-advanced#restore-data">restore jobs</a> now have the following more descriptive statuses: <code>Preparing</code>, <code>Running</code>, <code>Reverting</code>, <code>Finalizing</code>, <code>Succeeded</code>, and <code>Failed</code> statuses. Additionally, destination clusters of self-service restores now display a <code>Restoring</code> state during the restore.</li>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/databases-page"><b>Databases</b> page</a> now includes additional statistics for clusters running <a href="https://www.cockroachlabs.com/docs/releases/v23.1">v23.1.0</a> and later.</li>
<li>You can now set up an AWS CloudWatch integration and view its status directly from the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics-advanced"><b>Tools</b> page</a> of the CockroachDB {{ site.data.products.cloud }} Console.</li>
</ul>

<h4 id="2023-07-10-security-changes"> Security updates </h4>

<ul>
<li>CockroachDB {{ site.data.products.serverless }} users can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#ip-allowlisting">configure an IP allowlist</a> with up to 50 allowlist rules for their clusters.</li>
<li>The following <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles">roles</a> are now available for users of the limited access <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#ip-allowlisting">fine-grained access control authorization model</a>:

    <ul>
    <li>Cluster Operator</li>
    <li>Billing Coordinator</li>
    <li>Org Administrator</li>
    </ul>

    To enroll your organization in the new authorization model, contact your Cockroach Labs account team.</li>
</ul>

<h3>June 05, 2023</h3>

<h4 id="2023-07-05-console-changes"> Console changes </h4>

<ul>
<li>Organizations that have purchased premium support will now see it included in their <a href="https://www.cockroachlabs.com/docs/cockroachcloud/billing-management">invoices</a>.</li>
<li>Cross-cluster <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups#restore-a-cluster">restores</a> are now limited to CockroachDB {{ site.data.products.dedicated }} clusters with a major version greater than or equal to the major version of the source cluster.</li>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups-advanced#restore-data"><b>Restore jobs</b></a> tab of the <b>Backups page</b> now shows more information about a restore job, such as the source and destination clusters, the restore type, the backup size, and the job's progress.</li>
</ul>

<h4 id="2023-07-05-security-changes"> Security updates </h4>

<ul>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-audit-logs">Organization Audit Logs API</a>, which provides logs of events that occur in a {{ site.data.products.cloud }} organization, is now <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability#feature-availability-phases">generally available</a>.</li>
<li><code>ExternalId</code> support is now re-enabled in the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cmek">Customer-managed Encryption Key (CMEK)</a> capability on AWS.</li>
</ul>

<h4 id="2023-07-05-bug-fixes"> Bug fixes </h4>

<ul>
<li>The <code>status</code> returned by the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-logs#the-logexport-endpoint"><code>logexport</code> {{ site.data.products.cloud }} API endpoint</a> is now determined by the state of both the latest log export's job state and the readiness of the underlying logging resources. Before this change, a <code>GET</code> request to the <code>logexport</code> endpoint could report an outdated log export status that conflicted with the latest log export update job state or with the most recent state of the logging infrastructure.</li>
<li>Fixed a bug where concurrent <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups#restore-a-cluster">restores</a> could run on the same destination cluster and cause the destination cluster to become unusable.</li>
<li>Fixed a bug where the IOPS price preview shown when <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">creating</a> or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management">editing a cluster</a> was inaccurate.</li>
<li>The <b>Group</b> tab is now shown only to users who have this feature enabled. Previously, an error page was shown to users who navigated to the <b>Group</b> tab without enabling the feature.</li>
</ul>

<h3>May 31, 2023</h3>

<h4 id="2023-05-31-security-changes"> Security updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-audit-logs">CockroachDB {{ site.data.products.cloud }} Organization Audit Logs</a>, which capture historical logs when many types of events occur, are now generally available for CockroachDB {{ site.data.products.cloud }} organizations.</li>
</ul>

<h3>May 15, 2023</h3>

In addition to many of the Feature Highlights in the <a href="https://www.cockroachlabs.com/docs/releases/v23.1#v23-1-0-feature-highlights">CockroachDB v23.1.0 Release Notes</a>, the following features are specifically available to {{ site.data.products.cloud }} clusters once they are upgraded:

<h4 id="2023-05-15-general-changes"> General changes </h4>

<ul>
<li>CockroachDB {{ site.data.products.serverless }} <a href="https://www.cockroachlabs.com/docs/v23.1/multiregion-overview">multi-region</a> is now publicly available in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability#feature-availability-phases">preview</a>. Multi-region benefits like reduced latency and high availability are now achievable in conjunction with the ease-of-operation and automatic scaling advantages of the CockroachDB {{ site.data.products.serverless }} deployment model.

    <ul>
    <li>Regions available: 6 regions in AWS and 6 regions in GCP.</li>
    <li>A primary region for the cluster is specified upon creation.</li>
    <li>The cluster’s regional configuration applies to all databases by default, so it is not necessary to run <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-database#add-region"><code>ALTER DATABASE ... ADD REGION</code></a> to configure regions when adding a database to the cluster.</li>
    <li><a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-database#survive-zone-region-failure"><code>SURVIVE REGION FAILURE</code></a> is supported to achieve <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multiregion-overview#survival-goals">region-level survival goals</a>.</li>
    </ul></li>

<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/cockroachdb-advanced-on-azure">Creating CockroachDB {{ site.data.products.advanced }} clusters on Azure</a> is now available in <a href="https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/cockroachdb-feature-availability">limited access</a>. To enroll your organization and begin testing this feature, contact your Cockroach Labs account team.</li>
</ul>

<h4 id="2023-05-15-console-changes"> Console changes </h4>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} users can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/take-and-restore-self-managed-backups">restore clusters from the {{ site.data.products.cloud }} console</a>.</li>
</ul>

<h3>May 10, 2023</h3>

<h4 id="2023-05-10-security-changes"> Security updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/egress-perimeter-controls">Egress Perimeter Controls</a>, which allow you to restrict egress from a CockroachDB {{ site.data.products.dedicated }} cluster to a list of specified external destinations, are now generally available for CockroachDB {{ site.data.products.dedicated }} advanced clusters.</li>
</ul>

<h3>May 1, 2023</h3>

<h4 id="2023-05-01-general-changes"> General changes </h4>

The following changes were made to CockroachDB {{ site.data.products.serverless }} for <b>new organizations</b> created on or after April 26, 2023. <b>Existing organizations will not be affected until August 1, 2023</b>.

<ul>
<li>The price of <a href="https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster-basic#request-units">Request Units (RUs)</a> increased from $1 per 10M RU to $2 per 10M RUs.</li>
<li>The price of storage decreased from $1 per 1 GiB storage to $0.50 per 1 GiB storage.</li>
<li>Free resources are allocated on a per-organization basis instead of a per-cluster basis. All non-contract organizations will now receive 50M Request Units per month and 10 GiB of storage for free. Free resources do not apply to customers with annual or multi-year contracts.</li>
<li>All resources are available instantly at the beginning of each month (burst and baseline RUs are now deprecated).</li>
<li>You can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/basic-cluster-management#edit-cluster-capacity">set separate RU and storage limits</a> for your clusters, or set a spend limit that will be divided between resources automatically.</li>
<li>You can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/basic-cluster-management#edit-cluster-capacity">set unlimited resources</a> for a cluster so your workload is never restricted.</li>
<li>Organizations on the free plan will have at most one free serverless cluster (instead of the previous limit of five free clusters). <b>Cockroach Labs will continue to maintain all existing free clusters with the new organization-level free resources</b>.</li>
<li>Organizations can now create 200 serverless clusters instead of the previous maximum of five total clusters.</li>
</ul>

For an in-depth explanation of CockroachDB {{ site.data.products.serverless }} pricing, refer to <a href="https://cockroachlabs.com/pricing">Pricing</a>. For any questions or concerns, please <a href="https://support.cockroachlabs.com">contact Support</a>.

<h4 id="2023-05-01-console-changes"> Console changes </h4>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} users can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups?filters=advanced#restore-data-in-advanced-clusters">use the {{ site.data.products.cloud }} Console for full-cluster restores</a>.</li>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-access"><b>Access Management</b> page</a> in the {{ site.data.products.cloud }} Console now shows only relevant content based on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles">user's role assignments</a>.</li>
</ul>

<h4 id="2023-05-01-api-changes">{{ site.data.products.cloud }} API changes </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api">{{ site.data.products.cloud }} API</a> responses now contain a header called <code>Cc-Trace-Id</code> that can be provided to <a href="https://support.cockroachlabs.com">Support</a> to help with diagnostics or troubleshooting.</li>
<li>The <code>CreateCluster</code> and <code>UpdateCluster</code> methods now support setting individual monthly limits for a cluster's Request Units and storage usage.</li>
<li>If your organization is enrolled in the new fine-grained authorization model described under <b>Security Updates</b>, you can assign the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles">new roles</a> to both users and service accounts using the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api">{{ site.data.products.cloud }} API</a> or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/provision-a-cluster-with-terraform">Terraform provider</a> in addition to the {{ site.data.products.cloud }} Console.</li>
</ul>

<h4 id="2023-05-01-security-changes"> Security updates </h4>

<ul>
<li>CockroachDB {{ site.data.products.cloud }} is transitioning to a new <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#overview-of-the-cockroachdb-cloud-authorization-model">authorization model</a> that offers fine-grained access-control (FGAC), meaning that users can be given access to exactly the actions and resources required to perform their tasks. Changes include <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles">cluster-level roles</a> and consistent access management across users and service accounts. This feature is in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">limited access</a>, and you can enroll your organization by contacting your account team. For more information, see <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-access">Managing Access (Authorization) in CockroachDB Cloud</a>.</li>

<li>You can now use client certificates to authenticate to CockroachDB {{ site.data.products.dedicated }} clusters. First, a <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles">Cluster Admin</a> needs to upload a CA certificate for the cluster using the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api">{{ site.data.products.cloud }} API</a> or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/provision-a-cluster-with-terraform">Terraform provider</a>. After that, individual users can be assigned client certificates signed by the uploaded CA certificate, which they can then use to connect to the cluster. This feature is in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">limited access</a>, and you can enroll your organization by contacting your account team.</li>
</ul>

<h4 id="2023-05-01-bug-fixes"> Bug fixes </h4>

<ul>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster"><b>Connect to your cluster</b></a> dialog and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/databases-page"><b>Databases</b> page</a> in the Console now respond significantly faster for clusters with over 100 databases.</li>
<li>Fixed a bug where table and database <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups">restores</a> were disabled for clusters running CockroachDB versions <a href="https://www.cockroachlabs.com/docs/releases/v22.2#v22-2-6">v22.2.6</a> or below.</li>
</ul>

<h3>April 26, 2023</h3>

<h4 id="2023-04-26-security-changes"> Security updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/configure-scim-provisioning">SCIM Provisioning</a>, which centralizes provisioning and management of CockroachDB {{ site.data.products.cloud }} organization members in an identity provider (IdP) such as Okta using <a href="https://www.rfc-editor.org/rfc/rfc7644">System for Cross-Domain Identity Management SCIM</a>, is available in <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability">limited access</a>. To enroll your organization, contact your account team.</li>
</ul>

<h3>April 10, 2023</h3>

<h4 id="2023-04-10-general-changes"> General changes </h4>

<ul>
<li>Contract customers can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster#step-1-start-the-cluster-creation-process">create CockroachDB {{ site.data.products.dedicated }} advanced clusters</a>, which have all the features of CockroachDB {{ site.data.products.dedicated }} standard clusters, plus security features needed for <a href="https://www.cockroachlabs.com/docs/cockroachcloud/pci-dss">PCI DSS compliance</a>. To upgrade your organization to a contract, <a href="https://cockroachlabs.com/contact-sales">contact us</a>.</li>
<li>CockroachDB {{ site.data.products.dedicated }} clusters now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics#the-metricexport-endpoint">export the following metrics</a> to third-party monitoring tools such as <a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics?filters=datadog-metrics-export">Datadog</a> and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics?filters=aws-metrics-export">Amazon CloudWatch</a>:
  <ul>
  <li><code>storage_l0_sublevels</code></li>
  <li><code>storage_l0_num_files</code></li>
  <li><code>security_certificate_expiration_ca</code></li>
  <li><code>sql_mem_root_current</code></li>
  <li><code>sys_host_disk_iopsinprogress</code></li>
  </ul></li>
</ul>

<h4 id="2023-04-10-api-changes"> Cloud API changes </h4>

<ul>
<li>You can now upgrade, roll back, or manually finalize a pending upgrade to your cluster using the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api">{{ site.data.products.cloud }} API</a>.</li>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api">{{ site.data.products.cloud }} API endpoints</a> that were in preview for configuring metric export have been replaced with specific endpoints for each supported third-party tool integration. For example, <code>EnableMetricExport</code> is now replaced by <code>EnableDatadogMetricExport</code> and <code>EnableCloudWatchMetricExport</code>.</li>
</ul>

<h4 id="2023-04-10-security-changes"> Security updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-admin">Organization Admins</a> of organizations that have <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-sso">enabled {{ site.data.products.cloud }} Organization SSO</a> can now reset the passwords of other users in their organization who authenticate using passwords rather than an SSO authentication method.</li>
</ul>

<h4 id="2023-04-10-bug-fixes"> Bug fixes </h4>

<ul>
<li>Fixed a bug where a <code>404</code> error would display when navigating from certain pages to the <b>Clusters</b> page.</li>
<li>Removed an unnecessary warning that could appear when downloading CA certificates for CockroachDB {{ site.data.products.serverless }} clusters.</li>
</ul>

<h3>March 31, 2023</h3>

<h4 id="2023-03-31-security-changes"> Security updates </h4>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/private-clusters">Private Clusters</a> are now generally available for CockroachDB {{ site.data.products.dedicated }}. A private cluster's nodes have no public IP addresses.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/cmek">Customer-Managed Encryption Keys (CMEK)</a> is now generally available for CockroachDB {{ site.data.products.dedicated }} private clusters. CMEK allows you to protect data at rest in a CockroachDB {{ site.data.products.dedicated }} cluster using a cryptographic key that is entirely within your control, hosted in a supported cloud provider key-management system (KMS).</li>
</ul>

<h3>March 06, 2023</h3>

<h4 id="2023-03-06-security-changes"> Security updates </h4>

<ul>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page"><b>Migrations</b> page</a> is now limited to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-admin">Organization Admins</a>.</li>
</ul>

<h3>February 9, 2023</h3>

<h4 id="2023-02-09-general-changes"> General changes </h4>

<ul>
<li>For CockroachDB {{ site.data.products.dedicated }} clusters, the ability to add and remove regions through the CockroachDB {{ site.data.products.cloud }} Console has been temporarily disabled. If you need to add or remove regions from a cluster, <a href="https://support.cockroachlabs.com/">contact Support</a>.</li>
</ul>

<h3>February 6, 2023</h3>

<h4 id="2023-02-06-general-changes"> General changes </h4>

<ul>
<li>The following features are now available for CockroachDB {{ site.data.products.serverless }} clusters running CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v22.2">v22.2.0</a> or later:
  <ul>
  <li><a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cancel-query#considerations">Query cancellation</a> using the PostgreSQL wire protocol (pgwire).</li>
  <li><a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/explain-analyze"><code>EXPLAIN ANALYZE</code></a> now gives an estimate of the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster-basic#request-units">Request Units (RUs)</a> a query consumes, for {{ site.data.products.basic }} clusters.</li>
  <li>All CockroachDB {{ site.data.products.serverless }} users can now use cloud storage for <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/import-into"><code>IMPORT</code></a>, <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup"><code>BACKUP</code></a>, and <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/change-data-capture-overview">change data capture (CDC)</a> without entering billing information.</li>
  <li><code>SHOW RANGES</code> is now supported on CockroachDB {{ site.data.products.serverless }}.</li>
  <li>The <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/configure-replication-zones#gc-ttlseconds">GC TTL</a> for deleted values is lowered from 24 hours to 1 hour and 15 minutes.</li>
  </ul></li>
</ul>

<h4 id="2023-02-06-console-changes"> Console changes </h4>

<ul>
<li>CockroachDB {{ site.data.products.basic }} clusters' regions are now displayed on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/overview-page"><b>Overview</b> page</a> and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/basic-cluster-management#view-clusters-page"><b>Clusters</b> page</a>.</li>
<li>The links in the sidebar navigation of the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/overview-page"><b>Cluster Overview</b></a> page have been reorganized into sections under relevant headers.</li>
<li>For CockroachDB {{ site.data.products.dedicated }} clusters, the <b>Monitoring</b> page is now called the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/tools-page"><b>Tools</b> page</a> and is located in the <b>Monitoring</b> section of the sidebar.</li>
</ul>

<h4 id="2023-02-06-api-changes"> Cloud API changes </h4>

<ul>
<li>Support for <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cmek">Customer-Managed Encryption Keys (CMEK)</a> has been added to the <a href="https://registry.terraform.io/providers/cockroachdb/cockroach/latest">CockroachDB {{ site.data.products.cloud }} Terraform Provider</a>. Contact your Cockroach Labs account team to enroll in the CMEK preview.</li>
<li>When <a href="https://www.cockroachlabs.com/docs/cockroachcloud/provision-a-cluster-with-terraform">using Terraform to provision CockroachDB {{ site.data.products.cloud }} clusters</a>, you can now manage <a href="https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/data-sources/connection_string">database connections</a> and <a href="https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/data-sources/cluster_cert">SSL certificates</a> directly in your Terraform workflow.</li>
<li>The {{ site.data.products.cloud }} API now provides <a href="https://www.cockroachlabs.com/docs/api/cloud/v1.html#get-/api/v1/clusters/-cluster_id-/connection-string">formatted connection string information</a>.</li>
</ul>

<h4 id="2023-02-06-security-changes"> Security updates </h4>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} is now <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/security-reference/security-overview">compliant with the Payment Card Industry Data Security {{ site.data.products.standard }} (PCI DSS)</a>. To learn more about achieving PCI DSS compliance with CockroachDB {{ site.data.products.dedicated }}, contact your Cockroach Labs account team.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-sso#cloud-organization-sso">{{ site.data.products.cloud }} Organization Single Sign-On (SSO)</a> is now available to all CockroachDB {{ site.data.products.cloud }} users.</li>
<li>For CockroachDB {{ site.data.products.cloud }} organizations enrolled in the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cmek">Customer-managed Encryption Key (CMEK)</a> preview, note that the following conditions must now be met before enabling CMEK for a CockroachDB {{ site.data.products.dedicated }} cluster:
    <ul>
    <li>The cluster must be running CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v22.2">v22.2.0</a> or later.</li>
    <li>The cluster must have been created as a <a href="https://www.cockroachlabs.com/docs/cockroachcloud/private-clusters">private cluster</a>. To create a private cluster, your organization  must be enrolled in the private cluster preview, which is separate from the CMEK preview. Contact your Cockroach Labs account team to enroll in both previews.</li>
    </ul></li>
<li>For CockroachDB {{ site.data.products.cloud }} organizations enrolled in the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/egress-perimeter-controls">Egress Perimeter Controls</a> preview, note that CockroachDB {{ site.data.products.dedicated }} clusters must have been created as <a href="https://www.cockroachlabs.com/docs/cockroachcloud/private-clusters">private clusters</a> in order to enable Egress Perimeter Controls. To create a private cluster, your organization  must be enrolled in the private cluster preview, which is separate from the Egress Perimeter Controls preview. Contact your Cockroach Labs account team to enroll in both previews.</li>
</ul>

<h4 id="2023-02-06-bug-fixes"> Bug fixes </h4>

<ul>
<li>Fixed a bug where users granted the Developer role in a CockroachDB {{ site.data.products.cloud }} organization incorrectly had certain permissions for any cluster in the organization. Refer to <a href="https://www.cockroachlabs.com/docs/advisories/c20230118">this technical advisory</a> for more information.</li>
</ul>

<h3>February 2, 2023</h3>

<h4 id="2023-02-02-general-changes"> General changes </h4>

<ul>
<li>CockroachDB {{ site.data.products.serverless }} users can now access <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage">cloud storage</a> without entering billing information.</li>
</ul>

<h3>January 9, 2023</h3>

<h4 id="2023-01-09-console-changes"> Console changes </h4>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} clusters running CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v22.1#v22-1-8">v22.1.8</a> or later now have a separate tab for incomplete backup jobs on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups"><b>Backups</b> page</a>.</li>
</ul>

<h4 id="2023-01-09-api-changes"> Cloud API changes </h4>

<ul>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api">create cluster</a> request now exposes the <code>restrict-egress-traffic</code> boolean field to allow dedicated clusters to be created with a <a href="https://www.cockroachlabs.com/docs/cockroachcloud/egress-perimeter-controls#use-a-deny-by-default-egress-traffic-policy">deny-by-default egress traffic policy</a>. This field and the broader egress perimeter controls capability can be used only with <a href="https://www.cockroachlabs.com/docs/cockroachcloud/private-clusters">private dedicated clusters</a>, which require the <code>network-visibility</code> field to be set to <code>NETWORK_VISIBILITY_PRIVATE</code>.</li>
</ul>

<h4 id="2023-01-09-bug-fixes"> Bug fixes </h4>

<ul>
<li>Fixed a bug for CockroachDB {{ site.data.products.dedicated }} clusters where the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics-advanced"><b>Datadog setup</b></a> dialog was not rendering properly.</li>
</ul>

<h3>December 5, 2022</h3>

<h4 id="2022-02-05-console-changes"> Console changes </h4>

<ul>
<li>CockroachDB {{ site.data.products.serverless }} clusters now have a <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-custom-chart-debug-page"><b>Metrics</b> page</a> in the Console with charts to <b>Monitor SQL Activity</b> and <b>Identify SQL Problems</b>.</li>
<li>The <code>p99.9</code> and <code>p99.99</code> latencies are now shown in the <code>SQL Connection Latency</code> and <code>SQL Statement Latency</code> charts on the <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-custom-chart-debug-page"><b>Metrics</b> page</a> for CockroachDB {{ site.data.products.serverless }} clusters.</li>
<li>The <b>Last used</b> column on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/databases-page"><b>Table Details</b> page</a> now uses the UTC timezone.</li>
<li>The CockroachDB {{ site.data.products.serverless }} <a href="https://www.cockroachlabs.com/docs/cockroachcloud/basic-cluster-management#estimate-usage-cost"><b>Cost estimator</b></a> has been temporarily disabled while a bug is being fixed.</li>
</ul>

<h4 id="2022-12-05-api-changes"> Cloud API changes </h4>

<ul>
<li>A preview of <a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-logs">log export</a> for CockroachDB {{ site.data.products.dedicated }} users is now available. To enroll your organization in the preview, contact your Cockroach Labs account team.</li>
</ul>

<h4 id="2022-12-05-bug-fixes"> Bug fixes </h4>

<ul>
<li>Trial coupon limits for CockroachDB {{ site.data.products.dedicated }} clusters' storage and compute are now enforced in the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management"><b>Edit cluster</b></a> dialog.</li>
<li>Fixed a bug where <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups">backups</a> shown for a particular day included backups for midnight on the following day.</li>
<li>Fixed a bug  on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/databases-page"><b>Databases page</b></a> where the number of index recommendations displayed for a database was inconsistent with the actual number of index recommendations for the database.</li>
<li>Fixed a bug that could break the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/databases-page"><b>Databases page</b></a> when fetching index usage statistics for databases.</li>
</ul>

<h3>November 7, 2022</h3>

<h4 id="2022-11-07-general-changes"> General changes </h4>

<ul>
<li>The following new regions are now available for all CockroachDB {{ site.data.products.dedicated }} clusters:

    <table>
    <tr>
    <th>GCP</th>
    <th>AWS</th>
    </tr>
    <tr>
    <td>Frankfurt, Germany (<code>europe-west3</code>)</td>
    <td>Osaka, Japan (<code>ap-northeast-3</code>)</td>
    </tr>
    <tr>
    <td></td>
    <td>Montréal, Québec (<code>ca-central-1</code>)</td>
    </tr>
    <tr>
    <td></td>
    <td>Stockholm, Sweden (<code>eu-north-1</code>)</td>
    </tr>
    </table></li>
</ul>

<h4 id="2022-11-07-console-changes"> Console changes </h4>

<ul>
<li>Added an icon next to a cluster's name on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/billing-management"><b>Billing overview</b></a> page to indicate when a cluster has been deleted.</li>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/databases-page"><b>Database page</b></a> in the CockroachDB {{ site.data.products.cloud }} Console now shows the last time table statistics were updated.</li>
</ul>

<h4 id="2022-11-07-api-changes"> Cloud API changes </h4>

<ul>
<li>The <a href="https://www.cockroachlabs.com/docs/api/cloud/v1">{{ site.data.products.cloud }} API</a> documentation now indicates which endpoints are in preview.</li>
</ul>

<h4 id="2022-11-07-bug-fixes"> Bug fixes </h4>

<ul>
<li>The <b>Sessions</b> link on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/overview-page"><b>Overview</b></a> page now redirects to the correct tab on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/sessions-page"><b>SQL Activity</b></a> page.</li>
<li>Fixed a bug where stale data caused <b>Connect</b> modal errors immediately after creating a CockroachDB {{ site.data.products.serverless }} cluster.</li>
<li>Fixed a bug where backup metadata payloads were limited to 4MiB instead of the desired 32MiB.</li>
<li>Fixed a bug where the node-aggregated low disk alert was not firing.</li>
</ul>

<h3>October 3, 2022</h3>

<h4 id="2022-10-03-bug-fixes"> Bug fixes </h4>

<ul>
<li>The CockroachDB {{ site.data.products.cloud }} Console now utilizes the same <a href="https://www.cockroachlabs.com/docs/stable/cluster-settings">cluster setting</a> as the DB Console, <code>sql.index_recommendation.drop_unused_duration</code>, as a threshold value for dropping unused indexes.</li>
<li>Fixed a bug where <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#aws-privatelink">AWS PrivateLink</a> endpoints could fail to create but display an error message that said they were still creating.</li>
</ul>

<h3>September 24, 2022</h3>

<h4 id="2022-09-24-console-changes">Console changes</h3>

<ul>
<li>You can now create a database directly from the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/databases-page"><b>Databases</b> page</a> of the CockroachDB {{ site.data.products.cloud }} Console.</li>
</ul>

<h3>September 16, 2022</h3>

<h4 id="2022-09-16-console-changes">Console changes</h3>

<ul>
<li>A tool to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/basic-cluster-management">estimate your monthly cost</a> based on your workload is now available for CockroachDB {{ site.data.products.serverless }} clusters.</li>
</ul>

<h3>September 8, 2022</h3>

<h4 id="2022-09-08-console-changes"> Console changes </h4>

<ul>
<li>Previously, when trying to remove a region from a three-region cluster, only the second and third regions were removable. Two regions must be removed at once because a two-region cluster is not a valid configuration, but users can now select any two regions to remove.</li>
<li>The character limit for cluster names was raised from 20 to 40 characters.</li>
</ul>

<h4 id="2022-09-08-api-changes"> Cloud API changes </h4>

<ul>
<li>Added the ability to create, edit, and delete a database through the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api">{{ site.data.products.cloud }} API</a>.</li>
</ul>

<h4 id="2022-09-08-bug-fixes"> Bug fixes </h4>

<ul>
<li>In the CockroachDB {{ site.data.products.serverless }} connection dialog, the inline password input has been given a placeholder value to prevent it from interacting in unexpected ways with password managers.</li>
</ul>

<h3>August 8, 2022</h3>

<h4 id="2022-08-08-console-changes">Console changes</h3>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} users can now choose any of the available hardware options when <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">configuring a cluster</a>. Previously, there were restrictions based on which storage and compute combinations were recommended for best performance.</li>
<li>In the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster"><b>Connect to your cluster</b></a> dialog, your previous SQL user, database, and connection method selections are now cached to make it easier to re-connect to your cluster.</li>
</ul>

<h4 id="2022-08-08-bug-fixes">Bug fixes</h3>

<ul>
<li>Fixed a bug where the <b>SQL Activity</b> tab for clusters running different CockroachDB versions did not always load version-appropriate UI components.</li>
<li>Fixed a bug where the <b>Statements</b> table on a transaction's <a href="https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page"><b>Transaction Details</b> page</a> sometimes showed an incorrect number of statements.</li>
</ul>

<h3>July 28, 2022</h3>

<h4 id="2022-07-28-general-changes">General changes</h3>

<ul>
<li>All of your organization's <a href="https://www.cockroachlabs.com/docs/cockroachcloud/billing-management#view-invoices">invoices</a> are now available on the <b>Billing</b> page.</li>
</ul>

<h3>July 27, 2022</h3>

<h4 id="2022-07-27-console-changes">General changes</h3>

<ul>
<li>You can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management">add and remove regions</a> from CockroachDB {{ site.data.products.dedicated }} clusters through the CockroachDB {{ site.data.products.cloud }} Console. This change makes it easier to support users in new locations or scale down your cluster.</li>
</ul>

<h3>July 6, 2022</h3>

<h4 id="2022-07-06-console-changes">Console changes</h3>

<ul>
<li>The <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/connect-to-the-database"><b>Connect to your cluster</b></a> dialog now includes code snippets for <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/third-party-database-tools">supported languages and tools</a>.</li>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-a-basic-cluster"><b>Connect to your cluster</b></a> dialog for clusters running CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v22.1">v22.1</a> now loads more quickly.</li>
<li>If users log in using an <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-sso">SSO</a> method other than the one they have used previously, they will now be asked if they want to switch to the new login method.</li>
<li>Previously, CockroachDB {{ site.data.products.dedicated }} users could only choose storage amounts within the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster">recommendations</a> for the selected machine size. Now, a warning message will appear if the storage is outside the recommended range, but any storage option can be selected.</li>
<li>The date and time selection on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/statements-page"><b>Statements</b></a> and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page"><b>Transactions</b></a> pages now defaults to UTC and has an improved design.</li>
</ul>

<h4 id="2022-07-06-bug-fixes">Bug fixes</h3>

<ul>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/statements-page"><b>Statements</b> page</a> no longer crashes when a search term contains <code>*</code>.</li>
</ul>

<h3>June 6, 2022</h3>

<h4 id="2022-06-06-general-changes">General changes</h3>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics-advanced">Datadog integration</a> is now available on the <b>Monitoring</b> page for all CockroachDB {{ site.data.products.dedicated }} users.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-sso">{{ site.data.products.cloud }} Organization Single Sign-On (SSO)</a> for CockroachDB {{ site.data.products.cloud }} is now available with Google and Microsoft in addition to GitHub.</li>
</ul>

<h4 id="2022-06-06-console-changes">Console changes</h3>

<ul>
<li>When creating a <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#create-a-sql-user">SQL user</a> or <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#change-a-sql-users-password">changing a SQL user's password</a>, the generated password is now hidden until the user clicks <b>Reveal password</b>.</li>
</ul>

<h4 id="2022-06-06-api-changes">Cloud API changes</h3>

<ul>
<li>Paginated <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api">API</a> endpoints now accept a single <code>page</code> parameter for next or previous pages. Pagination response messages now contain only two fields: <code>next_page</code> and <code>previous_page</code>, whose values can be used for the <code>page</code> field in a followup call.</li>
</ul>

<h3>May 5, 2022</h3>

<h4 id="2022-05-05-console-changes">Console changes</h3>

<ul>
<li>All organizations can now create <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#manage-service-accounts">service accounts</a> and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#api-access">API keys</a>, and have access to the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api">{{ site.data.products.cloud }} API</a>.</li>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/ccloud-get-started"><code>ccloud</code> command line tool</a> for creating, managing, and connecting to CockroachDB {{ site.data.products.cloud }} clusters is now in public beta.</li>
</ul>

<h3>May 2, 2022</h3>

<h4 id="2022-05-02-console-changes">Console changes</h3>

<ul>
<li>Added <b>Distributed execution</b> and <b>Vectorized execution</b> information to the <b>Overview</b> tab of the <b>Statement Details</b> page.</li>
<li>Added <code>FULL SCAN</code> information to the <b>Explain plan</b> tab of the <b>Statement Details</b> page.</li>
<li>Users without accounts can now accept invitations by creating a user using SSO-based authorization such as GitHub.</li>
<li>Timeseries charts are now displayed in UTC.</li>
</ul>

<h4 id="2022-05-02-bug-fixes">Bug fixes</h3>

<ul>
<li>Fixed broken links to the <b>Statement Details</b> page from the <b>{{ site.data.products.advanced }} Debug</b> and <b>Sessions</b> pages.</li>
<li>Fixed a bug where regenerating a SQL user password would fail with a duplicate user warning.</li>
<li>Deleted clusters will no longer be visible after they've been deleted. Previously, a full page refresh was needed to update the <b>Clusters</b> page.</li>
<li>Fixed a bug that caused charges on the <b>Cluster overview</b> page to show an error state for users with the Developer role. Cluster charges are now hidden for Developers and only available to users with the Admin role.</li>
<li>Fixed a bug where adding decimals to a CockroachDB {{ site.data.products.serverless }} cluster's spend limit would cause an error, but the spend limit could still be set.</li>
<li>Fixed a bug where opening or closing the list of nodes on a multi-node CockroachDB {{ site.data.products.dedicated }} cluster's <b>Cluster overview</b> page would result in a duplicated row of nodes.</li>
<li>Fixed a bug for credit card users where the credit card form was occasionally loading as a blank box. Now, the credit card form will always load properly without needing to refresh the page.</li>
</ul>


<h3>April 27, 2022</h3>

<h4 id="2022-04-27-general-changes">General changes</h3>

<ul>
<li>CockroachDB {{ site.data.products.dedicated }} contract customers can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/advanced-cluster-management">scale clusters</a> through the Console.</li>
</ul>

<h4 id="2022-04-27-console-changes">Console changes</h3>

<ul>
<li>Contract customers can now view information about their organization's credit grants on the <b>Overview</b> tab of the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/billing-management"><b>Billing</b> page</a>.</li>
</ul>

<h3>April 20, 2022</h3>

<h4 id="2022-04-20-console-changes">Console changes</h3>

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#change-a-sql-users-password">SQL user passwords</a> are now generated and saved automatically to simplify the connection experience.</li>
<li>When <a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster">connecting to your cluster</a>, the CA certificate download is now hidden once you have already downloaded the certificate.</li>
</ul>

<h4 id="2022-04-20-doc-changes">Documentation changes</h3>

<ul>
<li>Improved CockroachDB {{ site.data.products.serverless }} <a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster">cluster connection</a> documentation, including a <a href="https://www.cockroachlabs.com/docs/stable/connect-to-the-database">third-party tool connection guide</a>, improved <a href="https://www.cockroachlabs.com/docs/cockroachcloud/quickstart">Quickstart</a>, and CRUD app examples.</li>
</ul>

<h3>April 4, 2022</h3>

<h4 id="2022-04-04-console-changes">Console changes</h3>

<ul>
<li>You no longer need to download a CA certificate to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-a-basic-cluster">connect to a CockroachDB {{ site.data.products.serverless }}</a> cluster through the CockroachDB SQL client if your cluster is running <a href="https://www.cockroachlabs.com/docs/releases/v21.2">v21.2.5</a> or later.</li>
<li>When <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">creating a CockroachDB {{ site.data.products.dedicated }} cluster</a>, the approximate monthly cost is now displayed in the <b>Summary</b> sidebar along with the hourly cost.</li>
</ul>

<h3>March 7, 2022</h3>

<h4 id="2022-03-07-console-changes">Console changes</h3>

<ul>
<li>CockroachDB {{ site.data.products.cloud }} clusters now have a <b>Databases</b> page in the Console, which shows your databases, tables, indexes, and grants.</li>
<li>When creating or editing a SQL user, passwords are now generated and saved automatically when users click the <b>Generate and save password</b> button. Previously, users had to enter passwords manually and remember to save them.</li>
<li>CockroachDB {{ site.data.products.dedicated }} users can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups">restore</a> databases configured for multiple regions.</li>
</ul>

<h3>February 10, 2022</h3>

<h4 id="2022-02-10-general-changes">General changes</h3>

<ul>
<li>New CockroachDB {{ site.data.products.dedicated }} clusters can now be <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">created with custom hardware options</a>. Previously, there were four hardware options, and compute and storage were linked.</li>
<li>CockroachDB {{ site.data.products.dedicated }} users can now scale a cluster's <a href="https://www.cockroachlabs.com/docs/cockroachcloud/advanced-cluster-management">compute</a> and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/advanced-cluster-management">storage</a>. Previously, the only way to scale up a CockroachDB {{ site.data.products.dedicated }} cluster was by adding more nodes.</li>
</ul>

<h4 id="2022-02-10-console-changes">Console changes</h3>

<ul>
<li>There is now a <b>Hardware</b> column on the <b>Clusters</b> page that shows the hardware configuration for CockroachDB {{ site.data.products.dedicated }} clusters.</li>
</ul>

<h3>February 7, 2022</h3>

<h4 id="2022-02-07-general-changes">General changes</h3>

<ul>
<li>Six new regions are available for CockroachDB {{ site.data.products.serverless }} clusters:

    <table>
    <tr>
    <th>GCP</th>
    <th>AWS</th>
    </tr>
    <tr>
    <td>California (<code>us-west2</code>)</td>
    <td>Mumbai (<code>ap-south-1</code>)</td>
    </tr>
    <tr>
    <td>Sao Paulo (<code>southamerica-east1</code>)</td>
    <td>Frankfurt (<code>eu-central-1</code>)</td>
    </tr>
    <tr>
    <td>South Carolina (<code>us-east1</code>)</td>
    <td>N. Virginia (<code>us-east-1</code>)</td>
    </tr>
    </table></li>
</ul>

<h4 id="2022-02-07-console-changes">Console changes</h3>

<ul>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/sessions-page#sessions-table"><b>Terminate Session</b> and <b>Terminate Statement</b></a> options are now enabled for CockroachDB {{ site.data.products.cloud }} clusters running CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v21.2#v21-2-2">v21.2.2</a> or later.</li>
<li>Selecting a transaction from the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page"><b>Transactions</b> page</a> now opens a new <a href="https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page#transaction-details-page"><b>Transaction Details</b></a> page with an improved design.</li>
<li>The order of the tabs on the <b>SQL Activity</b> page has been changed to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/statements-page"><b>Statements</b></a>, <a href="https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page"><b>Transactions</b></a>, and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/sessions-page"><b>Sessions</b></a>.</li>
</ul>

<h4 id="2022-02-07-bug-fixes">Bug fixes</h3>

<ul>
<li>Fixed a number of broken links throughout the CockroachDB {{ site.data.products.cloud }} Console.</li>
<li>Fixed a bug where CockroachDB {{ site.data.products.serverless }} users were seeing occasional dips and spikes in a cluster's <a href="https://www.cockroachlabs.com/docs/cockroachcloud/overview-page"><b>Request Units</b></a> usage graph while running a steady workload.</li>
</ul>

<h3>January 10, 2022</h3>

<h4 id="2022-01-10-general-changes">General changes</h3>

<ul>
<li>New CockroachDB {{ site.data.products.dedicated }} clusters will now run <a href="https://www.cockroachlabs.com/docs/releases/v21.2#v21-2-3">v21.2.3</a>.</li>
<li>CockroachDB {{ site.data.products.serverless }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v21.2#v21-2-0-beta-4">v21.2.0-beta.4</a>.</li>
<li>The CockroachDB documentation navigation is now organized by user task instead of by product for CockroachDB {{ site.data.products.serverless }}, CockroachDB {{ site.data.products.dedicated }}, and CockroachDB {{ site.data.products.core }} v21.2. Topics specific to {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} clusters are within the new top-level user task categories. CockroachDB {{ site.data.products.cloud }} release notes are under Reference.</li>
</ul>

<h4 id="2022-01-10-console-changes">Console changes</h3>

<ul>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/billing-management"><b>Billing</b></a> page is now separated into two tabs, <b>Overview</b> and <b>Payment Details</b>.</li>
</ul>

<h3>December 6, 2021</h3>

<h4 id="2021-12-06-general-changes">General changes</h3>

<ul>
<li>New CockroachDB {{ site.data.products.dedicated }} clusters will now run <a href="https://www.cockroachlabs.com/docs/releases/v21.2#v21-2-1">v21.2.1</a>.</li>
<li>CockroachDB {{ site.data.products.serverless }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v21.2#v21-2-0-beta-4">v21.2.0-beta.4</a>.</li>
<li>New CockroachDB {{ site.data.products.cloud }} clusters will now have <a href="https://www.cockroachlabs.com/docs/v21.2/architecture/admission-control">Admission Control</a> enabled by default.</li>
</ul>

<h4 id="2021-12-06-console-changes">Console changes</h3>

<ul>
<li>The <b>Add/remove nodes</b> button is now disabled for custom clusters. If you are a contract customer and would like to scale your custom cluster, <a href="https://support.cockroachlabs.com/">contact Support</a>.</li>
</ul>

<h4 id="2021-12-06-bug-fixes">Bug fixes</h3>

<ul>
<li>Fixed a bug where an error was occurring on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization">VPC Peering and AWS PrivateLink</a> pages for clusters with a large number of jobs.</li>
<li>Fixed a bug where the <b>Test email alerts</b> section on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/alerts-page"><b>Alerts</b> page</a> was not visible for organizations with only custom clusters.</li>
<li>Fixed a bug where users were prompted to upgrade CockroachDB {{ site.data.products.serverless }} clusters, which are <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy">upgraded automatically</a>.</li>
<li>Previously, <a href="https://www.cockroachlabs.com/docs/cockroachcloud/overview-page">SQL metrics graphs</a> for inactive CockroachDB {{ site.data.products.serverless }} clusters showed discontinuous time series lines or an error message. Continuous graphs will now remain available for scaled-down clusters.</li>
</ul>

<h3>November 8, 2021</h3>

<h4 id="2021-11-08-general-changes">General changes</h3>

<ul>
<li><a href="https://www.cockroachlabs.com/blog/announcing-cockroachdb-serverless/">CockroachDB {{ site.data.products.serverless }}</a>, a fully-managed, auto-scaling deployment of CockroachDB, is now available. To get started with CockroachDB {{ site.data.products.serverless }} for free, see the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/quickstart">Quickstart</a>.</li>
<li>CockroachDB {{ site.data.products.cloud }} Free (beta) and CockroachDB {{ site.data.products.cloud }} are now CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}, respectively. Your ability to use your cluster will not be affected.</li>
<li>CockroachDB {{ site.data.products.serverless }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v21.2#v21-2-0-beta-4">v21.2.0-beta.4</a>.</li>
<li>New CockroachDB {{ site.data.products.dedicated }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v21.1#v21-1-11">v21.1.11</a>.</li>
</ul>

<h4 id="2021-11-08-console-changes">Console changes</h3>

<ul>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/statements-page"><b>Statements</b></a>, <a href="https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page"><b>Transactions</b></a>, and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/sessions-page"><b>Sessions</b></a> pages are now available for CockroachDB {{ site.data.products.serverless }} clusters on the <b>SQL Activity</b> page.</li>
<li>Statements and transaction statistics are now retained longer for all clusters.</li>
<li>Legends are now displayed by default for time-series graphs on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/overview-page">Cluster Overview</a> page.</li>
<li>The <b>Transaction retries</b> metric is no longer part of the <b>Current activity</b> panel on the CockroachDB {{ site.data.products.serverless }} <a href="https://www.cockroachlabs.com/docs/cockroachcloud/overview-page">Cluster Overview</a> page.</li>
<li>Deleting an organization with outstanding charges that have not been billed is now prohibited.</li>
<li>There is now a more clear error message for users attempting to log into CockroachDB {{ site.data.products.cloud }} using GitHub when they have email and password authentication configured.</li>
<li>Average RU usage is now shown in the <b>Request Units</b> chart for the CockroachDB {{ site.data.products.serverless }} <a href="https://www.cockroachlabs.com/docs/cockroachcloud/overview-page">Cluster Overview</a> page.</li>
<li>The PowerShell command to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster?filters=windows#connect-to-your-cluster">download the CockroachDB binary</a> is now improved for Windows users.</li>
<li>When under 1 GiB of storage has been used, storage is now shown in MiB instead of GiB in the <b>Storage used</b> graph on the CockroachDB {{ site.data.products.serverless }} <a href="https://www.cockroachlabs.com/docs/cockroachcloud/overview-page">Cluster Overview</a> page.</li>
<li>A more descriptive error message is now displayed when attempting to create or edit a <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#manage-sql-users-on-a-cluster">SQL user</a> with an invalid username.</li>
<li>Previously, clicking <b>cancel</b> while editing a cluster would take users back to the <b>Clusters</b> page. Now, users are taken back to the cluster's <b>Overview</b> page.</li>
</ul>

<h4 id="2021-11-08-bug-fixes">Bug fixes</h3>

<ul>
<li>Fixed a bug where, if a user had reached the maximum number of CockroachDB {{ site.data.products.serverless }} clusters and refreshed the <b>Create your cluster</b> page, the CockroachDB {{ site.data.products.serverless }} plan was auto-selected even though it is disabled.</li>
<li>Fixed a bug where clicking <b>Cancel</b> while logging in with GitHub would report and internal error.</li>
<li>Fixed a bug where organization deletion was temporarily broken.</li>
<li>Fixed a bug that was preventing the <b>Request Units</b> and <b>SQL Statements</b> graphs on the CockroachDB {{ site.data.products.serverless }} <a href="https://www.cockroachlabs.com/docs/cockroachcloud/overview-page">Cluster Overview</a> page from updating after a certain amount of time.</li>
</ul>

<h3>October 4, 2021</h3>

<h4 id="2021-10-04-general-changes">General changes</h3>

<ul>
<li>New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v21.1#v21-1-9">v21.1.9</a>.</li>
</ul>

<h4 id="2021-10-04-bug-fixes">Bug fixes</h3>

<ul>
<li>Fixed an error in the connection string for Windows users <a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-a-basic-cluster">connecting to CockroachDB {{ site.data.products.cloud }} Free (beta)</a> clusters.</li>
</ul>

<h3>Miscellaneous changes</h3>

<ul>
<li>Cluster names are now included in cluster creation email alerts.</li>
</ul>

<h3>September 7, 2021</h3>

<h4 id="2021-09-07-general-changes">General changes</h3>

<ul>
<li>New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v21.1#v21-1-7">v21.1.7</a>.</li>
</ul>

<h4 id="2021-09-07-general-changes">Console changes</h3>

<ul>
<li>All pages shown to logged out users are now optimized for mobile devices.</li>

<li>Improved the error message when an <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#aws-privatelink">AWS PrivateLink</a> endpoint request fails.</li>
</ul>

<h4 id="2021-09-07-general-changes">Bug fixes</h3>

<ul>
<li>Fixed tooltip behavior on <b>Sessions</b>, <b>Statements</b>, and <b>Transactions</b> pages.</li>

<li>Fixed a bug where clicking on the label of the <a href="https://www.cockroachlabs.com/cloud-terms-and-conditions/">Terms of Service</a> checkbox would select the Terms of Service checkbox when signing up with GitHub.</li>
</ul>

<h3>August 9, 2021</h3>

<h4 id="2021-08-09-general-changes">General changes</h3>

<ul>
<li>New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v21.1#v21-1-6">v21.1.6</a>.</li>
<li>CockroachDB {{ site.data.products.cloud }} Free (beta) users can now perform <a href="https://www.cockroachlabs.com/docs/cockroachcloud/take-and-restore-self-managed-backups">backups</a> (<code>IMPORT</code>, <code>BACKUP</code>, <code>RESTORE</code> and CDC) with <code>userfile</code> storage.</li>
</ul>

<h4 id="2021-08-09-console-changes">Console changes</h3>

<ul>
<li>Improved user experience on the Cluster Overview page for a deleted cluster.</li>
<li>Improved error message for cluster upgrade failures.</li>
<li>SQL-related restore errors are now shown in the Console, allowing users to take action.</li>
</ul>

<h4 id="2021-08-09-security-changes">Security changes</h3>

<ul>
<li>Password reset tokens will now expire after 24 hours.</li>
<li>Email change tokens are now single use and will expire.</li>
<li>Email change links are now revoked during certain user events such as password resets.</li>
<li>Resetting the password of a SQL user no longer grants that user the admin SQL role.</li>
</ul>

<h3>June 7, 2021</h3>

<h4 id="2021-07-07-general-changes">General changes</h3>

<ul>
<li>New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v21.1#v21-1-1">v21.1.1</a>.</li>
</ul>

<h4 id="2021-07-07-console-changes">Console changes</h3>

<ul>
<li>All CockroachDB {{ site.data.products.cloud }} {{ site.data.products.dedicated }} users now have access to the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/statements-page"><b>Statements</b></a> and <a href="https://www.cockroachlabs.com/docs/cockroachcloud/sessions-page"><b>Sessions</b></a> pages in the Console.</li>
<li>All CockroachDB {{ site.data.products.cloud }} {{ site.data.products.dedicated }} users now have access to the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/alerts-page"><b>Alerts</b></a> page in the Console, which allows you to toggle alerts, send test alerts, and manage alert recipients for your Organization.</li>
<li>Previously, users were getting stuck during the verification step of creating an <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#aws-privatelink">AWS PrivateLink</a> endpoint. Now, users can enter the verification step of the <b>Add Endpoint Connection</b> dialog with an incomplete connection endpoint ID preset.</li>
<li>Added a <b>Cloud</b> column to the <b>Clusters</b> page so users can see which cloud provider any cluster is using without having to click through to the <b>Cluster Overview</b> page.</li>
<li>The maximum number of nodes in a cluster created through the Console was raised to 50 nodes per region and 150 nodes per cluster.</li>
</ul>

<h4 id="2021-07-07-bug-fixes">Bug fixes</h3>

<ul>
<li>Fixed a bug where clicking the <b>Logout</b> button would trigger an error and display a blank page.</li>
<li>The page will no longer refresh after switching the authentication method through the <b>Account</b> page.</li>
<li>Switching organizations will no longer log you out of all sessions.</li>
</ul>

<h3>July 6, 2021</h3>

<h4 id="2021-07-06-general-changes">General changes</h3>

<ul>
<li>New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v21.1#v21-1-5">v21.1.5</a>.</li>
<li>Starting this month, paid CockroachDB {{ site.data.products.cloud }} clusters will be billed monthly instead of every two weeks.</li>
</ul>

<h4 id="2021-07-06-console-changes">Console changes</h3>

<ul>
<li>Multi-region clusters can now be created through the Console. To learn more about creating a multi-region cluster, see <a href="https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster">Planning your cluster</a>.</li>
<li>The <b>Connect</b> modal now has updated commands to make <a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-a-basic-cluster">connecting to your cluster</a> a smoother experience on Mac, Linux, and Windows.</li>
<li>All CockroachDB {{ site.data.products.cloud }} users now have access to the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page"><b>Transactions</b> page</a> in the Console.</li>
<li>Navigation on the <b>Clusters</b> page is now a vertical sidebar instead of horizontal tabs.</li>
<li>Added a tooltip to the <b>Upgrade</b> option in the <b>Action</b> Menu, which gives users more version-specific context.</li>
<li>Users can now <b>Clear SQL Stats</b> from the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/statements-page"><b>Statements</b> page</a> for clusters running <a href="https://www.cockroachlabs.com/docs/releases/v21.1#v21-1-3">v21.1.3</a> or later.</li>
</ul>

<h4 id="2021-07-06-bug-fixes">Bug fixes</h3>

<ul>
<li>Fixed a bug where clicking on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/alerts-page"><b>Alerts</b> page</a> broke the Organization header for users with multiple Organizations.</li>
<li>Fixed a bug where nodes were cycling in clusters running <a href="https://www.cockroachlabs.com/docs/releases/v21.1#v21-1-4">v21.1.4</a>.</li>
<li>Fixed several broken links to documentation throughout the Console.</li>
<li>Users will no longer see alerts for clusters that are not in a <b>ready</b> state.</li>
<li>Fixed a bug that was causing users to receive false positive CPU alerts.</li>
</ul>

<h3>May 3, 2021</h3>

<h4 id="2021-05-01-general-changes">General changes</h3>

<ul>
<li>New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v20.2#v20-2-8">v20.2.8</a>.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/quickstart">CockroachDB {{ site.data.products.cloud }} Free</a> clusters are now available in four additional regions:
    <ul>
    <li>GCP: <code>europe-west1</code>, <code>asia-southeast1</code></li>
    <li>AWS: <code>eu-west-1</code>, <code>ap-southeast-1</code></li>
    </ul></li>
</ul>

<h4 id="2021-05-01-console-changes">Console changes</h3>

<ul>
<li>New users can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-an-account">sign up</a> for CockroachDB {{ site.data.products.cloud }} with Github Authorization. Logging in with GitHub allows users to enforce <a href="https://docs.github.com/github/authenticating-to-github/securing-your-account-with-two-factor-authentication-2fa">GitHub's two-factor authentication (2FA)</a> on their CockroachDB {{ site.data.products.cloud }} account. Current users can <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-an-account#change-your-login-method">switch their login method</a> between email and GitHub.</li>
<li>When logging in fails due to user input, the error message now includes <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-an-account#change-your-login-method">login method</a> as a potential reason for failure.</li>
<li>Previously, selecting a new cloud provider while <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">creating a cluster</a> would reset the <b>Region</b> and <b>Hardware per node</b> options to default. Now, equivalent region and hardware options are preselected, and the number of nodes per region is preserved when a new cloud provider is selected.</li>
</ul>

<h4 id="2021-05-01-bug-fixes">Bug fixes</h3>

<ul>
<li><b>Contact Us</b> links now direct users to the <a href="https://support.cockroachlabs.com/">customer support portal</a> instead of the user's mail app.</li>
</ul>

<h3>April 5, 2021</h3>

<h4 id="2021-04-05-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v20.2#v20-2-7">v20.2.7</a>.

<h4 id="2021-04-05-console-changes">Console changes</h3>

<ul>
<li>The <a href="https://cockroachlabs.cloud/login">login form</a> no longer focuses on the email field on page load. This change makes the form more flexible once other authentication methods are available.</li>
<li>Extraneous information is no longer displayed in the error for failed <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#vpc-peering">GCP peering</a> attempts.</li>
<li>Added a resource panel to the <a href="https://cockroachlabs.cloud">CockroachDB {{ site.data.products.cloud }} Console</a>, which can be accessed by clicking the <b>?</b> icon in the top right corner of the Console. Included in the resource panel are links to relevant documentation, Cockroach University, the CockroachDB Slack community, and much more.</li>
<li>Created a new <a href="https://status.cockroachlabs.cloud">Status Page</a> that displays the current service status and incident communication of the <a href="https://cockroachlabs.cloud">CockroachDB {{ site.data.products.cloud }} Console</a>, AWS services, and GCP services.</li>
</ul>

<h4 id="2021-04-05-bug-fixes">Bug fixes</h3>

<ul>
<li>The region shown in the <a href="https://cockroachlabs.cloud">CockroachDB {{ site.data.products.cloud }} Console</a> for free-tier clusters is now correct. Previously, the Console showed the wrong region when creating an AWS free-tier cluster.</li>
<li>Fixed a bug where an error occurred when displaying the <b>Connect</b> modal for an old GCP cluster that does not have the custom <code>crdb</code> network. These clusters do not support VPC peering, but the lack of the <code>crdb</code> network was causing the listing of VPC peerings to fail even though no such peerings exist.</li>
</ul>

<h3>March 8, 2021</h3>

<h4 id="2021-03-08-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v20.2#v20-2-5">v20.2.5</a>.

<h4 id="2021-03-08-console-changes">Console changes</h3>

<ul>
<li>Self-service <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#aws-privatelink">AWS PrivateLink</a> is now generally available for CockroachDB {{ site.data.products.cloud }} clusters running on AWS.</li>
<li>On the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#view-clusters-page"><b>Clusters</b> page</a>, clusters that are running unsupported versions now have a warning in the <b>Version</b> column.</li>
</ul>

<h4 id="2021-03-08-security-changes">Security changes</h3>

<ul>
<li>CockroachDB {{ site.data.products.cloud }} now does not include the supplied password in error messages that arise from resetting, editing, or creating a password when the password is too short.</li>
<li>CockroachDB {{ site.data.products.cloud }} now prevents clickjacking attacks by specifying <code>X-Frame-Options: DENY</code> when serving <code>index.html</code>.</li>
</ul>

<h4 id="2021-03-08-bug-fixes">Bug fixes</h3>

<ul>
<li>Previously, users who were not a member of any organization would get an error when trying to reset their password. A user would most likely encounter this scenario if they deleted their organization, tried to log in again, and didn't remember their password. Now, an organization will be created for the user if one does not exist. The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-an-account#change-your-organization-name">organization name can be edited</a> on the <b>Settings</b> tab on the organization's landing page.</li>
</ul>


<h3>February 9, 2021</h3>

<h4 id="2021-02-09-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v20.2#v20-2-4">v20.2.4</a>.

<ul>
<li>CockroachDB {{ site.data.products.cloud }} Free is now in beta. CockroachDB {{ site.data.products.cloud }} Free (beta) delivers free CockroachDB clusters for you and your organization. It is a managed instance of CockroachDB that removes the friction of initial cluster sizing and auto-scales based on your application traffic. There is an upper limit of usage of up to 1 vCPU and 5GB storage per free cluster.

    You can submit feedback or log any bugs you find through <a href="https://forms.gle/jWNgmCFtF4y15ePw5">this survey</a>.</li>

<li>You can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups">restore databases and tables</a> from backups of CockroachDB {{ site.data.products.cloud }} clusters. This feature is only available to clusters running the paid version of CockroachDB {{ site.data.products.cloud }}.</li>
<li><a href="https://www.google.com/recaptcha/about/">reCAPTCHA</a> has been added to the sign up process for new users signing up with an email and password. Some users may need to complete an image challenge.</li>
<li>An email will now be sent to <a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-admin">Organization Admins</a> when a <a href="https://www.cockroachlabs.com/docs/cockroachcloud/quickstart-trial-cluster">30-day free trial of CockroachDB {{ site.data.products.cloud }}</a> is nearing its end and once it has expired.</li>
</ul>

<h3>January 22, 2021</h3>

<h4 id="2021-02-22-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v20.2#v20-2-3">v20.2.3</a>.

<h4 id="2021-02-22-bug-fixes">Bug fixes</h3>

<ul>
<li>Fixed a bug where deleting your only organization would prevent your email from being used for a new organization in the future.</li>
<li>Fixed a bug where <a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#vpc-peering">VPC peering</a> appeared to be available on clusters that it wasn't supported on.</li>
</ul>

<h3>December 11, 2020</h3>

<h4 id="2020-12-11-general-changes">General changes</h3>

New clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v20.2#v20-2-2">v20.2.2</a>.

<ul>
<li>CockroachDB {{ site.data.products.cloud }} is now offering <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster#step-2-select-the-cloud-provider">larger machine sizes</a> to be configured directly in the Console. You will now be able to select from four options in the create cluster workflow. The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster#step-2-select-the-cloud-provider">pricing has also been updated</a> for newly created clusters. Existing clusters are not impacted by the pricing changes.</li>
</ul>

<h3>November 19, 2020</h3>

<h4 id="2021-11-19-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB <a href="https://www.cockroachlabs.com/docs/releases/v20.2#v20-2-0">v20.2.0</a>.

<ul>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/quickstart">Create a 30-day free CockroachDB {{ site.data.products.cloud }} cluster</a>.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/advanced-cluster-management#add-or-remove-nodes-from-a-cluster">Add or remove nodes</a> through the CockroachDB {{ site.data.products.cloud }} Console.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization">Set up VPC peering</a> for clusters running on GCP.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups">View backups</a> that Cockroach Labs has taken for your CockroachDB {{ site.data.products.cloud }} cluster.</li>
</ul>

<h3>July 6, 2020</h3>

<h4 id="2020-07-06-general-changes">General changes</h3>

<ul>
<li>You can now update your email address and password in your profile.</li>
</ul>

<h4 id="2020-07-06-console-changes">Console changes</h3>
You can now <a href="https://www.cockroachlabs.com/docs/cockroachcloud/advanced-cluster-management#add-or-remove-nodes-from-a-cluster">add or remove nodes</a> from your cluster through the Console.

{{site.data.alerts.callout_info}}
At this time, you cannot use the Console to scale up a single-node cluster or scale down to a single-node cluster. For these changes, contact <a href="https://support.cockroachlabs.com">Support</a>.
{{site.data.alerts.end}}

<h3>June 11, 2020</h3>

<h4 id="2020-06-11-general-changes">General changes</h3>

<ul>
<li>You can now create a 30-day free CockroachDB {{ site.data.products.cloud }} cluster using the code <code>CRDB30</code>. The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/quickstart">Quickstart guide</a> shows you how to create and connect to your free cluster and run your first query.</li>

<li>You can now edit your name in your profile.</li>
</ul>

<h3>May 4, 2020</h3>

<h4 id="2020-05-04-general-changes">General changes</h3>

<ul>
<li>Updated the layout of the <a href="https://cockroachlabs.cloud/signup?referralId=docs_cc_release_notes" rel="noopener" target="_blank">Sign up</a> page.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-admin">CockroachDB {{ site.data.products.cloud }} Organization Admins</a> can now <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#organization">update their {{ site.data.products.cloud }} organization's name</a>.</li>
<li><a href="https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-admin">CockroachDB {{ site.data.products.cloud }} Organization Admins</a> can now <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#organization">delete their {{ site.data.products.cloud }} Organization</a>.</li>
</ul>

<h3>April 6, 2020</h3>

<h4 id="2020-04-06-general-changes">General changes</h3>

<ul>
<li>Free trials of CockroachDB {{ site.data.products.cloud }} are now available. <a href="https://www.cockroachlabs.com/contact-sales/">Contact us</a> to request a trial code.</li>
<li>CockroachDB {{ site.data.products.cloud }} now supports VPC peering for clusters running on GCP. <a href="https://support.cockroachlabs.com/hc/en-us">Contact us</a> to set up a VPC peering-enabled CockroachDB {{ site.data.products.cloud }} cluster.</li>
</ul>

<h4 id="2020-04-06-security-changes">Security changes</h3>

CockroachDB {{ site.data.products.cloud }} now requires a user to have a CockroachDB {{ site.data.products.cloud }} account before accepting an invite to join an Organization.

<ul>
<li>The hardware options displayed while <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">creating a cluster</a> have been renamed as "Option 1" and "Option 2".</li>
<li>CockroachDB {{ site.data.products.cloud }} users who are not a member of an existing Organization can now create an Organization when they log into the CockroachDB {{ site.data.products.cloud }} Console.</li>
</ul>

<h4 id="2020-04-06-doc-changes">Doc changes</h3>

<ul>
<li>Documented the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy">upgrade policy</a> for CockroachDB upgrades for CockroachDB {{ site.data.products.cloud }} clusters.</li>
</ul>

<h3>March 2, 2020</h3>

<h4 id="2020-03-02-general-changes">General changes</h3>

<ul>
<li>CockroachDB {{ site.data.products.cloud }} pricing is now available on the <a href="https://www.cockroachlabs.com/pricing/">pricing page</a>.</li>
<li>CockroachDB {{ site.data.products.cloud }} clusters running CockroachDB v19.2 have been upgraded to v19.2.4. All new clusters will now be created with CockroachDB v19.2.4.</li>
<li>CockroachDB {{ site.data.products.cloud }} now offers two options for per-node hardware configuration instead of three options. The hardware configuration <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster#step-2-select-the-cloud-provider">pricing</a> has been updated accordingly.</li>
<li>Added a <b>Sign up</b> link to the <a href="https://cockroachlabs.cloud/">CockroachDB {{ site.data.products.cloud }} <b>Log In</b> page</a>.</li>
<li>While <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster">creating a new cluster</a>, you can now type in the number of nodes you want in the cluster instead of having to click the <code>+</code> sign repeatedly.</li>
<li>The <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster"><b>Create cluster</b></a> page now displays the estimated hourly cost instead of the monthly cost.</li>
<li>Removed the cluster creation banner displayed at the top of the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#view-clusters-page"><b>Clusters page</b></a>.</li>
<li>CockroachDB {{ site.data.products.cloud }} now alphabetically sorts the nodes on a <a href="https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#view-cluster-overview"><b>Cluster Overview page</b></a>.</li>
<li>CockroachDB {{ site.data.products.cloud }} no longer displays IOPS per node on the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster"><b>Create cluster</b></a> page.</li>
<li>Billing periods are now displayed in the UTC timezone.</li>
<li>If you are the only Admin for a CockroachDB {{ site.data.products.cloud }} Organization, you can no longer change your role to Developer. Assign another user as Admin and then change your role to Developer.</li>
</ul>

<h4 id="2020-03-02-security-changes">Security changes</h3>

<ul>
<li>CockroachDB {{ site.data.products.cloud }} now requires that the password for a SQL user is at least 12 characters in length.</li>
<li>CockroachDB {{ site.data.products.cloud }} now allows you to download the cluster's CA certificate directly from the shell instead of restricting the download functionality to a web browser.</li>
</ul>

<h4 id="2020-03-02-bug-fixes">Bug fixes</h3>

<ul>
<li>Fixed a bug where all organizations with billing enabled and without a billing email address were assigned an internal Cockroach Labs email address.</li>
<li>CockroachDB {{ site.data.products.cloud }} no longer displays an error message if the internal feature flag for billing is disabled for all organizations.</li>
<li>Fixed a bug that required users to update their email address on updating their billing address.</li>
<li>Names of deleted clusters can now be reused for new clusters.</li>
</ul>

<h4 id="2020-03-02-doc-changes">Doc changes</h3>

<ul>
<li>Added language-specific connection string examples to the <a href="https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster">Connect to your cluster</a> document.</li>
<li>Added a tutorial on <a href="https://www.cockroachlabs.com/docs/cockroachcloud/stream-changefeed-to-snowflake-aws">streaming an enterprise changefeed from CockroachDB {{ site.data.products.cloud }} to Snowflake</a>.</li>
<li>Added a tutorial on <a href="https://www.cockroachlabs.com/docs/v20.1/multi-region-overview">developing and deploying a multi-region web application</a>.</li>
</ul>

</details>
<br>
{% comment %}Add new entries to the TOP of the file (not here) in reverse chronological order{% endcomment %}
