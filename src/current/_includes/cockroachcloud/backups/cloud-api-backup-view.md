### View managed backups

To view a list of managed backups on a cluster with timestamps and their respective IDs, send a `GET` request to the `/v1/clusters/{cluster_id}/backups` endpoint:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
--url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/backups \
--header "Authorization: Bearer {secret_key}" \
~~~

If the request is successful, the client recieves a JSON response listing backups with their unique `{id}`. The `{as_of_time}` timestamp describes the system time of the cluster when the backup was created:

~~~ json
{
  "backups": [
    {
      "id": "example-157a-4b04-8f72-3179369a50d9",
      "as_of_time": "2025-07-25T15:45:00Z"
    },
    {
      "id": "example-c090-429c-9f84-2b1297f5de89",
      "as_of_time": "2025-07-25T15:35:32Z"
    },
    {
      "id": "example-4e41-44ec-926a-0cc368efdea2",
      "as_of_time": "2025-07-25T15:00:00Z"
    },
    {
      "id": "example-3c67-4822-b7b9-90c2d8cc06a3",
      "as_of_time": "2025-07-25T14:56:15Z"
    },
    {
      "id": "example-abef-4191-aa98-36a019da97c2",
      "as_of_time": "2025-07-25T14:52:05.637170Z"
    }
  ],
  "pagination": null
~~~
