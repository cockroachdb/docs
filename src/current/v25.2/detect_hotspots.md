---
title: Detect Hotspots
summary: Learn how to detect hotspots using real-time monitoring and historical logs in CockroachDB.
toc: true
---

This page provides practical guidance on identifying common [hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}) in CockroachDB clusters, using real-time monitoring and historical logs.

```
[Start]
   |
[Is there a KV Latch Contention Alert?]
   |
   |-- Yes --> [Does popular key log exist?]
   |             |
   |             |-- Yes (write hotspot) --> [(A) Find hot ranges log, find table index] → [Mitigate hot key (find queries and refactor app)]
   |             |
   |             |-- No  --> [Some other reason for latch contention]
   |
   |
   |-- No  --> [Is there a CPU metrics Alert?]
                  |
                  |-- Yes --> [Does popular key log exist?]
                                |
                                |-- Yes (read hotspot) → [Go to (A) Find hot ranges log]
                                |
                                |-- No --> [Does clear access log exist?]
                                             |                                
                                             |-- Yes --> [(B) Find hot ranges log, find table index] → [Mitigate hot index (change schema)]
                                             |
                                             |-- No  --> [Some other reason for CPU skew]
```

This guide helps diagnose and mitigate issues related to KV latch contention and CPU usage alerts in a CockroachDB cluster. Use this workflow to identify potential hotspots and optimize query and schema performance.

## Before you begin

- Ensure you have access to the DB Console and relevant logs.
- Confirm that you have the necessary permissions to view metrics and modify the application or schema.

## Troubleshooting Steps

### 1. Check for KV Latch Contention Alert

If a KV latch contention alert is triggered:

- **Check if a popular key log exists:**
  - **Yes (write hotspot):**
    1. Locate the hot ranges log.
    2. Identify the associated table and index.
    3. Mitigate the hot key:
       - Locate queries that target the hotspot.
       - Refactor the application logic to distribute the load more evenly.
  - **No:**
    - Investigate other potential causes of latch contention.

If no KV latch contention alert is present, proceed to the next step.

### 2. Check for CPU Metrics Alert

If a CPU metrics alert is triggered:

- **Check if a popular key log exists:**
  - **Yes (read hotspot):**
    - Refer to the steps above:
      1. Locate the hot ranges log.
      2. Identify the associated table and index.
      3. Mitigate the hot key:
         - Locate queries that target the hotspot.
         - Refactor the application logic.

- **If no popular key log exists, check for a clear access log:**
  - **Yes (hot index):**
    1. Locate the hot ranges log.
    2. Identify the associated table and index.
    3. Mitigate the hot index:
       - Modify the schema to balance index usage, such as splitting or reorganizing indexes.

  - **No:**
    - Investigate other potential causes of CPU skew.

If no CPU metrics alert is present, no further action is needed.