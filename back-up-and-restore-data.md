---
title: Back Up & Restore Data
summary: Learn how to back up and restore a CockroachDB cluster.
toc: false
---

CockroachDB offers the following methods to back up and restore your cluster's data.

## Back Up Data

To create backups, CockroachDB supports:

- [`cockroach dump`](sql-dump.html), which is a CLI command to dump/export your database's schema and table data to a `.sql` file.
- [`BACKUP`](backup.html) (*[enterprise license](https://www.cockroachlabs.com/pricing/) only*), which is a SQL statement that backs up your cluster to cloud or network file storage.

### Details

We recommend creating daily backups of your data as an operational best practice. 

However, because CockroachDB is designed with high fault tolerance, backups are primarily needed for disaster recovery (i.e. if your cluster loses a majority of its nodes). Isolated issues (such as small-scale node outages) do not require any intervention.

## Restore Data

How you restore your cluster's data depends on how you backed it up originally:

Backup Type | Restore using...
------------|-----------------
`.sql`, `.csv` | [Import data](import-data.html)
[`BACKUP`](backup.html)<br/>(*[enterprise license](https://www.cockroachlabs.com/pricing/) only*) | [`RESTORE`](restore.html)
