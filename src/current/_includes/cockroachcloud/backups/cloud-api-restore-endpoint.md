### Restore from a managed backup

You can use the `/v1/clusters/{destination_cluster_id}/restores` endpoint to restore the contents of a managed backup to a specified destination cluster.

{% if page.name == "managed-backups-advanced.md" %}
On Advanced clusters, restore operations can be performed at the cluster, database, or table level into the same cluster or a different Advanced cluster in the same organization.
{% else %}
On Standard and Basic clusters, restore operations can only be performed into the same cluster where the managed backup is stored. Managed backups can only be restored at the cluster level.
{% endif %}

#### Restore a cluster

{{site.data.alerts.callout_info}}
Before a cluster can be restored from a managed backup, the destination cluster must be completely wiped of data. A cluster restore operation fails if the destination cluster contains any databases/schemas/tables.
{{site.data.alerts.end}}

To restore a cluster to a recent managed backup, send a `POST` request to the `/v1/clusters/{cluster_id}/restores` endpoint of `"type": "CLUSTER"`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "source_cluster_id": "{cluster_id}",
    "type": "CLUSTER"
}'
~~~

By default, the restore job uses the most recent backup stored within the last 7 days on the cluster specified in `source_cluster_id`. To restore a specific backup, include the `backup_id` field and specify a backup ID from the [managed backups list](#view-managed-backups):

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
    "type": "CLUSTER"
}'
~~~

{% if page.name == "managed-backups-advanced.md" %}
To restore a cluster backup into a different cluster, ensure that the destination cluster is created and contains no databases/schemas/tables. Send the restore request to the destination cluster ID, specifying the ID of the source cluster as `source_cluster_id`. Both the source cluster and the destination cluster must use the Advanced plan.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url https://cockroachlabs.cloud/api/v1/clusters/{destination_cluster_id}/restores \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "source_cluster_id": "{source_cluster_id}",
    "type": "CLUSTER"
}'
~~~

You can specify additional options for the restore job in the `restore_opts` object. For more information, see the [API endpoint documentation](https://www.cockroachlabs.com/docs/api/cloud/v1#get-/api/v1/clusters/-cluster_id-/restores-config).

{% endif %}

If the request is successful, the client recieves a JSON response that describes the request operation:

~~~ json
{
  "id": "example-aeb7-4daa-9e2c-eda541765f8a",
  "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
  "status": "PENDING",
  "created_at": "2025-07-25T16:45:14.064208710Z",
  "type": "CLUSTER",
  "completion_percent": 1
}
~~~

{% if page.name == "managed-backups-advanced.md" %}
#### Restore a database

To restore one or more databases from a cluster's managed backup, send a `POST` request to the `/v1/clusters/{cluster_id}/restores` endpoint of `"type": "DATABASE"`. Specify the name of the databases in `objects`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "source_cluster_id": "{cluster_id}",
    "type": "DATABASE",
    "objects": [
        {
            "database": "tpcc"
        },
        {
            "database": "movr"
        }
    ]
}'
~~~

By default, the database is restored into the original database name from the managed backup. To restore the database contents into a new database, include the field `restore_opts.new_db_name` with the new database name. You can only restore one database at a time when using this option.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "source_cluster_id": "{cluster_id}",
    "type": "DATABASE",
    "objects": [
        {
            "database": "tpcc"
        }
    ],
    "restore_opts": {
        "new_db_name": "tpcc2"
    }
}'
~~~

To restore from a specific backup rather than the most recently created managed backup, include the `backup_id` field specifying a backup ID:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
    "type": "DATABASE",
    "objects": [
        {
            "database": "tpcc"
        }
    ]
}'
~~~

To restore a database from a source cluster's managed backup into a different cluster, send the restore request to the destination cluster ID. Specify the ID of the backup's cluster as `source_cluster_id`. Both the source cluster and the destination cluster must use the Advanced plan.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url https://cockroachlabs.cloud/api/v1/clusters/{destination_cluster_id}/restores \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "source_cluster_id": "{source_cluster_id}",
    "type": "DATABASE",
    "objects": [
        {
            "database": "tpcc"
        }
    ]
}'
~~~

