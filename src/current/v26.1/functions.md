---
title: sql: add WITH ZONE option to SHOW RANGES
summary: Built-in Function Reference
toc: true
docs_area: reference.sql
---

# Built-in Function Reference

## `crdb_internal.zone_config_for_key()`

**Category**: System info

**Signature**: `crdb_internal.zone_config_for_key(key BYTES) → JSONB`

**Description**: Returns the fully resolved zone configuration for the range that contains the given key as a JSONB object. The zone configuration includes inheritance from parent zones (e.g., table → database → RANGE DEFAULT). This function is primarily used by `SHOW RANGES WITH ZONE` to display the effective zone configuration for each range.

**Example**:
```sql
-- Get zone config for a specific table's key span
SELECT crdb_internal.zone_config_for_key(crdb_internal.table_span(12345)[1]);

-- Extract the number of replicas from the zone config
SELECT crdb_internal.zone_config_for_key(crdb_internal.table_span(12345)[1])->>'numReplicas';

-- Use with SHOW RANGES WITH ZONE
SELECT start_key, zone_config->>'numReplicas' AS replicas 
FROM [SHOW CLUSTER RANGES WITH ZONE] 
LIMIT 5;
```

## `crdb_internal.zone_config_span_end()`

**Category**: System info

**Signature**: `crdb_internal.zone_config_span_end(key BYTES) → BYTES`

**Description**: Returns the end key of the zone config span that the given key belongs to. For named zones (meta, liveness, timeseries, system, tenants), this returns the next static split point. For table zones, this returns the narrowest applicable boundary: either the next subzone split point within the table (for index/partition-level zone configs) or the table's key span end if no subzone boundaries exist.

**Example**:
```sql
-- Get the zone config span end for a table's start key
SELECT crdb_internal.zone_config_span_end(crdb_internal.table_span(12345)[1]);

-- Check if a table's zone config span matches its key span
SELECT crdb_internal.zone_config_span_end(crdb_internal.table_span(12345)[1]) = crdb_internal.table_span(12345)[2];

-- Use with SHOW RANGES WITH ZONE to see zone conformance
SELECT start_key, zone_config_conformant 
FROM [SHOW CLUSTER RANGES WITH ZONE] 
WHERE NOT zone_config_conformant;
```
