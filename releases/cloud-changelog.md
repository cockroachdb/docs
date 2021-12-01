---
title: CockroachDB Cloud Release Notes
summary: Changelog for CockroachDB Cloud.
toc: true
---

CockroachDB Cloud supports the latest major version of CockroachDB and the version immediately preceding it. All clusters are subject to automatic upgrades to the latest supported minor version. [{{ site.data.products.serverless }}](../cockroachcloud/quickstart.html) clusters are subject to automatic upgrades for both minor and major releases while in beta. For more information, see the [{{ site.data.products.db }} Upgrade Policy](../cockroachcloud/upgrade-policy.html).

Get future release notes emailed to you: 

{% include marketo.html %}

<br>
<h5 class="general">General</h5> <h5 class="console">Console</h5><h5 class="bug">Bugs</h5><h5 class="security">Security</h5><h5 class="misc">Miscellaneous</h5>

## November 8, 2021

<h5 class="general">General changes</h5>

- [{{ site.data.products.serverless }}](https://www.cockroachlabs.com/blog/announcing-cockroachdb-serverless/), a fully-managed, auto-scaling deployment of CockroachDB, is now available. To get started with {{ site.data.products.serverless }} for free, see the [Quickstart](../cockroachcloud/quickstart.html).
- CockroachCloud Free (beta) and CockroachCloud are now {{ site.data.products.serverless }} and {{ site.data.products.dedicated }}, respectively. Your ability to use your cluster will not be affected.
- {{ site.data.products.serverless }} clusters will now run CockroachDB [v21.2.0-beta.4](v21.2.0-beta.4.html).
- New {{ site.data.products.dedicated }} clusters will now run CockroachDB [v21.1.11](v21.1.11.html).

<h5 class="console">Console changes</h5>

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

<h5 class="bug">Bug fixes</h5>

- Fixed a bug where, if a user had reached the maximum number of {{ site.data.products.serverless }} clusters and refreshed the **Create your cluster** page, the {{ site.data.products.serverless-plan }} plan was auto-selected even though it is disabled.
- Fixed a bug where clicking **Cancel** while logging in with GitHub would report and internal error.
- Fixed a bug where organization deletion was temporarily broken.
- Fixed a bug that was preventing the **Request Units** and **SQL Statements** graphs on the {{ site.data.products.serverless }} [Cluster Overview](../cockroachcloud/cluster-overview-page.html#cluster-overview-metrics) page from updating after a certain amount of time.

## October 4, 2021

<h5 class="general">General changes</h5>

- New CockroachCloud clusters will now run CockroachDB [v21.1.9](v21.1.9.html).

<h5 class="bug">Bug fixes</h5>

- Fixed an error in the connection string for Windows users [connecting to CockroachCloud Free (beta)](../cockroachcloud/connect-to-a-free-cluster.html) clusters.

<h5 class="misc">Miscellaneous changes</h5>

- Cluster names are now included in cluster creation email alerts.

## September 7, 2021

<h5 class="general">General changes</h5>

- New CockroachCloud clusters will now run CockroachDB [v21.1.7](v21.1.7.html).

<h5 class="console">Console changes</h5>

- All pages shown to logged out users are now optimized for mobile devices.
  
- Improved the error message when an [AWS PrivateLink](../cockroachcloud/network-authorization.html#aws-privatelink) endpoint request fails.

<h5 class="bug">Bug fixes</h5>

- Fixed tooltip behavior on **Sessions**, **Statements**, and **Transactions** pages.

- Fixed a bug where clicking on the label of the [Terms of Service](https://www.cockroachlabs.com/cloud-terms-and-conditions/) checkbox would select the Terms of Service checkbox when signing up with GitHub.

## August 9, 2021

<h5 class="general">General changes</h5>

- New CockroachCloud clusters will now run CockroachDB [v21.1.6](v21.1.6.html).
- CockroachCloud Free (beta) users can now perform [bulk operations](../cockroachcloud/run-bulk-operations.html) (`IMPORT`, `BACKUP`, `RESTORE` and CDC) with `userfile` storage. 

<h5 class="console">Console changes</h5>

- Improved user experience on the Cluster Overview page for a deleted cluster.
- Improved error message for cluster upgrade failures.
- SQL-related restore errors are now shown in the Console, allowing users to take action.

<h5 class="security">Security changes</h5>

- Password reset tokens will now expire after 24 hours.
- Email change tokens are now single use and will expire.
- Email change links are now revoked during certain user events such as password resets.
- Resetting the password of a SQL user no longer grants that user the admin SQL role.

## July 6, 2021

<h5 class="general">General changes</h5>

- New CockroachCloud clusters will now run CockroachDB [v21.1.5](v21.1.5.html).
- Starting this month, paid CockroachCloud clusters will be billed monthly instead of every two weeks.

<h5 class="console">Console changes</h5>

- [Multi-region](../cockroachcloud/create-your-cluster.html#step-3-select-the-region-s) clusters can now be created through the Console. To learn more about creating a multi-region cluster, see [Planning your cluster](../cockroachcloud/cluster-management.html?filters=dedicated#planning-your-cluster).
- The **Connect** modal now has updated commands to make [connecting to your cluster](../cockroachcloud/connect-to-a-serverless-cluster.html) a smoother experience on Mac, Linux, and Windows.
- All CockroachCloud users now have access to the [**Transactions** page](../cockroachcloud/transactions-page.html) in the Console.
- Navigation on the **Clusters** page is now a vertical sidebar instead of horizontal tabs.
- Added a tooltip to the **Upgrade** option in the **Action** Menu, which gives users more version-specific context.
- Users can now **Clear SQL Stats** from the [**Statements** page](../cockroachcloud/statements-page.html) for clusters running [v21.1.3](v21.1.3.html) or later.

<h5 class="bug">Bug fixes</h5>

- Fixed a bug where clicking on the [**Alerts** page](../cockroachcloud/alerts-page.html) broke the Organization header for users with multiple Organizations.
- Fixed a bug where nodes were cycling in clusters running [v21.1.4](v21.1.4.html).
- Fixed several broken links to documentation throughout the Console.
- Users will no longer see alerts for clusters that are not in a **ready** state.
- Fixed a bug that was causing users to receive false positive CPU alerts.

## June 7, 2021

<h5 class="general">General changes</h5>

- New CockroachCloud clusters will now run CockroachDB [v21.1.1](v21.1.1.html).
  
<h5 class="console">Console changes</h5>

- All CockroachCloud Dedicated users now have access to the [**Statements**](../cockroachcloud/statements-page.html) and [**Sessions**](../cockroachcloud/sessions-page.html) pages in the Console.
- All CockroachCloud Dedicated users now have access to the [**Alerts**](../cockroachcloud/alerts-page.html) page in the Console, which allows you to toggle alerts, send test alerts, and manage alert recipients for your Organization.
- Previously, users were getting stuck during the verification step of creating an [AWS PrivateLink](../cockroachcloud/network-authorization.html#aws-privatelink) endpoint. Now, users can enter the verification step of the **Add Endpoint Connection** dialog with an incomplete connection endpoint ID preset.
- Added a **Cloud** column to the **Clusters** page so users can see which cloud provider any cluster is using without having to click through to the **Cluster Overview** page.
- The maximum number of nodes in a cluster created through the Console was raised to 50 nodes per region and 150 nodes per cluster.

<h5 class="bug">Bug fixes</h5>

- Fixed a bug where clicking the **Logout** button would trigger an error and display a blank page.
- The page will no longer refresh after switching the authentication method through the **Account** page.
- Switching organizations will no longer log you out of all sessions.

## May 3, 2021

<h5 class="general">General changes</h5>

- New CockroachCloud clusters will now run CockroachDB [v20.2.8](v20.2.8.html).
- [CockroachCloud Free](../cockroachcloud/quickstart.html) clusters are now available in four additional regions:
    - GCP: `europe-west1`, `asia-southeast1`
    - AWS: `eu-west-1`, `ap-southeast-1`
  
<h5 class="console">Console changes</h5>

- New users can now [sign up](../cockroachcloud/create-an-account.html) for CockroachCloud with Github Authorization. Logging in with GitHub allows users to enforce [GitHub's two-factor authentication (2FA)](https://docs.github.com/en/github/authenticating-to-github/securing-your-account-with-two-factor-authentication-2fa) on their CockroachCloud account. Current users can [switch their login method](../cockroachcloud/create-an-account.html#change-your-login-method) between email and GitHub.
- When logging in fails due to user input, the error message now includes [login method](../cockroachcloud/create-an-account.html#change-your-login-method) as a potential reason for failure.
- Previously, selecting a new cloud provider while [creating a cluster](../cockroachcloud/create-a-serverless-cluster.html) would reset the **Region** and **Hardware per node** options to default. Now, equivalent region and hardware options are preselected, and the number of nodes per region is preserved when a new cloud provider is selected.

<h5 class="bug">Bug fixes</h5>

- **Contact Us** links now direct users to the [customer support portal](https://support.cockroachlabs.com/) instead of the user's mail app.

## April 5, 2021

<h5 class="general">General changes</h5>

New CockroachCloud clusters will now run CockroachDB [v20.2.7](v20.2.7.html).

<h5 class="console">Console changes</h5>

- The [login form](https://cockroachlabs.cloud/login) no longer focuses on the email field on page load. This change makes the form more flexible once other authentication methods are available.
- Extraneous information is no longer displayed in the error for failed [GCP peering](../cockroachcloud/network-authorization.html#vpc-peering) attempts.
- Added a resource panel to the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud), which can be accessed by clicking the **?** icon in the top right corner of the Console. Included in the resource panel are links to relevant documentation, Cockroach University, the CockroachDB Slack community, and much more.
- Created a new [Status Page](https://status.cockroachlabs.cloud) that displays the current service status and incident communication of the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud), AWS services, and GCP services.

<h5 class="bug">Bug fixes</h5>

- The region shown in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) for free-tier clusters is now correct. Previously, the Console showed the wrong region when creating an AWS free-tier cluster.
- Fixed a bug where an error occurred when displaying the **Connect** modal for an old GCP cluster that does not have the custom `crdb` network. These clusters do not support VPC peering, but the lack of the `crdb` network was causing the listing of VPC peerings to fail even though no such peerings exist.

## March 8, 2021

<h5 class="general">General changes</h5>

New CockroachCloud clusters will now run CockroachDB [v20.2.5](v20.2.5.html).

<h5 class="console">Console changes</h5>

- Self-service [AWS PrivateLink](../cockroachcloud/network-authorization.html#aws-privatelink) is now generally available for CockroachCloud clusters running on AWS.
- On the [**Clusters** page](../cockroachcloud/cluster-management.html#view-clusters-page), clusters that are running unsupported versions now have a warning in the **Version** column.

<h5 class="security">Security changes</h5>

- CockroachCloud now does not include the supplied password in error messages that arise from resetting, editing, or creating a password when the password is too short.
- CockroachCloud now prevents clickjacking attacks by specifying `X-Frame-Options: DENY` when serving `index.html`.

<h5 class="bug">Bug fixes</h5>

- Previously, users who were not a member of any organization would get an error when trying to reset their password. A user would most likely encounter this scenario if they deleted their organization, tried to log in again, and didn't remember their password. Now, an organization will be created for the user if one does not exist. The [organization name can be edited](../cockroachcloud/create-an-account.html#change-your-organization-name) on the **Settings** tab on the organization's landing page.

## February 9, 2021

<h5 class="general">General changes</h5>

New CockroachCloud clusters will now run CockroachDB [v20.2.4](v20.2.4.html).

- [CockroachCloud Free](../cockroachcloud/serverless-faqs.html) is now in beta. CockroachCloud Free (beta) delivers free CockroachDB clusters for you and your organization. It is a managed instance of CockroachDB that removes the friction of initial cluster sizing and auto-scales based on your application traffic. There is an upper limit of usage of up to 1 vCPU and 5GB storage per free cluster.

    You can submit feedback or log any bugs you find through [this survey](https://forms.gle/jWNgmCFtF4y15ePw5).

- You can now [restore databases and tables](../cockroachcloud/backups-page.html) from backups of CockroachCloud clusters. This feature is only available to clusters running the paid version of CockroachCloud.
- [reCAPTCHA](https://www.google.com/recaptcha/about/) has been added to the sign up process for new users signing up with an email and password. Some users may need to complete an image challenge.
- An email will now be sent to [Console Admins](../cockroachcloud/console-access-management.html#console-admin) when a [30-day free trial of CockroachCloud](../cockroachcloud/quickstart-trial-cluster.html) is nearing its end and once it has expired.

## January 22, 2021

<h5 class="general">General changes</h5>

New CockroachCloud clusters will now run CockroachDB [v20.2.3](v20.2.3.html).

<h5 class="bug">Bug fixes</h5>

- Fixed a bug where deleting your only organization would prevent your email from being used for a new organization in the future.
- Fixed a bug where [VPC peering](../cockroachcloud/network-authorization.html#vpc-peering) appeared to be available on clusters that it wasn't supported on.

