You can pass the [`--also-generate-pkcs8-key` flag](cockroach-cert.html#flag-pkcs8) to [`cockroach cert`](cockroach-cert.html) to generate a key in [PKCS#8 format](https://tools.ietf.org/html/rfc5208), which is the standard key encoding format in Java. For example, if you have the user `max`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client max --certs-dir=certs --ca-key=my-safe-directory/ca.key --also-generate-pkcs8-key
~~~

The generated PKCS8 key will be named `client.max.key.pk8`.
