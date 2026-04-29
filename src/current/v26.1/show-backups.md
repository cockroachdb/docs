---
title: backup: add WITH DEBUG to SHOW BACKUPS
summary: `SHOW BACKUPS`
toc: true
docs_area: reference.sql
---

### `SHOW BACKUPS`
**Synopsis**: 
```sql
SHOW BACKUPS IN location 
  [NEWER THAN timestamp] 
  [OLDER THAN timestamp] 
  [WITH [OPTIONS] (option [, ...])]
```

**Description**: 
Displays information about backups stored in a backup collection. The statement lists available backups with their IDs, backup times, and optional additional metadata depending on the options specified.

**Parameters**:

| Parameter | Description | Required |
|-----------|-------------|----------|
| `location` | The URI of the backup collection to examine | Yes |
| `NEWER THAN timestamp` | Only show backups created after the specified timestamp | No |
| `OLDER THAN timestamp` | Only show backups created before the specified timestamp | No |

**Options**:

| Option | Description |
|--------|-------------|
| `REVISION START TIME` | Include revision start time information in the output |
| `DEBUG` | Include additional debug information such as start time, full subdirectory path, and backup path |

**Examples**:

```sql
-- Show all backups in a collection
SHOW BACKUPS IN 'gs://my-bucket/backups';

-- Show backups with debug information
SHOW BACKUPS IN 'nodelocal://1/backups' WITH DEBUG;

-- Show backups with both debug and revision start time information
SHOW BACKUPS IN 's3://backup-bucket/db-backups' 
  WITH DEBUG, REVISION START TIME;

-- Show recent backups with debug information
SHOW BACKUPS IN 'gs://my-bucket/backups' 
  NEWER THAN '2023-01-01 00:00:00' 
  WITH DEBUG;

-- Alternative syntax with OPTIONS keyword
SHOW BACKUPS IN 'nodelocal://1/backups' 
  WITH OPTIONS (DEBUG, REVISION START TIME);
```

**Required Privileges**: 
The user must have appropriate privileges to access the backup location and read backup metadata.

**Notes**:
- When using `WITH DEBUG`, additional columns are included in the output: `start_time`, `full_subdir`, and `path`
- The `DEBUG` option requires the `use_backups_with_ids` session setting to be enabled
- Debug information includes internal backup paths and subdirectory structures useful for troubleshooting
- The `DEBUG` option can be combined with `REVISION START TIME` for comprehensive backup metadata
