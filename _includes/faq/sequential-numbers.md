Sequential numbers can be generated in CockroachDB using the built-in
function `unique_rowid()` or using [SQL sequences](create-sequence.html).

{{site.data.alerts.callout_info}}Unless you need roughly-ordered
numbers, we recommend to use `UUID` values instead. See the previous
FAQ for details.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}Sequences produce <emph>unique</emph>
values, however not all values are guaranteed to be produced (e.g.,
when a transaction is canceled after it consumes a value) and the
values may be slightly reordered (e.g., when a transaction that
consumes a lower sequence number commits after a transaction that
consumes a higher number).{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}For maximum performance, avoid using
sequences or <code>unique_rowid()</code> to generate row IDs or
indexed columns. This is because sequence values and values generated
by <code>unique_rowid()</code> are logically close to each other and
can cause contention on few data ranges during inserts. Instead,
prefer <code>UUID</code> identifiers.
{{site.data.alerts.end}}

