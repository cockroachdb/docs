The examples in this section use one of the following storage URIs:

- External connections, which allow you to represent an external storage or sink URI. You can then specify the external connection's name in statements rather than the provider-specific URI. For detail on using external connections, see the [`CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/create-external-connection.md %}) page.
- Amazon S3 connection strings with the **default** `AUTH=specified` parameter. For guidance on using `AUTH=implicit` authentication with Amazon S3 buckets instead, read [Cloud Storage Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}).

For guidance on connecting to other storage options or using other authentication parameters instead, read [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %}#example-file-urls).