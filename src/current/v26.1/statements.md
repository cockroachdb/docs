---
title: SHOW RANGES enhancements
summary: SHOW RANGES
toc: true
docs_area: reference.sql
---

## SHOW RANGES

### Synopsis

The `SHOW RANGES` statement now supports additional filtering options.

### Parameters

| Parameter | Description |
|-----------|-------------|
| `FROM TABLE` | Show ranges for a specific table |
| `FROM INDEX` | Show ranges for a specific index |

### Examples

```sql
SHOW RANGES FROM TABLE my_table;
```
