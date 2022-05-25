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
Amazon                                                      | `s3`        | Bucket name                                      | `AUTH`: optional `implicit` or `specified` (default: `specified`); `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, [`AWS_SESSION_TOKEN`](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html). For more information, see [Authentication - Amazon S3](#authentication). <br><br>`S3_STORAGE_CLASS`: Specify the Amazon S3 storage class for created objects. **Default**: `STANDARD`. See [Amazon S3 storage classes](#amazon-s3-storage-classes) for the available classes.                              
Azure                                                       | `azure`     | Storage container                                | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME` <br><br>For more information, see [Authentication - Azure Storage](#authentication).
Google Cloud                                                | `gs`        | Bucket name                                      | `AUTH`: `implicit`, or `specified` (default: `specified`); `CREDENTIALS` <br><br>For more information, see [Authentication - Google Cloud Storage](#authentication).     
HTTP                                                        | `http`      | Remote host                                      | N/A <br><br>For more information, see [Authentication - HTTP](#authentication).      
NFS/Local&nbsp;[<sup>1</sup>](#considerations)              | `nodelocal` | `nodeID` or `self` [<sup>2</sup>](#considerations) (see [Example file URLs](#example-file-urls)) | N/A
S3-compatible services                                     | `s3`        | Bucket name                                      | **Warning**: Unlike Amazon S3, Google Cloud Storage, and Azure storage options, the usage of S3-compatible services is not actively tested by Cockroach Labs. <br><br>`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_REGION`&nbsp;[<sup>3</sup>](#considerations) (optional), `AWS_ENDPOINT`<br><br>For more information, see [Authentication - S3-compatible services](#authentication).

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

{% include copy-clipboard.html %}
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

To access Azure storage containers, it is sometimes necessary to [url encode](https://en.wikipedia.org/wiki/Percent-encoding) the account key since it is base64-encoded and may contain `+`, `/`, `=` characters. For example:

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE <database> INTO 'azure://{container name}/{path}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

</section>

<section class="filter-content" markdown="1" data-scope="http">

If your environment requires an HTTP or HTTPS proxy server for outgoing connections, you can set the standard `HTTP_PROXY` and `HTTPS_PROXY` [environment variables](https://www.cockroachlabs.com/docs/stable/cockroach-commands.html#environment-variables) when starting CockroachDB. You can create your own HTTP server with [NGINX](use-a-local-file-server-for-bulk-operations.html). A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from HTTPS URLs.

If you cannot run a full proxy, you can disable external HTTP(S) access (as well as custom HTTP(S) endpoints) when importing by using the [`--external-io-disable-http` flag](cockroach-start.html#flags-external-io-disable-http).

</section>

<section class="filter-content" markdown="1" data-scope="s3compatible">

{{site.data.alerts.callout_danger}}
Unlike Amazon S3, Google Cloud Storage, and Azure storage options, the usage of S3-compatible services is not actively tested by Cockroach Labs.
{{site.data.alerts.end}}

A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from an S3-compatible service.

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

{% include_cached new-in.html version="v22.1" %} When storing objects in Amazon S3 buckets during [backups](take-full-and-incremental-backups.html), [exports](export.html), and [changefeeds](change-data-capture-overview.html), you can specify the `S3_STORAGE_CLASS={class}` parameter in the URI to configure a storage class type. For example, the following S3 connection URI specifies the `INTELLIGENT_TIERING` storage class:

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
