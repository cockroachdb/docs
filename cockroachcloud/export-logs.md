---
title: Export Logs From a CockroachDB Dedicated Cluster
summary: Export Logs From a CockroachDB Dedicated Cluster
toc: true
docs_area: manage
---

{{ site.data.products.dedicated }} users can use the [Cloud API](cloud-api.html) to configure log export to [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) or [GCP Cloud Logging](https://cloud.google.com/logging). Once the export is configured, logs will flow from all nodes in all regions of your {{ site.data.products.dedicated }} cluster to your chosen cloud log sink.

The {{ site.data.products.dedicated }} log export feature is only available on clusters created after August 11, 2022 (AWS) or September 9, 2022 (GCP).

{% include feature-phases/preview-opt-in.md %}

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
`DELETE` | `ADMIN` | Disables log export, halting all log export to AWS CloudWatch.

See [Service accounts](console-access-management.html#service-accounts) for instructions on configuring a service account with these required permissions.

## Enable log export

<div class="filters clearfix">
  <button class="filter-button" data-scope="aws-log-export">AWS CloudWatch</button>
  <button class="filter-button" data-scope="gcp-log-export">GCP Cloud Logging</button>
</div>

<section class="filter-content" markdown="1" data-scope="aws-log-export">

{{site.data.alerts.callout_info}}
The {{ site.data.products.dedicated }} log export feature is only available on AWS-hosted clusters created after August 11, 2022.
{{site.data.alerts.end}}

Perform the following steps to enable log export from your {{ site.data.products.dedicated }} cluster to AWS CloudWatch.

1. Create the desired target AWS CloudWatch log group by following the [Create a log group in CloudWatch logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html#Create-Log-Group) instructions. If you already have a log group created, you may skip this step.

1. Find your {{ site.data.products.dedicated }} organization ID in the {{ site.data.products.db }} [organization settings page](https://cockroachlabs.cloud/settings).

1. Find your {{ site.data.products.dedicated }} cluster ID:
	
	1. Visit the {{ site.data.products.db }} console [cluster page](https://cockroachlabs.cloud/clusters).
	1. Click on the name of your cluster.
	1. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`.

1. Find your {{ site.data.products.dedicated }} cluster's associated AWS Account ID.

	You must find the Account ID of the AWS account that {{ site.data.products.dedicated }} will use for this purpose. To find the ID of the AWS account associated with your cluster, query the clusters endpoint of the {{ site.data.products.db }} API. The value is under the `account_id` field:

	{% include_cached copy-clipboard.html %}
	~~~shell
	curl --request GET \
	  --url https://cockroachlabs.cloud/api/v1/clusters/{your_cluster_id} \
	  --header 'Authorization: Bearer {secret_key}'
	~~~

    See [API Access](console-access-management.html) for instructions on generating the `{secret_key}`.

1.  Create a cross-account IAM role in your AWS account:

	1. In the AWS console, visit the [IAM page](https://console.aws.amazon.com/iam/).
	1. Select **Roles** and click **Create role**.
	1. For **Trusted entity type**, select **AWS account**.
	1. Choose **Another AWS account**.
		1. For **Account ID**, provide the {{ site.data.products.dedicated }} AWS Account ID that you found previously by querying your cluster's Cloud API.
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
    - `{your_aws_acct_id}` is the AWS Account ID of the AWS account where you created the `CockroachCloudLogExportRole` role, **not** the AWS Account ID of your {{ site.data.products.dedicated }} cluster. You can find your AWS Account ID on the AWS [IAM page](https://console.aws.amazon.com/iam/).
    - `{log_group_name}` is the target AWS CloudWatch log group you created in step 1.

    This defines the set of permissions that the {{ site.data.products.dedicated }} log export feature requires to be able to write logs to CloudWatch.

    If desired, you may also limit log export from your {{ site.data.products.dedicated }} cluster to a specific single AWS region, by providing the name of the desired region as the fourth value to the `Resource` entry. For example:

    {% include_cached copy-clipboard.html %}
    ~~~
    "Resource": [
        "arn:aws:logs:us-east-1:{your_aws_acct_id}:log-group:{log_group_name}:*"
    ]
    ~~~

    Specifying an AWS region that you do not have a cluster in, or a region that only partially covers your cluster's nodes will result in missing logs.

1. Copy the [Amazon Resource Name (ARN)](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) of the `CockroachCloudLogExportRole` role found under **Summary**, which is needed for the next step.

1. Issue the following Cloud API command to enable log export for your {{ site.data.products.dedicated }} cluster:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request POST \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/logexport \
      --header "Authorization: Bearer {secret_key}" \
      --data '{"type": "AWS_CLOUDWATCH", "log_name": "{log_group_name}", "auth_principal": "{role_arn}"}'
    ~~~

    Where:
    - `{cluster_id}` is your {{ site.data.products.dedicated }} cluster ID as determined in step 3.
    - `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](console-access-management.html) for instructions on generating this key.
    - `{log_group_name}` is the target AWS CloudWatch log group you created in step 1.
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

{{site.data.alerts.callout_info}}
The {{ site.data.products.dedicated }} log export feature is only available on GCP-hosted clusters created after September 9, 2022.
{{site.data.alerts.end}}

Perform the following steps to enable log export from your {{ site.data.products.dedicated }} cluster to GCP Cloud Logging.

1. Find your {{ site.data.products.dedicated }} organization ID in the {{ site.data.products.db }} [organization settings page](https://cockroachlabs.cloud/settings).

1. Find your {{ site.data.products.dedicated }} cluster ID:
	
	1. Visit the {{ site.data.products.db }} console [cluster page](https://cockroachlabs.cloud/clusters).
	1. Click on the name of your cluster.
	1. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`.

1. Find your {{ site.data.products.dedicated }} cluster's associated GCP Account ID.

	You must find the Account ID of the GCP account that {{ site.data.products.dedicated }} will use for this purpose. To find the ID of the GCP account associated with your cluster, query the clusters endpoint of the {{ site.data.products.db }} API. The value is under the `account_id` field:

	{% include_cached copy-clipboard.html %}
	~~~shell
	curl --request GET \
	  --url https://cockroachlabs.cloud/api/v1/clusters/{your_cluster_id} \
	  --header 'Authorization: Bearer {secret_key}'
	~~~

    See [API Access](console-access-management.html) for instructions on generating the `{secret_key}`.

1. Create a new role with the required permissions in your GCP project:

 1. In the GCP console, visit the [IAM roles page](https://console.cloud.google.com/iam-admin/roles) for your project.
 1. Click **+ Create role**.
 1. Give your role a title and ID of your choosing, then click **+ Add permissions**.
 1. Search for `logging.logEntries.create` in the **Filter** field, check the checkbox next to the resulting match, then click **Add**.
 1. Click the **Create** button.

1. Add your {{ site.data.products.dedicated }} cluster's service account principal to the role you just created.

	1. In the GCP console, visit the [IAM service accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts) for your project.
 1. Click the **+ Add** button.
 1. In the box labeled **New principals**, enter the service account ID for the {{ site.data.products.dedicated }}-managed service account to which you will grant access. The service account ID takes the following format:

        {% include_cached copy-clipboard.html %}
        ~~~
        crl-logging-user-{cluster_id}@{project_id}.iam.gserviceaccount.com
        ~~~

        Where:
        - `{cluster_id}` is the **last 12 digits** of your {{ site.data.products.dedicated }} cluster ID as determined in step 2.
        - `{project_id}` is your {{ site.data.products.dedicated }} cluster's associated GCP `account_id` as determined in step 3.

 1. In the **Select a role** dropdown, select the role you created in step 4.
	1. Click **SAVE**.

1. Issue the following Cloud API command to enable log export for your {{ site.data.products.dedicated }} cluster:

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

Logs exported in this fashion retain [`redactable`](/docs/{{site.versions["stable"]}}/configure-logs.html#redact-logs) markers, but are **not** themselves redacted. If you need to redact sensitive log data, you can use these `redactable` markers to do so once log entries have been written to your configured cloud log sink.

### Is it possible to configure multiple log export configurations to send different log channels to different log groups in my cloud log sink?

No, only one log export configuration is currently possible per cluster.

### Is it possible to send logs from one cloud provider to another?

No, if your {{ site.data.products.dedicated }} cluster resides on AWS, you can only export your logs to AWS CloudWatch. Similarly, if your {{ site.data.products.dedicated }} cluster resides on GCP, you can only export your logs to GCP Cloud Logging.

### For a multi-region cluster, are the logs from all regions exported to one cloud log sink region?

No, logs for each region in your cluster are exported to the corresponding cloud log sink region configured for your account. For AWS, ensure that the target AWS CloudWatch log group is configured with the same name in all target regions, and that the [IAM role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) you are using has permission to access each regional log group. For GCP, you can configure [Log Buckets](https://cloud.google.com/logging/docs/buckets) to collect logs from different regions, as well as assign individual retention policies by region if desired. By default, all logs written to GCP Cloud Logging are written to a `_Default` bucket, in the "global" region.

### What log channels are supported?

Currently, the following CockroachDB [log channels](/docs/{{site.versions["stable"]}}/logging-overview.html#logging-channels) are supported for export in this manner: `SESSIONS`,`OPS`, `HEALTH`, `STORAGE`, `SQL_SCHEMA`, `USER_ADMIN`, `PRIVILEGES`, `SENSITIVE_ACCESS`, `SQL_EXEC`, and `SQL_PERF`. Other log channels are not exportable from {{ site.data.products.dedicated }}.

### Is it possible to include SQL audit logs as part of the log export capability?

Yes, the [SQL Audit Log](/docs/{{site.versions["stable"]}}/sql-audit-logging.html) is exported via the `SENSITIVE_ACCESS` log channel by default, as long as you have previously enabled audit logging on desired tables using the [`ALTER TABLE ...EXPERIMENTAL_AUDIT`](/docs/{{site.versions["stable"]}}/experimental-audit.html) statement.

### Can I use an AWS External ID with the log export feature?

No, the {{ site.data.products.dedicated }} log export feature does not support use of an AWS External ID. You must configure a cross-account IAM Role as described in the [Enable log export](#enable-log-export) instructions.

## Troubleshooting

### AWS CloudWatch

Most log export errors stem from incorrect AWS IAM configuration. Ensure you have followed steps 1 through 8 of the [Enable log export](#enable-log-export) instructions closely, and that you have a **cross-account** IAM role which trusts your {{ site.data.products.dedicated }} AWS account ID (as determined in step 4) and has permission to write to your specified log group in CloudWatch (as created in step 1).

When supplying the [Amazon Resource Name (ARN)](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) to step 9, be sure you are supplying the ARN for the `CockroachCloudLogExportRole` role, **not** the ARN for the `CockroachCloudLogExportPolicy` policy.

### GCP Cloud Logging

Be sure you are only supplying only the **last 12** digits of your {{ site.data.products.dedicated }} cluster ID when providing the service account ID in step 6.

When supplying the GCP project ID in step 7, be sure you use the **Project ID**, and not the **Project Name**. Both are shown on the Google Cloud Console [Settings page](https://console.cloud.google.com/iam-admin/settings).
