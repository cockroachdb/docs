---
title: ALTER SUPER REGION
summary: The ALTER SUPER REGION statement alters an existing super region to include a different set of regions.
toc: true
docs_area: reference.sql
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

The `ALTER DATABASE .. ALTER SUPER REGION` [statement](sql-statements.html) alters an existing [super region](multiregion-overview.html#super-regions) of a [multi-region database](multiregion-overview.html).

{% include enterprise-feature.md %}

{{site.data.alerts.callout_info}}
`ALTER SUPER REGION` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

{% include common/experimental-warning.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/alter_database_alter_super_region.html %}
</div>

## Parameters

| Parameter       | Description                                                                                                          |
|-----------------+----------------------------------------------------------------------------------------------------------------------|
| `database_name` | The database with the [super region](multiregion-overview.html#super-regions) you are altering.                      |
| `name`          | The name of the [super region](multiregion-overview.html#super-regions) being altered.                               |
| `name_list`     | The altered super region will consist of this set of [database regions](multiregion-overview.html#database-regions). |

## Required privileges

To alter a database's super region, the user must have one of the following:

- Membership to the [`admin`](security-reference/authorization.html#admin-role) role for the cluster.
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

### Alter a super region

This example assumes you have already added a `"usa"` super region as shown in the example [Add a super region to a database](add-super-region.html#add-a-super-region-to-a-database). If you wanted to [drop the region](drop-region.html) `us-west1`, you would first need to remove it from the super region.

To remove a region from a super region, use the `ALTER DATABASE ... ALTER SUPER REGION` statement and list only the regions that should remain in the super region:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr ALTER SUPER REGION "usa" VALUES "us-east1";
~~~

~~~
ALTER DATABASE ALTER SUPER REGION
~~~

To add a region to a super region, alter the super region as shown above to be a list of regions that includes the existing and the new regions.

### Allow user to modify a primary region that is part of a super region

{% include {{page.version.version}}/sql/enable-super-region-primary-region-changes.md %}

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [Super regions](multiregion-overview.html#super-regions)
- [`SET PRIMARY REGION`](set-primary-region.html)
- [`SHOW SUPER REGIONS`](show-super-regions.html)
- [`DROP SUPER REGION`](drop-super-region.html)
- [`ADD SUPER REGION`](add-super-region.html)
- [`DROP REGION`](drop-region.html)
- [`SHOW REGIONS`](show-regions.html)
- [`ALTER TABLE`](alter-table.html)
- [`ALTER DATABASE`](alter-database.html)
- [SQL Statements](sql-statements.html)
