{{site.data.alerts.callout_info}}
As of v21.2, certain `IMPORT TABLE` statements that do not define the table schema in the same file as the data are **deprecated**. See [Import — Considerations](import.html#considerations) for more details. To import data into a new table using these formats, use [`CREATE TABLE`](create-table.html) followed by [`IMPORT INTO`](import-into.html). For an example, read [Import into a new table from a CSV file](import-into.html#import-into-a-new-table-from-a-csv-file).
{{site.data.alerts.end}}
