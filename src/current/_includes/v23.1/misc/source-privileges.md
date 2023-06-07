The source file URL does _not_ require the [`admin` role](security-reference/authorization.html#admin-role) in the following scenarios:

- S3 and GS using `SPECIFIED` (and not `IMPLICIT`) credentials. Azure is always `SPECIFIED` by default.
- [Userfile](use-userfile-storage.html)

The source file URL _does_ require the [`admin` role](security-reference/authorization.html#admin-role) in the following scenarios:

- S3 or GS using `IMPLICIT` credentials
- Use of a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3
- [Nodelocal](cockroach-nodelocal-upload.html), [HTTP](use-a-local-file-server.html) or [HTTPS] (use-a-local-file-server.html)

We recommend using [cloud storage](use-cloud-storage.html).
