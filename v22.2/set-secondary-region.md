---
title: SET SECONDARY REGION
summary: The SET SECONDARY REGION statement defines a secondary region that is used for failover in a multi-region database.
toc: true
docs_area: reference.sql
---

<span class="version-tag">New in v22.2:</span> The `ALTER DATABASE .. SET SECONDARY REGION` [statement](sql-statements.html) adds a [secondary region](multiregion-overview.html#database-regions) to a [multi-region database](multiregion-overview.html) for failover purposes.

If the [primary region](set-primary-region.html) fails, the secondary region becomes the new primary region.

For more information, see [Secondary regions](multiregion-overview.html#secondary-regions).

{% include enterprise-feature.md %}

{{site.data.alerts.callout_info}}
`SET SECONDARY REGION` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
In order to add a secondary region with `ALTER DATABASE ... SET SECONDARY REGION`, you must first set a primary database region with [`SET PRIMARY REGION`](set-primary-region.html), or when [creating the database](create-database.html). For an example showing how to add a secondary region with `ALTER DATABASE`, see [Set the secondary region](#set-the-secondary-region).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_database_set_secondary_region.html %}
</div>

## Parameters

| Parameter                 | Description                                                                                                                                                                                                                 |
|---------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `database_name`           | The database you want to add a [secondary region](multiregion-overview.html#secondary-regions) to.                                                                                                                          |
| `secondary_region_clause` | Usually, the [region](multiregion-overview.html#database-regions) being set as the secondary region for this database. E.g., `"ap-southeast-2"`. Allowed values include any (non-primary) region present in `SHOW REGIONS`. |

## Required privileges

To add a secondary region to a database, you must have one of the following:

- Membership to the [`admin`](security-reference/authorization.html#admin-role) role for the cluster.
- Either [ownership](security-reference/authorization.html#object-ownership) or the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) for the database.

## Examples

{% include {{page.version.version}}/sql/multiregion-example-setup.md %}

Set the [primary region](set-primary-region.html) for the [`movr` database](movr.html):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr SET PRIMARY REGION "us-east1";
~~~

Add the other regions:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr ADD REGION "us-west1";
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr ADD REGION "europe-west1";
~~~

### Set the secondary region

To set an existing [database region](multiregion-overview.html#database-regions) (that is not already the [primary region](set-primary-region.html)) as the secondary region, use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr SET SECONDARY REGION "us-west1";
~~~

~~~
ALTER DATABASE SET SECONDARY REGION
~~~

Now, the `"us-west1"` region will act as the primary region if the original primary region fails.

{{site.data.alerts.callout_info}}
Setting a region as the secondary region implicitly adds it to the list of [database regions](multiregion-overview.html#database-regions), even if it wasn't previously added explicitly using [`ADD REGION`](add-region.html).
{{site.data.alerts.end}}

### Drop the secondary region

To drop the secondary region from a [multi-region database](multiregion-overview.html), use the [`DROP SECONDARY REGION`](drop-secondary-region.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr DROP SECONDARY REGION;
~~~

~~~
ALTER DATABASE DROP SECONDARY REGION
~~~

## See also

- [Secondary regions](multiregion-overview.html#secondary-regions)
- [`DROP SECONDARY REGION`](drop-secondary-region.html)
- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [`SET PRIMARY REGION`](set-primary-region.html)
- [`DROP REGION`](drop-region.html)
- [`SHOW REGIONS`](show-regions.html)
- [`ADD SUPER REGION`](add-super-region.html)
- [`DROP SUPER REGION`](drop-super-region.html)
- [`SHOW SUPER REGIONS`](show-super-regions.html)
- [`ALTER TABLE`](alter-table.html)
- [SQL Statements](sql-statements.html)
