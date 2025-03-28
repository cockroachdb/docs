---
title: Changefeed Message Envelope
summary: Learn how to configure the changefeed message envelope.
toc: true
---

The _envelope_ defines the structure of a changefeed message. By default changefeed messages emitted to a sink contain keys and values of the watched table rows that have changed. You can use the `envelope` option to configure the structure of the message envelope that a changefeed emits. 

Depending on the sink and options you specified to create the changefeed, the envelope and available configuration can vary.

{{site.data.alerts.callout_info}}
You can also specify the _format_ of changefeed messages, such as Avro. For more details, refer to [Message formats]({% link {{ page.version.version }}/changefeed-messages.md %}#message-formats).
{{site.data.alerts.end}}

{% comment  %}

Add whole of responses section
Delete messages
and Message envelopes


{% endcomment %}



- `key`: An array composed of the row's `PRIMARY KEY` field(s) (e.g., `[1]` for JSON or `{"id":{"long":1}}` for Avro).
- `table`
- `value`:
    - One of four possible top-level fields:
        - `after`, which contains the state of the row after the update (or `null` for `DELETE`s).
        - `updated`, which contains the [updated]({% link {{ page.version.version }}/create-changefeed.md %}#updated) timestamp.
        - `resolved`, which is emitted for records representing [resolved](#resolved-messages) timestamps. These records do not include an `after` value since they only function as checkpoints.
        - `before`, which contains the state of the row before an update. Changefeeds must use the [`diff` option]({% link {{ page.version.version }}/create-changefeed.md %}#diff) with the default [`wrapped` envelope](#wrapped) to emit the `before` field. When a row did not previously have any data, the `before` field will emit `null`.
    - For [`INSERT`]({% link {{ page.version.version }}/insert.md %}) and [`UPDATE`]({% link {{ page.version.version }}/update.md %}), the current state of the row inserted or updated.
    - For [`DELETE`]({% link {{ page.version.version }}/delete.md %}), `null`.