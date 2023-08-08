---
title: Export Metrics with Terraform
summary: Learn how to use the CockroachDB Cloud Terraform provider to export metrics.
toc: true
docs_area: manage
cloud: true
---

[Terraform](https://terraform.io) is an infrastructure-as-code provisioning tool that uses configuration files to define application and network resources. You can use the [CockroachDB Cloud Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach) to configure metrics export to [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) or [Datadog](https://www.datadoghq.com/). Once the export is configured, metrics will flow from all nodes in all regions of your {{ site.data.products.dedicated }} cluster to your chosen cloud metrics sink.

Exporting metrics to AWS CloudWatch is only available on {{ site.data.products.dedicated }} clusters which are hosted on AWS, and were created after August 11, 2022. Metrics export to Datadog is supported on all {{ site.data.products.dedicated }} clusters regardless of creation date.

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

## Before you begin

Before you start this tutorial, you must have [the CockroachBDCloud Terraform provider](https://learn.hashicorp.com/tutorials/terraform/install-cli) set up. These instructions apply to an existing {{ site.data.products.dedicated }} cluster that you are managing with Terraform. Follow the tutorial to [Provision a Cluster with Terraform](provision-a-cluster-with-terraform.html?filters=dedicated) to start using Terraform with a new cluster.

You must also have a [service account](managing-access.html#manage-service-accounts) and [API key](managing-access.html#api-access) in the [CockroachDB Cloud Console](https://cockroachlabs.cloud) with `admin` privilege or the Cluster Creator / Cluster Admin role at the organization scope.

## Enable metrics export

<div class="filters clearfix">
  <button class="filter-button" data-scope="aws-metrics-export">AWS CloudWatch</button>
  <button class="filter-button" data-scope="datadog-metrics-export">Datadog</button>
</div>

<section class="filter-content" markdown="1" data-scope="aws-metrics-export">

Exporting metrics to AWS CloudWatch is only available on {{ site.data.products.dedicated }} clusters which are hosted on AWS. If your {{ site.data.products.dedicated }} cluster is hosted on GCP, you can [export metrics to Datadog](export-metrics.html?filters=datadog-metrics-export) instead.

{{site.data.alerts.callout_info}}
Enabling metrics export will send around 250 metrics per node to AWS CloudWatch. Review the [AWS CloudWatch documentation](https://aws.amazon.com/cloudwatch/pricing/) to gauge how this adds to your AWS CloudWatch spend.
{{site.data.alerts.end}}

Perform the following steps to enable metrics export from your {{ site.data.products.dedicated }} cluster to AWS CloudWatch.

1. Create the desired target AWS CloudWatch log group by following the [Create a log group in CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html#Create-Log-Group) instructions. If you already have a log group created, you may skip this step. When your {{ site.data.products.dedicated }} cluster emits metrics to AWS CloudWatch, they are written to this log group.

1. Find your {{ site.data.products.dedicated }} cluster ID:

	1. Visit the {{ site.data.products.db }} console [cluster page](https://cockroachlabs.cloud/clusters).
	1. Click on the name of your cluster.
	1. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`. It should resemble `f78b7feb-b6cf-4396-9d7f-494982d7d81e`.

1. Determine your cluster's cloud provider account ID. This command uses the third-party JSON parsing tool [`jq`](https://stedolan.github.io/jq/download/) to isolate just the needed `account_id` field:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{your_cluster_id} \
      --header 'Authorization: Bearer {secret_key}' | jq .account_id
    ~~~

    Where:
    - `{your_cluster_id}` is the cluster ID of your {{ site.data.products.dedicated }} cluster as determined in step 2.
    - `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](managing-access.html) for more details.

1.  Create a cross-account IAM role in your AWS account:

	1. In the AWS console, visit the [IAM page](https://console.aws.amazon.com/iam/).
	1. Select **Roles** and click **Create role**.
	1. For **Trusted entity type**, select **AWS account**.
	1. Choose **Another AWS account**.
	1. For **Account ID**, provide the {{ site.data.products.dedicated }} cloud provider account ID from step 3.
	1. Finish creating the IAM role with a suitable name. These instructions will use the role name `CockroachCloudMetricsExportRole`. You do not need to add any permissions.

	{{site.data.alerts.callout_info}}
	You will need the Amazon Resource Name (ARN) for your cross-account IAM role later in this procedure.
	{{site.data.alerts.end}}

1. Select the new role, and create a new policy for this role. These instructions will use the policy name `CockroachCloudMetricsExportPolicy`.

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
                    "arn:aws:logs:*:{your_aws_acct_id}:log-group:{log_group_name}",
                    "arn:aws:logs:*:{your_aws_acct_id}:log-group:{log_group_name}:log-stream:*"
                ]
            }
        ]
    }
    ~~~

    Where:
    - `{your_aws_acct_id}` is the AWS Account ID of the AWS account where you created the `CockroachCloudMetricsExportRole` role, **not** the cloud provider account ID of your {{ site.data.products.dedicated }} cluster from step 3. You can find your AWS Account ID on the AWS [IAM page](https://console.aws.amazon.com/iam/).
    - `{log_group_name}` is the target AWS CloudWatch log group you created in step 1.

    This defines the set of permissions that the {{ site.data.products.dedicated }} metrics export feature requires to be able to write metrics to CloudWatch.

1. Copy the [Amazon Resource Name (ARN)](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) of the `CockroachCloudMetricsExportRole` role found under **Summary**, which is needed for the next step.

1. Issue the following Cloud API command to enable metrics export for your {{ site.data.products.dedicated }} cluster:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request POST \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/metricexport/cloudwatch \
      --header "Authorization: Bearer {secret_key}" \
      --data '{"target_region": "{aws_region}", "role_arn": "arn:aws:iam::{role_arn}:role/CockroachCloudMetricsExportRole", "log_group_name": "{log_group_name}"}'
    ~~~

    Where:
    - `{cluster_id}` is your {{ site.data.products.dedicated }} cluster ID as determined in step 2.
    - `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](managing-access.html) for instructions on generating this key.
    - `{aws_region}` is your AWS region, like `us-east-1`.
    - `{role_arn}` is the ARN for the `CockroachCloudMetricsExportRole` role you copied in step 7. If you used a different role name there, be sure to use your role name in place of `CockroachCloudMetricsExportRole` in the above command.
    - `{log_group_name}` is the target AWS CloudWatch log group you created in step 1. This **must** be the same group name you provided in step 6.

    Specifying an AWS region (to `{aws_region}`) that you do not have a cluster in, or a region that only partially covers your cluster's nodes will result in missing metrics.

1. Depending on the size of your cluster and how many regions it spans, the configuration may take a moment. You can monitor the ongoing status of the configuration using the following Cloud API command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/metricexport/cloudwatch \
      --header "Authorization: Bearer {secret_key}"
    ~~~

    Run the command periodically until the command returns a status of `ENABLED`, at which point the configuration across all nodes is complete, and metrics will begin appearing in CloudWatch under the log group you created in step 1. Since the configuration is applied to cluster nodes in a rolling fashion, you may see some metrics appear even before the `GET` command returns an `ENABLED` status.

1. Once metrics export has been enabled, you can access metrics from your {{ site.data.products.dedicated }} cluster directly in [AWS CloudWatch](https://console.aws.amazon.com/cloudwatch/home).

</section>

<section class="filter-content" markdown="1" data-scope="datadog-metrics-export">

To enable metrics export for your {{ site.data.products.dedicated }} cluster to Datadog, you can either [enable the Datadog integration in the {{ site.data.products.db }} Cloud Console](https://www.cockroachlabs.com/docs/cockroachcloud/tools-page.html#monitor-cockroachdb-dedicated-with-datadog), [enable the Datadog integraiton from the command line using the Cloud API](export-metrics.html), or use the Terraform provider following the instructions below:

1. Find your {{ site.data.products.dedicated }} cluster ID:

	1. Visit the {{ site.data.products.db }} console [cluster page](https://cockroachlabs.cloud/clusters).
	1. Click on the name of your cluster.
	1. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`. It should resemble `f78b7feb-b6cf-4396-9d7f-494982d7d81e`.

1. Determine the [Datadog API key](https://docs.datadoghq.com/account_management/api-app-keys/) you'd like to use. If you don't already have one, follow the steps to [add a new Datadog API key](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token).

1. Issue the following Cloud API command to enable metrics export for your {{ site.data.products.dedicated }} cluster:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request POST \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/metricexport/datadog \
      --header "Authorization: Bearer {secret_key}" \
      --data '{"site": "{datadog_site}", "api_key": "{datadog_api_key}"}'
    ~~~

    Where:
    - `{cluster_id}` is your {{ site.data.products.dedicated }} cluster ID as determined in step 1, resembling `f78b7feb-b6cf-4396-9d7f-494982d7d81e`.
    - `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](managing-access.html) for instructions on generating this key.
    - `{datadog_site}` is your Datadog site. Valid sites are: `US1`, `US3`, `US5`, `US1_GOV`, and `EU1`.
    - `{datadog_api_key}` is the Datadog API key determined in step 2.

1. Depending on the size of your cluster and how many regions it spans, the configuration may take a moment. You can monitor the ongoing status of the configuration using the following Cloud API command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/metricexport/datadog \
      --header "Authorization: Bearer {secret_key}"
    ~~~

    Run the command periodically until the command returns a status of `ENABLED`, at which point the configuration across all nodes is complete, and metrics will begin appearing in the Datadog interface. Since the configuration is applied to cluster nodes in a rolling fashion, you may see some metrics appear even before the `GET` command returns an `ENABLED` status.

1. Once metrics export has been enabled, you can access metrics from your {{ site.data.products.dedicated }} cluster directly in Datadog's [Metrics Explorer](https://docs.datadoghq.com/metrics/explorer/), or via Datadog's [notebook](https://docs.datadoghq.com/notebooks/) or [dashboard](https://docs.datadoghq.com/dashboards/) features.

</section>

## Update your Terraform configurations

Terraform uses a infrastructure-as-code approach to managing resources. Terraform configuration files allow you to define resources declaratively and let Terraform manage their lifecycle. For details about the log export resource schema, refer to [the Terraform provider documentation](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/resources/log-export-config).

## Monitor the status of a metrics export configuration

<div class="filters clearfix">
  <button class="filter-button" data-scope="aws-metrics-export">AWS CloudWatch</button>
  <button class="filter-button" data-scope="datadog-metrics-export">Datadog</button>
</div>

<section class="filter-content" markdown="1" data-scope="aws-metrics-export">

To check the status of an existing AWS Cloudwatch metrics export configuration, use the following Cloud API command:

{% include_cached copy-clipboard.html %}
~~~shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/metricexport/cloudwatch \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

- `{cluster_id}` is your {{ site.data.products.dedicated }} cluster's cluster ID, which can be found in the URL of your [Cloud Console](https://cockroachlabs.cloud/clusters/) for the specific cluster you wish to configure, resembling `f78b7feb-b6cf-4396-9d7f-494982d7d81e`.
- `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](managing-access.html) for instructions on generating this key.

</section>

<section class="filter-content" markdown="1" data-scope="datadog-metrics-export">

To check the status of an existing Datadog metrics export configuration, use the following Cloud API command:

{% include_cached copy-clipboard.html %}
~~~shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/metricexport/datadog \
  --header "Authorization: Bearer {secret_key}"
~~~

Where:

- `{cluster_id}` is your {{ site.data.products.dedicated }} cluster's cluster ID, which can be found in the URL of your [Cloud Console](https://cockroachlabs.cloud/clusters/) for the specific cluster you wish to configure, resembling `f78b7feb-b6cf-4396-9d7f-494982d7d81e`.
- `{secret_key}` is your {{ site.data.products.dedicated }} API key. See [API Access](managing-access.html) for instructions on generating this key.

</section>

## Update an existing metrics export configuration

To update an existing {{ site.data.products.dedicated }} metrics export configuration, make any necessary changes to your terraform configuration files, then run the `terraform apply` command to apply the updated configuration. Follow the [Monitor the status of a metrics export configuration](#monitor-the-status-of-a-metrics-export-configuration) instructions to ensure the update completes successfully.
    
## Disable metrics export

## Limitations

- Metrics export to AWS CloudWatch is only available on {{ site.data.products.dedicated }} clusters which are hosted on AWS. If your {{ site.data.products.dedicated }} cluster is hosted on GCP, you can [export metrics to Datadog](export-metrics-terraform.html?filters=datadog-metrics-export) instead.
- AWS CloudWatch does not currently support histograms. Any histogram-type metrics emitted from your {{ site.data.products.dedicated }} cluster are dropped by CloudWatch. See [Prometheus metric type conversion](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights-Prometheus-metrics-conversion.html) for more information, and [Logging dropped Prometheus metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights-Prometheus-troubleshooting-EKS.html#ContainerInsights-Prometheus-troubleshooting-droppedmetrics) for instructions on tracking dropped histogram metrics in CloudWatch.
    
## Learn more

- See the [CockroachDB Cloud Terraform provider reference docs](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs) for detailed information on the resources you can manage using Terraform.
- Read about how to [provision a cluster with Terraform](provision-a-cluster-with-terraform.html).
- Read about how to [manage databases with Terraform](manage-database-terraform.html).
- Read about how to [export logs with Terraform](export-logs-terraform.html)