{{site.data.alerts.callout_info}}
CockroachDB clusters can talk TLS 1.2 or TLS 1.3 to SQL clients for encryption-in-flight and to prove each other's identities. However, the following less-secure TLS 1.2 cipher suites are rejected, in accordance with the IETF's recommended cipher list defined in [RFC 8447](https://datatracker.ietf.org/doc/html/rfc8447):

- `TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA`
- `TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA`
- `TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA`
- `TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA`
- `TLS_RSA_WITH_AES_128_GCM_SHA256`
- `TLS_RSA_WITH_AES_256_GCM_SHA384`
- `TLS_RSA_WITH_AES_128_CBC_SHA`
- `TLS_RSA_WITH_AES_256_CBC_SHA`

SQL clients or intermediate proxies or load balancers that do not support any cipher suites that CockroachDB considers to be secure and supports will be unable to connect to CockroachDB clusters, unless they are configured to allow them. To allow SQL connections using the deprecated cipher suites, set the `COCKROACH_TLS_ENABLE_OLD_CIPHER_SUITES` environment variable to `true` for your `cockroach start` command. This mode is not recommended, unless you must use a client, intermediate proxy, or load balancer that doesn't support any of the more secure cipher suites.
{{site.data.alerts.end}}