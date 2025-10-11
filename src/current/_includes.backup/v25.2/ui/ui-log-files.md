Log files can be accessed using the DB Console, which displays them in JSON format.

1. [Access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) and then click [**Advanced Debug**]({% link {{ page.version.version }}/ui-debug-pages.md %}) in the left-hand navigation.

1. Under **Raw Status Endpoints (JSON)**, click **Log Files** to view the JSON of all collected logs.

1. Copy one of the log filenames. Then click **Specific Log File** and replace the `cockroach.log` placeholder in the URL with the filename.