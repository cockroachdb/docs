# Goals

"Start with open-source version (dump). Not suitable for large clusters. Slow.
Move to enterprise backup/restore. Explain license. 
Create a ""training"" org and azure bucket for lab."

# Presentation

/----------------------------------------/

## Agenda

- What is it?
- CockroachDB Core (OSS) Backup
- CockroachDB Enterprise (CCL) Backup

/----------------------------------------/

## What is it?

- Savepoint to fix human errors
- CockroachDB is survivable, so less interesting for DR

/----------------------------------------/

## Core Backup

~~~ sql
cockroach dump <database> <table> <table...> <flags>
~~~

Creates a familiar dump file, but in appropriate for large clusters

/----------------------------------------/

## Enterprise Backup

- Not OSS; uses CCL license
- Requires enterprise license to use CCL features in production

/----------------------------------------/

## Enterprise Backup

- Distributes work to all nodes
- Stores backup file on cloud host (e.g. S3)
- To alleviate possible contentions use `AS OF SYSTEM TIME`

~~~ sql
> BACKUP <database.table> TO 'azure://acme-co-backup/table-customer-2017-03-27-full?AWS_ACCESS_KEY_ID=hash&AWS_SECRET_ACCESS_KEY=hash'
AS OF SYSTEM TIME '2017-06-09 16:13:55.571516+00:00';
~~~

/----------------------------------------/

## Enterprise Backup

Supports incremental backups using a full backup as a base:

~~~
BACKUP DATABASE bank TO 'azure://acme-co-backup/database-bank-2017-03-29-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
INCREMENTAL FROM 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-28-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AS OF SYSTEM TIME '2017-06-09 16:13:55.571516+00:00'
~~~

/----------------------------------------/

# Lab