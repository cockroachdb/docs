---
title: Migrate CockroachDB Schemas with Alembic
summary: Learn how to use Alembic with a CockroachDB cluster.
toc: true
docs_area: develop
---

This page guides you through a series of simple database schema changes using the [Alembic](https://alembic.sqlalchemy.org/en/latest/) schema migration module with a simple Python application built on SQLAlchemy and CockroachDB.

For a detailed tutorial about using Alembic, see [the Alembic documentation site](https://alembic.sqlalchemy.org/en/latest/tutorial.html).

For information about specific migration tasks, see Alembic's [Cookbook](https://alembic.sqlalchemy.org/en/latest/cookbook.html).

## Before you begin

Before you begin the tutorial, [install CockroachDB](install-cockroachdb.html).

## Step 1. Start a cluster and create a database

1. Start a [demo cluster](cockroach-demo.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo --no-example-database
    ~~~

    This command creates a virtual cluster and opens a SQL shell to that cluster.

    {{site.data.alerts.callout_info}}
    Leave this terminal window open for the duration of the tutorial. Closing the window will destroy the cluster and erase all data in it.
    {{site.data.alerts.end}}

1. Create the `bank` database:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

## Step 2. Get the application code

1. Open a new terminal, and clone the [`example-app-python-sqlalchemy`](https://github.com/cockroachlabs/example-app-python-sqlalchemy) GitHub repository:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ git clone git@github.com:cockroachlabs/example-app-python-sqlalchemy.git
    ~~~

## Step 3. Install and initialize Alembic

1. Navigate to the `example-app-python-sqlalchemy` project directory, and run the following commands to create and start a virtual environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python3 -m venv env
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ source env/bin/activate
    ~~~

1. Install the `alembic`, [`sqlalchemy-cockroachdb`](https://github.com/cockroachdb/sqlalchemy-cockroachdb), and [`psycopg2`](https://github.com/psycopg/psycopg2/) modules to the virtual environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pip install sqlalchemy-cockroachdb psycopg2-binary alembic
    ~~~

    The `sqlalchemy-cockroachdb` and `psycopg2-binary` modules are required to use the CockroachDB adapter that the app uses to run transactions against a CockroachDB cluster.

    `alembic` includes the `sqlalchemy` module, which is a primary dependency of the `example-app-python-sqlalchemy` sample app. The `alembic` install also includes the `alembic` command line tool, which we use throughout the tutorial to manage migrations.

1. Use the `alembic` command-line tool to initialize Alembic for the project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ alembic init alembic
    ~~~

    ~~~
    Creating directory /path/example-app-python-
    sqlalchemy/alembic ...  done
    Creating directory /path/example-app-python-
    sqlalchemy/alembic/versions ...  done
    Generating /path/example-app-python-
    sqlalchemy/alembic/script.py.mako ...  done
    Generating /path/example-app-python-
    sqlalchemy/alembic/env.py ...  done
    Generating /path/example-app-python-
    sqlalchemy/alembic/README ...  done
    Generating /path/example-app-python-
    sqlalchemy/alembic.ini ...  done
    Please edit configuration/connection/logging settings in
    '/path/example-app-python-sqlalchemy/alembic.ini' before
    proceeding.
    ~~~

    This command creates a migrations directory called `alembic`. This directory will contain the files that specify the schema migrations for the app.

    The command also creates a properties file called `alembic.ini` at the top of the project directory.

1. Open `alembic.ini` and update the `sqlalchemy.url` property to specify the correct connection string to your database:

    For example:

    ~~~
    sqlalchemy.url = cockroachdb://demo:demo72529@127.0.0.1:26257/bank?sslmode=require
    ~~~

    {{site.data.alerts.callout_info}}
    You must use the `cockroachdb://` prefix in the connection string for SQLAlchemy to make sure the CockroachDB dialect is used. Using the `postgresql://` URL prefix to connect to your CockroachDB cluster will not work.
    {{site.data.alerts.end}}

## Step 4. Create and run a migration script

1. Use the `alembic` command-line tool to create the first migration script:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ alembic revision -m "create accounts table"
    ~~~

    ~~~
    Generating /path/example-app-python-sqlalchemy/alembic/versions/ad72c7ec8b22_create_accounts_table.py ...  done
    ~~~

1. Open the newly-created migration file (`alembic/versions/ad72c7ec8b22_create_accounts_table.py`, in this case), and edit the `upgrade()` and `downgrade()` functions to read as follows:

    {% include_cached copy-clipboard.html %}
    ~~~ python
    def upgrade():
        op.create_table(
            'accounts',
            sa.Column('id', sa.dialects.postgresql.UUID, primary_key=True),
            sa.Column('balance', sa.Integer),
        )


    def downgrade():
        op.drop_table('accounts')
    ~~~

    Running this migration creates the `accounts` table, with an `id` column and a `balance` column.

    Note that this file also specifies an operation for "downgrading" the migration. In this case, downgrading will drop the `accounts` table, effectively reversing the schema changes of the migration.

1. Use the `alembic` tool to run this first migration:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ alembic upgrade head
    ~~~

    ~~~
    INFO  [alembic.runtime.migration] Context impl CockroachDBImpl.
    INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
    INFO  [alembic.runtime.migration] Running upgrade  -> ad72c7ec8b22, create accounts table
    ~~~

    Specifying `head` runs the latest migration. This migration will create the `accounts` table. It will also create a table called `alembic_version`, which tracks the current migration version of the database.

## Step 5. Verify the migration

1. Open the terminal with the SQL shell to your demo cluster, and verify that the table was successfully created:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > USE bank;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES;
    ~~~

    ~~~
      schema_name |   table_name    | type  | owner | estimated_row_count | locality
    --------------+-----------------+-------+-------+---------------------+-----------
      public      | accounts        | table | demo  |                   0 | NULL
      public      | alembic_version | table | demo  |                   1 | NULL
    (2 rows)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM alembic_version;
    ~~~

    ~~~
      version_num
    ----------------
      ad72c7ec8b22
    (1 row)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW COLUMNS FROM accounts;
    ~~~

    ~~~
      column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
    --------------+-----------+-------------+----------------+-----------------------+-----------+------------
      id          | UUID      |    false    | NULL           |                       | {primary} |   false
      balance     | INT8      |    true     | NULL           |                       | {primary} |   false
    (2 rows)
    ~~~

1. In a different terminal, set the `DATABASE_URL` environment variable to the connection string for your cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL=cockroachdb://demo:demo72529@127.0.0.1:26257/bank?sslmode=require
    ~~~

    The sample app reads in `DATABASE_URL` as the connection string to the database.

1. Run the app to insert, update, and delete rows of data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python main.py
    ~~~

    ~~~
    Creating new accounts...
    Created new account with id e9b4a9da-fbbb-40de-8c44-60c5c741764d and balance 93911.
    Created new account with id 34a6b5d6-0f08-4435-89cb-c7fa30037926 and balance 989744.
    ...
    Created new account with id 18a7a209-72c3-48b6-986c-2631fff38274 and balance 969474.
    Created new account with id 68e73209-fe2e-42db-a54e-c9d101990cdc and balance 382471.
    Random account balances:
    Account 9acbf774-3e22-4d75-aee0-37e63d3b1ab6: 403963
    Account 82451815-3a87-4d67-a9b0-7766726abd31: 315597
    Transferring 201981 from account 9acbf774-3e22-4d75-aee0-37e63d3b1ab6 to account 82451815-3a87-4d67-a9b0-7766726abd31...
    Transfer complete.
    New balances:
    Account 9acbf774-3e22-4d75-aee0-37e63d3b1ab6: 201982
    Account 82451815-3a87-4d67-a9b0-7766726abd31: 517578
    Deleting existing accounts...
    Deleted account 13d1b940-9a7b-47d6-b719-6a2b49a3b08c.
    Deleted account 6958f8f9-4d38-424c-bf41-5673f20169b1.
    Deleted account c628bd7f-3054-4cd6-b2c9-8c2e3def1720.
    Deleted account f4268300-6d0a-4d6e-9489-ad30f215d1ad.
    Deleted account feae4e4a-c003-4c29-b672-5422438a885b.
    ~~~

## Step 6. Add additional migrations

Suppose you want to add a new [computed column](computed-columns.html) to the `accounts` table that tracks which accounts are overdrawn.

1. Create a new migration with the `alembic` tool:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ alembic revision -m "add overdrawn column"
    ~~~

    ~~~
    Generating /path/example-app-python-sqlalchemy/alembic/versions/fd88c68af7b5_add_overdrawn_column.py ...  done
    ~~~

1. Open the migration file (`alembic/versions/fd88c68af7b5_add_overdrawn_column.py`), update the imports, and edit the `upgrade()` and `downgrade()` functions:

    ~~~ python
    from alembic import op
    from sqlalchemy import Column, Boolean, Computed

    ...

    def upgrade():
        op.add_column('accounts', sa.Column('overdrawn', Boolean, Computed('CASE WHEN balance < 0 THEN True ELSE False END')))


    def downgrade():
        op.drop_column('accounts', 'overdrawn')
    ~~~

1. Use the `alembic` tool to run the migration.

    Because this is the latest migration, you can specify `head`, or you can use the migration's ID (`fd88c68af7b5`):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ alembic upgrade fd88c68af7b5
    ~~~

    ~~~
    INFO  [alembic.runtime.migration] Context impl CockroachDBImpl.
    INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
    INFO  [alembic.runtime.migration] Running upgrade ad72c7ec8b22 -> fd88c68af7b5, add_overdrawn_column
    ~~~

1. In the terminal with the SQL shell to your demo cluster, verify that the column was successfully created:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW COLUMNS FROM accounts;
    ~~~

    ~~~
      column_name | data_type | is_nullable | column_default |             generation_expression              |  indices  | is_hidden
    --------------+-----------+-------------+----------------+------------------------------------------------+-----------+------------
      id          | UUID      |    false    | NULL           |                                                | {primary} |   false
      balance     | INT8      |    true     | NULL           |                                                | {primary} |   false
      overdrawn   | BOOL      |    true     | NULL           | CASE WHEN balance < 0 THEN true ELSE false END | {primary} |   false
    (3 rows)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM accounts;
    ~~~

    ~~~
                       id                  | balance | overdrawn
    ---------------------------------------+---------+------------
      01894212-7f32-4e4c-b855-146630d928bc |  548554 |   false
      033131cf-7c42-4021-9a53-f8a7597ec853 |  828874 |   false
      041a2c5d-0bce-4ed4-a91d-a9e3a6e06632 |  768526 |   false
      080be3a3-40f8-40c6-a0cc-a61c108db3f5 |  599729 |   false
      08503245-ba1a-4255-8ca7-22b3688e69dd |    7962 |   false
      ...
    ~~~

    The changes will also be reflected in the `alembic_version` table.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM alembic_version;
    ~~~

    ~~~
      version_num
    ----------------
      fd88c68af7b5
    (1 row)
    ~~~

## Execute Raw SQL with Alembic

While [Alembic supports most SQL operations](https://alembic.sqlalchemy.org/en/latest/ops.html), you can always execute raw SQL using the `execute()` operation.

{{site.data.alerts.callout_success}}
Executing DDL statements as raw SQL can be particularly helpful when using SQL syntax for DDL statements specific to CockroachDB, like [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-primary-key.html) or [`ALTER TABLE ... SET LOCALITY`](set-locality.html) statements.
{{site.data.alerts.end}}

For example, the raw SQL for the second migration would look something like this:

~~~ sql
ALTER TABLE accounts ADD COLUMN overdrawn BOOLEAN AS (
  CASE
    WHEN balance < 0 THEN True
    ELSE False
  END
) STORED;
~~~

To make the second migration use raw SQL instead of Alembic operations, open `alembic/versions/fd88c68af7b5_add_overdrawn_column.py`, and edit the `upgrade()` function to use `execute()` instead of the operation-specific function:

~~~ python
def upgrade():
    op.execute(text("""ALTER TABLE accounts ADD COLUMN overdrawn BOOLEAN AS (
                        CASE
                            WHEN balance < 0 THEN True
                            ELSE False
                        END
                        ) STORED;"""))
~~~

Before running this migration, downgrade the original migration:

{% include_cached copy-clipboard.html %}
~~~ shell
$ alembic downgrade -1
~~~

~~~
INFO  [alembic.runtime.migration] Context impl CockroachDBImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running downgrade fd88c68af7b5 -> ad72c7ec8b22, add_overdrawn_column
~~~

Then, in the SQL shell to the demo cluster, verify that the `overdrawn` column has been dropped from the table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM accounts;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  balance     | INT8      |    true     | NULL           |                       | {primary} |   false
(2 rows)
~~~

Now, run the updated migration script:

{% include_cached copy-clipboard.html %}
~~~ shell
$ alembic upgrade fd88c68af7b5
~~~

~~~
INFO  [alembic.runtime.migration] Context impl CockroachDBImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade ad72c7ec8b22 -> fd88c68af7b5, add_overdrawn_column
~~~

And verify that the column has been added to the table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM accounts;
~~~

~~~
  column_name | data_type | is_nullable | column_default |             generation_expression              |  indices  | is_hidden
--------------+-----------+-------------+----------------+------------------------------------------------+-----------+------------
  id          | UUID      |    false    | NULL           |                                                | {primary} |   false
  balance     | INT8      |    true     | NULL           |                                                | {primary} |   false
  overdrawn   | BOOL      |    true     | NULL           | CASE WHEN balance < 0 THEN true ELSE false END | {primary} |   false
(3 rows)
~~~

## Auto-generate a Migration

Alembic can automatically generate migrations, based on changes to the models in your application source code.

Let's use the same example `overdrawn` computed column from above.

First, downgrade the `fd88c68af7b5` migration:

{% include_cached copy-clipboard.html %}
~~~ shell
$ alembic downgrade -1
~~~

~~~
INFO  [alembic.runtime.migration] Context impl CockroachDBImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running downgrade fd88c68af7b5 -> ad72c7ec8b22, add_overdrawn_column
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM accounts;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  balance     | INT8      |    true     | NULL           |                       | {primary} |   false
(2 rows)
~~~

Delete the old migration file:
{% include_cached copy-clipboard.html %}
~~~ shell
rm alembic/versions/fd88c68af7b5_add_overdrawn_column.py
~~~

Open the `models.py` file in the app's project, and add the `overdrawn` column to the `Account` class definition:

~~~ python
from sqlalchemy import Column, Integer, Boolean, Computed

...

class Account(Base):
    """The Account class corresponds to the "accounts" database table.
    """
    __tablename__ = 'accounts'
    id = Column(UUID(as_uuid=True), primary_key=True)
    balance = Column(Integer)
    overdrawn = Column('overdrawn', Boolean, Computed('CASE WHEN balance < 0 THEN True ELSE False END'))
~~~

Then, open the `alembic/env.py` file, and add the following import to the top of the file:

~~~ python
from ..models import Base
~~~

And update the variable `target_metadata` to read as follows:

~~~ python
target_metadata = Base.metadata
~~~

These two lines import the database model metadata from the app.

Use the `alembic` command-line tool to auto-generate the migration from the models defined in the app:

{% include_cached copy-clipboard.html %}
~~~ shell
$ alembic revision --autogenerate -m "add overdrawn column"
~~~

~~~
INFO  [alembic.runtime.migration] Context impl CockroachDBImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.autogenerate.compare] Detected added column 'accounts.overdrawn'
  Generating /path/example-app-python-sqlalchemy/alembic/versions/44fa7043e441_add_overdrawn_column.py ...  done
~~~

Alembic creates a new migration file (`44fa7043e441_add_overdrawn_column.py`, in this case).

If you open this file, you'll see that it looks very similar to the one you manually created earlier in the tutorial.

~~~ python
...
def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('accounts', sa.Column('overdrawn', sa.Boolean(), sa.Computed('CASE WHEN balance < 0 THEN True ELSE False END', ), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('accounts', 'overdrawn')
    # ### end Alembic commands ###
~~~

Run the migration:


{% include_cached copy-clipboard.html %}
~~~ shell
$ alembic upgrade 44fa7043e441
~~~

~~~
INFO  [alembic.runtime.migration] Context impl CockroachDBImpl.
INFO  [alembic.runtime.migration] Will assume non-transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade ad72c7ec8b22 -> 44fa7043e441, add overdrawn column
~~~

Verify that the new column exists in the `accounts` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM accounts;
~~~

~~~
  column_name | data_type | is_nullable | column_default |             generation_expression              |  indices  | is_hidden
--------------+-----------+-------------+----------------+------------------------------------------------+-----------+------------
  id          | UUID      |    false    | NULL           |                                                | {primary} |   false
  balance     | INT8      |    true     | NULL           |                                                | {primary} |   false
  overdrawn   | BOOL      |    true     | NULL           | CASE WHEN balance < 0 THEN true ELSE false END | {primary} |   false
(3 rows)
~~~

## Report Issues with Alembic and CockroachDB

If you run into problems, please file an issue in the [`alembic` repository](https://github.com/sqlalchemy/alembic/issues), including the following details about the environment where you encountered the issue:

- CockroachDB version ([`cockroach version`](cockroach-version.html))
- Alembic version
- Operating system
- Steps to reproduce the behavior

## See Also

- [`cockroach demo`](cockroach-demo.html)
- [Alembic documentation](https://alembic.sqlalchemy.org/en/latest/)
- [`alembic` GitHub repository](https://github.com/sqlalchemy/alembic)
- [Client connection parameters](connection-parameters.html)
- [Third-Party Database Tools](third-party-database-tools.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
