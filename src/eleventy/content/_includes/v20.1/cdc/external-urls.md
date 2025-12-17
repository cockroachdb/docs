~~~
[scheme]://[host]/[path]?[parameters]
~~~

Location                                                    | Scheme      | Host                                             | Parameters                                                                 |
|-------------------------------------------------------------+-------------+--------------------------------------------------+----------------------------------------------------------------------------
Amazon                                                      | `s3`        | Bucket name                                      | `AUTH`&nbsp;[<sup>1</sup>](#considerations) (optional; can be `implicit` or `specified`), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`                               
Azure                                                       | `azure`     | N/A (see [Example file URLs](#example-file-urls) | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME`
Google Cloud&nbsp;[<sup>2</sup>](#considerations)           | `gs`        | Bucket name                                      | `AUTH` (optional; can be `default`, `implicit`, or `specified`), `CREDENTIALS`
HTTP&nbsp;[<sup>3</sup>](#considerations)                   | `http`      | Remote host                                      | N/A
NFS/Local&nbsp;[<sup>4</sup>](#considerations)              | `nodelocal` | `nodeID` or `self` [<sup>5</sup>](#considerations) (see [Example file URLs](#example-file-urls)) | N/A
S3-compatible services&nbsp;[<sup>6</sup>](#considerations) | `s3`        | Bucket name                                      | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_REGION`&nbsp;[<sup>7</sup>](#considerations) (optional), `AWS_ENDPOINT`

{{site.data.alerts.callout_info}}
The location parameters often contain special characters that need to be URI-encoded. Use Javascript's [`encodeURIComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) function or Go language's [`url.QueryEscape`](https://golang.org/pkg/net/url/#QueryEscape) function to URI-encode the parameters. Other languages provide similar functions to URI-encode special characters.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
If your environment requires an HTTP or HTTPS proxy server for outgoing connections, you can set the standard `HTTP_PROXY` and `HTTPS_PROXY` environment variables when starting CockroachDB.

 If you cannot run a full proxy, you can disable external HTTP(S) access (as well as custom HTTP(S) endpoints) when performing bulk operations (e.g., [`BACKUP`](backup.html), [`RESTORE`](restore.html), etc.) by using the [`--external-io-disable-http` flag](cockroach-start.html#security). You can also disable the use of implicit credentials when accessing external cloud storage services for various bulk operations by using the [`--external-io-disable-implicit-credentials` flag](cockroach-start.html#security).
{{site.data.alerts.end}}

<a name="considerations"></a>

- <sup>1</sup> If the `AUTH` parameter is not provided, AWS connections default to `specified` and the access keys must be provided in the URI parameters. If the `AUTH` parameter is `implicit`, the access keys can be omitted and [the credentials will be loaded from the environment](https://docs.aws.amazon.com/sdk-for-go/api/aws/session/).

- <sup>2</sup> If the `AUTH` parameter is not specified, the `cloudstorage.gs.default.key` [cluster setting](cluster-settings.html) will be used if it is non-empty, otherwise the `implicit` behavior is used. If the `AUTH` parameter is `implicit`, all GCS connections use Google's [default authentication strategy](https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application). If the `AUTH` parameter is `default`, the `cloudstorage.gs.default.key` [cluster setting](cluster-settings.html) must be set to the contents of a [service account file](https://cloud.google.com/docs/authentication/production#obtaining_and_providing_service_account_credentials_manually) which will be used during authentication.  If the `AUTH` parameter is `specified`, GCS connections are authenticated on a per-statement basis, which allows the JSON key object to be sent in the `CREDENTIALS` parameter. The JSON key object should be Base64-encoded (using the standard encoding in [RFC 4648](https://tools.ietf.org/html/rfc4648)).

- <sup>3</sup> You can create your own HTTP server with [Caddy or nginx](create-a-file-server.html). A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from HTTPS URLs.

- <sup>4</sup> The file system backup location on the NFS drive is relative to the path specified by the `--external-io-dir` flag set while [starting the node](cockroach-start.html). If the flag is set to `disabled`, then imports from local directories and NFS drives are disabled.

- <sup>5</sup>   Using a `nodeID` is required and the data files will be in the `extern` directory of the specified node. In most cases (including single-node clusters), using `nodelocal://1/<path>` is sufficient. Use `self` if you do not want to specify a `nodeID`, and the individual data files will be in the `extern` directories of arbitrary nodes; however, to work correctly, each node must have the [`--external-io-dir` flag](cockroach-start.html#general) point to the same NFS mount or other network-backed, shared storage.

- <sup>6</sup> A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from an S3-compatible service.

- <sup>7</sup> The `AWS_REGION` parameter is optional since it is not a required parameter for most S3-compatible services. Specify the parameter only if your S3-compatible service requires it.

#### Example file URLs

Location     | Example                                                                          
-------------+----------------------------------------------------------------------------------
Amazon S3    | `s3://acme-co/employees?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456`     
Azure        | `azure://employees?AZURE_ACCOUNT_KEY=123&AZURE_ACCOUNT_NAME=acme-co`         
Google Cloud | `gs://acme-co`                                                     
HTTP         | `http://localhost:8080/employees`                                            
NFS/Local    | `nodelocal://1/path/employees`, `nodelocal://self/nfsmount/backups/employees`&nbsp;[<sup>5</sup>](#considerations)
