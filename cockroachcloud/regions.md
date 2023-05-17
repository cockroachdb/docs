---
title: CockroachDB Cloud Regions
summary: Learn about the available regions for CockroachDB Cloud clusters.
toc: true
docs_area: deploy
---

{{ site.data.products.db }} clusters can be [created](create-your-cluster.html) in the following cloud regions.

{{site.data.alerts.callout_success}}
For optimal performance, configure your cluster's regions to be as near as possible to your client applications or other related workloads.
{{site.data.alerts.end}}

## AWS regions

{{ site.data.products.db }} clusters can be deployed in the following [AWS regions](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html):

Geographic Area | Region Name      | Location
----------------|------------------|---------
Asia Pacific    | `ap-northeast-1` | Tokyo
                | `ap-northeast-2` | Seoul
                | `ap-northeast-3` | Osaka
                | `ap-south-1`     | Mumbai
                | `ap-southeast-1` | Singapore
                | `ap-southeast-2` | Sydney
North America   | `ca-central-1`   | Central Canada
                | `us-east-2`      | Ohio
                | `us-west-2`      | Oregon
South America   | `sa-east-1`      | Sao Paolo
Western Europe  | `eu-central-1`   | Frankfurt
                | `eu-north-1`     | Stockholm
                | `eu-west-1`      | Ireland
                | `eu-west-2`      | London
                | `eu-west-3`      | Paris

## Azure regions

{{site.data.alerts.callout_info}}
{% include feature-phases/azure-limited-access.md %}
{{site.data.alerts.end}}

{{ site.data.products.db }} clusters can be deployed in the following [Azure regions](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview#regions):

Geographic Area | Region Name     | Location
----------------|-----------------|---------
North America   | `eastus2`       | East Coast - Virginia
Western Europe  | `westeurope`    | Netherlands

## GCP regions

{{ site.data.products.db }} clusters can be deployed in the following [GCP regions](https://cloud.google.com/compute/docs/regions-zones):

Geographic Area | Region Name               | Location
----------------|---------------------------|---------
Asia Pacific    | `asia-east1`              | Changhua County
                | `asia-east2`              | Hong Kong
                | `asia-northeast1`         | Tokyo
                | `asia-southeast1`         | Jurong West
                | `australia-southeast1`    | Australia
North America   | `northamerica-northeast1` | Montréal
                | `us-central1`             | Iowa
                | `us-east1`                | South Carolina
                | `us-west1`                | Oregon
                | `us-west2`                | California
South America   | `southamerica-east1`      | São Paulo
Western Europe  | `europe-west1`            | St. Ghislain
                | `europe-west2`            | London
                | `europe-west3`            | Frankfurt
                | `europe-west4`            | Eemshaven
