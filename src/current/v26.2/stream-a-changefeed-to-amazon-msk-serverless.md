---
title: Stream a Changefeed to Amazon MSK Serverless
summary: Learn how to connect a changefeed to stream data to an Amazon MSK Serverless cluster.
toc: true
---

[Changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) can stream change data to [Amazon MSK Serverless clusters](https://docs.aws.amazon.com/msk/latest/developerguide/serverless.html) (Amazon Managed Streaming for Apache Kafka), which is an Amazon MSK cluster type that automatically scales your capacity.

MSK Serverless requires [IAM authentication](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html?icmpid=docs_iam_console) for the changefeed to connect to the cluster.

In this tutorial, you'll set up an MSK Serverless cluster and connect a changefeed with IAM authentication. You'll create the MSK Serverless cluster with an IAM policy and role. CockroachDB and a Kafka client will assume the IAM role in order to connect to the MSK Serverless cluster. Then you'll set up the Kafka client to consume the changefeed messages and start the changefeed on the CockroachDB cluster.

## Before you begin

You'll need:

- An [AWS account](https://signin.aws.amazon.com/signup?request_type=register).
- A CockroachDB {{ site.data.products.core }} cluster hosted on AWS. You can set up a cluster using [Deploy CockroachDB on AWS EC2]({% link {{ page.version.version }}/deploy-cockroachdb-on-aws.md %}). You must create instances in the same VPC that the MSK Serverless cluster will use in order for the changefeed to authenticate successfully.
- A Kafka client to consume the changefeed messages. You **must** ensure that your client machine is in the same VPC as the MSK Serverless cluster. This tutorial uses a client set up following the AWS [MSK Serverless guide](https://docs.aws.amazon.com/msk/latest/developerguide/create-serverless-cluster-client.html).
- {% include {{ page.version.version }}/cdc/tutorial-privilege-check.md %}

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/cdc/msk-dedicated-support.md %}
{{site.data.alerts.end}}

## Step 1. Create an MSK Serverless cluster

1. In the AWS Management Console, go to the [Amazon MSK console](https://console.aws.amazon.com/msk/home) and click **Create cluster**.
1. If you select **Quick create**, AWS will provision the cluster in the default VPC for the account. To modify the VPC or network settings, select **Custom create**. (The VPC selection is important because the MSK Serverless cluster must be in the same VPC as the CockroachDB instance and Kafka client machine.)
1. Ensure you name the cluster and select **Serverless** as the cluster type. Click **Create cluster**.
1. Once the cluster is running, click **View client information** in the **Cluster summary** box. Copy the endpoint address, which will be similar to `boot-vab1abab.c1.kafka-serverless.us-east-1.amazonaws.com:9098`. Click **Done** to return to the cluster's overview page.

## Step 2. Create an IAM policy and role to access the MSK Serverless cluster

MSK Serverless clusters only support IAM authentication. In this step, you'll create an IAM policy that contains the permissions to interact with the MSK Serverless cluster. Then, you'll create an IAM role, which you'll associate with the IAM policy. In a later step, both the CockroachDB cluster and Kafka client machine will use this role to work with the MSK Serverless cluster.

{% include {{ page.version.version }}/cdc/msk-iam-policy-role-step.md %}

## Step 3. Set up the CockroachDB cluster role

In this step, you'll create a role, which contains the `sts:AssumeRole` permission, for the EC2 instance that is running your CockroachDB cluster. The `sts:AssumeRole` permission will allow the EC2 instance to obtain temporary security credentials to access the MSK Serverless cluster according to the `msk-policy` permissions. To achieve this, you'll add the EC2 role to the trust relationship of the `msk-role` you created in the [previous step](#step-2-create-an-iam-policy-and-role-to-access-the-msk-serverless-cluster).

{% include {{ page.version.version }}/cdc/cluster-iam-role-step.md %}

## Step 4. Connect the client to the MSK Serverless cluster

In this step, you'll prepare the client to connect to the MSK Serverless cluster and create a Kafka topic.

1. Ensure that your client can connect to the MSK Serverless cluster. This tutorial uses an EC2 instance running Kafka as the client. Navigate to the summary page for the client EC2 instance. Click on the **Actions** dropdown. Click **Security**, and then select **Modify IAM role**.
1. On the **Modify IAM role** page, select the role you created for the MSK Serverless cluster (`msk-role`) that contains the policy created in [Step 2](#step-2-create-an-iam-policy-and-role-to-access-the-msk-serverless-cluster). Click **Update IAM role**.
1. Open a terminal and connect to your Kafka client. Check that your `client.properties` file contains the correct SASL and security configuration, like the following:

    ~~~
    security.protocol=SASL_SSL
    sasl.mechanism=AWS_MSK_IAM
    sasl.jaas.config=software.amazon.msk.auth.iam.IAMLoginModule required;
    sasl.client.callback.handler.class=software.amazon.msk.auth.iam.IAMClientCallbackHandler
    ~~~

    If you need further detail on setting up the Kafka client, refer to the [AWS setup guide](https://docs.aws.amazon.com/msk/latest/developerguide/create-serverless-cluster-client.html).
1. Move to the directory of your Kafka installation:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd kafka_2.12-2.8.1/bin
    ~~~

1. It is necessary to create topics manually for MSK Serverless clusters. To create a topic, run the following:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ~/kafka_2.12-2.8.1/bin/kafka-topics.sh --bootstrap-server {msk serverless endpoint} --command-config client.properties --create --topic {users} --partitions {1}
    ~~~

    Replace:
    - `{msk serverless endpoint}` with your endpoint copied in [Step 1.4](#step-1-create-an-msk-serverless-cluster).
    - `{users}` with your topic name. This tutorial will use the CockroachDB `movr` workload and will run a changefeed on the `movr.users` table.
    - `{1}` with the number of partitions you require.

    You will receive confirmation output:

    ~~~
    Created topic users.
    ~~~

## Step 5. Start the changefeed

In this step, you'll prepare your CockroachDB cluster to start the changefeed.

{% include {{ page.version.version }}/cdc/msk-tutorial-crdb-setup.md %}

1. To connect the changefeed to the MSK Serverless cluster, the URI must contain the following parameters:
    - The MSK Serverless cluster endpoint prefixed with the `kafka://` scheme, for example: `kafka://boot-vab1abab.c1.kafka-serverless.us-east-1.amazonaws.com:9098`.
    - `tls_enabled` set to `true`.
    - `sasl_enabled` set to `true`.
    - `sasl_mechanism` set to `AWS_MSK_IAM`.
    - `sasl_aws_region` set to the region of the MSK Serverless cluster.
    - `sasl_aws_iam_role_arn` set to the ARN for the IAM role (`msk-role`) that has the permissions outlined in [Step 2.2](#step-2-create-an-iam-policy-and-role-to-access-the-msk-serverless-cluster).
    - `sasl_aws_iam_session_name` set to a string that you specify to identify the session in AWS.

    ~~~
    'kafka://boot-vab1abab.c1.kafka-serverless.us-east-1.amazonaws.com:9098/?tls_enabled=true&sasl_enabled=true&sasl_mechanism=AWS_MSK_IAM&sasl_aws_region=us-east-1&sasl_aws_iam_role_arn=arn:aws:iam::{account ID}:role/{msk-role}&sasl_aws_iam_session_name={user-specified session name}'
    ~~~

    You can either specify the Kafka URI in the `CREATE CHANGEFEED` statement directly. Or, create an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) for the MSK Serverless URI.

    External connections define a name for an external connection while passing the provider URI and query parameters:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION msk_serverless AS 'kafka://boot-vab1abab.c1.kafka-serverless.us-east-1.amazonaws.com:9098/?tls_enabled=true&sasl_enabled=true&sasl_mechanism=AWS_MSK_IAM&sasl_aws_region=us-east-1&sasl_aws_iam_role_arn=arn:aws:iam::{account ID}:role/{msk-role}&sasl_aws_iam_session_name={user-specified session name}';
    ~~~

1. Use the [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) statement to start the changefeed using either the external connection (`external://`) or full `kafka://` URI:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE movr.users INTO `external://msk_serverless` WITH resolved;
    ~~~
    ~~~
            job_id
    -----------------------
    1002677216020987905
    ~~~

    To view a changefeed job, use [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs).

## Step 6. Consume the changefeed messages on the client

1. Return to the terminal that is running the Kafka client. Move to the Kafka installation directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd kafka_2.12-2.8.1/bin
    ~~~

1. Run the following command to start a consumer. Set `--topic` to the topic you created in [Step 4.5](#step-4-connect-the-client-to-the-msk-serverless-cluster):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ~/kafka_2.12-2.8.1/bin/kafka-console-consumer.sh --bootstrap-server {msk serverless endpoint} --consumer.config client.properties --topic users --from-beginning
    ~~~
    ~~~
    {"after": {"address": "49665 Green Highway", "city": "amsterdam", "credit_card": "0762957951", "id": "10acc68c-5cea-4d32-95db-3254b8a1170e", "name": "Jimmy Gutierrez"}}
    {"after": {"address": "1843 Brandon Common Apt. 68", "city": "amsterdam", "credit_card": "3414699744", "id": "53d95b9a-abf3-4af2-adc8-92d4ee026327", "name": "James Hunt"}}
    {"after": {"address": "87351 David Ferry Suite 24", "city": "amsterdam", "credit_card": "7689751883", "id": "58f66df9-e2ef-48bf-bdbe-436e8caa0fae", "name": "Grant Murray"}}
    {"after": {"address": "35991 Tran Flats", "city": "amsterdam", "credit_card": "6759782818", "id": "6e8d430d-9a3b-4519-b7ab-987d21043f6a", "name": "Mr. Alan Powers"}}
    {"after": {"address": "65320 Emily Ports", "city": "amsterdam", "credit_card": "7424361516", "id": "74e8c91b-9534-4e40-9d19-f23e14d24114", "name": "Michele Grant"}}
    {"after": {"address": "85363 Gary Square Apt. 39", "city": "amsterdam", "credit_card": "0267354734", "id": "99d2c816-2216-40f3-b60c-f19bc3e9f455", "name": "Mrs. Wendy Miller"}}
    {"after": {"address": "68605 Shane Shores Suite 22", "city": "amsterdam", "credit_card": "5913104602", "id": "ae147ae1-47ae-4800-8000-000000000022", "name": "Crystal Sullivan"}}
    {"after": {"address": "41110 Derrick Walk Apt. 42", "city": "amsterdam", "credit_card": "2866469885", "id": "b3333333-3333-4000-8000-000000000023", "name": "Michael Lewis"}}
    {"after": {"address": "47781 Robinson Villages Apt. 41", "city": "amsterdam", "credit_card": "6596967781", "id": "b40e7c51-7e68-43f1-a4df-92fa8a05c961", "name": "Abigail Sellers"}}
    ...
    {"resolved":"1725982589714395510.0000000000"}
    ...
    ~~~

## See also

For more resources, refer to the following:

- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) page for details on parameters that sinks support.
- [Configuration for serverless clusters](https://docs.aws.amazon.com/msk/latest/developerguide/serverless-config.html) in the AWS documentation for details on topic-level configuration options.
- [Monitoring serverless clusters](https://docs.aws.amazon.com/msk/latest/developerguide/serverless-monitoring.html) in the AWS documentation for details on monitoring the MSK Serverless cluster.
- [Monitor and Debug Changefeeds]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}) for details on monitoring the changefeed job.
