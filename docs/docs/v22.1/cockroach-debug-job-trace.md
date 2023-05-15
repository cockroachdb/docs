---
title: cockroach debug job-trace
summary: Learn the commands for collecting debug information from all nodes in your cluster.
toc: true
docs_area: reference.cli
---

{{site.data.alerts.callout_danger}}
We strongly recommend only using `cockroach debug job-trace` when working directly with the [Cockroach Labs support team](support-resources.html).
{{site.data.alerts.end}}

The [`cockroach debug job-trace`](cockroach-commands.html) command connects to your cluster and collects trace payloads for a running, traceable [job](show-jobs.html#show-jobs) ([**imports**](import-into.html) or [**backups**](take-full-and-incremental-backups.html)). The trace payloads are helpful for debugging why a job is not running as expected or to add more context to logs gathered from the [`cockroach debug zip`](cockroach-debug-zip.html) command.

The node that `cockroach debug job-trace` is run against will communicate to all nodes in the cluster in order to retrieve the trace payloads. This will deliver a zip file that contains [trace files](#files) for all the nodes participating in the execution of the job. The files hold information on the executing job's [trace spans](show-trace.html#trace-description), which describe the sub-operations being performed. Specifically, these files will contain the spans that have not yet completed and are associated with the execution of that particular job. Using this command for a job that is not currently running will result in an empty zip file.

## Synopsis

~~~ shell
$ cockroach debug job-trace <job_id> --url=<connection string> {flags}
~~~

See [`SHOW JOBS`](show-jobs.html#show-jobs) for details on capturing a `job_id`.

## Subcommands

{% include {{ page.version.version }}/misc/debug-subcommands.md %}

## Flags

The `debug job-trace` subcommand supports the following [general-use](#general) and [client connection](#client-connection) flags.

### General

Flag | Description
-----|-----------
`--timeout` | Return an error if the command does not conclude within a specified nonzero value. The timeout is suffixed with `s` (seconds), `m` (minutes), or `h` (hours). For example:<br /><br />`--timeout=2m`

### Client connection

Flag | Description
-----|------------
`--user`<br><br>`-u` | The [SQL user](create-user.html) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`
`--insecure` | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--cert-principal-map` | A comma-separated list of `<cert-principal>:<db-principal>` mappings. This allows mapping the principal in a cert to a DB principal such as `node` or `root` or any SQL user. This is intended for use in situations where the certificate management system places restrictions on the `Subject.CommonName` or `SubjectAlternateName` fields in the certificate (e.g., disallowing a `CommonName` like `node` or `root`). If multiple mappings are provided for the same `<cert-principal>`, the last one specified in the list takes precedence. A principal not specified in the map is passed through as-is via the identity function. A cert is allowed to authenticate a DB principal if the DB principal name is contained in the mapped `CommonName` or DNS-type `SubjectAlternateName` fields.
`--certs-dir` | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
<a name="sql-flag-url"></a> `--url` | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL

## Files

The `cockroach debug job-trace` command will output a zip file to where the command is run (`<job_id>-job-trace.zip`). The zip file will contain trace files for all the nodes participating in the job's execution. For example, `node1-trace.txt`.

See the [`SHOW TRACE FOR SESSION`](show-trace.html#response) page for more information on trace responses.

## Example

### Generate a job-trace zip file

To generate the `job-trace` zip file, use your [connection string](cockroach-start.html#standard-output) to pull the trace spans:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach debug job-trace 698977774875279361 --url=postgresql://root@localhost:26257?sslmode=disable
~~~

You will find the zip file in the directory you ran the command from:

~~~
698977774875279361-job-trace.zip
~~~

## See also

- [File an Issue](file-an-issue.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
