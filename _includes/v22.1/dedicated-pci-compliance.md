{{site.data.alerts.callout_info}}
{{ site.data.products.dedicated }} clusters comply with the Payment Card Industry Data Security Standard (PCI DSS). Compliance is certified by a PCI Qualified Security Assessor (QSA).

To achieve compliance with PCI DSS on a {{ site.data.products.dedicated }} cluster, you must ensure that any information related to payments or other personally-identifiable information (PII) is encrypted, tokenized, or masked before being written to CockroachDB. You can implement this data protection from within the customer application or through a third-party intermediary solution such as [Satori](https://satoricyber.com/).

To learn more about achieving PCI DSS compliance with {{ site.data.products.dedicated }}, contact your Cockroach Labs account team.
{{site.data.alerts.end}}

Learn more: [CockroachDB-Satori integration](../satori-integration.html)
