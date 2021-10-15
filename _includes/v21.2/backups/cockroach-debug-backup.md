- `cockroach debug backup` does not support access to [encrypted backups](take-and-restore-encrypted-backups.html).<br>
[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/68283).
- When using the `--start-key` flag with `cockroach debug backup`, it is necessary to pass the accepted formats (`raw`, `hex`, and `bytekey`).<br>
[Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/70178).
