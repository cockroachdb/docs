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

1. Navigate to the [IAM console](https://console.aws.amazon.com/iam/) and search for the role (`msk-role`) you created in Step 2 that contains the MSK policy. Select the role, which will take you to its summary page.
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