The following examples make use of:

- Amazon S3 connection strings. For guidance on connecting to other storage options or using other authentication parameters instead, read [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %}#example-file-urls).
- The **default** `AUTH=specified` parameter. For guidance on using `AUTH=implicit` authentication with Amazon S3 buckets instead, read [Cloud Storage Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}).

Also, note the following features for connecting and authenticating to cloud storage:

- External connections, which allow you to represent an external storage or sink URI. You can then specify the external connection's name in statements rather than the provider-specific URI. For detail on using external connections, see the [`CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/create-external-connection.md %}) page.
- Assume role authentication, which allows you to limit the control specific users have over your storage buckets. See [Assume role authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) for more information.