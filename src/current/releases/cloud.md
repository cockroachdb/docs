---
title: CockroachDB Cloud Releases
summary: Changelog for CockroachDB Cloud.
toc: true
toc_not_nested: true
docs_area: releases
---

CockroachDB {{ site.data.products.cloud }} supports the latest major version of CockroachDB and the version immediately preceding it. For more information, see the [CockroachDB {{ site.data.products.cloud }} Upgrade Policy](https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy).

For details on features that are not supported in CockroachDB {{ site.data.products.serverless }}, see [Unsupported Features in CockroachDB {{ site.data.products.serverless }}](https://www.cockroachlabs.com/docs/cockroachcloud/serverless-unsupported-features).

Get future release notes emailed to you:

{% include marketo.html formId=1083 %}

## July 19, 2024

<h3 id="2024-07-19-general-updates"> General updates </h3>

- CockroachDB {{ site.data.products.cloud }} is now available as a pay-as-you-go offering on the AWS Marketplace. This allows AWS customers to pay for CockroachDB Cloud charges via their AWS accounts, with no up-front commitments. For more detail, refer to:
  - [CockroachDB (pay-as-you-go)](https://aws.amazon.com/marketplace/pp/prodview-n3xpypxea63du) on AWS Marketplace.
  - [Subscribe through AWS Marketplace]({% link cockroachcloud/billing-management.md %}?filters=marketplace#subscribe-through-aws-marketplace) in the CockroachDB {{ site.data.products.cloud }} documentation.

## July 18, 2024

<h3 id="2024-07-18-security-updates"> Security updates </h3>

- The maximum number of [IP allowlist]({% link cockroachcloud/network-authorization.md %}#ip-allowlisting) entries has increased from 7 to 20 for CockroachDB {{ site.data.products.dedicated }} on AWS.

## June 26, 2024

<h3 id="2024-06-26-general-updates"> General updates </h3>

- The `qatarcentral` (Doha) region has been disabled for CockroachDB {{ site.data.products.dedicated }} clusters on Azure due to capacity issues. To express interest in this region, contact your account team.

## June 17, 2024

<h3 id="2024-06-17-security-updates"> Security updates </h3>

- The [IdP-initiated SAML flow]({% link cockroachcloud/cloud-org-sso.md %}#cloud-organization-sso) is now enabled by default. When you configure a [Cloud Organization SSO SAML connection]({% link cockroachcloud/configure-cloud-org-sso.md %}#saml), your users can optionally sign in to CockroachDB {{ site.data.products.cloud }} directly from your IdP, such as by using a tile in Okta.

## June 14, 2024

<h3 id="2024-06-14-general-updates"> General updates </h3>

- Deletion protection, which helps to prevent a cluster in CockroachDB {{ site.data.products.cloud }} from being deleted by mistake, is generally available for CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }} clusters. A user with permission to delete a cluster can enable deletion protection for the cluster. Refer to the instructions for [CockroachDB {{ site.data.products.serverless }}]({% link cockroachcloud/serverless-cluster-management.md %}#enable-deletion-protection) and [CockroachDB {{ site.data.products.dedicated }}]({% link cockroachcloud/cluster-management.md %}#enable-deletion-protection).

## June 12, 2024

<h3 id="2024-06-12-general-updates"> General updates </h3>

- CockroachDB {{ site.data.products.dedicated }} on AWS is now available in new [regions]({% link cockroachcloud/regions.md %}?filters=dedicated#aws-regions):
    - `ap-east-1` (Hong Kong)
    - `ap-southeast-3` (Jakarta)
    - `ca-west-1` (Calgary)
    - `eu-south-1` (Milan)
    - `il-central-1` (Tel Aviv)
    - `me-south-1` (Bahrain)

<h3 id="2024-06-12-security-updates"> Security updates </h3>

- [Configuring private connectivity using Azure Private Link]({% link cockroachcloud/connect-to-your-cluster.md %}#azure-private-link) is available in [preview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) for CockroachDB {{ site.data.products.dedicated }} clusters on Azure. [Private connectivity]({% link cockroachcloud/network-authorization.md %}#options-for-controlling-network-access) allows you to establish SQL access to a CockroachDB {{ site.data.products.dedicated }} cluster entirely through cloud provider private infrastructure, without exposing the cluster to the public internet, affording enhanced security and performance.

## May 20, 2024

<h3 id="2024-05-20-general-updates"> General updates </h3>

- CockroachDB v24.1 is now generally available for CockroachDB {{ site.data.products.dedicated }}, and is scheduled to be made available for CockroachDB {{ site.data.products.core }} on June 3, 2024{% comment %}Verify{% endcomment %}. For more information, refer to [Create a CockroachDB Dedicated Cluster]({% link cockroachcloud/create-your-cluster.md %}) or [Upgrade to CockroachDB v24.1]({% link cockroachcloud/upgrade-to-v24.1.md %}).
- CockroachDB {{ site.data.products.dedicated }} on AWS is now available in the `me-central-1`(United Arab Emirates) [ region]({% link cockroachcloud/regions.md %}#aws-regions).
- CockroachDB {{ site.data.products.dedicated }} on GCP is now available in new [regions]({% link cockroachcloud/regions.md %}#gcp-regions):
    - `europe-southwest1` (Madrid)
    - `europe-west8` (Milan)
    - `europe-west12` (Paris)
    - `me-central1` (Doha)
    - `me-west1` (Tel Aviv)
    - `us-east5` (Columbus)
    - `us-south1` (Dallas)

<h3 id="2024-05-20-security-updates"> Security updates </h3>

- [Configuring private connectivity using Google Cloud Private Service Connect]({% link cockroachcloud/connect-to-your-cluster.md %}#gcp-private-service-connect) is available in [preview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) for CockroachDB {{ site.data.products.dedicated }} clusters on GCP. [Private connectivity]({% link cockroachcloud/network-authorization.md %}#options-for-controlling-network-access) allows you to establish SQL access to a CockroachDB {{ site.data.products.dedicated }} cluster entirely through cloud provider private infrastructure, without exposing the cluster to the public internet, affording enhanced security and performance.

## May 12, 2024

<h3 id="2024-05-12-security-updates"> Security updates </h3>

- [Folders]({% link cockroachcloud/folders.md %}) are now available in [preview](https://www.cockroachlabs.com/docs/stable/cockroachdb-feature-availability).
- The initial [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) is now automatically assigned the [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin) role.
- A [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin) can now view all users and service accounts.

## April 18, 2024

<h3 id="2024-04-18-general-updates"> General updates </h3>

- CockroachDB {{ site.data.products.dedicated }} clusters on Azure can now be created in the following [regions]({% link cockroachcloud/regions.md %}):

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

- [CockroachDB v24.1.0-beta.1](https://www.cockroachlabs.com/docs/releases/v24.1#v24-1-0-beta-1) is available to CockroachDB {{ site.data.products.dedicated }} clusters as a Pre-Production Preview release for testing and experimentation. An [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. To learn more, refer to [Upgrade to v24.1 Pre-Production Preview]({% link cockroachcloud/upgrade-to-v24.1.md %}) and the [CockroachDB {{ site.data.products.cloud }} Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

## April 9, 2024

<h3 id="2024-04-09-security-updates"> Security updates </h3>

- The `paths` field of an [Egress Perimeter Control]({% link cockroachcloud/egress-perimeter-controls.md %}) egress rule is now deprecated and will be removed in the future. The CockroachDB {{ site.data.products.cloud }} API ignores this field and applies an egress rule to all egress requests to the specified network destination.

## March 20, 2024

<h3 id="2024-03-20-security-updates"> Security updates </h3>

- All CockroachDB {{ site.data.products.cloud }} organizations have been migrated to use [fine-grained roles](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles). The following deprecated legacy roles have been removed:
    - Org Administrator (Legacy)
    - Org Developer (Legacy)

## March 19, 2024

<h3 id="2024-03-19-general-updates"> General updates </h3>

- You can now use the CockroachDB {{ site.data.products.cloud }} Console to [add or remove regions](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#add-or-remove-regions-from-a-cluster) for an existing CockroachDB {{ site.data.products.dedicated }} cluster on Azure.

## March 8, 2024

<h3 id="2024-03-08-general-updates"> General updates </h3>

- You can now add or remove regions from an existing CockroachDB {{ site.data.products.dedicated }} cluster on Azure, rather than only during cluster creation.

## February 6, 2024

<h3 id="2024-02-06-general-updates"> General updates </h3>

- Folder names can now include apostrophes. For details about folder naming, refer to [Folder Naming]({% link cockroachcloud/folders.md %}#folder-naming).

## February 5, 2024

<h3 id="2024-02-05-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.dedicated }} clusters now have a [**Metrics** page]({% link cockroachcloud/metrics-page.md %}) in the Console with charts to **Monitor SQL Activity** and **Identify SQL Problems**. On the **Metrics** page, a **Custom** tab takes you to the [**Custom Metrics Chart** page]({% link cockroachcloud/custom-metrics-chart-page.md %}) (available in [preview]({% link {{site.current_cloud_version}}/cockroachdb-feature-availability.md %})) where you can create custom charts showing the time series data for an available metric or combination of metrics.

## January 29, 2024

<h3 id="2024-01-29-general-updates"> General updates </h3>

- CockroachDB {{ site.data.products.dedicated }} clusters now [export metrics]({% link cockroachcloud/export-metrics.md %}#the-metricexport-endpoint) to third-party monitoring tool [Prometheus]({% link cockroachcloud/export-metrics.md %}?filters=prometheus-metrics-export). This feature is available in [preview]({% link {{site.current_cloud_version}}/cockroachdb-feature-availability.md %}).

## January 25, 2024

<h3 id="2024-01-17-general-updates"> General updates </h3>

- The single-page CockroachDB Cloud [Create cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-a-serverless-cluster) and [Edit cluster](https://www.cockroachlabs.com/docs/cockroachcloud/serverless-cluster-management) have been updated to use multi-step wizards.

## January 17, 2024

<h3 id="2024-01-17-general-updates"> General updates </h3>

- CockroachDB v23.2 is now generally available for CockroachDB {{ site.data.products.dedicated }}, and is scheduled to be made available for CockroachDB {{ site.data.products.core }} on February 5, 2024. For more information, refer to [Create a CockroachDB Dedicated Cluster]({% link cockroachcloud/create-your-cluster.md %}) or [Upgrade to CockroachDB v23.2]({% link cockroachcloud/upgrade-to-v23.2.md %}).

## December 21, 2023

<h3 id="2023-12-21-general-updates"> General updates </h3>

- [CockroachDB v23.2.0-rc.1](https://www.cockroachlabs.com/docs/releases/v23.2#v23-2-0-rc-1) is available to CockroachDB {{ site.data.products.dedicated }} clusters as a Pre-Production Preview release for testing and experimentation. An [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. For clusters previously upgraded to the v23.2.0-beta.3 Pre-Production Preview release, v23.2.0-rc.1 will be applied automatically as a patch upgrade unless you choose to manually upgrade. To learn more, refer to [Upgrade to v23.2 Pre-Production Preview]({% link cockroachcloud/upgrade-to-v23.2.md %}) and the [CockroachDB {{ site.data.products.cloud }} Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

## December 19, 2023

<h3 id="2023-12-19-general-updates"> General updates </h3>

- [CockroachDB v23.2.0-beta.3](https://www.cockroachlabs.com/docs/releases/v23.2#v23-2-0-beta-3) is available to CockroachDB {{ site.data.products.dedicated }} clusters as a Pre-Production Preview release for testing and experimentation. An [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can upgrade your CockroachDB {{ site.data.products.dedicated }} cluster from the CockroachDB {{ site.data.products.cloud }} Console. To learn more, refer to [Upgrade to v23.2 Pre-Production Preview]({% link cockroachcloud/upgrade-to-v23.2.md %}) and the [CockroachDB {{ site.data.products.cloud }} Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

## December 14, 2023

<h3 id="2023-12-14-security-updates"> Security updates </h3>

- Organizations enrolled in [CockroachDB {{ site.data.products.cloud }} Folders (Limited Access)](https://cockroachlabs.com/docs/cockroachcloud/folders) can now use the CockroachDB {{ site.data.products.cloud }} Console to create and manage access to folders and clusters, in addition to the [CockroachDB {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) and the [Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) v1.1.0 or above. To learn more, refer to [Organize CockroachDB Cloud Clusters Using Folders]({% link cockroachcloud/folders.md %}).

## November 29, 2023

<h3 id="2023-11-29-security-updates"> Security updates </h3>

- [Authenticating to CockroachDB {{ site.data.products.dedicated }} clusters using public key infrastructure (PKI) security certificates](https://www.cockroachlabs.com/docs/cockroachcloud/client-certs-dedicated) is now [Generally Available](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) to all CockroachDB {{ site.data.products.cloud }} organizations.
- [SCIM Provisioning](https://www.cockroachlabs.com/docs/cockroachcloud/configure-scim-provisioning), which centralizes provisioning and management of CockroachDB {{ site.data.products.cloud }} organization members in an identity provider (IdP) such as Okta using [System for Cross-Domain Identity Management SCIM](https://www.rfc-editor.org/rfc/rfc7644), is now [Generally Available](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) to all CockroachDB {{ site.data.products.cloud }} organizations.

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

- [CockroachDB {{ site.data.products.dedicated }} on Azure](https://www.cockroachlabs.com/docs/cockroachcloud/cockroachdb-dedicated-on-azure) is [generally available](https://www.cockroachlabs.com/docs/stable/cockroachdb-feature-availability#feature-availability-phases).

<h3 id="2023-10-02-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.serverless }} clusters now have a [**Custom Metrics Chart** page]({% link cockroachcloud/custom-metrics-chart-page.md %}) available in [preview]({% link {{site.current_cloud_version}}/cockroachdb-feature-availability.md %}). From the [**Metrics** page]({% link cockroachcloud/metrics-page.md %}) in the Console, navigate to the **Custom** tab to create custom charts showing the time series data for an available metric or combination of metrics.

## September 29, 2023

<h3 id="2023-09-29-general-changes"> General changes </h3>

- [Multi-region CockroachDB {{ site.data.products.serverless }}]({% link cockroachcloud/plan-your-cluster-serverless.md %}#multi-region-clusters) clusters are now [generally available](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability), and [cross-region network charges](https://www.cockroachlabs.com/pricing) are now accounted for in RU consumption.
## September 27, 2023

<h3 id="2023-09-27-general-changes"> General changes </h3>

- The {{ site.data.products.cloud }} Console's [SQL Shell]({% link cockroachcloud/sql-shell.md %}) is now available in [preview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) to all CockroachDB {{ site.data.products.cloud }} users with the [Cluster Administrator role]({% link cockroachcloud/managing-access.md %}).

## September 22, 2023

<h3 id="2023-09-22-general-changes"> General changes </h3>

- CockroachDB {{ site.data.products.dedicated }} clusters on Azure can now be modified, [horizontally or vertically scaled]({% link cockroachcloud/cluster-management.md %}), [upgraded]({% link cockroachcloud/upgrade-policy.md %}), have their [storage increased]({% link cockroachcloud/cluster-management.md %}#increase-storage-for-a-cluster), and have [maintenance windows]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window) set. To learn more, refer to [CockroachDB {{ site.data.products.dedicated }} on Azure]({% link cockroachcloud/cockroachdb-dedicated-on-azure.md %}).

## September 11, 2023

<h3 id="2023-09-11-general-changes"> General changes </h3>

- The {{ site.data.products.cloud }} Console's [SQL Shell]({% link cockroachcloud/sql-shell.md %}) is now available in [limited access](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability). This feature enables you to run queries on your cluster directly from the {{ site.data.products.cloud }} Console. To enroll your organization, contact your Cockroach Labs account team.

## September 8, 2023

<h3 id="2023-09-08-general-changes"> General changes </h3>

- [Managed-service backups](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups?filters=dedicated) are now available for [CockroachDB {{ site.data.products.dedicated }} clusters on Azure (Limited Access)]({% link cockroachcloud/cockroachdb-dedicated-on-azure.md %}).

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

- CockroachDB {{ site.data.products.dedicated }} [maintenance windows](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#set-a-maintenance-window) now include all kinds of cluster maintenance operations in addition to patch upgrades.

## September 1, 2023

<h3 id="2023-09-01-general-changes"> General changes </h3>

- Configuring [private endpoint trusted owners](https://cockroachlabs.com/docs/cockroachcloud/aws-privatelink) for CockroachDB {{ site.data.products.dedicated }} clusters on AWS is available in [limited access]({% link {{site.versions["stable"]}}/cockroachdb-feature-availability.md %}). To enroll your organization, contact your Cockroach Labs account team.

## August 22, 2023

<h3 id="2023-08-16-general-changes"> General changes </h3>

- In the {{ site.data.products.cloud }} Console, you can now [add regions and change the primary region]({% link cockroachcloud/folders.md %}) for multi-region  CockroachDB {{ site.data.products.serverless }} clusters. You cannot currently edit the region configuration for a single-region cluster once it has been created, and you cannot remove a region once it has been added. For details, refer to [Planning a CockroachDB {{ site.data.products.serverless }} Cluster]({% link cockroachcloud/plan-your-cluster-serverless.md %}#multi-region-clusters).

## August 16, 2023

<h3 id="2023-08-16-general-changes"> General changes </h3>

- [Organizing clusters using folders]({% link cockroachcloud/folders.md %}) is available in [limited access]({% link {{site.versions["stable"]}}/cockroachdb-feature-availability.md %}). To enroll your organization, contact your Cockroach Labs account team.

## August 9, 2023

<h3 id="2023-08-09-console-changes"> Console changes </h3>

- The **Updating** cluster status in the {{ site.data.products.db }} Console has been replaced with the **Available (Maintenance in Progress)** status to clarify that clusters are available for reading and writing data during maintenance upgrades.

## August 1, 2023

<h3 id="2023-08-01-general-changes"> General changes </h3>

- {{ site.data.products.serverless }} pricing changes that went into effect for newly-created organizations beginning on  [May 1, 2023](#may-1-2023) are now in effect for all organizations. Review the [new pricing](../cockroachcloud/plan-your-cluster-serverless.html#pricing), and review your current [resource limits](../cockroachcloud/serverless-cluster-management.html#edit-cluster-capacity) to prevent disruptions to your service.

## July 31, 2023

<h3 id="2023-07-31-console-changes"> Console changes </h3>

- The primary navigation to the **Clusters**, **Billing**, **Alerts**, and **Organization** pages in the CockroachDB {{ site.data.products.cloud }} Console is now displayed at the top of the page instead of on the left.

## July 24, 2023

<h3 id="2023-07-24-security-changes"> Security updates </h3>

- [Configuring private connectivity using AWS PrivateLink](/docs/cockroachcloud/aws-privatelink.html?filters=serverless) is available in [limited access](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability) for multi-region CockroachDB {{ site.data.products.serverless }} clusters on AWS. To enroll your organization, contact your Cockroach Labs account team.

<h3 id="2023-07-24-console-changes"> Console changes </h3>

- `ccloud` [v0.5.11](https://www.cockroachlabs.com/docs/cockroachcloud/ccloud-get-started#install-ccloud) is now available. This update includes a new [`--skip-ip-check` flag](https://www.cockroachlabs.com/docs/cockroachcloud/ccloud-get-started#skip-the-ip-allowlist-check-when-connecting-to-your-cluster) that allows users to skip the client-side IP allowlist check when connecting to a cluster using the `ccloud cluster sql` command.

## July 21, 2023

<h3 id="2023-07-21-security-changes"> Security updates </h3>

- **Health Insurance Portability and Accountability Act (HIPAA)**: When configured appropriately for [PCI DSS Compliance](https://www.cockroachlabs.com/docs/cockroachcloud/pci-dss), CockroachDB {{ site.data.products.dedicated }} advanced also meets the requirements of the Health Insurance Portability and Accountability Act of 1996, commonly referred to as _HIPAA_. HIPAA defines standards for the storage and handling of personally-identifiable information (PII) related to patient healthcare and health insurance, which is also known as protected-health information (PHI). To learn more, refer to [Regulatory Compliance in CockroachDB Dedicated](https://www.cockroachlabs.com/docs/cockroachcloud/compliance).

## July 10, 2023

<h3 id="2023-07-10-general-changes"> General changes </h3>

- Previously, a default setting in the Amazon CloudWatch exporter could cause redundant cardinality in [metrics exported](https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics) from CockroachDB {{ site.data.products.dedicated }} clusters, which unnecessarily increased costs. This option is now disabled to reduce AWS costs.

<h3 id="2023-07-10-console-changes"> Console changes </h3>

- The **Add database** button on the [**Databases** page](https://www.cockroachlabs.com/docs/cockroachcloud/databases-page) of the Console is temporarily disabled.
- CockroachDB {{ site.data.products.dedicated }} [restore jobs](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups?filters=dedicated#ways-to-restore-data) now have the following more descriptive statuses: `Preparing`, `Running`, `Reverting`, `Finalizing`, `Succeeded`, and `Failed` statuses. Additionally, destination clusters of self-service restores now display a `Restoring` state during the restore.
- The [**Databases** page](https://www.cockroachlabs.com/docs/cockroachcloud/databases-page) now includes additional statistics for clusters running [v23.1.0]({% link releases/v23.1.md %}) and later.
- You can now set up an AWS CloudWatch integration and view its status directly from the [**Tools** page](https://www.cockroachlabs.com/docs/cockroachcloud/tools-page) of the CockroachDB {{ site.data.products.cloud }} Console.

<h3 id="2023-07-10-security-changes"> Security updates </h3>

- CockroachDB {{ site.data.products.serverless }} users can now [configure an IP allowlist](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#ip-allowlisting) with up to 50 allowlist rules for their clusters.
- The following [roles](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles) are now available for users of the limited access [fine-grained access control authorization model](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#ip-allowlisting):

    - Cluster Operator
    - Billing Coordinator
    - Org Administrator

    To enroll your organization in the new authorization model, contact your Cockroach Labs account team.

## June 05, 2023

<h3 id="2023-07-05-console-changes"> Console changes </h3>

- Organizations that have purchased premium support will now see it included in their [invoices](https://www.cockroachlabs.com/docs/cockroachcloud/billing-management).
- Cross-cluster [restores](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups#restore-a-cluster) are now limited to CockroachDB {{ site.data.products.dedicated }} clusters with a major version greater than or equal to the major version of the source cluster.
- The [**Restore jobs**](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups#restore-a-cluster) tab of the **Backups page** now shows more information about a restore job, such as the source and destination clusters, the restore type, the backup size, and the job's progress.

<h3 id="2023-07-05-security-changes"> Security updates </h3>

- The [Organization Audit Logs API](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-audit-logs), which provides logs of events that occur in a Cloud organization, is now [generally available](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability#feature-availability-phases).
- `ExternalId` support is now re-enabled in the [Customer-managed Encryption Key (CMEK)](https://www.cockroachlabs.com/docs/cockroachcloud/cmek-ops-aws) capability on AWS.

<h3 id="2023-07-05-bug-fixes"> Bug fixes </h3>

- The `status` returned by the [`logexport` Cloud API endpoint](https://www.cockroachlabs.com/docs/cockroachcloud/export-logs#the-logexport-endpoint) is now determined by the state of both the latest log export's job state and the readiness of the underlying logging resources. Before this change, a `GET` request to the `logexport` endpoint could report an outdated log export status that conflicted with the latest log export update job state or with the most recent state of the logging infrastructure.
- Fixed a bug where concurrent [restores](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups#restore-a-cluster) could run on the same destination cluster and cause the destination cluster to become unusable.
- Fixed a bug where the IOPS price preview shown when [creating](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster) or [editing a cluster](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management) was inaccurate.
- The **Group** tab is now shown only to users who have this feature enabled. Previously, an error page was shown to users who navigated to the **Group** tab without enabling the feature.

## May 31, 2023

<h3 id="2023-05-31-security-changes"> Security updates </h3>

- [CockroachDB {{ site.data.products.cloud }} Organization Audit Logs](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-audit-logs), which capture historical logs when many types of events occur, are now generally available for CockroachDB {{ site.data.products.cloud }} organizations.

## May 15, 2023

In addition to many of the Feature Highlights in the [CockroachDB v23.1.0 Release Notes]({% link releases/v23.1.md %}#v23-1-0-feature-highlights), the following features are specifically available to Cloud clusters once they are upgraded:

<h3 id="2023-05-15-general-changes"> General changes </h3>

- CockroachDB {{ site.data.products.serverless }} [multi-region](https://www.cockroachlabs.com/docs/v23.1/multiregion-overview) is now publicly available in [preview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability#feature-availability-phases). Multi-region benefits like reduced latency and high availability are now achievable in conjunction with the ease-of-operation and automatic scaling advantages of the CockroachDB {{ site.data.products.serverless }} deployment model.

    - [Regions available](https://www.cockroachlabs.com/docs/cockroachcloud/serverless-faqs#what-regions-are-available-for-cockroachdb-serverless-clusters): 6 regions in AWS and 6 regions in GCP.
    - A primary region for the cluster is specified upon creation.
    - The cluster’s regional configuration applies to all databases by default, so it is not necessary to run [`ALTER DATABASE ... ADD REGION`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-database#add-region) to configure regions when adding a database to the cluster.
    - [`SURVIVE REGION FAILURE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-database#survive-zone-region-failure) is supported to achieve [region-level survival goals](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multiregion-overview#survival-goals).

- [Creating CockroachDB {{ site.data.products.dedicated }} clusters on Azure](https://www.cockroachlabs.com/docs/cockroachcloud/cockroachdb-dedicated-on-azure) is now available in [limited access](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability). To enroll your organization and begin testing this feature, contact your Cockroach Labs account team.

<h3 id="2023-05-15-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.dedicated }} users can now [restore clusters from the Cloud console](https://www.cockroachlabs.com/docs/cockroachcloud/take-and-restore-customer-owned-backups).

## May 10, 2023

<h3 id="2023-05-10-security-changes"> Security updates </h3>

- [Egress Perimeter Controls](https://www.cockroachlabs.com/docs/cockroachcloud/egress-perimeter-controls), which allow you to restrict egress from a CockroachDB {{ site.data.products.dedicated }} cluster to a list of specified external destinations, are now generally available for CockroachDB {{ site.data.products.dedicated }} advanced clusters.

## May 1, 2023

<h3 id="2023-05-01-general-changes"> General changes </h3>

The following changes were made to CockroachDB {{ site.data.products.serverless }} for **new organizations** created on or after April 26, 2023. **Existing organizations will not be affected until August 1, 2023**.

- The price of [Request Units (RUs)](https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster-serverless#request-units) increased from $1 per 10M RU to $2 per 10M RUs.
- The price of [storage](https://www.cockroachlabs.com/docs/cockroachcloud/architecture#storage) decreased from $1 per 1 GiB storage to $0.50 per 1 GiB storage.
- Free resources are allocated on a per-organization basis instead of a per-cluster basis. All All non-contract organizations will now receive 50M Request Units per month and 10 GiB of storage for free. Free resources do not apply to contract customers.
- All resources are available instantly at the beginning of each month (burst and baseline RUs are now deprecated).
- You can now [set separate RU and storage limits](https://www.cockroachlabs.com/docs/cockroachcloud/serverless-cluster-management#edit-your-resource-limits) for your clusters, or set a spend limit that will be divided between resources automatically.
- You can now [set unlimited resources](https://www.cockroachlabs.com/docs/cockroachcloud/serverless-cluster-management#edit-your-resource-limits) for a cluster so your workload is never restricted.
- Organizations on the free plan will have at most one free serverless cluster (instead of the previous limit of five free clusters). **Cockroach Labs will continue to maintain all existing free clusters with the new organization-level free resources**.
- Organizations can now create 200 serverless clusters instead of the previous maximum of five total clusters.

For an in-depth explanation of CockroachDB {{ site.data.products.serverless }} pricing, refer to [Pricing](https://cockroachlabs.com/pricing). For any questions or concerns, please [contact Support](https://support.cockroachlabs.com).

<h3 id="2023-05-01-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.dedicated }} users can now [use the Cloud Console for full-cluster restores](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups?filters=dedicated#restore-a-cluster).
- The [**Access Management** page](https://www.cockroachlabs.com/docs/cockroachcloud/managing-access) in the Cloud Console now shows only relevant content based on the [user's role assignments](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles).

<h3 id="2023-05-01-api-changes">Cloud API changes </h3>

- [Cloud API](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api) responses now contain a header called `Cc-Trace-Id` that can be provided to [Support](https://support.cockroachlabs.com) to help with diagnostics or troubleshooting.
- The `CreateCluster` and `UpdateCluster` methods now support setting individual monthly limits for a cluster's [Request Units](https://www.cockroachlabs.com/docs/cockroachcloud/architecture#request-unit-ru) and [storage](https://www.cockroachlabs.com/docs/cockroachcloud/architecture#storage) usage.
- If your organization is enrolled in the new fine-grained authorization model described under **Security Updates**, you can assign the [new roles](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles) to both users and service accounts using the [Cloud API](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api) or [Terraform provider](https://www.cockroachlabs.com/docs/cockroachcloud/provision-a-cluster-with-terraform) in addition to the {{ site.data.products.Cloud }} Console.

<h3 id="2023-05-01-security-changes"> Security updates </h3>

- CockroachDB {{ site.data.products.cloud }} is transitioning to a new [authorization model](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#overview-of-the-cockroachdb-cloud-two-level-authorization-model) that offers fine-grained access-control (FGAC), meaning that users can be given access to exactly the actions and resources required to perform their tasks. Changes include [cluster-level roles](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles) and consistent access management across users and service accounts. This feature is in [limited access](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability), and you can enroll your organization by contacting your account team. For more information, see [Managing Access (Authorization) in CockroachDB Cloud](https://www.cockroachlabs.com/docs/cockroachcloud/managing-access).

- You can now use client certificates to authenticate to CockroachDB {{ site.data.products.dedicated }} clusters. First, a [cluster administrator](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#organization-user-roles) needs to upload a CA certificate for the cluster using the [Cloud API](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api) or [Terraform provider](https://www.cockroachlabs.com/docs/cockroachcloud/provision-a-cluster-with-terraform). After that, individual users can be assigned client certificates signed by the uploaded CA certificate, which they can then use to connect to the cluster. This feature is in [limited access](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability), and you can enroll your organization by contacting your account team.

<h3 id="2023-05-01-bug-fixes"> Bug fixes </h3>

- The [**Connect to your cluster**](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster) dialog and [**Databases** page](https://www.cockroachlabs.com/docs/cockroachcloud/databases-page) in the Console now respond significantly faster for clusters with over 100 databases.
- Fixed a bug where table and database [restores](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups) were disabled for clusters running CockroachDB versions [v22.2.6]({% link releases/v22.2.md %}#v22-2-6) or below.

## April 26, 2023

<h3 id="2023-04-26-security-changes"> Security updates </h3>

- [SCIM Provisioning](https://www.cockroachlabs.com/docs/cockroachcloud/configure-scim-provisioning), which centralizes provisioning and management of CockroachDB {{ site.data.products.cloud }} organization members in an identity provider (IdP) such as Okta using [System for Cross-Domain Identity Management SCIM](https://www.rfc-editor.org/rfc/rfc7644), is available in [limited access](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroachdb-feature-availability). To enroll your organization, contact your account team.

## April 10, 2023

<h3 id="2023-04-10-general-changes"> General changes </h3>

- Contract customers can now [create CockroachDB {{ site.data.products.dedicated }} advanced clusters](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster#step-1-start-the-cluster-creation-process), which have all the features of CockroachDB {{ site.data.products.dedicated }} standard clusters, plus security features needed for [PCI DSS compliance](https://www.cockroachlabs.com/docs/cockroachcloud/pci-dss). To upgrade your organization to a contract, [contact us](https://cockroachlabs.com/contact-sales).
- CockroachDB {{ site.data.products.dedicated }} clusters now [export the following metrics](https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics#the-metricexport-endpoint) to third-party monitoring tools such as [Datadog](https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics?filters=datadog-metrics-export) and [Amazon CloudWatch](https://www.cockroachlabs.com/docs/cockroachcloud/export-metrics?filters=aws-metrics-export):
  - `storage_l0_sublevels`
  - `storage_l0_num_files`
  - `security_certificate_expiration_ca`
  - `sql_mem_root_current`
  - `sys_host_disk_iopsinprogress`

<h3 id="2023-04-10-api-changes"> Cloud API changes </h3>

- You can now upgrade, roll back, or manually finalize a pending upgrade to your cluster using the [Cloud API](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api).
- The [Cloud API endpoints](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api) that were in preview for configuring metric export have been replaced with specific endpoints for each supported third-party tool integration. For example, `EnableMetricExport` is now replaced by `EnableDatadogMetricExport` and `EnableCloudWatchMetricExport`.

<h3 id="2023-04-10-security-changes"> Security updates </h3>

- [Org Administrators](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#org-administrator) of organizations that have [enabled Cloud Organization SSO](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-sso) can now reset the passwords of other users in their organization who authenticate using passwords rather than an SSO authentication method.

<h3 id="2023-04-10-bug-fixes"> Bug fixes </h3>

- Fixed a bug where a `404` error would display when navigating from certain pages to the **Clusters** page.
- Removed an unnecessary warning that could appear when downloading CA certificates for CockroachDB {{ site.data.products.serverless }} clusters.

## March 31, 2023

<h3 id="2023-03-31-security-changes"> Security updates </h3>

- [Private Clusters](https://www.cockroachlabs.com/docs/cockroachcloud/private-clusters) are now generally available for CockroachDB {{ site.data.products.dedicated }}. A private cluster's nodes have no public IP addresses.
- [Customer-Managed Encryption Keys (CMEK)](https://www.cockroachlabs.com/docs/cockroachcloud/cmek) is now generally available for CockroachDB {{ site.data.products.dedicated }} private clusters. CMEK allows you to protect data at rest in a CockroachDB {{ site.data.products.dedicated }} cluster using a cryptographic key that is entirely within your control, hosted in a supported cloud provider key-management system (KMS).

## March 06, 2023

<h3 id="2023-03-06-security-changes"> Security updates </h3>

- The [**Migrations** page](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page) is now limited to [Org Administrators](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#org-administrator).

## February 9, 2023

<h3 id="2023-02-09-general-changes"> General changes </h3>

- For CockroachDB {{ site.data.products.dedicated }} clusters, the ability to add and remove regions through the CockroachDB {{ site.data.products.cloud }} Console has been temporarily disabled. If you need to add or remove regions from a cluster, [contact Support](https://support.cockroachlabs.com/).

## February 6, 2023

<h3 id="2023-02-06-general-changes"> General changes </h3>

- The following features are now available for CockroachDB {{ site.data.products.serverless }} clusters running CockroachDB [v22.2.0]({% link releases/v22.2.md %}) or later:
  - [Query cancellation](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cancel-query#considerations) using the PostgreSQL wire protocol (pgwire).
  - [`EXPLAIN ANALYZE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/explain-analyze) now gives an estimate of the [Request Units (RUs)](https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster-serverless#request-units) a query consumes.
  - All CockroachDB {{ site.data.products.serverless }} users can now use cloud storage for [`IMPORT`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/import), [`BACKUP`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup), and [change data capture (CDC)](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/change-data-capture-overview) without entering billing information.
  - [`SHOW RANGES`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-ranges) is now supported on CockroachDB {{ site.data.products.serverless }}.
  - The [GC TTL](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/configure-replication-zones#gc-ttlseconds) for deleted values is lowered from 24 hours to 1 hour and 15 minutes.

<h3 id="2023-02-06-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.serverless }} clusters' regions are now displayed on the [**Cluster Overview** page](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-overview-page) and [**Clusters** page](https://www.cockroachlabs.com/docs/cockroachcloud/serverless-cluster-management#view-clusters-page).
- The links in the sidebar navigation of the [**Cluster Overview**](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-overview-page) page have been reorganized into sections under relevant headers.
- For CockroachDB {{ site.data.products.dedicated }} clusters, the **Monitoring** page is now called the [**Tools** page](https://www.cockroachlabs.com/docs/cockroachcloud/tools-page) and is located in the **Monitoring** section of the sidebar.

<h3 id="2023-02-06-api-changes"> Cloud API changes </h3>

- Support for [Customer-Managed Encryption Keys (CMEK)](https://www.cockroachlabs.com/docs/cockroachcloud/cmek) has been added to the [CockroachDB {{ site.data.products.cloud }} Terraform Provider](https://registry.terraform.io/providers/cockroachdb/cockroach/latest). Contact your Cockroach Labs account team to enroll in the CMEK preview.
- When [using Terraform to provision CockroachDB {{ site.data.products.cloud }} clusters](https://www.cockroachlabs.com/docs/cockroachcloud/provision-a-cluster-with-terraform), you can now manage [database connections](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/data-sources/connection_string) and [SSL certificates](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/data-sources/cluster_cert) directly in your Terraform workflow.
- The Cloud API now provides [formatted connection string information](https://www.cockroachlabs.com/docs/api/cloud/v1.html#get-/api/v1/clusters/-cluster_id-/connection-string).

<h3 id="2023-02-06-security-changes"> Security updates </h3>

- CockroachDB {{ site.data.products.dedicated }} is now [compliant with the Payment Card Industry Data Security Standard (PCI DSS)](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/security-reference/security-overview). To learn more about achieving PCI DSS compliance with CockroachDB {{ site.data.products.dedicated }}, contact your Cockroach Labs account team.
- [Cloud Organization Single Sign-On (SSO)](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-sso#cloud-organization-sso) is now available to all CockroachDB {{ site.data.products.cloud }} users.
- For CockroachDB {{ site.data.products.cloud }} organizations enrolled in the [Customer-managed Encryption Key (CMEK)](https://www.cockroachlabs.com/docs/cockroachcloud/cmek) preview, note that the following conditions must now be met before enabling CMEK for a CockroachDB {{ site.data.products.dedicated }} cluster:
    - The cluster must be running CockroachDB [v22.2.0]({% link releases/v22.2.md %}) or later.
    - The cluster must have been created as a [private cluster](https://www.cockroachlabs.com/docs/cockroachcloud/private-clusters). To create a private cluster, your organization  must be enrolled in the private cluster preview, which is separate from the CMEK preview. Contact your Cockroach Labs account team to enroll in both previews.
- For CockroachDB {{ site.data.products.cloud }} organizations enrolled in the [Egress Perimeter Controls](https://www.cockroachlabs.com/docs/cockroachcloud/egress-perimeter-controls) preview, note that CockroachDB {{ site.data.products.dedicated }} clusters must have been created as [private clusters](https://www.cockroachlabs.com/docs/cockroachcloud/private-clusters) in order to enable Egress Perimeter Controls. To create a private cluster, your organization  must be enrolled in the private cluster preview, which is separate from the Egress Perimeter Controls preview. Contact your Cockroach Labs account team to enroll in both previews.

<h3 id="2023-02-06-bug-fixes"> Bug fixes </h3>

-  Fixed a bug where users granted the Developer role in a CockroachDB {{ site.data.products.cloud }} organization incorrectly had certain permissions for any cluster in the organization. Refer to [this technical advisory](https://www.cockroachlabs.com/docs/advisories/c20230118) for more information.

## February 2, 2023

<h3 id="2023-02-02-general-changes"> General changes </h3>

- CockroachDB {{ site.data.products.serverless }} users can now access [cloud storage](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage) without entering billing information.

## January 9, 2023

<h3 id="2023-01-09-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.dedicated }} clusters running CockroachDB [v22.1.8]({% link releases/v22.1.md %}#v22-1-8) or later now have a separate tab for incomplete backup jobs on the [**Backups** page](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups).

<h3 id="2023-01-09-api-changes"> Cloud API changes </h3>

- The [create cluster](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api#create-a-new-cluster) request now exposes the `restrict-egress-traffic` boolean field to allow dedicated clusters to be created with a [deny-by-default egress traffic policy](https://www.cockroachlabs.com/docs/cockroachcloud/egress-perimeter-controls#use-a-deny-by-default-egress-traffic-policy). This field and the broader egress perimeter controls capability can be used only with [private dedicated clusters](https://www.cockroachlabs.com/docs/cockroachcloud/private-clusters), which require the `network-visibility` field to be set to `NETWORK_VISIBILITY_PRIVATE`.

<h3 id="2023-01-09-bug-fixes"> Bug fixes </h3>

- Fixed a bug for CockroachDB {{ site.data.products.dedicated }} clusters where the [**Datadog setup**](https://www.cockroachlabs.com/docs/cockroachcloud/tools-page#monitor-cockroachdb-dedicated-with-datadog) dialog was not rendering properly.

## December 5, 2022

<h3 id="2022-02-05-console-changes"> Console changes </h3>

- CockroachDB {{ site.data.products.serverless }} clusters now have a [**Metrics** page](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-custom-chart-debug-page) in the Console with charts to **Monitor SQL Activity** and **Identify SQL Problems**.
- The `p99.9` and `p99.99` latencies are now shown in the `SQL Connection Latency` and `SQL Statement Latency` charts on the [**Metrics** page](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-custom-chart-debug-page) for CockroachDB {{ site.data.products.serverless }} clusters.
- The **Last used** column on the [**Table Details** page](https://www.cockroachlabs.com/docs/cockroachcloud/databases-page) now uses the UTC timezone.
- The CockroachDB {{ site.data.products.serverless }} [**Cost estimator**](https://www.cockroachlabs.com/docs/cockroachcloud/serverless-cluster-management#estimate-usage-cost) has been temporarily disabled while a bug is being fixed.

<h3 id="2022-12-05-api-changes"> Cloud API changes </h3>

- A preview of [log export](https://www.cockroachlabs.com/docs/cockroachcloud/export-logs) for CockroachDB {{ site.data.products.dedicated }} users is now available. To enroll your organization in the preview, contact your Cockroach Labs account team.

<h3 id="2022-12-05-bug-fixes"> Bug fixes </h3>

- Trial coupon limits for CockroachDB {{ site.data.products.dedicated }} clusters' storage and compute are now enforced in the [**Edit cluster**](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management) dialog.
- Fixed a bug where [backups](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups) shown for a particular day included backups for midnight on the following day.
- Fixed a bug  on the [**Databases page**](https://www.cockroachlabs.com/docs/cockroachcloud/databases-page) where the number of index recommendations displayed for a database was inconsistent with the actual number of index recommendations for the database.
- Fixed a bug that could break the [**Databases page**](https://www.cockroachlabs.com/docs/cockroachcloud/databases-page) when fetching index usage statistics for databases.

## November 7, 2022

<h3 id="2022-11-07-general-changes"> General changes </h3>

- The following new regions are now available for all CockroachDB {{ site.data.products.dedicated }} clusters:

    GCP                                          | AWS
    ---------------------------------------------|------
    Frankfurt, Germany (`europe-west3`)          | Osaka, Japan (`ap-northeast-3`)
                                                 | Montréal, Québec (`ca-central-1`)
                                                 | Stockholm, Sweden (`eu-north-1`)

<h3 id="2022-11-07-console-changes"> Console changes </h3>

- Added an icon next to a cluster's name on the [**Billing overview**](https://www.cockroachlabs.com/docs/cockroachcloud/billing-management) page to indicate when a cluster has been deleted.
- The [**Database page**](https://www.cockroachlabs.com/docs/cockroachcloud/databases-page) in the CockroachDB {{ site.data.products.cloud }} Console now shows the last time table statistics were updated.

<h3 id="2022-11-07-api-changes"> Cloud API changes </h3>

- The [Cloud API](https://www.cockroachlabs.com/docs/api/cloud/v1) documentation now indicates which endpoints are in preview.

<h3 id="2022-11-07-bug-fixes"> Bug fixes </h3>

- The **Sessions** link on the [**Overview**](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-overview-page) page now redirects to the correct tab on the [**SQL Activity**](https://www.cockroachlabs.com/docs/cockroachcloud/sessions-page) page.
- Fixed a bug where stale data caused **Connect** modal errors immediately after creating a CockroachDB {{ site.data.products.serverless }} cluster.
- Fixed a bug where backup metadata payloads were limited to 4MiB instead of the desired 32MiB.
- Fixed a bug where the node-aggregated low disk alert was not firing.

## October 3, 2022

<h3 id="2022-10-03-bug-fixes"> Bug fixes </h3>

- The CockroachDB {{ site.data.products.cloud }} Console now utilizes the same [cluster setting](https://www.cockroachlabs.com/docs/stable/cluster-settings) as the DB Console, `sql.index_recommendation.drop_unused_duration`, as a threshold value for dropping unused indexes.
- Fixed a bug where [AWS PrivateLink](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#aws-privatelink) endpoints could fail to create but display an error message that said they were still creating.

## September 24, 2022

<h3 id="2022-09-24-console-changes">Console changes</h3>

- You can now create a database directly from the [**Databases** page](https://www.cockroachlabs.com/docs/cockroachcloud/databases-page) of the CockroachDB {{ site.data.products.cloud }} Console.

## September 16, 2022

<h3 id="2022-09-16-console-changes">Console changes</h3>

- A tool to [estimate your monthly cost](https://www.cockroachlabs.com/docs/cockroachcloud/serverless-cluster-management#estimate-usage-cost) based on your workload is now available for CockroachDB {{ site.data.products.serverless }} clusters.

## September 8, 2022

<h3 id="2022-09-08-console-changes"> Console changes </h3>

- Previously, when trying to remove a region from a three-region cluster, only the second and third regions were removable. Two regions must be removed at once because a two-region cluster is not a valid configuration, but users can now select any two regions to remove.
- The character limit for cluster names was raised from 20 to 40 characters.

<h3 id="2022-09-08-api-changes"> Cloud API changes </h3>

- Added the ability to create, edit, and delete a database through the [Cloud API](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api).

<h3 id="2022-09-08-bug-fixes"> Bug fixes </h3>

- In the CockroachDB {{ site.data.products.serverless }} connection dialog, the inline password input has been given a placeholder value to prevent it from interacting in unexpected ways with password managers.

## August 8, 2022

<h3 id="2022-08-08-console-changes">Console changes</h3>

- CockroachDB {{ site.data.products.dedicated }} users can now choose any of the available hardware options when [configuring a cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster). Previously, there were restrictions based on which storage and compute combinations were recommended for best performance.
- In the [**Connect to your cluster**](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster) dialog, your previous SQL user, database, and connection method selections are now cached to make it easier to re-connect to your cluster.

<h3 id="2022-08-08-bug-fixes">Bug fixes</h3>

- Fixed a bug where the **SQL Activity** tab for clusters running different CockroachDB versions did not always load version-appropriate UI components.
- Fixed a bug where the **Statements** table on a transaction's [**Transaction Details** page](https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page) sometimes showed an incorrect number of statements.

## July 28, 2022

<h3 id="2022-07-28-general-changes">General changes</h3>

- All of your organization's [invoices](https://www.cockroachlabs.com/docs/cockroachcloud/billing-management#view-invoices) are now available on the **Billing** page.

## July 27, 2022

<h3 id="2022-07-27-console-changes">General changes</h3>

- You can now [add and remove regions](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management) from CockroachDB {{ site.data.products.dedicated }} clusters through the CockroachDB {{ site.data.products.cloud }} Console. This change makes it easier to support users in new locations or scale down your cluster.

## July 6, 2022

<h3 id="2022-07-06-console-changes">Console changes</h3>

- The [**Connect to your cluster**](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/connect-to-the-database) dialog now includes code snippets for [supported languages and tools](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/third-party-database-tools).
- The [**Connect to your cluster**](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-a-serverless-cluster) dialog for clusters running CockroachDB [v22.1]({% link releases/v22.1.md %}) now loads more quickly.
- If users log in using an [SSO](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-sso) method other than the one they have used previously, they will now be asked if they want to switch to the new login method.
- Previously, CockroachDB {{ site.data.products.dedicated }} users could only choose storage amounts within the [recommendations](https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster?filters=dedicated) for the selected machine size. Now, a warning message will appear if the storage is outside the recommended range, but any storage option can be selected.
- The date and time selection on the [**Statements**](https://www.cockroachlabs.com/docs/cockroachcloud/statements-page) and [**Transactions**](https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page) pages now defaults to UTC and has an improved design.

<h3 id="2022-07-06-bug-fixes">Bug fixes</h3>

- The [**Statements** page](https://www.cockroachlabs.com/docs/cockroachcloud/statements-page) no longer crashes when a search term contains `*`.

## June 6, 2022

<h3 id="2022-06-06-general-changes">General changes</h3>

- [Datadog integration](https://www.cockroachlabs.com/docs/cockroachcloud/tools-page#monitor-cockroachdb-dedicated-with-datadog) is now available on the **Monitoring** page for all CockroachDB {{ site.data.products.dedicated }} users.
- [Cloud Organization Single Sign-On (SSO)](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-org-sso) for CockroachDB {{ site.data.products.cloud }} is now available with Google and Microsoft in addition to GitHub.

<h3 id="2022-06-06-console-changes">Console changes</h3>

- When creating a [SQL user](https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#create-a-sql-user) or [changing a SQL user's password](https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#change-a-sql-users-password), the generated password is now hidden until the user clicks **Reveal password**.

<h3 id="2022-06-06-api-changes">Cloud API changes</h3>

- Paginated [API](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api) endpoints now accept a single `page` parameter for next or previous pages. Pagination response messages now contain only two fields: `next_page` and `previous_page`, whose values can be used for the `page` field in a followup call.

## May 5, 2022

<h3 id="2022-05-05-console-changes">Console changes</h3>

- All organizations can now create [service accounts](https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#manage-service-accounts) and [API keys](https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#api-access), and have access to the [Cloud API](https://www.cockroachlabs.com/docs/cockroachcloud/cloud-api).
- The [`ccloud` command line tool](https://www.cockroachlabs.com/docs/cockroachcloud/ccloud-get-started) for creating, managing, and connecting to CockroachDB Cloud clusters is now in public beta.

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

- CockroachDB {{ site.data.products.dedicated }} contract customers can now [scale clusters](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management) through the Console.

<h3 id="2022-04-27-console-changes">Console changes</h3>

- Contract customers can now view information about their organization's credit grants on the **Overview** tab of the [**Billing** page](https://www.cockroachlabs.com/docs/cockroachcloud/billing-management).

## April 20, 2022

<h3 id="2022-04-20-console-changes">Console changes</h3>

- [SQL user passwords](https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#change-a-sql-users-password) are now generated and saved automatically to simplify the connection experience.
- When [connecting to your cluster](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-a-serverless-cluster), the CA certificate download is now hidden once you have already downloaded the certificate.

<h3 id="2022-04-20-doc-changes">Documentation changes</h3>

- Improved CockroachDB {{ site.data.products.serverless }} [cluster connection](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-a-serverless-cluster) documentation, including a [third-party tool connection guide](https://www.cockroachlabs.com/docs/stable/connect-to-the-database), improved [Quickstart](https://www.cockroachlabs.com/docs/cockroachcloud/quickstart), and CRUD app examples.

## April 4, 2022

<h3 id="2022-04-04-console-changes">Console changes</h3>

- You no longer need to download a CA certificate to [connect to a CockroachDB {{ site.data.products.serverless }}](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-a-serverless-cluster) cluster through the CockroachDB SQL client if your cluster is running [v21.2.5]({% link releases/v21.2.md %}) or later.
- When [creating a CockroachDB {{ site.data.products.dedicated }} cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster), the approximate monthly cost is now displayed in the **Summary** sidebar along with the hourly cost.

## March 7, 2022

<h3 id="2022-03-07-console-changes">Console changes</h3>

- CockroachDB {{ site.data.products.cloud }} clusters now have a **Databases** page in the Console, which shows your databases, tables, indexes, and grants.
- When creating or editing a SQL user, passwords are now generated and saved automatically when users click the **Generate and save password** button. Previously, users had to enter passwords manually and remember to save them.
- CockroachDB {{ site.data.products.dedicated }} users can now [restore](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups) databases configured for multiple regions.

## February 10, 2022

<h3 id="2022-02-10-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.dedicated }} clusters can now be [created with custom hardware options](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster). Previously, there were four hardware options, and compute and storage were linked.
- CockroachDB {{ site.data.products.dedicated }} users can now scale a cluster's [compute](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management) and [storage](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management). Previously, the only way to scale up a CockroachDB {{ site.data.products.dedicated }} cluster was by adding more nodes.

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

- The [**Terminate Session** and **Terminate Statement**](https://www.cockroachlabs.com/docs/cockroachcloud/sessions-page#sessions-table) options are now enabled for CockroachDB {{ site.data.products.cloud }} clusters running CockroachDB [v21.2.2]({% link releases/v21.2.md %}#v21-2-2) or later.
- Selecting a transaction from the [**Transactions** page](https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page) now opens a new [**Transaction Details**](https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page#transaction-details-page) page with an improved design.
- The order of the tabs on the **SQL Activity** page has been changed to [**Statements**](https://www.cockroachlabs.com/docs/cockroachcloud/statements-page), [**Transactions**](https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page), and [**Sessions**](https://www.cockroachlabs.com/docs/cockroachcloud/sessions-page).

<h3 id="2022-02-07-bug-fixes">Bug fixes</h3>

- Fixed a number of broken links throughout the CockroachDB {{ site.data.products.cloud }} Console.
- Fixed a bug where CockroachDB {{ site.data.products.serverless }} users were seeing occasional dips and spikes in a cluster's [**Request Units**](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-overview-page#request-units) usage graph while running a steady workload.

## January 10, 2022

<h3 id="2022-01-10-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.dedicated }} clusters will now run [v21.2.3]({% link releases/v21.2.md %}#v21-2-3).
- CockroachDB {{ site.data.products.serverless }} clusters will now run CockroachDB [v21.2.0-beta.4]({% link releases/v21.2.md %}#v21-2-0-beta-4).
- The CockroachDB documentation navigation is now organized by user task instead of by product for CockroachDB {{ site.data.products.serverless }}, CockroachDB {{ site.data.products.dedicated }}, and CockroachDB {{ site.data.products.core }} v21.2. Topics specific to Serverless and Dedicated clusters are within the new top-level user task categories. CockroachDB {{ site.data.products.cloud }} release notes are under Reference.

<h3 id="2022-01-10-console-changes">Console changes</h3>

- The [**Billing**](https://www.cockroachlabs.com/docs/cockroachcloud/billing-management) page is now separated into two tabs, **Overview** and **Payment Details**.

## December 6, 2021

<h3 id="2021-12-06-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.dedicated }} clusters will now run [v21.2.1]({% link releases/v21.2.md %}#v21-2-1).
- CockroachDB {{ site.data.products.serverless }} clusters will now run CockroachDB [v21.2.0-beta.4]({% link releases/v21.2.md %}#v21-2-0-beta-4).
- New CockroachDB {{ site.data.products.cloud }} clusters will now have [Admission Control](https://www.cockroachlabs.com/docs/v21.2/architecture/admission-control) enabled by default.

<h3 id="2021-12-06-console-changes">Console changes</h3>

- The **Add/remove nodes** button is now disabled for custom clusters. If you are a contract customer and would like to scale your custom cluster, [contact Support](https://support.cockroachlabs.com/).

<h3 id="2021-12-06-bug-fixes">Bug fixes</h3>

- Fixed a bug where an error was occurring on the [VPC Peering and AWS PrivateLink](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization) pages for clusters with a large number of jobs.
- Fixed a bug where the **Test email alerts** section on the [**Alerts** page](https://www.cockroachlabs.com/docs/cockroachcloud/alerts-page) was not visible for organizations with only custom clusters.
- Fixed a bug where users were prompted to upgrade CockroachDB {{ site.data.products.serverless }} clusters, which are [upgraded automatically](https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy).
- Previously, [SQL metrics graphs](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-overview-page) for inactive CockroachDB {{ site.data.products.serverless }} clusters showed discontinuous time series lines or an error message. Continuous graphs will now remain available for scaled-down clusters.

## November 8, 2021

<h3 id="2021-11-08-general-changes">General changes</h3>

- [CockroachDB {{ site.data.products.serverless }}](https://www.cockroachlabs.com/blog/announcing-cockroachdb-serverless/), a fully-managed, auto-scaling deployment of CockroachDB, is now available. To get started with CockroachDB {{ site.data.products.serverless }} for free, see the [Quickstart](https://www.cockroachlabs.com/docs/cockroachcloud/quickstart).
- CockroachDB {{ site.data.products.cloud }} Free (beta) and CockroachDB {{ site.data.products.cloud }} are now CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}, respectively. Your ability to use your cluster will not be affected.
- CockroachDB {{ site.data.products.serverless }} clusters will now run CockroachDB [v21.2.0-beta.4]({% link releases/v21.2.md %}#v21-2-0-beta-4).
- New CockroachDB {{ site.data.products.dedicated }} clusters will now run CockroachDB [v21.1.11]({% link releases/v21.1.md %}#v21-1-11).

<h3 id="2021-11-08-console-changes">Console changes</h3>

- The [**Statements**](https://www.cockroachlabs.com/docs/cockroachcloud/statements-page), [**Transactions**](https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page), and [**Sessions**](https://www.cockroachlabs.com/docs/cockroachcloud/sessions-page) pages are now available for CockroachDB {{ site.data.products.serverless }} clusters on the **SQL Activity** page.
- Statements and transaction statistics are now retained longer for all clusters.
- Legends are now displayed by default for time-series graphs on the [Cluster Overview](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-overview-page#cluster-overview-metrics) page.
- The **Transaction retries** metric is no longer part of the **Current activity** panel on the CockroachDB {{ site.data.products.serverless }} [Cluster Overview](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-overview-page#cluster-statistics-panel) page.
- Deleting an organization with outstanding charges that have not been billed is now prohibited.
- There is now a more clear error message for users attempting to log into CockroachDB {{ site.data.products.cloud }} using GitHub when they have email and password authentication configured.
- Average RU usage is now shown in the **Request Units** chart for the CockroachDB {{ site.data.products.serverless }} [Cluster Overview](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-overview-page#request-units) page.
- The PowerShell command to [download the CockroachDB binary](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster?filters=windows#connect-to-your-cluster) is now improved for Windows users.
- When under 1 GiB of storage has been used, storage is now shown in MiB instead of GiB in the **Storage used** graph on the CockroachDB {{ site.data.products.serverless }} [Cluster Overview](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-overview-page#storage-used) page.
- A more descriptive error message is now displayed when attempting to create or edit a [SQL user](https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#manage-sql-users-on-a-cluster) with an invalid username.
- Previously, clicking **cancel** while editing a cluster would take users back to the **Clusters** page. Now, users are taken back to the cluster's **Overview** page.

<h3 id="2021-11-08-bug-fixes">Bug fixes</h3>

- Fixed a bug where, if a user had reached the maximum number of CockroachDB {{ site.data.products.serverless }} clusters and refreshed the **Create your cluster** page, the CockroachDB {{ site.data.products.serverless }} plan was auto-selected even though it is disabled.
- Fixed a bug where clicking **Cancel** while logging in with GitHub would report and internal error.
- Fixed a bug where organization deletion was temporarily broken.
- Fixed a bug that was preventing the **Request Units** and **SQL Statements** graphs on the CockroachDB {{ site.data.products.serverless }} [Cluster Overview](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-overview-page#cluster-overview-metrics) page from updating after a certain amount of time.

## October 4, 2021

<h3 id="2021-10-04-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v21.1.9]({% link releases/v21.1.md %}#v21-1-9).

<h3 id="2021-10-04-bug-fixes">Bug fixes</h3>

- Fixed an error in the connection string for Windows users [connecting to CockroachDB {{ site.data.products.cloud }} Free (beta)](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-a-serverless-cluster) clusters.

<h3>Miscellaneous changes</h3>

- Cluster names are now included in cluster creation email alerts.

## September 7, 2021

<h3 id="2021-09-07-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v21.1.7]({% link releases/v21.1.md %}#v21-1-7).

<h3 id="2021-09-07-general-changes">Console changes</h3>

- All pages shown to logged out users are now optimized for mobile devices.

- Improved the error message when an [AWS PrivateLink](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#aws-privatelink) endpoint request fails.

<h3 id="2021-09-07-general-changes">Bug fixes</h3>

- Fixed tooltip behavior on **Sessions**, **Statements**, and **Transactions** pages.

- Fixed a bug where clicking on the label of the [Terms of Service](https://www.cockroachlabs.com/cloud-terms-and-conditions/) checkbox would select the Terms of Service checkbox when signing up with GitHub.

## August 9, 2021

<h3 id="2021-08-09-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v21.1.6]({% link releases/v21.1.md %}#v21-1-6).
- CockroachDB {{ site.data.products.cloud }} Free (beta) users can now perform [backups](https://www.cockroachlabs.com/docs/cockroachcloud/take-and-restore-customer-owned-backups) (`IMPORT`, `BACKUP`, `RESTORE` and CDC) with `userfile` storage.

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

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v21.1.1]({% link releases/v21.1.md %}#v21-1-1).

<h3 id="2021-07-07-console-changes">Console changes</h3>

- All CockroachDB {{ site.data.products.cloud }} Dedicated users now have access to the [**Statements**](https://www.cockroachlabs.com/docs/cockroachcloud/statements-page) and [**Sessions**](https://www.cockroachlabs.com/docs/cockroachcloud/sessions-page) pages in the Console.
- All CockroachDB {{ site.data.products.cloud }} Dedicated users now have access to the [**Alerts**](https://www.cockroachlabs.com/docs/cockroachcloud/alerts-page) page in the Console, which allows you to toggle alerts, send test alerts, and manage alert recipients for your Organization.
- Previously, users were getting stuck during the verification step of creating an [AWS PrivateLink](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#aws-privatelink) endpoint. Now, users can enter the verification step of the **Add Endpoint Connection** dialog with an incomplete connection endpoint ID preset.
- Added a **Cloud** column to the **Clusters** page so users can see which cloud provider any cluster is using without having to click through to the **Cluster Overview** page.
- The maximum number of nodes in a cluster created through the Console was raised to 50 nodes per region and 150 nodes per cluster.

<h3 id="2021-07-07-bug-fixes">Bug fixes</h3>

- Fixed a bug where clicking the **Logout** button would trigger an error and display a blank page.
- The page will no longer refresh after switching the authentication method through the **Account** page.
- Switching organizations will no longer log you out of all sessions.

## July 6, 2021

<h3 id="2021-07-06-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v21.1.5]({% link releases/v21.1.md %}#v21-1-5).
- Starting this month, paid CockroachDB {{ site.data.products.cloud }} clusters will be billed monthly instead of every two weeks.

<h3 id="2021-07-06-console-changes">Console changes</h3>

- [Multi-region](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster#step-3-select-the-region-s) clusters can now be created through the Console. To learn more about creating a multi-region cluster, see [Planning your cluster](https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster?filters=dedicated).
- The **Connect** modal now has updated commands to make [connecting to your cluster](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-a-serverless-cluster) a smoother experience on Mac, Linux, and Windows.
- All CockroachDB {{ site.data.products.cloud }} users now have access to the [**Transactions** page](https://www.cockroachlabs.com/docs/cockroachcloud/transactions-page) in the Console.
- Navigation on the **Clusters** page is now a vertical sidebar instead of horizontal tabs.
- Added a tooltip to the **Upgrade** option in the **Action** Menu, which gives users more version-specific context.
- Users can now **Clear SQL Stats** from the [**Statements** page](https://www.cockroachlabs.com/docs/cockroachcloud/statements-page) for clusters running [v21.1.3]({% link releases/v21.1.md %}#v21-1-3) or later.

<h3 id="2021-07-06-bug-fixes">Bug fixes</h3>

- Fixed a bug where clicking on the [**Alerts** page](https://www.cockroachlabs.com/docs/cockroachcloud/alerts-page) broke the Organization header for users with multiple Organizations.
- Fixed a bug where nodes were cycling in clusters running [v21.1.4]({% link releases/v21.1.md %}#v21-1-4).
- Fixed several broken links to documentation throughout the Console.
- Users will no longer see alerts for clusters that are not in a **ready** state.
- Fixed a bug that was causing users to receive false positive CPU alerts.

## May 3, 2021

<h3 id="2021-05-01-general-changes">General changes</h3>

- New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.8]({% link releases/v20.2.md %}#v20-2-8).
- [CockroachDB {{ site.data.products.cloud }} Free](https://www.cockroachlabs.com/docs/cockroachcloud/quickstart) clusters are now available in four additional regions:
    - GCP: `europe-west1`, `asia-southeast1`
    - AWS: `eu-west-1`, `ap-southeast-1`

<h3 id="2021-05-01-console-changes">Console changes</h3>

- New users can now [sign up](https://www.cockroachlabs.com/docs/cockroachcloud/create-an-account) for CockroachDB {{ site.data.products.cloud }} with Github Authorization. Logging in with GitHub allows users to enforce [GitHub's two-factor authentication (2FA)](https://docs.github.com/github/authenticating-to-github/securing-your-account-with-two-factor-authentication-2fa) on their CockroachDB {{ site.data.products.cloud }} account. Current users can [switch their login method](https://www.cockroachlabs.com/docs/cockroachcloud/create-an-account#change-your-login-method) between email and GitHub.
- When logging in fails due to user input, the error message now includes [login method](https://www.cockroachlabs.com/docs/cockroachcloud/create-an-account#change-your-login-method) as a potential reason for failure.
- Previously, selecting a new cloud provider while [creating a cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-a-serverless-cluster) would reset the **Region** and **Hardware per node** options to default. Now, equivalent region and hardware options are preselected, and the number of nodes per region is preserved when a new cloud provider is selected.

<h3 id="2021-05-01-bug-fixes">Bug fixes</h3>

- **Contact Us** links now direct users to the [customer support portal](https://support.cockroachlabs.com/) instead of the user's mail app.

## April 5, 2021

<h3 id="2021-04-05-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.7]({% link releases/v20.2.md %}#v20-2-7).

<h3 id="2021-04-05-console-changes">Console changes</h3>

- The [login form](https://cockroachlabs.cloud/login) no longer focuses on the email field on page load. This change makes the form more flexible once other authentication methods are available.
- Extraneous information is no longer displayed in the error for failed [GCP peering](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#vpc-peering) attempts.
- Added a resource panel to the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud), which can be accessed by clicking the **?** icon in the top right corner of the Console. Included in the resource panel are links to relevant documentation, Cockroach University, the CockroachDB Slack community, and much more.
- Created a new [Status Page](https://status.cockroachlabs.cloud) that displays the current service status and incident communication of the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud), AWS services, and GCP services.

<h3 id="2021-04-05-bug-fixes">Bug fixes</h3>

- The region shown in the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) for free-tier clusters is now correct. Previously, the Console showed the wrong region when creating an AWS free-tier cluster.
- Fixed a bug where an error occurred when displaying the **Connect** modal for an old GCP cluster that does not have the custom `crdb` network. These clusters do not support VPC peering, but the lack of the `crdb` network was causing the listing of VPC peerings to fail even though no such peerings exist.

## March 8, 2021

<h3 id="2021-03-08-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.5]({% link releases/v20.2.md %}#v20-2-5).

<h3 id="2021-03-08-console-changes">Console changes</h3>

- Self-service [AWS PrivateLink](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#aws-privatelink) is now generally available for CockroachDB {{ site.data.products.cloud }} clusters running on AWS.
- On the [**Clusters** page](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#view-clusters-page), clusters that are running unsupported versions now have a warning in the **Version** column.

<h3 id="2021-03-08-security-changes">Security changes</h3>

- CockroachDB {{ site.data.products.cloud }} now does not include the supplied password in error messages that arise from resetting, editing, or creating a password when the password is too short.
- CockroachDB {{ site.data.products.cloud }} now prevents clickjacking attacks by specifying `X-Frame-Options: DENY` when serving `index.html`.

<h3 id="2021-03-08-bug-fixes">Bug fixes</h3>

- Previously, users who were not a member of any organization would get an error when trying to reset their password. A user would most likely encounter this scenario if they deleted their organization, tried to log in again, and didn't remember their password. Now, an organization will be created for the user if one does not exist. The [organization name can be edited](https://www.cockroachlabs.com/docs/cockroachcloud/create-an-account#change-your-organization-name) on the **Settings** tab on the organization's landing page.


## February 9, 2021

<h3 id="2021-02-09-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.4]({% link releases/v20.2.md %}#v20-2-4).

- [CockroachDB {{ site.data.products.cloud }} Free](https://www.cockroachlabs.com/docs/cockroachcloud/serverless-faqs) is now in beta. CockroachDB {{ site.data.products.cloud }} Free (beta) delivers free CockroachDB clusters for you and your organization. It is a managed instance of CockroachDB that removes the friction of initial cluster sizing and auto-scales based on your application traffic. There is an upper limit of usage of up to 1 vCPU and 5GB storage per free cluster.

    You can submit feedback or log any bugs you find through [this survey](https://forms.gle/jWNgmCFtF4y15ePw5).

- You can now [restore databases and tables](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups) from backups of CockroachDB {{ site.data.products.cloud }} clusters. This feature is only available to clusters running the paid version of CockroachDB {{ site.data.products.cloud }}.
- [reCAPTCHA](https://www.google.com/recaptcha/about/) has been added to the sign up process for new users signing up with an email and password. Some users may need to complete an image challenge.
- An email will now be sent to [Org Administrators](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#org-administrator) when a [30-day free trial of CockroachDB {{ site.data.products.cloud }}](https://www.cockroachlabs.com/docs/cockroachcloud/quickstart-trial-cluster) is nearing its end and once it has expired.

## January 22, 2021

<h3 id="2021-02-22-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.3]({% link releases/v20.2.md %}#v20-2-3).

<h3 id="2021-02-22-bug-fixes">Bug fixes</h3>

- Fixed a bug where deleting your only organization would prevent your email from being used for a new organization in the future.
- Fixed a bug where [VPC peering](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#vpc-peering) appeared to be available on clusters that it wasn't supported on.

## December 11, 2020

<h3 id="2020-12-11-general-changes">General changes</h3>

New clusters will now run CockroachDB [v20.2.2]({% link releases/v20.2.md %}#v20-2-2).

- CockroachDB {{ site.data.products.cloud }} is now offering [larger machine sizes](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster#step-2-select-the-cloud-provider) to be configured directly in the Console. You will now be able to select from four options in the create cluster workflow. The [pricing has also been updated](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster#step-2-select-the-cloud-provider) for newly created clusters. Existing clusters are not impacted by the pricing changes.

## November 19, 2020

<h3 id="2021-11-19-general-changes">General changes</h3>

New CockroachDB {{ site.data.products.cloud }} clusters will now run CockroachDB [v20.2.0]({% link releases/v20.2.md %}#v20-2-0).

- [Create a 30-day free CockroachDB {{ site.data.products.cloud }} cluster](https://www.cockroachlabs.com/docs/cockroachcloud/quickstart).
- [Add or remove nodes](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#add-or-remove-nodes-from-a-cluster) through the CockroachDB {{ site.data.products.cloud }} Console.
- [Set up VPC peering](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization) for clusters running on GCP.
- [View backups](https://www.cockroachlabs.com/docs/cockroachcloud/use-managed-service-backups) that Cockroach Labs has taken for your CockroachDB {{ site.data.products.cloud }} cluster.

## July 6, 2020

<h3 id="2020-07-06-general-changes">General changes</h3>

- You can now update your email address and password in your profile.

<h3 id="2020-07-06-console-changes">Console changes</h3>
You can now [add or remove nodes](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#add-or-remove-nodes-from-a-cluster) from your cluster through the Console.

{{site.data.alerts.callout_info}}
At this time, you cannot use the Console to scale up a single-node cluster or scale down to a single-node cluster. For these changes, contact [Support](https://support.cockroachlabs.com).
{{site.data.alerts.end}}

## June 11, 2020

<h3 id="2020-06-11-general-changes">General changes</h3>

- You can now create a 30-day free CockroachDB {{ site.data.products.cloud }} cluster using the code `CRDB30`. The [Quickstart guide](https://www.cockroachlabs.com/docs/cockroachcloud/quickstart) shows you how to create and connect to your free cluster and run your first query.

- You can now edit your name in your profile.

## May 4, 2020

<h3 id="2020-05-04-general-changes">General changes</h3>

- Updated the layout of the <a href="https://cockroachlabs.cloud/signup?referralId=docs_cc_release_notes" rel="noopener" target="_blank">Sign up</a> page.
- [CockroachDB {{ site.data.products.cloud }} Org Administrators](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#org-administrator) can now [update their {{ site.data.products.cloud }} organization's name](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#organization).
- [CockroachDB {{ site.data.products.cloud }} Org Administrators](https://www.cockroachlabs.com/docs/cockroachcloud/authorization#org-administrator) can now [delete their {{ site.data.products.cloud }} Organization](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#organization).

## April 6, 2020

<h3 id="2020-04-06-general-changes">General changes</h3>

- Free trials of CockroachDB {{ site.data.products.cloud }} are now available. [Contact us](https://www.cockroachlabs.com/contact-sales/) to request a trial code.
- CockroachDB {{ site.data.products.cloud }} now supports VPC peering for clusters running on GCP. [Contact us](https://support.cockroachlabs.com/hc/en-us) to set up a VPC peering-enabled CockroachDB {{ site.data.products.cloud }} cluster.

<h3 id="2020-04-06-security-changes">Security changes</h3>

CockroachDB {{ site.data.products.cloud }} now requires a user to have a CockroachDB {{ site.data.products.cloud }} account before accepting an invite to join an Organization.

- The hardware options displayed while [creating a cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster) have been renamed as "Option 1" and "Option 2".
- CockroachDB {{ site.data.products.cloud }} users who are not a member of an existing Organization can now create an Organization when they log into the CockroachDB {{ site.data.products.cloud }} Console.

<h3 id="2020-04-06-doc-changes">Doc changes</h3>

- Documented the [upgrade policy](https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy) for CockroachDB upgrades for CockroachDB {{ site.data.products.cloud }} clusters.

## March 2, 2020

<h3 id="2020-03-02-general-changes">General changes</h3>

- CockroachDB {{ site.data.products.cloud }} pricing is now available on the [pricing page](https://www.cockroachlabs.com/pricing/).
- CockroachDB {{ site.data.products.cloud }} clusters running CockroachDB v19.2 have been upgraded to [v19.2.4]({% link releases/v19.2.md %}#v19-2-4). All new clusters will now be created with CockroachDB v19.2.4.
- CockroachDB {{ site.data.products.cloud }} now offers two options for per-node hardware configuration instead of three options. The hardware configuration [pricing](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster#step-2-select-the-cloud-provider) has been updated accordingly.
- Added a **Sign up** link to the [CockroachDB {{ site.data.products.cloud }} **Log In** page](https://cockroachlabs.cloud/).
- While [creating a new cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster), you can now type in the number of nodes you want in the cluster instead of having to click the `+` sign repeatedly.
- The [**Create cluster**](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster) page now displays the estimated hourly cost instead of the monthly cost.
- Removed the cluster creation banner displayed at the top of the [**Clusters page**](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#view-clusters-page).
- CockroachDB {{ site.data.products.cloud }} now alphabetically sorts the nodes on a [**Cluster Overview page**](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management#view-cluster-overview).
- CockroachDB {{ site.data.products.cloud }} no longer displays IOPS per node on the [**Create cluster**](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster) page.
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

- Added language-specific connection string examples to the [Connect to your cluster](https://www.cockroachlabs.com/docs/cockroachcloud/connect-to-your-cluster) document.
- Added a tutorial on [streaming an enterprise changefeed from CockroachDB {{ site.data.products.cloud }} to Snowflake](https://www.cockroachlabs.com/docs/cockroachcloud/stream-changefeed-to-snowflake-aws).
- Added a tutorial on [developing and deploying a multi-region web application](https://www.cockroachlabs.com/docs/v20.1/multi-region-overview).

{% comment %}Add new entries to the TOP of the file (not here) in reverse chronological order{% endcomment %}
