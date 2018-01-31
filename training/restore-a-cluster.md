---
title: Restore Your Cluster
summary: Learn how to restore your cluster from a backup.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQXiMw_TWkgeYIxGUpRwESzzKkeTGOtiRnzed2BJuGyJRR7MIvVTWfk_tGU47O4jo0hn2UUCaGAh99A/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, we'll restore our entire database using the enterprise license `RESTORE` feature.

### Before You Begin

To complete this lab, you need to have completed the lab for [backing up your CockroachDB cluster](back-up-a-cluster.html).

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

- [Day 2 Recap](day-2-recap.html)
