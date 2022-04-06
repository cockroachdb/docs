---
title: ADD SUPER REGION
summary: The ADD SUPER REGION statement adds a super region made up of a set of regions such that data from regional tables will be stored in those regions. 
toc: true
docs_area: reference.sql
---

 The `ALTER DATABASE .. ADD SUPER REGION` [statement](sql-statements.html) adds a [super region](multiregion-overview.html#super-regions) to a [multi-region database](multiregion-overview.html).

{% include enterprise-feature.md %}

{{site.data.alerts.callout_info}}
`ADD SUPER REGION` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

{% include common/experimental-warning.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/alter_database_add_super_region.html %}
</div>

## Parameters

| Parameter       | Description                                                                                                       |
|-----------------+-------------------------------------------------------------------------------------------------------------------|
| `database_name` | The database to which you are adding a [super region](multiregion-overview.html#super-regions).                   |
| `name`          | The name of the [super region](multiregion-overview.html#super-regions) being added to this database.             |
| `name_list`     | The names of the [database regions](multiregion-overview.html#database-regions) being added to this super region. |

## Required privileges

To add a super region to a database, the user must have one of the following:

- Membership to the [`admin`](security-reference/authorization.html#admin-role) role for the cluster.
- Either [ownership](security-reference/authorization.html#object-ownership) or the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) for the database and all [`REGIONAL BY ROW`](multiregion-overview.html#regional-by-row-tables) tables in the database.

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

### Add a super region to a database

To add a super region to a multi-region database, use the `ALTER DATABASE ... ADD SUPER REGION` statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr ADD SUPER REGION "usa" VALUES "us-east1", "us-west1";
~~~

~~~
ALTER DATABASE ADD SUPER REGION
~~~

### Allow user to modify a primary region that is part of a super region

By default, you may not change the [primary region](set-primary-region.html) of a [multi-region database](multiregion-overview.html) when that region is part of a super region. This is a safety setting designed to prevent you from accidentally moving the data for a [regional table](regional-tables.html) that is meant to be stored in the super region out of that super region, which could break your data domiciling setup.

If you are sure about what you are doing, you can allow modifying the primary region by setting the `override_multi_region_zone_config` [session setting](set-vars.html) to `'on'`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET override_multi_region_zone_config = 'on';
~~~

~~~
SET
~~~

You can also accomplish this by setting the `sql.defaults.alter_primary_region_super_region_override.enable` [cluster setting](cluster-settings.html) to `true`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING  sql.defaults.alter_primary_region_super_region_override.enable = true;
~~~

~~~
SET CLUSTER SETTING
~~~

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [Super regions](multiregion-overview.html#super-regions)
- [`SET PRIMARY REGION`](set-primary-region.html)
- [`SHOW SUPER REGIONS`](show-super-regions.html)
- [`DROP SUPER REGION`](drop-super-region.html)
- [`DROP REGION`](drop-region.html)
- [`SHOW REGIONS`](show-regions.html)
- [`ALTER TABLE`](alter-table.html)
- [`ALTER DATABASE`](alter-database.html)
- [SQL Statements](sql-statements.html)
