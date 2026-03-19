---
title: Export CockroachDB Cloud Organization Audit Logs
summary: Learn about exporting CockroachDB Cloud organization audit logs.
toc: true
docs_area: manage
cloud: true
---

CockroachDB {{ site.data.products.cloud }} captures audit logs when many types of events occur, such as when a cluster is created or when a user is added to or removed from an organization. Any user in an organization with a [service account]({% link cockroachcloud/managing-access.md %}#manage-service-accounts) assigned the [Organization Admin role]({% link cockroachcloud/authorization.md %}#organization-admin) can export these audit logs using the [`auditlogevents` endpoint]({% link cockroachcloud/cloud-api.md %}#cloud-audit-logs) of the [Cloud API]({% link cockroachcloud/cloud-api.md %}).

This page provides some examples of exporting CockroachDB {{ site.data.products.cloud }} organization audit logs. For details about each parameter and its defaults, refer to the API specification for the [`auditlogevents` endpoint]({% link cockroachcloud/cloud-api.md %}#cloud-audit-logs).

## Export audit logs in ascending order

This example requests audit logs without defining the starting timestamp, sort order, or limit.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/auditlogevents \
  --header "Authorization: Bearer {secret_key}" \
  --header "Cc-Version: {api_version}"
~~~

By default, the earliest 200 audit logs for your CockroachDB {{ site.data.products.cloud }} organization are returned in ascending order, starting from when the organization was created. If more records are available, the response will include the field `next_starting_from` with a timestamp. To export the next batch of entries, send a second request and set `starting_from` to the value of `next_starting_from`.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/auditlogevents?starting_from=2022-10-09T02:40:35.054818Z \
  --header "Authorization: Bearer {secret_key}" \
  --header "Cc-Version: {api_version}"
~~~

## Export audit logs in descending order

This example requests the 300 most recent audit logs, starting from the current timestamp.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/auditlogevents?sort_order=DESC&limit=300 \
  --header "Authorization: Bearer {secret_key}" \
  --header "Cc-Version: {api_version}"
~~~

To request the next batch of entries in the same direction, send a second request with the same values for `sort_order` and `limit` and set `starting_from` to the value of `next_starting_from`. When there are no more results to fetch (because you have reached when your CockroachDB {{ site.data.products.cloud }} organization was created), no `next_starting_from` field is returned.

## Events adjacent to a specific timestamp

This example shows how to retrieve the 200 events on each side of a given timestamp by invoking the API twice, with the same timestamp and a different sort order for each request. The sort order determines whether the specified timestamp is at the beginning or end of the list. These examples use the default value for `limit`.

First, retrieve roughly 200 entries for the specified timestamp and later.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/auditlogevents?starting_from=2022-10-09T02:40:00.262143Z&sort_order=ASC \
  --header "Authorization: Bearer {secret_key}" \
  --header "Cc-Version: {api_version}"
~~~

Next, retrieve roughly 200 less recent entries for the specified timestamp and earlier.

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/auditlogevents?starting_from=2022-10-09T02:40:00.262143Z&sort_order=DESC \
  --header "Authorization: Bearer {secret_key}" \
  --header "Cc-Version: {api_version}"
~~~

All entries for the timestamp itself are included in both sets of results. Duplicated entries have the same `id`.

## What's next?

- Learn more about the [Cloud API]({% link cockroachcloud/cloud-api.md %})
