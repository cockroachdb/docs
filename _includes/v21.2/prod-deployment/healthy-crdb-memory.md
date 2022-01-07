**Expected values for a healthy cluster**: RSS minus Go Total and CGo Total should not exceed 100 MiB. Go Allocated should not exceed a few hundred MiB. CGo Allocated should not exceed the `--cache` size.

{{site.data.alerts.callout_success}}
If you observe any of the following, [file an issue](file-an-issue.html):

- CGo Allocated is larger than the configured `--cache` size.
- RSS minus Go Total and CGo Total is larger than 100 MiB.
- Go Total or CGo Total fluctuates or grows steadily over time.
{{site.data.alerts.end}}