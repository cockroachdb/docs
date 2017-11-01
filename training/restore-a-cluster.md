---
title: Restore Your Cluster
summary: Learn how to restore your cluster from a backup.
toc: false
sidebar_data: sidebar-data-training.json
---

## Presentation

[Restore Your Cluster](https://docs.google.com/presentation/d/1A1EkRZoq89FhlCle5neIPwQn8cOOcpnYpklaWDIzNLQ/edit)

## Lab

In this lab, we'll restore our an entire database using the enterprise license `RESTORE` feature.

### Before You Begin

To complete this lab, you need to have completed the lab for [backing up your CockroachDB cluster](back-up-a-cluster.html).

### Step 1. Prepare Your Cluster for the Restore

1. Launch the built-in SQL client:

    ~~~
    $ cockroach sql --certs-dir=certs
    ~~~

2. Drop the database:

    ~~~ sql
    > DROP DATABASE startrek;
    ~~~

3. Make sure the database was dropped:

    ~~~ sql
    > SHOW TABLES FROM startrek;
    ~~~
    ~~~
    pq: database "startrek" does not exist
    ~~~

### Step 2. Restore the Database

1. Restore the database:

    ~~~
    RESTORE DATABASE startrek FROM 's3://acme-co-backup/[initials]-training?AWS_ACCESS_KEY_ID={{page.training.aws_access_key}}&AWS_SECRET_ACCESS_KEY={{page.training.aws_secret_access_key}}';
    ~~~

2. Make sure the database was restored:

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

### Up Next

- [Day 2 Recap](day-2-recap.html)
