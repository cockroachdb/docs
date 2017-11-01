---
title: Importing Data to Your Cluster
summary: Learn how to import data from pg_dump and CSV files into your CockroachDB cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

## Presentation

[Importing Data to Your Cluster](https://docs.google.com/presentation/d/13yXxi-7AktFMzq6UlteD7CejTdQE-HLWKXKyUqeebgM/)

## Lab

In this lab, we'll download a dump from PostgreSQL (generated with `pg_dump`), clean it, and then import it into CockroachDB.

### Before You Begin

To complete this lab, you should have a [local cluster of 3 nodes](3-node-local-insecure-cluster.html).

### Step 1. Download Postgres Dump

Download our prepared [PostgreSQL dump file](). //TODO(Sean): Create pg_dump for this

### Step 2. Clean Up Dump File

1. Remove all statements from the file besides the `CREATE TABLE` and `COPY` statements.
2. Manually add the table's [`PRIMARY KEY`](primary-key.html#syntax) constraint to the `CREATE TABLE` statement.
  This has to be done manually because PostgreSQL attempts to add the primary key after creating the table, but CockroachDB requires the primary key be defined upon table creation.
3. Review any other [constraints](constraints.html) to ensure they're properly listed on the table.
4. Remove any [unsupported elements](sql-feature-support.html).

### Step 3. Import Dump

~~~ shell
$ psql -p [port] -h [node host] -d [database] -U [user] < [file name].sql
~~~

For reference, CockroachDB uses these defaults:

- `[port]`: **26257**
- `[user]`: **root**

## Up Next

- [Identity and Access Management](identity-and-access-management.html)
