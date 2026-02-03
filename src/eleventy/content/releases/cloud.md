---
title: CockroachDB Cloud Releases
summary: Changelog for CockroachDB Cloud.
toc: true
toc_not_nested: true
docs_area: releases
---

[CockroachDB {{ site.data.products.cloud }}]({% link "cockroachcloud/index.md" %}) supports major versions of CockroachDB according to the schedule in the [CockroachDB {{ site.data.products.cloud }} Upgrade Policy]({% link "cockroachcloud/upgrade-policy.md" %}). On that page, select a supported version to view its feature highlights. Updates that are specific to CockroachDB {{ site.data.products.cloud }} are exclusively listed on this page.

CockroachDB {{ site.data.products.cloud }} supports the latest major version of CockroachDB and the version immediately preceding it. For more information, see the [CockroachDB {{ site.data.products.cloud }} Upgrade Policy]({% link "cockroachcloud/upgrade-policy.md" %}).

Get future release notes emailed to you:

{% include "marketo.html", formId: 1083 %}

## Aug 5, 2025

Console users with the [Billing Coordinator role]({% link "cockroachcloud/authorization.md" %}#billing-coordinator) can now [export invoices]({% link "cockroachcloud/billing-management.md" %}#export-invoices) in a PDF format, rendering billing information into a traditional invoice format for ease of distribution.

## Aug 4, 2025

CockroachDB v25.3 is now generally available (GA) for CockroachDB Cloud {{ site.data.products.advanced }} clusters. CockroachDB v25.3 is an [Innovation release]({% link "releases/index.md" %}#release-types).

For release notes, refer to [What's New in v25.3]({% link "releases/v25.3.md" %}).

To get started with v25.3, refer to [Create a CockroachDB {{ site.data.products.advanced }} cluster]({% link "cockroachcloud/create-an-advanced-cluster.md" %}) or [Upgrade a Cluster in CockroachDB Cloud]({% link "cockroachcloud/upgrade-cockroach-version.md" %}).

## July 31, 2025

### Customer-Managed Encryption Keys (CMEK) for CockroachDB Advanced for Azure

This release introduces Customer-Managed Encryption Keys (CMEK) for CockroachDB Cloud Advanced clusters on Microsoft Azure. This feature provides enhanced data security and supports PCI DSS compliance.

CMEK enables customers to control the encryption keys used to protect their data at rest within CockroachDB Cloud on Azure. Keys are managed via the customer's Azure Key Vault.

Key benefits:

- **Enhanced Data Security**: Customers control key lifecycle (creation, rotation, revocation), improving data protection.
- **PCI DSS Compliance**: Addresses PCI DSS Requirement 3 for protecting stored cardholder data.
- **Operational Control**: Provides greater control and visibility over data encryption strategy.
- **Data Revocation Capability**: Enables immediate data access revocation by disabling the encryption key in Azure Key Vault.

This functionality is critical for organizations handling sensitive data and seeking PCI DSS compliance on the Azure Advanced Tier of CockroachDB Cloud.

For more information, refer to [Customer-Managed Encryption Keys (CMEK) Overview]({% link "cockroachcloud/cmek.md" %}) and [Manage CMEK for CockroachDB Advanced]({% link "cockroachcloud/managing-cmek.md" %}).

## May 12, 2025

CockroachDB v25.2 is now generally available (GA) for CockroachDB Cloud {{ site.data.products.advanced }} clusters. CockroachDB v25.2 is a [Regular release]({% link "releases/index.md" %}#release-types).

For release notes, refer to [What's New in v25.2]({% link "releases/v25.2.md" %}).

To get started with v25.2, refer to [Create a CockroachDB {{ site.data.products.advanced }} cluster]({% link "cockroachcloud/create-an-advanced-cluster.md" %}) or [Upgrade a Cluster in CockroachDB Cloud]({% link "cockroachcloud/upgrade-cockroach-version.md" %}).

## April 30, 2025

You can now use the CockroachDB {{ site.data.products.cloud }} Console to [edit the labels of a cluster or folder]({% link "cockroachcloud/labels.md" %}).

## April 3, 2025

You can now [change cluster plans between {{ site.data.products.basic }} and {{ site.data.products.standard }}]({% link "cockroachcloud/change-plan-between-basic-and-standard.md" %}) from the CockroachDB {{ site.data.products.cloud }} Console.

## February 18, 2025

CockroachDB v25.1 is now generally available for select CockroachDB Cloud {{ site.data.products.advanced }} clusters. CockroachDB v25.1 is an [Innovation release]({% link "releases/release-support-policy.md" %}#innovation-releases). Refer to [Create a CockroachDB {{ site.data.products.advanced }} cluster]({% link "cockroachcloud/create-an-advanced-cluster.md" %}) or [Upgrade to v25.1]({% link "cockroachcloud/upgrade-cockroach-version.md" %}).

## January 16, 2025

<h3 id="2025-01-10-general-updates"> General updates </h3>

- GCP Private Service Connect and Azure Private Link have been promoted from Preview to [GA]({% link "{{site.current_cloud_version}}/cockroachdb-feature-availability.md" %}).

    For information about these features, refer to [Network Authorization]({% link "cockroachcloud/network-authorization.md" %}).

## December 17, 2024

<h3 id="2024-12-16-general-updates"> General updates </h3>

- CockroachDB {{ site.data.products.cloud }} is now available as a pay-as-you-go offering on the Google Cloud Marketplace. This allows Google Cloud customers to pay for CockroachDB {{ site.data.products.cloud }} charges via their Google Cloud accounts, with no up-front commitments. For more detail, refer to:
  - [CockroachDB (pay-as-you-go)](https://console.cloud.google.com/marketplace/product/cockroachlabs/cockroachdb-pay-as-you-go) on the Google Cloud Marketplace.
  - [Subscribe through the Google Cloud Marketplace]({% link "cockroachcloud/billing-management.md" %}?filters=gcp#subscribe-through-aws-marketplace) in the CockroachDB {{ site.data.products.cloud }} documentation.

## December 3, 2024

You can now use the CockroachDB {{ site.data.products.cloud }} Console to [view and filter audit logs]({% link "cockroachcloud/organization-audit-logs-in-cloud-console.md" %}), providing greater visibility into user activity across your CockroachDB {{ site.data.products.cloud }} organization.

## December 1, 2024

As of December 1, 2024, [updated pricing](https://www.cockroachlabs.com/pricing/new/) that was recently [announced](https://www.cockroachlabs.com/blog/improved-cockroachdb-cloud-pricing/) for CockroachDB Cloud is now in effect for all customers except those with annual or multi-year contracts that began prior to December 1, 2024. For those customers, the updated pricing, including new usage-based costs, goes into effect upon contract renewal. Prior to renewal, line items for usage of data transfer, backups, and changefeeds are displayed in the [Billing](https://cockroachlabs.cloud/billing) interface and on invoices with a $0 charge, while showing actual usage metrics to help estimate future costs.

For further detail, refer to [Understand CockroachDB Cloud Costs]({% link "cockroachcloud/costs.md" %}).

## November 18, 2024

CockroachDB v24.3 is now generally available for select CockroachDB Cloud clusters. CockroachDB v24.3 is a [Regular release]({% link "releases/release-support-policy.md" %}#regular-releases). Refer to [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link "cockroachcloud/create-your-cluster.md" %}) or [Upgrade to v24.3]({% link "cockroachcloud/upgrade-cockroach-version.md" %}).

## November 8, 2024

You can now [grant roles]({% link "cockroachcloud/managing-access.md" %}#change-a-team-members-role) to a user after you [invite them]({% link "cockroachcloud/managing-access.md" %}#invite-team-members-to-an-organization) to join your CockroachDB {{ site.data.products.cloud }} organization. Previously, a user was required to accept the invitation and create an account before roles could be granted.

## November 1, 2024

Cockroach Labs has announced [updated pricing](https://www.cockroachlabs.com/blog/improved-cockroachdb-cloud-pricing/) for CockroachDB Cloud. This new pricing model goes into effect December 1, 2024 for new customers and existing pay-as-you-go customers, and upon renewal for annual or multi-year contract customers.

A Preview of metering for usage-based billing of data transfer, backups, and changefeeds remains in effect through November 30, 2024. During this Preview, line items with a charge of $0 will be shown on your monthly invoice for these items. Customers with existing annual or multi-year contracts may continue to preview these line items until charges begin upon contract renewal.

For more information, refer to [CockroachDB Cloud Costs]({% link "cockroachcloud/costs.md" %}) and the [CockroachDB Pricing](https://www.cockroachlabs.com/pricing/) page.

## October 29, 2024

The new official [Cockroach Labs Okta app integration]({% link "cockroachcloud/configure-cloud-org-sso.md" %}#add-a-custom-authentication-method) eases the configuration of OIDC and SAML SSO authentication methods for CockroachDB {{ site.data.products.cloud }} organizations. Previously, a custom OIDC or SAML app integration in Okta was required.

## October 28, 2024

<h3 id="2024-10-28-general-updates"> General updates </h3>

- [CockroachDB v24.3.0-beta.2]({% link "releases/v24.3.md" %}#v24-3-0-beta-2) is available to CockroachDB {{ site.data.products.advanced }} clusters as a Pre-Production Preview release for testing and experimentation. An [Organization Admin]({% link "cockroachcloud/authorization.md" %}#organization-admin) can upgrade your CockroachDB {{ site.data.products.advanced }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. To learn more, refer to [Upgrade a cluster in CockroachDB {{ site.data.products.cloud }}]({% link "cockroachcloud/upgrade-cockroach-version.md" %}) and the [CockroachDB {{ site.data.products.cloud }} Upgrade Policy]({% link "cockroachcloud/upgrade-policy.md" %}).

## October 22, 2024

- The deprecated `is_regex` field has been removed from the [CockroachDB {{ site.data.products.cloud }} API for Java Web Tokens (JWTs)](https://cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/jwt-issuers). The API now handles regular expressions seamlessly.

## October 1, 2024

[Metering](https://www.cockroachlabs.com/docs/cockroachcloud/costs) for usage-based billing of data transfer, managed backup storage, and changefeeds is now in [Preview](https://www.cockroachlabs.com/docs/stable/cockroachdb-feature-availability#features-in-preview) for all CockroachDB Cloud organizations.

- Usage metrics for data transfer, managed backup storage, and changefeeds are now visible for CockroachDB Standard and Advanced clusters in the CockroachDB Cloud Console. You can view your usage across these metrics on the [Billing page](https://cockroachlabs.cloud/billing/overview) and on invoices.
- There will be no usage-based charges associated with these metrics during the Preview period, which is in effect through November 30, 2024\. During this time, line items with a charge of $0 will be shown for each metric on your monthly invoice.
- We will share pricing for these usage-based costs by November 1, 2024\.
- On December 1, 2024, once the Preview has ended, pricing for these metrics goes into effect immediately for new customers and for existing pay-as-you-go customers (e.g. paying monthly by credit card). Customers with annual or multi-year contracts will continue to preview these line items without incurring charges for them (i.e. expending credits) through the end of their current contract term.

## September 25, 2024

[CockroachDB {{ site.data.products.cloud }}]({% link "cockroachcloud/index.md" %}) [plans](https://cockroachlabs.com/pricing/) have been updated, and existing clusters have been transitioned to the new plans. There is no impact on the functionality or availability of existing clusters.

- CockroachDB Serverless clusters have been renamed to **CockroachDB {{ site.data.products.basic }}**.
- **CockroachDB {{ site.data.products.standard }}** is a new plan in [Preview]({% link "{{ site.current_cloud_version }}/cockroachdb-feature-availability.md" %}#features-in-preview). You can easily [switch]({% link "cockroachcloud/provision-a-cluster-with-terraform.md" %}#change-a-clusters-plan) a {{ site.data.products.basic }} cluster to CockroachDB {{ site.data.products.standard }} in place or [start a new Standard cluster]({% link "cockroachcloud/create-your-cluster.md" %}). New {{ site.data.products.cloud }} organizations can benefit from a [free trial]({% link "cockroachcloud/free-trial.md" %}).

    CockroachDB {{ site.data.products.standard }} offers the benefits of a scalable, shared architecture, along with many enterprise-ready features, including:

    - [Private Connectivity]({% link "cockroachcloud/connect-to-your-cluster.md" %}#establish-private-connectivity) to AWS Privatelink, GCP VPC Peering, and GCP Private Service Connect.
    - Customer control of [major version upgrades]({% link "cockroachcloud/cluster-management.md" %}#manage-cluster-upgrades).
    - Customer-configurable [Managed Backups]({% link "cockroachcloud/managed-backups.md" %}).
    - [Metrics export]({% link "cockroachcloud/export-metrics.md" %}) to Amazon CloudWatch, Datadog, and Prometheus.
    - [Log export]({% link "cockroachcloud/export-metrics.md" %}) to Amazon CloudWatch and GCP Cloud Logging.
- CockroachDB Dedicated clusters have been renamed to **CockroachDB {{ site.data.products.advanced }}**. Former CockroachDB Dedicated Advanced clusters are now CockroachDB {{ site.data.products.advanced }} clusters with [advanced security features]({% link "cockroachcloud/create-an-advanced-cluster.md" %}#step-6-configure-advanced-security-features) enabled.

For more details, refer to the [CockroachDB Blog](https://cockroachlabs.com/blog/roachfest-24-product-updates) and learn more about [CockroachDB {{ site.data.products.cloud }} Costs across plans](https://cockroachlabs.com/pricing/).

In addition, this release includes the following features:

- A collection of [Metrics graphs]({% link "cockroachcloud/metrics.md" %}#cockroachdb-cloud-console-metrics-page) in the Cloud Console for all plans.
- Configurable backup frequency and retention for [Managed Backups]({% link "cockroachcloud/managed-backups.md" %}) on CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.advanced }} clusters, so you can meet your Disaster Recovery requirements.
- Updates to the [CockroachDB Cloud API]({% link "cockroachcloud/cloud-api.md" %}) and [Terraform Provider]({% link "cockroachcloud/provision-a-cluster-with-terraform.md" %}) to support the new plans and features.

## August 12, 2024

<h3 id="2024-08-12-general-updates"> General updates </h3>

- CockroachDB v24.2 is now generally available for CockroachDB {{ site.data.products.dedicated }}. CockroachDB v24.2 is an optional [Innovation release]({% link "cockroachcloud/upgrade-policy.md" %}#innovation-releases). Refer to [Create a CockroachDB {{ site.data.products.dedicated }} cluster]({% link "cockroachcloud/create-your-cluster.md" %}) or [Upgrade to v24.2]({% link "cockroachcloud/upgrade-cockroach-version.md" %}).

- As of v24.2, Cockroach Labs releases a major version of CockroachDB once per quarter, alternating between releases classified as a _Regular release_ or an _Innovation release_.

  - [Regular releases]({% link "cockroachcloud/upgrade-policy.md" %}#regular-releases) are required; they must be applied to CockroachDB {{ site.data.products.dedicated }} clusters, and they are applied automatically to CockroachDB {{ site.data.products.serverless }} clusters. Regular releases are produced twice a year, alternating with Innovation releases. They are supported for one year. Upgrading CockroachDB {{ site.data.products.dedicated }} directly from one regular release to the next regular release, skipping the intervening Innovation release, is supported.
  - [Innovation releases]({% link "cockroachcloud/upgrade-policy.md" %}#innovation-releases) are optional and can be skipped for CockroachDB {{ site.data.products.dedicated }} but are required for CockroachDB {{ site.data.products.serverless }}. Innovation releases are produced twice a year, alternating with Regular releases. An innovation release is supported for 6 months, at which time a CockroachDB {{ site.data.products.dedicated }} cluster must be upgraded to the next Regular release. At a a given time, only one Innovation release is typically supported. Upgrading CockroachDB {{ site.data.products.dedicated }} directly from one Innovation release to the next innovation release is not supported.

    {{site.data.alerts.callout_info}}
    To opt out of Innovation releases entirely and hide them from your CockroachDB organization, contact [Support](https://support.cockroachlabs.com/hc).
    {{site.data.alerts.end}}

  To learn more, refer to [CockroachDB {{ site.data.products.cloud }} Support and Upgrade Policy]({% link "cockroachcloud/upgrade-policy.md" %}).

## July 31, 2024

<h3 id="2024-07-24-general-updates"> General updates </h3>

- When creating a new CockroachDB {{ site.data.products.advanced }} cluster, you can now [select the cluster's major version]({% link "cockroachcloud/create-an-advanced-cluster.md" %}#step-8-select-the-cockroachdb-version). The default option is the latest stable version. At any given time, you may be able to choose from additional stable releases or experimental [Pre-Production Preview]({% link "cockroachcloud/upgrade-policy.md" %}#pre-production-preview-upgrades) releases. Patch releases within a major version are applied automatically.

## July 19, 2024

<h3 id="2024-07-19-general-updates"> General updates </h3>

- CockroachDB {{ site.data.products.cloud }} is now available as a pay-as-you-go offering on the AWS Marketplace. This allows AWS customers to pay for CockroachDB Cloud charges via their AWS accounts, with no up-front commitments. For more detail, refer to:
  - [CockroachDB (pay-as-you-go)](https://aws.amazon.com/marketplace/pp/prodview-n3xpypxea63du) on AWS Marketplace.
  - [Subscribe through AWS Marketplace]({% link "cockroachcloud/billing-management.md" %}?filters=aws#subscribe-through-aws-marketplace) in the CockroachDB {{ site.data.products.cloud }} documentation.

## July 18, 2024

<h3 id="2024-07-18-security-updates"> Security updates </h3>

- The maximum number of [IP allowlist]({% link "cockroachcloud/network-authorization.md" %}#ip-allowlisting) entries has increased from 7 to 20 for CockroachDB {{ site.data.products.dedicated }} on AWS.

## June 26, 2024

<h3 id="2024-06-26-general-updates"> General updates </h3>

- The `qatarcentral` (Doha) region has been disabled for CockroachDB {{ site.data.products.dedicated }} clusters on Azure due to capacity issues. To express interest in this region, contact your account team.

## June 17, 2024

<h3 id="2024-06-17-security-updates"> Security updates </h3>

- The [IdP-initiated SAML flow]({% link "cockroachcloud/cloud-org-sso.md" %}#cloud-organization-sso) is now enabled by default. When you configure a [Cloud Organization SSO SAML connection]({% link "cockroachcloud/configure-cloud-org-sso.md" %}#saml), your users can optionally sign in to CockroachDB {{ site.data.products.cloud }} directly from your IdP, such as by using a tile in Okta.

## June 14, 2024

<h3 id="2024-06-14-general-updates"> General updates </h3>

- Deletion protection, which helps to prevent a cluster in CockroachDB {{ site.data.products.cloud }} from being deleted by mistake, is generally available for CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }} clusters. A user with permission to delete a cluster can enable deletion protection for the cluster. Refer to the instructions for [CockroachDB {{ site.data.products.serverless }}]({% link "cockroachcloud/basic-cluster-management.md" %}#enable-deletion-protection) and [CockroachDB {{ site.data.products.dedicated }}]({% link "cockroachcloud/cluster-management.md" %}#enable-deletion-protection).

## June 12, 2024

<h3 id="2024-06-12-general-updates"> General updates </h3>

- CockroachDB {{ site.data.products.dedicated }} on AWS is now available in new [regions]({% link "cockroachcloud/regions.md" %}?filters=dedicated#aws-regions):
    - `ap-east-1` (Hong Kong)
    - `ap-southeast-3` (Jakarta)
    - `ca-west-1` (Calgary)
    - `eu-south-1` (Milan)
    - `il-central-1` (Tel Aviv)
    - `me-south-1` (Bahrain)

<h3 id="2024-06-12-security-updates"> Security updates </h3>

- [Configuring private connectivity using Azure Private Link]({% link "cockroachcloud/connect-to-your-cluster.md" %}#azure-private-link) is available in [preview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) for CockroachDB {{ site.data.products.dedicated }} clusters on Azure. [Private connectivity]({% link "cockroachcloud/network-authorization.md" %}#options-for-controlling-network-access) allows you to establish SQL access to a CockroachDB {{ site.data.products.dedicated }} cluster entirely through cloud provider private infrastructure, without exposing the cluster to the public internet, affording enhanced security and performance.

## May 20, 2024

<h3 id="2024-05-20-general-updates"> General updates </h3>

- CockroachDB v24.1 is now generally available for CockroachDB {{ site.data.products.dedicated }}, and is scheduled to be made available for CockroachDB {{ site.data.products.core }} on June 3, 2024{% comment %}Verify{% endcomment %}. For more information, refer to [Create a CockroachDB Dedicated Cluster]({% link "cockroachcloud/create-your-cluster.md" %}) or [Upgrade to CockroachDB v24.1]({% link "cockroachcloud/upgrade-cockroach-version.md" %}).
- CockroachDB {{ site.data.products.dedicated }} on AWS is now available in the `me-central-1`(United Arab Emirates) [ region]({% link "cockroachcloud/regions.md" %}#aws-regions).
- CockroachDB {{ site.data.products.dedicated }} on GCP is now available in new [regions]({% link "cockroachcloud/regions.md" %}#gcp-regions):
    - `europe-southwest1` (Madrid)
    - `europe-west8` (Milan)
    - `europe-west12` (Paris)
    - `me-central1` (Doha)
    - `me-west1` (Tel Aviv)
    - `us-east5` (Columbus)
    - `us-south1` (Dallas)

<h3 id="2024-05-20-security-updates"> Security updates </h3>

- [Configuring private connectivity using Google Cloud Private Service Connect]({% link "cockroachcloud/connect-to-your-cluster.md" %}#gcp-private-service-connect) is available in [preview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) for CockroachDB {{ site.data.products.dedicated }} clusters on GCP. [Private connectivity]({% link "cockroachcloud/network-authorization.md" %}#options-for-controlling-network-access) allows you to establish SQL access to a CockroachDB {{ site.data.products.dedicated }} cluster entirely through cloud provider private infrastructure, without exposing the cluster to the public internet, affording enhanced security and performance.

## May 12, 2024

<h3 id="2024-05-12-security-updates"> Security updates </h3>

- [Folders]({% link "cockroachcloud/folders.md" %}) are now available in [preview](https://www.cockroachlabs.com/docs/stable/cockroachdb-feature-availability).
- The initial [Organization Admin]({% link "cockroachcloud/authorization.md" %}#organization-admin) is now automatically assigned the [Folder Admin]({% link "cockroachcloud/authorization.md" %}#folder-admin) role.
- A [Folder Admin]({% link "cockroachcloud/authorization.md" %}#folder-admin) can now view all users and service accounts.

## April 18, 2024

<h3 id="2024-04-18-general-updates"> General updates </h3>

- CockroachDB {{ site.data.products.dedicated }} clusters on Azure can now be created in the following [regions]({% link "cockroachcloud/regions.md" %}):

    Geographic Area  | Region Name          | Location
    -----------------|----------------------|---------
    Africa           | `southafricanorth`   | Johannesburg
    Asia Pacific     | `japaneast`          | Tokyo
                     | `koreacentral`       | Seoul
    Middle East      | `qatarcentral`       | Doha
                     | `uaenorth`           | Dubai
                     | `southcentralus`     | Texas
                     | `westus3`            | Washington
    Western Europe   | `francecentral`      | Paris
                     | `norwayeast`         | Oslo
                     | `polandcentral`      | Warsaw
                     | `swedencentral`      | Gävle
                     | `switzerlandnorth`   | Zürich

## April 17, 2024

<h3 id="2024-04-17-general-updates"> General updates </h3>

- [CockroachDB v24.1.0-beta.1](https://www.cockroachlabs.com/docs/releases/v24.1#v24-1-0-beta-1) is available to CockroachDB {{ site.data.products.dedicated }} clusters as a Pre-Production Preview release for testing and experimentation. An [Organization Admin]({% link "cockroachcloud/authorization.md" %}#organization-admin) can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. To learn more, refer to [Upgrade to v24.1 Pre-Production Preview]({% link "cockroachcloud/upgrade-cockroach-version.md" %}) and the [CockroachDB {{ site.data.products.cloud }} Upgrade Policy]({% link "cockroachcloud/upgrade-policy.md" %}).

## April 9, 2024

<h3 id="2024-04-09-security-updates"> Security updates </h3>

- The `paths` field of an [Egress Perimeter Control]({% link "cockroachcloud/egress-perimeter-controls.md" %}) egress rule is now deprecated and will be removed in the future. The CockroachDB {{ site.data.products.cloud }} API ignores this field and applies an egress rule to all egress requests to the specified network destination.

## March 20, 2024

<h3 id="2024-03-20-security-updates"> Security updates </h3>

- All CockroachDB {{ site.data.products.cloud }} organizations have been migrated to use [fine-grained roles]({% link "cockroachcloud/authorization.md" %}#organization-user-roles). The following deprecated legacy roles have been removed:
    - Org Administrator (Legacy)
    - Org Developer (Legacy)

## March 19, 2024

<h3 id="2024-03-19-general-updates"> General updates </h3>

- You can now use the CockroachDB {{ site.data.products.cloud }} Console to [add or remove regions]({% link "cockroachcloud/advanced-cluster-management.md" %}#add-or-remove-regions-from-a-cluster) for an existing CockroachDB {{ site.data.products.dedicated }} cluster on Azure.

## March 8, 2024

<h3 id="2024-03-08-general-updates"> General updates </h3>

- You can now add or remove regions from an existing CockroachDB {{ site.data.products.dedicated }} cluster on Azure, rather than only during cluster creation.

## February 6, 2024

<h3 id="2024-02-06-general-updates"> General updates </h3>

- Folder names can now include apostrophes. For details about folder naming, refer to [Folder Naming]({% link "cockroachcloud/folders.md" %}#folder-naming).

## February 5, 2024

<h3 id="2024-02-05-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.dedicated }} clusters now have a [**Metrics** page]({% link "cockroachcloud/metrics-essential.md" %}) in the Console with charts to **Monitor SQL Activity** and **Identify SQL Problems**. On the **Metrics** page, a **Custom** tab takes you to the [**Custom Metrics Chart** page]({% link "cockroachcloud/custom-metrics-chart-page.md" %}) (available in [preview]({% link "{{site.current_cloud_version}}/cockroachdb-feature-availability.md" %})) where you can create custom charts showing the time series data for an available metric or combination of metrics.

## January 29, 2024

<h3 id="2024-01-29-general-updates"> General updates </h3>

- CockroachDB {{ site.data.products.dedicated }} clusters now [export metrics]({% link "cockroachcloud/export-metrics.md" %}#the-metricexport-endpoint) to third-party monitoring tool [Prometheus]({% link "cockroachcloud/export-metrics.md" %}?filters=prometheus-metrics-export). This feature is available in [preview]({% link "{{site.current_cloud_version}}/cockroachdb-feature-availability.md" %}).

## January 25, 2024

<h3 id="2024-01-17-general-updates"> General updates </h3>

- The single-page CockroachDB Cloud [Create cluster]({% link "cockroachcloud/create-a-basic-cluster.md" %}) and [Edit cluster]({% link "cockroachcloud/basic-cluster-management.md" %}) have been updated to use multi-step wizards.

## January 17, 2024

<h3 id="2024-01-17-general-updates"> General updates </h3>

- CockroachDB v23.2 is now generally available for CockroachDB {{ site.data.products.dedicated }}, and is scheduled to be made available for CockroachDB {{ site.data.products.core }} on February 5, 2024. For more information, refer to [Create a CockroachDB Dedicated Cluster]({% link "cockroachcloud/create-your-cluster.md" %}) or [Upgrade to CockroachDB v23.2]({% link "cockroachcloud/upgrade-cockroach-version.md" %}).

## December 21, 2023

<h3 id="2023-12-21-general-updates"> General updates </h3>

- [CockroachDB v23.2.0-rc.1](https://www.cockroachlabs.com/docs/releases/v23.2#v23-2-0-rc-1) is available to CockroachDB {{ site.data.products.dedicated }} clusters as a Pre-Production Preview release for testing and experimentation. An [Organization Admin]({% link "cockroachcloud/authorization.md" %}#organization-admin) can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. For clusters previously upgraded to the v23.2.0-beta.3 Pre-Production Preview release, v23.2.0-rc.1 will be applied automatically as a patch upgrade unless you choose to manually upgrade. To learn more, refer to [Upgrade to v23.2 Pre-Production Preview]({% link "cockroachcloud/upgrade-cockroach-version.md" %}) and the [CockroachDB {{ site.data.products.cloud }} Upgrade Policy]({% link "cockroachcloud/upgrade-policy.md" %}).

## December 19, 2023

<h3 id="2023-12-19-general-updates"> General updates </h3>

- [CockroachDB v23.2.0-beta.3](https://www.cockroachlabs.com/docs/releases/v23.2#v23-2-0-beta-3) is available to CockroachDB {{ site.data.products.dedicated }} clusters as a Pre-Production Preview release for testing and experimentation. An [Organization Admin]({% link "cockroachcloud/authorization.md" %}#organization-admin) can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. To learn more, refer to [Upgrade to v23.2 Pre-Production Preview]({% link "cockroachcloud/upgrade-cockroach-version.md" %}) and the [CockroachDB {{ site.data.products.cloud }} Upgrade Policy]({% link "cockroachcloud/upgrade-policy.md" %}).

## December 14, 2023

<h3 id="2023-12-14-security-updates"> Security updates </h3>

- Organizations enrolled in [CockroachDB {{ site.data.products.cloud }} Folders (Limited Access)](https://cockroachlabs.com/docs/cockroachcloud/folders) can now use the CockroachDB {{ site.data.products.cloud }} Console to create and manage access to folders and clusters, in addition to the [CockroachDB {{ site.data.products.cloud }} API]({% link "cockroachcloud/cloud-api.md" %}) and the [Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) v1.1.0 or above. To learn more, refer to [Organize CockroachDB Cloud Clusters Using Folders]({% link "cockroachcloud/folders.md" %}).

## November 29, 2023

<h3 id="2023-11-29-security-updates"> Security updates </h3>

- [Authenticating to CockroachDB {{ site.data.products.dedicated }} clusters using public key infrastructure (PKI) security certificates]({% link "cockroachcloud/client-certs-advanced.md" %}) is now [Generally Available](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) to all CockroachDB {{ site.data.products.cloud }} organizations.
- [SCIM Provisioning]({% link "cockroachcloud/configure-scim-provisioning.md" %}), which centralizes provisioning and management of CockroachDB {{ site.data.products.cloud }} organization members in an identity provider (IdP) such as Okta using [System for Cross-Domain Identity Management SCIM](https://www.rfc-editor.org/rfc/rfc7644), is now [Generally Available](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) to all CockroachDB {{ site.data.products.cloud }} organizations.

## November 08, 2023

<h3 id="2023-11-08"> General changes </h3>

- For CockroachDB Dedicated clusters, the ability to add and remove regions through the CockroachDB Cloud Console has now been restored.

## October 17, 2023

<h3 id="2023-10-17-general-changes"> General changes </h3>

- New CockroachDB {{ site.data.products.dedicated }} clusters on Azure can be created in the Pune (`centralindia`) [cloud region](https://www.cockroachlabs.com/docs/cockroachcloud/regions?filters=dedicated#azure-regions).

## October 4, 2023

<h3 id="2023-10-04-general-changes"> General changes </h3>

- New CockroachDB {{ site.data.products.dedicated }} clusters on Azure can be created in the Singapore (`southeastasia`) [cloud region](https://www.cockroachlabs.com/docs/cockroachcloud/regions?filters=dedicated#azure-regions).

## October 2, 2023

<h3 id="2023-10-02-general-changes"> General changes </h3>

- [CockroachDB {{ site.data.products.advanced }} on Azure]({% link "cockroachcloud/cockroachdb-advanced-on-azure.md" %}) is [generally available]({% link "{{ site.current_cloud_version }}/cockroachdb-feature-availability.md" %}#feature-availability-phases).

<h3 id="2023-10-02-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.serverless }} clusters now have a [**Custom Metrics Chart** page]({% link "cockroachcloud/custom-metrics-chart-page.md" %}) available in [preview]({% link "{{site.current_cloud_version}}/cockroachdb-feature-availability.md" %}). From the [**Metrics** page]({% link "cockroachcloud/metrics-essential.md" %}) in the Console, navigate to the **Custom** tab to create custom charts showing the time series data for an available metric or combination of metrics.

## September 29, 2023

<h3 id="2023-09-29-general-changes"> General changes </h3>

- Multi-region CockroachDB {{ site.data.products.serverless }} clusters are now [generally available](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability), and [cross-region network charges](https://www.cockroachlabs.com/pricing) are now accounted for in RU consumption.
## September 27, 2023

<h3 id="2023-09-27-general-changes"> General changes </h3>

- The {{ site.data.products.cloud }} Console's [SQL Shell]({% link "cockroachcloud/sql-shell.md" %}) is now available in [preview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) to all CockroachDB {{ site.data.products.cloud }} users with the [Cluster Admin role]({% link "cockroachcloud/managing-access.md" %}).

## September 22, 2023

<h3 id="2023-09-22-general-changes"> General changes </h3>

- CockroachDB {{ site.data.products.dedicated }} clusters on Azure can now be modified, [horizontally or vertically scaled]({% link "cockroachcloud/cluster-management.md" %}), [upgraded]({% link "cockroachcloud/upgrade-policy.md" %}), have their [storage increased]({% link "cockroachcloud/advanced-cluster-management.md" %}#increase-storage-for-a-cluster), and have [maintenance windows]({% link "cockroachcloud/advanced-cluster-management.md" %}#set-a-maintenance-window) set. To learn more, refer to [CockroachDB {{ site.data.products.dedicated }} on Azure]({% link "cockroachcloud/cockroachdb-advanced-on-azure.md" %}).

## September 11, 2023

<h3 id="2023-09-11-general-changes"> General changes </h3>

- The {{ site.data.products.cloud }} Console's [SQL Shell]({% link "cockroachcloud/sql-shell.md" %}) is now available in [limited access](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability). This feature enables you to run queries on your cluster directly from the {{ site.data.products.cloud }} Console. To enroll your organization, contact your Cockroach Labs account team.

## September 8, 2023

<h3 id="2023-09-08-general-changes"> General changes </h3>

- [Managed backups](https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups?filters=dedicated) are now available for [CockroachDB {{ site.data.products.dedicated }} clusters on Azure (Limited Access)]({% link "cockroachcloud/cockroachdb-advanced-on-azure.md" %}).

- You can now create new [multi-region](https://www.cockroachlabs.com/docs/stable/multiregion-overview) CockroachDB {{ site.data.products.dedicated }} clusters on Azure.

{% capture regions_list %}
  - `australiaeast`
  - `canadacentral`
  - `centralus`
  - `eastasia`
  - `eastus`
  - `germanywestcentral`
  - `northeurope`
  - `uksouth`
  - `westus2`
{% endcapture %}

- New CockroachDB {{ site.data.products.dedicated }} clusters on Azure can be created in additional [cloud regions](https://www.cockroachlabs.com/docs/cockroachcloud/regions?filters=dedicated#azure-regions):

    {{regions_list}}

## September 6, 2023

<h3 id="2023-09-06-general-changes"> General changes </h3>

- CockroachDB {{ site.data.products.dedicated }} [maintenance windows]({% link "cockroachcloud/advanced-cluster-management.md" %}#set-a-maintenance-window) now include all kinds of cluster maintenance operations in addition to patch upgrades.

## September 1, 2023

<h3 id="2023-09-01-general-changes"> General changes </h3>

- Configuring [private endpoint trusted owners](https://cockroachlabs.com/docs/cockroachcloud/aws-privatelink) for CockroachDB {{ site.data.products.dedicated }} clusters on AWS is available in [limited access]({% link "{{site.versions["stable"]}}/cockroachdb-feature-availability.md" %}). To enroll your organization, contact your Cockroach Labs account team.

## August 22, 2023

<h3 id="2023-08-16-general-changes"> General changes </h3>

- In the {{ site.data.products.cloud }} Console, you can now [add regions and change the primary region]({% link "cockroachcloud/folders.md" %}) for multi-region CockroachDB {{ site.data.products.serverless }} clusters. You cannot currently edit the region configuration for a single-region cluster once it has been created, and you cannot remove a region once it has been added.

## August 16, 2023

<h3 id="2023-08-16-general-changes"> General changes </h3>

- [Organizing clusters using folders]({% link "cockroachcloud/folders.md" %}) is available in [limited access]({% link "{{site.versions["stable"]}}/cockroachdb-feature-availability.md" %}). To enroll your organization, contact your Cockroach Labs account team.

## August 9, 2023

<h3 id="2023-08-09-console-changes"> Console changes </h3>

- The **Updating** cluster status in the {{ site.data.products.db }} Console has been replaced with the **Available (Maintenance in Progress)** status to clarify that clusters are available for reading and writing data during maintenance upgrades.

## August 1, 2023

<h3 id="2023-08-01-general-changes"> General changes </h3>

- {{ site.data.products.serverless }} pricing changes that went into effect for newly-created organizations beginning on  [May 1, 2023](#may-1-2023) are now in effect for all organizations. Review the [new pricing]({% link "cockroachcloud/plan-your-cluster-basic.md" %}#pricing), and review your current [resource limits](../cockroachcloud/basic-cluster-management.html#edit-cluster-capacity) to prevent disruptions to your service.

## July 31, 2023

<h3 id="2023-07-31-console-changes"> Console changes </h3>

- The primary navigation to the **Clusters**, **Billing**, **Alerts**, and **Organization** pages in the CockroachDB {{ site.data.products.cloud }} Console is now displayed at the top of the page instead of on the left.

## July 24, 2023

<h3 id="2023-07-24-security-changes"> Security updates </h3>

- [Configuring private connectivity using AWS PrivateLink]({{ site.baseurl }}/cockroachcloud/aws-privatelink.html?filters=serverless) is available in [limited access](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) for multi-region CockroachDB {{ site.data.products.serverless }} clusters on AWS. To enroll your organization, contact your Cockroach Labs account team.

<h3 id="2023-07-24-console-changes"> Console changes </h3>

- `ccloud` [v0.5.11]({% link "cockroachcloud/ccloud-get-started.md" %}#install-ccloud) is now available. This update includes a new [`--skip-ip-check` flag]({% link "cockroachcloud/ccloud-get-started.md" %}#skip-the-ip-allowlist-check-when-connecting-to-your-cluster) that allows users to skip the client-side IP allowlist check when connecting to a cluster using the `ccloud cluster sql` command.

## July 21, 2023

<h3 id="2023-07-21-security-changes"> Security updates </h3>

- **Health Insurance Portability and Accountability Act (HIPAA)**: When configured appropriately for [PCI DSS Compliance]({% link "cockroachcloud/pci-dss.md" %}), CockroachDB {{ site.data.products.dedicated }} advanced also meets the requirements of the Health Insurance Portability and Accountability Act of 1996, commonly referred to as _HIPAA_. HIPAA defines standards for the storage and handling of personally-identifiable information (PII) related to patient healthcare and health insurance, which is also known as protected-health information (PHI). To learn more, refer to [Regulatory Compliance in CockroachDB Dedicated]({% link "cockroachcloud/compliance.md" %}).

## July 10, 2023

<h3 id="2023-07-10-general-changes"> General changes </h3>

- Previously, a default setting in the Amazon CloudWatch exporter could cause redundant cardinality in [metrics exported]({% link "cockroachcloud/export-metrics.md" %}) from CockroachDB {{ site.data.products.dedicated }} clusters, which unnecessarily increased costs. This option is now disabled to reduce AWS costs.

<h3 id="2023-07-10-console-changes"> Console changes </h3>

- The **Add database** button on the [**Databases** page]({% link "cockroachcloud/databases-page.md" %}) of the Console is temporarily disabled.
- CockroachDB {{ site.data.products.dedicated }} [restore jobs]({% link "cockroachcloud/managed-backups-advanced.md" %}#restore-data) now have the following more descriptive statuses: `Preparing`, `Running`, `Reverting`, `Finalizing`, `Succeeded`, and `Failed` statuses. Additionally, destination clusters of self-service restores now display a `Restoring` state during the restore.
- The [**Databases** page]({% link "cockroachcloud/databases-page.md" %}) now includes additional statistics for clusters running [v23.1.0]({% link "releases/v23.1.md" %}) and later.
- You can now set up an AWS CloudWatch integration and view its status directly from the [**Tools** page]({% link "cockroachcloud/export-metrics-advanced.md" %}) of the CockroachDB {{ site.data.products.cloud }} Console.

<h3 id="2023-07-10-security-changes"> Security updates </h3>

- CockroachDB {{ site.data.products.serverless }} users can now [configure an IP allowlist]({% link "cockroachcloud/network-authorization.md" %}#ip-allowlisting) with up to 50 allowlist rules for their clusters.
- The following [roles]({% link "cockroachcloud/authorization.md" %}#organization-user-roles) are now available for users of the limited access [fine-grained access control authorization model]({% link "cockroachcloud/network-authorization.md" %}#ip-allowlisting):

    - Cluster Operator
    - Billing Coordinator
    - Org Administrator

    To enroll your organization in the new authorization model, contact your Cockroach Labs account team.

## June 05, 2023

<h3 id="2023-07-05-console-changes"> Console changes </h3>

- Organizations that have purchased premium support will now see it included in their [invoices]({% link "cockroachcloud/billing-management.md" %}).
- Cross-cluster [restores]({% link "cockroachcloud/managed-backups.md" %}#restore-a-cluster) are now limited to CockroachDB {{ site.data.products.dedicated }} clusters with a major version greater than or equal to the major version of the source cluster.
- The [**Restore jobs**]({% link "cockroachcloud/managed-backups-advanced.md" %}#restore-data) tab of the **Backups page** now shows more information about a restore job, such as the source and destination clusters, the restore type, the backup size, and the job's progress.

<h3 id="2023-07-05-security-changes"> Security updates </h3>

- The [Organization Audit Logs API]({% link "cockroachcloud/cloud-org-audit-logs.md" %}), which provides logs of events that occur in a Cloud organization, is now [generally available](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability#feature-availability-phases).
- `ExternalId` support is now re-enabled in the [Customer-managed Encryption Key (CMEK)]({% link "cockroachcloud/cmek.md" %}) capability on AWS.

<h3 id="2023-07-05-bug-fixes"> Bug fixes </h3>

- The `status` returned by the [`logexport` Cloud API endpoint]({% link "cockroachcloud/export-logs.md" %}#the-logexport-endpoint) is now determined by the state of both the latest log export's job state and the readiness of the underlying logging resources. Before this change, a `GET` request to the `logexport` endpoint could report an outdated log export status that conflicted with the latest log export update job state or with the most recent state of the logging infrastructure.
- Fixed a bug where concurrent [restores]({% link "cockroachcloud/managed-backups.md" %}#restore-a-cluster) could run on the same destination cluster and cause the destination cluster to become unusable.
- Fixed a bug where the IOPS price preview shown when [creating]({% link "cockroachcloud/create-your-cluster.md" %}) or [editing a cluster]({% link "cockroachcloud/cluster-management.md" %}) was inaccurate.
- The **Group** tab is now shown only to users who have this feature enabled. Previously, an error page was shown to users who navigated to the **Group** tab without enabling the feature.

## May 31, 2023

<h3 id="2023-05-31-security-changes"> Security updates </h3>

- [CockroachDB {{ site.data.products.cloud }} Organization Audit Logs]({% link "cockroachcloud/cloud-org-audit-logs.md" %}), which capture historical logs when many types of events occur, are now generally available for CockroachDB {{ site.data.products.cloud }} organizations.

## May 15, 2023

In addition to many of the Feature Highlights in the [CockroachDB v23.1.0 Release Notes]({% link "releases/v23.1.md" %}#v23-1-0-feature-highlights), the following features are specifically available to Cloud clusters once they are upgraded:

<h3 id="2023-05-15-general-changes"> General changes </h3>

- CockroachDB {{ site.data.products.serverless }} [multi-region](https://www.cockroachlabs.com/docs/v23.1/multiregion-overview) is now publicly available in [preview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability#feature-availability-phases). Multi-region benefits like reduced latency and high availability are now achievable in conjunction with the ease-of-operation and automatic scaling advantages of the CockroachDB {{ site.data.products.serverless }} deployment model.

    - Regions available: 6 regions in AWS and 6 regions in GCP.
    - A primary region for the cluster is specified upon creation.
    - The cluster’s regional configuration applies to all databases by default, so it is not necessary to run [`ALTER DATABASE ... ADD REGION`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-database#add-region) to configure regions when adding a database to the cluster.
    - [`SURVIVE REGION FAILURE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-database#survive-zone-region-failure) is supported to achieve [region-level survival goals](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multiregion-overview#survival-goals).

- [Creating CockroachDB {{ site.data.products.advanced }} clusters on Azure]({% link "cockroachcloud/cockroachdb-advanced-on-azure.md" %}) is now available in [limited access]({% link "{{ site.current_cloud_version }}/cockroachdb-feature-availability.md" %}). To enroll your organization and begin testing this feature, contact your Cockroach Labs account team.

<h3 id="2023-05-15-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.dedicated }} users can now [restore clusters from the Cloud console]({% link "cockroachcloud/take-and-restore-self-managed-backups.md" %}).

## May 10, 2023

<h3 id="2023-05-10-security-changes"> Security updates </h3>

- [Egress Perimeter Controls]({% link "cockroachcloud/egress-perimeter-controls.md" %}), which allow you to restrict egress from a CockroachDB {{ site.data.products.dedicated }} cluster to a list of specified external destinations, are now generally available for CockroachDB {{ site.data.products.dedicated }} advanced clusters.

## May 1, 2023

<h3 id="2023-05-01-general-changes"> General changes </h3>

The following changes were made to CockroachDB {{ site.data.products.serverless }} for **new organizations** created on or after April 26, 2023. **Existing organizations will not be affected until August 1, 2023**.

- The price of [Request Units (RUs)]({% link "cockroachcloud/plan-your-cluster-basic.md" %}#request-units) increased from $1 per 10M RU to $2 per 10M RUs.
- The price of storage decreased from $1 per 1 GiB storage to $0.50 per 1 GiB storage.
- Free resources are allocated on a per-organization basis instead of a per-cluster basis. All non-contract organizations will now receive 50M Request Units per month and 10 GiB of storage for free. Free resources do not apply to customers with annual or multi-year contracts.
- All resources are available instantly at the beginning of each month (burst and baseline RUs are now deprecated).
- You can now [set separate RU and storage limits]({% link "cockroachcloud/basic-cluster-management.md" %}#edit-cluster-capacity) for your clusters, or set a spend limit that will be divided between resources automatically.
- You can now [set unlimited resources]({% link "cockroachcloud/basic-cluster-management.md" %}#edit-cluster-capacity) for a cluster so your workload is never restricted.
- Organizations on the free plan will have at most one free serverless cluster (instead of the previous limit of five free clusters). **Cockroach Labs will continue to maintain all existing free clusters with the new organization-level free resources**.
- Organizations can now create 200 serverless clusters instead of the previous maximum of five total clusters.

For an in-depth explanation of CockroachDB {{ site.data.products.serverless }} pricing, refer to [Pricing](https://cockroachlabs.com/pricing). For any questions or concerns, please [contact Support](https://support.cockroachlabs.com).

<h3 id="2023-05-01-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.dedicated }} users can now [use the Cloud Console for full-cluster restores](https://www.cockroachlabs.com/docs/cockroachcloud/managed-backups?filters=advanced#restore-data-in-advanced-clusters).
- The [**Access Management** page]({% link "cockroachcloud/managing-access.md" %}) in the Cloud Console now shows only relevant content based on the [user's role assignments]({% link "cockroachcloud/authorization.md" %}#organization-user-roles).

<h3 id="2023-05-01-api-changes">Cloud API changes </h3>

- [Cloud API]({% link "cockroachcloud/cloud-api.md" %}) responses now contain a header called `Cc-Trace-Id` that can be provided to [Support](https://support.cockroachlabs.com) to help with diagnostics or troubleshooting.
- The `CreateCluster` and `UpdateCluster` methods now support setting individual monthly limits for a cluster's Request Units and storage usage.
- If your organization is enrolled in the new fine-grained authorization model described under **Security Updates**, you can assign the [new roles]({% link "cockroachcloud/authorization.md" %}#organization-user-roles) to both users and service accounts using the [Cloud API]({% link "cockroachcloud/cloud-api.md" %}) or [Terraform provider]({% link "cockroachcloud/provision-a-cluster-with-terraform.md" %}) in addition to the {{ site.data.products.Cloud }} Console.

<h3 id="2023-05-01-security-changes"> Security updates </h3>

- CockroachDB {{ site.data.products.cloud }} is transitioning to a new [authorization model]({% link "cockroachcloud/authorization.md" %}#overview-of-the-cockroachdb-cloud-authorization-model) that offers fine-grained access-control (FGAC), meaning that users can be given access to exactly the actions and resources required to perform their tasks. Changes include [cluster-level roles]({% link "cockroachcloud/authorization.md" %}#organization-user-roles) and consistent access management across users and service accounts. This feature is in [limited access](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability), and you can enroll your organization by contacting your account team. For more information, see [Managing Access (Authorization) in CockroachDB Cloud]({% link "cockroachcloud/managing-access.md" %}).

- You can now use client certificates to authenticate to CockroachDB {{ site.data.products.dedicated }} clusters. First, a [Cluster Admin]({% link "cockroachcloud/authorization.md" %}#organization-user-roles) needs to upload a CA certificate for the cluster using the [Cloud API]({% link "cockroachcloud/cloud-api.md" %}) or [Terraform provider]({% link "cockroachcloud/provision-a-cluster-with-terraform.md" %}). After that, individual users can be assigned client certificates signed by the uploaded CA certificate, which they can then use to connect to the cluster. This feature is in [limited access](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability), and you can enroll your organization by contacting your account team.

<h3 id="2023-05-01-bug-fixes"> Bug fixes </h3>

- The [**Connect to your cluster**]({% link "cockroachcloud/connect-to-your-cluster.md" %}) dialog and [**Databases** page]({% link "cockroachcloud/databases-page.md" %}) in the Console now respond significantly faster for clusters with over 100 databases.
- Fixed a bug where table and database [restores]({% link "cockroachcloud/managed-backups.md" %}) were disabled for clusters running CockroachDB versions [v22.2.6]({% link "releases/v22.2.md" %}#v22-2-6) or below.

## April 26, 2023

<h3 id="2023-04-26-security-changes"> Security updates </h3>

- [SCIM Provisioning]({% link "cockroachcloud/configure-scim-provisioning.md" %}), which centralizes provisioning and management of CockroachDB {{ site.data.products.cloud }} organization members in an identity provider (IdP) such as Okta using [System for Cross-Domain Identity Management SCIM](https://www.rfc-editor.org/rfc/rfc7644), is available in [limited access](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability). To enroll your organization, contact your account team.

## April 10, 2023

<h3 id="2023-04-10-general-changes"> General changes </h3>

- Contract customers can now [create CockroachDB {{ site.data.products.dedicated }} advanced clusters]({% link "cockroachcloud/create-your-cluster.md" %}#step-1-start-the-cluster-creation-process), which have all the features of CockroachDB {{ site.data.products.dedicated }} standard clusters, plus security features needed for [PCI DSS compliance]({% link "cockroachcloud/pci-dss.md" %}). To upgrade your organization to a contract, [contact us](https://cockroachlabs.com/contact-sales).
- CockroachDB {{ site.data.products.dedicated }} clusters now [export the following metrics]({% link "cockroachcloud/export-metrics.md" %}#the-metricexport-endpoint) to third-party monitoring tools such as [Datadog](https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics?filters=datadog-metrics-export) and [Amazon CloudWatch](https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics?filters=aws-metrics-export):
  - `storage_l0_sublevels`
  - `storage_l0_num_files`
  - `security_certificate_expiration_ca`
  - `sql_mem_root_current`
  - `sys_host_disk_iopsinprogress`

<h3 id="2023-04-10-api-changes"> Cloud API changes </h3>

- You can now upgrade, roll back, or manually finalize a pending upgrade to your cluster using the [Cloud API]({% link "cockroachcloud/cloud-api.md" %}).
- The [Cloud API endpoints]({% link "cockroachcloud/cloud-api.md" %}) that were in preview for configuring metric export have been replaced with specific endpoints for each supported third-party tool integration. For example, `EnableMetricExport` is now replaced by `EnableDatadogMetricExport` and `EnableCloudWatchMetricExport`.

<h3 id="2023-04-10-security-changes"> Security updates </h3>

- [Organization Admins]({% link "cockroachcloud/authorization.md" %}#organization-admin) of organizations that have [enabled Cloud Organization SSO]({% link "cockroachcloud/cloud-org-sso.md" %}) can now reset the passwords of other users in their organization who authenticate using passwords rather than an SSO authentication method.

<h3 id="2023-04-10-bug-fixes"> Bug fixes </h3>

- Fixed a bug where a `404` error would display when navigating from certain pages to the **Clusters** page.
- Removed an unnecessary warning that could appear when downloading CA certificates for CockroachDB {{ site.data.products.serverless }} clusters.

## March 31, 2023

<h3 id="2023-03-31-security-changes"> Security updates </h3>

- [Private Clusters]({% link "cockroachcloud/private-clusters.md" %}) are now generally available for CockroachDB {{ site.data.products.dedicated }}. A private cluster's nodes have no public IP addresses.
- [Customer-Managed Encryption Keys (CMEK)]({% link "cockroachcloud/cmek.md" %}) is now generally available for CockroachDB {{ site.data.products.dedicated }} private clusters. CMEK allows you to protect data at rest in a CockroachDB {{ site.data.products.dedicated }} cluster using a cryptographic key that is entirely within your control, hosted in a supported cloud provider key-management system (KMS).

## March 06, 2023

<h3 id="2023-03-06-security-changes"> Security updates </h3>

- The [**Migrations** page]({% link "cockroachcloud/migrations-page.md" %}) is now limited to [Organization Admins]({% link "cockroachcloud/authorization.md" %}#organization-admin).

## February 9, 2023

<h3 id="2023-02-09-general-changes"> General changes </h3>

- For CockroachDB {{ site.data.products.dedicated }} clusters, the ability to add and remove regions through the CockroachDB {{ site.data.products.cloud }} Console has been temporarily disabled. If you need to add or remove regions from a cluster, [contact Support](https://support.cockroachlabs.com/).

## February 6, 2023

<h3 id="2023-02-06-general-changes"> General changes </h3>

- The following features are now available for CockroachDB {{ site.data.products.serverless }} clusters running CockroachDB [v22.2.0]({% link "releases/v22.2.md" %}) or later:
  - [Query cancellation]({% link "{{site.current_cloud_version}}/cancel-query.md" %}#considerations) using the PostgreSQL wire protocol (pgwire).
  - [`EXPLAIN ANALYZE`]({% link "{{site.current_cloud_version}}/explain-analyze.md" %}) now gives an estimate of the [Request Units (RUs)]({% link "cockroachcloud/plan-your-cluster-basic.md" %}#request-units) a query consumes, for {{ site.data.products.basic }} clusters.
  - All CockroachDB {{ site.data.products.serverless }} users can now use cloud storage for [`IMPORT`]({% link "{{site.current_cloud_version}}/import-into.md" %}), [`BACKUP`]({% link "{{site.current_cloud_version}}/backup.md" %}), and [change data capture (CDC)]({% link "{{site.current_cloud_version}}/change-data-capture-overview.md" %}) without entering billing information.
  - `SHOW RANGES` is now supported on CockroachDB {{ site.data.products.serverless }}.
  - The [GC TTL]({% link "{{site.current_cloud_version}}/configure-replication-zones.md" %}#gc-ttlseconds) for deleted values is lowered from 24 hours to 1 hour and 15 minutes.

<h3 id="2023-02-06-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.basic }} clusters' regions are now displayed on the [**Cluster Overview** page]({% link "cockroachcloud/cluster-overview-page.md" %}) and [**Clusters** page]({% link "cockroachcloud/basic-cluster-management.md" %}#view-clusters-page).
- The links in the sidebar navigation of the [**Cluster Overview**]({% link "cockroachcloud/cluster-overview-page.md" %}) page have been reorganized into sections under relevant headers.
- For CockroachDB {{ site.data.products.dedicated }} clusters, the **Monitoring** page is now called the [**Tools** page]({% link "cockroachcloud/tools-page.md" %}) and is located in the **Monitoring** section of the sidebar.

<h3 id="2023-02-06-api-changes"> Cloud API changes </h3>

- Support for [Customer-Managed Encryption Keys (CMEK)]({% link "cockroachcloud/cmek.md" %}) has been added to the [CockroachDB {{ site.data.products.cloud }} Terraform Provider](https://registry.terraform.io/providers/cockroachdb/cockroach/latest). Contact your Cockroach Labs account team to enroll in the CMEK preview.
- When [using Terraform to provision CockroachDB {{ site.data.products.cloud }} clusters]({% link "cockroachcloud/provision-a-cluster-with-terraform.md" %}), you can now manage [database connections](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/data-sources/connection_string) and [SSL certificates](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/data-sources/cluster_cert) directly in your Terraform workflow.
- The Cloud API now provides [formatted connection string information](https://www.cockroachlabs.com/docs/api/cloud/v1.html#get-/api/v1/clusters/-cluster_id-/connection-string).

<h3 id="2023-02-06-security-changes"> Security updates </h3>

- CockroachDB {{ site.data.products.dedicated }} is now [compliant with the Payment Card Industry Data Security Standard (PCI DSS)](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/security-reference/security-overview). To learn more about achieving PCI DSS compliance with CockroachDB {{ site.data.products.dedicated }}, contact your Cockroach Labs account team.
- [Cloud Organization Single Sign-On (SSO)]({% link "cockroachcloud/cloud-org-sso.md" %}#cloud-organization-sso) is now available to all CockroachDB {{ site.data.products.cloud }} users.
- For CockroachDB {{ site.data.products.cloud }} organizations enrolled in the [Customer-managed Encryption Key (CMEK)]({% link "cockroachcloud/cmek.md" %}) preview, note that the following conditions must now be met before enabling CMEK for a CockroachDB {{ site.data.products.dedicated }} cluster:
    - The cluster must be running CockroachDB [v22.2.0]({% link "releases/v22.2.md" %}) or later.
    - The cluster must have been created as a [private cluster]({% link "cockroachcloud/private-clusters.md" %}). To create a private cluster, your organization  must be enrolled in the private cluster preview, which is separate from the CMEK preview. Contact your Cockroach Labs account team to enroll in both previews.
- For CockroachDB {{ site.data.products.cloud }} organizations enrolled in the [Egress Perimeter Controls]({% link "cockroachcloud/egress-perimeter-controls.md" %}) preview, note that CockroachDB {{ site.data.products.dedicated }} clusters must have been created as [private clusters]({% link "cockroachcloud/private-clusters.md" %}) in order to enable Egress Perimeter Controls. To create a private cluster, your organization  must be enrolled in the private cluster preview, which is separate from the Egress Perimeter Controls preview. Contact your Cockroach Labs account team to enroll in both previews.

<h3 id="2023-02-06-bug-fixes"> Bug fixes </h3>

-  Fixed a bug where users granted the Developer role in a CockroachDB {{ site.data.products.cloud }} organization incorrectly had certain permissions for any cluster in the organization. Refer to [this technical advisory](https://www.cockroachlabs.com/docs/advisories/c20230118) for more information.

## February 2, 2023

<h3 id="2023-02-02-general-changes"> General changes </h3>

- CockroachDB {{ site.data.products.serverless }} users can now access [cloud storage](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage) without entering billing information.

## January 9, 2023

<h3 id="2023-01-09-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.dedicated }} clusters running CockroachDB [v22.1.8]({% link "releases/v22.1.md" %}#v22-1-8) or later now have a separate tab for incomplete backup jobs on the [**Backups** page]({% link "cockroachcloud/managed-backups.md" %}).

<h3 id="2023-01-09-api-changes"> Cloud API changes </h3>

- The [create cluster]({% link "cockroachcloud/cloud-api.md" %}) request now exposes the `restrict-egress-traffic` boolean field to allow dedicated clusters to be created with a [deny-by-default egress traffic policy]({% link "cockroachcloud/egress-perimeter-controls.md" %}#use-a-deny-by-default-egress-traffic-policy). This field and the broader egress perimeter controls capability can be used only with [private dedicated clusters]({% link "cockroachcloud/private-clusters.md" %}), which require the `network-visibility` field to be set to `NETWORK_VISIBILITY_PRIVATE`.

<h3 id="2023-01-09-bug-fixes"> Bug fixes </h3>

- Fixed a bug for CockroachDB {{ site.data.products.dedicated }} clusters where the [**Datadog setup**]({% link "cockroachcloud/export-metrics-advanced.md" %}) dialog was not rendering properly.

## December 5, 2022

<h3 id="2022-02-05-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.serverless }} clusters now have a [**Metrics** page](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-custom-chart-debug-page) in the Console with charts to **Monitor SQL Activity** and **Identify SQL Problems**.
- The `p99.9` and `p99.99` latencies are now shown in the `SQL Connection Latency` and `SQL Statement Latency` charts on the [**Metrics** page](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-custom-chart-debug-page) for CockroachDB {{ site.data.products.serverless }} clusters.
- The **Last used** column on the [**Table Details** page]({% link "cockroachcloud/databases-page.md" %}) now uses the UTC timezone.
- The CockroachDB {{ site.data.products.serverless }} [**Cost estimator**]({% link "cockroachcloud/basic-cluster-management.md" %}#estimate-usage-cost) has been temporarily disabled while a bug is being fixed.

<h3 id="2022-12-05-api-changes"> Cloud API changes </h3>

- A preview of [log export]({% link "cockroachcloud/export-logs.md" %}) for CockroachDB {{ site.data.products.dedicated }} users is now available. To enroll your organization in the preview, contact your Cockroach Labs account team.

<h3 id="2022-12-05-bug-fixes"> Bug fixes </h3>

- Trial coupon limits for CockroachDB {{ site.data.products.dedicated }} clusters' storage and compute are now enforced in the [**Edit cluster**]({% link "cockroachcloud/cluster-management.md" %}) dialog.
- Fixed a bug where [backups]({% link "cockroachcloud/managed-backups.md" %}) shown for a particular day included backups for midnight on the following day.
- Fixed a bug  on the [**Databases page**]({% link "cockroachcloud/databases-page.md" %}) where the number of index recommendations displayed for a database was inconsistent with the actual number of index recommendations for the database.
- Fixed a bug that could break the [**Databases page**]({% link "cockroachcloud/databases-page.md" %}) when fetching index usage statistics for databases.

## November 7, 2022

<h3 id="2022-11-07-general-changes"> General changes </h3>

- The following new regions are now available for all CockroachDB {{ site.data.products.dedicated }} clusters:

    GCP                                          | AWS
    ---------------------------------------------|------
    Frankfurt, Germany (`europe-west3`)          | Osaka, Japan (`ap-northeast-3`)
                                                 | Montréal, Québec (`ca-central-1`)
                                                 | Stockholm, Sweden (`eu-north-1`)

<h3 id="2022-11-07-console-changes"> Console changes </h3>

- Added an icon next to a cluster's name on the [**Billing overview**]({% link "cockroachcloud/billing-management.md" %}) page to indicate when a cluster has been deleted.
- The [**Database page**]({% link "cockroachcloud/databases-page.md" %}) in the CockroachDB {{ site.data.products.cloud }} Console now shows the last time table statistics were updated.

<h3 id="2022-11-07-api-changes"> Cloud API changes </h3>

- The [Cloud API](https://www.cockroachlabs.com/docs/api/cloud/v1) documentation now indicates which endpoints are in preview.

<h3 id="2022-11-07-bug-fixes"> Bug fixes </h3>

- The **Sessions** link on the [**Overview**]({% link "cockroachcloud/cluster-overview-page.md" %}) page now redirects to the correct tab on the [**SQL Activity**]({% link "cockroachcloud/sessions-page.md" %}) page.
- Fixed a bug where stale data caused **Connect** modal errors immediately after creating a CockroachDB {{ site.data.products.serverless }} cluster.
- Fixed a bug where backup metadata payloads were limited to 4MiB instead of the desired 32MiB.
- Fixed a bug where the node-aggregated low disk alert was not firing.

## October 3, 2022

<h3 id="2022-10-03-bug-fixes"> Bug fixes </h3>

- The CockroachDB {{ site.data.products.cloud }} Console now utilizes the same [cluster setting](https://www.cockroachlabs.com/docs/stable/cluster-settings) as the DB Console, `sql.index_recommendation.drop_unused_duration`, as a threshold value for dropping unused indexes.
- Fixed a bug where [AWS PrivateLink]({% link "cockroachcloud/network-authorization.md" %}#aws-privatelink) endpoints could fail to create but display an error message that said they were still creating.

## September 24, 2022

<h3 id="2022-09-24-console-changes">Console changes</h3>

- You can now create a database directly from the [**Databases** page]({% link "cockroachcloud/databases-page.md" %}) of the CockroachDB {{ site.data.products.cloud }} Console.

## September 16, 2022

<h3 id="2022-09-16-console-changes">Console changes</h3>

- A tool to [estimate your monthly cost]({% link "cockroachcloud/basic-cluster-management.md" %}) based on your workload is now available for CockroachDB {{ site.data.products.serverless }} clusters.

## September 8, 2022

<h3 id="2022-09-08-console-changes"> Console changes </h3>

- Previously, when trying to remove a region from a three-region cluster, only the second and third regions were removable. Two regions must be removed at once because a two-region cluster is not a valid configuration, but users can now select any two regions to remove.
- The character limit for cluster names was raised from 20 to 40 characters.

<h3 id="2022-09-08-api-changes"> Cloud API changes </h3>

- Added the ability to create, edit, and delete a database through the [Cloud API]({% link "cockroachcloud/cloud-api.md" %}).

<h3 id="2022-09-08-bug-fixes"> Bug fixes </h3>

- In the CockroachDB {{ site.data.products.serverless }} connection dialog, the inline password input has been given a placeholder value to prevent it from interacting in unexpected ways with password managers.

## August 8, 2022

<h3 id="2022-08-08-console-changes">Console changes</h3>

- CockroachDB {{ site.data.products.dedicated }} users can now choose any of the available hardware options when [configuring a cluster]({% link "cockroachcloud/create-your-cluster.md" %}). Previously, there were restrictions based on which storage and compute combinations were recommended for best performance.
- In the [**Connect to your cluster**]({% link "cockroachcloud/connect-to-your-cluster.md" %}) dialog, your previous SQL user, database, and connection method selections are now cached to make it easier to re-connect to your cluster.

<h3 id="2022-08-08-bug-fixes">Bug fixes</h3>

- Fixed a bug where the **SQL Activity** tab for clusters running different CockroachDB versions did not always load version-appropriate UI components.
- Fixed a bug where the **Statements** table on a transaction's [**Transaction Details** page]({% link "cockroachcloud/transactions-page.md" %}) sometimes showed an incorrect number of statements.

## July 28, 2022

<h3 id="2022-07-28-general-changes">General changes</h3>

- All of your organization's [invoices]({% link "cockroachcloud/billing-management.md" %}#view-invoices) are now available on the **Billing** page.

## July 27, 2022

<h3 id="2022-07-27-console-changes">General changes</h3>

- You can now [add and remove regions]({% link "cockroachcloud/cluster-management.md" %}) from CockroachDB {{ site.data.products.dedicated }} clusters through the CockroachDB {{ site.data.products.cloud }} Console. This change makes it easier to support users in new locations or scale down your cluster.

## July 6, 2022

<h3 id="2022-07-06-console-changes">Console changes</h3>

- The [**Connect to your cluster**](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/connect-to-the-database) dialog now includes code snippets for [supported languages and tools](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/third-party-database-tools).
- The [**Connect to your cluster**]({% link "cockroachcloud/connect-to-a-basic-cluster.md" %}) dialog for clusters running CockroachDB [v22.1]({% link "releases/v22.1.md" %}) now loads more quickly.
- If users log in using an [SSO]({% link "cockroachcloud/cloud-org-sso.md" %}) method other than the one they have used previously, they will now be asked if they want to switch to the new login method.
- Previously, CockroachDB {{ site.data.products.dedicated }} users could only choose storage amounts within the [recommendations]({% link "cockroachcloud/plan-your-cluster.md" %}) for the selected machine size. Now, a warning message will appear if the storage is outside the recommended range, but any storage option can be selected.
- The date and time selection on the [**Statements**]({% link "cockroachcloud/statements-page.md" %}) and [**Transactions**]({% link "cockroachcloud/transactions-page.md" %}) pages now defaults to UTC and has an improved design.

<h3 id="2022-07-06-bug-fixes">Bug fixes</h3>

- The [**Statements** page]({% link "cockroachcloud/statements-page.md" %}) no longer crashes when a search term contains `*`.

## June 6, 2022

<h3 id="2022-06-06-general-changes">General changes</h3>

- [Datadog integration]({% link "cockroachcloud/export-metrics-advanced.md" %}) is now available on the **Monitoring** page for all CockroachDB {{ site.data.products.dedicated }} users.
- [Cloud Organization Single Sign-On (SSO)]({% link "cockroachcloud/cloud-org-sso.md" %}) for CockroachDB {{ site.data.products.cloud }} is now available with Google and Microsoft in addition to GitHub.

<h3 id="2022-06-06-console-changes">Console changes</h3>

- When creating a [SQL user]({% link "cockroachcloud/managing-access.md" %}#create-a-sql-user) or [changing a SQL user's password]({% link "cockroachcloud/managing-access.md" %}#change-a-sql-users-password), the generated password is now hidden until the user clicks **Reveal password**.

<h3 id="2022-06-06-api-changes">Cloud API changes</h3>

- Paginated [API]({% link "cockroachcloud/cloud-api.md" %}) endpoints now accept a single `page` parameter for next or previous pages. Pagination response messages now contain only two fields: `next_page` and `previous_page`, whose values can be used for the `page` field in a followup call.

## May 5, 2022

<h3 id="2022-05-05-console-changes">Console changes</h3>

- All organizations can now create [service accounts]({% link "cockroachcloud/managing-access.md" %}#manage-service-accounts) and [API keys]({% link "cockroachcloud/managing-access.md" %}#api-access), and have access to the [Cloud API]({% link "cockroachcloud/cloud-api.md" %}).
- The [`ccloud` command line tool]({% link "cockroachcloud/ccloud-get-started.md" %}) for creating, managing, and connecting to CockroachDB Cloud clusters is now in public beta.

## May 2, 2022

<h3 id="2022-05-02-console-changes">Console changes</h3>

- Added **Distributed execution** and **Vectorized execution** information to the **Overview** tab of the **Statement Details** page.
- Added `FULL SCAN` information to the **Explain plan** tab of the **Statement Details** page.
- Users without accounts can now accept invitations by creating a user using SSO-based authorization such as GitHub.
- Timeseries charts are now displayed in UTC.

<h3 id="2022-05-02-bug-fixes">Bug fixes</h3>

- Fixed broken links to the **Statement Details** page from the **Advanced Debug** and **Sessions** pages.
- Fixed a bug where regenerating a SQL user password would fail with a duplicate user warning.
- Deleted clusters will no longer be visible after they've been deleted. Previously, a full page refresh was needed to update the **Clusters** page.
- Fixed a bug that caused charges on the **Cluster overview** page to show an error state for users with the Developer role. Cluster charges are now hidden for Developers and only available to users with the Admin role.
- Fixed a bug where adding decimals to a CockroachDB {{ site.data.products.serverless }} cluster's spend limit would cause an error, but the spend limit could still be set.
- Fixed a bug where opening or closing the list of nodes on a multi-node CockroachDB {{ site.data.products.dedicated }} cluster's **Cluster overview** page would result in a duplicated row of nodes.
- Fixed a bug for credit card users where the credit card form was occasionally loading as a blank box. Now, the credit card form will always load properly without needing to refresh the page.


## April 27, 2022

<h3 id="2022-04-27-general-changes">General changes</h3>

- CockroachDB {{ site.data.products.dedicated }} contract customers can now [scale clusters]({% link "cockroachcloud/advanced-cluster-management.md" %}) through the Console.

<h3 id="2022-04-27-console-changes">Console changes</h3>

- Contract customers can now view information about their organization's credit grants on the **Overview** tab of the [**Billing** page]({% link "cockroachcloud/billing-management.md" %}).

## April 20, 2022

<h3 id="2022-04-20-console-changes">Console changes</h3>

- [SQL user passwords]({% link "cockroachcloud/managing-access.md" %}#change-a-sql-users-password) are now generated and saved automatically to simplify the connection experience.
- When [connecting to your cluster]({% link "cockroachcloud/connect-to-your-cluster.md" %}), the CA certificate download is now hidden once you have already downloaded the certificate.

<h3 id="2022-04-20-doc-changes">Documentation changes</h3>

- Improved CockroachDB {{ site.data.products.serverless }} [cluster connection]({% link "cockroachcloud/connect-to-your-cluster.md" %}) documentation, including a [third-party tool connection guide](https://www.cockroachlabs.com/docs/stable/connect-to-the-database), improved [Quickstart]({% link "cockroachcloud/quickstart.md" %}), and CRUD app examples.

## April 4, 2022

<h3 id="2022-04-04-console-changes">Console changes</h3>

- You no longer need to download a CA certificate to [connect to a CockroachDB {{ site.data.products.serverless }}]({% link "cockroachcloud/connect-to-a-basic-cluster.md" %}) cluster through the CockroachDB SQL client if your cluster is running [v21.2.5]({% link "releases/v21.2.md" %}) or later.
- When [creating a CockroachDB {{ site.data.products.dedicated }} cluster]({% link "cockroachcloud/create-your-cluster.md" %}), the approximate monthly cost is now displayed in the **Summary** sidebar along with the hourly cost.

## March 7, 2022

<h3 id="2022-03-07-console-changes">Console changes</h3>

- CockroachDB {{ site.data.products.cloud }} clusters now have a **Databases** page in the Console, which shows your databases, tables, indexes, and grants.
- When creating or editing a SQL user, passwords are now generated and saved automatically when users click the **Generate and save password** button. Previously, users had to enter passwords manually and remember to save them.
- CockroachDB {{ site.data.products.dedicated }} users can now [restore]({% link "cockroachcloud/managed-backups.md" %}) databases configured for multiple regions.

## February 10, 2022

<h3 id="2022-02-10-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.dedicated }} clusters can now be [created with custom hardware options]({% link "cockroachcloud/create-your-cluster.md" %}). Previously, there were four hardware options, and compute and storage were linked.
- CockroachDB {{ site.data.products.dedicated }} users can now scale a cluster's [compute]({% link "cockroachcloud/advanced-cluster-management.md" %}) and [storage]({% link "cockroachcloud/advanced-cluster-management.md" %}). Previously, the only way to scale up a CockroachDB {{ site.data.products.dedicated }} cluster was by adding more nodes.

<h3 id="2022-02-10-console-changes">Console changes</h3>

- There is now a **Hardware** column on the **Clusters** page that shows the hardware configuration for CockroachDB {{ site.data.products.dedicated }} clusters.

## February 7, 2022

<h3 id="2022-02-07-general-changes">General changes</h3>

- Six new regions are available for CockroachDB {{ site.data.products.serverless }} clusters:

    GCP                              | AWS
    ---------------------------------|------------
    California (`us-west2`)              | Mumbai (`ap-south-1`)
    Sao Paulo (`southamerica-east1`) | Frankfurt (`eu-central-1`)
    South Carolina (`us-east1`)      | N. Virginia (`us-east-1`)

<h3 id="2022-02-07-console-changes">Console changes</h3>

- The [**Terminate Session** and **Terminate Statement**]({% link "cockroachcloud/sessions-page.md" %}#sessions-table) options are now enabled for CockroachDB {{ site.data.products.cloud }} clusters running CockroachDB [v21.2.2]({% link "releases/v21.2.md" %}#v21-2-2) or later.
- Selecting a transaction from the [**Transactions** page]({% link "cockroachcloud/transactions-page.md" %}) now opens a new [**Transaction Details**]({% link "cockroachcloud/transactions-page.md" %}#transaction-details-page) page with an improved design.
- The order of the tabs on the **SQL Activity** page has been changed to [**Statements**]({% link "cockroachcloud/statements-page.md" %}), [**Transactions**]({% link "cockroachcloud/transactions-page.md" %}), and [**Sessions**]({% link "cockroachcloud/sessions-page.md" %}).

<h3 id="2022-02-07-bug-fixes">Bug fixes</h3>

- Fixed a number of broken links throughout the CockroachDB {{ site.data.products.cloud }} Console.
- Fixed a bug where CockroachDB {{ site.data.products.serverless }} users were seeing occasional dips and spikes in a cluster's [**Request Units**]({% link "cockroachcloud/cluster-overview-page.md" %}#request-units) usage graph while running a steady workload.

## January 10, 2022

<h3 id="2022-01-10-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.dedicated }} clusters will now run [v21.2.3]({% link "releases/v21.2.md" %}#v21-2-3).
- CockroachDB {{ site.data.products.serverless }} clusters will now run CockroachDB [v21.2.0-beta.4]({% link "releases/v21.2.md" %}#v21-2-0-beta-4).
- The CockroachDB documentation navigation is now organized by user task instead of by product for CockroachDB {{ site.data.products.serverless }}, CockroachDB {{ site.data.products.dedicated }}, and CockroachDB {{ site.data.products.core }} v21.2. Topics specific to Serverless and Dedicated clusters are within the new top-level user task categories. CockroachDB {{ site.data.products.cloud }} release notes are under Reference.

<h3 id="2022-01-10-console-changes">Console changes</h3>

- The [**Billing**]({% link "cockroachcloud/billing-management.md" %}) page is now separated into two tabs, **Overview** and **Payment Details**.

## December 6, 2021

<h3 id="2021-12-06-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.dedicated }} clusters will now run [v21.2.1]({% link "releases/v21.2.md" %}#v21-2-1).
- CockroachDB {{ site.data.products.serverless }} clusters will now run CockroachDB [v21.2.0-beta.4]({% link "releases/v21.2.md" %}#v21-2-0-beta-4).
- New CockroachDB {{ site.data.products.cloud }} clusters will now have [Admission Control](https://www.cockroachlabs.com/docs/v21.2/architecture/admission-control) enabled by default.

<h3 id="2021-12-06-console-changes">Console changes</h3>

- The **Add/remove nodes** button is now disabled for custom clusters. If you are a contract customer and would like to scale your custom cluster, [contact Support](https://support.cockroachlabs.com/).

<h3 id="2021-12-06-bug-fixes">Bug fixes</h3>

- Fixed a bug where an error was occurring on the [VPC Peering and AWS PrivateLink]({% link "cockroachcloud/network-authorization.md" %}) pages for clusters with a large number of jobs.
- Fixed a bug where the **Test email alerts** section on the [**Alerts** page]({% link "cockroachcloud/alerts-page.md" %}) was not visible for organizations with only custom clusters.
- Fixed a bug where users were prompted to upgrade CockroachDB {{ site.data.products.serverless }} clusters, which are [upgraded automatically]({% link "cockroachcloud/upgrade-policy.md" %}).
- Previously, [SQL metrics graphs]({% link "cockroachcloud/cluster-overview-page.md" %}) for inactive CockroachDB {{ site.data.products.serverless }} clusters showed discontinuous time series lines or an error message. Continuous graphs will now remain available for scaled-down clusters.

## November 8, 2021

<h3 id="2021-11-08-general-changes">General changes</h3>

- [CockroachDB {{ site.data.products.serverless }}](https://www.cockroachlabs.com/blog/announcing-cockroachdb-serverless/), a fully-managed, auto-scaling deployment of CockroachDB, is now available. To get started with CockroachDB {{ site.data.products.serverless }} for free, see the [Quickstart]({% link "cockroachcloud/quickstart.md" %}).
- CockroachDB {{ site.data.products.cloud }} Free (beta) and CockroachDB {{ site.data.products.cloud }} are now CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}, respectively. Your ability to use your cluster will not be affected.
- CockroachDB {{ site.data.products.serverless }} clusters will now run CockroachDB [v21.2.0-beta.4]({% link "releases/v21.2.md" %}#v21-2-0-beta-4).
- New CockroachDB {{ site.data.products.dedicated }} clusters will now run CockroachDB [v21.1.11]({% link "releases/v21.1.md" %}#v21-1-11).

<h3 id="2021-11-08-console-changes">Console changes</h3>

- The [**Statements**]({% link "cockroachcloud/statements-page.md" %}), [**Transactions**]({% link "cockroachcloud/transactions-page.md" %}), and [**Sessions**]({% link "cockroachcloud/sessions-page.md" %}) pages are now available for CockroachDB {{ site.data.products.serverless }} clusters on the **SQL Activity** page.
- Statements and transaction statistics are now retained longer for all clusters.
- Legends are now displayed by default for time-series graphs on the [Cluster Overview]({% link "cockroachcloud/cluster-overview-page.md" %}#cluster-overview-metrics) page.
- The **Transaction retries** metric is no longer part of the **Current activity** panel on the CockroachDB {{ site.data.products.serverless }} [Cluster Overview]({% link "cockroachcloud/cluster-overview-page.md" %}#current-activity-panel) page.
- Deleting an organization with outstanding charges that have not been billed is now prohibited.
- There is now a more clear error message for users attempting to log into CockroachDB {{ site.data.products.cloud }} using GitHub when they have email and password authentication configured.
- Average RU usage is now shown in the **Request Units** chart for the CockroachDB {{ site.data.products.serverless }} [Cluster Overview]({% link "cockroachcloud/cluster-overview-page.md" %}#request-units) page.
- The PowerShell command to [download the CockroachDB binary](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster?filters=windows#connect-to-your-cluster) is now improved for Windows users.
- When under 1 GiB of storage has been used, storage is now shown in MiB instead of GiB in the **Storage used** graph on the CockroachDB {{ site.data.products.serverless }} [Cluster Overview]({% link "cockroachcloud/cluster-overview-page.md" %}#storage-used) page.
- A more descriptive error message is now displayed when attempting to create or edit a [SQL user]({% link "cockroachcloud/managing-access.md" %}#manage-sql-users-on-a-cluster) with an invalid username.
- Previously, clicking **cancel** while editing a cluster would take users back to the **Clusters** page. Now, users are taken back to the cluster's **Overview** page.

<h3 id="2021-11-08-bug-fixes">Bug fixes</h3>

- Fixed a bug where, if a user had reached the maximum number of CockroachDB {{ site.data.products.serverless }} clusters and refreshed the **Create your cluster** page, the CockroachDB {{ site.data.products.serverless }} plan was auto-selected even though it is disabled.
- Fixed a bug where clicking **Cancel** while logging in with GitHub would report and internal error.
- Fixed a bug where organization deletion was temporarily broken.
- Fixed a bug that was preventing the **Request Units** and **SQL Statements** graphs on the CockroachDB {{ site.data.products.serverless }} [Cluster Overview]({% link "cockroachcloud/cluster-overview-page.md" %}#cluster-overview-metrics) page from updating after a certain amount of time.

## October 4, 2021

<h3 id="2021-10-04-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v21.1.9]({% link "releases/v21.1.md" %}#v21-1-9).

<h3 id="2021-10-04-bug-fixes">Bug fixes</h3>

- Fixed an error in the connection string for Windows users [connecting to CockroachDB {{ site.data.products.cloud }} Free (beta)]({% link "cockroachcloud/connect-to-a-basic-cluster.md" %}) clusters.

<h3>Miscellaneous changes</h3>

- Cluster names are now included in cluster creation email alerts.

## September 7, 2021

<h3 id="2021-09-07-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v21.1.7]({% link "releases/v21.1.md" %}#v21-1-7).

<h3 id="2021-09-07-general-changes">Console changes</h3>

- All pages shown to logged out users are now optimized for mobile devices.

- Improved the error message when an [AWS PrivateLink]({% link "cockroachcloud/network-authorization.md" %}#aws-privatelink) endpoint request fails.

<h3 id="2021-09-07-general-changes">Bug fixes</h3>

- Fixed tooltip behavior on **Sessions**, **Statements**, and **Transactions** pages.

- Fixed a bug where clicking on the label of the [Terms of Service](https://www.cockroachlabs.com/cloud-terms-and-conditions/) checkbox would select the Terms of Service checkbox when signing up with GitHub.

## August 9, 2021

<h3 id="2021-08-09-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v21.1.6]({% link "releases/v21.1.md" %}#v21-1-6).
- CockroachDB {{ site.data.products.cloud }} Free (beta) users can now perform [backups]({% link "cockroachcloud/take-and-restore-self-managed-backups.md" %}) (`IMPORT`, `BACKUP`, `RESTORE` and CDC) with `userfile` storage.

<h3 id="2021-08-09-console-changes">Console changes</h3>

- Improved user experience on the Cluster Overview page for a deleted cluster.
- Improved error message for cluster upgrade failures.
- SQL-related restore errors are now shown in the Console, allowing users to take action.

<h3 id="2021-08-09-security-changes">Security changes</h3>

- Password reset tokens will now expire after 24 hours.
- Email change tokens are now single use and will expire.
- Email change links are now revoked during certain user events such as password resets.
- Resetting the password of a SQL user no longer grants that user the admin SQL role.

## June 7, 2021

<h3 id="2021-07-07-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v21.1.1]({% link "releases/v21.1.md" %}#v21-1-1).

<h3 id="2021-07-07-console-changes">Console changes</h3>

- All CockroachDB {{ site.data.products.cloud }} Dedicated users now have access to the [**Statements**]({% link "cockroachcloud/statements-page.md" %}) and [**Sessions**]({% link "cockroachcloud/sessions-page.md" %}) pages in the Console.
- All CockroachDB {{ site.data.products.cloud }} Dedicated users now have access to the [**Alerts**]({% link "cockroachcloud/alerts-page.md" %}) page in the Console, which allows you to toggle alerts, send test alerts, and manage alert recipients for your Organization.
- Previously, users were getting stuck during the verification step of creating an [AWS PrivateLink]({% link "cockroachcloud/network-authorization.md" %}#aws-privatelink) endpoint. Now, users can enter the verification step of the **Add Endpoint Connection** dialog with an incomplete connection endpoint ID preset.
- Added a **Cloud** column to the **Clusters** page so users can see which cloud provider any cluster is using without having to click through to the **Cluster Overview** page.
- The maximum number of nodes in a cluster created through the Console was raised to 50 nodes per region and 150 nodes per cluster.

<h3 id="2021-07-07-bug-fixes">Bug fixes</h3>

- Fixed a bug where clicking the **Logout** button would trigger an error and display a blank page.
- The page will no longer refresh after switching the authentication method through the **Account** page.
- Switching organizations will no longer log you out of all sessions.

## July 6, 2021

<h3 id="2021-07-06-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v21.1.5]({% link "releases/v21.1.md" %}#v21-1-5).
- Starting this month, paid CockroachDB {{ site.data.products.cloud }} clusters will be billed monthly instead of every two weeks.

<h3 id="2021-07-06-console-changes">Console changes</h3>

- Multi-region clusters can now be created through the Console. To learn more about creating a multi-region cluster, see [Planning your cluster]({% link "cockroachcloud/plan-your-cluster.md" %}).
- The **Connect** modal now has updated commands to make [connecting to your cluster]({% link "cockroachcloud/connect-to-a-basic-cluster.md" %}) a smoother experience on Mac, Linux, and Windows.
- All CockroachDB {{ site.data.products.cloud }} users now have access to the [**Transactions** page]({% link "cockroachcloud/transactions-page.md" %}) in the Console.
- Navigation on the **Clusters** page is now a vertical sidebar instead of horizontal tabs.
- Added a tooltip to the **Upgrade** option in the **Action** Menu, which gives users more version-specific context.
- Users can now **Clear SQL Stats** from the [**Statements** page]({% link "cockroachcloud/statements-page.md" %}) for clusters running [v21.1.3]({% link "releases/v21.1.md" %}#v21-1-3) or later.

<h3 id="2021-07-06-bug-fixes">Bug fixes</h3>

- Fixed a bug where clicking on the [**Alerts** page]({% link "cockroachcloud/alerts-page.md" %}) broke the Organization header for users with multiple Organizations.
- Fixed a bug where nodes were cycling in clusters running [v21.1.4]({% link "releases/v21.1.md" %}#v21-1-4).
- Fixed several broken links to documentation throughout the Console.
- Users will no longer see alerts for clusters that are not in a **ready** state.
- Fixed a bug that was causing users to receive false positive CPU alerts.

## May 3, 2021

<h3 id="2021-05-01-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.8]({% link "releases/v20.2.md" %}#v20-2-8).
- [CockroachDB {{ site.data.products.cloud }} Free]({% link "cockroachcloud/quickstart.md" %}) clusters are now available in four additional regions:
    - GCP: `europe-west1`, `asia-southeast1`
    - AWS: `eu-west-1`, `ap-southeast-1`

<h3 id="2021-05-01-console-changes">Console changes</h3>

- New users can now [sign up]({% link "cockroachcloud/create-an-account.md" %}) for CockroachDB {{ site.data.products.cloud }} with Github Authorization. Logging in with GitHub allows users to enforce [GitHub's two-factor authentication (2FA)](https://docs.github.com/github/authenticating-to-github/securing-your-account-with-two-factor-authentication-2fa) on their CockroachDB {{ site.data.products.cloud }} account. Current users can [switch their login method]({% link "cockroachcloud/create-an-account.md" %}#change-your-login-method) between email and GitHub.
- When logging in fails due to user input, the error message now includes [login method]({% link "cockroachcloud/create-an-account.md" %}#change-your-login-method) as a potential reason for failure.
- Previously, selecting a new cloud provider while [creating a cluster]({% link "cockroachcloud/create-your-cluster.md" %}) would reset the **Region** and **Hardware per node** options to default. Now, equivalent region and hardware options are preselected, and the number of nodes per region is preserved when a new cloud provider is selected.

<h3 id="2021-05-01-bug-fixes">Bug fixes</h3>

- **Contact Us** links now direct users to the [customer support portal](https://support.cockroachlabs.com/) instead of the user's mail app.

## April 5, 2021

<h3 id="2021-04-05-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.7]({% link "releases/v20.2.md" %}#v20-2-7).

<h3 id="2021-04-05-console-changes">Console changes</h3>

- The [login form](https://cockroachlabs.cloud/login) no longer focuses on the email field on page load. This change makes the form more flexible once other authentication methods are available.
- Extraneous information is no longer displayed in the error for failed [GCP peering]({% link "cockroachcloud/network-authorization.md" %}#vpc-peering) attempts.
- Added a resource panel to the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud), which can be accessed by clicking the **?** icon in the top right corner of the Console. Included in the resource panel are links to relevant documentation, Cockroach University, the CockroachDB Slack community, and much more.
- Created a new [Status Page](https://status.cockroachlabs.cloud) that displays the current service status and incident communication of the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud), AWS services, and GCP services.

<h3 id="2021-04-05-bug-fixes">Bug fixes</h3>

- The region shown in the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) for free-tier clusters is now correct. Previously, the Console showed the wrong region when creating an AWS free-tier cluster.
- Fixed a bug where an error occurred when displaying the **Connect** modal for an old GCP cluster that does not have the custom `crdb` network. These clusters do not support VPC peering, but the lack of the `crdb` network was causing the listing of VPC peerings to fail even though no such peerings exist.

## March 8, 2021

<h3 id="2021-03-08-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.5]({% link "releases/v20.2.md" %}#v20-2-5).

<h3 id="2021-03-08-console-changes">Console changes</h3>

- Self-service [AWS PrivateLink]({% link "cockroachcloud/network-authorization.md" %}#aws-privatelink) is now generally available for CockroachDB {{ site.data.products.cloud }} clusters running on AWS.
- On the [**Clusters** page]({% link "cockroachcloud/cluster-management.md" %}#view-clusters-page), clusters that are running unsupported versions now have a warning in the **Version** column.

<h3 id="2021-03-08-security-changes">Security changes</h3>

- CockroachDB {{ site.data.products.cloud }} now does not include the supplied password in error messages that arise from resetting, editing, or creating a password when the password is too short.
- CockroachDB {{ site.data.products.cloud }} now prevents clickjacking attacks by specifying `X-Frame-Options: DENY` when serving `index.html`.

<h3 id="2021-03-08-bug-fixes">Bug fixes</h3>

- Previously, users who were not a member of any organization would get an error when trying to reset their password. A user would most likely encounter this scenario if they deleted their organization, tried to log in again, and didn't remember their password. Now, an organization will be created for the user if one does not exist. The [organization name can be edited]({% link "cockroachcloud/create-an-account.md" %}#change-your-organization-name) on the **Settings** tab on the organization's landing page.


## February 9, 2021

<h3 id="2021-02-09-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.4]({% link "releases/v20.2.md" %}#v20-2-4).

- CockroachDB {{ site.data.products.cloud }} Free is now in beta. CockroachDB {{ site.data.products.cloud }} Free (beta) delivers free CockroachDB clusters for you and your organization. It is a managed instance of CockroachDB that removes the friction of initial cluster sizing and auto-scales based on your application traffic. There is an upper limit of usage of up to 1 vCPU and 5GB storage per free cluster.

    You can submit feedback or log any bugs you find through [this survey](https://forms.gle/jWNgmCFtF4y15ePw5).

- You can now [restore databases and tables]({% link "cockroachcloud/managed-backups.md" %}) from backups of CockroachDB {{ site.data.products.cloud }} clusters. This feature is only available to clusters running the paid version of CockroachDB {{ site.data.products.cloud }}.
- [reCAPTCHA](https://www.google.com/recaptcha/about/) has been added to the sign up process for new users signing up with an email and password. Some users may need to complete an image challenge.
- An email will now be sent to [Organization Admins]({% link "cockroachcloud/authorization.md" %}#organization-admin) when a [30-day free trial of CockroachDB {{ site.data.products.cloud }}]({% link "cockroachcloud/quickstart-trial-cluster.md" %}) is nearing its end and once it has expired.

## January 22, 2021

<h3 id="2021-02-22-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.3]({% link "releases/v20.2.md" %}#v20-2-3).

<h3 id="2021-02-22-bug-fixes">Bug fixes</h3>

- Fixed a bug where deleting your only organization would prevent your email from being used for a new organization in the future.
- Fixed a bug where [VPC peering]({% link "cockroachcloud/network-authorization.md" %}#vpc-peering) appeared to be available on clusters that it wasn't supported on.

## December 11, 2020

<h3 id="2020-12-11-general-changes">General changes</h3>

New clusters will now run CockroachDB [v20.2.2]({% link "releases/v20.2.md" %}#v20-2-2).

- CockroachDB {{ site.data.products.cloud }} is now offering [larger machine sizes]({% link "cockroachcloud/create-your-cluster.md" %}#step-2-select-the-cloud-provider) to be configured directly in the Console. You will now be able to select from four options in the create cluster workflow. The [pricing has also been updated]({% link "cockroachcloud/create-your-cluster.md" %}#step-2-select-the-cloud-provider) for newly created clusters. Existing clusters are not impacted by the pricing changes.

## November 19, 2020

<h3 id="2021-11-19-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.0]({% link "releases/v20.2.md" %}#v20-2-0).

- [Create a 30-day free CockroachDB {{ site.data.products.cloud }} cluster]({% link "cockroachcloud/quickstart.md" %}).
- [Add or remove nodes]({% link "cockroachcloud/advanced-cluster-management.md" %}#add-or-remove-nodes-from-a-cluster) through the CockroachDB {{ site.data.products.cloud }} Console.
- [Set up VPC peering]({% link "cockroachcloud/network-authorization.md" %}) for clusters running on GCP.
- [View backups]({% link "cockroachcloud/managed-backups.md" %}) that Cockroach Labs has taken for your CockroachDB {{ site.data.products.cloud }} cluster.

## July 6, 2020

<h3 id="2020-07-06-general-changes">General changes</h3>

- You can now update your email address and password in your profile.

<h3 id="2020-07-06-console-changes">Console changes</h3>
You can now [add or remove nodes]({% link "cockroachcloud/advanced-cluster-management.md" %}#add-or-remove-nodes-from-a-cluster) from your cluster through the Console.

{{site.data.alerts.callout_info}}
At this time, you cannot use the Console to scale up a single-node cluster or scale down to a single-node cluster. For these changes, contact [Support](https://support.cockroachlabs.com).
{{site.data.alerts.end}}

## June 11, 2020

<h3 id="2020-06-11-general-changes">General changes</h3>

- You can now create a 30-day free CockroachDB {{ site.data.products.cloud }} cluster using the code `CRDB30`. The [Quickstart guide]({% link "cockroachcloud/quickstart.md" %}) shows you how to create and connect to your free cluster and run your first query.

- You can now edit your name in your profile.

## May 4, 2020

<h3 id="2020-05-04-general-changes">General changes</h3>

- Updated the layout of the <a href="https://cockroachlabs.cloud/signup?referralId=docs_cc_release_notes" rel="noopener" target="_blank">Sign up</a> page.
- [CockroachDB {{ site.data.products.cloud }} Organization Admins]({% link "cockroachcloud/authorization.md" %}#organization-admin) can now [update their {{ site.data.products.cloud }} organization's name](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#organization).
- [CockroachDB {{ site.data.products.cloud }} Organization Admins]({% link "cockroachcloud/authorization.md" %}#organization-admin) can now [delete their {{ site.data.products.cloud }} Organization](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#organization).

## April 6, 2020

<h3 id="2020-04-06-general-changes">General changes</h3>

- Free trials of CockroachDB {{ site.data.products.cloud }} are now available. [Contact us](https://www.cockroachlabs.com/contact-sales/) to request a trial code.
- CockroachDB {{ site.data.products.cloud }} now supports VPC peering for clusters running on GCP. [Contact us](https://support.cockroachlabs.com/hc/en-us) to set up a VPC peering-enabled CockroachDB {{ site.data.products.cloud }} cluster.

<h3 id="2020-04-06-security-changes">Security changes</h3>

CockroachDB {{ site.data.products.cloud }} now requires a user to have a CockroachDB {{ site.data.products.cloud }} account before accepting an invite to join an Organization.

- The hardware options displayed while [creating a cluster]({% link "cockroachcloud/create-your-cluster.md" %}) have been renamed as "Option 1" and "Option 2".
- CockroachDB {{ site.data.products.cloud }} users who are not a member of an existing Organization can now create an Organization when they log into the CockroachDB {{ site.data.products.cloud }} Console.

<h3 id="2020-04-06-doc-changes">Doc changes</h3>

- Documented the [upgrade policy]({% link "cockroachcloud/upgrade-policy.md" %}) for CockroachDB upgrades for CockroachDB {{ site.data.products.cloud }} clusters.

## March 2, 2020

<h3 id="2020-03-02-general-changes">General changes</h3>

- CockroachDB {{ site.data.products.cloud }} pricing is now available on the [pricing page](https://www.cockroachlabs.com/pricing/).
- CockroachDB {{ site.data.products.cloud }} clusters running CockroachDB v19.2 have been upgraded to v19.2.4. All new clusters will now be created with CockroachDB v19.2.4.
- CockroachDB {{ site.data.products.cloud }} now offers two options for per-node hardware configuration instead of three options. The hardware configuration [pricing]({% link "cockroachcloud/create-your-cluster.md" %}#step-2-select-the-cloud-provider) has been updated accordingly.
- Added a **Sign up** link to the [CockroachDB {{ site.data.products.cloud }} **Log In** page](https://cockroachlabs.cloud/).
- While [creating a new cluster]({% link "cockroachcloud/create-your-cluster.md" %}), you can now type in the number of nodes you want in the cluster instead of having to click the `+` sign repeatedly.
- The [**Create cluster**]({% link "cockroachcloud/create-your-cluster.md" %}) page now displays the estimated hourly cost instead of the monthly cost.
- Removed the cluster creation banner displayed at the top of the [**Clusters page**]({% link "cockroachcloud/cluster-management.md" %}#view-clusters-page).
- CockroachDB {{ site.data.products.cloud }} now alphabetically sorts the nodes on a [**Cluster Overview page**]({% link "cockroachcloud/cluster-management.md" %}#view-cluster-overview).
- CockroachDB {{ site.data.products.cloud }} no longer displays IOPS per node on the [**Create cluster**]({% link "cockroachcloud/create-your-cluster.md" %}) page.
- Billing periods are now displayed in the UTC timezone.
- If you are the only Admin for a CockroachDB {{ site.data.products.cloud }} Organization, you can no longer change your role to Developer. Assign another user as Admin and then change your role to Developer.

<h3 id="2020-03-02-security-changes">Security changes</h3>

- CockroachDB {{ site.data.products.cloud }} now requires that the password for a SQL user is at least 12 characters in length.
- CockroachDB {{ site.data.products.cloud }} now allows you to download the cluster's CA certificate directly from the shell instead of restricting the download functionality to a web browser.

<h3 id="2020-03-02-bug-fixes">Bug fixes</h3>

- Fixed a bug where all organizations with billing enabled and without a billing email address were assigned an internal Cockroach Labs email address.
- CockroachDB {{ site.data.products.cloud }} no longer displays an error message if the internal feature flag for billing is disabled for all organizations.
- Fixed a bug that required users to update their email address on updating their billing address.
- Names of deleted clusters can now be reused for new clusters.

<h3 id="2020-03-02-doc-changes">Doc changes</h3>

- Added language-specific connection string examples to the [Connect to your cluster]({% link "cockroachcloud/connect-to-your-cluster.md" %}) document.
- Added a tutorial on [streaming an enterprise changefeed from CockroachDB {{ site.data.products.cloud }} to Snowflake]({% link "cockroachcloud/stream-changefeed-to-snowflake-aws.md" %}).
- Added a tutorial on [developing and deploying a multi-region web application](https://www.cockroachlabs.com/docs/v20.1/multi-region-overview).

{% comment %}Add new entries to the TOP of the file (not here) in reverse chronological order{% endcomment %}
