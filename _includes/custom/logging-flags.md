Flag | Description
-----|------------
`--log-dir` | Enable logging to files and write logs to the specified directory.<br/><br/>Including the `--log-dir` flag without specifying a directory (e.g., `cockroach start --log-dir`) or setting it to a blank directory (`--log-dir=""`) disables logging to files.
`--log-dir-max-size` | After the log directory reaches the specified size, delete the oldest log file. The flag's argument takes standard file sizes, such as `--log-dir-max-size=1GiB`.<br/><br/>**Default**: 100MiB
`--log-file-max-size` | After logs reach the specified size, begin writing logs to a new file. The flag's argument takes standard file sizes, such as `--log-file-max-size=2MiB`.<br/><br/>**Default**: 10MiB
`--log-file-verbosity` | Only write messages to log files if they are at or above the specified [severity level](debug-and-error-logs.html#severity-levels), such as `--log-file-verbosity=WARNING`. **Requires** `--log-dir` to be set.<br/><br/>**Default**: `INFO`
`--logtostderr` |  Write log messages to `stderr` if they are at or above the specified [severity level](debug-and-error-logs.html#severity-levels), such as `--logtostderr=ERROR`<br/><br/>If you use this flag without specifying the severity level (e.g., `cockroach start --logtostderr`), it writes messages of *all* severities to `stderr`.<br/><br/>**Default**: `WARNING`
`--no-color` | Do not colorize `stderr` based on severity. Possible values: `true` or `false`. <br><br>**Default:** `false`
`--vmodule `| Include greater detail in your logs.