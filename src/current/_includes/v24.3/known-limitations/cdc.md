- Changefeed target options are limited to tables and [column families]({% link {{ page.version.version }}/changefeeds-on-tables-with-column-families.md %}). [#73435](https://github.com/cockroachdb/cockroach/issues/73435)
- {% include {{page.version.version}}/cdc/kafka-vpc-limitation.md %}
- Webhook sinks only support HTTPS. Use the [`insecure_tls_skip_verify`]({% link {{ page.version.version }}/create-changefeed.md %}#insecure-tls-skip-verify) parameter when testing to disable certificate verification; however, this still requires HTTPS and certificates. [#73431](https://github.com/cockroachdb/cockroach/issues/73431)
- Formats for changefeed messages are not supported by all changefeed sinks. Refer to the [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) page for details on compatible formats with each sink and the [`format`]({% link {{ page.version.version }}/create-changefeed.md %}) option to specify a changefeed message format. [#73432](https://github.com/cockroachdb/cockroach/issues/73432)
- Using the [`split_column_families`]({% link {{ page.version.version }}/create-changefeed.md %}#split-column-families) and [`resolved`]({% link {{ page.version.version }}/create-changefeed.md %}#resolved) options on the same changefeed will cause an error when using the following [sinks](changefeed-sinks.html): Kafka and Google Cloud Pub/Sub. Instead, use the individual `FAMILY` keyword to specify column families when creating a changefeed. [#79452](https://github.com/cockroachdb/cockroach/issues/79452)
- {% include {{page.version.version}}/cdc/types-udt-composite-general.md %} The following limitations apply:
    - {% include {{page.version.version}}/cdc/avro-udt-composite.md %}
    - {% include {{page.version.version}}/cdc/csv-udt-composite.md %}