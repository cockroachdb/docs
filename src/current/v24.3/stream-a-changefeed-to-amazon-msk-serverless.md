---
title: Stream a Changefeed to Amazon MSK Serverless
summary: Learn how to connect a changefeed to stream data to an Amazon MSK Serverless cluster.
toc: true
---

{% include_cached new-in.html version="v24.2" %} [Changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) can stream change data to [Amazon MSK Serverless clusters](https://docs.aws.amazon.com/msk/latest/developerguide/serverless.html) (Amazon Managed Streaming for Apache Kafka), which is an Amazon MSK cluster type that automatically scales your capacity.

MSK Serverless requires [IAM authentication](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html?icmpid=docs_iam_console) for the changefeed to connect to the cluster.

In this tutorial, you'll set up an MSK Serverless cluster and connect a changefeed with IAM authentication. You'll create the MSK Serverless cluster with an IAM policy and role. CockroachDB and a Kafka client will assume the IAM role in order to connect to the MSK Serverless cluster. Then you'll set up the Kafka client to consume the changefeed messages and start the changefeed on the CockroachDB cluster.

## Before you begin

- An [AWS account](https://signin.aws.amazon.com/signup?request_type=register).
- A CockroachDB {{ site.data.products.core }} cluster hosted on AWS. You can set up a cluster using [Deploy CockroachDB on AWS EC2]({% link {{ page.version.version }}/deploy-cockroachdb-on-aws.md %}). You must create instances in the same VPC that the MSK Serverless cluster will use in order for the changefeed to authenticate successfully.
- A Kafka client to consume the changefeed messages. You **must** ensure that your client machine is in the same VPC as the MSK Serverless cluster. This tutorial uses a client set up following the AWS [MSK Serverless guide](https://docs.aws.amazon.com/msk/latest/developerguide/create-serverless-cluster-client.html).
- A CockroachDB [{{ site.data.products.enterprise }} license]({% link {{ page.version.version }}/enterprise-licensing.md %}).
- {% include {{ page.version.version }}/cdc/tutorial-privilege-check.md %}

{{site.data.alerts.callout_info}}
If you would like to connect a changefeed running on a CockroachDB Dedicated cluster to an Amazon MSK Serverless cluster, contact your Cockroach Labs account team.
{{site.data.alerts.end}}

## Step 1. Create an MSK Serverless cluster

1. In the AWS Management Console, go to the [Amazon MSK console](https://console.aws.amazon.com/msk/home) and click **Create cluster**.
1. If you select **Quick create**, AWS will provision the cluster in the default VPC for the account. To modify the VPC or network settings, select **Custom create**. (The VPC selection is important because the MSK Serverless cluster must be in the same VPC as the CockroachDB instance and Kafka client machine.)
1. Ensure you name the cluster and select **Serverless** as the cluster type. Click **Create cluster**.
1. Once the cluster is running, click **View client information** in the **Cluster summary** box. Copy the endpoint address, which will be similar to `boot-vab1abab.c1.kafka-serverless.us-east-1.amazonaws.com:9098`. Click **Done** to return to the cluster's overview page.

## Step 2. Create an IAM policy and role to access the MSK Serverless cluster

MSK Serverless clusters only support IAM authentication. In this step, you'll create an IAM policy that contains the permissions to interact with the MSK Serverless cluster. Then, you'll create an IAM role, which you'll associate with the IAM policy. In a later step, both the CockroachDB cluster and Kafka client machine will use this role to work with the MSK Serverless cluster.

1. In the AWS Management Console, go to the [IAM console](https://console.aws.amazon.com/iam/), select **Policies** from the navigation, and then **Create Policy**.
1. Using the **JSON** tab option, update the policy with the following JSON. These permissions will allow you to connect to the cluster, manage topics, and consume messages. You may want to adjust the permissions to suit your permission model. For more details on the available permissions, refer to the AWS documentation on [IAM Access Control](https://docs.aws.amazon.com/msk/latest/developerguide/iam-access-control.html#kafka-actions) for MSK.

    Replace the instances of `arn:aws:kafka:{region}:{account ID}:cluster/{msk-serverless-cluster-name}` with the MSK Serverless ARN from your cluster's summary page.

    {% include_cached copy-clipboard.html %}
    ~~~json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "kafka-cluster:Connect",
                    "kafka-cluster:AlterCluster",
                    "kafka-cluster:DescribeCluster"
                ],
                "Resource": [
                    "arn:aws:kafka:{region}:{account ID}:cluster/{msk-serverless-cluster-name}/*"
                ]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "kafka-cluster:*Topic",
                    "kafka-cluster:WriteData",
                    "kafka-cluster:ReadData"
                ],
                "Resource": [
                    "arn:aws:kafka:{region}:{account ID}:cluster/{msk-serverless-cluster-name}/*"
                ]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "kafka-cluster:AlterGroup",
                    "kafka-cluster:DescribeGroup"
                ],
                "Resource": [
                    "arn:aws:kafka:{region}:{account ID}:cluster/{msk-serverless-cluster-name}/*"
                ]
            }
        ]
    }
    ~~~

