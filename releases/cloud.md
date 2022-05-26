---
title: CockroachDB Cloud Release Notes
summary: Changelog for CockroachDB Cloud.
toc: true
redirect-from: index-cockroachcloud.html
docs_area: releases
---

CockroachDB Cloud supports the latest major version of CockroachDB and the version immediately preceding it. All clusters are subject to automatic upgrades to the latest supported minor version. [{{ site.data.products.serverless }}](../cockroachcloud/quickstart.html) clusters are subject to automatic upgrades for both minor and major releases while Serverless is in beta. For more information, see the [{{ site.data.products.db }} Upgrade Policy](../cockroachcloud/upgrade-policy.html).

Get future release notes emailed to you:

{% include marketo.html %}

{{site.data.alerts.callout_version}}
As of April 20, 2022, new {{ site.data.products.dedicated }} clusters and all {{ site.data.products.serverless }} clusters are running CockroachDB [v21.2.9](v21.2.html).
{{site.data.alerts.end}}

## June 6, 2022

<h3>General changes</h3>

- [Datadog integration](cockroachcloud/monitoring-page.html#monitor-with-datadog) is now available on the **Monitoring** page for all {{ site.data.products.dedicated }} users.

<h3>Console changes</h3>

- When creating a [SQL user](../cockroachcloud/console-access-management.html#sql-users) or regenerating a SQL user's password, the generated password is now hidden until the user clicks **Reveal password**.

<h3>API</h3>

- Paginated [API](../cockroachcloud/cloud-api.html) endpoints now accept a single `page` parameter for next or previous pages. Pagination response messages now contain only two fields: `next_page` and `previous_page`, whose values can be used for the `page` field in a followup call.

## May 5, 2022

<h3>Console changes</h3>

- All organizations can now create [service accounts](../cockroachcloud/console-access-management.html#service-accounts) and [API keys](../cockroachcloud/console-access-management.html#api-access), and have access to the [Cloud API](../cockroachcloud/cloud-api.html).
- The [`ccloud` command line tool](../cockroachcloud/ccloud-get-started.html) for creating, managing, and connecting to CockroachDB Cloud clusters is now in public beta.

## May 2, 2022

<h3>Console changes</h3>

- Added **Distributed execution** and **Vectorized execution** information to the **Overview** tab of the **Statement Details** page.
- Added `FULL SCAN` information to the **Explain plan** tab of the **Statement Details** page.  
- Users without accounts can now accept invitations by creating a user using SSO-based authorization such as GitHub.
- Timeseries charts are now displayed in UTC.

<h3>Bug fixes</h3>

- Fixed broken links to the **Statement Details** page from the **Advanced Debug** and **Sessions** pages.
- Fixed a bug where regenerating a SQL user password would fail with a duplicate user warning.
- Deleted clusters will no longer be visible after they've been deleted. Previously, a full page refresh was needed to update the **Clusters** page.
- Fixed a bug that caused charges on the **Cluster overview** page to show an error state for users with the Developer role. Cluster charges are now hidden for Developers and only available to users with the Admin role.
- Fixed a bug where adding decimals to a {{ site.data.products.serverless }} cluster's spend limit would cause an error, but the spend limit could still be set.
- Fixed a bug where opening or closing the list of nodes on a multi-node {{ site.data.products.dedicated }} cluster's **Cluster overview** page would result in a duplicated row of nodes.
- Fixed a bug for credit card users where the credit card form was occasionally loading as a blank box. Now, the credit card form will always load properly without needing to refresh the page.

## April 27, 2022

<h3>General changes</h3>

- {{ site.data.products.dedicated }} contract customers can now [scale clusters](../cockroachcloud/cluster-management.html) through the Console.

<h3>Console changes</h3>

- Contract customers can now view information about their organization's credit grants on the **Overview** tab of the [**Billing** page](../cockroachcloud/billing-management.html).

## April 20, 2022

<h3>Console changes</h3>

- [SQL user passwords](../cockroachcloud/console-access-management.html#sql-users) are now generated and saved automatically to simplify the connection experience.
- When [connecting to your cluster](../cockroachcloud/connect-to-a-serverless-cluster.html), the CA certificate download is now hidden once you have already downloaded the certificate.

<h3>Documentation changes</h3>

- Improved {{ site.data.products.serverless }} [cluster connection](../cockroachcloud/connect-to-a-serverless-cluster.html) documentation, including a [third-party tool connection guide](../stable/connect-to-the-database.html), improved [Quickstart](../cockroachcloud/quickstart.html), and CRUD app examples.

## April 4, 2022

<h3>Console changes</h3>

- You no longer need to download a CA certificate to [connect to a {{ site.data.products.serverless }}](../cockroachcloud/connect-to-a-serverless-cluster.html) cluster through the CockroachDB SQL client if your cluster is running [v21.2.5](v21.2.html) or later.
- When [creating a {{ site.data.products.dedicated }} cluster](../cockroachcloud/create-your-cluster.html), the approximate monthly cost is now displayed in the **Summary** sidebar along with the hourly cost.

## March 7, 2022

<h3>Console changes</h3>

- {{ site.data.products.db }} clusters now have a **Databases** page in the Console, which shows your databases, tables, indexes, and grants.
- When creating or editing a SQL user, passwords are now generated and saved automatically when users click the **Generate and save password** button. Previously, users had to enter passwords manually and remember to save them.
- {{ site.data.products.dedicated }} users can now [restore](../cockroachcloud/backups-page.html) databases configured for multiple regions.

## February 10, 2022

<h3>General changes</h3>

- New {{ site.data.products.dedicated }} clusters can now be [created with custom hardware options](../cockroachcloud/create-your-cluster.html). Previously, there were four hardware options, and compute and storage were linked.
- {{ site.data.products.dedicated }} users can now scale a cluster's [compute](../cockroachcloud/cluster-management.html) and [storage](../cockroachcloud/cluster-management.html). Previously, the only way to scale up a {{ site.data.products.dedicated }} cluster was by adding more nodes.

<h3>Console changes</h3>

- There is now a **Hardware** column on the **Clusters** page that shows the hardware configuration for {{ site.data.products.dedicated }} clusters.

## February 7, 2022

<h3>General changes</h3>

- Six new regions are available for {{ site.data.products.serverless }} clusters:

    GCP                              | AWS
    ---------------------------------|------------
    Oregon (`us-west2`)              | Mumbai (`ap-south-1`)
    Sao Paulo (`southamerica-east1`) | Frankfurt (`eu-central-1`)
    South Carolina (`us-east1`)      | N. Virginia (`us-east-1`)

<h3>Console changes</h3>

- The [**Terminate Session** and **Terminate Statement**](../cockroachcloud/sessions-page.html#sessions-table) options are now enabled for {{ site.data.products.db }} clusters running CockroachDB [v21.2.2](v21.2.html#v21-2-2) or later.
- Selecting a transaction from the [**Transactions** page](../cockroachcloud/transactions-page.html) now opens a new [**Transaction Details**](../cockroachcloud/transactions-page.html#transaction-details-page) page with an improved design.
- The order of the tabs on the **SQL Activity** page has been changed to [**Statements**](../cockroachcloud/statements-page.html), [**Transactions**](../cockroachcloud/transactions-page.html), and [**Sessions**](../cockroachcloud/sessions-page.html).

<h3>Bug fixes</h3>

- Fixed a number of broken links throughout the {{ site.data.products.db }} Console.
- Fixed a bug where {{ site.data.products.serverless }} users were seeing occasional dips and spikes in a cluster's [**Request Units**](../cockroachcloud/cluster-overview-page.html#request-units) usage graph while running a steady workload.

## January 10, 2022

<h3>General changes</h3>

- New {{ site.data.products.dedicated }} clusters will now run [v21.2.3](v21.2.html#v21-2-3).
- {{ site.data.products.serverless }} clusters will now run CockroachDB [v21.2.0-beta.4](v21.2.html#v21-2-0-beta-4).
- The CockroachDB documentation navigation is now organized by user task instead of by product for {{ site.data.products.serverless }}, {{ site.data.products.dedicated }}, and {{ site.data.products.core }} v21.2. Topics specific to Serverless and Dedicated clusters are within the new top-level user task categories. {{ site.data.products.db }} release notes are under Reference.

<h3>Console changes</h3>

- The [**Billing**](../cockroachcloud/billing-management.html) page is now separated into two tabs, **Overview** and **Payment Details**.

## December 6, 2021

<h3>General changes</h3>

- New {{ site.data.products.dedicated }} clusters will now run [v21.2.1](v21.2.html#v21-2-1).
- {{ site.data.products.serverless }} clusters will now run CockroachDB [v21.2.0-beta.4](v21.2.html#v21-2-0-beta-4).
- New {{ site.data.products.db }} clusters will now have [Admission Control](../v21.2/architecture/admission-control.html) enabled by default.
- {{ site.data.products.dedicated }} clusters will now run on new [machine types and disks](../cockroachcloud/create-your-cluster.html#step-2-select-the-cloud-provider). Clusters created before December 1, 2021 will be transitioned to the new hardware configurations by the end of the month, and pricing may change slightly.

<h3>Console changes</h3>

- The **Add/remove nodes** button is now disabled for custom clusters. If you are a contract customer and would like to scale your custom cluster, [contact Support](https://support.cockroachlabs.com/).

<h3>Bug fixes</h3>

- Fixed a bug where an error was occurring on the [VPC Peering and AWS PrivateLink](../cockroachcloud/network-authorization.html) pages for clusters with a large number of jobs.
- Fixed a bug where the **Test email alerts** section on the [**Alerts** page](../cockroachcloud/alerts-page.html) was not visible for organizations with only custom clusters.
- Fixed a bug where users were prompted to upgrade {{ site.data.products.serverless }} clusters, which are [upgraded automatically](../cockroachcloud/upgrade-policy.html).
- Previously, [SQL metrics graphs](../cockroachcloud/cluster-overview-page.html) for inactive {{ site.data.products.serverless }} clusters showed discontinuous time series lines or an error message. Continuous graphs will now remain available for scaled-down clusters.

## November 8, 2021

<h3>General changes</h3>

- [{{ site.data.products.serverless }}](https://www.cockroachlabs.com/blog/announcing-cockroachdb-serverless/), a fully-managed, auto-scaling deployment of CockroachDB, is now available. To get started with {{ site.data.products.serverless }} for free, see the [Quickstart](../cockroachcloud/quickstart.html).
- CockroachCloud Free (beta) and CockroachCloud are now {{ site.data.products.serverless }} and {{ site.data.products.dedicated }}, respectively. Your ability to use your cluster will not be affected.
- {{ site.data.products.serverless }} clusters will now run CockroachDB [v21.2.0-beta.4](v21.2.html#v21-2-0-beta-4).
- New {{ site.data.products.dedicated }} clusters will now run CockroachDB [v21.1.11](v21.1.html#v21-1-11).

<h3>Console changes</h3>

- The [**Statements**](../cockroachcloud/statements-page.html), [**Transactions**](../cockroachcloud/transactions-page.html), and [**Sessions**](../cockroachcloud/sessions-page.html) pages are now available for {{ site.data.products.serverless }} clusters on the **SQL Activity** page.
- Statements and transaction statistics are now retained longer for all clusters.
- Legends are now displayed by default for time-series graphs on the [Cluster Overview](../cockroachcloud/cluster-overview-page.html#cluster-overview-metrics) page.
- The **Transaction retries** metric is no longer part of the **Current activity** panel on the {{ site.data.products.serverless }} [Cluster Overview](../cockroachcloud/cluster-overview-page.html#cluster-statistics-panel) page.
- Deleting an organization with outstanding charges that have not been billed is now prohibited.
- There is now a more clear error message for users attempting to log into {{ site.data.products.db }} using GitHub when they have email and password authentication configured.
- Average RU usage is now shown in the **Request Units** chart for the {{ site.data.products.serverless }} [Cluster Overview](../cockroachcloud/cluster-overview-page.html#request-units) page.
- The PowerShell command to [download the CockroachDB binary](../cockroachcloud/connect-to-your-cluster.html?filters=windows#step-3-connect-to-your-cluster) is now improved for Windows users.
- When under 1 GiB of storage has been used, storage is now shown in MiB instead of GiB in the **Storage used** graph on the {{ site.data.products.serverless }} [Cluster Overview](../cockroachcloud/cluster-overview-page.html#storage-used) page.
- A more descriptive error message is now displayed when attempting to create or edit a [SQL user](../cockroachcloud/user-authorization.html#manage-sql-users) with an invalid username.
- Previously, clicking **cancel** while editing a cluster would take users back to the **Clusters** page. Now, users are taken back to the cluster's **Overview** page.

<h3>Bug fixes</h3>

- Fixed a bug where, if a user had reached the maximum number of {{ site.data.products.serverless }} clusters and refreshed the **Create your cluster** page, the {{ site.data.products.serverless-plan }} plan was auto-selected even though it is disabled.
- Fixed a bug where clicking **Cancel** while logging in with GitHub would report and internal error.
- Fixed a bug where organization deletion was temporarily broken.
- Fixed a bug that was preventing the **Request Units** and **SQL Statements** graphs on the {{ site.data.products.serverless }} [Cluster Overview](../cockroachcloud/cluster-overview-page.html#cluster-overview-metrics) page from updating after a certain amount of time.

## October 4, 2021

<h3>General changes</h3>

- New CockroachCloud clusters will now run CockroachDB [v21.1.9](v21.1.html#v21-1-9).

<h3>Bug fixes</h3>

- Fixed an error in the connection string for Windows users [connecting to CockroachCloud Free (beta)](../cockroachcloud/connect-to-a-free-cluster.html) clusters.

<h3>Miscellaneous changes</h3>

- Cluster names are now included in cluster creation email alerts.

## September 7, 2021

<h3>General changes</h3>

- New CockroachCloud clusters will now run CockroachDB [v21.1.7](v21.1.html#v21-1-7).

<h3>Console changes</h3>

- All pages shown to logged out users are now optimized for mobile devices.

- Improved the error message when an [AWS PrivateLink](../cockroachcloud/network-authorization.html#aws-privatelink) endpoint request fails.

<h3>Bug fixes</h3>

- Fixed tooltip behavior on **Sessions**, **Statements**, and **Transactions** pages.

- Fixed a bug where clicking on the label of the [Terms of Service](https://www.cockroachlabs.com/cloud-terms-and-conditions/) checkbox would select the Terms of Service checkbox when signing up with GitHub.

## August 9, 2021

<h3>General changes</h3>

- New CockroachCloud clusters will now run CockroachDB [v21.1.6](v21.1.html#v21-1-6).
- CockroachCloud Free (beta) users can now perform [bulk operations](../cockroachcloud/run-bulk-operations.html) (`IMPORT`, `BACKUP`, `RESTORE` and CDC) with `userfile` storage.

<h3>Console changes</h3>

- Improved user experience on the Cluster Overview page for a deleted cluster.
- Improved error message for cluster upgrade failures.
- SQL-related restore errors are now shown in the Console, allowing users to take action.

<h3>Security changes</h3>

- Password reset tokens will now expire after 24 hours.
- Email change tokens are now single use and will expire.
- Email change links are now revoked during certain user events such as password resets.
- Resetting the password of a SQL user no longer grants that user the admin SQL role.

## July 6, 2021

<h3>General changes</h3>

- New CockroachCloud clusters will now run CockroachDB [v21.1.5](v21.1.html#v21-1-5).
- Starting this month, paid CockroachCloud clusters will be billed monthly instead of every two weeks.

<h3>Console changes</h3>

- [Multi-region](../cockroachcloud/create-your-cluster.html#step-3-select-the-region-s) clusters can now be created through the Console. To learn more about creating a multi-region cluster, see [Planning your cluster](../cockroachcloud/plan-your-cluster.html?filters=dedicated).
- The **Connect** modal now has updated commands to make [connecting to your cluster](../cockroachcloud/connect-to-a-serverless-cluster.html) a smoother experience on Mac, Linux, and Windows.
- All CockroachCloud users now have access to the [**Transactions** page](../cockroachcloud/transactions-page.html) in the Console.
- Navigation on the **Clusters** page is now a vertical sidebar instead of horizontal tabs.
- Added a tooltip to the **Upgrade** option in the **Action** Menu, which gives users more version-specific context.
- Users can now **Clear SQL Stats** from the [**Statements** page](../cockroachcloud/statements-page.html) for clusters running [v21.1.3](v21.1.html#v21-1-3) or later.

<h3>Bug fixes</h3>

- Fixed a bug where clicking on the [**Alerts** page](../cockroachcloud/alerts-page.html) broke the Organization header for users with multiple Organizations.
- Fixed a bug where nodes were cycling in clusters running [v21.1.4](v21.1.html#v21-1-4).
- Fixed several broken links to documentation throughout the Console.
- Users will no longer see alerts for clusters that are not in a **ready** state.
- Fixed a bug that was causing users to receive false positive CPU alerts.

## June 7, 2021

<h3>General changes</h3>

- New CockroachCloud clusters will now run CockroachDB [v21.1.1](v21.1.html#v21-1-1).

<h3>Console changes</h3>

- All CockroachCloud Dedicated users now have access to the [**Statements**](../cockroachcloud/statements-page.html) and [**Sessions**](../cockroachcloud/sessions-page.html) pages in the Console.
- All CockroachCloud Dedicated users now have access to the [**Alerts**](../cockroachcloud/alerts-page.html) page in the Console, which allows you to toggle alerts, send test alerts, and manage alert recipients for your Organization.
- Previously, users were getting stuck during the verification step of creating an [AWS PrivateLink](../cockroachcloud/network-authorization.html#aws-privatelink) endpoint. Now, users can enter the verification step of the **Add Endpoint Connection** dialog with an incomplete connection endpoint ID preset.
- Added a **Cloud** column to the **Clusters** page so users can see which cloud provider any cluster is using without having to click through to the **Cluster Overview** page.
- The maximum number of nodes in a cluster created through the Console was raised to 50 nodes per region and 150 nodes per cluster.

<h3>Bug fixes</h3>

- Fixed a bug where clicking the **Logout** button would trigger an error and display a blank page.
- The page will no longer refresh after switching the authentication method through the **Account** page.
- Switching organizations will no longer log you out of all sessions.

## May 3, 2021

<h3>General changes</h3>

- New CockroachCloud clusters will now run CockroachDB [v20.2.8](v20.2.html#v20-2-8).
- [CockroachCloud Free](../cockroachcloud/quickstart.html) clusters are now available in four additional regions:
    - GCP: `europe-west1`, `asia-southeast1`
    - AWS: `eu-west-1`, `ap-southeast-1`

<h3>Console changes</h3>

- New users can now [sign up](../cockroachcloud/create-an-account.html) for CockroachCloud with Github Authorization. Logging in with GitHub allows users to enforce [GitHub's two-factor authentication (2FA)](https://docs.github.com/en/github/authenticating-to-github/securing-your-account-with-two-factor-authentication-2fa) on their CockroachCloud account. Current users can [switch their login method](../cockroachcloud/create-an-account.html#change-your-login-method) between email and GitHub.
- When logging in fails due to user input, the error message now includes [login method](../cockroachcloud/create-an-account.html#change-your-login-method) as a potential reason for failure.
- Previously, selecting a new cloud provider while [creating a cluster](../cockroachcloud/create-a-serverless-cluster.html) would reset the **Region** and **Hardware per node** options to default. Now, equivalent region and hardware options are preselected, and the number of nodes per region is preserved when a new cloud provider is selected.

<h3>Bug fixes</h3>

- **Contact Us** links now direct users to the [customer support portal](https://support.cockroachlabs.com/) instead of the user's mail app.

## April 5, 2021

<h3>General changes</h3>

New CockroachCloud clusters will now run CockroachDB [v20.2.7](v20.2.html#v20-2-7).

<h3>Console changes</h3>

- The [login form](https://cockroachlabs.cloud/login) no longer focuses on the email field on page load. This change makes the form more flexible once other authentication methods are available.
- Extraneous information is no longer displayed in the error for failed [GCP peering](../cockroachcloud/network-authorization.html#vpc-peering) attempts.
- Added a resource panel to the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud), which can be accessed by clicking the **?** icon in the top right corner of the Console. Included in the resource panel are links to relevant documentation, Cockroach University, the CockroachDB Slack community, and much more.
- Created a new [Status Page](https://status.cockroachlabs.cloud) that displays the current service status and incident communication of the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud), AWS services, and GCP services.

<h3>Bug fixes</h3>

- The region shown in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) for free-tier clusters is now correct. Previously, the Console showed the wrong region when creating an AWS free-tier cluster.
- Fixed a bug where an error occurred when displaying the **Connect** modal for an old GCP cluster that does not have the custom `crdb` network. These clusters do not support VPC peering, but the lack of the `crdb` network was causing the listing of VPC peerings to fail even though no such peerings exist.

## March 8, 2021

<h3>General changes</h3>

New CockroachCloud clusters will now run CockroachDB [v20.2.5](v20.2.html#v20-2-5).

<h3>Console changes</h3>

- Self-service [AWS PrivateLink](../cockroachcloud/network-authorization.html#aws-privatelink) is now generally available for CockroachCloud clusters running on AWS.
- On the [**Clusters** page](../cockroachcloud/cluster-management.html#view-clusters-page), clusters that are running unsupported versions now have a warning in the **Version** column.

<h3>Security changes</h3>

- CockroachCloud now does not include the supplied password in error messages that arise from resetting, editing, or creating a password when the password is too short.
- CockroachCloud now prevents clickjacking attacks by specifying `X-Frame-Options: DENY` when serving `index.html`.

<h3>Bug fixes</h3>

- Previously, users who were not a member of any organization would get an error when trying to reset their password. A user would most likely encounter this scenario if they deleted their organization, tried to log in again, and didn't remember their password. Now, an organization will be created for the user if one does not exist. The [organization name can be edited](../cockroachcloud/create-an-account.html#change-your-organization-name) on the **Settings** tab on the organization's landing page.

## February 9, 2021

<h3>General changes</h3>

New CockroachCloud clusters will now run CockroachDB [v20.2.4](v20.2.html#v20-2-4).

- [CockroachCloud Free](../cockroachcloud/serverless-faqs.html) is now in beta. CockroachCloud Free (beta) delivers free CockroachDB clusters for you and your organization. It is a managed instance of CockroachDB that removes the friction of initial cluster sizing and auto-scales based on your application traffic. There is an upper limit of usage of up to 1 vCPU and 5GB storage per free cluster.

    You can submit feedback or log any bugs you find through [this survey](https://forms.gle/jWNgmCFtF4y15ePw5).

- You can now [restore databases and tables](../cockroachcloud/backups-page.html) from backups of CockroachCloud clusters. This feature is only available to clusters running the paid version of CockroachCloud.
- [reCAPTCHA](https://www.google.com/recaptcha/about/) has been added to the sign up process for new users signing up with an email and password. Some users may need to complete an image challenge.
- An email will now be sent to [Console Admins](../cockroachcloud/console-access-management.html#console-admin) when a [30-day free trial of CockroachCloud](../cockroachcloud/quickstart-trial-cluster.html) is nearing its end and once it has expired.

## January 22, 2021

<h3>General changes</h3>

New CockroachCloud clusters will now run CockroachDB [v20.2.3](v20.2.html#v20-2-3).

<h3>Bug fixes</h3>

- Fixed a bug where deleting your only organization would prevent your email from being used for a new organization in the future.
- Fixed a bug where [VPC peering](../cockroachcloud/network-authorization.html#vpc-peering) appeared to be available on clusters that it wasn't supported on.

## December 11, 2020

<h3>General changes</h3>

New CockroachCloud clusters will now run CockroachDB [v20.2.2](v20.2.html#v20-2-2).

- CockroachCloud is now offering [larger machine sizes](../cockroachcloud/create-your-cluster.html#step-2-select-the-cloud-provider) to be configured directly in the Console. You will now be able to select from four options in the create cluster workflow. The [pricing has also been updated](../cockroachcloud/create-your-cluster.html#step-2-select-the-cloud-provider) for newly created clusters. Existing clusters are not impacted by the pricing changes.

## November 19, 2020

<h3>General changes</h3>

New CockroachCloud clusters will now run CockroachDB [v20.2.0](v20.2.html#v20-2-0).

- [Create a 30-day free CockroachCloud cluster](../cockroachcloud/quickstart.html).
- [Add or remove nodes](../cockroachcloud/cluster-management.html#add-or-remove-nodes-from-a-cluster) through the {{ site.data.products.db }} Console.
- [Set up VPC peering](../cockroachcloud/network-authorization.html) for clusters running on GCP.
- [View backups](../cockroachcloud/backups-page.html) that Cockroach Labs has taken for your CockroachCloud cluster.


## July 6, 2020

You can now [add or remove nodes](../cockroachcloud/cluster-management.html#add-or-remove-nodes-from-a-cluster) from your cluster through the Console.

{{site.data.alerts.callout_info}}
At this time, you cannot use the Console to scale up a single-node cluster or scale down to a single-node cluster. For these changes, contact [Support](https://support.cockroachlabs.com).
{{site.data.alerts.end}}

<h3>General changes</h3>

- You can now update your email address and password in your profile.

## June 11, 2020

You can now create a 30-day free CockroachCloud cluster using the code `CRDB30`. The [Quickstart guide](../cockroachcloud/quickstart.html) shows you how to create and connect to your free cluster and run your first query.

<h3>General changes</h3>

- You can now edit your name in your profile.

## May 4, 2020

<h3>General changes</h3>

- Updated the layout of the <a href="https://cockroachlabs.cloud/signup?referralId=docs_cc_release_notes" rel="noopener" target="_blank">Sign up</a> page.
- [{{ site.data.products.db }} Console Admins](../cockroachcloud/console-access-management.html#console-admin) can now update their [CockroachCloud Organization](../cockroachcloud/console-access-management.html#organization) name.
- [{{ site.data.products.db }} Console Admins](../cockroachcloud/console-access-management.html#console-admin) can now delete their [CockroachCloud Organization](../cockroachcloud/console-access-management.html#organization).

## April 6, 2020

In addition to various updates, this beta release includes the following major highlights:

- Free trials of CockroachCloud are now available. [Contact us](https://www.cockroachlabs.com/contact-sales/) to request a trial code.
- CockroachCloud now supports VPC peering for clusters running on GCP. [Contact us](https://support.cockroachlabs.com/hc/en-us) to set up a VPC peering-enabled CockroachCloud cluster.

<h3>Security changes</h3>

CockroachCloud now requires a user to have a CockroachCloud account before accepting an invite to join an Organization.

<h3>General changes</h3>

- The hardware options displayed while [creating a cluster](../cockroachcloud/create-your-cluster.html) have been renamed as "Option 1" and "Option 2".
- CockroachCloud users who are not a member of an existing Organization can now create an Organization when they log into the {{ site.data.products.db }} Console.

<h3>Doc changes</h3>

- Documented the [upgrade policy](../cockroachcloud/upgrade-policy.html) for CockroachDB upgrades for CockroachCloud clusters.

## March 2, 2020

In addition to various updates, enhancements, and bug fixes, this beta release includes the following major highlights:

- CockroachCloud pricing is now available on the [pricing page](https://www.cockroachlabs.com/pricing/).
- CockroachCloud clusters running CockroachDB v19.2 have been upgraded to [v19.2.4](https://www.cockroachlabs.com/docs/releases/v19.2.4.html). All new clusters will now be created with CockroachDB v19.2.4.
- CockroachCloud now offers two options for per-node hardware configuration instead of three options. The hardware configuration [pricing](../cockroachcloud/create-your-cluster.html#step-2-select-the-cloud-provider) has been updated accordingly.

<h3>Security changes</h3>

- CockroachCloud now requires that the password for a SQL user is at least 12 characters in length.
- CockroachCloud now allows you to download the cluster's CA certificate directly from the shell instead of restricting the download functionality to a web browser.

<h3>General changes</h3>

- Added a **Sign up** link to the [CockroachCloud **Log In** page](https://cockroachlabs.cloud/).
- While [creating a new cluster](../cockroachcloud/create-your-cluster.html), you can now type in the number of nodes you want in the cluster instead of having to click the `+` sign repeatedly.
- The [**Create cluster**](../cockroachcloud/create-your-cluster.html) page now displays the estimated hourly cost instead of the monthly cost.
- Removed the cluster creation banner displayed at the top of the [**Clusters page**](../cockroachcloud/cluster-management.html#view-clusters-page).
- CockroachCloud now alphabetically sorts the nodes on a [**Cluster Overview page**](../cockroachcloud/cluster-management.html#view-cluster-overview).
- CockroachCloud no longer displays IOPS per node on the [**Create cluster**](../cockroachcloud/create-your-cluster.html) page.
- Billing periods are now displayed in the UTC timezone.
- If you are the only Admin for a CockroachCloud Organization, you can no longer change your role to Developer. Assign another user as Admin and then change your role to Developer.

<h3>Bug fixes</h3>

- Fixed a bug where all organizations with billing enabled and without a billing email address were assigned an internal Cockroach Labs email address.
- CockroachCloud no longer displays an error message if the internal feature flag for billing is disabled for all organizations.
- Fixed a bug that required users to update their email address on updating their billing address.
- Names of deleted clusters can now be reused for new clusters.

<h3>Doc changes</h3>

- Added language-specific connection string examples to the [Connect to your cluster](../cockroachcloud/connect-to-your-cluster.html) document.
- Added a tutorial on [streaming an enterprise changefeed from CockroachCloud to Snowflake](../cockroachcloud/stream-changefeed-to-snowflake-aws.html).
- Added a tutorial on [developing and deploying a multi-region web application](../v20.1/multi-region-overview.html).
