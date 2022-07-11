---
title: Migrate with AWS Database Migration Service (DMS)
summary: Learn how to use AWS Database Migration Service (DMS) to migrate data to a CockroachDB target cluster.
toc: true
docs_area: develop
---

This page has instructions for setting up [AWS DMS](https://aws.amazon.com/dms/) to migrate data to CockroachDB from an existing, publicly-hosted database containing application data such as MySQL, Oracle, or PostgreSQL.

For a detailed tutorial about using AWS DMS and information about specific migration tasks, see the [AWS DMS documentation site](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html).

We have tested AWS DMS with CockroachDB as a target enough to claim **preview-level** support. If you encounter problems in CockroachDB, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

For any issues related to AWS DMS, aside from its interaction with CockroachDB as a migration target, please reach out to [AWS Support](https://aws.amazon.com/contact-us/).

{{site.data.alerts.callout_info}}
Using CockroachDB as a source database within AWS DMS is unsupported.
{{site.data.alerts.end}}

## Before you begin

Ensure the following items are completed prior to starting this tutorial:

- Configure a [source endpoint](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.html) in AWS pointing to your source database.
- Configure a [replication instance](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_ReplicationInstance.html) in AWS.
- Ensure you have a secure, publicly available CockroachDB cluster running v21.2.13 or higher.

## Step 1. Create a target endpoint pointing to CockroachDB

1. In the AWS Console, open **AWS DMS**.
1. Open **Endpoints** in the sidebar. A list of endpoints will display, if any exist.
1. In the top-right portion of the window, select **Create endpoint**.
    <img src="{{ 'images/v21.2/aws-dms-create-endpoint.png' | relative_url }}" alt="AWS-DMS-Create-Endpoint" style="max-width:100%" />
1. In the **Endpoint type** section, select **Target endpoint**.
1. Supply an **Endpoint identifier** to identify the new target endpoint.
1. For the **Target engine** dropdown, select **PostgreSQL**.
1. For the **Access to endpoint database** radio button, select the **Provide access information manually**.
1. Enter the **Server name**, **Port**, **User name**, **Password**, and **Database name** of your CockroachDB cluster.
    {{site.data.alerts.callout_info}}
    To connect to a {{ site.data.products.serverless }} cluster, use `{routing-id}.{database}` for the **Database name**. For more information, see [Connect to a {{ site.data.products.serverless }} Cluster](../cockroachcloud/connect-to-a-serverless-cluster.html?filters=connection-parameters#step-2-connect-to-your-cluster).
    {{site.data.alerts.end}}
    <img src="{{ 'images/v21.2/aws-dms-endpoint-configuration.png' | relative_url }}" alt="AWS-DMS-Endpoint-Configuration" style="max-width:100%" />
1. You can test the connection if needed under **Test endpoint connection (optional)**.
1. Create the endpoint by selecting **Create endpoint**.
    <img src="{{ 'images/v21.2/aws-dms-test-endpoint.png' | relative_url }}" alt="AWS-DMS-Test-Endpoint" style="max-width:100%" />

## Step 2. Create a database migration task

A database migration task, also known as a replication task, controls what data are moved from the source database to the target database.

### Step 2.1. Task configuration

1. While in **AWS DMS**, select **Database migration tasks** in the sidebar. A list of database migration tasks will display, if any exist.
1. In the top-right portion of the window, select **Create task**.
    <img src="{{ 'images/v21.2/aws-dms-create-db-migration-task.png' | relative_url }}" alt="AWS-DMS-Create-DB-Migration-Task" style="max-width:100%" />
1. Supply a **Task identifier** to identify the replication task.
1. Select the **Replication instance** and **Source database endpoint** you created prior to starting this tutorial.
1. For the **Target database endpoint** dropdown, select the CockroachDB endpoint created in the previous section.
1. Select the appropriate **Migration type** based on your needs.
    <img src="{{ 'images/v21.2/aws-dms-task-configuration.png' | relative_url }}" alt="AWS-DMS-Task-Configuration" style="max-width:100%" />

### Step 2.2. Task settings

1. For the **Editing mode** radio button, keep **Wizard** selected.
1. For the **Target table preparation mode**, select either **Truncate** or **Do nothing**. All other settings can remain as-is.
    <img src="{{ 'images/v21.2/aws-dms-task-settings.png' | relative_url }}" alt="AWS-DMS-Task-Settings" style="max-width:100%" />
1. Manually create all schema objects in the target CockroachDB database. This step is required in order for the migration to populate data successfully.

{{site.data.alerts.callout_info}}
**Drop tables on target** is unsupported at this time.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
When specifying a range of tables, you must ensure the following before data migration can successfully occur:

- The column names within each table being migrated from the source database to CockroachDB are identical.
- The column types for the columns within each table being migrated from the source database to CockroachDB are compatible.
{{site.data.alerts.end}}

{% comment %}In order to use **Drop tables on target**, you must [create a new `dms` user](#create-a-new-dms-user) and ensure [`BatchApplyEnabled`](#batchapplyenabled) is set to `False`. {% endcomment %}

### Step 2.3. Table mappings

1. For the **Editing mode** radio button, keep **Wizard** selected.
1. Select **Add new selection rule**.
1. In the **Schema** drop down, select **Enter a schema**.
1. Supply the appropriate **Source name** (schema name), **Table name**, and **Action**.
    <img src="{{ 'images/v21.2/aws-dms-table-mappings.png' | relative_url }}" alt="AWS-DMS-Table-Mappings" style="max-width:100%" />

{{site.data.alerts.callout_info}}
Use `%` as an example of a wildcard for all schemas in a PostgreSQL database. However, in MySQL, using `%` as a schema name imports all the databases, including the metadata/system ones, as MySQL treats schemas and databases as the same.
{{site.data.alerts.end}}

## Step 3. Verify the migration

Data should now be moving from source to target. You can analyze the **Table Statistics** page for information about replication.

1. In **AWS DMS**, open **Database migration tasks** in the sidebar.
1. Select the task you created in Step 2.
1. Select **Table statistics** below the **Summary** section.

If your migration failed for some reason, you can check the checkbox next to the table(s) you wish to re-migrate and select **Reload table data**.

<img src="{{ 'images/v21.2/aws-dms-reload-table-data.png' | relative_url }}" alt="AWS-DMS-Reload-Table-Data" style="max-width:100%" />

## Optional configurations

{% comment %}
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
{% endcomment %}

### AWS PrivateLink

If using {{ site.data.products.dedicated }}, you can enable [AWS PrivateLink](https://aws.amazon.com/privatelink/) to securely connect your AWS application with your {{ site.data.products.dedicated }} cluster using a private endpoint. To configure AWS PrivateLink with {{ site.data.products.dedicated }}, see [Network Authorization](../cockroachcloud/network-authorization.html#aws-privatelink).

### CloudWatch logs

You can Enable CloudWatch logs for extra insight about the replication. To enable CloudWatch logs:

1. Edit the existing replication task.
1. Under **Task settings**, select **Enable CloudWatch logs**. From here, you can specify logging levels for each event type:
    <img src="{{ 'images/v21.2/aws-dms-cloudwatch-logs.png' | relative_url }}" alt="AWS-DMS-CloudWatch-Logs" style="max-width:100%" />

### `BatchApplyEnabled`

The `BatchApplyEnabled` setting can improve replication performance and is recommended for larger workloads. {% comment %}If you enable this setting, then you must set your target table preparation mode to **Truncate** or **Do nothing**.{% endcomment %}

1. Open the existing database migration task.
1. Choose your task, and then choose **Modify**.
1. From the **Task settings** section, switch the **Editing mode** from **Wizard** to **JSON editor**. Locate the `BatchApplyEnabled` setting and change its value to `true`. Information about the `BatchApplyEnabled` setting can be found [here](https://aws.amazon.com/premiumsupport/knowledge-center/dms-batch-apply-cdc-replication/).

<img src="{{ 'images/v21.2/aws-dms-batchapplyenabled.png' | relative_url }}" alt="AWS-DMS-BatchApplyEnabled" style="max-width:100%" />

{% comment %}

{{site.data.alerts.callout_info}}
`BatchApplyEnabled` does not work when using **Drop tables on target** as a target table preparation mode. Thus, all schema-related changes must be manually copied over if using `BatchApplyEnabled`.
{{site.data.alerts.end}}
{% endcomment %}

## Known limitations

- When using **Truncate** or **Do nothing** as a target table preparation mode, you cannot include tables with any hidden columns. You can verify which tables contain hidden columns by executing the following SQL query:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT table_catalog, table_schema, table_name, column_name FROM information_schema.columns WHERE is_hidden = 'YES';
~~~

- **Drop tables on target** is currently not supported and will error on import.

{% comment %}
- Not all schema objects are migrated when using **Drop tables on target** as a target table preparation mode. Thus, it is not supported at this time. A list of supported DDL statements within AWS DMS are mentioned [here](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Introduction.SupportedDDL.html). Any statements outside of that (creating or modifying foreign keys, secondary indexes, constraints, etc.) will have to be run manually in the target database.
{% endcomment %}

## See Also

- [`cockroach demo`](cockroach-demo.html)
- [AWS DMS documentation](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
- [Client connection parameters](connection-parameters.html)
- [Third-Party Database Tools](third-party-database-tools.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
