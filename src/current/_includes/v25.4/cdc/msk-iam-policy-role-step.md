1. In the AWS Management Console, go to the [IAM console](https://console.aws.amazon.com/iam/), select **Policies** from the navigation, and then **Create Policy**.
1. Using the **JSON** tab option, update the policy with the following JSON. These permissions will allow you to connect to the cluster, manage topics, and consume messages. You may want to adjust the permissions to suit your permission model. For more details on the available permissions, refer to the AWS documentation on [IAM Access Control](https://docs.aws.amazon.com/msk/latest/developerguide/iam-access-control.html#kafka-actions) for MSK.

    Replace the instances of `arn:aws:kafka:{region}:{account ID}:cluster/{msk-cluster-name}` with the MSK ARN from your cluster's summary page and add `/*` to the end, like the following:

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
                    "arn:aws:kafka:{region}:{account ID}:cluster/{msk-cluster-name}/*"
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
                    "arn:aws:kafka:{region}:{account ID}:cluster/{msk-cluster-name}/*"
                ]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "kafka-cluster:AlterGroup",
                    "kafka-cluster:DescribeGroup"
                ],
                "Resource": [
                    "arn:aws:kafka:{region}:{account ID}:cluster/{msk-cluster-name}/*"
                ]
            }
        ]
    }
    ~~~

1. Once you have added your policy, add a policy name (for example, `msk-policy`), click **Next**, and **Create policy**.
1. Return to the [IAM console](https://console.aws.amazon.com/iam/), select **Roles** from the navigation, and then **Create role**.
1. Select **AWS service** for the **Trusted entity type**. For **Use case**, select **EC2** from the dropdown. Click **Next**.
1. On the **Add permissions** page, search for the IAM policy (`msk-policy`) you just created. Click **Next**.
1. Name the role (for example, `msk-role`) and click **Create role**.