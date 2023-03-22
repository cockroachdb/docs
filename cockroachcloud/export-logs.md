---
title: Export Logs From a CockroachDB Dedicated Cluster
summary: Export Logs From a CockroachDB Dedicated Cluster
toc: true
docs_area: manage
cloud: true
---

{{ site.data.products.dedicated }} users can use the [Cloud API](cloud-api.html) to configure log export to [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) or [GCP Cloud Logging](https://cloud.google.com/logging). Once the export is configured, logs will flow from all nodes in all regions of your {{ site.data.products.dedicated }} cluster to your chosen cloud log sink. You can configure log export to redact sensitive log entries, limit log output by severity, send log entries to specific log group targets by log channel, among others.

{{site.data.alerts.callout_danger}}
The {{ site.data.products.dedicated }} log export feature is only available on clusters created after August 11, 2022 (AWS) or September 9, 2022 (GCP).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/limited-access.md %}
{{site.data.alerts.end}}

## The `logexport` endpoint

To configure and manage log export for your {{ site.data.products.dedicated }} cluster, use the `logexport` endpoint:

{% include_cached copy-clipboard.html %}
~~~
https://cockroachlabs.cloud/api/v1/clusters/{your_cluster_id}/logexport
~~~

Access to the `logexport` endpoint requires a valid {{ site.data.products.db }} [service account](console-access-management.html#service-accounts) with the appropriate permissions.

The following methods are available for use with the `logexport` endpoint, and require the listed service account permissions:

Method | Required permissions | Description
--- | --- | ---
`GET` | `ADMIN`, `EDIT`, or `READ` | Returns the current status of the log export configuration.
`POST` | `ADMIN` or `EDIT` | Enables log export, or updates an existing log export configuration.
`DELETE` | `ADMIN` | Disables log export, halting all log export to AWS CloudWatch or GCP Cloud Logging.

See [Service accounts](console-access-management.html#service-accounts) for instructions on configuring a {{ site.data.products.db }} service account with these required permissions.

## Log name format

When written to your chosen cloud log sink, logs have the following name format:

{% include_cached copy-clipboard.html %}
~~~
{log-name}.{region}.cockroachdbcloud.{log-channel}.n{N}
~~~

Where:

- `{log-name}` is a string of your choosing as you configure log export. For AWS CloudWatch, this name will correspond to an automatically-created [CloudWatch log group](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html#Create-Log-Group). For GCP Cloud Logging, this string will be prepended to all log names sent from your cluster. See the [Enable log export](#enable-log-export) instructions specific to your cloud provider for more information.
- `{region}` is the cloud provider region where your {{ site.data.products.dedicated }} cluster resides.
- `{log-channel}` is the CockroachDB [log channel](../{{site.current_cloud_version}}/logging-overview.html#logging-channels), such as `HEALTH` or `OPS`.
- `{N}` is the node number of the {{ site.data.products.dedicated }} node emitting the log messages. Log messages received before a node is fully started may appear in a log named without an explicit node number, e.g., ending in just `.n`.

## Enable log export

<div class="filters clearfix">
  <button class="filter-button" data-scope="aws-log-export">AWS CloudWatch</button>
  <button class="filter-button" data-scope="gcp-log-export">GCP Cloud Logging</button>
</div>

<section class="filter-content" markdown="1" data-scope="aws-log-export">

{{site.data.alerts.callout_danger}}
The {{ site.data.products.dedicated }} log export feature is only available on AWS-hosted clusters created after August 11, 2022.
{{site.data.alerts.end}}

Perform the following steps to enable log export from your {{ site.data.products.dedicated }} cluster to AWS CloudWatch.

1. Find your {{ site.data.products.dedicated }} cluster ID:

	1. Visit the {{ site.data.products.db }} console [cluster page](https://cockroachlabs.cloud/clusters).
	1. Click on the name of your cluster.
	1. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`.

1. Determine your {{ site.data.products.dedicated }} cluster's associated AWS Account ID. This command uses the third-party JSON parsing tool [`jq`](https://stedolan.github.io/jq/download/) to isolate just the needed `account_id` field from the results:

	{% include_cached copy-clipboard.html %}
	~~~shell
	curl --request GET \
	  --url https://cockroachlabs.cloud/api/v1/clusters/{your_cluster_id} \
	  --header 'Authorization: Bearer {secret_key}' | jq .account_id
	~~~

    See [API Access](console-access-management.html) for instructions on generating the `{secret_key}`.

1.  Create a cross-account IAM role in your AWS account:

	1. In the AWS console, visit the [IAM page](https://console.aws.amazon.com/iam/).
	1. Select **Roles** and click **Create role**.
	1. For **Trusted entity type**, select **AWS account**.
	1. Choose **Another AWS account**.
	1. For **Account ID**, provide the {{ site.data.products.dedicated }} AWS Account ID from step 2.
	1. Finish creating the IAM role with a suitable name. These instructions will use the role name `CockroachCloudLogExportRole`. You do not need to add any permissions.

	{{site.data.alerts.callout_info}}
	You will need the Amazon Resource Name (ARN) for your cross-account IAM role later in this procedure.
	{{site.data.alerts.end}}

1. Select the new role, and create a new policy for this role. These instructions will use the policy name `CockroachCloudLogExportPolicy`.

1. Select the new policy, and paste the following into the **Permissions** tab, with the **{} JSON** option selected:

    {% include_cached copy-clipboard.html %}
    ~~~
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:DescribeLogGroups",
                    "logs:DescribeLogStreams",
                    "logs:PutRetentionPolicy",
                    "logs:PutLogEvents"
                ],
                "Effect": "Allow",
                "Resource": [
                    "arn:aws:logs:*:{your_aws_acct_id}:log-group:*:*"
                ]
            }
        ]
    }
    ~~~

    Where:
    - `{your_aws_acct_id}` is the AWS Account ID of the AWS account where you created the `CockroachCloudLogExportRole` role, **not** the AWS Account ID of your {{ site.data.products.dedicated }} cluster. You can find your AWS Account ID on the AWS [IAM page](https://console.aws.amazon.com/iam/).

    This defines the set of permissions that the {{ site.data.products.dedicated }} log export feature requires to be able to write logs to CloudWatch.

    If desired, you may also limit log export from your {{ site.data.products.dedicated }} cluster to a specific single AWS region, by providing the name of the desired region as the fourth value to the `Resource` entry. For example:

    {% include_cached copy-clipboard.html %}
    ~~~
    "Resource": [
        "arn:aws:logs:us-east-1:{your_aws_acct_id}:log-group:*:*"
    ]
    ~~~

    Specifying an AWS region that you do not have a cluster in, or a region that only partially covers your cluster's nodes will result in missing logs.

1. Copy the [Amazon Resource Name (ARN)](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) of the `CockroachCloudLogExportRole` role found under **Summary**, which is needed for the next step.

1. Use one of the following Cloud API commands to enable log export for your {{ site.data.products.dedicated }} cluster. The first presents a basic configuration, where all logs are sent to AWS CloudWatch using the default settings. The second allows for more detailed customization of the logging configuration, such as the ability to send certain log channels to specific target log groups, or the ability to redact sensitive log entries.

    1. To enable log export for your {{ site.data.products.dedicated }} cluster with default logging configuration, issue the following Cloud API command:

        {% include_cached copy-clipboard.html %}
        ~~~shell
        curl --request POST \
          --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
          --header "Authorization: Bearer {secret_key}" \
          --data '{"type": "AWS_CLOUDWATCH", "log_name": "{log_group_name}", "auth_principal": "{role_arn}"}'
        ~~~

        Where:
        - `{cluster_id}` is your {{ site.data.products.dedicated }} cluster ID as determined in step 2.
        - `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](console-access-management.html) for instructions on generating this key.
        - `{log_group_name}` is the target AWS CloudWatch log group you would like the logs to be sent to in your AWS account.
        - `{role_arn}` is the ARN for the `CockroachCloudLogExportRole` role you copied in step 7.

    1. To enable log export for your {{ site.data.products.dedicated }} cluster with custom logging configuration:

        1. Consult the log export entry on the [Cockroach Cloud API Reference](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters/-cluster_id-/logexport) and select the **Schema** tab to view the supported log configuration options, and determine the customized logging configuration you would like to use.

            For example, consider the following configuration:

            {% include_cached copy-clipboard.html %}
            ~~~json
            {
             "type": "AWS_CLOUDWATCH",
             "log_name": "crdb-default",
             "auth_principal": "{role_arn}",
             "redact": true,
             "region": "",
             "groups": [
                     {
                         "log_name": "crdb-sql",
                         "channels": ["SQL_SCHEMA", "SQL_EXEC"],
                         "redact": false,
                     },
                     {
                         "log_name": "crdb-devops",
                         "channels": ["OPS", "HEALTH", "STORAGE"],
                         "min_level": "WARNING"
                     },
             ]
            }
            ~~~

            This configuration:
            - Enables [redaction](/docs/{{site.current_cloud_version}}/configure-logs.html#redact-logs) globally for all log entries emitted to AWS CloudWatch.
            - Sends log entries in the `SQL_SCHEMA` and `SQL_EXEC` [logging channels](/docs/{{site.current_cloud_version}}/logging-overview.html#logging-channels) to a AWS CloudWatch log group named `crdb-sql`, and overrides (disables) the global redaction configuration for just these two log channels only.
            - Sends log entries in the `OPS`, `HEALTH`, and `STORAGE` [logging channels](/docs/{{site.current_cloud_version}}/logging-overview.html#logging-channels) to an AWS CloudWatch log group named `crdb-devops`, but only for those entries that are of log [severity level](/docs/{{site.current_cloud_version}}/logging.html#logging-levels-severities) `WARNING` or higher.
            - Sends log entries in all other logging channels to the `crdb-default` AWS CloudWatch log group.

        1. Once you have determined the configuration you'd like to use, edit the configuration to be a single line, the required form for passing to the configuration command in the next step. For example, the above configuration becomes the following single line, suitable for the next step's `POST` command:

            {% include_cached copy-clipboard.html %}
            ~~~json
            {"type": "AWS_CLOUDWATCH", "log_name": "crdb-default", "auth_principal": "{role_arn}", "redact": true, "region": "", "groups": [{"log_name": "crdb-sql", "channels": ["SQL_SCHEMA", "SQL_EXEC","SQL_PERF"], "redact": false}, {"log_name": "crdb-devops", "channels": ["OPS", "HEALTH", "STORAGE"], "min_level": "WARNING"}]}
            ~~~

        1. Then, to enable log export for your {{ site.data.products.dedicated }} cluster with the above example custom logging configuration, issue the following Cloud API command:

            {% include_cached copy-clipboard.html %}
            ~~~shell
            curl --request POST \
              --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
              --header "Authorization: Bearer {secret_key}" \
              --data '{"type": "AWS_CLOUDWATCH", "log_name": "crdb-default", "auth_principal": "{role_arn}", "redact": true, "region": "", "groups": [{"log_name": "crdb-sql", "channels": ["SQL_SCHEMA", "SQL_EXEC","SQL_PERF"], "redact": false}, {"log_name": "crdb-devops", "channels": ["OPS", "HEALTH", "STORAGE"], "min_level": "WARNING"}]}'
            ~~~

            Where:
            - `{cluster_id}` is your {{ site.data.products.dedicated }} cluster ID as determined in step 3.
            - `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](console-access-management.html) for instructions on generating this key.
            - `{role_arn}` is the ARN for the `CockroachCloudLogExportRole` role you copied in step 8.

1. Depending on the size of your cluster and how many regions it spans, the configuration may take a moment. You can monitor the ongoing status of the configuration using the following Cloud API command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
      --header "Authorization: Bearer {secret_key}"
    ~~~

    Run the command periodically until the command returns a status of `ENABLED`, at which point the configuration across all nodes is complete, and logs will begin appearing in CloudWatch under the log group you created in step 1. Since the configuration is applied to cluster nodes in a rolling fashion, you may see some logs appear even before the `GET` command returns an `ENABLED` status.

1. Once log export has been enabled, you can access logs from your {{ site.data.products.dedicated }} cluster directly in [AWS CloudWatch](https://console.aws.amazon.com/cloudwatch/home).

</section>

<section class="filter-content" markdown="1" data-scope="gcp-log-export">

{{site.data.alerts.callout_danger}}
The {{ site.data.products.dedicated }} log export feature is only available on GCP-hosted clusters created after September 9, 2022.
{{site.data.alerts.end}}

Perform the following steps to enable log export from your {{ site.data.products.dedicated }} cluster to GCP Cloud Logging.

1. Find your {{ site.data.products.dedicated }} organization ID in the {{ site.data.products.db }} [organization settings page](https://cockroachlabs.cloud/settings).

1. Find your {{ site.data.products.dedicated }} cluster ID:

	1. Visit the {{ site.data.products.db }} console [cluster page](https://cockroachlabs.cloud/clusters).
	1. Click on the name of your cluster.
	1. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`.

1. Determine the GCP principal to grant permission to from your account. This principal is already created for you by Cockroach Labs; this step merely determines its account name. This command uses the third-party JSON parsing tool [`jq`](https://stedolan.github.io/jq/download/) to isolate just the needed `id` (GCP cluster ID) and `account_id` (GCP account ID) fields, and combines them for you in the required form:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{your_cluster_id} \
      --header 'Authorization: Bearer {secret_key}' | jq '("crl-logging-user-" + (.id | split("-"))[4] + "@" + .account_id + ".iam.gserviceaccount.com")'
    ~~~

    Where:
    - `{your_cluster_id}` is the cluster ID of your {{ site.data.products.dedicated }} cluster as determined in step 2.
    - `{secret_key}` is your API access key. See [API Access](console-access-management.html) for more details.

    The resulting GCP principal should resemble the following example:

    {% include_cached copy-clipboard.html %}
    ~~~
    crl-logging-user-a1c42be2e53b@crl-prod-abc.iam.gserviceaccount.com
    ~~~

    This GCP principal refers to a resource that is owned by Cockroach Labs and is created automatically along with your cluster. You **do not** need to create this account in GCP; it is already present for use by your cluster.

1. Create a new role with the required permissions in your GCP project:

 1. In the GCP console, visit the [IAM roles page](https://console.cloud.google.com/iam-admin/roles) for your project.
 1. Click **+ Create role**.
 1. Give your role a title and ID of your choosing, then click **+ Add permissions**.
 1. Search for `logging.logEntries.create` in the **Filter** field, check the checkbox next to the resulting match, then click **Add**.
 1. Click the **Create** button.

1. Add your cluster's GCP principal to the role you just created.

	1. In the GCP console, visit the [IAM admin page](https://console.cloud.google.com/iam-admin) for your project.
 1. Click the **+ Grant Access** button.
 1. In the box labeled **New principals**, enter the name of your cluster's GCP principal you determined in step 3.
 1. In the **Select a role** dropdown, select the role you created in step 4.
	1. Click **SAVE**.

1. Use one of the following Cloud API commands to enable log export for your {{ site.data.products.dedicated }} cluster. The first presents a basic configuration, where all logs are sent to GCP Cloud Logging using the default settings. The second allows for more detailed customization of the logging configuration, such as the ability to send certain log channels to specific target log groups, or the ability to redact sensitive log entries.

    1. To enable log export for your {{ site.data.products.dedicated }} cluster with default logging configuration, issue the following Cloud API command:

        {% include_cached copy-clipboard.html %}
        ~~~shell
        curl --request POST \
          --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
          --header "Authorization: Bearer {secret_key}" \
          --data '{"type": "GCP_CLOUD_LOGGING", "log_name": "{log_name}", "auth_principal": "{gcp_project_id}"}'
        ~~~

        Where:
        - `{cluster_id}` is your {{ site.data.products.dedicated }} cluster ID as determined in step 3.
        - `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](console-access-management.html) for instructions on generating this key.
        - `{log_name}` is a string of your choosing to represent logs written from your {{ site.data.products.dedicated }} cluster. This name will appear in the name of each log written to GCP Cloud Logging.
        - `{gcp_project_id}` is your GCP project ID, as shown in your GCP Cloud Console [Settings page](https://console.cloud.google.com/iam-admin/settings).

    1. To enable log export for your {{ site.data.products.dedicated }} cluster with custom logging configuration:

        1. Consult the log export entry on the [Cockroach Cloud API Reference](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters/-cluster_id-/logexport) and select the **Schema** tab to view the supported log configuration options, and determine the customized logging configuration you would like to use.
        
            For example, consider the following configuration:

            {% include_cached copy-clipboard.html %}
            ~~~json
            {
             "type": "GCP_CLOUD_LOGGING",
             "log_name": "crdb-default",
             "auth_principal": "{gcp_project_id}",
             "redact": true,
             "region": "",
             "groups": [
                     {
                         "log_name": "crdb-sql",
                         "channels": ["SQL_SCHEMA", "SQL_EXEC"],
                         "redact": false,
                     },
                     {
                         "log_name": "crdb-devops",
                         "channels": ["OPS", "HEALTH", "STORAGE"],
                         "min_level": "WARNING"
                     },
             ]
            }
            ~~~

            This configuration:
            - Enables [redaction](/docs/{{site.current_cloud_version}}/configure-logs.html#redact-logs) globally for all log entries emitted to GCP Cloud Logging.
            - Sends log entries in the `SQL_SCHEMA` and `SQL_EXEC` [logging channels](/docs/{{site.current_cloud_version}}/logging-overview.html#logging-channels) to a GCP Cloud Logging log group named `crdb-sql`, and overrides (disables) the global redaction configuration for just these two log channels only.
            - Sends log entries in the `OPS`, `HEALTH`, and `STORAGE` [logging channels](/docs/{{site.current_cloud_version}}/logging-overview.html#logging-channels) to a GCP Cloud Logging log group named `crdb-devops`, but only for those entries that are of log [severity level](/docs/{{site.current_cloud_version}}/logging.html#logging-levels-severities) `WARNING` or higher.
            - Sends log entries in all other logging channels to the `crdb-default` GCP Cloud Logging log group.

        1. Once you have determined the configuration you'd like to use, edit the configuration to be a single line, the required form for passing to the configuration command in the next step. For example, the above configuration becomes the following single line, suitable for the next step's `POST` command:

            {% include_cached copy-clipboard.html %}
            ~~~json
            {"type": "GCP_CLOUD_LOGGING", "log_name": "crdb-default", "auth_principal": "{gcp_project_id}", "redact": true, "region": "", "groups": [{"log_name": "crdb-sql", "channels": ["SQL_SCHEMA", "SQL_EXEC","SQL_PERF"], "redact": false}, {"log_name": "crdb-devops", "channels": ["OPS", "HEALTH", "STORAGE"], "min_level": "WARNING"}]}
            ~~~

        1. Then, to enable log export for your {{ site.data.products.dedicated }} cluster with the above example custom logging configuration, issue the following Cloud API command:

            {% include_cached copy-clipboard.html %}
            ~~~shell
            curl --request POST \
              --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
              --header "Authorization: Bearer {secret_key}" \
              --data '{"type": "GCP_CLOUD_LOGGING", "log_name": "crdb-default", "auth_principal": "{gcp_project_id}", "redact": true, "region": "", "groups": [{"log_name": "crdb-sql", "channels": ["SQL_SCHEMA", "SQL_EXEC","SQL_PERF"], "redact": false}, {"log_name": "crdb-devops", "channels": ["OPS", "HEALTH", "STORAGE"], "min_level": "WARNING"}]}'
            ~~~

            Where:
            - `{cluster_id}` is your {{ site.data.products.dedicated }} cluster ID as determined in step 3.
            - `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](console-access-management.html) for instructions on generating this key.
            - `{gcp_project_id}` is your GCP project ID, as shown in your GCP Cloud Console [Settings page](https://console.cloud.google.com/iam-admin/settings).

1. Depending on the size of your cluster and how many regions it spans, the configuration may take a moment. You can monitor the ongoing status of the configuration using the following Cloud API command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
      --header "Authorization: Bearer {secret_key}"
    ~~~

    Run the command periodically until the command returns a status of `ENABLED`, at which point the configuration across all nodes is complete, and logs will begin appearing in GCP Cloud Logging. Since the configuration is applied to cluster nodes in a rolling fashion, you may see some logs appear even before the `GET` command returns an `ENABLED` status.

1. Once log export has been enabled, you can access logs from your {{ site.data.products.dedicated }} cluster directly in GCP Cloud Logging's [Log Explorer](https://console.cloud.google.com/logs/query).

</section>

## Monitor the status of a log export configuration

To check the status of an existing {{ site.data.products.dedicated }} log export configuration, use the following Cloud API command:

{% include_cached copy-clipboard.html %}
~~~shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

- `{cluster_id}` is your {{ site.data.products.dedicated }} cluster's cluster ID, which can be found in the URL of your [Cloud Console](https://cockroachlabs.cloud/clusters/) for the specific cluster you wish to configure, resembling `f78b7feb-b6cf-4396-9d7f-494982d7d81e`.
- `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](console-access-management.html) for instructions on generating this key.

## Update an existing log export configuration

To update an existing {{ site.data.products.dedicated }} log export configuration, make any necessary changes to your cloud provider configuration (e.g., AWS CloudWatch or GCP Cloud Logging), then issue the same `POST` Cloud API command as shown in the [Enable log export](#enable-log-export) instructions for your cloud provider with the desired updated configuration. Follow the [Monitor the status of a log export configuration](#monitor-the-status-of-a-log-export-configuration) instructions to ensure the update completes successfully.

## Disable log export

To disable an existing {{ site.data.products.dedicated }} log export configuration, and stop sending logs to a cloud log sink, use the following Cloud API command:

{% include_cached copy-clipboard.html %}
~~~shell
curl --request DELETE \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

- `{cluster_id}` is your {{ site.data.products.dedicated }} cluster's cluster ID, which can be found in the URL of your [Cloud Console](https://cockroachlabs.cloud/clusters/) for the specific cluster you wish to configure, resembling `f78b7feb-b6cf-4396-9d7f-494982d7d81e`.
- `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](console-access-management.html) for instructions on generating this key.

## Limitations

- The {{ site.data.products.dedicated }} log export feature is only available on clusters created after August 11, 2022 (AWS) or September 9, 2022 (GCP).
- {{ site.data.products.dedicated }} clusters hosted on AWS can only export logs to AWS CloudWatch. Similarly, {{ site.data.products.dedicated }} clusters hosted on GCP can only export logs to GCP Cloud Logging.

## {{ site.data.products.dedicated }} log export Frequently Asked Questions (FAQ)

### Is it possible to configure exported logs to be redacted at source?

Yes, use the `redact: true` log configuration option. See [Redact logs](/docs/{{site.current_cloud_version}}/configure-logs.html#redact-logs) for more information.

### Is it possible to send different log channels to different log groups in my cloud log sink?

Yes, use the custom log configuration step for your cloud provider, and specify multiple `groups`, each with a unique `log_name` value, in your configuration.

### Is it possible to send logs from one cloud provider to another?

No, if your {{ site.data.products.dedicated }} cluster resides on AWS, you can only export your logs to AWS CloudWatch. Similarly, if your {{ site.data.products.dedicated }} cluster resides on GCP, you can only export your logs to GCP Cloud Logging.

### For a multi-region cluster, are the logs from all regions exported to one cloud log sink region?

No, logs for each region in your cluster are exported to the corresponding cloud log sink region configured for your account. For AWS, ensure that the target AWS CloudWatch log group is configured with the same name in all target regions, and that the [IAM role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) you are using has permission to access each regional log group. For GCP, you can configure [Log Buckets](https://cloud.google.com/logging/docs/buckets) to collect logs from different regions, as well as assign individual retention policies by region if desired. By default, all logs written to GCP Cloud Logging are written to a `_Default` bucket, in the "global" region.

### What log channels are supported?

Currently, the following CockroachDB [log channels](/docs/{{site.current_cloud_version}}/logging-overview.html#logging-channels) are supported for export in this manner: `SESSIONS`, `OPS`, `HEALTH`, `STORAGE`, `SQL_SCHEMA`, `USER_ADMIN`, `PRIVILEGES`, `SENSITIVE_ACCESS`, `SQL_EXEC`, and `SQL_PERF`. Other log channels are not exportable from {{ site.data.products.dedicated }}.

### Is it possible to include SQL audit logs as part of the log export capability?

Yes, the [SQL Audit Log](/docs/{{site.current_cloud_version}}/sql-audit-logging.html) is exported via the `SENSITIVE_ACCESS` log channel by default, as long as you have previously enabled audit logging on desired tables using the [`ALTER TABLE ...EXPERIMENTAL_AUDIT`](/docs/{{site.current_cloud_version}}/alter-table.html#experimental_audit) statement.

### Can I use an AWS External ID with the log export feature?

No, the {{ site.data.products.dedicated }} log export feature does not support use of an AWS External ID. You must configure a cross-account IAM Role as described in the [Enable log export](#enable-log-export) instructions.

### Does log export configuration use the same syntax as CockroachDB log configuration?

No, log export configuration uses the [Cockroach Cloud API](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters/-cluster_id-/logexport) syntax. For example, log export uses `min_level` to define log [severity levels](/docs/{{site.current_cloud_version}}/logging.html#logging-levels-severities), while CockroachDB uses `filter`.

### Why are some logs appearing without a node number in the name?

Log messages received from {{ site.data.products.dedicated }} nodes that are not yet fully started may arrive without a node number appended to the log name, in the format `{logname}.n`. Node-specific log messages, as they are received, are written to node-specific logs in the format `{logname}.n1`, `{logname}.n2`, etc., where the number following the `n` characters is the node ID. See [Log Name Format](#log-name-format).

## Troubleshooting

### AWS CloudWatch

Most log export errors stem from incorrect AWS IAM configuration. Ensure you have followed steps 1 through 5 of the [Enable log export](#enable-log-export) instructions closely, and that you have a **cross-account** IAM role which trusts your {{ site.data.products.dedicated }} AWS account ID (as determined in step 2).

When supplying the [Amazon Resource Name (ARN)](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) to step 8, be sure you are supplying the ARN for the `CockroachCloudLogExportRole` role, **not** the ARN for the `CockroachCloudLogExportPolicy` policy. Whether you are using the default logging configuration or the custom configuration: be sure to supply this ARN to the `auth_principal` parameter, in the `--data` payload.

### GCP Cloud Logging

When supplying the GCP project ID in step 6a or 6b, be sure you use the **Project ID**, and not the **Project Name**. Both are shown on the Google Cloud Console [Settings page](https://console.cloud.google.com/iam-admin/settings).

You do not need to create a GCP service account to enable or manage log export. The GCP principal mentioned in step 3 and used in step 5c is already created for you. These steps simply determine the account name of this principal, which is specific to your cluster.
