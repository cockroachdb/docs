As you scale your usage of [multi-region clusters](multiregion-overview.html), you may need to keep certain subsets of data in specific localities. Keeping specific data on servers in specific geographic locations is also known as _data domiciling_.

CockroachDB has basic support for data domiciling in multi-region clusters using the following procedures:

- [Data Domiciling with `PLACEMENT RESTRICTED`](data-domiciling-with-placement-restricted.html)
- [Data Domiciling with Separate Databases](data-domiciling-with-separate-databases.html)

{{site.data.alerts.callout_danger}}
Using CockroachDB as part of your approach to data domiciling has several limitations.  For more information, see [Limitations](#limitations).
{{site.data.alerts.end}}
