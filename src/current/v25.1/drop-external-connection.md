---
title: DROP EXTERNAL CONNECTION
summary: The DROP EXTERNAL CONNECTION statement deletes external connections.
toc: true
docs_area: reference.sql
---

You can use external connections to specify and interact with resources that are external from CockroachDB. When creating an external connection, you define a name for an external connection while passing the provider URI and query parameters. The `DROP EXTERNAL CONNECTION` statement allows you to delete external connections.

You can also use the following SQL statements to work with external connections:

- [`CREATE EXTERNAL CONNECTION`]({{ page.version.version }}/create-external-connection.md)
- [`SHOW CREATE EXTERNAL CONNECTION`]({{ page.version.version }}/show-create-external-connection.md)
- [`SHOW EXTERNAL CONNECTION`]({{ page.version.version }}/show-external-connection.md)

## Required privileges

Users must have the [`DROP` privilege]({{ page.version.version }}/security-reference/authorization.md#supported-privileges) or be a member of the [`admin` role]({{ page.version.version }}/security-reference/authorization.md#admin-role) to drop an external connection.

For example:

~~~ sql
GRANT DROP ON EXTERNAL CONNECTION backup_bucket TO user;
~~~

## Synopsis

<div>
</div>

### Parameters

Parameter | Description
----------+-------------
`connection_name` | The name of the external connection to pass in operation statements.

## Examples

### Drop an external connection

To delete an external connection named `backup_storage`, run the following:

~~~sql
DROP EXTERNAL CONNECTION backup_storage;
~~~

## See also

- [Use Cloud Storage]({{ page.version.version }}/use-cloud-storage.md)
- [Changefeed Sinks]({{ page.version.version }}/changefeed-sinks.md)
