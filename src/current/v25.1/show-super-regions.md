---
title: SHOW SUPER REGIONS
summary: The SHOW SUPER REGIONS statement shows the super regions in a multi-region cluster.
toc: true
docs_area: reference.sql
---

 The `SHOW SUPER REGIONS` [statement]({{ page.version.version }}/sql-statements.md) lists the [super regions]({{ page.version.version }}/multiregion-overview.md#super-regions) for a multi-region cluster.

{{site.data.alerts.callout_info}}
{{site.data.alerts.end}}

## Synopsis

<div>
</div>

## Required privileges

To view the super regions in a database, the user must have one of the following:

- Membership to the [`admin`]({{ page.version.version }}/security-reference/authorization.md#admin-role) role for the cluster.
- Either [ownership]({{ page.version.version }}/security-reference/authorization.md#object-ownership) or the [`CREATE` privilege]({{ page.version.version }}/security-reference/authorization.md#supported-privileges) for the database.

## Parameters

| Parameter                     | Description                                                                                   |
|-------------------------------+-----------------------------------------------------------------------------------------------|
| `FROM DATABASE database_name` | Show all [super regions]({{ page.version.version }}/multiregion-overview.md#super-regions) for the specified database. |

## Response

`SHOW SUPER REGIONS FROM DATABASE` returns the following fields for each super region:

| Field               | Description                                                 |
|---------------------+-------------------------------------------------------------|
| `database_name`     | The database name this super region is associated with.     |
| `super_region_name` | The name of a super region associated with the database.    |
| `regions`           | The list of database regions that make up the super region. |

## Considerations


## Examples

The examples in this section use the following setup.


#### Set up movr database regions


#### Set up movr global tables


#### Set up movr regional tables


### Enable super regions


### View the super regions from a database

`SHOW SUPER REGIONS FROM DATABASE` returns the [super regions]({{ page.version.version }}/multiregion-overview.md#super-regions) for the specified database.

~~~ sql
SHOW SUPER REGIONS FROM DATABASE movr;
~~~

~~~
  database_name | super_region_name |       regions
----------------+-------------------+----------------------
  movr          | usa               | {us-east1,us-west1}
(1 row)
~~~

{{site.data.alerts.callout_info}}
The preceding example shows the super region that was added in [`ADD SUPER REGION`]({{ page.version.version }}/alter-database.md#add-a-super-region-to-a-database).
{{site.data.alerts.end}}

## See also

- [Multi-Region Capabilities Overview]({{ page.version.version }}/multiregion-overview.md)
- [Super regions]({{ page.version.version }}/multiregion-overview.md#super-regions)
- [`ADD SUPER REGION`]({{ page.version.version }}/alter-database.md#add-super-region)
- [`DROP SUPER REGION`]({{ page.version.version }}/alter-database.md#drop-super-region)
- [`ALTER SUPER REGION`]({{ page.version.version }}/alter-database.md#alter-super-region)
- [Secondary regions]({{ page.version.version }}/multiregion-overview.md#secondary-regions)
- [`SET SECONDARY REGION`]({{ page.version.version }}/alter-database.md#set-secondary-region)
- [`DROP SECONDARY REGION`]({{ page.version.version }}/alter-database.md#drop-secondary-region)
- [Zone Config Extensions]({{ page.version.version }}/zone-config-extensions.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)