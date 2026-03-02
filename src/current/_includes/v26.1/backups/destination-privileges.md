You can grant a user the `EXTERNALIOIMPLICITACCESS` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).

Either the `EXTERNALIOIMPLICITACCESS` system-level privilege or the [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) role is required for the following scenarios:

- Interacting with a cloud storage resource using [`IMPLICIT` authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}).
- Using a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3.
- Using the [`cockroach nodelocal upload`]({% link {{ page.version.version }}/cockroach-nodelocal-upload.md %}) command.

No special privilege is required for: 

- Interacting with an Amazon S3 and Google Cloud Storage resource using `SPECIFIED` credentials. Azure Storage is always `SPECIFIED` by default.
- Using [Userfile]({% link {{ page.version.version }}/use-userfile-storage.md %}) storage.

{% include {{ page.version.version }}/misc/bulk-permission-note.md %}