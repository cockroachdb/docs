---
title: DBeaver
summary: Learn how to use DBeaver with CockroachDB.
toc: true
---

The [DBeaver database tool][dbeaver] is a tool that completely integrates with CockroachDB to provide a GUI for managing your database.

According to the [DBeaver website][dbeaver]:

> DBeaver is a cross-platform Database GUI tool for developers, SQL programmers, database administrators, and analysts.

In this tutorial, you'll work through the process of using DBeaver with a secure CockroachDB cluster.

{{site.data.alerts.callout_success}}
For more information about using DBeaver, see the [DBeaver documentation](https://dbeaver.io/docs/).

If you run into problems, please file an issue on the [DBeaver issue tracker](https://github.com/dbeaver/dbeaver/issues).
{{site.data.alerts.end}}

## Before You Begin

To work through this tutorial, take the following steps:

- [Install CockroachDB](install-cockroachdb.html) and [start a secure cluster](secure-a-cluster.html).
- Download a copy of [DBeaver](https://dbeaver.io/download/) version 5.2.3 or greater.

## Step 1. Start DBeaver and connect to CockroachDB

Start DBeaver, and select **Database > New Connection** from the menu.  In the dialog that appears, select **CockroachDB** from the list.

<img src="{{ 'images/v2.1/dbeaver-01-select-cockroachdb.png' | relative_url }}" alt="DBeaver - Select CockroachDB" style="border:1px solid #eee;max-width:100%" />

## Step 2. Update the connection settings

On the **Create new connection** dialog that appears, click **Network settings**.  

<img src="{{ 'images/v2.1/dbeaver-02-cockroachdb-connection-settings.png' | relative_url }}" alt="DBeaver - CockroachDB connection settings" style="border:1px solid #eee;max-width:100%" />

From the network settings, click the **SSL** tab.  It will look like the screenshot below.

<img src="{{ 'images/v2.1/dbeaver-03-ssl-tab.png' | relative_url }}" alt="DBeaver - SSL tab" style="border:1px solid #eee;max-width:100%" />

Check the **Use SSL** checkbox as shown, and fill in the text areas as follows:

- **Root certificate**: Use the `ca.crt` file you generated for your secure cluster.
- **SSL certificate**: Use a client certificate generated from your cluster's root certificate.  For the root user, this will be named `client.root.crt`.  For additional security, you may want to create a new database user and client certificate just for use with DBeaver.
- **SSL certificate key**: Because DBeaver is a Java application, you will need to transform your key file to the `*.pk8` format using an [OpenSSL command](https://wiki.openssl.org/index.php/Command_Line_Utilities#pkcs8_.2F_pkcs5) like the one shown below.  Once you have created the file, enter its location here.  In this example, the filename is `client.root.pk8`.
    {% include copy-clipboard.html %}
    ~~~ console
    $ openssl pkcs8 -topk8 -inform PEM -outform DER -in client.root.key -out client.root.pk8 -nocrypt
    ~~~

Select **require** from the **SSL mode** dropdown.  There is no need to set the **SSL Factory**, you can let DBeaver use the default.

## Step 3. Test the connection settings

Click **Test Connection ...**.  If everything worked, you will see a **Success** dialog like the one shown below.

<img src="{{ 'images/v2.1/dbeaver-04-connection-success-dialog.png' | relative_url }}" alt="DBeaver - connection success dialog" style="border:1px solid #eee;max-width:100%" />

## Step 4. Start using DBeaver

Click **Finish** to get started using DBeaver with CockroachDB.

<img src="{{ 'images/v2.1/dbeaver-05-movr.png' | relative_url }}" alt="DBeaver - CockroachDB with the movr database" style="max-width:100%" />

For more information about using DBeaver, see the [DBeaver documentation](https://dbeaver.io/docs/).

## Report Issues with DBeaver & CockroachDB

If you run into problems, please file an issue on the [DBeaver issue tracker](https://github.com/dbeaver/dbeaver/issues), including the following details about the environment where you encountered the issue:

- CockroachDB version ([`cockroach version`](cockroach-version.html))
- DBeaver version
- Operating system
- Steps to reproduce the behavior
- If possible, a trace of the SQL statements sent to CockroachDB while the error is being reproduced using [SQL query logging](query-behavior-troubleshooting.html#sql-logging).

## See Also

+ [DBeaver documentation](https://dbeaver.io/docs/)
+ [DBeaver issue tracker](https://github.com/dbeaver/dbeaver/issues)
+ [Client connection parameters](connection-parameters.html)
+ [Third-Party Database Tools](third-party-database-tools.html)
+ [Learn CockroachDB SQL](learn-cockroachdb-sql.html)

<!-- Reference Links -->

[dbeaver]: https://dbeaver.io
