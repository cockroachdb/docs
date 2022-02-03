Suppose we have yet another table named `students`, again with a secondary index called `name_idx`, and the primary key is defined as `(country, expected_graduation_date, id)`. We can define partitions and subpartitions on the {% if include.table-index == "table" %}table{% elsif include.table-index == "index" %}index{% else %}table and index{% endif %}:

{% unless include.table-index == "index" %}
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
{% endunless %}

{% unless include.table-index == "table" %}
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
{% endunless %}
