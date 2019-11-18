---
title: PARTITION BY
summary: Use the PARTITION BY statement to partition, re-partition, or un-partition a table or secondary index.
toc: true
---

`PARTITION BY` is a subcommand of [`ALTER TABLE`](alter-table.html) and [`ALTER INDEX`](alter-index.html) that is used to partition, re-partition, or un-partition a table or secondary index. After defining partitions, [`CONFIGURE ZONE`](configure-zone.html) is used to control the replication and placement of partitions.

{{site.data.alerts.callout_info}}
[Partitioning](partitioning.html) is an [enterprise-only](enterprise-licensing.html) feature. If you are looking for the `PARTITION BY` used in SQL window functions, see [Window Functions](window-functions.html).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Primary key requirements

The [primary key required for partitioning](partitioning.html#partition-using-primary-key) is different from the conventional primary key: The unique identifier in the primary key must be prefixed with all columns you want to partition and subpartition the table on, in the order in which you want to nest your subpartitions.

You cannot alter the primary key after it has been defined while [creating the table](create-table.html#create-a-table-with-partitions). If the primary key in your existing table does not meet the requirements, you will not be able to use the `ALTER TABLE` or `ALTER INDEX` statement to define partitions or subpartitions on the existing table or index.

## Synopsis

**alter_table_partition_by_stmt ::=**

<section>
{% include {{ page.version.version }}/sql/diagrams/alter_table_partition_by.html %}
</section>

**alter_index_partition_by_stmt ::=**

<section>
{% include {{ page.version.version }}/sql/diagrams/alter_index_partition_by.html %}
</section>

## Parameters

Parameter | Description |
-----------|-------------|
`table_name` | The name of the table you want to define partitions for.
`index_name` | The name of the index you want to define partitions for.
`name_list` | List of columns you want to define partitions on (in the order they are defined in the primary key).
`list_partitions` | Name of list partition followed by the list of values to be included in the partition.
`range_partitions` | Name of range partition followed by the range of values to be included in the partition.

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}


{% include {{page.version.version}}/sql/querying-partitions.md %}

## Examples

### Define a list partition on a table or secondary index

Suppose we have a table called `students_by_list`, and secondary index on the table called `name_idx`, in a global online learning portal, and the primary key of the table is defined as `(country, id)`. We can define partitions on the table and index by list:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_list PARTITION BY LIST (country) (
    PARTITION north_america VALUES IN ('CA','US'),
    PARTITION australia VALUES IN ('AU','NZ'),
    PARTITION DEFAULT VALUES IN (default)
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX students_by_list@name_idx PARTITION BY LIST (country) (
    PARTITION north_america VALUES IN ('CA','US'),
    PARTITION australia VALUES IN ('AU','NZ'),
    PARTITION DEFAULT VALUES IN (default)
  );
~~~

### Define a range partition on a table or secondary index

Suppose we have another table called `students_by_range`, also with a secondary index called `name_idx`, and the primary key of the table is defined as `(expected_graduation_date, id)`. We can define partitions on the table and index by range:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_range PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2017-08-15'),
    PARTITION current VALUES FROM ('2017-08-15') TO (MAXVALUE)
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX students_by_range@name_idx PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2017-08-15'),
    PARTITION current VALUES FROM ('2017-08-15') TO (MAXVALUE)
  );
~~~

### Define subpartitions on a table or secondary index

Suppose we have an yet another table named `students`, again with a secondary index called `name_idx`, and the primary key is defined as `(country, expected_graduation_date, id)`. We can define partitions and subpartitions on the table and index:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE students PARTITION BY LIST (country) (
    PARTITION australia VALUES IN ('AU','NZ') PARTITION BY RANGE (expected_graduation_date) (
      PARTITION graduated_au VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current_au VALUES FROM ('2017-08-15') TO (MAXVALUE)
    ),
    PARTITION north_america VALUES IN ('US','CA') PARTITION BY RANGE (expected_graduation_date) (
      PARTITION graduated_us VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current_us VALUES FROM ('2017-08-15') TO (MAXVALUE)
    )
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX students@name_idx PARTITION BY LIST (country) (
    PARTITION australia VALUES IN ('AU','NZ') PARTITION BY RANGE (expected_graduation_date) (
      PARTITION graduated_au VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current_au VALUES FROM ('2017-08-15') TO (MAXVALUE)
    ),
    PARTITION north_america VALUES IN ('US','CA') PARTITION BY RANGE (expected_graduation_date) (
      PARTITION graduated_us VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current_us VALUES FROM ('2017-08-15') TO (MAXVALUE)
    )
  );
~~~

### Repartition a table or secondary index

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_range PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2018-08-15'),
    PARTITION current VALUES FROM ('2018-08-15') TO (MAXVALUE)
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX students_by_range@name_idx PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2018-08-15'),
    PARTITION current VALUES FROM ('2018-08-15') TO (MAXVALUE)
  );
~~~

### Unpartition a table or secondary index

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE students PARTITION BY NOTHING;
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX students@name_idx PARTITION BY NOTHING;
~~~

## See also

- [`CREATE TABLE`](create-table.html)
- [`ALTER TABLE`](alter-table.html)
- [`ALTER INDEX`](alter-index.html)
- [Define Table Partitions](partitioning.html)
- [`SHOW JOBS`](show-jobs.html)
- [`SHOW PARTITIONS`](show-partitions.html)
