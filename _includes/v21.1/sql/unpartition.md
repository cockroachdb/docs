{% unless include.table-index == "index" %}
{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE students PARTITION BY NOTHING;
~~~
{% endunless %}

{% unless include.table-index == "table" %}
{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX students@name_idx PARTITION BY NOTHING;
~~~
{% endunless %}
