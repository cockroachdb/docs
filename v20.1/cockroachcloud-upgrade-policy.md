---
title: Upgrade Your Cluster
summary: Learn about the CockroachCloud upgrade policy.
toc: true
build_for: [cockroachcloud]
---

Now that [CockroachDB v20.1](https://www.cockroachlabs.com/docs/releases/v20.1.0.html) is available, you can upgrade your cluster directly from the CockroachCloud Console. This page walks you through the process.

## Step 1. Select your cluster size

The upgrade process depends on the number of nodes in your cluster. Select whether your cluster has a single node or multiple nodes:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="single-node">Single-node</button>
  <button class="filter-button" data-scope="multi-node">Multi-node</button>
</div>

## Step 2. Understand the process

<section class="filter-content" markdown="1" data-scope="single-node">

When upgrading a single-node cluster, the cluster will be briefly unavailable while the node is stopped and restarted with v20.1.

Once the node has been restarted, you will have approximately 24 hours to monitor your application and, if necessary, rollback to v19.2 from the CockroachCloud Console. Otherwise, the upgrade will be finalized automatically. You'll also have the choice to finalize more quickly. 

Once the upgrade has been finalized, either automatically or manually, certain features and performance improvements in v20.1 will be available. However, it will no longer be possible to roll back to v19.2. If you see unexpected behavior, you will have to reach out to support.

</section>
<section class="filter-content" markdown="1" data-scope="multi-node">

When upgrading a multi-node cluster, the upgrade happens one node at a time without interrupting the cluster's overall health and availability. This "rolling upgrade" approach is possible due to CockroachDB's [multi-active availability](multi-active-availability.html) design.

Once all nodes are running v20.1, you will have approximately 24 hours to monitor your application and, if necessary, rollback to v19.2 from the CockroachCloud Console. Otherwise, the upgrade will be finalized automatically. You'll also have the choice to finalize more quickly.

Once the upgrade has been finalized, either automatically or manually, certain features and performance improvements in v20.1 will be available. However, it will no longer be possible to roll back to v19.2. If you see unexpected behavior, you will have to reach out to support.

</section>

## Step 3. Prepare to upgrade

 Before starting the upgrade, it's important to complete the following steps.

<section class="filter-content" markdown="1" data-scope="single-node">

### Prepare for brief unavailability

Because your cluster will be unavailable while its single node is stopped and restarted with v20.1, prepare your application for this brief downtime.

</section>

### Review breaking changes

Review the following list of backward-incompatible changes in v20.1, and if any affect your application, make necessary changes:

- The `extract()` [built-in function](functions-and-operators.html) with sub-second arguments (millisecond, microsecond) is now Postgres-compatible and returns the total number of seconds in addition to sub-seconds instead of returning only sub-seconds.

- Casting intervals to integers and floats is now Postgres-compatible and values a year at 365.25 days in seconds instead of 365 days.

- The combination of the [`CHANGEFEED`](change-data-capture.html) options `format=experimental_avro`, `envelope=key_only`, and `updated` is now rejected. This is because the use of `key_only` prevents any rows with updated fields from being emitted, which renders the `updated` option meaningless.

- The `cockroach user` CLI command has been removed. It was previously deprecated in CockroachDB v19.2. Note that a v19.2 client (supporting `cockroach user`) can still operate user accounts in a v20.1 server.

- The [`GRANT`](../v20.1/grant.html) and [`REVOKE`](../v20.1/revoke.html) statements now require that the requesting user already have the target privileges themselves. For example, `GRANT SELECT ON t TO foo` requires that the requesting user already have the `SELECT` privilege on `t`.

### Let ongoing bulk operations finish

Make sure there are no [bulk imports](import.html) or [schema changes](online-schema-changes.html) in progress. These are complex operations that can increase the potential for unexpected behavior during an upgrade.</span>

To check for ongoing imports or schema changes, use [`SHOW JOBS`](show-jobs.html#show-schema-changes) or check the [**Jobs** page](admin-ui-jobs-page.html) in the Admin UI.

{{site.data.alerts.callout_info}}
Once your cluster is running v20.1, any ongoing schema changes will stop making progress, but [`SHOW JOBS`](show-jobs.html) and the [**Jobs** page](admin-ui-jobs-page.html) in the Admin UI will show them as running until the upgrade has been finalized. During this time, it won't be possible to manipulate these schema changes via [`PAUSE JOB`](pause-job.html)/[`RESUME JOB`](resume-job.html)/[`CANCEL JOB`](cancel-job.html) statements. Once the upgrade has been finalized, these schema changes will run to completion.

Note that this behavior is specific to upgrades from v19.2 to v20.1; it does not apply to other upgrades.
{{site.data.alerts.end}}

### Prevent new schema changes

Once your cluster is running v20.1, new [schema changes](online-schema-changes.html) will be blocked and return an error, with the exception of [`CREATE TABLE`](create-table.html) statements without foreign key references and no-op schema change statements that use `IF NOT EXISTS`. Update your application or tooling to prevent disallowed schema changes during the upgrade process.

Note that this behavior is specific to upgrades from v19.2 to v20.1; it does not apply to other upgrades.

### Prevent changes to user privileges

Once your cluster is running v20.1, [`GRANT`](grant.html) and [`REVOKE`](revoke.html) statements will be blocked and return and error. This is because privileges are stored with table metadata and, therefore, privilege changes are considered schema changes, from an internal perspective. Update your application or tooling to prevent privilege changes during the upgrade process.

Note that this behavior is specific to upgrades from v19.2 to v20.1; it does not apply to other upgrades.

## Step 4. Start the upgrade

Once you have completed your preparations, starting the upgrade process is simple.

1. [Sign in](https://cockroachlabs.cloud/) to your CockroachCloud account.

2. In the **Clusters** list, select the cluster you want to upgrade.

3. Select **Actions > Upgrade cluster**.

4. On the **Upgrade your cluster** dialog, confirm that you have review the pre-upgrade guidance and then click **Start Upgrade**.

<section class="filter-content" markdown="1" data-scope="single-node">
As mentioned earlier, your single-node cluster will be briefly unavailable while the node is stopped and restarted with v20.1.
</section>

<section class="filter-content" markdown="1" data-scope="multi-node">
As mentioned earlier, your cluster will be upgraded one node at a time without interrupting the cluster's overall health and availability.
</section>

## Step 5. Monitor the upgrade

Once your cluster is running v20.1, you will have approximately 24 hours before the upgrade is automatically finalized. During this time, it is important to monitor your application and respect temporary limations.

### Monitor your application

Use the [Admin UI](cockroachcloud-monitoring-page.html) or your own tooling to monitor your application for any unexpected behavior.

- If everything looks good, you can wait for the upgrade to automatically finalize or you can [trigger finalization more quickly](#finalize-the-upgrade).

- If you see unexpected behavior, you can [rollback to v19.2](#roll-back-the-upgrade). This option is available only during the 24-hour window. If you see unexpected behavior after the upgrade has been finalized, you will have to [reach out to support](https://support.cockroachlabs.com/hc/en-us/requests/new).

### Respect temporary limitations

Before your upgrade has been finalized, remember to [prevent new schema changes](#prevent-new-schema-changes) and [changes to user privileges](#prevent-changes-to-user-privileges) as mention earlier.

Also, most v20.1 features can be used right way, but there are some that will be enabled only after the upgrade has been finalized. Attempting to use these features before then will result in errors:

- **Primary key changes:** After finalization, it will be possible to change the primary key of an existing table using the [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-primary-key.html) statement, or using [`DROP CONSTRAINT` and then `ADD CONSTRAINT`](add-constraint.html#drop-and-add-a-primary-key-constraint) in the same transaction.

- **Additional authentication methods:** After finalization, it will be possible to set the `server.host_based_authentication.configuration` [cluster setting](cluster-settings.html) to `trust` or `reject` to unconditionally allow or deny matching connection attempts.

- **Password for the `root` user**: After finalization, it will be possible to use [`ALTER USER root WITH PASSWORD`](alter-user.html) to set a password for the `root` user.

- **Dropping indexes used by foreign keys:** After finalization, it will be possible to drop an index used by a foreign key constraint if another index exists that fulfills the [indexing requirements](foreign-key.html#rules-for-creating-foreign-keys).

- **Hash-sharded indexes:** After finalization, it will be possible to use [hash-sharded indexes](create-index.html#create-a-hash-sharded-secondary-index) to distribute sequential traffic uniformly across ranges, eliminating single-range hotspots and improving write performance on sequentially-keyed indexes. This is an experimental feature that must be enabled by setting the `experimental_enable_hash_sharded_indexes` session variable to `on`.

- **`CREATEROLE` and `NOCREATEROLE` privileges:** After finalization, it will be possible to allow or disallow a user or role to create, alter, or drop other roles via the `CREATEROLE` or `NOCREATEROLE` privilege.

- **User-defined savepoints:** After finalization, it will be possible to use user-defined [`SAVEPOINT`s](savepoint.html) for nested transactions or for transaction retries in ORMs that require specific savepoint names. Previously, only the CockroachDB-defined `cockroach-restart` savepoint was supported.

- **`TIMETZ` data type:** After finalization, it will be possible to use the [`TIMETZ`](time.html#timetz) data type to store a time of day with a time zone offset from UTC.

- **`TIME`/`TIMETZ` and `INTERVAL` precision:** After finalization, it will be possible to specify precision levels from 0 (seconds) to 6 (microseconds) for [`TIME`/`TIMETZ`](time.html#precision) and [`INTERVAL`](interval.html#precision) values.

## Step 6. Finish the upgrade

### Finalize the upgrade

### Roll back the upgrade


This page describes the upgrade policy for CockroachCloud.

CockroachCloud supports the [latest major version](https://www.cockroachlabs.com/docs/stable/) of CockroachDB and the version immediately preceding it. Support for these versions includes minor version updates and security patches.

## Minor Version Upgrades
[Minor versions](https://www.cockroachlabs.com/docs/releases/) (or "point" releases) are stable, backward-compatible improvements to the major versions of CockroachDB. CockroachCloud automatically upgrades all clusters to the latest supported minor version (for example, v19.2.1 → v19.2.2).

{{site.data.alerts.callout_danger}}
Single-node clusters will experience some downtime during cluster maintenance.
{{site.data.alerts.end}}

## Major Version Upgrades

[Major version releases](https://www.cockroachlabs.com/docs/releases/) contain new functionality and potentially backward-incompatible changes to CockroachDB (for example, v19.2.x → v20.1.x).

If you are a [CockroachCloud Admin](cockroachcloud-console-access-management.html#console-admin), you will receive an email notification for each major version release. The email will have instructions on how to opt in to have your clusters upgraded to the new version.

### Auto-upgrades after CockroachDB version EOL

As CockroachDB releases new major versions, older versions reach their End of Life (EOL) on CockroachCloud. A CockroachDB version reaches EOL on CockroachCloud when it is 2 major versions behind the latest version (for example, CockroachDB 19.1 reaches EOL when CockroachDB 20.1 is released).

If you are running a CockroachDB version nearing EOL, you will be notified at least one month before that version’s EOL that your clusters will be auto-upgraded on the EOL date. You should request an upgrade to a newer CockroachDB version during this timeframe to avoid being force-upgraded.

### Rollback support

The default finalization period for each major upgrade is 7 days from upgrade completion. You can request a rollback of a major upgrade via a [support ticket](https://support.cockroachlabs.com/hc/en-us)  within the 7-day period.
