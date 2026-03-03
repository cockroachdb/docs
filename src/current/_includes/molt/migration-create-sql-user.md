Create a SQL user in the CockroachDB cluster that has the necessary privileges.

To create a user `crdb_user` in the default database (you will pass this username in the [target connection string](#target-connection-string)):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER crdb_user WITH PASSWORD 'password';
~~~

Grant database-level privileges for schema creation within the target database:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT ALL ON DATABASE defaultdb TO crdb_user;
~~~

Grant user privileges to create internal MOLT tables like `_molt_fetch_exceptions` in the `public` CockroachDB schema: 

{{site.data.alerts.callout_info}}
Ensure that you are connected to the target database.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT CREATE ON SCHEMA public TO crdb_user;
~~~

If you manually defined the target tables (which means that [`drop-on-target-and-recreate`](#table-handling-mode) will not be used), grant the following privileges on the schema:

<section class="filter-content" markdown="1" data-scope="postgres oracle">
{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA migration_schema TO crdb_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA migration_schema
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO crdb_user;
~~~

Grant the same privileges for internal MOLT tables in the `public` CockroachDB schema:
</section>

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crdb_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO crdb_user;
~~~

Depending on the MOLT Fetch [data load mode]({% link molt/molt-fetch.md %}#import-into-vs-copy-from) you will use, grant the necessary privileges to run either [`IMPORT INTO`](#import-into-privileges) or [`COPY FROM`](#copy-from-privileges) on the target tables:

#### `IMPORT INTO` privileges

Grant `SELECT`, `INSERT`, and `DROP` (required because the table is taken offline during the `IMPORT INTO`) privileges on all tables being migrated:

<section class="filter-content" markdown="1" data-scope="postgres oracle">
{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT, INSERT, DROP ON ALL TABLES IN SCHEMA migration_schema TO crdb_user;
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT, INSERT, DROP ON ALL TABLES IN SCHEMA public TO crdb_user;
~~~
</section>

If you plan to use [cloud storage with implicit authentication](#cloud-storage-authentication) for data load, grant the `EXTERNALIOIMPLICITACCESS` [system-level privilege]({% link {{site.current_cloud_version}}/security-reference/authorization.md %}#supported-privileges):

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SYSTEM EXTERNALIOIMPLICITACCESS TO crdb_user;
~~~

#### `COPY FROM` privileges

Grant [`admin`]({% link {{site.current_cloud_version}}/security-reference/authorization.md %}#admin-role) privileges to the user:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT admin TO crdb_user;
~~~

{% if page.name contains "delta" %}
#### Replication privileges

Grant permissions to create the staging schema for replication:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER USER crdb_user CREATEDB;
~~~
{% endif %}