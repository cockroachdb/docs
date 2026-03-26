Location     | Example
-------------+----------------------------------------------------------------------------------
Amazon S3    | `'s3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'`
Azure Blob Storage | `'azure://{CONTAINER NAME}/{PATH}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}'`
Google Cloud | `'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}'`
HTTP         | `'file-http(s)://localhost:8080/{PATH}'` or `'http(s)://localhost:8080/{PATH}'`<br><br>**Note:** Using `http(s)` without the `file-` prefix is deprecated as a [changefeed sink]({% link {{ page.version.version }}/changefeed-sinks.md %}) scheme. There is continued support for `http(s)`, but it will be removed in a future release. We recommend implementing the `file-http(s)` scheme for changefeed messages.