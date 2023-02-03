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

Location                                                    | Scheme      | Host                                             | Parameters
------------------------------------------------------------+-------------+--------------------------------------------------+----------------------------------------------------------------------------
Amazon                                                      | `s3`        | Bucket name                                      | `AUTH`: optional `implicit` or `specified` (default: `specified`); `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`<br><br>[`AWS_SESSION_TOKEN`](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html): (optional) For more information, see [Authentication - Amazon S3](#authentication). <br><br>[`S3_STORAGE_CLASS`](#amazon-s3-storage-classes): (optional) Specify the Amazon S3 storage class for created objects. Note that Glacier Flexible Retrieval and Glacier Deep Archive are not compatible with incremental backups. **Default**: `STANDARD`.
Azure                                                       | `azure`     | Storage container                                | `AZURE_ACCOUNT_NAME`: The name of your Azure account.<br><br>`AZURE_ACCOUNT_KEY`: Your Azure account key. You must [url encode](https://en.wikipedia.org/wiki/Percent-encoding) your Azure account key before authenticating to Azure Storage. For more information, see [Authentication - Azure Storage](use-cloud-storage-for-bulk-operations.html?filters=azure).<br><br>`AZURE_ENVIRONMENT`: (optional) {% include {{ page.version.version }}/misc/azure-env-param.md %}
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

The `AUTH` parameter passed to the file URL must be set to either `specified` or `implicit`. The following sections describe how to set up each authentication method.

### Specified authentication

If the `AUTH` parameter is not provided, AWS connections default to `specified` and the access keys must be provided in the URI parameters.

As an example:

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE <database> INTO 's3://{bucket name}/{path in bucket}/?AWS_ACCESS_KEY_ID={access key ID}&AWS_SECRET_ACCESS_KEY={secret access key}';
~~~

### Implicit authentication

If the `AUTH` parameter is `implicit`, the access keys can be omitted and [the credentials will be loaded from the environment](https://docs.aws.amazon.com/sdk-for-go/api/aws/session/) (i.e., the machines running the backup).

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE <database> INTO 's3://{bucket name}/{path}?AUTH=implicit';
~~~

You [can associate an EC2 instance with an IAM role](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html) to provide implicit access to S3 storage within the IAM role's policy. In the following command, the `instance example` EC2 instance is [associated](https://docs.aws.amazon.com/cli/latest/reference/ec2/associate-iam-instance-profile.html) with the `example profile` instance profile, giving the EC2 instance implicit access to any `example profile` S3 buckets.

{% include_cached copy-clipboard.html %}
~~~shell
aws ec2 associate-iam-instance-profile --iam-instance-profile Name={example profile} --region={us-east-2} --instance-id {instance example}
~~~

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

</section>

<section class="filter-content" markdown="1" data-scope="azure">

To access Azure storage containers, it is necessary to [url encode](https://en.wikipedia.org/wiki/Percent-encoding) the account key since it is base64-encoded and may contain `+`, `/`, `=` characters. For example:

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

{{site.data.alerts.callout_danger}}
Unlike Amazon S3, Google Cloud Storage, and Azure Storage options, the usage of S3-compatible services is not actively tested by Cockroach Labs.
{{site.data.alerts.end}}

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

{% include_cached new-in.html version="v22.1" %} Delete and overwrite permissions are **not** required. To complete a backup successfully, `BACKUP` requires [read and write permissions](backup.html#required-privileges) to cloud storage buckets. As a result, you can write backups to cloud storage buckets with object locking enabled. This allows you to store backup data using a _write-once-read-many (WORM)_ model, which refers to storage that prevents any kind of deletion or modification to the objects once written.

{{site.data.alerts.callout_info}}
We recommend enabling object locking in cloud storage buckets to protect the validity of a backup for restores.
{{site.data.alerts.end}}

For specific cloud-storage provider documentation, see the following:

- [AWS S3 Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)
- [Retention policies and Bucket Lock in Google Cloud Storage](https://cloud.google.com/storage/docs/bucket-lock)
- [Immutable storage in Azure Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/immutable-storage-overview)

### Amazon S3 storage classes

{% include_cached new-in.html version="v22.1" %} When storing objects in Amazon S3 buckets during [backups](take-full-and-incremental-backups.html), [exports](export.html), and [changefeeds](change-data-capture-overview.html), you can specify the `S3_STORAGE_CLASS={class}` parameter in the URI to configure a storage class type. 

The following S3 connection URI uses the `INTELLIGENT_TIERING` storage class:

~~~
's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&S3_STORAGE_CLASS=INTELLIGENT_TIERING'
~~~

While Cockroach Labs supports configuring an AWS storage class, we only test against S3 Standard. We recommend implementing your own testing with other storage classes. 

{{site.data.alerts.callout_info}}
[Incremental backups](take-full-and-incremental-backups.html#incremental-backups) are **not** compatible with the S3 Glacier Flexible Retrieval or Glacier Deep Archive storage classes. Incremental backups require ad-hoc reading of previous backups, which is not possible with the Glacier Flexible Retrieval or Glacier Deep Archive storage classes as they do not allow immediate access to S3 objects without first restoring the objects. See Amazon's documentation on [Restoring an archived object](https://docs.aws.amazon.com/AmazonS3/latest/userguide/restoring-objects.html) for more detail.
{{site.data.alerts.end}}

This table lists the valid CockroachDB parameters that map to an S3 storage class:

CockroachDB parameter | AWS S3 storage class
----------------------+--------------------------
`STANDARD` | [S3 Standard](https://aws.amazon.com/s3/storage-classes/#General_purpose)
`REDUCED_REDUNDANCY` | [Reduced redundancy](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) **Note**: Amazon recommends against using this storage class.
`STANDARD_IA` | [Standard Infrequent Access](https://aws.amazon.com/s3/storage-classes/#Infrequent_access)
`ONEZONE_IA` | [One Zone Infrequent Access](https://aws.amazon.com/s3/storage-classes/#__)
`INTELLIGENT_TIERING` | [Intelligent Tiering](https://aws.amazon.com/s3/storage-classes/#Unknown_or_changing_access)
`GLACIER` | [Glacier Flexible Retrieval](https://aws.amazon.com/s3/storage-classes/#Flexible_Retrieval)
`DEEP_ARCHIVE` | [Glacier Deep Archive](https://aws.amazon.com/s3/storage-classes/#____)
`OUTPOSTS` | [Outpost](https://aws.amazon.com/s3/storage-classes/#S3_on_Outposts)
`GLACIER_IR` | [Glacier Instant Retrieval](https://aws.amazon.com/s3/storage-classes/#Instant_Retrieval)

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

- [Back up with an S3 storage class](backup.html#back-up-with-an-s3-storage-class)
- [Create a changefeed with an S3 storage class](create-changefeed.html#create-a-changefeed-with-an-s3-storage-class)
- [Export tabular data with an S3 storage class](export.html#export-tabular-data-with-an-s3-storage-class)

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
- [`EXPORT`](export.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
- [Cluster Settings](cluster-settings.html)
