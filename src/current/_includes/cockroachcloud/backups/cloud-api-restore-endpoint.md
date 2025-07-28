### Restore a managed backup

You can use the `/v1/clusters/{cluster_id}/restores` endpoint to restore the contents of a managed backup at the cluster, database, or table level.

{% if page.name == "managed-backups-advanced.md" %}
On Advanced clusters, restore operations can be performed into the same cluster or a different Advanced cluster in the same organization.
{% else %}
On Standard and Basic clusters, restore operations can only be performed into the same cluster where the managed backup is stored.
{% endif %}

#### Restore a cluster

{{site.data.alerts.callout_danger}}
The restore completely erases all data in the destination cluster. All cluster data is replaced with the data from the backup. The destination cluster will be unavailable while the job is in progress.

This operation is disruptive and is to be performed with caution. Use the [Principle of Least Privilege (PoLP)](https://wikipedia.org/wiki/Principle_of_least_privilege) as a golden rule when designing your system of privilege grants.
{{site.data.alerts.end}}

To restore a managed backup of a cluster, send a `POST` request to the `/v1/clusters/{cluster_id}/restores` endpoint of `"type": "CLUSTER"`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url 'https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores' \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "type": "CLUSTER"
}'
~~~

By default the restore operation will use the most recent backup. To restore a specific backup, include the `backup_id` field specifying a backup ID:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url 'https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores' \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
    "type": "CLUSTER"
}'
~~~

{% if page.name == "managed-backups-advanced.md" %}
To restore a cluster backup into a new cluster, first create the target cluster. Send the restore request to the target cluster ID, specifying the ID of the source cluster as `source_cluster_id`. Both the source cluster and the target cluster must use the Advanced plan.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url 'https://cockroachlabs.cloud/api/v1/clusters/{target_cluster_id}/restores' \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "source_cluster_id": "{source_cluster_id}",
    "type": "CLUSTER"
}'
~~~
{% endif %}

You can specify additional options for the restore operations in the `restore_opts` object. For more information, see the [API endpoint documentation](https://www.cockroachlabs.com/docs/api/cloud/v1#get-/api/v1/clusters/-cluster_id-/restores-config).

If the request was successful, the client will receive a response containing JSON describing the request operation:

~~~ json
{
  "id": "example-aeb7-4daa-9e2c-eda541765f8a",
  "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
  "status": "PENDING",
  "created_at": "2025-07-25T16:45:14.064208710Z",
  "type": "CLUSTER",
  "completion_percent": 0
}
~~~

#### Restore a database

To restore a managed backup of a database to a cluster, send a `POST` request to the `/v1/clusters/{cluster_id}/restores` endpoint of `"type": "DATABASE"`. Specify the name of the source database in `objects.database`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url 'https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores' \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "type": "DATABASE",
    "objects": [
        {
            "database": "tpcc"
        }
    ]
}
~~~

By default the database will be restored into the original database name from the cluster backup. To restore the database contents into a new database, include the field `restore_opts.new_db_name` with the new database name:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url 'https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores' \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "type": "DATABASE",
    "objects": [
        {
            "database": "tpcc"
        }
    ],
    "restore_opts": {
        "new_db_name": "tpcc2"
    }
}
~~~

To restore a specific backup rather than the most recently created managed backup, include the `backup_id` field specifying a backup ID:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url 'https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores' \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
    "type": "DATABASE",
    "objects": [
        {
            "database": "tpcc"
        }
    ],
}
~~~

You can specify additional options for the restore operations in the `restore_opts` object. For more information, see the [API endpoint documentation](https://www.cockroachlabs.com/docs/api/cloud/v1#get-/api/v1/clusters/-cluster_id-/restores-config).

If the request was successful, the client will receive a response containing JSON describing the request operation:

~~~ json
{
  "id": "example-aeb7-4daa-9e2c-eda541765f8a",
  "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
  "status": "PENDING",
  "created_at": "2025-07-25T16:45:14.064208710Z",
  "type": "DATABASE",
  "completion_percent": 0
}
~~~

#### Restore a table

To restore a managed backup of a table to a cluster, send a `POST` request to the `/v1/clusters/{cluster_id}/restores` endpoint of `"type": "DATABASE"`. Specify the fully qualified name of the source database in `objects`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url 'https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores' \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "type": "TABLE",
    "objects": [
        {
            "database": "tpcc",
            "schema": "public",
            "table": "warehouse"
        }
    ]
}
~~~

By default the table will be restored into the original database name from the cluster backup. To restore the table into a different database, include the field `restore_opts.into_name` with the database name. The following example restores the `tpcc.public.warehouse` table from the most recent managed backup into `tpcc2.public.warehouse` on the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url 'https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores' \
--header "Authorization: Bearer {secret_key}" \
--json '{
    "type": "TABLE",
    "objects": [
        {
            "database": "tpcc",
            "schema": "public",
            "table": "warehouse"
        }
    ],
    "restore_opts": {
        "into_db": "tpcc2"
    }
}
~~~

To restore a specific backup rather than the most recently created managed backup, include the `backup_id` field specifying a backup ID:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request POST \
--url 'https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores' \
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
}
~~~

You can specify additional options for the restore operations in the `restore_opts` object. For more information, see the [API endpoint documentation](https://www.cockroachlabs.com/docs/api/cloud/v1#get-/api/v1/clusters/-cluster_id-/restores-config).

If the request was successful, the client will receive a response containing JSON describing the request operation:

~~~ json
{
  "id": "example-aeb7-4daa-9e2c-eda541765f8a",
  "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
  "status": "PENDING",
  "created_at": "2025-07-25T16:45:14.064208710Z",
  "type": "table",
  "completion_percent": 0
}
~~~

### Get status of a restore operation

To view the status of a restore operation using the cloud API, send a `GET` request to the `/v1/clusters/{cluster_id}/restores/{restore_id}` endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/restores/{restore_id} \
--header 'Authorization: Bearer {secret_key}' \
~~~

If the request was successful, the client will receive a response containing JSON describing the status of the specified request operation:

~~~ json
{
  "id": "example-aeb7-4daa-9e2c-eda541765f8a",
  "backup_id": "example-2d25-4a64-8172-28af7a0d41cc",
  "status": "SUCCESS",
  "created_at": "2025-07-25T16:45:14.064208710Z",
  "type": "CLUSTER",
  "completion_percent": 100
}
~~~