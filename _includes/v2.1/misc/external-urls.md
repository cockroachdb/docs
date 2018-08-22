~~~
[scheme]://[host]/[path]?[parameters]
~~~

| Location                                                    | Scheme      | Host                                                              | Parameters                                                                 | Example                                                                          |
|-------------------------------------------------------------+-------------+-------------------------------------------------------------------+----------------------------------------------------------------------------+----------------------------------------------------------------------------------|
| Amazon S3                                                   | `s3`        | Bucket name                                                       | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`                               | `s3://acme-co/employees.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456`     |
| Azure                                                       | `azure`     | Container name                                                    | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME`                                  | `azure://acme-co/employees.sql?AZURE_ACCOUNT_KEY=123&AZURE_ACCOUNT_NAME=acme-co` |
| Google Cloud&nbsp;[<sup>1</sup>](#considerations)           | `gs`        | Bucket name                                                       | `AUTH` (optional): can be `default` or `implicit`                          | `gs://acme-co/employees.sql`                                                     |
| HTTP&nbsp;[<sup>2</sup>](#considerations)                   | `http`      | Remote host                                                       | N/A                                                                        | `http://localhost:8080/employees.sql`                                            |
| NFS/Local&nbsp;[<sup>3</sup>](#considerations)              | `nodelocal` | File system location, i.e., `/cockroach-data/extern/employees.sql` | N/A                                                                        | `nodelocal:///employees.sql`                                                     |
| S3-compatible services&nbsp;[<sup>4</sup>](#considerations) | `s3`        | Bucket name                                                       | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_ENDPOINT` |                                                                                  |

{{site.data.alerts.callout_info}}
The location parameters often contain special characters that need to be URI-encoded. Use Javascript's [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) function or Go language's [url.QueryEscape](https://golang.org/pkg/net/url/#QueryEscape) function to URI-encode the parameters. Other languages provide similar functions to URI-encode special characters.
{{site.data.alerts.end}}

<a name="considerations"></a>

- <sup>1</sup> If the `AUTH` parameter is `implicit`, all GCS connections use Google's [default authentication strategy](https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application). If the `AUTH` parameter is `default`, the `cloudstorage.gs.default.key` [cluster setting](cluster-settings.html) must be set to the contents of a [service account file](https://cloud.google.com/docs/authentication/production#obtaining_and_providing_service_account_credentials_manually) which will be used during authentication. If the `AUTH` parameter is not specified, the `cloudstorage.gs.default.key` setting will be used if it is non-empty, otherwise the `implicit` behavior is used.

- <sup>2</sup> You can create your own HTTP server with [Caddy or nginx](create-a-file-server.html). A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from HTTPS URLs.

- <sup>3</sup> The file system backup location on the NFS drive is relative to the path specified by the `--external-io-dir` flag set while [starting the node](start-a-node.html). If the flag is set to `disabled`, then imports from local directories and NFS drives are disabled.

- <sup>4</sup> A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from an S3-compatible service.
