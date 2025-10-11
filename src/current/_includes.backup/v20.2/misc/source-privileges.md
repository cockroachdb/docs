The source file URL does _not_ require the [`ADMIN` role](authorization.html#admin-role) in the following scenarios:

- S3 and GS using `SPECIFIED` (and not `IMPLICIT`) credentials. Azure is always `SPECIFIED` by default.
- [Userfile](use-userfile-for-bulk-operations.html)

The source file URL _does_ require the `ADMIN` role in the following scenarios:

- S3 or GS using `IMPLICIT` credentials
- Use of a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3
- [Nodelocal](cockroach-nodelocal-upload.html), [HTTP](use-a-local-file-server-for-bulk-operations.html) or [HTTPS] (use-a-local-file-server-for-bulk-operations.html)

We recommend using [cloud storage for bulk operations](use-cloud-storage-for-bulk-operations.html).
