{{site.data.alerts.callout_info}}
As of v22.1, certain `IMPORT TABLE` statements that defined the table schema inline are **not** supported. See [Import — Considerations]({{ page.version.version }}/import.md#considerations) for more details. To import data into a new table, use [`CREATE TABLE`]({{ page.version.version }}/create-table.md) followed by [`IMPORT INTO`]({{ page.version.version }}/import-into.md). For an example, read [Import into a new table from a CSV file]({{ page.version.version }}/import-into.md#import-into-a-new-table-from-a-csv-file).
{{site.data.alerts.end}}
