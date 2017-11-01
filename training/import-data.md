---
title: Importing Data to Your Cluster
summary: Learn how to import data from pg_dump and CSV files into your CockroachDB cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vRg_445dWS0Ag1Ta3jdMdyfyOIvpP72U0W3XklF8ScJmUlLkdezZUy7JK1jca3A5fWoZiEpq8iu_OMd/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

#### URL for comments

[Importing Data to Your Cluster](https://docs.google.com/presentation/d/13yXxi-7AktFMzq6UlteD7CejTdQE-HLWKXKyUqeebgM/)

## Lab

In this lab, we'll download a dump from PostgreSQL (generated with `pg_dump`), clean it, and then import it into CockroachDB.

### Before You Begin

To complete this lab, you should have a [local cluster of 3 nodes](3-node-local-insecure-cluster.html).

### Step 1. Download Postgres Dump

Download our prepared [PostgreSQL dump file](pg_dump.sql).

### Step 2. Clean Up Dump File

1. Remove all statements from the file besides the `CREATE TABLE` and `COPY` statements.
2. Manually add the table's [`PRIMARY KEY`](/stable/primary-key.html#syntax) constraint to the `CREATE TABLE` statement.
  This has to be done manually because PostgreSQL attempts to add the primary key after creating the table, but CockroachDB requires the primary key be defined upon table creation.
3. Review any other [constraints](/stable/constraints.html) to ensure they're properly listed on the table.
4. Remove any [unsupported elements](/stable/sql-feature-support.html).

### Step 3. Import Dump

~~~ shell
$ psql -p [port] -h [node host] -d [database] -U [user] < pg_dump.sql
~~~

For reference, CockroachDB uses these defaults:

- `[port]`: **26257**
- `[user]`: **root**

## Up Next

- [Identity and Access Management](identity-and-access-management.html)
