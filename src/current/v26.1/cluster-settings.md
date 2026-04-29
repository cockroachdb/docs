| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `kv.bulk_low_pri_read.max_rate` | byte size | `1` | rate limit (bytes/sec) for disk I/O on behalf of low-priority bulk read operations |
| `kv.bulk_io_write.concurrent_export_requests` | integer | `3` | number of low-priority bulk read requests a store will handle concurrently before queuing [NEEDS REVIEW: setting name suggests export/write but description indicates bulk read requests] |