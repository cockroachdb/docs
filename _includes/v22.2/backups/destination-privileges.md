The user that runs `BACKUP` to external storage does **not** require the [`admin` role](security-reference/authorization.html#admin-role) in the following scenarios:

- Amazon S3 and Google Cloud Storage using `SPECIFIED` credentials. Azure Storage is always `SPECIFIED` by default.
- [Userfile](use-userfile-for-bulk-operations.html)

{% include_cached new-in.html version="v22.2" %} You can grant a user the `EXTERNALIOIMPLICITACCESS` [system privilege](security-reference/authorization.html#supported-privileges). This privilege allows a user without the `admin` role to interact with a cloud storage resource using `IMPLICIT` authentication.

The user that runs `BACKUP` to external storage **does** require the [`admin` role](security-reference/authorization.html#admin-role) in the following scenarios:

- Use of a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3.
- [Nodelocal](cockroach-nodelocal-upload.html)

We recommend using [cloud storage for bulk operations](use-cloud-storage-for-bulk-operations.html).

#### Destination permissions

- `BACKUP` requires full read and write permissions to its target destination.
- `BACKUP` does **not** require delete or overwrite permissions to its target destination. This allows `BACKUP` to write to cloud storage buckets that have object locking configured. We recommend enabling [object locking](use-cloud-storage-for-bulk-operations.html#object-locking) in cloud storage buckets to protect the validity of a backup.

For more detail, see [Storage permissions](use-cloud-storage-for-bulk-operations.html#storage-permissions).