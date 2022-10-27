[//]: # (Cloud backup types)

Cockroach Cloud clusters support two types of backups:

- Managed-service backups: automated full and incremental backups daily stored on Cockroach Cloud storage 
- {% if page.name == "run-bulk-operations.md" %} Self-service backups {% else %} [Self-service backups](../cockroachcloud/run-bulk-operations.html) {% endif %}: backups to your own storage buckets using the [`BACKUP`](backup.html) statement