1. Once you have added your policy, add a policy name (for example, `msk-serverless-policy`), click **Next**, and **Create policy**.
1. Return to the [IAM console](https://console.aws.amazon.com/iam/), select **Roles** from the navigation, and then **Create role**.
1. Select **AWS service** for the **Trusted entity type**. For **Use case**, select **EC2** from the dropdown. Click **Next**.
1. On the **Add permissions** page, search for the IAM policy (`msk-serverless-policy`) you just created. Click **Next**.
1. Name the role (for example, `msk-serverless-role`) and click **Create role**.

## Step 3. Set up the CockroachDB cluster role

In this step, you'll create a role, which contains the `sts:AssumeRole` permission, for the EC2 instance that is running your CockroachDB cluster. The `sts:AssumeRole` permission will allow the EC2 instance to obtain temporary security credentials to access the MSK Serverless cluster according to the `msk-serverless-policy` permissions. To achieve this, you'll add the EC2 role to the trust relationship of the `msk-serverless-role` you created in the [previous step](#step-2-create-an-iam-policy-and-role-to-access-the-msk-serverless-cluster).

1. Navigate to the [IAM console](https://console.aws.amazon.com/iam/), select **Roles** from the navigation, and then **Create role**.
1. Select **AWS service** for the **Trusted entity type**. For **Use case**, select **EC2** from the dropdown. Click **Next**.
1. On the **Add permissions** page, click **Next**.
1. Name the role (for example, `ec2-role`) and click **Create role**.
1. Once the role has finished creating, copy the ARN in the **Summary** section. Click on the **Trust relationships** tab. You'll find a **Trusted entities** policy:

    ~~~json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "ec2.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }
    ~~~

1. Navigate to the [IAM console](https://console.aws.amazon.com/iam/) and search for the role (`msk-serverless-role`) you created in [Step 2](#step-2-create-an-iam-policy-and-role-to-access-the-msk-serverless-cluster) that contains the MSK Serverless policy. Select the role, which will take you to its summary page.
1. Click on the **Trust relationships** tab, and click **Edit trust policy**. Add the ARN of the EC2 IAM role (`ec2-role`) to the JSON policy:

    ~~~json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "ec2.amazonaws.com",
                    "AWS": "arn:aws:iam::{account ID}:role/{ec2-role}"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }
    ~~~

    Once you've updated the policy, click **Update policy**.

## Step 4. Connect the client to the MSK Serverless cluster

In this step, you'll prepare the client to connect to the MSK Serverless cluster and create a Kafka topic.

1. Ensure that your client can connect to the MSK Serverless cluster. This tutorial uses an EC2 instance running Kafka as the client. Navigate to the summary page for the client EC2 instance. Click on the **Actions** dropdown. Click **Security**, and then select **Modify IAM role**.
1. On the **Modify IAM role** page, select the role you created for the MSK Serverless cluster (`msk-serverless-role`) that contains the policy created in [Step 2](#step-2-create-an-iam-policy-and-role-to-access-the-msk-serverless-cluster). Click **Update IAM role**.
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

1. (Optional) On the EC2 instance running CockroachDB, run the [Movr]({% link {{ page.version.version }}/movr.md %}) application workload to set up some data for your changefeed.

    Create the schema for the workload:

     {% include_cached copy-clipboard.html %}
     ~~~shell
     cockroach workload init movr
     ~~~

     Then run the workload:

     {% include_cached copy-clipboard.html %}
     ~~~shell
     cockroach workload run movr --duration=1m
     ~~~

1. Start a SQL session. For details on the available flags, refer to the [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) page.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --insecure
    ~~~

1. Set your organization name and [{{ site.data.products.enterprise }} license]({% link {{ page.version.version }}/enterprise-licensing.md %}) key:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING cluster.organization = '<organization name>';
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING enterprise.license = '<secret>';
    ~~~

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

1. To connect the changefeed to the MSK Serverless cluster, the URI must contain the following parameters:
    - The MSK Serverless cluster endpoint prefixed with the `kafka://` scheme, for example: `kafka://boot-vab1abab.c1.kafka-serverless.us-east-1.amazonaws.com:9098`.
    - `tls_enabled` set to `true`.
    - `sasl_enabled` set to `true`.
    - `sasl_mechanism` set to `AWS_MSK_IAM`.
    - `sasl_aws_region` set to the region of the MSK Serverless cluster.
    - `sasl_aws_iam_role_arn` set to the ARN for the IAM role (`msk-serverless-role`) that has the permissions outlined in [Step 2.2](#step-2-create-an-iam-policy-and-role-to-access-the-msk-serverless-cluster).
    - `sasl_aws_iam_session_name` set to a string that you specify to identify the session in AWS.

    ~~~
    'kafka://boot-vab1abab.c1.kafka-serverless.us-east-1.amazonaws.com:9098/?tls_enabled=true&sasl_enabled=true&sasl_mechanism=AWS_MSK_IAM&sasl_aws_region=us-east-1&sasl_aws_iam_role_arn=arn:aws:iam::{account ID}:role/{msk-serverless-role}&sasl_aws_iam_session_name={user-specified session name}'
    ~~~

    You can either specify the Kafka URI in the `CREATE CHANGEFEED` statement directly. Or, create an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) for the MSK Serverless URI.

    External connections define a name for an external connection while passing the provider URI and query parameters:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION msk_serverless AS 'kafka://boot-vab1abab.c1.kafka-serverless.us-east-1.amazonaws.com:9098/?tls_enabled=true&sasl_enabled=true&sasl_mechanism=AWS_MSK_IAM&sasl_aws_region=us-east-1&sasl_aws_iam_role_arn=arn:aws:iam::{account ID}:role/{msk-serverless-role}&sasl_aws_iam_session_name={user-specified session name}';
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