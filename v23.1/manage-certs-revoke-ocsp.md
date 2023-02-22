---
title: Using Online Certificate Status Protocol (OCSP) with CockroachDB
summary: Using Online Certificate Status Protocol (OCSP) with CockroachDB
toc: true
docs_area: manage.security
---

{{ site.data.products.core }} supports [Online Certificate Status Protocol (OCSP)](https://en.wikipedia.org/wiki/Online_Certificate_Status_Protocol) for certificate revocation.

Read more about [Public Key Infrastructure (PKI) and Transport Layer Security (TLS) in CockroachDB](security-reference/transport-layer-security.html).

To enable certificate revocation using your OCSP service:

1. Ensure that your Certificate Authority sets the OCSP server address in the `authorityInfoAccess` field in the certificate.
1. [Set the cluster setting](set-cluster-setting.html) `security.ocsp.mode` to `lax` (by default, the cluster setting is set to `off`).

      {% include copy-clipboard.html %}
      ~~~ sql
      > SHOW CLUSTER SETTING security.ocsp.mode;
      ~~~

      ~~~
      security.ocsp.mode
      ----------------------
      off
      (1 row)

      Server Execution Time: 56µs
      Network Latency: 181µs
      ~~~

      {% include copy-clipboard.html %}
      ~~~ sql
      > SET CLUSTER SETTING security.ocsp.mode = lax;
      ~~~

      For production clusters, we recommend that you set `security.ocsp.mode` to `strict`, but only after verifying the configuration with it set to `lax`.

      {{site.data.alerts.callout_info}}
      In the `strict` mode, all certificates are presumed to be invalid if the OCSP server is not reachable. Setting the cluster setting `security.ocsp.mode` to `strict` will lock you out of your CockroachDB database if your OCSP server is unavailable.
      {{site.data.alerts.end}}

