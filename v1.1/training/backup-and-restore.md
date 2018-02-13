---
title: Back and Restore
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

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQXiMw_TWkgeYIxGUpRwESzzKkeTGOtiRnzed2BJuGyJRR7MIvVTWfk_tGU47O4jo0hn2UUCaGAh99A/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, we'll restore our entire database using the enterprise license `RESTORE` feature.

### Before You Begin


### Step 1. Prepare Your Cluster for the Restore

1. Launch the built-in SQL client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs
    ~~~

2. Drop the database:

    {% include copy-clipboard.html %}
    ~~~ sql
    > DROP DATABASE startrek CASCADE;
    ~~~

3. Make sure the database was dropped:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES FROM startrek;
    ~~~

    ~~~
    pq: database "startrek" does not exist
    ~~~

### Step 2. Restore the Database

1. Restore the database:

    {% include copy-clipboard.html %}
    ~~~ sql
    RESTORE DATABASE startrek FROM 's3://acme-co-backup/[initials]-training?AWS_ACCESS_KEY_ID={{site.training.aws_access_key}}&AWS_SECRET_ACCESS_KEY={{site.training.aws_secret_access_key}}';
    ~~~

2. Make sure the database was restored:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES FROM startrek;
    ~~~

    ~~~
    +----------+
    |  Table   |
    +----------+
    | episodes |
    | quotes   |
    +----------+
    ~~~


## What's Next?

- [Cluster Upgrade](cluster-upgrade.html)
