---
title: Export CockroachDB Cloud organization audit logs
summary: Learn about exporting CockroachDB Cloud organization audit logs.
toc: true
docs_area: manage
---

{{ site.data.products.db }} captures audit logs when many types of events occur, such as when a cluster is created or when a user is added to or removed from an organization. Any user in an organization with an admin-level service account can export these audit logs using the [`auditlogevents` endpoint](cloud-api.html#cloud-audit-logs) of the [Cloud API](/docs/cockroachcloud/cloud-api.html).

{% include feature-phases/preview-opt-in.md %}

After your organization is enrolled in the preview, you can begin exporting audit logs for {{ site.data.products.db }} organization.

This page provides some examples of exporting {{ site.data.products.db }} organization audit logs. For details about each parameter and its defaults, refer to the API specification for the [`auditlogevents` endpoint](cloud-api.html#cloud-audit-logs).

## Export audit logs in ascending order

This example requests audit logs without defining the starting timestamp, sort order, or limit. By default, the earliest 200 audit logs for your {{ site.data.products.db }} organization are returned in ascending order, starting from when the organization was created.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/auditlogevents' \
  --header 'Authorization: Bearer {secret_key}'
~~~

The response is truncated for readability.

~~~ json
{
  "entries": [
    {
      "id": "40b15ccd-6a87-4efc-ac7b-157ba172f957",
      "trace_id": "cfa605927086bb630ab9eb69bfda5f5f",
      "session_id": "5e24b61f9fc7459ab2fac703b926a2622a347bf8993d32ef84e836e2f11053d3",
      "source": "AUDIT_LOG_SOURCE_INTERNAL",
      "user_email": "",
      "cluster_id": "dc6360d2-b21c-451f-aa9f-b20ad6906475",
      "cluster_name": "example-cluster",
      "action": "AUDIT_LOG_ACTION_CREATE_CLUSTER",
      "payload": {
        "request": {
          "name": "example-cluster",
          "provider": "GCP",
          "spec": {
            "dedicated": {
              "cockroachVersion": "v21.2.4",
              "hardware": {
                "diskIops": 450,
                "machineSpec": {
                  "machineType": "n1-standard-2"
                },
                "storageGib": 15
              },
              "regionNodes": {
                "europe-west4": 1
              }
            }
          }
        }
      },
      "metadata": null,
      "error": "",
      "created_at": "2022-10-09T02:40:00.262143Z"
    }
  ],
  "next_starting_from": "2022-10-09T02:40:35.054818Z"
}
~~~

{{site.data.alerts.callout_info}}
If you get an error, verify that the feature is enabled for your {{ site.data.products.db }} organization.
{{site.data.alerts.end}}

To export the next batch of entries, send a second request and set `startingFrom` to the value of `next_starting_from`, `2022-10-09T02:40:35.054818Z`.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/auditlogevents?startingFrom=2022-10-09T02:40:35.054818Z' \
  --header 'Authorization: Bearer {secret_key}'
~~~

## Export audit logs in descending order

This example requests the 300 most recent audit logs, starting from the current timestamp.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/auditlogevents?sortOrder=DESC&limit=300' \
  --header 'Authorization: Bearer {secret_key}'
~~~

To request the next batch of entries in the same direction, send a second request with the same values for `sortOrder` and `limit` and set `startingFrom` to the value of `next_starting_from`. When there are no more results to fetch (because you have reached when your {{ site.data.products.db }} organization was created), no `next_starting_from` field is returned.

## Events adjacent to a specific timestamp

This example shows how to retrieve the 200 events on each side of a given timestamp by invoking the API twice, with the same timestamp and a different sort order for each request. The sort order determines whether the specified timestamp is at the beginning or end of the list. These examples use the default value for `limit`.

First, retrieve roughly 200 entries for the specified timestamp and later.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/auditlogevents?startingFrom=2022-10-09T02:40:00.262143Z&sortOrder=ASC' \
  --header 'Authorization: Bearer {secret_key}'
~~~

Next, retrieve roughly 200 less recent entries for the specified timestamp and earlier.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/auditlogevents?startingFrom=2022-10-09T02:40:00.262143Z&sortOrder=DESC' \
  --header 'Authorization: Bearer {secret_key}'
~~~

All entries for the timestamp itself are included in both sets of results. Duplicated entries have the same `id`.

## What's next?

- Learn more about the [Cloud API](cloud-api.html)
