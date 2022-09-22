{% include_cached new-in.html version="v22.2" %} You can grant a user the `EXTERNALIOIMPLICITACCESS` [system privilege](security-reference/authorization.html#supported-privileges).

`EXTERNALIOIMPLICITACCESS` or [`admin`](security-reference/authorization.html#admin-role) is required for the following scenarios:

- To interact with a cloud storage resource using [`IMPLICIT` authentication](use-cloud-storage-for-bulk-operations.html#authentication).
- Use of a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3.
- [Nodelocal](cockroach-nodelocal-upload.html)

No special privilege is required for: 

- Amazon S3 and Google Cloud Storage using `SPECIFIED` credentials. Azure Storage is always `SPECIFIED` by default.
- [Userfile](use-userfile-for-bulk-operations.html)

{% include {{ page.version.version }}/misc/bulk-permission-note.md %}