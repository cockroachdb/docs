---
title: CREATE EXTERNAL CONNECTION
summary: The CREATE EXTERNAL CONNECTION statement creates a new external connection for external storage.
toc: true
docs_area: reference.sql
---

You can use external connections to specify and interact with resources that are external from CockroachDB. With `CREATE EXTERNAL CONNECTION`, you define a name for an external connection while passing the provider URI and query parameters. [`BACKUP`]({% link {{ page.version.version }}/backup.md %}), [`RESTORE`]({% link {{ page.version.version }}/restore.md %}), [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}), [`EXPORT`]({% link {{ page.version.version }}/export.md %}), and [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) queries can interact with the defined external connection instead of a required, provider-specific URI. As a result, you can decouple the management of the external resource from the operation in which you're using them.

`CREATE EXTERNAL CONNECTION` will validate the URI by writing, reading, and listing a test file to the external storage URI. If you're using a [KMS URI]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}), `CREATE EXTERNAL CONNECTION` will encrypt and decrypt a file. You'll find a `crdb_external_storage_location` file in your external storage as a result of this test. Each of the operations that access the external connection is aware of the raw URI that is parsed to configure, authenticate, and interact with the connection.

You may need to periodically rotate your authentication token for an external connection before the old token expires. For information on how to update the connection URI to use a new token, consult [`ALTER EXTERNAL CONNECTION`]({% link {{ page.version.version }}/alter-external-connection.md %}).

The [privilege model](#required-privileges) for external connections means that you can delegate the creation and usage of external connections to the necessary users or roles.

You can also use the following SQL statements to work with external connections:

- [`SHOW EXTERNAL CONNECTION`]({% link {{ page.version.version }}/show-external-connection.md %})
- [`SHOW CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/show-create-external-connection.md %})
- [`DROP EXTERNAL CONNECTION`]({% link {{ page.version.version }}/drop-external-connection.md %})
- [`ALTER EXTERNAL CONNECTION`]({% link {{ page.version.version }}/alter-external-connection.md %})

## Required privileges

To create an external connection, a user must have the `EXTERNALCONNECTION` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges). `root` and [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) users have this system-level privilege by default and are capable of granting the `EXTERNALCONNECTION` system-level privilege to other users and roles with or without the [`GRANT OPTION`]({% link {{ page.version.version }}/grant.md %}).

For example:

{% include_cached copy-clipboard.html %}
~~~sql
GRANT SYSTEM EXTERNALCONNECTION TO user;
~~~

To use a specific external connection during an operation, the user must also have the `USAGE` privilege on that connection:

For example:

{% include_cached copy-clipboard.html %}
~~~sql
GRANT USAGE ON EXTERNAL CONNECTION backup_bucket TO user;
~~~

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_external_connection.html %}
</div>

### Parameters

Parameter | Description
----------+-------------
`connection_name` | The name that represents the external connection.
`connection_URI` | The storage/sink URI that the external connection will reference.

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

### Changefeed sinks as external connections

Consider the following when you create an external connection for changefeeds:

- You can only include the query parameters and options that Kafka sinks support. Refer to the [Options]({% link {{ page.version.version }}/create-changefeed.md %}#options) table and the Kafka [query parameters]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) for more detail.
- {% include {{ page.version.version }}/cdc/ext-conn-cluster-setting.md %}

## External connection URI format

To form the external connection URI in operation statements, use the `external://` scheme followed by the name of the external connection.

For an external connection named `backup_storage`:

~~~
'external://backup_storage'
~~~

See the [examples](#create-an-external-connection-for-cloud-storage) in the next section for details on external connection creation.

## Examples

The examples in this section demonstrate some of the storage and operation options that external connections support.

### Create an external connection for cloud storage

In this example, you create an external connection for an Amazon S3 bucket that will store your backups. Then, you use the external connection to restore the backup to your cluster.

1. Define your external connection that references the S3 bucket's URI:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION backup_bucket AS 's3://bucket name?AWS_ACCESS_KEY_ID={access key}&AWS_SECRET_ACCESS_KEY={secret access key}';
    ~~~

1. Verify that the new external connection was created successfully with [`SHOW CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/show-create-external-connection.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SHOW CREATE ALL EXTERNAL CONNECTIONS;
    ~~~

    ~~~
    connection_name |                                                                              create_statement
    ----------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    backup_bucket   | CREATE EXTERNAL CONNECTION 'backup_bucket' AS 's3://bucket name?AWS_ACCESS_KEY_ID={access key}&AWS_SECRET_ACCESS_KEY={secret access key}'
    ~~~

1. Run the backup to your S3 bucket using the external connection's name:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    BACKUP DATABASE movr INTO 'external://backup_bucket' AS OF SYSTEM TIME '-10s' WITH revision_history;
    ~~~

    {{site.data.alerts.callout_info}}
    {% include {{ page.version.version }}/backups/cap-parameter-ext-connection.md %}
    {{site.data.alerts.end}}

1. Use [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %}) to view your backups in the storage defined by the external connection:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    SHOW BACKUPS IN 'external://backup_bucket';
    ~~~
    ~~~
            path
    ------------------------
    2022/09/19-134559.68
    2022/10/10-192044.40
    (2 rows)
    ~~~

1. In the event that a restore is necessary, use `RESTORE` with the external connection:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    RESTORE DATABASE movr FROM LATEST IN 'external://backup_bucket';
    ~~~

1. When you no longer need the external connection, you can delete it with [`DROP EXTERNAL CONNECTION`]({% link {{ page.version.version }}/drop-external-connection.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~sql
    DROP EXTERNAL CONNECTION backup_bucket;
    ~~~

### Create an external connection for a changefeed sink

In this example, you create an external connection to a Kafka sink to which a changefeed will emit messages. When you create the external connection, you will include the necessary query parameters for your changefeed. As a result, you will only need to specify the external connection's name when creating a changefeed rather than the Kafka URI and parameters.

1. Define your external connection that references the Kafka sink URI and any [connection parameters]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION kafka_sink AS 'kafka://broker.address.com:9092?topic_prefix=bar_&tls_enabled=true&ca_cert={certificate}&sasl_enabled=true&sasl_user={sasl user}&sasl_password={url-encoded password}&sasl_mechanism=SCRAM-SHA-256';
    ~~~

    {% include {{ page.version.version }}/cdc/cap-parameter-ext-connection.md %}

1. Create your changefeed using the external connection's name:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE movr.users INTO 'external://kafka_sink' WITH resolved;
    ~~~

## See also

- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [`EXPORT`]({% link {{ page.version.version }}/export.md %})
- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [`DROP EXTERNAL CONNECTION`]({% link {{ page.version.version }}/drop-external-connection.md %})
- [`SHOW CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/show-create-external-connection.md %})
- [`ALTER EXTERNAL CONNECTION`]({% link {{ page.version.version }}/alter-external-connection.md %})
