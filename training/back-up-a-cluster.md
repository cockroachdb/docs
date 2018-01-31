---
title: Back up Your Cluster
summary: Learn about the options you have to back up your cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSAoyGJwUQ2qVI76XXi15S8VVz1iKgZTglx-klRxv3kKOdjhijORByoq-HYWAnMp2JEkE7_4yGgNSel/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, you'll use the enterprise `BACKUP` feature to create a backup stored on S3. *(In-class training will have S3 space provided.)*

### Before You Begin

To complete this lab, you need a [local cluster of 3 nodes](3-node-local-secure-cluster.html).

### Step 1. Generate sample data

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen example-data | cockroach sql --certs-dir=certs
~~~

### Step 2. Enable license

1. Open the SQL shell:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs
    ~~~

2. Enable the training license:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = 'Cockroach Labs Training';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING enterprise.license = '{{site.training.ccl_license}}';
    ~~~

### Step 3. Perform backup

Generate a backup and store it on S3. To ensure your backup doesn't conflict with anyone else's, prefix the filename with the initials of your full name:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE startrek TO 's3://cockroach-training/[initials]-training?AWS_ACCESS_KEY_ID={{site.training.aws_access_key}}&AWS_SECRET_ACCESS_KEY={{site.training.aws_secret_access_key}}';
~~~

## What's Next?

- [Restore a Cluster](restore-a-cluster.html)
