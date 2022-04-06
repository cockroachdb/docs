---
title: SHOW SUPER REGIONS
summary: The SHOW SUPER REGIONS statement shows the super regions in a multi-region cluster.
toc: true
docs_area: reference.sql
---

 The `SHOW SUPER REGIONS` [statement](sql-statements.html) lists the [super regions](multiregion-overview.html#super-regions) for a multi-region cluster.

{% include common/experimental-warning.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/show_regions.html %}
</div>

## Required privileges

To view the super regions in a database, the user must have one of the following:

- Membership to the [`admin`](security-reference/authorization.html#admin-role) role for the cluster.
- Either [ownership](security-reference/authorization.html#object-ownership) or the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) for the database.

## Parameters

| Parameter                     | Description                                                                                   |
|-------------------------------+-----------------------------------------------------------------------------------------------|
| `FROM DATABASE database_name` | Show all [super regions](multiregion-overview.html#super-regions) for the specified database. |

## Response

`SHOW SUPER REGIONS FROM DATABASE` returns the following fields for each super region:

| Field               | Description                                                 |
|---------------------+-------------------------------------------------------------|
| `database_name`     | The database name this super region is associated with.     |
| `super_region_name` | The name of a super region associated with the database.    |
| `regions`           | The list of database regions that make up the super region. |

## Considerations

{% include {{page.version.version}}/sql/super-region-considerations.md %}

## Examples

The examples in this section use the following setup.

{% include {{page.version.version}}/sql/multiregion-example-setup.md %}

#### Set up movr database regions

{% include {{page.version.version}}/sql/multiregion-movr-add-regions.md %}

#### Set up movr global tables

{% include {{page.version.version}}/sql/multiregion-movr-global.md %}

#### Set up movr regional tables

{% include {{page.version.version}}/sql/multiregion-movr-regional-by-row.md %}

### Enable super regions

{% include {{page.version.version}}/sql/enable-super-regions.md %}

### View the super regions from a database

`SHOW SUPER REGIONS FROM DATABASE` returns the [super regions](multiregion-overview.html#super-regions) for the specified database.

{% include copy-clipboard.html %}
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
The preceding example shows the super region that was added in [`ADD SUPER REGION`](add-super-region.html#add-a-super-region-to-a-database).
{{site.data.alerts.end}}

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [Super regions](multiregion-overview.html#super-regions)
- [`ADD SUPER REGION`](add-super-region.html)
- [`DROP SUPER REGION`](drop-super-region.html)
- [`ALTER SUPER REGION`](alter-super-region.html)
- [SQL Statements](sql-statements.html)
