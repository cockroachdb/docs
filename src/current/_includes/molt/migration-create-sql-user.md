Create a migration user in the CockroachDB cluster that has the necessary privileges.

To create a user `crdb_user` in the default database (you will pass this username in the [target connection string](#target-connection-string)):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE USER crdb_user WITH PASSWORD '{password}';
~~~

Grant the necessary permissions to run either [`IMPORT INTO`]({% link {{site.current_cloud_version}}/import-into.md %}#required-privileges) or [`COPY FROM`]({% link {{site.current_cloud_version}}/copy.md %}#required-privileges) on the target tables, depending on the MOLT Fetch [data load mode](#data-load-mode)) you will use.

#### `IMPORT INTO` privileges

Grant `SELECT`, `INSERT`, and `DROP` (required because the table is taken offline during the `IMPORT INTO`) privileges on all tables in the [target schema](#create-the-target-schema):

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT, INSERT, DROP ON ALL TABLES IN SCHEMA migration_schema TO crdb_user;
~~~

If you plan to use [cloud storage with implicit authentication](#cloud-storage-authentication) for data load, grant the `EXTERNALIOIMPLICITACCESS` [system-level privilege]({% link {{site.current_cloud_version}}/security-reference/authorization.md %}#supported-privileges):

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT EXTERNALIOIMPLICITACCESS TO crdb_user;
~~~

#### `COPY FROM` privileges

Make the user a member of the [`admin` role]({% link {{site.current_cloud_version}}/security-reference/authorization.md %}#admin-role):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER USER crdb_user WITH ADMIN OPTION;
~~~

<section class="filter-content" markdown="1" data-scope="oracle">
{% if page.name != "migrate-bulk-load.md" %}
#### Replication privileges

Grant permissions to create the staging schema for replication:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT admin TO crdb_user;
~~~
{% endif %}
</section>

