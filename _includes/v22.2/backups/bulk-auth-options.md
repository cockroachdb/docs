The following examples provide connection strings to Amazon S3. For guidance on connecting to other storage options, read [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html#example-file-urls). 

{% include_cached new-in.html version="v22.2" %} You can create an external connection to represent an external storage or sink URI. This allows you to specify the external connection's name in statements rather than the provider-specific URI. For detail on using external connections, see the [`CREATE EXTERNAL CONNECTION`](create-external-connection.html) page.

For authentication to cloud storage, the examples use the **default** `AUTH=specified` parameter. You can also use the following authentication options:

- `implicit` authentication with Amazon S3 buckets and Google Cloud Storage. Read [Use Cloud Storage for Bulk Operations — Authentication](use-cloud-storage-for-bulk-operations.html#authentication) for more detail.
- {% include_cached new-in.html version="v22.2" %} Assume role authentication, which allows you to limit the control specific users have over your storage buckets. See [Assume role authentication](use-cloud-storage-for-bulk-operations.html) for more information.
