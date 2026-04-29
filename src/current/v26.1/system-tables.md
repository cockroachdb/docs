---
title: sql/pgcatalog: add missing pg_catalog tables from Postgres 18
summary: `pg_catalog.pg_aios`
toc: true
docs_area: reference.sql
---

### `pg_catalog.pg_aios`
**Description**: Provides information about asynchronous I/O operations. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_aios;
```

### `pg_catalog.pg_backend_memory_contexts`
**Description**: Shows information about memory contexts used by backend processes. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_backend_memory_contexts;
```

### `pg_catalog.pg_ident_file_mappings`
**Description**: Contains mappings from external authentication system usernames to database usernames as defined in the pg_ident.conf file. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_ident_file_mappings;
```

### `pg_catalog.pg_parameter_acl`
**Description**: Stores access control lists (ACLs) for configuration parameters, controlling which users can modify specific server parameters. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_parameter_acl;
```

### `pg_catalog.pg_publication_namespace`
**Description**: Maps logical replication publications to schemas/namespaces. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_publication_namespace;
```

### `pg_catalog.pg_shmem_allocations_numa`
**Description**: Provides information about shared memory allocations with NUMA (Non-Uniform Memory Access) topology details. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_shmem_allocations_numa;
```

### `pg_catalog.pg_stat_checkpointer`
**Description**: Shows statistics about the checkpointer process activity. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_stat_checkpointer;
```

### `pg_catalog.pg_stat_io`
**Description**: Provides I/O statistics for different backend types and contexts. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_stat_io;
```

### `pg_catalog.pg_stat_progress_copy`
**Description**: Shows progress information for running COPY operations. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_stat_progress_copy;
```

### `pg_catalog.pg_stat_recovery_prefetch`
**Description**: Contains statistics about prefetch activity during recovery operations. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_stat_recovery_prefetch;
```

### `pg_catalog.pg_stat_replication_slots`
**Description**: Shows statistics for replication slots, including information about slot usage and lag. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_stat_replication_slots;
```

### `pg_catalog.pg_stat_subscription_stats`
**Description**: Provides statistics about logical replication subscription activity. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_stat_subscription_stats;
```

### `pg_catalog.pg_stat_wal`
**Description**: Shows statistics about Write-Ahead Log (WAL) activity. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_stat_wal;
```

### `pg_catalog.pg_stats_ext_exprs`
**Description**: Contains statistics for expressions used in extended statistics objects. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_stats_ext_exprs;
```

### `pg_catalog.pg_wait_events`
**Description**: Describes the available wait events that can be monitored in the system. This table was created for PostgreSQL compatibility and is currently unimplemented in CockroachDB.
**Columns**: [NEEDS REVIEW - Column structure not available in diff]
**Example**: 
```sql
SELECT * FROM pg_catalog.pg_wait_events;
```

**Note**: All of these tables are currently unimplemented stub tables created for PostgreSQL 18 compatibility. They will return empty results when queried but allow applications expecting these PostgreSQL system tables to function without errors.
