Start the [MovR database](movr.html) on a 3-node CockroachDB demo cluster with a larger data set.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo movr --num-histories 250000 --num-promo-codes 250000 --num-rides 125000 --num-users 12500 --num-vehicles 3750 --nodes 3
~~~

{% comment %}
This is a test
{% endcomment %}
