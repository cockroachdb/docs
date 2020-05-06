---
title: What&#39;s New in CockroachCloud
toc: true
summary: Additions and changes in CockroachCloud.
build_for: [cockroachcloud]
---

## March 02, 2020

In addition to various updates, enhancements, and bug fixes, this beta release includes the following major highlights:

- CockroachCloud pricing is now available on the [pricing page](https://www.cockroachlabs.com/pricing/).
- CockroachCloud clusters running CockroachDB v19.2 have been upgraded to [v19.2.4](https://www.cockroachlabs.com/docs/releases/v19.2.4.html). All new clusters will now be created with CockroachDB v19.2.4.
- CockroachCloud now offers two options for per-node hardware configuration instead of three options. The hardware configuration [pricing](../v20.1/cockroachcloud-create-your-cluster.html#step-2-select-the-cloud-provider) has been updated accordingly.

Get future release notes emailed to you:

<div class="hubspot-install-form install-form-1 clearfix">
    <script>
        hbspt.forms.create({
            css: '',
            cssClass: 'install-form',
            portalId: '1753393',
            formId: '39686297-81d2-45e7-a73f-55a596a8d5ff',
            formInstanceId: 1,
            target: '.install-form-1'
        });
    </script>
</div>

### Security updates

- CockroachCloud now requires that the password for a SQL user is at least 12 characters in length.
- CockroachCloud now allows you to download the cluster's CA certificate directly from the shell instead of restricting the download functionality to a web browser.

### General changes

- Added a **Sign up** link to the [CockroachCloud **Log In** page](https://cockroachlabs.cloud/).
- While [creating a new cluster](../v20.1/cockroachcloud-create-your-cluster.html), you can now type in the number of nodes you want in the cluster instead of having to click the `+` sign repeatedly.
- The [**Create cluster**](../v20.1/cockroachcloud-create-your-cluster.html) page now displays the estimated hourly cost instead of the monthly cost.
- Removed the cluster creation banner displayed at the top of the [**Clusters page**](../v20.1/cockroachcloud-cluster-management.html#view-clusters-page).
- CockroachCloud now alphabetically sorts the nodes on a [**Cluster Overview page**](../v20.1/cockroachcloud-cluster-management.html#view-cluster-overview).
- CockroachCloud no longer displays IOPS per node on the [**Create cluster**](../v20.1/cockroachcloud-create-your-cluster.html) page.
- Billing periods are now displayed in the UTC timezone.
- If you are the only Admin for a CockroachCloud Organization, you can no longer change your role to Developer. Assign another user as Admin and then change your role to Developer.

### Bug fixes

- Fixed a bug where all organizations with billing enabled and without a billing email address were assigned an internal Cockroach Labs email address.
- CockroachCloud no longer displays an error message if the internal feature flag for billing is disabled for all organizations.
- Fixed a bug that required users to update their email address on updating their billing address.
- Names of deleted clusters can now be reused for new clusters.

### Doc updates

- Added language-specific connection string examples to the [Connect to your cluster](../v20.1/cockroachcloud-connect-to-your-cluster.html#use-a-postgres-driver-or-orm) document.
- Added a tutorial on [streaming an enterprise changefeed from CockroachCloud to Snowflake](../v20.1/stream-changefeed-to-snowflake-aws.html).
- Added a tutorial on [developing and deploying a multi-region web application](https://www.cockroachlabs.com/docs/v19.2/multi-region-overview.html).
