The source file URL does _not_ require the [`admin` role]({{ page.version.version }}/security-reference/authorization.md#admin-role) in the following scenarios:

- S3 and GS using `SPECIFIED` (and not `IMPLICIT`) credentials. Azure is always `SPECIFIED` by default.
- [Userfile]({{ page.version.version }}/use-userfile-storage.md)

The source file URL _does_ require the [`admin` role]({{ page.version.version }}/security-reference/authorization.md#admin-role) in the following scenarios:

- S3 or GS using `IMPLICIT` credentials
- Use of a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3
- [Nodelocal]({{ page.version.version }}/cockroach-nodelocal-upload.md), [HTTP]({{ page.version.version }}/use-a-local-file-server.md) or [HTTPS] ({{ page.version.version }}/use-a-local-file-server.md)

We recommend using [cloud storage]({{ page.version.version }}/use-cloud-storage.md).
