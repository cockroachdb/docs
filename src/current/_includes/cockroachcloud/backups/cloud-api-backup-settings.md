### Get information on backup settings

To retrieve information about a specific cluster, make a `GET` request to the `/v1/clusters/{cluster_id}/backups-config` endpoint.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/backups-config \
--header "Authorization: Bearer {secret_key}"
~~~

Set the following:

- `{cluster_id}` is the unique ID of the cluster. This ID is written in a UUID format similar to `f78b7feb-b6cf-4396-9d7f-494982d7d81e` and is returned by a [GET request against the `/v1/clusters` endpoint]({% link cockroachcloud/cloud-api.md %}#list-all-clusters-in-an-organization). You can also find the cluster ID in the Cloud Console, in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`.
- `{secret_key}` is your API key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}#api-access) for more details.

If the request is successful, the API will return details about the managed backup settings:

~~~json
{
  "enabled": true,
  "retention_days": 30,
  "frequency_minutes": 240
}
~~~

- `{enabled}` shows whether managed backups are enabled or disabled.
- `{frequency_minutes}` is [how often](#frequency) the managed backup will run in minutes.
- `{retention_days}` is the number of days Cockroach Labs will [retain](#retention) the managed backup in storage.

### Modify backup settings on a cluster

{{site.data.alerts.callout_info}}
{% include cockroachcloud/backups/full-backup-setting-change.md %}
{{site.data.alerts.end}}

{% include cockroachcloud/backups/review-settings.md %}

To configure the frequency and retention of managed backups, send a `PUT` request to the `/v1/clusters/{cluster_id}/backups-config` endpoint.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request PUT \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/backups-config \
--header "Authorization: Bearer {secret_key}" \
--data '{"enabled": true, "frequency_minutes": 30, "retention_days": 2}'
~~~

Set the following:

- `{cluster_id}` is the unique ID of the cluster. This ID is written in a UUID format similar to `f78b7feb-b6cf-4396-9d7f-494982d7d81e` and is returned by a [GET request against the `/v1/clusters` endpoint]({% link cockroachcloud/cloud-api.md %}#list-all-clusters-in-an-organization). You can also find the cluster ID in the Cloud Console, in the URL of the single cluster overview page: `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`.
- `{enabled}` controls whether managed backups are enabled or disabled. If you are disabling managed backups, you cannot set backup frequency or retention. Possible values are: `true`, `false`.
- `{frequency_minutes}` determines [how often](#frequency) the managed backup will run in minutes. Possible values are: `5`, `10`, `15`, `30`, `60`, `240` (4 hours), `1440` (24 hours).
- `{retention_days}` sets the number of days Cockroach Labs will [retain](#retention) the managed backup in storage. You can change `retention_days` for the cluster **once** (whether in the Cloud API or [Cloud Console](#cloud-console)). Possible values are: `2`, `7`, `30`, `90`, `365`.

    If `{retention_days}` has previously been modified (in the Cloud API or Cloud Console), you receive the message "cluster already has a retention policy set, open a support ticket to change it". To modify the setting again, contact the [Cockroach Labs Support team]({% link {{site.current_cloud_version}}/support-resources.md %}).
- `{secret_key}` is your API key. Refer to [API Access]({% link cockroachcloud/managing-access.md %}#api-access) for more details.

If the request is successful, the client recieves an empty HTTP 200 OK status response.