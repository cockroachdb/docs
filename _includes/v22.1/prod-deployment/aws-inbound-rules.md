#### Inter-node and load balancer-node communication

 Field | Value
-------|-------------------
 Port Range | **26257**
 Source | The ID of your security group (e.g., *sg-07ab277a*)

#### Application data

 Field | Value
-------|-------------------
 Port Range | **26257**
 Source | Your application's IP ranges

#### DB Console

 Field | Value
-------|-------------------
 Port Range | **8080**
 Source | Your network's IP ranges

You can set your network IP by selecting "My IP" in the Source field.

#### Load balancer-health check communication

 Field | Value
-------|-------------------
 Port Range | **8080**
 Source | The IP range of your VPC in CIDR notation (e.g., 10.12.0.0/16)

 To get the IP range of a VPC, open the [Amazon VPC console](https://console.aws.amazon.com/vpc/) and find the VPC listed in the section called Your VPCs.