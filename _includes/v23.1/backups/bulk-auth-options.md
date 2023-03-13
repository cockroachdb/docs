The following examples make use of:

- Amazon S3 connection strings. For guidance on connecting to other storage options or using other authentication parameters instead, read [Use Cloud Storage](use-cloud-storage.html#example-file-urls).
- The **default** `AUTH=specified` parameter. For guidance on using `AUTH=implicit` authentication with Amazon S3 buckets instead, read [Use Cloud Storage for Bulk Operations — Authentication](cloud-storage-authentication.html).

Also, note the following features for connecting and authenticating to cloud storage:

- External connections, which allow you to represent an external storage or sink URI. You can then specify the external connection's name in statements rather than the provider-specific URI. For detail on using external connections, see the [`CREATE EXTERNAL CONNECTION`](create-external-connection.html) page.
- Assume role authentication, which allows you to limit the control specific users have over your storage buckets. See [Assume role authentication](cloud-storage-authentication.html) for more information.
