{% comment %} Fragment include sections for connecting to CockroachCloud {% endcomment %}

{% comment %} BEGIN CRC dedicated sql {% endcomment %}
$ cockroach sql \
--url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
{% comment %} END CRC dedicated sql {% endcomment %}

{% comment %} BEGIN CRC free sql {% endcomment %}
$ cockroach sql \
--url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
{% comment %} END CRC free sql {% endcomment %}
