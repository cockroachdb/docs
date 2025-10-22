---
title: ALTER EXTERNAL CONNECTION
summary: Use the ALTER EXTERNAL CONNECTION statement to update an external connection's URI.
toc: true
docs_area: reference.sql
---

The `ALTER EXTERNAL CONNECTION` [statement]({% link {{ page.version.version }}/sql-statements.md %}) allows you to change the [storage/sink](#supported-external-storage-and-sinks) URI that an external connection references. 

You can use external connections to specify and interact with resources that are external to CockroachDB. When creating an external connection, you must define a name for the external connection while passing the provider URI and query parameters.

You can use `ALTER EXTERNAL CONNECTION` to update the connection string for an external connection to use a new authentication token. This allows you to rotate your auth token before the old token expires.

You can also use the following SQL statements to work with external connections:

- [`CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/create-external-connection.md %})
- [`SHOW EXTERNAL CONNECTION`]({% link {{ page.version.version }}/show-external-connection.md %})
- [`SHOW CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/show-create-external-connection.md %})
- [`DROP EXTERNAL CONNECTION`]({% link {{ page.version.version }}/drop-external-connection.md %})

## Required privileges

To update an external connection, a user must have the `UPDATE` privilege on that connection.

For example:

{% include_cached copy-clipboard.html %}
~~~sql
GRANT UPDATE ON EXTERNAL CONNECTION backup_bucket TO user;
~~~

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_external_connection.html %}
</div>

### Parameters

Parameter | Description
----------+-------------
`connection_name` | The name of the existing external connection.
`connection_uri` | The new [storage/sink](#supported-external-storage-and-sinks) URI that the external connection will be updated to reference.

## Supported external storage and sinks

Storage or sink      | Operation support
---------------------+---------------------------------
[Amazon MSK]({% link {{ page.version.version }}/changefeed-sinks.md %}#amazon-msk) | Changefeeds
[Amazon S3]({% link {{ page.version.version }}/use-cloud-storage.md %}) | Backups, restores, imports, exports, changefeeds
[Amazon S3 KMS]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}#aws-kms-uri-format) | Encrypted backups
[Azure Storage]({% link {{ page.version.version }}/use-cloud-storage.md %}) | Backups, restores, imports, exports, changefeeds
[Confluent Cloud]({% link {{ page.version.version }}/changefeed-sinks.md %}#confluent-cloud) | Changefeeds
[Confluent Schema Registry]({% link {{ page.version.version }}/create-changefeed.md %}#confluent-schema-registry) | Changefeeds
[Google Cloud Pub/Sub]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub) | Changefeeds
[Google Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %}) | Backups, restores, imports, exports, changefeeds
[Google Cloud Storage KMS]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}#google-cloud-kms-uri-format) | Encrypted backups
[HTTP(S)]({% link {{ page.version.version }}/changefeed-sinks.md %}) | Changefeeds
[Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) | Changefeeds
[Nodelocal]({% link {{ page.version.version }}/use-cloud-storage.md %}) | Backups, restores, imports, exports, changefeeds
[PostgreSQL]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#connection-reference) connections | Physical cluster replication
[Userfile]({% link {{ page.version.version }}/use-userfile-storage.md %}) | Backups, restores, imports, exports, changefeeds
[Webhook]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink) | Changefeeds

For more information on authentication and forming the URI that an external connection will represent, refer to the storage or sink pages linked in the table.

## Examples

### Update the URI of an external connection

In this example, you update the `backup_bucket` external connection to a new Amazon S3 URI to rotate your auth token.

{% include_cached copy-clipboard.html %}
~~~sql
ALTER EXTERNAL CONNECTION backup_bucket AS 's3://bucket name?AWS_ACCESS_KEY_ID={new access key}&AWS_SECRET_ACCESS_KEY={new secret access key}';
~~~

## See also

- [`CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/create-external-connection.md %})
- [`DROP EXTERNAL CONNECTION`]({% link {{ page.version.version }}/drop-external-connection.md %})
- [`SHOW CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/show-create-external-connection.md %})