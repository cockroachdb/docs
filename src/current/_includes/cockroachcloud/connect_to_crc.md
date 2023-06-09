<!-- Fragment include sections for connecting to CockroachCloud -->

<!-- BEGIN CRC dedicated sql -->
$ cockroach sql \
--url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
<!-- END CRC dedicated sql -->

<!-- BEGIN CRC free sql -->
$ cockroach sql \
--url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
<!-- END CRC free sql -->
