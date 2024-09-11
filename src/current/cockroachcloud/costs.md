# CockroachDB Cloud Costs \[WIP\]

The cost structure for a CockroachDB Cloud organization depends on its plan.

## Cost structures across CockroachDB Cloud plans

|  | CockroachDB Basic | CockroachDB Standard | CockroachDB Advanced |
| :---- | :---- | :---- | :---- |
| **Compute** | Usage-based via Request Units.  | Provisioned; cost per hour based on vCPU quantity, cloud provider, and region(s) | Provisioned; cost per hour per node based on vCPU quantity, cloud provider, and region(s) |
| **IOPS** | Usage-based via Request Units.  | Not factored into cost | Based on storage costs and varies per Cloud provider  |
| **Network** | Usage-based via Request Units.  | Usage-based,\`\` Cloud provider list price | Usage-based, Cloud provider list price |
| **Storage** | Usage-based (refer to [Pricing](https://www.cockroachlabs.com/pricing/))  | Usage-based, depending on Cloud provider and regions (refer to [Pricing](https://www.cockroachlabs.com/pricing/))  | Provisioned; cost per hour per node depends on cloud provider and regions.  |
| **Data Transfer** | Usage-based via Request Units.  | Usage-based | Usage-based |
| **Managed Backups** | Free daily backups; additional backups included in Request Units  | Usage-based | Usage-based |
| **Change Data Capture** | Included in Request Units  | Usage-based | Usage-based |

## Usage-based pricing for CockroachDB Standard and Advanced
<a id="usage-based-costs"></a>

WIP