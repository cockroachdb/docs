<!-- Fragment include sections for connecting to CockroachCloud -->

<!-- BEGIN CRC dedicated sql -->
{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
~~~
<!-- END CRC dedicated sql -->

<!-- BEGIN CRC free sql -->
{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>&options=--cluster=<cluster_name>'
~~~
<!-- END CRC free sql -->
