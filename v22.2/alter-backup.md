---
title: ALTER BACKUP
summary: Use the ALTER BACKUP statement to add new KMS encryption keys to backups.
toc: true
docs_area: reference.sql
---

{% include enterprise-feature.md %}

The `ALTER BACKUP` statement allows for new KMS encryption keys to be applied to an existing chain of encrypted backups ([full](take-full-and-incremental-backups.html#full-backups) and [incremental](take-full-and-incremental-backups.html#incremental-backups)). Each `ALTER BACKUP` statement must include the new KMS encryption key with `NEW_KMS`, and use `WITH OLD_KMS` to refer to at least one of the KMS URIs that were originally used to encrypt the backup.

After an `ALTER BACKUP` statement successfully completes, subsequent [`BACKUP`](backup.html), [`RESTORE`](restore.html), and [`SHOW BACKUP`](show-backup.html) statements can use any of the existing or new KMS URIs to decrypt the backup.

CockroachDB supports AWS and Google Cloud KMS keys. For more detail on encrypted backups and restores, see [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/master/grammar_svg/alter_backup.html %}
</div>

## Parameters

Parameter         | Description
------------------+-------------------------------------------------------------------------------------------------------------------------
`subdirectory`    | The subdirectory containing the target **full** backup at the given `collectionURI`.
`LATEST`          | The most recent backup at the given `collectionURI`.
`collectionURI`   | The URI that holds the backup collection.
`ADD NEW_KMS`     | Apply the new KMS encryption key to the target backup.
`WITH OLD_KMS`    | Reference one of the existing KMS URI(s) originally used to encrypt the backup.
`kmsURI`          | The [URI](take-and-restore-encrypted-backups.html#uri-formats) for the KMS key.

## Required privileges

- `ALTER BACKUP` can only be run by members of the [`admin` role](security-reference/authorization.html#admin-role). By default, the `root` user belongs to the `admin` role.
- `ALTER BACKUP` requires full read and write permissions to the target cloud storage bucket.

The backup collection's URI does **not** require the [`admin` role](security-reference/authorization.html#admin-role) when using `s3` or `gs` using [`SPECIFIED`](use-cloud-storage-for-bulk-operations.html#authentication) credentials. The backup collection's URI **does** require the [`admin` role](security-reference/authorization.html#admin-role) when using `s3` or `gs` with [`IMPLICIT`](use-cloud-storage-for-bulk-operations.html#authentication) credentials.

We recommend using [cloud storage for bulk operations](use-cloud-storage-for-bulk-operations.html).

## Examples

`ALTER BACKUP` will apply the new encryption information to the entire chain of backups ([full](take-full-and-incremental-backups.html#full-backups) and [incremental](take-full-and-incremental-backups.html#incremental-backups)).

{{site.data.alerts.callout_info}}
When running `ALTER BACKUP` with a subdirectory, the statement must point to a [full backup](take-full-and-incremental-backups.html#full-backups) in the backup collection.
{{site.data.alerts.end}}

See [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html) for more detail on authenticating to your cloud storage bucket.

### Add an AWS KMS key to an encrypted backup

To add a new KMS key to the most recent backup:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER BACKUP LATEST IN 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    ADD NEW_KMS = 'aws:///{new-key}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&REGION={location}'
    WITH OLD_KMS = 'aws:///{old-key}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&REGION={location}';
~~~  

To add a new KMS key to a specific backup, issue an `ALTER BACKUP` statement that points to the full backup:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER BACKUP '2022/03/23-213101.37' IN 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    ADD NEW_KMS = 'aws:///{new-key}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&REGION={location}'
    WITH OLD_KMS = 'aws:///{old-key}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&REGION={location}';
~~~  

To list backup directories at a collection's URI, see [`SHOW BACKUP`](show-backup.html).

### Add a Google Cloud KMS key to an encrypted backup

To add a new KMS key to the most recent backup:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER BACKUP LATEST IN 'gs://{BUCKET NAME}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
    ADD NEW_KMS = 'gs:///projects/{project name}/locations/{location}/keyRings/{key ring name}/cryptoKeys/{new key}?AUTH=specified&CREDENTIALS={encoded key}'
    WITH OLD_KMS = 'gs:///projects/{project name}/locations/{location}/keyRings/{key ring name}/cryptoKeys/{old key}?AUTH=specified&CREDENTIALS={encoded key}';
~~~  

To add a new KMS key to a specific backup, issue an `ALTER BACKUP` statement that points to the full backup:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER BACKUP '2022/03/23-213101.37' IN 'gs://{BUCKET NAME}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
    ADD NEW_KMS = 'gs:///projects/{project name}/locations/{location}/keyRings/{key ring name}/cryptoKeys/{new key}?AUTH=specified&CREDENTIALS={encoded key}'
    WITH OLD_KMS = 'gs:///projects/{project name}/locations/{location}/keyRings/{key ring name}/cryptoKeys/{old key}?AUTH=specified&CREDENTIALS={encoded key}';
~~~  

To list backup directories at a collection's URI, see [`SHOW BACKUP`](show-backup.html).

## See also

- [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
