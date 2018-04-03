Flag | Description
-----|------------
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:**`localhost`
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--user`<br>`-u` | The [SQL user](create-and-manage-users.html) that will own the client session.<br><br>**2Env Variable:** `COCKROACH_USER`<br>**Default:** `root`
`--password` | Enable password authentication for the user; you will be prompted to enter the password on the command line.<br/><br/><span class="version-tag">Changed in v2.0:</span> Password creation is supported only in secure clusters for non-`root` users. The `root` user must authenticate with a client certificate and key.<br/><br/>[Find more detail about how CockroachDB handles passwords](create-and-manage-users.html#user-authentication).
`--database`<br>`-d` | A database name to use as [current database](sql-name-resolution.html#current-database).<br><br>**Env Variable:** `COCKROACH_DATABASE`<br>**Default:** empty string.
`--insecure` | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--url`  | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL
