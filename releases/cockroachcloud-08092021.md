---
title: What&#39;s New in CockroachCloud
toc: true
summary: Additions and changes in CockroachCloud since July 6, 2021.
---

## August 9, 2021

Get future release notes emailed to you:

{% include marketo.html %}

### General changes

- New CockroachCloud clusters will now run CockroachDB [v21.1.6](v21.1.6.html).
- CockroachCloud Free (beta) users can now perform [bulk operations](../cockroachcloud/run-bulk-operations.html) (`IMPORT`, `BACKUP`, `RESTORE` and CDC) with `userfile` storage. 

### Console changes

- Improved user experience on the Cluster Overview page for a deleted cluster.
- Improved error message for cluster upgrade failures.
- SQL-related restore errors are now shown in the Console, allowing users to take action.

### Security changes

- Password reset tokens will now expire after 24 hours.
- Email change tokens are now single use and will expire.
- Email change links are now revoked during certain user events such as password resets.
- Resetting the password of a SQL user no longer grants that user the admin SQL role.