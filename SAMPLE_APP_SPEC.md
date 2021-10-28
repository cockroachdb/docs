## CockroachDB Sample Application Specifications

For each [fully-supported driver and ORM framework](https://www.cockroachlabs.com/docs/stable/third-party-database-tools.html), Cockroach Labs needs the following types of sample apps:

- [Hello World](#hello-world)
- [Simple CRUD](#simple-crud)

### General requirements

In addition to the specific requirements listed for each app type, all apps should meet the following requirements:

- The app should be hosted in its own, dedicated repository, in the [`cockroachlabs` org](https://github.com/cockroachlabs). (If the app is developed by an external contributor, a Cockroach Labs employee can take care of this step.)
- The app should be tested against a local cluster with [`cockroach start-single-node`](https://www.cockroachlabs.com/docs/stable/cockroach-start-single-node.html). (Insecure mode is fine.)
- The app should be tested against a [serverless (Free Tier) cluster](https://www.cockroachlabs.com/free-tier/).

After the app is tested locally, the documentation team at Cockroach Labs will create a dedicated tutorial for the app on the [CockroachDB user documentation site](https://www.cockroachlabs.com/docs/stable/example-apps.html). (A tutorial is **not** a sample app requirement.)

### Hello World

#### Purpose

The purpose of the Hello World sample app is to provide a useful example for developers looking to write application code that connects to CockroachDB, using their language and database framework of choice.

#### Functionality

The Hello World app does the following:

- (Optional) Takes a connection string from the standard input.
- Connects to CockroachDB with connection information provided.
- Prints to the console on the status of the connection attempt.

#### Directory structure

Here is a sample directory structure for the Hello World app:

```
.
├── README.md
└── main.*
```

#### Examples

- [hello-world-go-pgx](https://github.com/cockroachlabs/hello-world-go-pgx)
- [hello-world-python-sqlalchemy](https://github.com/cockroachlabs/hello-world-python-sqlalchemy)
- [hello-world-node-postgres](https://github.com/cockroachlabs/hello-world-node-postgres)
- [hello-world-java-jdbc](https://github.com/cockroachlabs/hello-world-java-jdbc)

### Simple CRUD

#### Purpose

The purpose of the Simple CRUD sample app is to provide a useful example for developers looking to write application code that connects to CockroachDB, writes data to the database, and reads data from the database, using their language and database framework of choice.

#### Functionality

The Simple CRUD app does the following:

- (Optional) Takes a connection string from the standard input.
- Connects to CockroachDB with connection information provided.
- (For tools without schema migration support) Executes the [`dbinit` SQL file](#dbinit-sql-file) that initializes the database schema. This can be done with [`cockroach sql` CLI commands](https://www.cockroachlabs.com/docs/stable/cockroach-sql.html#execute-sql-statements-from-a-file).
- (For tools with schema migration support) Initializes the database schema, according to the schema defined in the [`dbinit` SQL file](#dbinit-sql-file).
- Defines functions that execute `INSERT`, `SELECT`, `UPDATE`, and `DELETE` operations against the database.<br>*For ORM frameworks, these functions should not execute raw SQL.*
- Defines a database function wrapper that implements transaction retries.<br>*For some supported tools, CockroachDB provides an adapter that implements automatic, client-side transaction retry handling for you. See [the list of supported tools](https://www.cockroachlabs.com/docs/v21.1/third-party-database-tools.html) for details.*
- Executes database operations, with transaction retries.
- Prints to the console on the status of each database operation.

#### Directory structure

Here is a sample directory structure for the Simple CRUD app:

```
.
├── README.md
├── dbinit.sql (for tools without schema migration support)
└── main.*
```

Note that the directory structure could vary dramatically from what is shown here, depending on the conventions of the application framework you are using.

#### `dbinit` SQL file

For tools without schema migration support, use the following SQL file to initialize the sample app's database:

``` sql
--dbinit.sql

SET sql_safe_updates = FALSE;

USE defaultdb;
DROP DATABASE IF EXISTS bank CASCADE;
CREATE DATABASE IF NOT EXISTS bank;

USE bank;

CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    balance INT8
);
```

#### Examples

- [example-app-go-pgx](https://github.com/cockroachlabs/example-app-go-pgx)
- [example-app-python-sqlalchemy](https://github.com/cockroachlabs/example-app-python-sqlalchemy)
- [example-app-node-postgres](https://github.com/cockroachlabs/example-app-node-postgres)
- [example-app-java-jdbc](https://github.com/cockroachlabs/example-app-java-jdbc)
