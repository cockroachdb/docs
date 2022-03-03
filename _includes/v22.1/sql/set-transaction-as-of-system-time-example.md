{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET TRANSACTION AS OF SYSTEM TIME '2019-04-09 18:02:52.0+00:00';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM products;
~~~

{% include copy-clipboard.html %}
~~~ sql
> COMMIT;
~~~