You can specify additional options for the restore jobs in the `restore_opts` object. For more information, see the [API endpoint documentation](https://www.cockroachlabs.com/docs/api/cloud/v1#get-/api/v1/clusters/-cluster_id-/restores-config).

If the request is successful, the client recieves a response containing JSON describing the request operation:

~~~ json
{
  "id": "example-aeb7-4daa-9e2c-eda541765f8a",
  "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
  "status": "PENDING",
  "created_at": "2025-07-25T16:45:14.064208710Z",
  "type": "DATABASE",
  "completion_percent": 1
}
~~~

#### Restore a table

To restore a one or more tables from a cluster's managed backup, send a `POST` request to the `/v1/clusters/{cluster_id}/restores` endpoint of `"type": "TABLE"`. Specify the fully qualified name of the source tables in `objects`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "source_cluster_id": "{cluster_id}",
    "type": "TABLE",
    "objects": [
        {
            "database": "tpcc",
            "schema": "public",
            "table": "warehouse"
        },
        {
            "database": "tpcc",
            "schema": "public",
            "table": "customer"
        }
    ]
}'
~~~

By default, the table is restored into the original database name from the managed backup. To restore the table into a different database, include the field `restore_opts.into_db` with the desired database name. The following example restores the `tpcc.public.warehouse` table from the most recent managed backup into `tpcc2.public.warehouse` on the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "source_cluster_id": "{cluster_id}",
    "type": "TABLE",
    "objects": [
        {
            "database": "tpcc",
            "schema": "public",
            "table": "warehouse"
        },
        {
            "database": "tpcc",
            "schema": "public",
            "table": "customer"
        }
    ],
    "restore_opts": {
        "into_db": "tpcc2"
    }
}'
~~~

To restore from a specific backup rather than the most recently created managed backup, include the `backup_id` field specifying a backup ID:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
    "type": "TABLE",
    "objects": [
        {
            "database": "tpcc",
            "schema": "public",
            "table": "warehouse"
        }
    ]
}'
~~~

To restore a table from a source cluster's managed backup into a different cluster, send the restore request to the destination cluster ID. Specify the ID of the backup's cluster as `source_cluster_id`. Both the source cluster and the destination cluster must use the Advanced plan.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url https://cockroachlabs.cloud/api/v1/clusters/{destination_cluster_id}/restores \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "source_cluster_id": "{source_cluster_id}",
    "type": "TABLE",
    "objects": [
        {
            "database": "tpcc",
            "schema": "public",
            "table": "warehouse"
        }
    ]
}'
~~~

You can specify additional options for the restore jobs in the `restore_opts` object. For more information, see the [API endpoint documentation](https://www.cockroachlabs.com/docs/api/cloud/v1#get-/api/v1/clusters/-cluster_id-/restores-config).

If the request is successful, the client recieves a response containing JSON describing the request operation:

~~~ json
{
  "id": "example-aeb7-4daa-9e2c-eda541765f8a",
  "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
  "status": "PENDING",
  "created_at": "2025-07-25T16:45:14.064208710Z",
  "type": "TABLE",
  "completion_percent": 1
}
~~~
{% endif %}

### Get status of a restore job

To view the status of a restore job using the cloud API, send a `GET` request to the `/v1/clusters/{cluster_id}/restores/{restore_id}` endpoint where `restore_id` is the `id` from the JSON response:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores/{restore_id} \
--header "Authorization: Bearer {secret_key}"
~~~

If the request is successful, the client recieves a response containing JSON describing the status of the specified request operation:

~~~ json
{
  "id": "example-aeb7-4daa-9e2c-eda541765f8a",
  "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
  "status": "SUCCESS",
  "created_at": "2025-07-25T16:45:14.064208710Z",
  "type": "CLUSTER",
  "completion_percent": 1
}
~~~