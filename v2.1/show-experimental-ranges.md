---
title: SHOW EXPERIMENTAL_RANGES
summary: The SHOW EXPERIMENTAL_RANGES shows information about the ranges that make up a specific table's data.
toc: false
---

The `SHOW EXPERIMENTAL_RANGES` [statement](sql-statements.html) shows information about the [ranges](architecture/overview.html#glossary) that make up a specific table's data, including:

- The start and end keys for the range(s)
- The range ID(s)
- Which nodes contain the range [replicas](architecture/overview.html#glossary)
- Which node contains the range that is the [leaseholder](architecture/overview.html#glossary)

This information is useful for verifying that:

- The ["follow-the-workload"](demo-follow-the-workload.html) feature is operating as expected.
- Range splits specified by the [`SPLIT AT`](split-at.html) statement were created as expected.

{% include experimental-warning.md %}

<div id="toc"></div>

## Synopsis

<div>
  {% include sql/{{ page.version.version }}/diagrams/show_ranges.html %}
</div>

## Required Privileges

The user must have the `SELECT` [privilege](privileges.html) on the target table.

## Parameters

Parameter | Description
----------|------------
[`table_name`](sql-grammar.html#table_name) | The name of the table you'd like to see range information for.
[`table_name_with_index`](sql-grammar.html#table_name_with_index) | The name of the index you'd like to see range information for.

## Examples

The examples in this section operate on a hypothetical "user credit information" table filled with dummy data, running on a 5-node cluster.

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE credit_users (
       area_code INTEGER NOT NULL,
       name STRING UNIQUE NOT NULL,
       address STRING NOT NULL,
       zip_code INTEGER NOT NULL,
       credit_score INTEGER NOT NULL,
       PRIMARY KEY (zip_code)
);
~~~

We added a secondary [index](indexes.html) to the table on the `area_code` column:

{% include copy-clipboard.html %}
~~~ sql
CREATE INDEX areaCode on credit_users(area_code);
~~~

Next, we ran a couple of [`SPLIT AT`s](split-at.html) on the table and the index:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE credit_users SPLIT AT VALUES (10000), (30000), (50000);
~~~

{% include copy-clipboard.html %}
~~~ sql
ALTER INDEX credit_users@areaCode SPLIT AT VALUES (400), (600), (999);
~~~

{{site.data.alerts.callout_info}}
In the example output below, a `NULL` in the *Start Key* column means "beginning of table".  
A `NULL` in the *End Key* column means "end of table".
{{site.data.alerts.end}}

### Show Ranges for a Table (Primary Index)

{% include copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM TABLE credit_users;
~~~

~~~
+-----------+---------+----------+----------+--------------+
| Start Key | End Key | Range ID | Replicas | Lease Holder |
+-----------+---------+----------+----------+--------------+
| NULL      | /10000  |      128 | {2,3,5}  |            2 |
| /10000    | /30000  |      129 | {2,4,5}  |            2 |
| /30000    | /50000  |      130 | {2,4,5}  |            2 |
| /50000    | NULL    |      131 | {2,4,5}  |            2 |
+-----------+---------+----------+----------+--------------+
(4 rows)
~~~

### Show Ranges for an Index

{% include copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM INDEX accounts@accountBalance;
~~~

~~~
+-----------+---------+----------+-----------+--------------+
| Start Key | End Key | Range ID | Replicas  | Lease Holder |
+-----------+---------+----------+-----------+--------------+
| NULL      | /400    |      135 | {2,4,5}   |            2 |
| /400      | /600    |      136 | {2,4,5}   |            4 |
| /600      | /999    |      137 | {1,3,4,5} |            3 |
| /999      | NULL    |       72 | {2,3,4,5} |            4 |
+-----------+---------+----------+-----------+--------------+
(4 rows)
~~~

## See Also

- [`SPLIT AT`](split-at.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE INDEX`](create-index.html)
- [Indexes](indexes.html)
+ [Follow-the-workload](demo-follow-the-workload.html)
+ [Architecture Overview](architecture/overview.html)
