Define the connection strings for the [source](#source-connection-string) and [target](#target-connection-string) databases, and keep them [secure](#secure-connections).

#### Source connection string

The `--source` flag specifies the connection string for the source database:

{% if page.name != "migrate-bulk-load.md" %}
{{site.data.alerts.callout_info}}
The source connection **must** point to the primary instance (PostgreSQL primary, MySQL primary/master, or Oracle primary). Replicas cannot provide the necessary replication checkpoints and transaction metadata required for ongoing replication.
{{site.data.alerts.end}}
{% endif %}

<section class="filter-content" markdown="1" data-scope="postgres">
~~~
--source 'postgres://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full'
~~~

For example:

~~~
--source 'postgres://migration_user:password@localhost:5432/migration_db?sslmode=verify-full'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
~~~
--source 'mysql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full&sslcert={path_to_client_crt}&sslkey={path_to_client_key}&sslrootcert={path_to_ca_crt}'
~~~

For example:

~~~
--source 'mysql://migration_user:password@localhost/migration_db?sslcert=.%2fsource_certs%2fclient.root.crt&sslkey=.%2fsource_certs%2fclient.root.key&sslmode=verify-full&sslrootcert=.%2fsource_certs%2fca.crt'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
~~~
--source 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~

In [Oracle Multitenant](https://docs.oracle.com/en/database/oracle/oracle-database/21/cncpt/CDBs-and-PDBs.html), `--source` specifies the connection string for the PDB. `--source-cdb` specifies the connection string for the CDB. The username specified in both `--source` and `--source-cdb` must be a common user with the privileges described in [Create migration user on source database](#create-migration-user-on-source-database).

~~~
--source 'oracle://{username}:{password}@{host}:{port}/{PDB_service_name}'
--source-cdb 'oracle://{username}:{password}@{host}:{port}/{CDB_service_name}'
~~~

Escape the `C##` prefix in the Oracle Multitenant username. For example, write `C##MIGRATION_USER` as `C%23%23`:

~~~
--source 'oracle://C%23%23MIGRATION_USER:password@host:1521/ORCLPDB1'
--source-cdb 'oracle://C%23%23MIGRATION_USER:password@host:1521/ORCLCDB'
~~~
</section>

#### Target connection string

The `--target` flag specifies the connection string for the target CockroachDB database:

~~~
--target 'postgres://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full'
~~~

For example:

~~~
--target 'postgres://crdb_user:password@localhost:26257/defaultdb?sslmode=verify-full'
~~~

For details, refer to [Connect using a URL]({% link {{site.current_cloud_version}}/connection-parameters.md %}#connect-using-a-url).

#### Secure connections

{% include molt/molt-secure-connection-strings.md %}