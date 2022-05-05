---
title: Migrate CockroachDB Schemas with AWS DMS
summary: Learn how to use AWS Database Migration Service (DMS) with a CockroachDB cluster.
toc: true
docs_area: develop
---

This page walks you through how to set up [AWS DMS](https://aws.amazon.com/dms/) to replicate data from an external database to CockroachDB.

For a detailed tutorial about using AWS DMS and information about specific migration tasks, see the [AWS DMS documentation site](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html).

We have tested the AWS DMS enough to claim **beta-level** support. If you encounter problems in CockroachDB, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

For any issues related to the AWS DMS UI, please reach out to [AWS Support](https://aws.amazon.com/contact-us/).

{{site.data.alerts.callout_info}}
Using CockroachDB as a source database within AWS DMS is unsupported.
{{site.data.alerts.end}}

## Before you begin

Ensure the following items are completed prior to starting this tutorial:

- Configure a [source endpoint](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.html) in AWS pointing to your source database.
- Configure a [replication instance](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_ReplicationInstance.html) in AWS.
- Ensure you have a secure, publicly available CockroachDB cluster running v22.1 or higher.

## Step 1. Create a target endpoint pointing to CockroachDB

1. In the AWS Console, open **AWS DMS**.
1. Open **Endpoints** in the sidebar. A list of endpoints should show, if any exist.
1. In the top-right portion of the window, select **Create endpoint**.
    <img src="{{ 'images/v22.1/aws-dms-create-endpoint.png' | relative_url }}" alt="AWS-DMS-Create-Endpoint" style="max-width:100%" />
1. In the **Endpoint type** section, select **Target endpoint**.
1. Supply an **Endpoint identifier** to identify the new target endpoint.
1. For the **Target engine** dropdown, select **PostgreSQL**.
1. For the **Access to endpoint database** radio button, select the **Provide access information manually**.
1. Enter the **Server name**, **Port**, **User name**, **Password**, and **Database name** of your CockroachDB cluster.
    <img src="{{ 'images/v22.1/aws-dms-endpoint-configuration.png' | relative_url }}" alt="AWS-DMS-Endpoint-Configuration" style="max-width:100%" />
1. You can test the connection if needed under **Test endpoint connection (optional)**.
1. Create the endpoint by selecting **Create endpoint**.
    <img src="{{ 'images/v22.1/aws-dms-test-endpoint.png' | relative_url }}" alt="AWS-DMS-Test-Endpoint" style="max-width:100%" />

## Step 2. Create a database migration task

A database migration task, also known as a replication task, controls what data are moved from the source database to the target database.

### Step 2.1. Task configuration

1. While in **AWS DMS**, select **Database migration tasks** in the sidebar. A list of database migration tasks should show, if any exist.
1. In the top-right portion of the window, select **Create task**.
    <img src="{{ 'images/v22.1/aws-dms-create-db-migration-task.png' | relative_url }}" alt="AWS-DMS-Create-DB-Migration-Task" style="max-width:100%" />
1. Supply a **Task identifier** to identify the replication task.
1. Select the **Replication instance** and **Source database endpoint** you created prior to starting this tutorial.
1. For the **Target database endpoint** dropdown, select the CockroachDB endpoint created in the previous section.
1. Select the appropriate **Migration type** based on your needs.
    <img src="{{ 'images/v22.1/aws-dms-task-configuration.png' | relative_url }}" alt="AWS-DMS-Task-Configuration" style="max-width:100%" />

### Step 2.2. Task settings

1. For the **Editing mode** radio button, keep **Wizard** selected.
1. For the **Target table preparation mode**, select either **Truncate** or **Do nothing**. All other settings can remain as-is.
    <img src="{{ 'images/v22.1/aws-dms-task-settings.png' | relative_url }}" alt="AWS-DMS-Task-Settings" style="max-width:100%" />

In order to use **Drop tables on target**, you must [create a new `dms` user](#create-a-new-dms-user) and ensure [`BatchApplyEnabled`](#batchapplyenabled) is set to `False`.

### Step 2.3. Table mappings

1. For the **Editing mode** radio button, keep **Wizard** selected.
1. Select **Add new selection rule**.
1. Supply the appropriate **Schema** (if applicable), **Source name** (database name), **Table name**, and **Action**.
    <img src="{{ 'images/v22.1/aws-dms-table-mappings.png' | relative_url }}" alt="AWS-DMS-Table-Mappings" style="max-width:100%" />

## Step 3. Verify the migration

Data should now be moving from source to target. You can analyze the **Table Statistics** page for information about replication.

1. In **AWS DMS**, open **Database migration tasks** in the sidebar.
1. Select the task you created in Step 2.
1. Select **Table statistics** below the **Summary** section.

If your migration failed for some reason, you can check the checkbox next to the table(s) you wish to re-migrate and select **Reload table data**.

## Optional configurations

### Create a new `dms` user

Creating a `dms` user is necessary when using **Drop tables on target** as a target table preparation mode.

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

### CloudWatch logs

You can Enable CloudWatch logs for extra insight about the replication. To enable CloudWatch logs:

1. Edit the existing replication task.
1. Under **Task settings**, select **Enable CloudWatch logs**. From here, you can specify logging levels for each event type:
    <img src="{{ 'images/v22.1/aws-dms-cloudwatch-logs.png' | relative_url }}" alt="AWS-DMS-CloudWatch-Logs" style="max-width:100%" />

### `BatchApplyEnabled`

The `BatchApplyEnabled` setting can improve replication performance and is recommended when using a target table preparation mode of **Truncate** or **Do nothing**.

1. Switch the **Editing mode** from **Wizard** to **JSON editor**. Locate the `BatchApplyEnabled` setting and change its value to `true`. Information about the `BatchApplyEnabled` setting can be found [here](https://aws.amazon.com/premiumsupport/knowledge-center/dms-batch-apply-cdc-replication/).

{{site.data.alerts.callout_info}}
`BatchApplyEnabled` does not work when using **Drop tables on target** as a target table preparation mode. Thus, all schema-related changes must be manually copied over if using `BatchApplyEnabled`.
{{site.data.alerts.end}}

## Known limitations

- When using **Truncate** or **Do nothing** as a target table preparation mode, you cannot include tables with any hidden columns. You can verify which tables contain hidden columns by executing the following SQL query:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT table_catalog, table_schema, table_name, column_name FROM information_schema.columns WHERE is_hidden = 'YES';
~~~

- Not all schema objects are migrated when using **Drop tables on target** as a target table preparation mode. A list of supported DDL statements within AWS DMS are mentioned [here](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Introduction.SupportedDDL.html). Any statements outside of that (creating or modifying foreign keys, secondary indexes, constraints, etc.) will have to be run manually in the target database.

## See Also

- [`cockroach demo`](cockroach-demo.html)
- [AWS DMS documentation](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
- [Client connection parameters](connection-parameters.html)
- [Third-Party Database Tools](third-party-database-tools.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
