---
title: Expire Past Backups
summary: Guidance to move or delete past backups in cloud storage. 
toc: true
docs_area: manage
---

This page describes how to expire past backups from cloud storage. As an operational best practice, we recommend [taking regular backups](take-full-and-incremental-backups.html) of your data and using cloud storage for your backups.

The process for expiring past backups from cloud storage will vary depending on the specific cloud storage service used. For guidance on connecting to different storage options or using other authentication parameters, read [Use Cloud Storage](use-cloud-storage.html).

## Step 1. Determine your retention policy

Before you can expire past backups, first determine your backup retention policy. With incremental backups in the `/incrementals` directory, you can apply different lifecycle/retention policies from cloud storage providers as needed.

For example: Retain [full backups](take-full-and-incremental-backups.html#full-backups) for 30 days and retain [incremental backups](take-full-and-incremental-backups.html#incremental-backups) for 7 days. 

## Step 2. Identify past backups

Once you have determined your retention policy, identify the past backups that need to be expired. You can use the creation time of the backup files to identify backups that are older than your desired retention period.

Since individual files within a backup have different creation times, they will be moved or deleted at different times. To ensure that all files within a retained backup remain available during the entire desired retention period, configure the policy that moves or deletes them to run one day **after** your intended retention period.

We recommend using immutable storage for your backups to ensure that the backups cannot be modified or deleted during the retention period specified in your retention policy. For more information about using immutable storage for backups, see [Use Cloud Storage](use-cloud-storage.html#immutable-storage).   

## Step 3. Apply your retention policy

Apply your determined retention policy to the objects in the cloud storage bucket you want to retain. 

The retention period can be applied at the bucket level or the object level. Once a retention period is applied to an object, it cannot be deleted or modified until the retention period expires. 

For example: If you want to retain your full backups for 30 days, apply a retention period of 31 days to your backup files. If you want to retain your incremental backups for 7 days, apply a retention period of 8 days to your backup files. 

For specific cloud-storage provider documentation, see the following:

- [AWS S3 Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)
- [Retention policies and Bucket Lock in Google Cloud Storage](https://cloud.google.com/storage/docs/bucket-lock)
- [Immutable storage in Azure Storage](https://docs.microsoft.com/azure/storage/blobs/immutable-storage-overview)

## Step 4. Delete or archive past backups

Use your cloud storage service’s expiration policy or other APIs to delete or move the past backups that you have identified. Ensure you are only deleting the backups you want to expire. 

{{site.data.alerts.callout_danger}}
Deleting past backups completely erases all data from these backups. These backups can no longer be restored. 
{{site.data.alerts.end}}

## Step 5. Monitor your cloud storage

After you have deleted or archived the past backups, monitor your cloud storage to ensure the past backups no longer exist and the remaining backups are available and accessible. For more information about using monitoring integrations for jobs, see [Backup and Restore Monitoring](backup-and-restore-monitoring.html).  

## See also

- [Backup and Restore Overview](backup-and-restore-overview.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SHOW BACKUP`](show-backup.html)
- [Use Cloud Storage](use-cloud-storage.html)