[VPC Peering](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#vpc-peering) and [AWS PrivateLink](https://www.cockroachlabs.com/docs/cockroachcloud/network-authorization#aws-privatelink) in CockroachDB {{ site.data.products.dedicated }} clusters do **not** support connecting to a [Kafka](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/changefeed-sinks#kafka) sink's internal IP addresses for [changefeeds](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/change-data-capture-overview). To connect to a Kafka sink from CockroachDB {{ site.data.products.dedicated }}, it is necessary to expose the Kafka cluster's external IP address and open ports with firewall rules to allow access from a CockroachDB {{ site.data.products.dedicated }} cluster.