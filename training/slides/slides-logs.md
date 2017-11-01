# Goals

Debug and error logs - https://www.cockroachlabs.com/docs/stable/debug-and-error-logs.html
General troubleshooting - https://www.cockroachlabs.com/docs/stable/general-troubleshooting.html
Cluster setup troubleshooting - https://www.cockroachlabs.com/docs/stable/cluster-setup-troubleshooting.html
Query behavior troubleshooting - https://www.cockroachlabs.com/docs/stable/query-behavior-troubleshooting.html

# Presentation

/----------------------------------------/

## Agenda

- What is it?
- Debug & Error Logs
- Troubleshooting Resources

/----------------------------------------/

## Debug & Error Logs

### Destinations

- `stderr`
	- Enabled with `--logtostderr`)
- File
	- Default for `start`; other commands enabled with `--log-dir`

### Levels

- `INFO` (lowest severity; no action necessary)
- `WARNING`
- `ERROR`
- `FATAL` (highest severity; requires operator attention)

--log-file-verbosity=[severity level]

--logtostderr=[severity level]

/----------------------------------------/

## Debug & Error Logs

### Defaults

Command | `INFO` messages | `WARNING` and above messages
--------|--------|--------------------
[`cockroach start`](start-a-node.html) | Write to file | Write to file
[All other commands](cockroach-commands.html) | Discard | Print to `stderr`

### Control

Enable `stderr` with `--logtostderr=[severity level]`

Enable log to file with `--log-dir=[dir] --logtostderr=[severity level]`

/----------------------------------------/

## Troubleshooting Resources

- [Troubleshooting documentation](troubleshooting-overview.html)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [Gitter](https://gitter.im/cockroachdb/cockroach)
- [File a GitHub issue](file-an-issue.html)

/----------------------------------------/

# Lab