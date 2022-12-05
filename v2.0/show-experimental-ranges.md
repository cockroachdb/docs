---
title: SHOW EXPERIMENTAL_RANGES
summary: The SHOW EXPERIMENTAL_RANGES shows information about the ranges that make up a specific table's data.
toc: true
---

The `SHOW EXPERIMENTAL_RANGES` [statement](sql-statements.html) shows information about the [ranges](architecture/index.html#glossary) that make up a specific table's data, including:

- The start and end keys for the range(s)
- The range ID(s)
- Which nodes contain the range [replicas](architecture/index.html#glossary)
- Which node contains the range that is the [leaseholder](architecture/index.html#glossary)

This information is useful for verifying that:

- The ["follow-the-workload"](demo-follow-the-workload.html) feature is operating as expected.
- Range splits specified by the [`SPLIT AT`](split-at.html) statement were created as expected.

{% include {{ page.version.version }}/misc/experimental-warning.md %}


## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_ranges.html %}
</div>

## Required Privileges

The user must have the `SELECT` [privilege](privileges.html) on the target table.

## Parameters

Parameter | Description
----------|------------
[`table_name`](sql-grammar.html#table_name) | The name of the table you want range information about.
[`table_name_with_index`](sql-grammar.html#table_name_with_index) | The name of the index you want range information about.

## Examples

The examples in this section operate on a hypothetical "user credit information" table filled with placeholder data, running on a 5-node cluster.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE credit_users (
       id INT PRIMARY KEY,
       area_code INTEGER NOT NULL,
       name STRING UNIQUE NOT NULL,
       address STRING NOT NULL,
       zip_code INTEGER NOT NULL,
       credit_score INTEGER NOT NULL
);
~~~

We added a secondary [index](indexes.html) to the table on the `area_code` column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX areaCode on credit_users(area_code);
~~~

Next, we ran a couple of [`SPLIT AT`s](split-at.html) on the table and the index:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE credit_users SPLIT AT VALUES (5), (10), (15);
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX credit_users@areaCode SPLIT AT VALUES (400), (600), (999);
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
| NULL      | /5      |      158 | {2,3,5}  |            5 |
| /5        | /10     |      159 | {3,4,5}  |            5 |
| /10       | /15     |      160 | {2,4,5}  |            5 |
| /15       | NULL    |      161 | {2,3,5}  |            5 |
+-----------+---------+----------+----------+--------------+
(4 rows)
~~~

### Show Ranges for an Index

{% include copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM INDEX credit_users@areaCode;
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
+ [Follow-the-Workload](demo-follow-the-workload.html)
+ [Architecture Overview](architecture/index.html)
