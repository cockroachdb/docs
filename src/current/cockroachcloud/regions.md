---
title: CockroachDB Cloud Regions
summary: Learn about the available regions for CockroachDB Cloud clusters.
toc: true
docs_area: deploy
cloud: true
---

CockroachDB {{ site.data.products.cloud }} clusters can be [created]({% link cockroachcloud/create-your-cluster.md %}) in the following cloud regions.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="serverless">CockroachDB {{ site.data.products.serverless }}</button>
    <button class="filter-button page-level" data-scope="dedicated">CockroachDB {{ site.data.products.dedicated }}</button>
</div>

{{site.data.alerts.callout_success}}
For optimal performance, configure your cluster's regions to be as near as possible to your client applications or other related workloads.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="serverless">

{{site.data.alerts.callout_info}}
Creating a CockroachDB {{ site.data.products.serverless }} cluster on Azure is not supported.
{{site.data.alerts.end}}
</section>

## AWS regions

<section class="filter-content" markdown="1" data-scope="serverless">

CockroachDB {{ site.data.products.serverless }} clusters can be deployed in the following [AWS regions](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html):


Geographic Area | Region Name      | Location
----------------|------------------|---------
Asia Pacific    | `ap-south-1`     | Mumbai
                | `ap-southeast-1` | Singapore
North America   | `us-east-1`      | N. Virginia
                | `us-west-2`      | Oregon
Western Europe  | `eu-central-1`   | Frankfurt
                | `eu-west-1`      | Ireland
</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

CockroachDB {{ site.data.products.dedicated }} clusters can be deployed in the following [AWS regions](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html):

Geographic Area | Region Name      | Location
----------------|------------------|---------
Asia Pacific    | `ap-east-1`      | Hong Kong
                | `ap-southeast-3` | Jakarta
                | `ap-northeast-1` | Tokyo
                | `ap-northeast-2` | Seoul
                | `ap-northeast-3` | Osaka
                | `ap-south-1`     | Mumbai
                | `ap-southeast-1` | Singapore
                | `ap-southeast-2` | Sydney
Middle East     | `me-south-1`     | Bahrain
                | `il-central-1`   | Tel Aviv
                | `me-central-1`   | United Arab Emirates
North America   | `ca-west-1`      | Calgary
                | `ca-central-1`   | Central Canada
                | `us-east-1`      | N. Virginia
                | `us-east-2`      | Ohio
                | `us-west-2`      | Oregon
South America   | `sa-east-1`      | Sao Paolo
Western Europe  | `eu-central-1`   | Frankfurt
                | `eu-west-1`      | Ireland
                | `eu-west-2`      | London
                | `eu-south-1`     | Milan
                | `eu-north-1`     | Stockholm
                | `eu-west-3`      | Paris

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

## Azure regions

CockroachDB {{ site.data.products.dedicated }} clusters can be deployed in the following [Azure regions](https://learn.microsoft.com/azure/reliability/availability-zones-overview#regions):

Geographic Area | Region Name          | Location
----------------|----------------------|---------
Africa          | `southafricanorth`   | Johannesburg
Asia Pacific    | `australiaeast`      | New South Wales
                | `japaneast`          | Tokyo
                | `koreacentral`       | Seoul
                | `centralindia`       | Pune
                | `eastasia`           | Hong Kong
                | `southeastasia`      | Singapore
Middle East     | `uaenorth`           | Dubai
North America   | `canadacentral`      | Toronto
                | `centralus`          | Iowa
                | `eastus`             | Virginia
                | `eastus2`            | Virginia
                | `southcentralus`     | Texas
                | `westus2`            | Washington
                | `westus3`            | Washington
Western Europe  | `francecentral`      | Paris
                | `germanywestcentral` | Frankfurt
                | `northeurope`        | Ireland
                | `norwayeast`         | Oslo
                | `polandcentral`      | Warsaw
                | `swedencentral`      | Gävle
                | `switzerlandnorth`   | Zürich
                | `uksouth`            | London
                | `westeurope`         | Netherlands

</section>

## GCP regions

<section class="filter-content" markdown="1" data-scope="serverless">

CockroachDB {{ site.data.products.serverless }} clusters can be deployed in the following [GCP regions](https://cloud.google.com/compute/docs/regions-zones):

Geographic Area | Region Name               | Location
----------------|---------------------------|---------
Asia Pacific    | `asia-southeast1`         | Jurong West
North America   | `us-central1`             | Iowa
                | `us-east1`                | South Carolina
                | `us-west2`                | California
South America   | `southamerica-east1`      | São Paulo
Western Europe  | `europe-west1`            | St. Ghislain

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

CockroachDB {{ site.data.products.dedicated }} clusters can be deployed in the following [GCP regions](https://cloud.google.com/compute/docs/regions-zones):

Geographic Area | Region Name               | Location
----------------|---------------------------|---------
Asia Pacific    | `asia-east1`              | Changhua County
                | `asia-east2`              | Hong Kong
                | `asia-northeast1`         | Tokyo
                | `asia-northeast2`         | Osaka
                | `asia-northeast3`         | Seoul
                | `asia-south1`             | Mumbai
                | `asia-south2`             | Delhi
                | `asia-southeast1`         | Jurong West
                | `asia-southeast2`         | Jakarta
                | `australia-southeast1`    | Sydney
                | `australia-southeast2`    | Melbourne
Middle East     | `me-central1`             | Doha
                | `me-west1`                | Tel Aviv
North America   | `northamerica-northeast1` | Montréal
                | `northamerica-northeast2` | Toronto
                | `us-central1`             | Iowa
                | `us-east1`                | South Carolina
                | `us-east4`                | Virginia
                | `us-east5`                | Columbus
                | `us-south1`               | Dallas
                | `us-west1`                | Oregon
                | `us-west2`                | California
                | `us-west3`                | Salt Lake City
                | `us-west4`                | Las Vegas
South America   | `southamerica-east1`      | São Paulo
Western Europe  | `europe-central2`         | Warsaw
                | `europe-north1`           | Hamina
                | `europe-southwest1`       | Madrid
                | `europe-west1`            | St. Ghislain
                | `europe-west2`            | London
                | `europe-west3`            | Frankfurt
                | `europe-west4`            | Eemshaven
                | `europe-west6`            | Zürich
                | `europe-west9`            | Paris
                | `europe-west12`           | Turin

</section>
