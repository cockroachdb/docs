---
title: Cloud Storage Authentication
summary: Learn how to use the different authenication options for authentication to cloud storage.
toc: true
docs_area: manage
---

<!--TODO Thinking about the start of this page.... Overview on types of authentication available -->









When running bulk operations to and from a storage bucket, authentication setup can vary depending on the cloud provider. This section details the necessary steps to authenticate to each cloud provider.

{{site.data.alerts.callout_info}}
`implicit` authentication **cannot** be used to run bulk operations from {{ site.data.products.db }} clusters—instead, use `AUTH=specified`.
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button" data-scope="s3">Amazon S3</button>
  <button class="filter-button" data-scope="gcs">Google Cloud Storage</button>
  <button class="filter-button" data-scope="azure">Azure Storage</button>
  <button class="filter-button" data-scope="http">HTTP</button>
  <button class="filter-button" data-scope="s3compatible">S3-compatible Services</button>
</div>

<section class="filter-content" markdown="1" data-scope="s3">

You can either authenticate to Amazon S3 with [specified](#specified-authentication) or [implicit](#implicit-authentication) authentication. To have users assume IAM roles to complete bulk operations on an S3 bucket, you can also configure [assume role](#assume-role-authentication) authentication in addition to specified or implicit.

### Specified authentication

If the `AUTH` parameter is not provided, AWS connections default to `specified` and the access keys must be provided in the URI parameters.

As an example:

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE <database> INTO 's3://{bucket name}/{path in bucket}/?AWS_ACCESS_KEY_ID={access key ID}&AWS_SECRET_ACCESS_KEY={secret access key}';
~~~

### Implicit authentication

If the `AUTH` parameter is `implicit`, the access keys can be omitted and [the credentials will be loaded from the environment](https://docs.aws.amazon.com/sdk-for-go/api/aws/session/) (i.e., the machines running the backup).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/external-io-privilege.md %}
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE <database> INTO 's3://{bucket name}/{path}?AUTH=implicit';
~~~

You [can associate an EC2 instance with an IAM role](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html) to provide implicit access to S3 storage within the IAM role's policy. In the following command, the `instance example` EC2 instance is [associated](https://docs.aws.amazon.com/cli/latest/reference/ec2/associate-iam-instance-profile.html) with the `example profile` instance profile, giving the EC2 instance implicit access to any `example profile` S3 buckets.

{% include_cached copy-clipboard.html %}
~~~shell
aws ec2 associate-iam-instance-profile --iam-instance-profile Name={example profile} --region={us-east-2} --instance-id {instance example}
~~~

### Assume role authentication

{{site.data.alerts.callout_info}}
CockroachDB supports assume role authentication on clusters running v22.2. Authenticating to cloud storage with `ASSUME_ROLE` on clusters running versions v22.1 and earlier, or mixed versions, is not supported and will result in failed bulk operations.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v22.2" %} To limit the control access to your Amazon S3 buckets, you can create IAM roles for users to assume. IAM roles do not have an association to a particular user. The role contains permissions that define the operations a user (or [Principal](https://docs.aws.amazon.com/IAM/latest/UserGuide/intro-structure.html#intro-structure-principal)) can complete. An IAM user can then assume a role to undertake a CockroachDB backup, restore, import, etc. As a result, the IAM user only has access to the assigned role, rather than having unlimited access to an S3 bucket.

{{site.data.alerts.callout_success}}
Role assumption applies the principle of least privilege rather than directly providing privilege to a user. Creating IAM roles to manage access to AWS resources is Amazon's recommended approach compared to giving access straight to IAM users.
{{site.data.alerts.end}}

The [following section](#set-up-aws-assume-role-authentication) demonstrates setting up assume role authentication between two users. Since you can chain an arbitrary number of roles, see the [Role chaining](#aws-role-chaining) section for additional detail. 

#### Set up AWS assume role authentication

For example, to configure a user to assume an IAM role that allows a bulk operation to an Amazon S3 bucket, take the following steps:

1. Create a role that contains a policy to interact with the S3 buckets depending on the operation your user needs to complete. See the [Storage permissions](#storage-permissions) section for details on the minimum permissions each CockroachDB bulk operation requires. You can create an IAM role in[ Amazon's Management console](https://aws.amazon.com/console/), under the **IAM** and then **Roles** menu. Alternately, you can use the [AWS CLI](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-quickstart.html).

1. <a name="step-2-user"></a> If you do not already have the user that needs to assume the role, [create the user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html). Under **IAM** in the Amazon console, navigate to **Users** and **Add users**. You can then add the necessary permissions by clicking on the **Permissions** tab. Ensure that the IAM user has [`sts:AssumeRole` permissions](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) attached. The following policy will give the user assume role permissions:

    ~~~json
    {
    "Version": "2012-10-17",
    "Statement": {
        "Effect": "Allow",
        "Action": "sts:AssumeRole",
        "Resource": "arn:aws:iam::{account ID}:role/{role name}"
        }
    }
    ~~~

    The `Resource` here is the Amazon Resource Name (ARN) of the role you created in step 1. You can copy this from the role's **Summary** page.

    The `sts:AssumeRole` permission allows the user to obtain a temporary set of security credentials that gives them access to an S3 bucket to which they would not have access with their user-based permissions.

    <img src="{{ 'images/v22.2/aws-user-view.png' | relative_url }}" alt="AWS user summary page showing the JSON policy in place" style="border:1px solid #eee;max-width:100%" />

1. <a name="step-3-assume"></a> Return to your IAM role's **Summary** page, and click on the **Trust Relationships** tab. Add a trust policy into the role, which will define the users that can assume the role.

    The following trust policy provides the user the privilege to assume the role:

    ~~~json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::123456789123:user/{user}"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }
    ~~~
    When creating a trust policy consider the following:
    - In the trust policy you need to include the ARN of the user that you want to assume the role under `Principal`. You can also include the [`Condition` attribute](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition.html) to further control access to the Amazon S3 bucket. For example, this could limit the operation to a specified date range, to users with multi-factor authentication enabled, or to specific IP addresses.
    - If you set the `Principal` ARN to `root`, this will allow any IAM user in the account with the `AssumeRole` permission to access the Amazon S3 bucket as per the defined IAM role permissions.
    - When the IAM user takes on the role to perform a bulk operation, they are temporarily granted the permissions contained in the role. That is, not the permissions specified in their user profile.

1. Run the bulk operation. If using [specified authentication](#specified-authentication), pass in the S3 bucket's URL with the IAM user's `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. If using [implicit authentication](#implicit-authentication), specify `AUTH=IMPLICIT` instead. For assuming the role, pass the assumed role's ARN, which you can copy from the IAM role's summary page:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    BACKUP DATABASE movr INTO 's3://{bucket name}?AWS_ACCESS_KEY_ID={user key}&AWS_SECRET_ACCESS_KEY={user secret key}&ASSUME_ROLE=arn:aws:iam::{account ID}:role/{role name}' AS OF SYSTEM TIME '-10s';
    ~~~

    CockroachDB also supports authentication for assuming roles when taking encrypted backups. To use with an encrypted backup, pass the `ASSUME_ROLE` parameter to the KMS URI as well as the bucket's:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    BACKUP INTO 's3://{bucket name}?AWS_ACCESS_KEY_ID={user key}&AWS_SECRET_ACCESS_KEY={user secret key}&ASSUME_ROLE={ARN}' WITH kms = 'aws:///{key}?AWS_ACCESS_KEY_ID={user key}&AWS_SECRET_ACCESS_KEY={user secret key}&REGION={region}&ASSUME_ROLE={ARN}';
    ~~~

    For more information on AWS KMS URI formats, see [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html).

#### AWS role chaining

Role chaining allows a user to assume a role through an intermediate role(s) instead of the user directly assuming a role. In this way, the role chain passes the request for access to the final role in the chain. Role chaining could be useful when a third-party organization needs access to your Amazon S3 bucket to complete a bulk operation. Or, your organization could grant roles based on limited-privilege levels.

Assuming the role follows the same approach outlined in the previous section. The additional required step to chain roles is to ensure that the ARN of role A, which is assuming role B, is present in role B's trust policy with the `sts:AssumeRole` action.

The role B's trust policy must contain:

~~~json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::{account-A-ID}:role/{role A name}"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
~~~

In a chain of three roles, role C's trust policy needs to include role B in the same way. For example, to chain three roles so that a user could assume role C, it is necessary to verify the following:

 User &rarr; | Role A &rarr;    | Role B &rarr;  | Role C
------------------------------------------+-----------+---------+---------
Has permission to assume role A. See [step 2](#step-2-user). | Has a trust policy that permits the user to assume role A. See [step 3](#step-3-assume). | Has a trust policy that permits role A to assume role B. | Has a trust policy that permits role B to assume role C.
 | Needs permission to assume role B. | Needs permission to assume role C. |

When passing a chained role into `BACKUP`, it will follow this pattern:

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE movr INTO "s3://{bucket name}?AWS_ACCESS_KEY_ID={user's key}&AWS_SECRET_ACCESS_KEY={user's secret key}&ASSUME_ROLE={role A ARN},{role B ARN},{role C ARN}" AS OF SYSTEM TIME '-10s';
~~~

Each chained role is listed separated by a `,` character. You can copy the ARN of the role from its summary page.

### AWS workload identity

With a CockroachDB cluster deployed on [Kubernetes](kubernetes-overview.html), you can allow your pods to authenticate as an IAM role that you have associated to a Kubernetes service account. You can then use assume role authentication to allow that IAM role to assume another role that has permissions to perform bulk operations to an S3 bucket.

This means that a CockroachDB node will only be able to access credentials for the IAM role associated with the Kubernetes service account.

You can use workload identities with assume role authentication to run the following operations:

- [`BACKUP`](backup.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
- [`EXPORT`](export.html)
- [`IMPORT`](import.html) / [`IMPORT INTO`](import-into.html)
- [`RESTORE`](restore.html)

To use assume role authentication, you will need at least two IAM roles:

- An _identity role_: the IAM role you have associated with your Kubernetes service account.
- An _operation role_: the IAM role to be assumed. This contains the permissions required to complete a CockroachDB operation.

#### Set up AWS workload identity

First, create an IAM role for your Kubernetes service account to assume, and then configure your CockroachDB pods to use the service account. We will refer to this IAM role as an "identity role". You can complete all of these steps with Amazon's guide on [IAM roles for service accounts](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html).

Once you have an identity role that your CockroachDB nodes can assume, you can configure the identity role to assume another IAM role that contains the permissions to perform a bulk operation. 

1. Copy the ARN of the identity role. In the Amazon management console, click on **IAM**, then **Roles**, and select the name of your identity role. From the **Summary** page, copy your ARN. You will need this later when configuring the Trust Policy for the IAM role to be assumed.

    <img src="{{ 'images/v22.2/aws-wi-arn-copy.png' | relative_url }}" alt="Role summary page showing the ARN copied" style="border:1px solid #eee;max-width:100%" />

1. Create or open the operation role that your identity role will assume.

    {{site.data.alerts.callout_info}}
    If you already have the role that contains permissions for the bulk operation, ensure that you add the identity role ARN to the role's **Trust Relationships** tab on the **Summary** page.
    {{site.data.alerts.end}}

    a. To create a role, click **Create Role** under the **Roles** menu. Select **Custom trust policy** and then add the ARN of your identity role to the JSON by clicking `Principal`. This will open a dialog box. Select **IAM Roles** for **Principal Type** and paste the ARN. Click **Add Principal** and then **Next**.

    <img src="{{ 'images/v22.2/aws-wi-principal.png' | relative_url }}" alt="Dialog box to add principal with IAM roles selected" style="border:1px solid #eee;max-width:100%" />

    b. On the **Add Permissions** page, search for the permission policies that the role will need to complete the bulk operation. 
    
    <img src="{{ 'images/v22.2/aws-add-permissions.png' | relative_url }}" alt="Filter list to add permissions to IAM roles" style="border:1px solid #eee;max-width:100%" />
    
    Or, use the **Create Policy** button to define the required permissions. You can use the visual editor to select the service, actions, and resources.

    <img src="{{ 'images/v22.2/aws-permission-visual-editor.png' | relative_url }}" alt="Using the visual editor to define S3 service and S3 actions." style="border:1px solid #eee;max-width:100%" />
    
    Or, use the JSON tab to specify the policy. For the JSON editor, see [Storage Permissions](#storage-permissions) for an example and detail on the minimum permissions required for each operation to complete. Click **Next**. 

    c. Finally, give the role a name on the **Name, review, and create** page. The following screenshot shows the selected trust policy and permissions:

    <img src="{{ 'images/v22.2/aws-wi-review-page.png' | relative_url }}" alt="Final screen in the create role process to review permissions and name role" style="border:1px solid #eee;max-width:100%" />

1. To run the bulk operation, you can use [`implicit` authentication](#implicit-authentication) for your identity role and pass the `ASSUME_ROLE` parameter for your operation role. For a backup to Amazon S3:

    ~~~sql
    BACKUP DATABASE {database} INTO 's3://{bucket name}/{path}?AUTH=implicit&ASSUME_ROLE=arn:aws:iam::{account ID}:role/{operation role name}' AS OF SYSTEM TIME '-10s';
    ~~~

    In this SQL statement, `AUTH=implicit` uses the identity role to authenticate to the S3 bucket. The identity role then assumes the operation role that has permission to write a backup to the S3 bucket.

</section>

<section class="filter-content" markdown="1" data-scope="gcs">

The `AUTH` parameter passed to the file URL must be set to either `specified` or `implicit`. The default behavior is `specified` in v21.2+. The following sections describe how to set up each authentication method.

### Specified authentication

To access the storage bucket with `specified` credentials, it's necessary to [create a service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts) and add the service account address to the permissions on the specific storage bucket.

[The JSON credentials file for authentication](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) can be downloaded from the **Service Accounts** page in the Google Cloud Console and then [base64-encoded](https://tools.ietf.org/html/rfc4648):

{% include_cached copy-clipboard.html %}
~~~shell
cat gcs_key.json | base64
~~~

Pass the encoded JSON object to the `CREDENTIALS` parameter:

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE <database> INTO 'gs://{bucket name}/{path}?AUTH=specified&CREDENTIALS={encoded key}';
~~~

### Implicit authentication

For CockroachDB instances that are running within a Google Cloud Environment, [environment data](https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application) can be used from the [service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts) to implicitly access resources within the storage bucket.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/external-io-privilege.md %}
{{site.data.alerts.end}}

For CockroachDB clusters running in other environments, `implicit` authentication access can still be set up manually with the following steps:

  1. [Create a service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts) and add the service account address to the permissions on the specific storage bucket.

  1. Download the [JSON credentials file](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) from the **Service Accounts** page in the Google Cloud Console to the machines that CockroachDB is running on. (Since this file will be passed as an environment variable, it does **not** need to be base64-encoded.) Ensure that the file is located in a path that CockroachDB can access.

  1. Create an environment variable instructing CockroachDB where the credentials file is located. The environment variable must be exported on each CockroachDB node:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    export GOOGLE_APPLICATION_CREDENTIALS="/{cockroach}/gcs_key.json"
    ~~~

    Alternatively, to pass the credentials using [`systemd`](https://www.freedesktop.org/wiki/Software/systemd/), use `systemctl edit cockroach.service` to add the environment variable `Environment="GOOGLE_APPLICATION_CREDENTIALS=gcs-key.json"` under `[Service]` in the `cockroach.service` unit file. Then, run `systemctl daemon-reload` to reload the `systemd` process. Restart the `cockroach` process on each of the cluster's nodes with `systemctl restart cockroach`, which will reload the configuration files.

    To pass the credentials using code, see [Google's Authentication documentation](https://cloud.google.com/docs/authentication/production#passing_code).

  1. Run a backup (or other bulk operation) to the storage bucket with the `AUTH` parameter set to `implicit`:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    BACKUP DATABASE <database> INTO 'gs://{bucket name}/{path}?AUTH=implicit';
    ~~~

{{site.data.alerts.callout_info}}
If the use of implicit credentials is disabled with [`--external-io-disable-implicit-credentials` flag](cockroach-start.html#security), an error will be returned when accessing external cloud storage services for various bulk operations when using `AUTH=implicit`.
{{site.data.alerts.end}}

### Assume role authentication

{{site.data.alerts.callout_info}}
CockroachDB supports assume role authentication on clusters running v22.2. Authenticating to cloud storage with `ASSUME_ROLE` on clusters running versions v22.1 and earlier, or mixed versions, is not supported and will result in failed bulk operations.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v22.2" %} To limit the control access to your Google Cloud Storage buckets, you can create [service accounts](https://cloud.google.com/iam/docs/understanding-service-accounts) for another service account to assume. Service accounts do not necessarily have an association to a particular user. The service account contains permissions that define the operations a user, who has access to the service account, can complete. A service account can then assume another service account to undertake a CockroachDB backup, restore, import, etc. As a result, a service account with limited privileges only has access to the roles of the assumed service account, rather than having unlimited access to a GCS bucket.

The access is also limited by the generated [short-lived credentials](https://cloud.google.com/iam/docs/create-short-lived-credentials-direct). The service account/role that is assuming another role, will issue the request for the short-lived credentials. If there are multiple roles in the [chain](#google-cloud-role-chaining), then each role defined in the chain will issue the request for credentials for the next role in the chain. 

The [following section](#set-up-google-cloud-assume-role-authentication) demonstrates setting up assume role authentication between two service accounts A and B. You can also chain an arbitrary number of roles, see the [Role chaining](#google-cloud-role-chaining) section for additional detail.

#### Set up Google Cloud assume role authentication

In the following example, we will configure service account A to assume service account B. In this way, service account A will be able to assume the role of service account B to complete a bulk operation to a GCS bucket.

For this example, both service accounts have already been created. If you need to create your own service accounts, see Google Cloud's [Creating and managing service accounts](https://cloud.google.com/iam/docs/creating-managing-service-accounts) page.

1. First, you'll create a role that contains a policy to interact with the Google Cloud Storage bucket depending on the bulk operation your user needs to complete. This role will be attached to service account B in order that service account A can assume it.
    - In [Google's Cloud console](https://console.cloud.google.com/getting-started), click **IAM & Admin**, **Roles**, and then **Create Role**.
    - Add a title for the role and then click **Add Permissions**. Filter for the permissions required for the bulk operation. For example, if you want to enable service account B to run a changefeed, your role will include the `storage.objects.create` permission. See the [Storage permissions](#storage-permissions) section on this page for details on the minimum permissions each CockroachDB bulk operation requires.

    <img src="{{ 'images/v22.2/gcs-assume-add-perms-role.png' | relative_url }}" alt="Adding permissions to a changefeed role when creating a role." style="border:1px solid #eee;max-width:100%" />

    {{site.data.alerts.callout_success}}
    Alternately, you can use the [gcloud CLI](https://cloud.google.com/sdk/gcloud/reference/iam/roles/create) to create roles. 
    {{site.data.alerts.end}}

1. The service account that will be assumed (B in this case) must be granted access to the storage bucket with the role assigned from step 1. 
    - Go to the **Cloud Storage** menu and select the bucket. In the bucket's menu, click **Grant Access**. 
    - Add the service account to the **Add principals** box and select the name of the role you created in step 1 under **Assign roles**.

    <img src="{{ 'images/v22.2/gcs-assume-add-sa-bucket.png' | relative_url }}" alt="Adding service account with the created role to the bucket." style="border:1px solid #eee;max-width:100%" />

1. <a name="service-account-token-granting"></a>Next, service account B needs the "Service Account Token Creator" role for service account A. This enables service account B to create short-lived tokens for A. 
    - Go to the **Service Accounts** menu in the Google Cloud Console. 
    - Select service account B from the list, then the **Permissions** tab, and click **Grant Access** under **Principals with access to this service account**. 
    - Enter the name of service account A into the **New principals** box and select "Service Account Token Creator" under the **Assign roles** dropdown. Click **Save** to complete.

    <img src="{{ 'images/v22.2/gcs-assume-grant-sa-access.png' | relative_url }}" alt="Granting service account A access to service account B with the token creator role." style="border:1px solid #eee;max-width:100%" />

1. Finally, you will run the bulk operation from your CockroachDB cluster. If you're using [specified authentication](#specified-authentication), pass in the GCS bucket's URL with the IAM user's `CREDENTIALS`. If you're using [implicit authentication](#implicit-authentication), specify `AUTH=IMPLICIT` instead. For assuming the role, pass the assumed role's service account name, which you can copy from the **Service Accounts** page:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    BACKUP DATABASE <database> INTO 'gs://{bucket name}/{path}?AUTH=implicit&ASSUME_ROLE={service account name}@{project name}.iam.gserviceaccount.com';
    ~~~

    CockroachDB also supports authentication for assuming roles when taking encrypted backups. To use with an encrypted backup, pass the `ASSUME_ROLE` parameter to the KMS URI as well as the bucket's: 

    {% include_cached copy-clipboard.html %}
    ~~~sql
    BACKUP DATABASE <database> INTO 'gs://{bucket name}/{path}?AUTH=implicit&ASSUME_ROLE={service account name}@{project name}.iam.gserviceaccount.com' WITH kms = 'gs:///projects/{project name}/locations/us-east1/keyRings/{key ring name}/cryptoKeys/{key name}?AUTH=IMPLICIT&ASSUME_ROLE={service account name}@{project name}.iam.gserviceaccount.com';
    ~~~

    For more information on Google Cloud Storage KMS URI formats, see [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html).

    {{site.data.alerts.callout_info}}
    CockroachDB supports assume role authentication for changefeeds emitting to Google Cloud Pub/Sub sinks. The process to set up assume role for Pub/Sub works in a similar way, except that you will provide the final service account with the "Pub/Sub Editor" role at the project level. See the [Changefeed Sinks](changefeed-sinks.html#google-cloud-pub-sub) page for more detail on the Pub/Sub sink.
    {{site.data.alerts.end}}

#### Google Cloud role chaining

Role chaining allows a service account to assume a role through an intermediate service account(s) instead of the service account directly assuming a role. In this way, the role chain passes the request for access to the final role in the chain. Role chaining could be useful when a third-party organization needs access to your Google Cloud Storage bucket to complete a bulk operation. Or, your organization could grant roles based on limited-privilege levels.

Following from the previous setup section, if you want to add an intermediate account to the chain of roles, it is necessary to ensure each service account has granted the "Service Account Token Creator" role to the previous account in the chain. See [step 3](#service-account-token-granting) in the previous section to add this role on a service account.

In a chain of three roles, A, B, C:

Service Account A | &larr; Service Account B (intermediate accounts) | &larr; Service Account C (final account)
-----------------+----------------+---------
Credentials included in `AUTH=implicit` or `specified` | Grants access to **A** with the Service Account Token Creator role | Grants access to **B** with the Service Account Token Creator role<br>Access to the resource e.g., storage bucket

- The initial account (A) requests permissions from account B.
- The intermediate account (B) will delegate the request to account C.
- The final service account (C) will request the credentials that account A requires.

When passing a chained role into `BACKUP`, it will follow this pattern with each chained role separated by a `,` character: 

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE <database> INTO 'gs://{bucket name}/{path}?AUTH=implicit&ASSUME_ROLE={intermediate service account name}@{project name}.iam.gserviceaccount.com,{final service account name}@{project name}.iam.gserviceaccount.com'; AS OF SYSTEM TIME '-10s';
~~~

### Google Cloud workload identity 

With a CockroachDB cluster deployed on [Kubernetes](kubernetes-overview.html), you can allow your pods to authenticate as an IAM service account that you have associated to a Kubernetes service account. You can then use assume role authentication to allow the IAM service account to assume another service account that has permissions to perform bulk operations to a Google Cloud Storage bucket.

This means that a CockroachDB node will only be able to access credentials for the IAM service account associated with the Kubernetes service account.

You can use workload identities with assume role authentication to run the following operations:

- [`BACKUP`](backup.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
- [`EXPORT`](export.html)
- [`IMPORT`](import.html) / [`IMPORT INTO`](import-into.html)
- [`RESTORE`](restore.html)

{{site.data.alerts.callout_info}}
Service accounts in Google and Kubernetes refer to different resources. See [Google's documentation](https://cloud.google.com/kubernetes-engine/docs/concepts/workload-identity#terminology) for definitions.
{{site.data.alerts.end}}

To use assume role authentication, you will need at least two IAM roles:

- An _identity service account_: the IAM service account you have associated with your Kubernetes service account.
- An _operation service account_: the IAM service account to be assumed. This contains the permissions required to complete a CockroachDB operation.

#### Set up Google Cloud workload identity

Before completing the steps to run a bulk operation with assume role, it is necessary to create a identity service account for your Kubernetes service account to assume. Then, you must configure your CockroachDB pods to use the Kubernetes service account. You can complete all of these steps with Google's guide [Use Workload Identity](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity).

Once you have an identity service account that your CockroachDB nodes can assume, you can configure the identity role to assume another service account role that contains the permissions to perform the bulk operation.

1. Copy the service account name of the identity service account. In the Google Cloud Console, navigate to the **IAM** section, **Service Accounts**, and then the name of your identity service account. From the list view, copy the name of your identity service account. You will need to add this to the operation service account to be assumed.

1. Create or open the operation service account that your identity service account will assume.

    a. To create a service account, click **Create Service Account** under the **Service Accounts** menu. Enter a name for the service account and click **Create and Continue**.

    b. In the **Grant this service account access to project** section, select the role you require for the bulk operation, e.g., "Storage Object Creator". See [Storage Permissions](#storage-permissions) for detail on the minimum permissions required for each operation to complete. Click **Continue**. 

    <img src="{{ 'images/v22.2/gcs-wi-grant-users.png' | relative_url }}" alt="Adding the workload identity role to the service account users role box" style="border:1px solid #eee;max-width:100%" />

    c. In the **Grant users access to this service account** section, paste the name of the identity service account. Then, click **Done**.

    <img src="{{ 'images/v22.2/gcs-wi-grant-users.png' | relative_url }}" alt="Adding the workload identity role to the service account users role box" style="border:1px solid #eee;max-width:100%" />

    {{site.data.alerts.callout_info}}
    If you already have the service account that contains permissions for the bulk operation, ensure that you give the identity service account access to this service account. Click on your service account and navigate to the **Permissions** tab. Then, use the process in step 2 to complete this. 
    {{site.data.alerts.end}}

1. To run the bulk operation, you can use [`implicit` authentication](#implicit-authentication) for your identity service account and pass the `ASSUME_ROLE` parameter for your operation service account. For a backup to your Google Cloud Storage bucket:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    BACKUP DATABASE {database} INTO 'gs://{bucket name}/{path}?AUTH=implicit&ASSUME_ROLE={operation service account}@{project name}.iam.gserviceaccount.com'; AS OF SYSTEM TIME '-10s';
    ~~~

    In this SQL statement, `AUTH=implicit` uses the workload identity service account to authenticate to the bucket. The workload identity role then assumes the operation service account that has permission to write a backup to the bucket.

</section>

<section class="filter-content" markdown="1" data-scope="azure">

<!--Need to add at least one heading to each filter section so that the TOC sidebar represents the current section. -->

To access Azure storage containers, it is sometimes necessary to [url encode](https://en.wikipedia.org/wiki/Percent-encoding) the account key since it is base64-encoded and may contain `+`, `/`, `=` characters. For example:

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE <database> INTO 'azure://{container name}/{path}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

</section>

<section class="filter-content" markdown="1" data-scope="http">

<!--Need to add at least one heading to each filter section so that the TOC sidebar represents the current section. -->

If your environment requires an HTTP or HTTPS proxy server for outgoing connections, you can set the standard `HTTP_PROXY` and `HTTPS_PROXY` [environment variables](cockroach-commands.html#environment-variables) when starting CockroachDB. You can create your own HTTP server with [NGINX](use-a-local-file-server-for-bulk-operations.html). A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from HTTPS URLs.

If you cannot run a full proxy, you can disable external HTTP(S) access (as well as custom HTTP(S) endpoints) when importing by using the [`--external-io-disable-http` flag](cockroach-start.html#flags-external-io-disable-http).

</section>

<section class="filter-content" markdown="1" data-scope="s3compatible">

<!--Need to add at least one heading to each filter section so that the TOC sidebar represents the current section. -->
## Foo

{% include {{ page.version.version }}/misc/s3-compatible-warning.md %}

A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from an S3-compatible service.

</section>