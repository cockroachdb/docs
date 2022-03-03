    {{site.data.alerts.callout_danger}}
    Certain `IMPORT TABLE` statements that do not define the table schema in the same file as the data are **not** supported in v22.1+. These include running:

      - `IMPORT TABLE` with any non-bundle format (`CSV`, `AVRO`, `DELIMITED DATA`, or `PGCOPY`).
      - Using the `IMPORT TABLE ... CREATE USING` syntax.

    To import data into a new table using these formats, use [`CREATE TABLE`](create-table.html) followed by [`IMPORT INTO`](import-into.html). For an example, read [Import into a new table from a CSV file](import-into.html#import-into-a-new-table-from-a-csv-file).
    {{site.data.alerts.end}}
