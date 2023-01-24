---
title: SHOW CREATE EXTERNAL CONNECTION
summary: The SHOW CREATE EXTERNAL CONNECTION statement displays all creation statements for active external connections. 
toc: true
docs_area: reference.sql
---

{% include feature-phases/preview.md %}

{% include_cached new-in.html version="v22.2" %} You can use external connections to specify and interact with resources that are external from CockroachDB. When creating an external connection, you define a name for an external connection while passing the provider URI and query parameters. `SHOW CREATE EXTERNAL CONNECTION` displays the connection name and the creation statements for active external connections.

You can also use the following SQL statements to work with external connections:

- [`CREATE EXTERNAL CONNECTION`](create-external-connection.html)
- [`DROP EXTERNAL CONNECTION`](drop-external-connection.html)

## Required privileges

Without the `admin` role, users can only view the external connections that they own. Users own external connections that they have created with `CREATE EXTERNAL CONNECTION`.

Users with the [`admin` role](security-reference/authorization.html#admin-role) can view all external connections with `SHOW CREATE EXTERNAL CONNECTION`.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_create_external_connections.html %}
</div>

### Parameters

Parameter | Description
----------+-------------
`connection_name` | The name of the external connection to pass in operation statements.

## Examples

### Show all external connection create statements

{% include_cached copy-clipboard.html %}
~~~sql
SHOW CREATE ALL EXTERNAL CONNECTIONS;
~~~

This will return a list of of active external connection names along with the `CREATE EXTERNAL CONNECTION` statements that were used to create them, including the **unredacted** URI:

~~~
  connection_name |                                                                              create_statement
------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
backup_bucket_1   | CREATE EXTERNAL CONNECTION 'backup_bucket' AS 's3://bucket_name?AWS_ACCESS_KEY_ID={access key}&AWS_SECRET_ACCESS_KEY={secret access key}'
backup_bucket_2   | CREATE EXTERNAL CONNECTION 'backup_bucket_2' AS 's3://bucket_name?AWS_ACCESS_KEY_ID={access key}&AWS_SECRET_ACCESS_KEY={secret access key}'
kafka             | CREATE EXTERNAL CONNECTION 'kafka' AS 'kafka://broker.address.com:9092?topic_prefix=bar_&tls_enabled=true&ca_cert={certificate}&sasl_enabled=true&sasl_user={sasl user}&sasl_password={url-encoded password}&sasl_mechanism=SASL-SCRAM-SHA-256'
(4 rows)
~~~

### Show an external connection create statement

To display the `CREATE` statement for a specific external connection, pass the name of the connection similar to the following:

{% include_cached copy-clipboard.html %}
~~~sql
SHOW CREATE EXTERNAL CONNECTION backup_bucket_1;
~~~
~~~
connection_name   |                                                         create_statement
------------------+-------------------------------------------------------------------------------------------------------------------------------------------
backup_bucket_1   | CREATE EXTERNAL CONNECTION 'backup_bucket' AS 's3://bucket_name?AWS_ACCESS_KEY_ID={access key}&AWS_SECRET_ACCESS_KEY={secret access key}'
~~~

## See also

- [Use Cloud Storage](use-cloud-storage.html)
- [Changefeed Sinks](changefeed-sinks.html)
