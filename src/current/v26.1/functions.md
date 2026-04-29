---
title: sql: add transaction-level PostgreSQL advisory lock builtins
summary: `pg_advisory_xact_lock()`
toc: true
docs_area: reference.sql
---

## `pg_advisory_xact_lock()`
**Category**: System info
**Signature**: 
- `pg_advisory_xact_lock(key INT8) → VOID`
- `pg_advisory_xact_lock(key1 INT4, key2 INT4) → VOID`

**Description**: Acquires an exclusive transaction-level advisory lock, waiting if necessary. The lock is released automatically at the end of the current transaction (commit or rollback). Only one session can hold an exclusive lock on a given key at a time.

**Examples**:
```sql
-- Acquire exclusive lock with single 64-bit key
SELECT pg_advisory_xact_lock(12345);

-- Acquire exclusive lock with two 32-bit keys
SELECT pg_advisory_xact_lock(123, 456);
```

## `pg_advisory_xact_lock_shared()`
**Category**: System info
**Signature**: 
- `pg_advisory_xact_lock_shared(key INT8) → VOID`
- `pg_advisory_xact_lock_shared(key1 INT4, key2 INT4) → VOID`

**Description**: Acquires a shared transaction-level advisory lock, waiting if necessary. The lock is released automatically at the end of the current transaction (commit or rollback). Multiple sessions can hold shared locks on the same key simultaneously, but shared locks conflict with exclusive locks.

**Examples**:
```sql
-- Acquire shared lock with single 64-bit key
SELECT pg_advisory_xact_lock_shared(12345);

-- Acquire shared lock with two 32-bit keys  
SELECT pg_advisory_xact_lock_shared(123, 456);
```

## `pg_try_advisory_xact_lock()`
**Category**: System info
**Signature**: 
- `pg_try_advisory_xact_lock(key INT8) → BOOL`
- `pg_try_advisory_xact_lock(key1 INT4, key2 INT4) → BOOL`

**Description**: Acquires an exclusive transaction-level advisory lock if available. Returns `true` if the lock was acquired, `false` if it was not. Does not wait if the lock is unavailable. The lock is released automatically at the end of the current transaction.

**Examples**:
```sql
-- Try to acquire exclusive lock with single 64-bit key
SELECT pg_try_advisory_xact_lock(12345);
-- Returns: true (if acquired) or false (if unavailable)

-- Try to acquire exclusive lock with two 32-bit keys
SELECT pg_try_advisory_xact_lock(123, 456);
```

## `pg_try_advisory_xact_lock_shared()`
**Category**: System info
**Signature**: 
- `pg_try_advisory_xact_lock_shared(key INT8) → BOOL`
- `pg_try_advisory_xact_lock_shared(key1 INT4, key2 INT4) → BOOL`

**Description**: Acquires a shared transaction-level advisory lock if available. Returns `true` if the lock was acquired, `false` if it was not. Does not wait if the lock is unavailable. The lock is released automatically at the end of the current transaction.

**Examples**:
```sql
-- Try to acquire shared lock with single 64-bit key
SELECT pg_try_advisory_xact_lock_shared(12345);
-- Returns: true (if acquired) or false (if unavailable)

-- Try to acquire shared lock with two 32-bit keys
SELECT pg_try_advisory_xact_lock_shared(123, 456);

-- Example usage pattern
BEGIN;
SELECT CASE 
  WHEN pg_try_advisory_xact_lock_shared(999) THEN 'Lock acquired'
  ELSE 'Lock unavailable'
END;
COMMIT;
```

**Notes**: 
- All functions are marked as `Volatile` since they modify system state
- These are PostgreSQL compatibility functions that provide advisory locking functionality
- Advisory locks are scoped to the database and use either single 64-bit integer keys or pairs of 32-bit integer keys
- Transaction-level locks are automatically released when the transaction ends, unlike session-level advisory locks
