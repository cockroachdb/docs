{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN AS OF SYSTEM TIME '2019-04-09 18:02:52.0+00:00';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM products;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMIT;
~~~
