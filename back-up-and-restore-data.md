---
title: Back Up & Restore Data
summary: Learn how to back up and restore a CockroachDB cluster.
toc: false
---

CockroachDB offers the following methods to back up and restore your cluster's data:

## Back Up Data

- [`cockroach dump`](sql-dump.html), which is a CLI command to dump/export your database's schema and table data.
- [`BACKUP`](backup.html) (*enterprise license only*), which is a SQL statement that backs up your cluster to cloud or network file storage.

## Restore Data

- [Import data](import-data.html) from multiple file types (CockroachDB-generated dumps).
- [`RESTORE`](restore.html) (*enterprise license only*), which is a SQL statement to restore your cluster using backups from cloud or network file storage.
