---
title: Use Cloud Storage for Bulk Operations
summary: CockroachDB constructs a secure API call to the cloud storage specified in a URL passed to bulk operation statements.
toc: true
docs_area: manage
---

CockroachDB constructs a secure API call to the cloud storage specified in a URL passed to one of the following statements:

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
- [`EXPORT`](export.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)

{{site.data.alerts.callout_success}}
We strongly recommend using cloud/remote storage.
{{site.data.alerts.end}}

## URL format

URLs for the files you want to import must use the format shown below. For examples, see [Example file URLs](#example-file-urls).

~~~
[scheme]://[host]/[path]?[parameters]
~~~

{% include {{ page.version.version }}/misc/external-connection-note.md %}

The following table provides a list of the parameters supported by each storage scheme:

Location                                                    | Scheme      | Host                                             | Parameters
------------------------------------------------------------+-------------+--------------------------------------------------+----------------------------------------------------------------------------
Amazon                                                      | `s3`        | Bucket name                                      | [`AUTH`](#authentication): `implicit` or `specified` (default: `specified`). When using `specified` pass user's `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.<br><br>[`ASSUME_ROLE`](#assume-role-authentication) (optional): Pass the [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) of the role to assume. Use in combination with `AUTH=implicit` or `specified`.<br><br>[`AWS_SESSION_TOKEN`](#authentication) (optional): For more information, see Amazon's guide on [temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html). <br><br>[`S3_STORAGE_CLASS`](#amazon-s3-storage-classes) (optional): Specify the Amazon S3 storage class for created objects. **Default**: `STANDARD`.
Azure                                                       | `azure`     | Storage container                                | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME` <br><br>For more information, see [Authentication - Azure Storage](#authentication).
Google Cloud                                                | `gs`        | Bucket name                                      | `AUTH`: `implicit`, or `specified` (default: `specified`); `CREDENTIALS` <br><br>For more information, see [Authentication - Google Cloud Storage](#authentication).
HTTP                                                        | `http`      | Remote host                                      | N/A <br><br>For more information, see [Authentication - HTTP](#authentication).
NFS/Local&nbsp;[<sup>1</sup>](#considerations)              | `nodelocal` | `nodeID` or `self` [<sup>2</sup>](#considerations) (see [Example file URLs](#example-file-urls)) | N/A
S3-compatible services                                     | `s3`        | Bucket name                                      | {{site.data.alerts.callout_danger}} While Cockroach Labs actively tests Amazon S3, Google Cloud Storage, and Azure Storage, we **do not** test S3-compatible services (e.g., [MinIO](https://min.io/), [Red Hat Ceph](https://docs.ceph.com/en/pacific/radosgw/s3/)).{{site.data.alerts.end}}<br><br>`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_REGION`&nbsp;[<sup>3</sup>](#considerations) (optional), `AWS_ENDPOINT`<br><br>For more information, see [Authentication - S3-compatible services](#authentication).

{{site.data.alerts.callout_success}}
The location parameters often contain special characters that need to be URI-encoded. Use Javascript's [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) function or Go language's [url.QueryEscape](https://golang.org/pkg/net/url/#QueryEscape) function to URI-encode the parameters. Other languages provide similar functions to URI-encode special characters.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
You can disable the use of implicit credentials when accessing external cloud storage services for various bulk operations by using the [`--external-io-disable-implicit-credentials` flag](cockroach-start.html#security).
{{site.data.alerts.end}}

<a name="considerations"></a>

<sup>1</sup> The file system backup location on the NFS drive is relative to the path specified by the [`--external-io-dir`](cockroach-start.html#flags-external-io-dir) flag set while [starting the node](cockroach-start.html). If the flag is set to `disabled`, then imports from local directories and NFS drives are disabled.

<sup>2</sup>   Using a `nodeID` is required and the data files will be in the `extern` directory of the specified node. In most cases (including single-node clusters), using `nodelocal://1/<path>` is sufficient. Use `self` if you do not want to specify a `nodeID`, and the individual data files will be in the `extern` directories of arbitrary nodes; however, to work correctly, each node must have the [`--external-io-dir`](cockroach-start.html#flags-external-io-dir) flag point to the same NFS mount or other network-backed, shared storage.

<sup>3</sup> The `AWS_REGION` parameter is optional since it is not a required parameter for most S3-compatible services. Specify the parameter only if your S3-compatible service requires it.

### Example file URLs

Example URLs for [`BACKUP`](backup.html), [`RESTORE`](restore.html), [changefeeds](change-data-capture-overview.html),  or [`EXPORT`](export.html) given a bucket or container name of `acme-co` and an `employees` subdirectory:

Location     | Example
-------------+----------------------------------------------------------------------------------
Amazon S3    | `s3://acme-co/employees?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456`
Azure        | `azure://acme-co/employees?AZURE_ACCOUNT_NAME=acme-co&AZURE_ACCOUNT_KEY=url-encoded-123`
Google Cloud | `gs://acme-co/employees?AUTH=specified&CREDENTIALS=encoded-123`
NFS/Local    | `nodelocal://1/path/employees`, `nodelocal://self/nfsmount/backups/employees`&nbsp;[<sup>2</sup>](#considerations)

{{site.data.alerts.callout_info}}
[Cloud storage sinks (for changefeeds)](change-data-capture-overview.html#known-limitations) only work with `JSON` and emits newline-delimited `JSON` files.
{{site.data.alerts.end}}

Example URLs for [`IMPORT`](import.html) given a bucket or container name of `acme-co` and a filename of `employees`:

Location     | Example
-------------+----------------------------------------------------------------------------------
Amazon S3    | `s3://acme-co/employees.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456`
Azure        | `azure://acme-co/employees.sql?AZURE_ACCOUNT_NAME=acme-co&AZURE_ACCOUNT_KEY=url-encoded-123`
Google Cloud | `gs://acme-co/employees.sql?AUTH=specified&CREDENTIALS=encoded-123`
HTTP         | `http://localhost:8080/employees.sql`
NFS/Local    | `nodelocal://1/path/employees`, `nodelocal://self/nfsmount/backups/employees`&nbsp;[<sup>2</sup>](#considerations)

{{site.data.alerts.callout_info}}
HTTP storage can only be used for [`IMPORT`](import.html) and [`CREATE CHANGEFEED`](create-changefeed.html).
{{site.data.alerts.end}}

## Encryption

[Transport Layer Security (TLS)](https://en.wikipedia.org/wiki/Transport_Layer_Security) is used for encryption in transit when transmitting data to or from Amazon S3, Google Cloud Storage, and Azure.

For encryption at rest, if your cloud provider offers transparent data encryption, you can use that to ensure that your backups are not stored on disk in cleartext.

* [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/serv-side-encryption.html)
* [Azure Storage](https://docs.microsoft.com/en-us/azure/storage/common/storage-service-encryption#about-azure-storage-encryption)
* [Google Cloud Storage](https://cloud.google.com/storage/docs/encryption)

CockroachDB also provides client-side encryption of backup data, for more information, see [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html).

## Authentication

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

To access Azure storage containers, it is sometimes necessary to [url encode](https://en.wikipedia.org/wiki/Percent-encoding) the account key since it is base64-encoded and may contain `+`, `/`, `=` characters. For example:

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE <database> INTO 'azure://{container name}/{path}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

</section>

<section class="filter-content" markdown="1" data-scope="http">

If your environment requires an HTTP or HTTPS proxy server for outgoing connections, you can set the standard `HTTP_PROXY` and `HTTPS_PROXY` [environment variables](cockroach-commands.html#environment-variables) when starting CockroachDB. You can create your own HTTP server with [NGINX](use-a-local-file-server-for-bulk-operations.html). A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from HTTPS URLs.

If you cannot run a full proxy, you can disable external HTTP(S) access (as well as custom HTTP(S) endpoints) when importing by using the [`--external-io-disable-http` flag](cockroach-start.html#flags-external-io-disable-http).

</section>

<section class="filter-content" markdown="1" data-scope="s3compatible">

{% include {{ page.version.version }}/misc/s3-compatible-warning.md %}

A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from an S3-compatible service.

</section>

## Storage permissions

This section describes the minimum permissions required to run CockroachDB bulk operations. While we provide the required permissions for Amazon S3 and Google Cloud Storage, the provider's documentation provides detail on the setup process and different options regarding access management.

Depending on the actions a bulk operation performs, it will require different access permissions to a cloud storage bucket.

This table outlines the actions that each operation performs against the storage bucket:

<table>
    <thead>
        <tr>
            <th>Operation</th>
            <th>Permission</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan="4"><a href="backup.html">Backup</a></td>
            <td>Write</td>
            <td>Backups write the backup data to the bucket/container. During a backup job, a <code>BACKUP CHECKPOINT</code> file will be written that tracks the progress of the backup.</td>
        </tr>
        <tr>
            <td>Get</td>
            <td>Backups need get access after a <a href="pause-job.html">pause</a> to read the checkpoint files on <a href="resume-job.html">resume</a>.</td>
        </tr>
        <tr>
            <td>List</td>
            <td>Backups need list access to the files already in the bucket. For example, <code>BACKUP</code> uses list to find previously taken backups when executing an incremental backup and to find the latest checkpoint file.</td>
        </tr>
        <tr>
            <td>Delete (optional)</td>
            <td>To clean up <code>BACKUP CHECKPOINT</code> files that the backup job has written, you need to also include a delete permission in your bucket policy (e.g., <code>s3:DeleteObject</code>). However, delete is <b>not</b> necessary for backups to complete successfully in v22.1 and later.</td>
        </tr>
        <tr>
            <td rowspan="2"><a href="restore.html">Restore</a></td>
            <td>Get</td>
            <td>Restores need access to retrieve files from the backup. Restore also requires access to the <code>LATEST</code> file in order to read the latest available backup.</td>
        </tr>
        <tr>
            <td>List</td>
            <td>Restores need list access to the files already in the bucket to find other backups in the <a href="take-full-and-incremental-backups.html#backup-collections">backup collection</a>. This contains metadata files that describe the backup, the <code>LATEST</code> file, and other versioned subdirectories and files.</td>
        </tr>
        <tr>
            <td><a href="import.html">Import</a></td>
            <td>Get</td>
            <td>Imports read the requested file(s) from the storage bucket.</td>
        </tr>
        <tr>
            <td><a href="export.html">Export</a></td>
            <td>Write</td>
            <td>Exports need write access to the storage bucket to create individual export file(s) from the exported data.</td>
        </tr>
        <tr>
            <td><a href="create-changefeed.html">Enterprise changefeeds</a></td>
            <td>Write</td>
            <td>Changefeeds will write files to the storage bucket that contain row changes and resolved timestamps.</td>
        </tr>
    </tbody>
</table>

<div class="filters clearfix">
  <button class="filter-button" data-scope="s3-perms">Amazon S3</button>
  <button class="filter-button" data-scope="gcs-perms">Google Cloud Storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="s3-perms">

These [actions](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Operations_Amazon_Simple_Storage_Service.html) are the minimum access permissions to be set in an Amazon S3 bucket policy:

Operation    | S3 permission
-------------+----------------------------------------------------------------------------------
Backup       | `s3:PutObject`, `s3:GetObject`, `s3:ListBucket`
Restore      | `s3:GetObject`, `s3:ListBucket`
Import       | `s3:GetObject`
Export       | `s3:PutObject`
Enterprise Changefeeds  | `s3:PutObject`

See [Policies and Permissions in Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-policy-language-overview.html) for detail on setting policies and permissions in Amazon S3.

An example S3 bucket policy for a **backup**:

~~~json
{
    "Version": "2012-10-17",
    "Id": "Example_Policy",
    "Statement": [
        {
            "Sid": "ExampleStatement01",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::{ACCOUNT_ID}:user/{USER}"
            },
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::{BUCKET_NAME}",
                "arn:aws:s3:::{BUCKET_NAME}/*"
            ]
        }
    ]
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="gcs-perms">

In Google Cloud Storage, you can grant users roles that define their access level to the storage bucket. For the purposes of running CockroachDB operations to your bucket, the following table lists the permissions that represent the minimum level required for each operation. GCS provides different levels of granularity for defining the roles in which these permissions reside. You can assign roles that already have these [permissions](https://cloud.google.com/storage/docs/access-control/iam-permissions) configured, or make your own custom roles that include these permissions.

For more detail about Predefined, Basic, and Custom roles, see [IAM roles for Cloud Storage](https://cloud.google.com/storage/docs/access-control/iam-roles).

Operation    | GCS Permission
-------------+----------------------------------------------------------------------------------
Backup       | `storage.objects.create`, `storage.objects.get`, `storage.objects.list`
Restore      | `storage.objects.get`, `storage.objects.list`
Import       | `storage.objects.get`
Export       | `storage.objects.create`
Changefeeds  | `storage.objects.create`

For guidance on adding a user to a bucket's policy, see [Add a principal to a bucket-level policy](https://cloud.google.com/storage/docs/access-control/using-iam-permissions#bucket-add).

</section>

## Additional cloud storage feature support

### Object locking

Delete and overwrite permissions are **not** required. To complete a backup successfully, `BACKUP` requires [read and write permissions](backup.html#required-privileges) to cloud storage buckets. As a result, you can write backups to cloud storage buckets with object locking enabled. This allows you to store backup data using a _write-once-read-many (WORM)_ model, which refers to storage that prevents any kind of deletion or modification to the objects once written.

{{site.data.alerts.callout_info}}
We recommend enabling object locking in cloud storage buckets to protect the validity of a backup for restores.
{{site.data.alerts.end}}

For specific cloud-storage provider documentation, see the following:

- [AWS S3 Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)
- [Retention policies and Bucket Lock in Google Cloud Storage](https://cloud.google.com/storage/docs/bucket-lock)
- [Immutable storage in Azure Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/immutable-storage-overview)

### Amazon S3 storage classes

When storing objects in Amazon S3 buckets during [backups](take-full-and-incremental-backups.html), [exports](export.html), and [changefeeds](change-data-capture-overview.html), you can specify the `S3_STORAGE_CLASS={class}` parameter in the URI to configure a storage class type. For example, the following S3 connection URI specifies the `INTELLIGENT_TIERING` storage class:

~~~
's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&S3_STORAGE_CLASS=INTELLIGENT_TIERING'
~~~

{% include {{ page.version.version }}/misc/storage-classes.md %}

You can view an object's storage class in the [Amazon S3 Console](https://s3.console.aws.amazon.com) from the object's **Properties** tab. Alternatively, use the [AWS CLI](https://docs.aws.amazon.com/cli/latest/reference/s3api/list-objects-v2.html) to list objects in a bucket, which will also display the storage class:

~~~ shell
aws s3api list-objects-v2 --bucket {bucket-name}
~~~

~~~
{
    "Key": "2022/05/02-180752.65/metadata.sst",
    "LastModified": "2022-05-02T18:07:54+00:00",
    "ETag": "\"c0f499f21d7886e4289d55ccface7527\"",
    "Size": 7865,
    "StorageClass": "STANDARD"
},
    ...

    "Key": "2022-05-06/202205061217256387084640000000000-1b4e610c63535061-1-2-00000000-
users-7.ndjson",
    "LastModified": "2022-05-06T12:17:26+00:00",
    "ETag": "\"c60a013619439bf83c505cb6958b55e2\"",
    "Size": 94596,
    "StorageClass": "INTELLIGENT_TIERING"
},
~~~

For a specific operation, see the following examples:

- [Backup with an S3 storage class](backup.html#backup-with-an-s3-storage-class)
- [Create a changefeed with an S3 storage class](create-changefeed.html#create-a-changefeed-with-an-s3-storage-class)
- [Export tabular data with an S3 storage class](export.html#export-tabular-data-with-an-s3-storage-class)

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
- [`EXPORT`](export.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
- [Cluster Settings](cluster-settings.html)
