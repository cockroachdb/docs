This page documents the telemetry data that is collected by CockroachDB from clusters with telemetry enabled. For more information, refer to the [Licensing FAQs]({% link {{ page.version.version }}/licensing-faqs.md %}).

## Who runs the telemetry server, and how is the data secured?

Telemetry data is transmitted over HTTPS and securely stored on a web server that is hosted on a major cloud provider, and run and controlled by Cockroach Labs.

Once collected, Cockroach Labs conducts its post-processing of the telemetry data using third-party data management tools.

## What data is collected?

{% include common/telemetry-table.html %}

## See also

- [Licensing FAQs]({% link {{ page.version.version }}/licensing-faqs.md %})
- [`cockroach start --locality`]({% link {{ page.version.version }}/cockroach-start.md %}#locality)
