---
title: PARTITION BY
summary: Use the ALTER TABLE statement to define partitions and subpartitions, repartition, or unpartition a table.
toc: true
---

`PARTITION BY` is a subcommand of [`ALTER TABLE`](alter-table.html) that is used to define partitions and subpartitions on a table, and repartition or unpartition a table.

{{site.data.alerts.callout_info}}
[Defining table partitions](partitioning.html) is an [enterprise-only](enterprise-licensing.html) feature. If you are looking for the `PARTITION BY` used in SQL window functions, see [Window Functions](window-functions.html).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Primary key requirements

The [primary key required for partitioning](partitioning.html#partition-using-primary-key) is different from the conventional primary key: The unique identifier in the primary key requires to be prefixed with all columns you want to partition and subpartition the table on, in the order in which you want to nest your subpartitions.

As of CockroachDB v2.0, you cannot alter the primary key after it has been defined while [creating the table](create-table.html#create-a-table-with-partitions). If the primary key in your existing table does not meet the requirements, you will not be able to use the `ALTER TABLE` statement to define partitions or subpartitions on the existing table.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/alter_table_partition_by.html %}
</div>

## Parameters

Parameter | Description |
-----------|-------------|
`table_name` | The name of the table you want to define partitions for. |
`name_list` | List of columns you want to define partitions on (in the order they are defined in the primary key).|
`list_partitions` | Name of list partition followed by the list of values to be included in the partition.
`range_partitions` | Name of range partition followed by the range of values to be included in the partition.

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Define a list partition on an existing table

Suppose we have an existing table named `students_by_list` in a global online learning portal, and the primary key of the table is defined as `(country, id)`. We can define partitions on the table by list:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_list PARTITION BY LIST (country)
      (PARTITION north_america VALUES IN ('CA','US'),
      PARTITION australia VALUES IN ('AU','NZ'),
      PARTITION DEFAULT VALUES IN (default));
~~~

### Define a range partition on an existing table

Suppose we have an another existing table named `students_by_range` and the primary key of the table is defined as `(expected_graduation_date, id)`. We can define partitions on the table by range:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_range PARTITION BY RANGE (expected_graduation_date)
      (PARTITION graduated VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current VALUES FROM ('2017-08-15') TO (MAXVALUE));
~~~

### Define a subpartitions on an existing table

Suppose we have an yet another existing table named `students` with the primary key defined as `(country, expected_graduation_date, id)`. We can define partitions and subpartitions on the table:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students PARTITION BY LIST (country)(
        PARTITION australia VALUES IN ('AU','NZ') PARTITION BY RANGE (expected_graduation_date)(PARTITION graduated_au VALUES FROM (MINVALUE) TO ('2017-08-15'), PARTITION current_au VALUES FROM ('2017-08-15') TO (MAXVALUE)),
        PARTITION north_america VALUES IN ('US','CA') PARTITION BY RANGE (expected_graduation_date)(PARTITION graduated_us VALUES FROM (MINVALUE) TO ('2017-08-15'), PARTITION current_us VALUES FROM ('2017-08-15') TO (MAXVALUE))
    );
~~~

### Repartition a table

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_range PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2018-08-15'),
    PARTITION current VALUES FROM ('2018-08-15') TO (MAXVALUE));
~~~

### Unpartition a table

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE students PARTITION BY NOTHING;
~~~

## See also

- [`CREATE TABLE`](create-table.html)
- [`ALTER TABLE`](alter-table.html)
- [Define Table Partitions](partitioning.html)
- [`SHOW JOBS`](show-jobs.html)
