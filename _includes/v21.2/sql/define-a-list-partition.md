Suppose we have a table called `students_by_list`, and secondary index on the table called `name_idx`, in a global online learning portal, and the primary key of the table is defined as `(country, id)`. We can define partitions on the {% if include.table-index == "table" %}table{% elsif include.table-index == "index" %}index{% else %}table and index{% endif %} by list:

{% unless include.table-index == "index" %}
{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_list PARTITION BY LIST (country) (
    PARTITION north_america VALUES IN ('CA','US'),
    PARTITION australia VALUES IN ('AU','NZ'),
    PARTITION DEFAULT VALUES IN (default)
  );
~~~
{% endunless %}

{% unless include.table-index == "table" %}
{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX students_by_list@name_idx PARTITION BY LIST (country) (
    PARTITION north_america VALUES IN ('CA','US'),
    PARTITION australia VALUES IN ('AU','NZ'),
    PARTITION DEFAULT VALUES IN (default)
  );
~~~
{% endunless %}
