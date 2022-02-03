Suppose we have another table called `students_by_range`, also with a secondary index called `name_idx`, and the primary key of the table is defined as `(expected_graduation_date, id)`. We can define partitions on the {% if include.table-index == "table" %}table{% elsif include.table-index == "index" %}index{% else %}table and index{% endif %} by range:

{% unless include.table-index == "index" %}
{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_range PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2017-08-15'),
    PARTITION current VALUES FROM ('2017-08-15') TO (MAXVALUE)
  );
~~~
{% endunless %}

{% unless include.table-index == "table" %}
{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX students_by_range@name_idx PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2017-08-15'),
    PARTITION current VALUES FROM ('2017-08-15') TO (MAXVALUE)
  );
~~~
{% endunless %}
