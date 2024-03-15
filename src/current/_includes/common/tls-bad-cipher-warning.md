{% comment %}This include is used only in v22.2+ docs and in one CC page (which should use the 23.1+ variant){% endcomment %}
{{site.data.alerts.callout_info}}
{% if page.version.version == "v22.2" %}
CockroachDB supports the [TLS 1.3 and TLS 1.2](https://wikipedia.org/wiki/Transport_Layer_Security) encryption for SQL clients. Starting in CockroachDB v22.2, only cipher suites currently recommended by the IETF ([RFC 8447](https://datatracker.ietf.org/doc/html/rfc8447)) are enabled by default. In v22.2.4 and above, the environment variable `COCKROACH_TLS_ENABLE_OLD_CIPHER_SUITES` can be used to revert to the cipher suite configuration used in version 22.1. This environment variable is not available in v22.2.0-v22.2.3.
{% else %}
CockroachDB supports the [TLS 1.3 and TLS 1.2](https://wikipedia.org/wiki/Transport_Layer_Security) encryption for SQL clients. Only cipher suites currently recommended by the IETF ([RFC 8447](https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#tls-parameters-4)) are enabled by default. The environment variable `COCKROACH_TLS_ENABLE_OLD_CIPHER_SUITES` can be used to revert to the cipher suite configuration used prior to v22.2.
{% endif %}

SQL clients, intermediate proxies, or load balancers that do not support any cipher suites that CockroachDB supports will be unable to connect to CockroachDB clusters. For the full list of supported cipher suites, refer to [Supported cipher suites]({% link {{ page.version.version}}/authentication.md %}#supported-cipher-suites).
{{site.data.alerts.end}}
