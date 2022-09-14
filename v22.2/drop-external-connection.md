---
title: DROP EXTERNAL CONNECTION
summary: The DROP EXTERNAL CONNECTION statement deletes external connections. 
toc: true
docs_area: reference.sql
---

{% include feature-phases/preview.md %}

{% include_cached new-in.html version="v22.2" %} You can use external connections to specify and interact with resources that are external from CockroachDB. When creating an external connection, you define a name for an external connection while passing the provider URI and query parameters. The `DROP EXTERNAL CONNECTION` statement allows you to delete external connections.

You can also use the following SQL statements to work with external connections:

- [`CREATE EXTERNAL CONNECTION`](create-external-connection.html)
- [`SHOW CREATE EXTERNAL CONNECTION`](show-create-external-connection.html)

## Required privileges

Users must have the [`admin` role](security-reference/authorization.html#admin-role) to drop an external connection.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_external_connection.html %}
</div>

### Parameters

Parameter | Description
----------+-------------
`connection_name` | The name of the external connection to pass in operation statements.

## Examples

### Drop an external connection

To delete an external connection named `backup_storage`, run the following:

{% include_cached copy-clipboard.html %}
~~~sql
DROP EXTERNAL CONNECTION backup_storage;
~~~

## See also

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Changefeed Sinks](changefeed-sinks.html)

