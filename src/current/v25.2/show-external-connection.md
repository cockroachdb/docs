---
title: SHOW EXTERNAL CONNECTION
summary: The SHOW EXTERNAL CONNECTION statement lists external connections.
toc: true
---

You can use external connections to specify and interact with resources that are external from CockroachDB. When creating an external connection, you define a name for an external connection while passing the provider URI and query parameters. `SHOW EXTERNAL CONNECTION` displays the connection name, URI, and the type of connection.

You can also use the following SQL statements to work with external connections:

- [`CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/create-external-connection.md %})
- [`SHOW CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/show-create-external-connection.md %})
- [`DROP EXTERNAL CONNECTION`]({% link {{ page.version.version }}/drop-external-connection.md %})

## Required privileges

Users with the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) can view all external connections with `SHOW EXTERNAL CONNECTION`.

Without the `admin` role, users can view the external connections that they own. Users own external connections that they have created with `CREATE EXTERNAL CONNECTION`.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_external_connections.html %}
</div>

### Parameters

`string_or_placeholder` is the name of the created external connection.

## Responses

Response | Description
---------+------------
`connection_name` | The user-specified name of the external connection.
`connection_uri` | The [storage/sink]({% link {{ page.version.version }}/create-external-connection.md %}#supported-external-storage-and-sinks) URI that the external connection references.
`connection_type` | Possible values are: <br><ul><li>`STORAGE` applies to [storage for backups and imports]({% link {{ page.version.version }}/use-cloud-storage.md %}) and [changefeed sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}).</li><li>`KMS` applies to [storage for encrypted backups]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}).</li><li>`FOREIGNDATA` applies to [`postgres://` connections for physical cluster replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#connection-reference).</li></ul>.

## Examples

### Show all external connections in the cluster

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW EXTERNAL CONNECTIONS;
~~~
~~~
  connection_name |                                                                                                                                    connection_uri                                                                                                                                     | connection_type
------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------
  msk             | kafka://boot-vzq1qitx.c1.kafka-serverless.us-east-1.amazonaws.com:9098/?sasl_aws_iam_role_arn={ARN}&sasl_aws_iam_session_name={session name}t&sasl_aws_region=us-east-1&sasl_enabled=true&sasl_mechanism=AWS_MSK_IAM&tls_enabled=true                                                 | STORAGE
  s3_bucket       | s3://bucket name?AWS_ACCESS_KEY_ID={access key}&AWS_SECRET_ACCESS_KEY=redacted                                                                                                                                                                                                        | STORAGE
~~~

### Show an external connection

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW EXTERNAL CONNECTION s3_bucket;
~~~
~~~
  connection_name |                                       connection_uri                                       | connection_type
------------------+--------------------------------------------------------------------------------------------+------------------
  s3_bucket       | s3://bucket name?AWS_ACCESS_KEY_ID={access key}&AWS_SECRET_ACCESS_KEY=redacted             | STORAGE
(1 row)
~~~

## See also

- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %})
- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
