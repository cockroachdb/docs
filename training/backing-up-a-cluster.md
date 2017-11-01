---
title: Back up Your Cluster
summary: Learn about the options you have to back up your cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

## Presentation

[Back up Your Cluster](https://docs.google.com/presentation/d/1qjl4Vu4H4OIhLEPJdFhxwIcngDqDvHi4xgqe8-C9nXg/)

## Lab

In this lab, you'll use the enterprise `BACKUP` feature to create a backup stored on S3. *(In-class training will have S3 space provided.)*

### Before You Begin

To complete this lab, you should have a [local cluster of 3 nodes](3-node-local-secure-cluster.html).

### Generate Sample Data

~~~ shell
$ cockroach gen example-data | cockroach sql --certs=certs-dir
~~~

### Enable License

1. Open the SQL shell:

    ~~~ shell
    $ cockroach sql --certs=certs-dir
    ~~~

2. Enable the training license:

    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = \"Cockroach Labs Training\"
    
    > SET CLUSTER SETTING enterprise.license = \"{{page.training.ccl_license}}\"
    ~~~

### Perform Backup

Generate a backup and store it on S3. To ensure your backup doesn't conflict with anyone else's, prefix the filename with the initials of your full name:

~~~ sql
> BACKUP DATABASE startrek TO 's3://cockroach-training/[initials]-training?AWS_ACCESS_KEY_ID={{page.training.aws_access_key}}&AWS_SECRET_ACCESS_KEY={{page.training.aws_secret_access_key}}';
~~~

## Up Next

- [Restore a Cluster](restore-a-cluster.html)
