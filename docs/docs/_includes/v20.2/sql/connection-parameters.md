Flag | Description
-----|------------
`--host` | The server host and port number to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost:26257`
`--port`<br>`-p` | The server port to connect to. Note: The port number can also be specified via `--host`. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--user`<br>`-u` | The [SQL user](create-user.html) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`
`--insecure` | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--certs-dir` | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
<a name="sql-flag-url"></a> `--url` | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL