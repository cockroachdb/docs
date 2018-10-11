---
title: Connect DBeaver to a Secure Cluster
summary: Learn how to connect DBeaver.io with a secure CockroachDB cluster.
toc: true
---

This page has instructions for connecting the [DBeaver database tool](https://dbeaver.io) to a secure CockroachDB cluster.

These instructions assume you have already read and understood [the instructions for secure cluster setup, including how to generate certificates](secure-a-cluster.html).  They were tested using DBeaver Community Edition 5.2.2 and CockroachDB 2.1.

## 1. Choose CockroachDB

Select **Database > New Connection**.  In the dialog that appears, select **CockroachDB** from the list

<img src="{{ 'images/v2.1/dbeaver-01-select-cockroachdb.png' | relative_url }}" alt="DBeaver - Select CockroachDB" style="border:1px solid #eee;max-width:100%" />

## 2. Update connection settings

On the **Create new connection** dialog that appears, click **Network settings**.  

<img src="{{ 'images/v2.1/dbeaver-02-cockroachdb-connection-settings.png' | relative_url }}" alt="DBeaver - CockroachDB connection settings" style="border:1px solid #eee;max-width:100%" />

From the network settings, click the **SSL** tab.  It will look like the screenshot below.

Check the **Use SSL** checkbox, and fill in the text areas as follows:

- **Root certificate**: Use the `ca.crt` file you generated for your secure cluster.
- **SSL certificate**: Use a client certificate generated from your cluster's root certificate.  For the root user, this will be named `client.root.crt`.  For additional security, you may want to create a new database user and client certificate just for use with DBeaver.
- **SSL certificate key**: Because DBeaver is a Java application, you will need to transform your key file to the `*.pk8` format using an [OpenSSL command](https://wiki.openssl.org/index.php/Command_Line_Utilities#pkcs8_.2F_pkcs5) like the one shown below.  Once you have created the file, enter its location here.  In this example, the filename is `client.root.pk8`.
    {% include copy-clipboard.html %}
    ~~~ console
    $ openssl pkcs8 -topk8 -inform PEM -outform DER -in client.root.key -out client.root.pk8 -nocrypt
    ~~~

Select **require** from the **SSL mode** dropdown.  There is no need to set the **SSL Factory**, you can let DBeaver fill it in.

<img src="{{ 'images/v2.1/dbeaver-03-ssl-tab.png' | relative_url }}" alt="DBeaver - SSL tab" style="border:1px solid #eee;max-width:100%" />

## 3. Test connection settings

Click **Test Connection ...**.  If everything worked, you will see a **Success** dialog like the one shown below.

<img src="{{ 'images/v2.1/dbeaver-04-connection-success-dialog.png' | relative_url }}" alt="DBeaver - connection success dialog" style="border:1px solid #eee;max-width:100%" />

## 4. Start using DBeaver

Click **Finish** to get started using DBeaver with CockroachDB.

<img src="{{ 'images/v2.1/dbeaver-05-movr.png' | relative_url }}" alt="DBeaver - CockroachDB with the movr database" style="max-width:100%" />

For more information, see the [DBeaver documentation](https://dbeaver.io/docs/).

## See Also

+ [Third-Party Tools](third-party-tools.html)
+ [DBeaver documentation](https://dbeaver.io/docs/)
+ [Learn CockroachDB SQL](learn-cockroachdb-sql.html)
