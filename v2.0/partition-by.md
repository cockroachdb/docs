---
title: PARTITION BY
summary: Use the CREATE TABLE and ALTER TABLE statement to define partitions and subpartitions, repartition, or unpartition a table.
toc: false
---

<span class="version-tag">New in v2.0</span> The `PARTITION BY` [statement](sql-statements.html) is a part of [`CREATE TABLE`](create-table.html) and [defines partitions](partitioning.html) and subpartitions on a table. It is also a part of [`ALTER TABLE`](alter-table.html) and repartitions or unpartitions a table.

{{site.data.alerts.callout_info}}<a href="partitioning.html">Defining table partitions</a> is an <a href="enterprise-licensing.html">enterprise-only</a> feature.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

### For `CREATE TABLE`



### For `ALTER TABLE`



## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table.

## Parameters

Parameter | Description |
-----------|-------------|
`table_name` | The name of the table you want to define partitions for. |
`opt_partition_by` | An [enterprise-only](enterprise-licensing.html) option that lets you define (or redefine) table partitions at the row level. You can define table partitions by list or by range. See [Define Table Partitions](partitioning.html) for more information.

## Examples

### Create Partitions by List

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE students_by_list (
    id SERIAL,
    name STRING,
    email STRING,
    country STRING,
    expected_graduation_date DATE,   
    PRIMARY KEY (country, id))
    PARTITION BY LIST (country)
      (PARTITION north_america VALUES IN ('CA','US'),
      PARTITION australia VALUES IN ('AU','NZ'),
      PARTITION DEFAULT VALUES IN (default));
~~~

### Create Partitions by Range

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE students_by_range (
   id SERIAL,
   name STRING,
   email STRING,                                                                                           
   country STRING,
   expected_graduation_date DATE,                                                                                      
   PRIMARY KEY (expected_graduation_date, id))
   PARTITION BY RANGE (expected_graduation_date)
      (PARTITION graduated VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current VALUES FROM ('2017-08-15') TO (MAXVALUE));
~~~

### Create Table with Subpartitions

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE students (
    id SERIAL,
    name STRING,
    email STRING,
    country STRING,
    expected_graduation_date DATE,
    PRIMARY KEY (country, expected_graduation_date, id))
    PARTITION BY LIST (country)(
        PARTITION australia VALUES IN ('AU','NZ') PARTITION BY RANGE (expected_graduation_date)(PARTITION graduated_au VALUES FROM (MINVALUE) TO ('2017-08-15'), PARTITION current_au VALUES FROM ('2017-08-15') TO (MAXVALUE)),
        PARTITION north_america VALUES IN ('US','CA') PARTITION BY RANGE (expected_graduation_date)(PARTITION graduated_us VALUES FROM (MINVALUE) TO ('2017-08-15'), PARTITION current_us VALUES FROM ('2017-08-15') TO (MAXVALUE))
    );
~~~

### Repartition a Table

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_range PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2018-08-15'),
    PARTITION current VALUES FROM ('2018-08-15') TO (MAXVALUE));
~~~

### Unpartition a Table

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE students PARTITION BY NOTHING;
~~~

## See Also

- [`CREATE TABLE`](create-table.html)
- [`ALTER TABLE`](alter-table.html)
