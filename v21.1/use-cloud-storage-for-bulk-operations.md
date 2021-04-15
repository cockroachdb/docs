---
title: Use Cloud Storage for Bulk Operations
summary: CockroachDB constructs a secure API call to the cloud storage specified in a URL passed to bulk operation statements.
toc: true
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
Amazon                                                      | `s3`        | Bucket name                                      | `AUTH` (optional; can be `implicit` or `specified`), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` <br><br>For more information, see [Authentication - AWS](#aws).                               
Azure                                                       | `azure`     | N/A (see [Example file URLs](#example-file-urls) | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME`
Google Cloud                                                | `gs`        | Bucket name                                      | `AUTH` (optional; can be `default`, `implicit`, or `specified`), `CREDENTIALS` <br><br>**Deprecation notice:** In v21.1, we suggest you do not use the `cloudstorage.gs.default.key` [cluster setting](cluster-settings.html), as the default behavior will be changing in v21.2. For more information, see [Authentication - GCS](#gcs).
HTTP                                                        | `http`      | Remote host                                      | N/A <br><br>For more information, see [Authentication - HTTP](#http).      
NFS/Local&nbsp;[<sup>1</sup>](#considerations)              | `nodelocal` | `nodeID` or `self` [<sup>2</sup>](#considerations) (see [Example file URLs](#example-file-urls)) | N/A
S3-compatible services)                                     | `s3`        | Bucket name                                      | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_REGION`&nbsp;[<sup>3</sup>](#considerations) (optional), `AWS_ENDPOINT`<br><br>For more information, see [Authentication - S3-compatible services](#s3-compatible-services).   

{{site.data.alerts.callout_success}}
The location parameters often contain special characters that need to be URI-encoded. Use Javascript's [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) function or Go language's [url.QueryEscape](https://golang.org/pkg/net/url/#QueryEscape) function to URI-encode the parameters. Other languages provide similar functions to URI-encode special characters.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
You can disable the use of implicit credentials when accessing external cloud storage services for various bulk operations by using the [`--external-io-disable-implicit-credentials` flag](cockroach-start.html#security).
{{site.data.alerts.end}}

<a name="considerations"></a>

<sup>1</sup> The file system backup location on the NFS drive is relative to the path specified by the `--external-io-dir` flag set while [starting the node](cockroach-start.html). If the flag is set to `disabled`, then imports from local directories and NFS drives are disabled.

<sup>2</sup>   Using a `nodeID` is required and the data files will be in the `extern` directory of the specified node. In most cases (including single-node clusters), using `nodelocal://1/<path>` is sufficient. Use `self` if you do not want to specify a `nodeID`, and the individual data files will be in the `extern` directories of arbitrary nodes; however, to work correctly, each node must have the [`--external-io-dir` flag](cockroach-start.html#general) point to the same NFS mount or other network-backed, shared storage.

<sup>3</sup> The `AWS_REGION` parameter is optional since it is not a required parameter for most S3-compatible services. Specify the parameter only if your S3-compatible service requires it.

### Example file URLs

Example URLs for [`BACKUP`](backup.html), [`EXPORT`](export.html), or [changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html):

Location     | Example                                                                          
-------------+----------------------------------------------------------------------------------
Amazon S3    | `s3://acme-co/employees?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456`     
Azure        | `azure://employees?AZURE_ACCOUNT_KEY=123&AZURE_ACCOUNT_NAME=acme-co`         
Google Cloud | `gs://acme-co`                                                     
NFS/Local    | `nodelocal://1/path/employees`, `nodelocal://self/nfsmount/backups/employees`&nbsp;[<sup>5</sup>](#considerations)

{{site.data.alerts.callout_info}}
URLs for [changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html) should be prepended with `experimental-`.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Currently, cloud storage sinks (for changefeeds) only work with `JSON` and emits newline-delimited `JSON` files.
{{site.data.alerts.end}}

Example URLs for [`RESTORE`](restore.html) or [`IMPORT`](import.html):

Location     | Example                                                                          
-------------+----------------------------------------------------------------------------------
Amazon S3    | `s3://acme-co/employees.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456`     
Azure        | `azure://employees.sql?AZURE_ACCOUNT_KEY=123&AZURE_ACCOUNT_NAME=acme-co`         
Google Cloud | `gs://acme-co/employees.sql`                                                     
HTTP         | `http://localhost:8080/employees.sql`                                            
NFS/Local    | `nodelocal://1/path/employees`, `nodelocal://self/nfsmount/backups/employees`&nbsp;[<sup>5</sup>](#considerations)

{{site.data.alerts.callout_info}}
HTTP storage can only be used for [`IMPORT`](import.html).
{{site.data.alerts.end}}

## Authentication

Authentication behavior differs by cloud provider:

### AWS

- If the `AUTH` parameter is not provided, AWS connections default to `specified` and the access keys must be provided in the URI parameters.
- If the `AUTH` parameter is `implicit`, the access keys can be omitted and [the credentials will be loaded from the environment](https://docs.aws.amazon.com/sdk-for-go/api/aws/session/).

### GCS

If the `AUTH` parameter is set to:

- `default`: GCS connections only use the key provided in the `cloudstorage.gs.default.key` [cluster setting](cluster-settings.html), and will error if not present.
- `specified`: The JSON object for authentication is given by the `CREDENTIALS` parameter. The JSON key object should be base64-encoded (using the standard encoding in [RFC 4648](https://tools.ietf.org/html/rfc4648)).
- `implicit`: Only use the [environment data](https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application).
- If `AUTH` is not provided, use the key provided in the `cloudstorage.gs.default.key` [cluster setting](cluster-settings.html). Otherwise, use environment data.

    {{site.data.alerts.callout_info}}
    **Deprecation notice:** Currently, GCS connections default to the `cloudstorage.gs.default.key` [cluster setting](cluster-settings.html). This default behavior will no longer be supported in v21.2. If you are relying on this default behavior, we recommend adjusting your queries and scripts to now specify the `AUTH` parameter you want to use. Similarly, if you are using the `cloudstorage.gs.default.key` cluster setting to authorize your GCS connection, we recommend switching to use `AUTH=specified` or `AUTH=implicit`. `AUTH=specified` will be the default behavior in v21.2 and beyond.
    {{site.data.alerts.end}}

### HTTP

If your environment requires an HTTP or HTTPS proxy server for outgoing connections, you can set the standard `HTTP_PROXY` and `HTTPS_PROXY` environment variables when starting CockroachDB. You can create your own HTTP server with [Caddy or nginx](use-a-local-file-server-for-bulk-operations.html). A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from HTTPS URLs.

If you cannot run a full proxy, you can disable external HTTP(S) access (as well as custom HTTP(S) endpoints) when importing by using the [`--external-io-disable-http` flag](cockroach-start.html#security).

### S3-compatible services

A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from an S3-compatible service.

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
- [`EXPORT`](export.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
- [Cluster Settings](cluster-settings.html)
