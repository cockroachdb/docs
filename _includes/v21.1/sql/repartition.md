{% unless include.table-index == "index" %}
{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE students_by_range PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2018-08-15'),
    PARTITION current VALUES FROM ('2018-08-15') TO (MAXVALUE)
  );
~~~
{% endunless %}

{% unless include.table-index == "table" %}
{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX students_by_range@name_idx PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2018-08-15'),
    PARTITION current VALUES FROM ('2018-08-15') TO (MAXVALUE)
  );
~~~
{% endunless %}
