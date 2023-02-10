---
title: CREATE EXTERNAL CONNECTION
summary: The CREATE EXTERNAL CONNECTION statement creates a new external connection for external storage. 
toc: true
docs_area: reference.sql
---

{% include feature-phases/preview.md %}

You can use external connections to specify and interact with resources that are external from CockroachDB. With `CREATE EXTERNAL CONNECTION`, you define a name for an external connection while passing the provider URI and query parameters. [`BACKUP`](backup.html), [`RESTORE`](restore.html), [`IMPORT`](import.html), [`EXPORT`](export.html), and [`CREATE CHANGEFEED`](create-changefeed.html) queries can interact with the defined external connection instead of a required, provider-specific URI. As a result, you can decouple the management of the external resource from the operation in which you're using them.

`CREATE EXTERNAL CONNECTION` will validate the URI by writing, reading, and listing a test file to the external storage URI. If you're using a [KMS URI](take-and-restore-encrypted-backups.html), `CREATE EXTERNAL CONNECTION` will encrypt and decrypt a file. You'll find a `crdb_external_storage_location` file in your external storage as a result of this test. Each of the operations that access the external connection is aware of the raw URI that is parsed to configure, authenticate, and interact with the connection.

The [privilege model](#required-privileges) for external connections means that you can delegate the creation and usage of external connections to the necessary users or roles.

You can also use the following SQL statements to work with external connections:

- [`SHOW CREATE EXTERNAL CONNECTION`](show-create-external-connection.html)
- [`DROP EXTERNAL CONNECTION`](drop-external-connection.html)

## Required privileges

To create an external connection, a user must have the `EXTERNALCONNECTION` [system-level privilege](security-reference/authorization.html#system-level-privileges). `root` and [`admin`](security-reference/authorization.html#admin-role) users have this system-level privilege by default and are capable of granting the `EXTERNALCONNECTION` system-level privilege to other users and roles with or without the [`GRANT OPTION`](grant.html). 

For example: 

~~~sql
GRANT SYSTEM EXTERNALCONNECTION TO user;
~~~

To use a specific external connection during an operation, the user must also have the `USAGE` privilege on that connection: 

For example:

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
[Amazon S3](use-cloud-storage-for-bulk-operations.html) | Backups, restores, imports, exports
[Amazon S3 KMS](take-and-restore-encrypted-backups.html#aws-kms-uri-format) | Encrypted backups
[Azure Storage](use-cloud-storage-for-bulk-operations.html) | Backups, restores, imports, exports
[Google Cloud Storage](use-cloud-storage-for-bulk-operations.html) | Backups, restores, imports, exports
[Google Cloud Storage KMS](take-and-restore-encrypted-backups.html#google-cloud-kms-uri-format) | Encrypted backups
[Kafka](changefeed-sinks.html#kafka) | Changefeeds
[Nodelocal](use-cloud-storage-for-bulk-operations.html) | Backups, restores, imports, exports
[Userfile](use-userfile-for-bulk-operations.html) | Backups, restores, imports, exports

For more information on authentication and forming the URI that an external connection will represent, see each of the links to the storage or sink pages in the table.

### Changefeed sinks as external connections

Consider the following when you create an external connection for:

- Kafka sinks: You can only include the query parameters and options that Kafka sinks support. See the [Options](create-changefeed.html#options) table and the Kafka [query parameters](changefeed-sinks.html#kafka) for more detail.
- Cloud storage sinks: {% include {{ page.version.version }}/cdc/cloud-storage-external-connection.md %}

## External connection URI format

To form the external connection URI in operation statements, use the `external://` scheme followed by the name of the external connection. 

For an external connection named `backup_storage`:

~~~
'external://backup_storage'
~~~

See the [examples](#create-an-external-connection-for-cloud-storage) in the next section for details on external connection creation.

## Examples

The examples in this section demonstrate some of the storage and operation options that external connections support.

## Create an external connection for cloud storage

In this example, you create an external connection for an Amazon S3 bucket that will store your backups. Then, you use the external connection to restore the backup to your cluster.

1. Define your external connection that references the S3 bucket's URI:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION backup_bucket AS 's3://bucket name?AWS_ACCESS_KEY_ID={access key}&AWS_SECRET_ACCESS_KEY={secret access key}';
    ~~~

1. Verify that the new external connection was created successfully with [`SHOW CREATE EXTERNAL CONNECTION`](show-create-external-connection.html):

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

1. Use [`SHOW BACKUP`](show-backup.html) to view your backups in the storage defined by the external connection:

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

1. When you no longer need the external connection, you can delete it with [`DROP EXTERNAL CONNECTION`](drop-external-connection.html):

    {% include_cached copy-clipboard.html %}
    ~~~sql
    DROP EXTERNAL CONNECTION backup_bucket;
    ~~~

## Create an external connection for a changefeed sink

In this example, you create an external connection to a Kafka sink to which a changefeed will emit messages. When you create the external connection, you will include the necessary query parameters for your changefeed. As a result, you will only need to specify the external connection's name when creating a changefeed rather than the Kafka URI and parameters.

1. Define your external connection that references the Kafka sink URI and any [query parameters](changefeed-sinks.html#kafka):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE EXTERNAL CONNECTION kafka_sink AS 'kafka://broker.address.com:9092?topic_prefix=bar_&tls_enabled=true&ca_cert={certificate}&sasl_enabled=true&sasl_user={sasl user}&sasl_password={url-encoded password}&sasl_mechanism=SASL-SCRAM-SHA-256';
    ~~~

1. Create your changefeed using the external connection's name:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE movr.users INTO 'external://kafka_sink' WITH resolved;
    ~~~

## See also

- [`CREATE CHANGEFEED`](create-changefeed.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`EXPORT`](export.html)
- [`IMPORT INTO`](import-into.html)
- [`DROP EXTERNAL CONNECTION`](drop-external-connection.html)
- [`SHOW CREATE EXTERNAL CONNECTION`](show-create-external-connection.html)