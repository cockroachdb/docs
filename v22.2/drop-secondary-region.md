---
title: DROP SECONDARY REGION
summary: The DROP SECONDARY REGION statement drops the secondary region from a multi-region database.
toc: true
docs_area: reference.sql
---

<span class="version-tag">New in v22.2:</span> The `ALTER DATABASE .. DROP SECONDARY REGION` [statement](sql-statements.html) drops the [secondary region](multiregion-overview.html#secondary-regions) (if set) from a [multi-region database](multiregion-overview.html).

The secondary region is used for failover purposes: if the [primary region](set-primary-region.html) fails, the secondary region acts as the new primary region.

For more information, see [Secondary regions](multiregion-overview.html#secondary-regions).

{% include enterprise-feature.md %}

{{site.data.alerts.callout_info}}
`DROP SECONDARY REGION` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_database_drop_secondary_region.html %}
</div>

## Parameters

| Parameter       | Description                                                                                                            |
|-----------------+------------------------------------------------------------------------------------------------------------------------|
| `database_name` | The database from which you are dropping the [secondary region](multiregion-overview.html#secondary-regions) (if set). |

## Required privileges

To drop a secondary region from a database, you must have one of the following:

- Membership to the [`admin`](security-reference/authorization.html#roles) role for the cluster.
- Membership to the [owner](security-reference/authorization.html#object-ownership) role, or the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) for the database.

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

### Drop the secondary region

To drop the secondary region from the [`movr` database](movr.html) (that was added in [Set the secondary region](set-secondary-region.html#set-the-secondary-region)) use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr DROP SECONDARY REGION;
~~~

~~~
ALTER DATABASE DROP SECONDARY REGION
~~~

## See also

- [Secondary regions](multiregion-overview.html#secondary-regions)
- [`SET SECONDARY REGION`](set-secondary-region.html)
- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [`SET PRIMARY REGION`](set-primary-region.html)
- [`ADD REGION`](add-region.html)
- [`SHOW REGIONS`](show-regions.html)
- [`ADD SUPER REGION`](add-super-region.html)
- [`DROP SUPER REGION`](drop-super-region.html)
- [`SHOW SUPER REGIONS`](show-super-regions.html)
- [`ALTER TABLE`](alter-table.html)
- [SQL Statements](sql-statements.html)
