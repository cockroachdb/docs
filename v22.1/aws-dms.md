---
title: Migrate CockroachDB Schemas with AWS DMS
summary: Learn how to use AWS Database Migration Service (DMS) with a CockroachDB cluster.
toc: true
docs_area: develop
---

This page walks you through a series of simple database schema changes using the [AWS DMS](https://aws.amazon.com/dms/).

For a detailed tutorial about using AWS DMS and information about specific migration tasks, see the [the AWS DMS documentation site](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html).

We have tested the AWS DMS enough to claim **beta-level** support. If you encounter problems in CockroachDB, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

For any issues related to the AWS DMS UI, please reach out to [AWS Support](https://aws.amazon.com/contact-us/).

## Before you begin

Ensure the following items are completed prior to starting this tutorial:

- Configure a [source endpoint](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.html) in AWS pointing to your source database.
- Configure a [replication instance](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_ReplicationInstance.html) in AWS.
- Ensure you have a secure, publicly available CockroachDB cluster running v22.1.

## Step 1. Create a new `dms` user

1. [Connect to your {{ site.data.products.serverless }} cluster](../cockroachcloud/connect-to-a-serverless-cluster.html).

1. In the SQL client, create a new `dms` admin user to handle the migration. Replace `'<password>'` with a strong password:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER dms WITH PASSWORD '<password>';
    > GRANT admin TO dms;
    > ALTER USER dms SET expect_and_ignore_not_visible_columns_in_copy = true;
    ~~~

    {{site.data.alerts.callout_danger}}
    Do not use this user for normal SQL activity. The `expect_and_ignore_not_visible_columns_in_copy` session variable may make it behave unpredictably for normal usage.
    {{site.data.alerts.end}}

## Step 2. Create a target endpoint pointing to CockroachDB

1. In the AWS Console, open **AWS DMS**.
1. Open **Endpoints** in the sidebar. A list of endpoints should show, if any exist.
1. In the top-right portion of the window, select **Create endpoint**.
1. In the **Endpoint type** section, select **Target endpoint**.
1. Supply an **Endpoint identifier** to identify the new target endpoint.
1. For the **Source engine** dropdown, select **PostgreSQL**.
1. For the **Access to endpoint database** radio button, select the **Provide access information manually**.
1. Enter in the **Server name**, **Port**, **User name**, **Password**, and **Database name** of your CockroachDB cluster. For **Secure Socket Layer (SSL) mode**, select NEED VALUE HERE
1. You can test the connection if needed under **Test endpoint connection (optional)**. You may need to upload a certificate under **Certificates** if using one.

## Step 3. Create a replication task

### Step 3.1. Task configuration

1. While in **AWS DMS**, select **Database migration tasks** in the sidebar. A list of database migration tasks should show, if any exist.
1. In the top-right portion of the window, select **Create task**.
1. Supply a **Task identifier** to identify the replication task.
1. Select the **Replication instance** and **Source database endpoint** you created prior to starting this tutorial.
1. For the **Target database endpoint** dropdown, select the CockroachDB endpoint created in the previous section.

### Step 3.2. Task settings

1. For the **Editing mode** radio button, keep **Wizard** selected.
1. For the **Target table preparation mode**, keep **Drop tables on target** selected.
1. (Optional) You can **Enable CloudWatch logs** for extra insight about the replication.
1. Switch the **Editing mode** from **Wizard** to **JSON editor**.
1. Locate the `BatchApplyEnabled` setting and change its value to `true`. Information about the `BatchApplyEnabled` setting can be found [here](https://aws.amazon.com/premiumsupport/knowledge-center/dms-batch-apply-cdc-replication/).

### Step 3.3. Table mappings

1. Supply the appropriate **Schema** (if applicable), **Source name** (database name), **Table name**, and **Action**.

## Step 4. Verify the migration

Data should now be moving from source to target. You can analyze the **Table Statistics** page for information about replication.

## Known limitations



## See Also

- [`cockroach demo`](cockroach-demo.html)
- [AWS DMS documentation](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
- [Client connection parameters](connection-parameters.html)
- [Third-Party Database Tools](third-party-database-tools.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
