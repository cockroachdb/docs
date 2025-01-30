---
title: Visualize CockroachDB Schemas with DBeaver
summary: The DBeaver database tool completely integrates with CockroachDB to provide a GUI for managing your database.
toc: true
docs_area: develop
---

The [DBeaver database tool][dbeaver] is a tool that completely integrates with CockroachDB to provide a GUI for managing your database.

According to the [DBeaver website][dbeaver]:

> DBeaver is a cross-platform Database GUI tool for developers, SQL programmers, database administrators, and analysts.

In this tutorial, you'll work through the process of using DBeaver with a secure CockroachDB cluster.

{{site.data.alerts.callout_success}}
For more information about using DBeaver, see the [DBeaver documentation](https://dbeaver.io/docs/).

If you run into problems, please file an issue on the [DBeaver issue tracker](https://github.com/dbeaver/dbeaver/issues).

For information on using DBeaver with CockroachDB {{ site.data.products.cloud }}, see [this blog post](https://paul-logston.medium.com/setting-up-a-sql-gui-with-cockroachdb-a9fd5fe15d9d).
{{site.data.alerts.end}}

## Before You Begin

To work through this tutorial, take the following steps:

- [Install CockroachDB]({{ page.version.version }}/install-cockroachdb.md) and [start a secure cluster]({{ page.version.version }}/secure-a-cluster.md).
- Download a copy of [DBeaver](https://dbeaver.io/download/) version 5.2.3 or greater.

## Step 1. Start DBeaver and connect to CockroachDB

1. Start DBeaver, and select **Database > New Connection** from the menu. In the dialog that appears, select **CockroachDB** from the list.

    ![DBeaver - Select CockroachDB](/images/v24.2/dbeaver-01-select-cockroachdb.png)

1. Click **Next**. The **Connection Settings** dialog displays.

1. In the **Database** field, enter `movr`.

    ![DBeaver - CockroachDB connection settings](/images/v24.2/dbeaver-02-cockroachdb-connection-settings.png)

## Step 2. Update the connection settings

1. Click the **SSL** tab.

    ![DBeaver - SSL tab](/images/v24.2/dbeaver-03-ssl-tab.png)

1. Check the **Use SSL** checkbox as shown, and fill in the text areas as follows:
    - **Root certificate**: Use the `ca.crt` file you generated for your secure cluster.
    - **SSL certificate**: Use a client certificate generated from your cluster's root certificate. For the root user, this will be named `client.root.crt`. For additional security, you may want to create a new database user and client certificate just for use with DBeaver.
    - **SSL certificate key**: Because DBeaver is a Java application, you will need to transform your key file to the `*.pk8` format using an [OpenSSL command](https://wiki.openssl.org/index.php/Command_Line_Utilities#pkcs8_.2F_pkcs5) like the one shown in the following snippet. Once you have created the file, enter its location here. In this example, the filename is `client.root.pk8`.
        ~~~ console
        $ openssl pkcs8 -topk8 -inform PEM -outform DER -in client.root.key -out client.root.pk8 -nocrypt
        ~~~

1. Select **verify-ca** or **verify-full** from the **SSL mode** dropdown. There is no need to set the **SSL Factory**; you can let DBeaver use the default.

## Step 3. Test the connection settings

1. Click **Test Connection ...**. If you need a driver, the following dialog displays:

    ![DBeaver - download driver dialog](/images/v24.2/dbeaver-06-download-driver.png)

1. Click **Download**.

    After the driver downloads, if the connection was successful, you will see a **Connected** dialog.

    ![DBeaver - connection success dialog](/images/v24.2/dbeaver-04-connection-success-dialog.png)

1. Click **OK** to dismiss the dialog.

## Step 4. Start using DBeaver

Expand the **movr** database node and navigate to the **rides** table.

![DBeaver - CockroachDB with the movr database](/images/v24.2/dbeaver-05-movr.png)

For more information about using DBeaver, see the [DBeaver documentation](https://dbeaver.io/docs/).

## Report Issues with DBeaver & CockroachDB

If you run into problems, please file an issue on the [DBeaver issue tracker](https://github.com/dbeaver/dbeaver/issues), including the following details about the environment where you encountered the issue:

- CockroachDB version ([`cockroach version`]({{ page.version.version }}/cockroach-version.md))
- DBeaver version
- Operating system
- Steps to reproduce the behavior
- If possible, a trace of the SQL statements sent to CockroachDB while the error is being reproduced using [SQL query logging]({{ page.version.version }}/logging-use-cases.md#sql_exec).

## See Also

+ [DBeaver documentation](https://dbeaver.io/docs/)
+ [DBeaver issue tracker](https://github.com/dbeaver/dbeaver/issues)
+ [Client connection parameters]({{ page.version.version }}/connection-parameters.md)
+ [Third-Party Database Tools]({{ page.version.version }}/third-party-database-tools.md)
+ [Learn CockroachDB SQL]({{ page.version.version }}/learn-cockroachdb-sql.md)

{% comment %} Reference Links {% endcomment %}

[dbeaver]: https://dbeaver.io