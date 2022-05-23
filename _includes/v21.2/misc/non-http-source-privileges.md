The source file URL does **not** require the [`admin` role](security-reference/authorization.html#admin-role) in the following scenarios:

- S3 and GS using `SPECIFIED` (and not `IMPLICIT`) credentials. Azure is always `SPECIFIED` by default.
- [Userfile](use-userfile-for-bulk-operations.html)

The source file URL **does** require the [`admin` role](security-reference/authorization.html#admin-role) in the following scenarios:

- S3 or GS using `IMPLICIT` credentials
- Use of a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3
- [Nodelocal](cockroach-nodelocal-upload.html)

We recommend using [cloud storage for bulk operations](use-cloud-storage-for-bulk-operations.html).
