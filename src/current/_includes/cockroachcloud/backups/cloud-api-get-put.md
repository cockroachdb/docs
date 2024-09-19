You can use the [CockroachDB Cloud API]({% link cockroachcloud/cloud-api.md %}) to [view](#get-information-on-backup-settings) and [modify](#modify-backup-settings-on-a-cluster) managed backups in **{{ site.data.products.standard }} and {{ site.data.products.advanced }}** clusters.

{{site.data.alerts.callout_info}}
The [service account]({% link cockroachcloud/authorization.md %}#service-accounts) associated with the secret key must have the [Cluster Administrator]({% link cockroachcloud/authorization.md %}#cluster-administrator) role.
{{site.data.alerts.end}}

### Get information on backup settings

To retrieve information about a specific cluster, make a `GET` request to the `/v1/clusters/{cluster_id}/backups/config` endpoint.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/backups/config \
--header 'Authorization: Bearer {secret_key}'
~~~

Set the following:

- `{cluster_id}` is the unique ID of the cluster. Use this ID when making API requests. You can find the cluster ID in the cluster's Cloud Console page. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`. The ID should resemble `f78b7feb-b6cf-4396-9d7f-494982d7d81e`.
- `{secret_key}`:  is your API key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}#api-access) for more details.

If the request was successful, the API will return details about the managed backup settings:

~~~json
{
  "enabled": true,
  "retention_days": 30,
  "frequency_minutes": 240
}
~~~

- `{enabled}` shows whether managed backups are enabled or disabled.
- `{frequency_minutes}` is [how often](#frequency) the managed backup will run in minutes. Possible values are: `5`, `10`, `15`, `30`, `60`, `240`, `1440`.
- `{retention_days}` is the number of days Cockroach Labs will [retain](#retention) the managed backup in storage.

### Modify backup settings on a cluster

{% include cockroachcloud/backups/review-settings.md %}

To configure the frequency and retention of managed backups, send a `PUT` request to the `/v1/clusters/{cluster_id}/backups/config` endpoint.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PUT \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/backups/config \
--header 'Authorization: Bearer {secret_key}' \
--data '{"enabled": true, "frequency_minutes": 30, "retention_days": 2}'
~~~

Set the following:

- `{cluster_id}` is the unique ID of the cluster. Use this ID when making API requests. You can find the cluster ID in the cluster's Cloud Console page. Find your cluster ID in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`. The ID should resemble `f78b7feb-b6cf-4396-9d7f-494982d7d81e`.
- `{enabled}` controls whether managed backups run or are disabled. If you are disabling managed backups, you cannot set backup frequency or retention. Possible values are: `true`, `false`.
- `{frequency_minutes}` determines [how often](#frequency) the managed backup will run in minutes. Possible values are: `5`, `10`, `15`, `30`, `60`, `240`, `1440`.
- `{retention_days}` sets the number of days Cockroach Labs will [retain](#retention) the managed backup in storage. You can change `retention_days` for the cluster **once** (whether in the Cloud API or [Cloud Console](#cloud-console)). Possible values are: `2`, `7`, `30`, `90`, `365`.

    If `{retention_days}` has previously been modified (in the Cloud API or Cloud Console), you will receive the message "cluster already has a retention policy set, open a support ticket to change it". To modify the setting again, contact the [Cockroach Labs Support team](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/support-resources).
- `{secret_key}`:  is your API key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}#api-access) for more details.

If the request was successful, the client will not receive a response payload.