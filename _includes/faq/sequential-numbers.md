As of v2.0, CockroachDB supports [SQL sequences](create-sequence.html).

{{site.data.alerts.callout_info}}Sequences produce <emph>unique</emph> values, however not all values are guaranteed to be produced (e.g., when a transaction is canceled after it consumes a value) and the values may be slightly reordered (e.g., when a transaction that consumes a lower sequence number commits after a transaction that consumes a higher number).{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}For maximum performance, avoid using sequences to generate row IDs or indexed columns. This is because sequence values are logically close to each other and can cause contention on few data ranges during inserts. Instead, prefer <code>UUID</code>  identifiers or integer identifiers generated with <code>unique_rowid()</code>.{{site.data.alerts.end}}
