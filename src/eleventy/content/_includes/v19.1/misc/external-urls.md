~~~
[scheme]://[host]/[path]?[parameters]
~~~

| Location                                                    | Scheme      | Host                                             | Parameters                                                                 |
|-------------------------------------------------------------+-------------+--------------------------------------------------+----------------------------------------------------------------------------|
| Amazon S3                                                   | `s3`        | Bucket name                                      | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`                               |
| Azure                                                       | `azure`     | N/A (see [Example file URLs](#example-file-urls) | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME`                                  |
| Google Cloud&nbsp;[<sup>1</sup>](#considerations)           | `gs`        | Bucket name                                      | `AUTH` (optional; can be `default`, `implicit`, or `specified`), `CREDENTIALS`                         |
| HTTP&nbsp;[<sup>2</sup>](#considerations)                   | `http`      | Remote host                                      | N/A                                                                        |
| NFS/Local&nbsp;[<sup>3</sup>](#considerations)              | `nodelocal` | Empty or `nodeID` [<sup>4</sup>](#considerations) (see [Example file URLs](#example-file-urls)) | N/A                                                                        |
| S3-compatible services&nbsp;[<sup>5</sup>](#considerations) | `s3`        | Bucket name                                      | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `AWS_REGION`&nbsp;[<sup>6</sup>](#considerations) (optional), `AWS_ENDPOINT` |

{{site.data.alerts.callout_danger}}
If you write to `nodelocal` storage in a multi-node cluster, individual data files will be written to the `extern` directories of arbitrary nodes and will likely not work as intended. To work correctly, each node must have the [`--external-io-dir` flag](start-a-node.html#general) point to the same NFS mount or other network-backed, shared storage.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
The location parameters often contain special characters that need to be URI-encoded. Use Javascript's [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) function or Go language's [url.QueryEscape](https://golang.org/pkg/net/url/#QueryEscape) function to URI-encode the parameters. Other languages provide similar functions to URI-encode special characters.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
If your environment requires an HTTP or HTTPS proxy server for outgoing connections, you can set the standard `HTTP_PROXY` and `HTTPS_PROXY` environment variables when starting CockroachDB.
{{site.data.alerts.end}}

<a name="considerations"></a>

- <sup>1</sup>If the `AUTH` parameter is not specified, the `cloudstorage.gs.default.key` [cluster setting](cluster-settings.html) will be used if it is non-empty, otherwise the `implicit` behavior is used. If the `AUTH` parameter is `implicit`, all GCS connections use Google's [default authentication strategy](https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application). If the `AUTH` parameter is `default`, the `cloudstorage.gs.default.key` [cluster setting](cluster-settings.html) must be set to the contents of a [service account file](https://cloud.google.com/docs/authentication/production#obtaining_and_providing_service_account_credentials_manually) which will be used during authentication. <span class="version-tag">New in v19.1:</span> If the `AUTH` parameter is `specified`, GCS connections are authenticated on a per-statement basis, which allows the JSON key object to be sent in the `CREDENTIALS` parameter. The JSON key object should be base64-encoded (using the standard encoding in [RFC 4648](https://tools.ietf.org/html/rfc4648)).

- <sup>2</sup> You can create your own HTTP server with [Caddy or nginx](create-a-file-server.html). A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from HTTPS URLs.

- <sup>3</sup> The file system backup location on the NFS drive is relative to the path specified by the `--external-io-dir` flag set while [starting the node](start-a-node.html). If the flag is set to `disabled`, then imports from local directories and NFS drives are disabled.

- <sup>4</sup> <span class="version-tag">New in v19.1:</span> The host component of NFS/Local can either be empty or the `nodeID`. If the `nodeID` is specified, it is currently ignored (i.e., any node can be sent work and it will look in its local input/output directory); however, the `nodeID` will likely be required in the future.

- <sup>5</sup> A custom root CA can be appended to the system's default CAs by setting the `cloudstorage.http.custom_ca` [cluster setting](cluster-settings.html), which will be used when verifying certificates from an S3-compatible service.

- <sup>6</sup> The `AWS_REGION` parameter is optional since it is not a required parameter for most S3-compatible services. Specify the parameter only if your S3-compatible service requires it.

#### Example file URLs

| Location     | Example                                                                          |
|--------------+----------------------------------------------------------------------------------|
| Amazon S3    | `s3://acme-co/employees.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456`     |
| Azure        | `azure://employees.sql?AZURE_ACCOUNT_KEY=123&AZURE_ACCOUNT_NAME=acme-co`         |
| Google Cloud | `gs://acme-co/employees.sql`                                                     |
| HTTP         | `http://localhost:8080/employees.sql`                                            |
| NFS/Local    | `nodelocal:///path/employees`, `nodelocal://2/path/employees` <br><br>**Note:** If you write to `nodelocal` storage in a multi-node cluster, individual data files will be written to the `extern` directories of arbitrary nodes and will likely not work as intended. To work correctly, each node must have the [`--external-io-dir` flag](start-a-node.html#general) point to the same NFS mount or other network-backed, shared storage.         |
