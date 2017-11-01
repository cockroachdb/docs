# Goals

"Start with open-source version (dump). Not suitable for large clusters. Slow.
Move to enterprise backup/restore. Explain license. 
Create a ""training"" org and azure bucket for lab."

# Presentation

/----------------------------------------/

## Restore a Cluster

After creating a backup, you'll want to know how to use it.

/----------------------------------------/

## Agenda

- Core (OSS) Restore
- Enterprise (CCL) Restore

/----------------------------------------/

## Core Restore

Assuming backup is stored as `INSERT`s:

~~~ shell
$ cockroach sql --database=[database name] < statements.sql
~~~

Note: Special process for using `pg_dump` with `COPY`, detailed in docs.

/----------------------------------------/

## Enterprise Restore

Same as `BACKUP`...
- Not OSS; uses CCL license
- Requires enterprise license to use CCL features in production

/----------------------------------------/

## Enterprise Restore

### Full Backup:

RESTORE bank.customers FROM 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';

### Full + Incremental Backup:

RESTORE bank.customers FROM 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-28-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-29-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';

/----------------------------------------/

# Lab