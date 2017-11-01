# Goals

Import data - https://www.cockroachlabs.com/docs/stable/import-data.html

# Presentation

/----------------------------------------/

## Importing Data

If you're migrating data to CockroachDB, you'll (obviously) need to import it.

We provide simple to use tools for migrating data from either:

- `pg_dump`
- CSV

/----------------------------------------/

## Agenda

- Importing from `pg_dump`
- Importing from CSV

/----------------------------------------/

## Importing from `pg_dump`

1. Generate the dump

~~~ shell
$ pg_dump [database] > [filename].sql
~~~ 

/----------------------------------------/

## Importing from `pg_dump`

2. Reformat the SQL file

After generating the `.sql` file, you need to perform a few editing steps before importing it:

- Remove all statements from the file besides the `CREATE TABLE` and `COPY` statements.

- Manually add the table's [`PRIMARY KEY`](primary-key.html#syntax) constraint to the `CREATE TABLE` statement.
      This has to be done manually because PostgreSQL attempts to add the primary key after creating the table, but     CockroachDB requires the primary key be defined upon table creation.

- Review any other [constraints](constraints.html) to ensure they're properly listed on the table.

- Remove any [unsupported elements](sql-feature-support.html).

/----------------------------------------/

## Importing from `pg_dump`

3. Import the data

~~~ shell
$ psql -p [port] -h [node host] -d [database] -U [user] < [file name].sql
~~~

For reference, CockroachDB uses these defaults:

- `[port]`: **26257**
- `[user]`: **root**

/----------------------------------------/

## Importing from CSV

- `IMPORT` statement is currently in experimental status
- Requires CSV to be hosted on remote file server, as well as access to store intermediary data (e.g., AWS)
- A single node converts CSV to `cockroach`-compatible KV data and then distributes import to another remote file server directory
- Single node must have space for whole CSV
- We have docs on it.

/----------------------------------------/

## Recap

You can import data into CockroachDB in two ways:

- `pg_dump` through `psql`, pointed at the running `cockroach process`
- CSV data through `IMPORT` feature
