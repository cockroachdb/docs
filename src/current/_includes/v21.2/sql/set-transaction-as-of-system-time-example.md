{% include "_includes/copy-clipboard.html" %}
~~~ sql
> BEGIN;
~~~

{% include "_includes/copy-clipboard.html" %}
~~~ sql
> SET TRANSACTION AS OF SYSTEM TIME '2019-04-09 18:02:52.0+00:00';
~~~

{% include "_includes/copy-clipboard.html" %}
~~~ sql
> SELECT * FROM orders;
~~~

{% include "_includes/copy-clipboard.html" %}
~~~ sql
> SELECT * FROM products;
~~~

{% include "_includes/copy-clipboard.html" %}
~~~ sql
> COMMIT;
~~~
