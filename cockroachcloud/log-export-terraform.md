---
title: Export Logs with Terraform
summary: Learn how to use the CockroachDB Cloud Terraform provider to export logs.
toc: true
docs_area: manage
---

[Terraform](https://terraform.io) is an infrastructure-as-code provisioning tool that uses configuration files to define application and network resources. You can use the [CockroachDB Cloud Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) to configure log export to [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) or [GCP Cloud Logging](https://cloud.google.com/logging). Once the export is configured, logs will flow from all nodes in all regions of your {{ site.data.products.dedicated }} cluster to your chosen cloud log sink. You can set up log export with configurations such as redacting sensitive log entries, limiting log output by severity, and sending log entries to specific log group targets by log channel.

{{site.data.alerts.callout_danger}}
The {{ site.data.products.dedicated }} log export feature is only available on clusters created after August 11, 2022 (AWS) or September 9, 2022 (GCP).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/limited-access.md %}
{{site.data.alerts.end}}

## Before you begin

Before you start this tutorial, you must have [the CockroachBDCloud Terraform provider](https://learn.hashicorp.com/tutorials/terraform/install-cli) set up. These instructions apply to an existing {{ site.data.products.dedicated }} cluster that you are managing with Terraform. Follow the tutorial to [Provision a Cluster with Terraform](provision-a-cluster-with-terraform.html?filters=dedicated) to start using Terraform with a new cluster.

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

1. Create the desired target AWS CloudWatch log group by following the [Create a log group in CloudWatch logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html#Create-Log-Group) instructions. If you already have a log group created, you may skip this step. To send logs to more than one target log group, see the custom configuration option in step 9 below.

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
	1. For **Account ID**, provide the {{ site.data.products.dedicated }} AWS Account ID from step 3.
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
             type: GCP_CLOUD_LOGGING,
             log_name: "default",
             auth_principal: "{gcp_project_id}",
             redact: true,
             region: "",
             groups: [
                     {
                         log_name: "sql",
                         channels: ["SQL_SCHEMA", "SQL_EXEC"],
                         redact: false,
                     },
                     {
                         log_name: "devops",
                         channels: ["OPS", "HEALTH", "STORAGE"]
                         min_level: "WARNING"
                     },
             ]
            }
            ~~~

            This configuration:
            - Enables [redaction](/docs/{{site.current_cloud_version}}/configure-logs.html#redact-logs) globally for all log entries emitted to GCP Cloud Logging.
            - Sends log entries in the `SQL_SCHEMA` and `SQL_EXEC` [logging channels](/docs/{{site.current_cloud_version}}/logging-overview.html#logging-channels) to a GCP Cloud Logging log group named `sql`, and overrides (disables) the global redaction configuration for just these two log channels only.
            - Sends log entries in the `OPS`, `HEALTH`, and `STORAGE` [logging channels](/docs/{{site.current_cloud_version}}/logging-overview.html#logging-channels) to a GCP Cloud Logging log group named `devops`, but only for those entries that are of log [severity level](/docs/{{site.current_cloud_version}}/logging.html#logging-levels-severities) `WARNING` or higher.
            - Sends log entries in all other logging channels to the `default` GCP Cloud Logging log group.

</section>

## Update your Terraform configuration

## Monitor the status of a log export configuration

## Update an existing log export configuration

## Disable log export

## Learn more

- See the [CockroachDB Cloud Terraform provider reference docs](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs) for detailed information on the resources you can manage using Terraform.
- Read about how to [provision a cluster with Terraform](provision-a-cluster-with-terraform.html).
- Read about how to [manage databases with Terraform](manage-database-terraform.html).
- Read about how to [export metrics with Terraform](metrics-export-terraform.html)