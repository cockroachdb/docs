---
title: DROP SUPER REGION
summary: The DROP SUPER REGION statement drops a super region from a multi-region database.
toc: true
docs_area: reference.sql
---

 The `ALTER DATABASE .. DROP SUPER REGION` [statement](sql-statements.html) drops a [super region](multiregion-overview.html#super-regions) from a [multi-region database](multiregion-overview.html).
 
{% include enterprise-feature.md %}

{{site.data.alerts.callout_info}}
`DROP SUPER REGION` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

{% include common/experimental-warning.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ page.version.version | replace: "v", "" }}/grammar_svg/alter_database_drop_super_region.html %}
</div>

## Parameters

| Parameter       | Description                                                                                               |
|-----------------+-----------------------------------------------------------------------------------------------------------|
| `database_name` | The database from which you are dropping a [super region](multiregion-overview.html#super-regions).       |
| `name`          | The name of the [super region](multiregion-overview.html#super-regions) being dropped from this database. |

## Required privileges

To drop a super region from a database, the user must have one of the following:

- Membership to the [`admin`](security-reference/authorization.html#roles) role for the cluster.
- Either [ownership](security-reference/authorization.html#object-ownership) or the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) for the database.

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

### Drop a super region from a database

To drop a super region from a multi-region database, use a [`DROP SUPER REGION`](drop-super-region.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr DROP SUPER REGION "usa";
~~~

~~~
ALTER DATABASE DROP SUPER REGION
~~~

Note that you cannot [drop a region](drop-region.html) that is part of a super region until you either [alter the super region](alter-super-region.html) to remove it, or [drop the super region](drop-super-region.html) altogether.

For example, using the super region that was added in [`ADD SUPER REGION`](add-super-region.html#add-a-super-region-to-a-database):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr DROP REGION "us-west1";
~~~

~~~
ERROR: region us-west1 is part of super region usa
SQLSTATE: 2BP01
HINT: you must first drop super region usa before you can drop the region us-west1
~~~

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [Super regions](multiregion-overview.html#super-regions)
- [`SET PRIMARY REGION`](set-primary-region.html)
- [`ADD SUPER REGION`](add-super-region.html)
- [`ALTER SUPER REGION`](alter-super-region.html)
- [`SHOW SUPER REGIONS`](show-super-regions.html)
- [`ADD REGION`](add-region.html)
- [`SHOW REGIONS`](show-regions.html)
- [`ALTER TABLE`](alter-table.html)
- [`ALTER DATABASE`](alter-database.html)
- [SQL Statements](sql-statements.html)
