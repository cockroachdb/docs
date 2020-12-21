You can encrypt full or incremental backups with a passphrase by using the [`encryption_passphrase` option](backup.html#with-encryption-passphrase). Files written by the backup (including `BACKUP` manifests and data files) are encrypted using the specified passphrase to derive a key. To restore the encrypted backup, the same `encryption_passphrase` option (with the same passphrase) must be included in the [`RESTORE`](restore.html) statement.

When used with [incremental backups](backup.html#incremental-backups), the `encryption_passphrase` option is applied to all the [backup file URLs](backup.html#backup-file-urls), which means the same passphrase must be used when appending another incremental backup to an existing backup. Similarly, when used with [locality-aware backups](take-and-restore-locality-aware-backups.html), the passphrase provided is applied to files in all localities.

Encryption is done using [AES-256-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode), and GCM is used to both encrypt and authenticate the files. A random [salt](https://en.wikipedia.org/wiki/Salt_(cryptography)) is used to derive a once-per-backup [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) key from the specified passphrase, and then a random [initialization vector](https://en.wikipedia.org/wiki/Initialization_vector) is used per-file. CockroachDB uses [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) with 64,000 iterations for the key derivation.

{{site.data.alerts.callout_info}}
`BACKUP` and `RESTORE` will use more memory when using encryption, as both the plain-text and cipher-text of a given file are held in memory during encryption and decryption.
{{site.data.alerts.end}}

For an example of an encrypted backup, see [Create an encrypted backup](take-and-restore-encrypted-backups.html#take-an-encrypted-backup-using-a-passphrase).
