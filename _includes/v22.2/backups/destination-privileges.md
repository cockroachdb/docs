{% include_cached new-in.html version="v22.2" %} You can grant a user the `EXTERNALIOIMPLICITACCESS` [system privilege](security-reference/authorization.html#supported-privileges).

Either the `EXTERNALIOIMPLICITACCESS` system privilege or the [`admin`](security-reference/authorization.html#admin-role) role is required for the following scenarios:

- Interacting with a cloud storage resource using [`IMPLICIT` authentication](cloud-storage-authentication.html).
- Using a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3.
- Using the [`cockroach nodelocal upload`](cockroach-nodelocal-upload.html) command.

No special privilege is required for: 

- Interacting with an Amazon S3 and Google Cloud Storage resource using `SPECIFIED` credentials. Azure Storage is always `SPECIFIED` by default.
- Using [Userfile](use-userfile-for-bulk-operations.html) storage.

{% include {{ page.version.version }}/misc/bulk-permission-note.md %}