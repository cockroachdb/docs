---
title: Use Cloud Storage
summary: CockroachDB constructs a secure API call to the cloud storage specified in a URL passed to various operation statements.
toc: true
key: use-cloud-storage-for-bulk-operations.html
docs_area: manage
---

CockroachDB supports cloud storage for the following operations:

- [Backup and restore]({% link {{ page.version.version }}/backup-and-restore-overview.md %})
- [Change data capture (CDC)]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [Import]({% link {{ page.version.version }}/import-into.md %})
- [Export]({% link {{ page.version.version }}/export.md %})

## Get started

This page describes how the configuration parameters, URL format, and required permissions for sending data from CockroachDB to cloud storage.

### URL Format

CockroachDB uses a standardized URL format for accessing cloud storage:

~~~
[scheme]://[host]/[path]?[parameters]
~~~

For details, refer to a cloud storage provider type:

<div class="filters clearfix">
  <button class="filter-button" data-scope="amazon-s3">Amazon S3</button>
  <button class="filter-button" data-scope="google-cloud">Google Cloud Storage</button>
  <button class="filter-button" data-scope="azure-blob">Azure Blob Storage</button>
  <button class="filter-button" data-scope="s3-compatible">S3-Compatible Services</button>
  <button class="filter-button" data-scope="nfs-local">NFS/Local Storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="amazon-s3">

- **Scheme:** `s3`
- **Host:** Bucket name
- **Parameters:**

    Parameter | Description
    ----------+------------
    `AUTH` | Authentication method: `specified` (default) or `implicit`. 
    `AWS_ACCESS_KEY_ID` | Your AWS access key ID. Required if using `specified` authentication.
    `AWS_SECRET_ACCESS_KEY` | Your AWS secret access key. Required if using `specified` authentication.
    `AWS_SESSION_TOKEN` | Optional. Temporary security token for session-based authentication.
    `AWS_ENDPOINT` | Optional. Custom endpoint for S3-compatible services or specific AWS regions.
    `ASSUME_ROLE` | Optional. ARN of the IAM role to assume for access.
    `AWS_REGION` | Optional. AWS region where the bucket is located.
    `S3_STORAGE_CLASS` | Optional

- **Example:** `s3://my-bucket/data?AWS_ACCESS_KEY_ID=xxx&AWS_SECRET_ACCESS_KEY=yyy`

Changefeeds have additional parameters that you can use, such as determining the file size or file partition in cloud storage sinks. For details, refer to [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sinks).

For details on authentication, see [Amazon S3 Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}#amazon-s3).
</section>

<section class="filter-content" markdown="1" data-scope="google-cloud">

- **Scheme:** `gs`
- **Host:** Bucket name
- **Parameters:**

    Parameter     | Description                                                                                                     
    --------------+-------------
    `AUTH` | Authentication method: `specified` (default) or `implicit`.
    `CREDENTIALS` | Base64-encoded GCP service account credentials. Required if using `specified` authentication.
    `ASSUME_ROLE` | Optional. Service account to impersonate for access.

- **Example:** `gs://my-bucket/data?AUTH=specified&CREDENTIALS=encoded-123`

For authentication steps, see [Google Cloud Storage Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}#google-cloud-storage).
</section>

## Encryption

## Storage permissions

## Immutable storage

## S3 storage classes