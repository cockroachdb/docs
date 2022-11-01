---
title: Use Cloud Storage for Bulk Operations
summary: CockroachDB constructs a secure API call to the cloud storage specified in a URL passed to bulk operation statements.
toc: true
---

CockroachDB uses the URL provided in a [`BACKUP`](backup.html), [`RESTORE`](restore.html), [`IMPORT`](import.html), or [`EXPORT`](export.html) statement to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using.

{{site.data.alerts.callout_success}}
We strongly recommend using cloud/remote storage (Amazon S3, Google Cloud Platform, etc.).
{{site.data.alerts.end}}

URLs for the files you want to import must use the format shown below. For examples, see [Example file URLs](#example-file-urls).

~~~
[scheme]://[host]/[path]?[parameters]
~~~

Location                                                    | Scheme      | Host                                             | Parameters                                                                 |
|-------------------------------------------------------------+-------------+--------------------------------------------------+----------------------------------------------------------------------------
Amazon                                                      | `s3`        | Bucket name                                      | `AUTH` (optional; can be `implicit` or `specified`), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` <br><br>For more information, see [Authentication - Amazon S3](#amazon-s3).
Azure                                                       | `azure`     | N/A (see [Example file URLs](#example-file-urls)) | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME`
Google Cloud           | `gs`        | Bucket name                                      | `AUTH` (optional; can be `default`, `implicit`, or `specified`), `CREDENTIALS` <br><br>For more information, see [Authentication - Google Cloud Storage](#google-cloud-storage).
HTTP&nbsp;[<sup>1</sup>](#considerations)                   | `http`      | Remote host                                      | N/A <br><br>For more information, see [Authentication - HTTP](#http).
NFS/Local&nbsp;[<sup>2</sup>](#considerations)              | `nodelocal` | `nodeID` or `self` (see [Example file URLs](#example-file-urls)) | N/A
S3-compatible services | `s3`        | Bucket name                                      | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_REGION`&nbsp;[<sup>3</sup>](#considerations) (optional), `AWS_ENDPOINT` <br><br>For more information, see [Authentication - S3-compatible services](#s3-compatible-services).

{{site.data.alerts.callout_success}}
The location parameters often contain special characters that need to be URI-encoded. Use Javascript's [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) function or Go language's [url.QueryEscape](https://golang.org/pkg/net/url/#QueryEscape) function to URI-encode the parameters. Other languages provide similar functions to URI-encode special characters.
{{site.data.alerts.end}}

<a name="considerations"></a>

- <sup>1</sup> The file system backup location on the NFS drive is relative to the path specified by the [`--external-io-dir`](cockroach-start.html#flags-external-io-dir) flag set while [starting the node](cockroach-start.html). If the flag is set to `disabled`, then imports from local directories and NFS drives are disabled.

- <sup>2</sup>   Using a `nodeID` is required and the data files will be in the `extern` directory of the specified node. In most cases (including single-node clusters), using `nodelocal://1/<path>` is sufficient. Use `self` if you do not want to specify a `nodeID`, and the individual data files will be in the `extern` directories of arbitrary nodes; however, to work correctly, each node must have the [`--external-io-dir`](cockroach-start.html#flags-external-io-dir) flag point to the same NFS mount or other network-backed, shared storage.

- <sup>3</sup> The `AWS_REGION` parameter is optional since it is not a required parameter for most S3-compatible services. Specify the parameter only if your S3-compatible service requires it.

## Example file URLs

Example URLs for [`BACKUP`](backup.html), [`RESTORE`](restore.html), [`EXPORT`](export.html), or [changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html) given a bucket or container name of `acme-co` and an `employees` subdirectory:

Location     | Example
-------------+----------------------------------------------------------------------------------
Amazon S3    | `s3://acme-co/employees?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456`
Azure        | `azure://acme-co/employees?AZURE_ACCOUNT_NAME=acme-co&AZURE_ACCOUNT_KEY=url-encoded-123`
Google Cloud | `gs://acme-co/employees?AUTH=specified&CREDENTIALS=encoded-123`
NFS/Local    | `nodelocal://1/path/employees`, `nodelocal://self/nfsmount/backups/employees`&nbsp;[<sup>2</sup>](#considerations)

{{site.data.alerts.callout_info}}
URLs for [changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html) should be prepended with `experimental-`.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Currently, cloud storage sinks (for changefeeds) only work with `JSON` and emits newline-delimited `JSON` files.
{{site.data.alerts.end}}

Example URLs for [`IMPORT`](import.html) given a bucket or container name of `acme-co` and a filename of `employees`:

Location     | Example
-------------+----------------------------------------------------------------------------------
Amazon S3    | `s3://acme-co/employees.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456`
Azure        | `azure://employees.sql?AZURE_ACCOUNT_KEY=123&AZURE_ACCOUNT_NAME=acme-co`
Google Cloud | `gs://acme-co/employees.sql`
HTTP         | `http://localhost:8080/employees.sql`
NFS/Local    | `nodelocal://1/path/employees`, `nodelocal://self/nfsmount/backups/employees`&nbsp;[<sup>2</sup>](#considerations)

{{site.data.alerts.callout_info}}
HTTP storage can only be used for [`IMPORT`](import.html).
{{site.data.alerts.end}}

## Encryption

[Transport Layer Security (TLS)](https://en.wikipedia.org/wiki/Transport_Layer_Security) is used for encryption in transit when transmitting data to or from Amazon S3, Google Cloud Storage, and Azure.

For encryption at rest, if your cloud provider offers transparent data encryption, you can use that to ensure that your backups are not stored on disk in cleartext.

* [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/serv-side-encryption.html)
* [Azure Storage](https://docs.microsoft.com/en-us/azure/storage/common/storage-service-encryption#about-azure-storage-encryption)
* [Google Cloud Storage](https://cloud.google.com/storage/docs/encryption)

CockroachDB also provides client-side encryption of backup data, for more information, see [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html).

## Authentication

Authentication behavior differs by cloud provider:

### Amazon S3

  - If the `AUTH` parameter is not provided, AWS connections default to `specified` and the access keys must be provided in the URI parameters.

    As an example:

    ~~~sql
    BACKUP DATABASE <database> INTO 's3://{bucket name}/{path in bucket}/?AWS_ACCESS_KEY_ID={access key ID}&AWS_SECRET_ACCESS_KEY={secret access key}';
    ~~~

  -  If the `AUTH` parameter is `implicit`, the access keys can be omitted and [the credentials will be loaded from the environment](https://docs.aws.amazon.com/sdk-for-go/api/aws/session/), i.e. the machines running the backup.

    ~~~sql
    BACKUP DATABASE <database> INTO 's3://{bucket name}/{path}?AUTH=implicit';
    ~~~

    You [can associate an EC2 instance with an IAM role](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html) to provide implicit access to S3 storage within the IAM role's policy. In the following command, the `instance example` EC2 instance is [associated](https://docs.aws.amazon.com/cli/latest/reference/ec2/associate-iam-instance-profile.html) with the `example profile` instance profile, giving the EC2 instance implicit access to any `example profile` S3 buckets.

    ~~~shell
    aws ec2 associate-iam-instance-profile --iam-instance-profile Name={example profile} --region={us-east-2} --instance-id {instance example}
    ~~~

### Google Cloud Storage

If the `AUTH` parameter is set to:

  - `default`: GCS connections only use the key provided in the `cloudstorage.gs.default.key` [cluster setting](cluster-settings.html), and will error if not present.
  - `specified`: Pass the JSON object for authentication to the `CREDENTIALS` parameter. The JSON key object needs to be base64-encoded (using the standard encoding in [RFC 4648](https://tools.ietf.org/html/rfc4648)).

    To access the storage bucket with specified credentials, it's necessary to [create a service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts) and add the service account address to the permissions on the specific storage bucket. [The JSON object for authentication](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) can be downloaded, encoded, and then passed to the `CREDENTIALS` parameter.

    ~~~sql
    BACKUP DATABASE <database> INTO 'gs://{bucket name}/{path}?AUTH=specified&CREDENTIALS={encoded key}';
    ~~~

  - `implicit`: The instance can use [environment data](https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application) from the service account to access resources. This will provide implicit access to the storage bucket.

    ~~~sql
    BACKUP DATABASE <database> INTO 'gs://{bucket name}/{path}?AUTH=implicit';
    ~~~

  - If `AUTH` is not provided, use the key provided in the `cloudstorage.gs.default.key` [cluster setting](cluster-settings.html). Otherwise, use environment data.

    {% include {{ page.version.version }}/backups/gcs-default-deprec.md %}

### Azure Storage

To access Azure storage containers, it is sometimes necessary to [url encode](https://en.wikipedia.org/wiki/Percent-encoding) the account key since it is base64-encoded and may contain `+`, `/`, `=` characters. For example:

~~~sql
BACKUP DATABASE <database> INTO 'azure://{container name}/{path}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

### HTTP

If your environment requires an HTTP or HTTPS proxy server for outgoing connections, you can set the standard `HTTP_PROXY` and `HTTPS_PROXY` [environment variables](cockroach-commands.html#environment-variables) when starting CockroachDB. You can create your own HTTP server with [NGINX](use-a-local-file-server-for-bulk-operations.html). A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from HTTPS URLs.

If you cannot run a full proxy, you can disable external HTTP(S) access (as well as custom HTTP(S) endpoints) when importing by using the [`--external-io-disable-http` flag](cockroach-start.html#flags-external-io-disable-http).

### S3-compatible services

A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from an S3-compatible service.

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
- [`EXPORT`](export.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
- [Cluster Settings](cluster-settings.html)
