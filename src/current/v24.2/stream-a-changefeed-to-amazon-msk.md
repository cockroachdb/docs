---
title: Stream a Changefeed to Amazon MSK
summary: Learn how to connect a changefeed to stream data to an Amazon MSK cluster.
toc: true
---

[Changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) can stream change data to [Amazon MSK clusters](https://docs.aws.amazon.com/msk/latest/developerguide/what-is-msk.html) (Amazon Managed Streaming for Apache Kafka) using [AWS IAM roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html?icmpid=docs_iam_console) or [SASL/SCRAM]({% link {{ page.version.version }}/security-reference/scram-authentication.md %}) authentication to connect to the MSK cluster.

In this tutorial, you'll set up an MSK cluster and connect a changefeed with either IAM or SCRAM authentication:

- For [IAM authentication]({% link {{ page.version.version }}/stream-a-changefeed-to-amazon-msk.md %}?filters=iam-setup-steps#step-1-create-an-msk-cluster-with-iam-authentication), you'll create the MSK cluster with an IAM policy and role. CockroachDB and a Kafka client will assume the IAM role in order to connect to the MSK cluster. Then, you'll set up the Kafka client to consume the changefeed messages and start the changefeed on the CockroachDB cluster.
- For [SCRAM authentication]({% link {{ page.version.version }}/stream-a-changefeed-to-amazon-msk.md %}?filters=scram-setup-steps#step-1-create-an-msk-cluster-with-scram-authentication), you'll create the MSK cluster and then store your SCRAM credentials in [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/). You'll set up the Kafka client configuration and consume the changefeed messages from the CockroachDB cluster.

{{site.data.alerts.callout_info}}
CockroachDB changefeeds also support IAM authentication to MSK Serverless clusters. For a setup guide, refer to [Stream a Changefeed to Amazon MSK Serverless]({% link {{ page.version.version }}/stream-a-changefeed-to-amazon-msk-serverless.md %}).
{{site.data.alerts.end}}

## Before you begin

You'll need:

- An [AWS account](https://signin.aws.amazon.com/signup?request_type=register).
- A CockroachDB {{ site.data.products.core }} cluster hosted on AWS. You can set up a cluster using [Deploy CockroachDB on AWS EC2]({% link {{ page.version.version }}/deploy-cockroachdb-on-aws.md %}). You must create instances in the same VPC that the MSK cluster will use in order for the changefeed to authenticate successfully.
- A Kafka client to consume the changefeed messages. You **must** ensure that your client machine is in the same VPC as the MSK cluster. This tutorial uses a client set up following the AWS [MSK guide](https://docs.aws.amazon.com/msk/latest/developerguide/create-topic.html).
- {% include {{ page.version.version }}/cdc/tutorial-privilege-check.md %}

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/cdc/msk-dedicated-support.md %}
{{site.data.alerts.end}}

**Select the authentication method that you'll use to connect the changefeed to your MSK cluster:**

<div class="filters clearfix">
  <button class="filter-button" data-scope="iam-setup-steps">IAM</button>
  <button class="filter-button" data-scope="scram-setup-steps">SCRAM</button>
</div>

<section class="filter-content" markdown="1" data-scope="iam-setup-steps">

## Step 1. Create an MSK cluster with IAM authentication

1. In the AWS Management Console, go to the [Amazon MSK console](https://console.aws.amazon.com/msk/home) and click **Create cluster**.
1. Select **Custom create**, name the cluster, and select **Provisioned** as the cluster type. Click **Next**.
1. Select the VPC for the MSK cluster with the subnets and security group. The VPC selection is important because the MSK cluster must be in the same VPC as the CockroachDB instance and Kafka client machine. Click **Next**.
1. Under **Access control methods** select **IAM role-based authentication**. Click **Next**.
1. Continue to select the required configuration options for your cluster. Click **Next**.
1. Review the cluster details, and then click **Create cluster**.
1. Once the cluster is running, click **View client information** in the **Cluster summary** box. Copy the endpoint addresses, which will be similar to `b-1.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9098,b-2.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9098,b-3.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9098`. Click **Done** to return to the cluster's overview page.

## Step 2. Create an IAM policy and role to access the MSK cluster

In this step, you'll create an IAM policy that contains the permissions to interact with the MSK  cluster. Then, you'll create an IAM role, which you'll associate with the IAM policy. In a later step, both the CockroachDB cluster and Kafka client machine will use this role to work with the MSK cluster.

{% include {{ page.version.version }}/cdc/msk-iam-policy-role-step.md %}

## Step 3. Set up the CockroachDB cluster role

In this step, you'll create a role, which contains the `sts:AssumeRole` permission, for the EC2 instance that is running your CockroachDB cluster. The `sts:AssumeRole` permission will allow the EC2 instance to obtain temporary security credentials to access the MSK cluster according to the `msk-policy` permissions. To achieve this, you'll add the EC2 role to the trust relationship of the `msk-role` you created in the [previous step](#step-2-create-an-iam-policy-and-role-to-access-the-msk-cluster).

{% include {{ page.version.version }}/cdc/cluster-iam-role-step.md %}

## Step 4. Connect the client to the MSK cluster

In this step, you'll prepare the client to connect to the MSK cluster, create a Kafka topic, and consume messages that the changefeed sends.

1. Ensure that your client can connect to the MSK cluster. This tutorial uses an EC2 instance running Kafka as the client. Navigate to the summary page for the client EC2 instance. Click on the **Actions** dropdown. Click **Security**, and then select **Modify IAM role**.
1. On the **Modify IAM role** page, select the role you created for the MSK cluster (`msk-role`) that contains the policy created in [Step 2](#step-2-create-an-iam-policy-and-role-to-access-the-msk-cluster). Click **Update IAM role**.
1. Open a terminal and connect to your Kafka client. Check that the `client.properties` file in your Kafka installation contains the correct SASL and security configuration, like the following:

    {% include_cached copy-clipboard.html %}
    ~~~
    security.protocol=SASL_SSL
    sasl.mechanism=AWS_MSK_IAM
    sasl.jaas.config=software.amazon.msk.auth.iam.IAMLoginModule required;
    sasl.client.callback.handler.class=software.amazon.msk.auth.iam.IAMClientCallbackHandler
    ~~~

    If you need further detail on setting up the Kafka client, refer to the [AWS setup guide](https://docs.aws.amazon.com/msk/latest/developerguide/create-topic.html).
1. Move to the directory of your Kafka installation:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd kafka_2.12-2.8.1/bin
    ~~~

1. To create a topic, run the following:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ~/kafka_2.12-2.8.1/bin/kafka-topics.sh --bootstrap-server {msk_endpoint} --command-config client.properties --create --topic {users} --partitions {1} --replication-factor {3}
    ~~~

    Replace:
    - `{msk_endpoint}` with your endpoint copied in [Step 1](#step-1-create-an-msk-cluster-with-iam-authentication).
    - `{users}` with your topic name. This tutorial will use the CockroachDB `movr` workload and will run a changefeed on the `movr.users` table.
    - `{1}` with the number of partitions you require.
    - `{3}` with the replication you require.

    You will receive confirmation output:

    ~~~
    Created topic users.
    ~~~

## Step 5. Start the changefeed

In this step, you'll prepare your CockroachDB cluster to start the changefeed.

{% include {{ page.version.version }}/cdc/msk-tutorial-crdb-setup.md %}

1. To connect the changefeed to the MSK cluster, the URI must contain the following parameters:
    - An MSK cluster endpoint prefixed with the `kafka://` scheme, for example: `kafka://b-1.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9098`.
    - `tls_enabled` set to `true`.
    - `sasl_enabled` set to `true`.
    - `sasl_mechanism` set to `AWS_MSK_IAM`.
    - `sasl_aws_region` set to the region of the MSK cluster.
    - `sasl_aws_iam_role_arn` set to the ARN for the IAM role (`msk-role`) that has the permissions outlined in [Step 2](#step-2-create-an-iam-policy-and-role-to-access-the-msk-cluster).
    - `sasl_aws_iam_session_name` set to a string that you specify to identify the session in AWS.

    ~~~
    'kafka://b-1.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9098/?tls_enabled=true&sasl_enabled=true&sasl_mechanism=AWS_MSK_IAM&sasl_aws_region=us-east-1&sasl_aws_iam_role_arn=arn:aws:iam::{account ID}:role/{msk-role}&sasl_aws_iam_session_name={user-specified session name}'
    ~~~

    You can either specify the Kafka URI in the `CREATE CHANGEFEED` statement directly. Or, create an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) for the MSK URI.

    External connections define a name for an external connection while passing the provider URI and query parameters:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION msk AS 'kafka://b-1.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9098/?tls_enabled=true&sasl_enabled=true&sasl_mechanism=AWS_MSK_IAM&sasl_aws_region=us-east-1&sasl_aws_iam_role_arn=arn:aws:iam::{account ID}:role/{msk-role}&sasl_aws_iam_session_name={user-specified session name}';
    ~~~

1. Use the [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) statement to start the changefeed using either the external connection (`external://`) or full `kafka://` URI:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE movr.users INTO `external://msk` WITH resolved;
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

1. Run the following command to start a consumer. Set `--topic` to the topic you created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ~/kafka_2.12-2.8.1/bin/kafka-console-consumer.sh --bootstrap-server {msk_endpoint} --consumer.config client.properties --topic users --from-beginning
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

</section>

<section class="filter-content" markdown="1" data-scope="scram-setup-steps">

## Step 1. Create an MSK cluster with SCRAM authentication

1. In the AWS Management Console, go to the [Amazon MSK console](https://console.aws.amazon.com/msk/home) and click **Create cluster**.
1. Select **Custom create**, name the cluster, and select **Provisioned** as the cluster type. Click **Next**.
1. Select the VPC for the MSK cluster with the subnets and security group. The VPC selection is important because the MSK cluster must be in the same VPC as the CockroachDB instance and Kafka client machine. Click **Next**.
1. Under **Access control methods** select **SASL/SCRAM authentication**. Click **Next**.
1. Continue to select the required configuration options for your cluster. Click **Next**.
1. Review the cluster details, and then click **Create cluster**.
1. Once the cluster is running, click **View client information** in the **Cluster summary** box. Copy the endpoint addresses, which will be similar to `b-1.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9096,b-2.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9096,b-3.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9096`. Click **Done** to return to the cluster's overview page.

## Step 2. Store the SCRAM credentials

In this step, you'll store the SCRAM credentials in [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/) and then associate the secret with the MSK cluster.

1. In the AWS Management Console, go to the [Amazon Secrets Manager console](https://console.aws.amazon.com/secretsmanager/home) and click **Store a new secret**.
1. For **Secret type**, select **Other type of secret**.
1. In the **Key/value pairs** box, enter the user and password in **Plaintext** in the same format as the following:

    {% include_cached copy-clipboard.html %}
    ~~~
    {
      "username": "your_username",
      "password": "your_password"
    }
    ~~~

1. Select or add a new encryption key. (You cannot use the default AWS KMS key with an Amazon MSK cluster.) Click **Next**.
1. Add the **Secret name**, you must prefix the name with `AmazonMSK_`.
1. After selecting any other relevant configuration for your secret, click **Store** to complete.
1. Copy the **Secret ARN** for your secret on the **Secret details** page.
1. Return to your MSK cluster in the [Amazon MSK console](https://console.aws.amazon.com/msk/home).
1. Click on the **Properties** tab and find the **Security settings**. Under **SASL/SCRAM authentication**, click **Associate secrets** and paste the ARN of your secret. Click **Associate secrets**.

## Step 3. Set up the SCRAM authentication on the client

In this step, you'll configure the Kafka client for SASL/SCRAM authentication and create a Kafka topic.

1. Open a terminal window and connect to your Kafka client. Check that your `client.properties` file contains the correct SASL/SCRAM, security configuration, and your SASL username and password, like the following:

    {% include_cached copy-clipboard.html %}
    ~~~
    security.protocol=SASL_SSL
    sasl.mechanism=SCRAM-SHA-512
    sasl.jaas.config=org.apache.kafka.common.security.scram.ScramLoginModule required \
      username="your_username" \
      password="your_password";
    ~~~

1. Create an environment variable for your broker endpoints:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export brokers=b-3.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9096,b-1.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9096,b-2.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9096
    ~~~

1. Move to the directory of your Kafka installation:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd kafka_2.12-2.8.1/bin
    ~~~

1. To allow the user to interact with Kafka, grant them permission with the Kafka ACL. Replace `your_username` in the following:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./kafka-acls.sh --bootstrap-server $brokers --add --allow-principal User:{your_username} --operation All --cluster --command-config client.properties
    ~~~

    For more details on permissions and ACLs, refer to [Use ACLs](https://docs.confluent.io/platform/current/security/authorization/acls/manage-acls.html#use-acls).

1. Create a topic:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./kafka-topics.sh --create --bootstrap-server $brokers --replication-factor {3} --partitions {1} --topic {users} --command-config client.properties
    ~~~

    Replace:
    - `{users}` with your topic name. This tutorial will use the CockroachDB `movr` workload and will run a changefeed on the `movr.users` table.
    - `{3}` with the replication factor you require.
    - `{1}` with the number of partitions you require.

    You will receive confirmation output:

    ~~~
    Created topic users.
    ~~~

## Step 4. Start the changefeed

In this step, you'll prepare your CockroachDB cluster to start the changefeed.

{% include {{ page.version.version }}/cdc/msk-tutorial-crdb-setup.md %}

1. To connect the changefeed to the MSK cluster, the URI in the changefeed statement must contain the following parameters:
    - One of the MSK cluster endpoints prefixed with the `kafka://` scheme, for example: `kafka://b-3.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9096`.
    - `tls_enabled` set to `true`.
    - `sasl_enabled` set to `true`.
    - `sasl_mechanism` set to `SCRAM-SHA-512`.
    - `sasl_user` set to `your_username`.
    - `sasl_password` set to `your_password`.

    ~~~
    'kafka://b-3.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9096?tls_enabled=true&sasl_enabled=true&sasl_user={your_username}&sasl_password={your_password}-secret&sasl_mechanism=SCRAM-SHA-512'
    ~~~

    You can either specify the Kafka URI in the `CREATE CHANGEFEED` statement directly. Or, create an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) for the MSK URI.

    External connections define a name for an external connection while passing the provider URI and query parameters:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION msk AS 'kafka://b-3.msk-cluster_name.1a2b3c.c4.kafka.us-east-1.amazonaws.com:9096?tls_enabled=true&sasl_enabled=true&sasl_user={your_username}&sasl_password={your_password}-secret&sasl_mechanism=SCRAM-SHA-512';
    ~~~

1. Use the [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) statement to start the changefeed using either the external connection (`external://`) or full `kafka://` URI:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE movr.users INTO `external://msk` WITH resolved;
    ~~~
    ~~~
            job_id
    -----------------------
    1002677216020987905
    ~~~

    To view a changefeed job, use [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs).

## Step 5. Consume the changefeed messages

1. Return to the terminal that is running the Kafka client. Move to the Kafka installation directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd kafka_2.12-2.8.1/bin
    ~~~

1. Run the following command to start a consumer. Set `--topic` to the topic you created in [Step 3](#step-3-set-up-the-scram-authentication-on-the-client):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./kafka-console-consumer.sh --bootstrap-server $brokers --consumer.config client.properties --topic users --from-beginning
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

</section>

## See also

For more resources, refer to the following:

- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) page for details on parameters that sinks support.
- [Monitor and Debug Changefeeds]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}) for details on monitoring the changefeed job.