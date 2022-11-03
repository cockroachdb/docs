{{ site.data.products.db }} clusters support two types of backups:

- Managed-service backups: Cockroach Labs takes automated backups of {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} clusters that are stored in Cockroach Labs' cloud storage
- {% if page.name == "run-bulk-operations.md" %} Customer-owned backups {% else %} [Self-service backups](../cockroachcloud/run-bulk-operations.html) {% endif %}: You can take manual backups and store them in your [cloud storage buckets](../{{site.versions["stable"]}}/use-cloud-storage-for-bulk-operations.html) using the [`BACKUP`](../{{site.versions["stable"]}}/backup.html) statement
