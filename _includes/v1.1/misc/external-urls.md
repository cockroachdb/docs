~~~
[scheme]://[host]/[path]?[parameters]
~~~

| Location | scheme | host | parameters |
|----------|--------|------|------------|
| Amazon S3 | `s3` | Bucket name | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Azure | `azure` | Container name | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME` |
| Google Cloud&nbsp;[<sup>1</sup>](#considerations) | `gs` | Bucket name | N/A |
| HTTP | `http` | Remote host | N/A |
| NFS/Local&nbsp;[<sup>2</sup>](#considerations) | `nodelocal` | File system location | N/A |

#### Considerations

- <sup>1</sup> GCS connections use Google's [default authentication strategy](https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application).

- <sup>2</sup> Because CockroachDB is a distributed system, you cannot meaningfully store backups "locally" on nodes. The entire backup file must be stored in a single location, so attempts to store backups locally must point to an NFS drive to be useful.

- The location parameters often contain special characters that need to be URI-encoded. Use Javascript's [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) function or Go language's [url.QueryEscape](https://golang.org/pkg/net/url/#QueryEscape) function to URI-encode the parameters. Other languages provide similar functions to URI-encode special characters.
