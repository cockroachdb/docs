{{site.data.alerts.callout_info}}
To determine how wide the columns need to be, the default `table` display format in `cockroach sql` buffers the results it receives from the server before printing them to the console. When consuming core changefeed data using `cockroach sql`, it's important to use a display format like `csv` that does not buffer its results.
{{site.data.alerts.end}}
