---
title: Export Logs From a CockroachDB Standard Cluster
summary: Export Logs From a CockroachDB Standard Cluster
toc: true
docs_area: manage
cloud: true
---

{% include cockroachcloud/filter-tabs/export-logs.md %}

CockroachDB {{ site.data.products.standard }} users can use the [Cloud API]({% link cockroachcloud/cloud-api.md %}) to configure log export to [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) or [GCP Cloud Logging](https://cloud.google.com/logging). Once the export is configured, logs will flow from all [regions]({% link cockroachcloud/regions.md %}) of your CockroachDB {{ site.data.products.standard }} cluster to your chosen cloud log sink. You can configure log export to redact sensitive log entries, limit log output by severity, send log entries to specific log group targets by log channel, and more.

## The `logexport` endpoint

To configure and manage log export for your CockroachDB {{ site.data.products.standard }} cluster, use the `logexport` endpoint:

{% include_cached copy-clipboard.html %}
~~~
https://cockroachlabs.cloud/api/v1/clusters/{your_cluster_id}/logexport
~~~

Access to the `logexport` endpoint requires a valid CockroachDB {{ site.data.products.cloud }} [service account]({% link cockroachcloud/managing-access.md %}#manage-service-accounts) assigned one of the following [roles]({% link cockroachcloud/managing-access.md %}#edit-roles-on-a-service-account):

- [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin)
- [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin)
- [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator)
- [Metrics Viewer]({% link cockroachcloud/authorization.md %}#metrics-viewer)

The following methods are available for use with the `logexport` endpoint:

Method | Description
-------|------------
`GET` | Returns the current status of the log export configuration.
`POST` | Enables log export, or updates an existing log export configuration.
`DELETE` | Disables log export, halting all log export to Amazon CloudWatch or GCP Cloud Logging.

## Log name format

GCP Cloud Logging and Amazon CloudWatch logs have the following name format:

{% include_cached copy-clipboard.html %}
~~~
{log-name}.{region}.cockroachdbcloud.{log-channel}
~~~

Where:

- `{log-name}` is a string of your choosing as you configure log export. For AWS CloudWatch, this is the [log group](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html#Create-Log-Group) you create as part of enabling log export. For GCP Cloud Logging, this is the `log_name` you choose during configuration. See the [Enable log export](#enable-log-export) instructions specific to your cloud provider for more information.
- `{region}` is the cloud provider region where your CockroachDB {{ site.data.products.advanced }} cluster resides.
- `{log-channel}` is the CockroachDB [log channel]({% link {{site.current_cloud_version}}/logging-overview.md %}#logging-channels), such as `HEALTH` or `OPS`.
- `{N}` is the node number of the CockroachDB {{ site.data.products.advanced }} node emitting the log messages. Log messages received before a node is fully started may appear in a log named without an explicit node number, e.g., ending in just `.n`.

## Enable log export

<div class="filters clearfix">
  <button class="filter-button" data-scope="aws-log-export">Amazon CloudWatch</button>
  <button class="filter-button" data-scope="gcp-log-export">GCP Cloud Logging</button>
</div>

<section class="filter-content" markdown="1" data-scope="aws-log-export">

Perform the following steps to enable log export from your CockroachDB {{ site.data.products.standard }} cluster to Amazon CloudWatch.

1. Create the desired target Amazon CloudWatch log group by following the [Create a log group in CloudWatch logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html#Create-Log-Group) instructions. If you already have a log group created, you can skip this step. To send logs to more than one target log group, refer to the custom configuration option in step 8.

1. Find your CockroachDB {{ site.data.products.standard }} cluster ID:

	1. Visit the CockroachDB {{ site.data.products.cloud }} console [cluster page](https://cockroachlabs.cloud/clusters).
	1. Click on the name of your cluster.
	1. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`.

1. Determine your cluster's cloud provider account ID. This command uses the third-party JSON parsing tool [`jq`](https://stedolan.github.io/jq/download/) to isolate just the needed `aws_account_id` field:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{your_cluster_id} \
      --header "Authorization: Bearer {secret_key}" | jq .keychain_config.aws_account_id
    ~~~

    Where:
    - `{your_cluster_id}` is the cluster ID of your CockroachDB {{ site.data.products.standard }} cluster as determined in step 2.
    - `{secret_key}` is your CockroachDB {{ site.data.products.standard }} API key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}) for more details.

1.  Create a cross-account IAM role in your AWS account:

	1. In the AWS console, visit the [IAM page](https://console.aws.amazon.com/iam/).
	1. Select **Roles** and click **Create role**.
	1. For **Trusted entity type**, select **AWS account**.
	1. Choose **Another AWS account**.
		1. For **Account ID**, provide the CockroachDB {{ site.data.products.standard }} cloud provider account ID from step 3.
		1. Select the option to **Require external ID**, and for the value of **External ID**, provide the cluster ID of your CockroachDB {{ site.data.products.standard }} cluster as determined in step 2.
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
                    "arn:aws:logs:*:{your_aws_acct_id}:log-group:{log_group_name}:*"
                ]
            }
        ]
    }
    ~~~

    Where:
    - `{your_aws_acct_id}` is the AWS Account ID of the AWS account where you created the `CockroachCloudLogExportRole` role, **not** the AWS Account ID of your CockroachDB {{ site.data.products.standard }} cluster. You can find your AWS Account ID on the AWS [IAM page](https://console.aws.amazon.com/iam/).
    - `{log_group_name}` is the target Amazon CloudWatch log group you created in step 1.

    This defines the set of permissions that the CockroachDB {{ site.data.products.standard }} log export feature requires to be able to write logs to CloudWatch.

    If desired, you may also limit log export from your CockroachDB {{ site.data.products.standard }} cluster to a specific single AWS region, by providing the name of the desired region as the fourth value to the `Resource` entry. For example:

    {% include_cached copy-clipboard.html %}
    ~~~
    "Resource": [
        "arn:aws:logs:us-east-1:{your_aws_acct_id}:log-group:{log_group_name}:*"
    ]
    ~~~

    Specifying an AWS region that you do not have a cluster in, or a region that only partially covers your cluster will result in missing logs.

1. Copy the [Amazon Resource Name (ARN)](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) of the `CockroachCloudLogExportRole` role found under **Summary**, which is needed for the next step.

1. Use one of the following Cloud API commands to enable log export for your CockroachDB {{ site.data.products.standard }} cluster. The first presents a basic configuration, where all logs are sent to Amazon CloudWatch using the default settings. The second allows for more detailed customization of the logging configuration, such as the ability to send certain log channels to specific target log groups, or the ability to redact sensitive log entries.

    1. To enable log export for your CockroachDB {{ site.data.products.standard }} cluster with **default** logging configuration, issue the following Cloud API command:

        {% include_cached copy-clipboard.html %}
        ~~~shell
        curl --request POST \
          --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
          --header "Authorization: Bearer {secret_key}" \
          --data '{"type": "AWS_CLOUDWATCH", "log_name": "{log_group_name}", "auth_principal": "{role_arn}"}'
        ~~~

        Where:
        - `{cluster_id}` is your CockroachDB {{ site.data.products.standard }} cluster ID as determined in step 2.
        - `{secret_key}` is your CockroachDB {{ site.data.products.standard }} API key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}) for instructions on generating this key.
        - `{log_group_name}` is the target Amazon CloudWatch log group you created in step 1.
        - `{role_arn}` is the ARN for the `CockroachCloudLogExportRole` role you copied in step 7.

    1. To enable log export for your CockroachDB {{ site.data.products.standard }} cluster with **custom** logging configuration:

        1. Consult the log export entry on the [CockroachDB {{ site.data.products.cloud }} API Reference](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters/-cluster_id-/logexport) and select the **Schema** tab to view the supported log configuration options, and determine the customized logging configuration you would like to use.

            For example, consider the following configuration:

            {% include_cached copy-clipboard.html %}
            ~~~json
            {
             "type": "AWS_CLOUDWATCH",
             "log_name": "default",
             "auth_principal": "{role_arn}",
             "redact": true,
             "region": "",
             "omitted_channels": [ "SESSIONS", "SQL_PERF"],
             "groups": [
                     {
                         "log_name": "sql",
                         "channels": ["SQL_SCHEMA", "SQL_EXEC"],
                         "redact": false
                     },
                     {
                         "log_name": "devops",
                         "channels": ["OPS", "HEALTH", "STORAGE"],
                         "min_level": "WARNING"
                     }
             ]
            }
            ~~~

            This configuration:
            - Enables [redaction]({% link {{site.current_cloud_version}}/configure-logs.md %}#redact-logs) globally for all log entries emitted to AWS CloudWatch.
            - Does not send log entries in the `SESSIONS` and `SQL_PERF` logging channels.
            - Sends log entries in the `SQL_SCHEMA` and `SQL_EXEC` [logging channels]({% link {{site.current_cloud_version}}/logging-overview.md %}#logging-channels) to a AWS CloudWatch log group named `sql`, and overrides (disables) the global redaction configuration for just these two log channels only.
            - Sends log entries in the `OPS`, `HEALTH`, and `STORAGE` [logging channels]({% link {{site.current_cloud_version}}/logging-overview.md %}#logging-channels) to an AWS CloudWatch log group named `devops`, but only for those entries that are of log [severity level](/docs/{{site.current_cloud_version}}/logging.html#logging-levels-severities) `WARNING` or higher.
            - Sends log entries in all other [logging channels](#what-log-channels-are-supported) to the `default` AWS CloudWatch log group.

        1. Once you have determined the configuration you'd like to use, edit the configuration to be a single line, the required form for passing to the configuration command in the next step. To accomplish this easily, use a third-party minifier, such as [json minifier](https://jsonformatter.org/json-minify). The preceding configuration becomes the following single line:

            {% include_cached copy-clipboard.html %}
            ~~~json
            {"type":"AWS_CLOUDWATCH","log_name":"default","auth_principal":"{role_arn}","redact":true,"region":"","omitted_channels":["SESSIONS","SQL_PERF"],"groups":[{"log_name":"sql","channels":["SQL_SCHEMA","SQL_EXEC"],"redact":false},{"log_name":"devops","channels":["OPS","HEALTH","STORAGE"],"min_level":"WARNING"}]}
            ~~~

        1. To enable log export for your CockroachDB {{ site.data.products.standard }} cluster with the preceding example configuration, issue the following Cloud API command:

            {% include_cached copy-clipboard.html %}
            ~~~shell
            curl --request POST \
              --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
              --header "Authorization: Bearer {secret_key}" \
              --data '{"type":"AWS_CLOUDWATCH","log_name":"default","auth_principal":"{role_arn}","redact":true,"region":"","omitted_channels":["SESSIONS","SQL_PERF"],"groups":[{"log_name":"sql","channels":["SQL_SCHEMA","SQL_EXEC"],"redact":false},{"log_name":"devops","channels":["OPS","HEALTH","STORAGE"],"min_level":"WARNING"}]}'
            ~~~

            Where:
            - `{cluster_id}` is your CockroachDB {{ site.data.products.standard }} cluster ID as determined in step 2.
            - `{secret_key}` is your CockroachDB {{ site.data.products.standard }} API key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}) for instructions on generating this key.
            - `{role_arn}` is the ARN for the `CockroachCloudLogExportRole` role you copied in step 7.

1. Depending on the size of your cluster and how many regions it spans, the configuration may take a moment. You can monitor the ongoing status of the configuration using the following Cloud API command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
      --header "Authorization: Bearer {secret_key}"
    ~~~

    Run the command periodically until the command returns a status of `ENABLED`, at which point the configuration is complete, and logs will begin appearing in CloudWatch under the log group you created in step 1. Since the configuration is applied to cluster [regions]({% link cockroachcloud/regions.md %}) in a rolling fashion, you may see some logs appear even before the `GET` command returns an `ENABLED` status.

1. Once log export has been enabled, you can access logs from your CockroachDB {{ site.data.products.standard }} cluster directly in [Amazon CloudWatch](https://console.aws.amazon.com/cloudwatch/home).

</section>

<section class="filter-content" markdown="1" data-scope="gcp-log-export">

Perform the following steps to enable log export from your CockroachDB {{ site.data.products.standard }} cluster to GCP Cloud Logging.

1. Find your CockroachDB {{ site.data.products.standard }} organization ID in the CockroachDB {{ site.data.products.cloud }} [organization information page](https://cockroachlabs.cloud/information).

1. Find your CockroachDB {{ site.data.products.standard }} cluster ID:

	1. Visit the CockroachDB {{ site.data.products.cloud }} console [cluster page](https://cockroachlabs.cloud/clusters).
	1. Click on the name of your cluster.
	1. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`.

1. Determine the GCP principal to grant permission to from your account. This principal is already created for you by Cockroach Labs; this step merely determines its account name. This command uses the third-party JSON parsing tool [`jq`](https://stedolan.github.io/jq/download/) to isolate just the needed `id` (GCP cluster ID) and `account_id` (GCP account ID) fields, and combines them for you in the required form:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{your_cluster_id} \
      --header "Authorization: Bearer {secret_key}" | jq .keychain_config.gcp_auth_principal
    ~~~

    Where:
    - `{your_cluster_id}` is the cluster ID of your CockroachDB {{ site.data.products.standard }} cluster as determined in step 2.
    - `{secret_key}` is your API access key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}) for more details.

    The resulting GCP principal should resemble the following example:

    {% include_cached copy-clipboard.html %}
    ~~~
    CRLKeychainServiceAccount@crl-staging-1abc.iam.gserviceaccount.com
    ~~~

    This GCP principal refers to a resource that is owned by Cockroach Labs and is created automatically along with your cluster. You **do not** need to create this account in GCP; it is already present for use by your cluster.

1. Create a new role with the required permissions in your GCP project:

 1. In the GCP console, visit the [IAM roles page](https://console.cloud.google.com/iam-admin/roles) for your project.
 1. Click **+ Create role**.
 1. Give your role a title and ID of your choosing, then click **+ Add permissions**.
 1. Search for `logging.logEntries.create` in the **Filter** field, check the checkbox next to the resulting match, then click **Add**.
 1. Click the **Create** button.

1. Create a new service account in your GCP project:

 1. In the GCP console, visit the [Service Accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts) for your project.
 1. Click **+ CREATE SERVICE ACCOUNT**.
 1. Give your service account a name and ID of your choosing, then click **CREATE AND CONTINUE**.
 1. For the **Grant this service account access to project** step, select the role you created in Step 4.
 1. Click the **DONE** button.

1. Give permissions to the new service account.

   1. Click into the new service account you created in step 5.
   1. Under **DETAILS**, copy the email address for the service account.
   1. Click **PERMISSIONS**.
   1. Click **+ GRANT ACCESS**.
   1. Under **Add principals**, enter the GCP principal from step 3.
   1. Under **Assign roles**, select "Service Account Token Creator".

1. Use one of the following Cloud API commands to enable log export for your CockroachDB {{ site.data.products.standard }} cluster. The first presents a basic configuration, where all logs are sent to GCP Cloud Logging using the default settings. The second allows for more detailed customization of the logging configuration, such as the ability to send certain log channels to specific target log groups, or the ability to redact sensitive log entries.

    1. To enable log export for your CockroachDB {{ site.data.products.standard }} cluster with **default** logging configuration, issue the following Cloud API command:

        {% include_cached copy-clipboard.html %}
        ~~~shell
        curl --request POST \
          --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
          --header "Authorization: Bearer {secret_key}" \
          --data '{"type": "GCP_CLOUD_LOGGING", "log_name": "{log_name}", "auth_principal": "{service_account_email}"}'
        ~~~

        Where:
        - `{cluster_id}` is your CockroachDB {{ site.data.products.standard }} cluster ID as determined in step 2.
        - `{secret_key}` is your CockroachDB {{ site.data.products.standard }} API key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}) for instructions on generating this key.
        - `{log_name}` is a string of your choosing to represent logs written from your CockroachDB {{ site.data.products.standard }} cluster. This name will appear in the name of each log written to GCP Cloud Logging.
        - `{service_account_email}` is the email address of the service account that you copied in step 6.

    1. To enable log export for your CockroachDB {{ site.data.products.standard }} cluster with **custom** logging configuration:

        1. Consult the log export entry on the [CockroachDB {{ site.data.products.cloud }} API Reference](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters/-cluster_id-/logexport) and select the **Schema** tab to view the supported log configuration options, and determine the customized logging configuration you would like to use.

            For example, consider the following configuration:

            {% include_cached copy-clipboard.html %}
            ~~~json
            {
             "type": "GCP_CLOUD_LOGGING",
             "log_name": "default",
             "auth_principal": "{service_account_email}",
             "redact": true,
             "region": "",
             "omitted_channels": [ "SESSIONS", "SQL_PERF"],
             "groups": [
                     {
                         "log_name": "sql",
                         "channels": ["SQL_SCHEMA", "SQL_EXEC"],
                         "redact": false
                     },
                     {
                         "log_name": "devops",
                         "channels": ["OPS", "HEALTH", "STORAGE"],
                         "min_level": "WARNING"
                     }
             ]
            }
            ~~~

            This configuration:
            - Enables [redaction]({% link {{site.current_cloud_version}}/configure-logs.md %}#redact-logs) globally for all log entries emitted to GCP Cloud Logging.
            - Does not send log entries in the `SESSIONS` and `SQL_PERF` logging channels.
            - Sends log entries in the `SQL_SCHEMA` and `SQL_EXEC` [logging channels]({% link {{site.current_cloud_version}}/logging-overview.md %}#logging-channels) to a GCP Cloud Logging log group named `sql`, and overrides (disables) the global redaction configuration for just these two log channels only.
            - Sends log entries in the `OPS`, `HEALTH`, and `STORAGE` [logging channels]({% link {{site.current_cloud_version}}/logging-overview.md %}#logging-channels) to a GCP Cloud Logging log group named `devops`, but only for those entries that are of log [severity level]({% link {{site.current_cloud_version}}/logging.md %}#logging-levels-severities) `WARNING` or higher.
            - Sends log entries in all other [logging channels](#what-log-channels-are-supported) to the `default` GCP Cloud Logging log group.

        1. Once you have determined the configuration you'd like to use, edit the configuration to be a single line, the required form for passing to the configuration command in the next step. To accomplish this easily, use a third party minifier, such as [json minifier](https://jsonformatter.org/json-minify). The preceding configuration becomes the following single line:

            {% include_cached copy-clipboard.html %}
            ~~~json
            {"type":"GCP_CLOUD_LOGGING","log_name":"default","auth_principal":"{service_account_email}","redact":true,"region":"","omitted_channels":["SESSIONS","SQL_PERF"],"groups":[{"log_name":"sql","channels":["SQL_SCHEMA","SQL_EXEC"],"redact":false},{"log_name":"devops","channels":["OPS","HEALTH","STORAGE"],"min_level":"WARNING"}]}
            ~~~

        1. To enable log export for your CockroachDB {{ site.data.products.standard }} cluster with the preceding example configuration, issue the following Cloud API command:

            {% include_cached copy-clipboard.html %}
            ~~~shell
            curl --request POST \
              --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
              --header "Authorization: Bearer {secret_key}" \
              --data '{"type":"GCP_CLOUD_LOGGING","log_name":"default","auth_principal":"{service_account_email}","redact":true,"region":"","omitted_channels":["SESSIONS","SQL_PERF"],"groups":[{"log_name":"sql","channels":["SQL_SCHEMA","SQL_EXEC"],"redact":false},{"log_name":"devops","channels":["OPS","HEALTH","STORAGE"],"min_level":"WARNING"}]}'
            ~~~

            Where:
            - `{cluster_id}` is your CockroachDB {{ site.data.products.standard }} cluster ID as determined in step 2.
            - `{secret_key}` is your CockroachDB {{ site.data.products.standard }} API key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}) for instructions on generating this key.
            - `{service_account_email}` is the email address of the service account that you copied in step 6.

1. Depending on the size of your cluster and how many regions it spans, the configuration may take a moment. You can monitor the ongoing status of the configuration using the following Cloud API command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
      --header "Authorization: Bearer {secret_key}"
    ~~~

    Run the command periodically until the command returns a status of `ENABLED`, at which point the configuration is complete, and logs will begin appearing in GCP Cloud Logging. Since the configuration is applied to cluster [regions]({% link cockroachcloud/regions.md %}) in a rolling fashion, you may see some logs appear even before the `GET` command returns an `ENABLED` status.

1. Once log export has been enabled, you can access logs from your CockroachDB {{ site.data.products.standard }} cluster directly in GCP Cloud Logging's [Log Explorer](https://console.cloud.google.com/logs/query).

</section>

{{site.data.alerts.callout_info}}
Once log export has been enabled, logs generated going forward are sent to the specified cloud sink. Logs are not back-filled to the specified cloud sink.
{{site.data.alerts.end}}

## Monitor the status of a log export configuration

To check the status of an existing CockroachDB {{ site.data.products.standard }} log export configuration, use the following Cloud API command:

{% include_cached copy-clipboard.html %}
~~~shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

- `{cluster_id}` is your CockroachDB {{ site.data.products.standard }} cluster's cluster ID, which can be found in the URL of your [Cloud Console](https://cockroachlabs.cloud/) for the specific cluster you wish to configure, resembling `f78b7feb-b6cf-4396-9d7f-494982d7d81e`.
- `{secret_key}` is your CockroachDB {{ site.data.products.standard }} API key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}) for instructions on generating this key.

## Update an existing log export configuration

To update an existing CockroachDB {{ site.data.products.standard }} log export configuration, make any necessary changes to your cloud provider configuration (e.g., Amazon CloudWatch or GCP Cloud Logging), then issue the same `POST` Cloud API command as shown in the [Enable log export](#enable-log-export) instructions for your cloud provider with the desired updated configuration. Follow the [Monitor the status of a log export configuration](#monitor-the-status-of-a-log-export-configuration) instructions to ensure the update completes successfully.

## Disable log export

To disable an existing CockroachDB {{ site.data.products.standard }} log export configuration, and stop sending logs to a cloud log sink, use the following Cloud API command:

{% include_cached copy-clipboard.html %}
~~~shell
curl --request DELETE \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

- `{cluster_id}` is your CockroachDB {{ site.data.products.standard }} cluster's cluster ID, which can be found in the URL of your [Cloud Console](https://cockroachlabs.cloud/clusters/) for the specific cluster you wish to configure, resembling `f78b7feb-b6cf-4396-9d7f-494982d7d81e`.
- `{secret_key}` is your CockroachDB {{ site.data.products.standard }} API key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}) for instructions on generating this key.

## Limitations

- CockroachDB {{ site.data.products.standard }} clusters hosted on AWS can only export logs to Amazon CloudWatch. Similarly, CockroachDB {{ site.data.products.standard }} clusters hosted on GCP can only export logs to GCP Cloud Logging.
- The log export feature does not guarantee 100% log delivery or at-least-once delivery.

## CockroachDB {{ site.data.products.standard }} log export Frequently Asked Questions (FAQ)

### Is it possible to configure exported logs to be redacted at source?

Yes, use the `redact: true` log configuration option. Refer to [Redact logs]({% link {{site.current_cloud_version}}/configure-logs.md %}#redact-logs) for more information.

### Is it possible to send different log channels to different log groups in my cloud log sink?

Yes, use the custom log configuration step for your cloud provider, and specify multiple `groups`, each with a unique `log_name` value, in your configuration.

### Is it possible to send logs from one cloud provider to another?

No, if your CockroachDB {{ site.data.products.standard }} cluster resides on AWS, you can only export your logs to Amazon CloudWatch. Similarly, if your CockroachDB {{ site.data.products.standard }} cluster resides on GCP, you can only export your logs to GCP Cloud Logging.

### For a multi-region cluster, are the logs from all regions exported to one cloud log sink region?

No, logs for each region in your cluster are exported to the corresponding cloud log sink region configured for your account. For AWS, ensure that the target Amazon CloudWatch log group is configured with the same name in all target regions, and that the [IAM role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) you are using has permission to access each regional log group. For GCP, you can configure [Log Buckets](https://cloud.google.com/logging/docs/buckets) to collect logs from different regions, as well as assign individual retention policies by region if desired. By default, all logs written to GCP Cloud Logging are written to a `_Default` bucket, in the "global" region.

### What log channels are supported?

You can export the following CockroachDB [log channels]({% link {{site.current_cloud_version}}/logging-overview.md %}#logging-channels): `SESSIONS`, `OPS`, `HEALTH`, `STORAGE`, `SQL_SCHEMA`, `USER_ADMIN`, `PRIVILEGES`, `SENSITIVE_ACCESS`, `SQL_EXEC`, `SQL_PERF`, and `CHANGEFEED`.

Log channels, such as `DEV`, `KV_DISTRIBUTION`, `SQL_INTERNAL_PERF`, and `TELEMETRY`, cannot be exported from CockroachDB {{ site.data.products.standard }}. These are for Cockroach Labs internal use cases and are not meant for external use. If you need access to additional logs, contact [Support](https://support.cockroachlabs.com/hc/).

### Is it possible to include SQL audit logs as part of the log export capability?

Yes, the [SQL Audit Log]({% link {{site.current_cloud_version}}/sql-audit-logging.md %}) is exported via the `SENSITIVE_ACCESS` log channel by default, as long as you have previously enabled audit logging on desired tables using the [`ALTER TABLE ...EXPERIMENTAL_AUDIT`]({% link {{site.current_cloud_version}}/alter-table.md %}#experimental_audit) statement.

### Can I use an AWS External ID with the log export feature?

No, the CockroachDB {{ site.data.products.standard }} log export feature does not support use of an AWS External ID. You must configure a cross-account IAM Role as described in the [Enable log export](#enable-log-export) instructions.

### Does log export configuration use the same syntax as CockroachDB log configuration?

No, log export configuration uses the [CockroachDB {{ site.data.products.cloud }} API](https://www.cockroachlabs.com/docs/api/cloud/v1.html#post-/api/v1/clusters/-cluster_id-/logexport) syntax. For example, log export uses `min_level` to define log [severity levels]({% link {{site.current_cloud_version}}/logging.md %}#logging-levels-severities), while CockroachDB uses `filter`.

## Troubleshooting

### Amazon CloudWatch

Most log export errors stem from incorrect AWS IAM configuration. Ensure you have followed steps 1 through 6 of the [Enable log export](#enable-log-export) instructions closely, and that you have a **cross-account** IAM role which trusts your CockroachDB {{ site.data.products.standard }} AWS account ID (as determined in step 3) and has permission to write to your specified log group in CloudWatch (as created in step 1).

When supplying the [Amazon Resource Name (ARN)](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) to step 9, be sure you are supplying the ARN for the `CockroachCloudLogExportRole` role, **not** the ARN for the `CockroachCloudLogExportPolicy` policy. Whether you are using the default logging configuration or the custom configuration: be sure to supply this ARN to the `auth_principal` parameter, in the `--data` payload.

### GCP Cloud Logging

When supplying the GCP project ID in step 6a or 6b, be sure you use the **Project ID**, and not the **Project Name**. Both are shown on the Google Cloud Console [Settings page](https://console.cloud.google.com/iam-admin/settings).

You do not need to create a GCP service account to enable or manage log export. The GCP principal mentioned in step 3 and used in step 5c is already created for you. These steps simply determine the account name of this principal, which is specific to your cluster.
