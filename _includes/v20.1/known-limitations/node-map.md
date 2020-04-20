You cannot assign latitude/longitude coordinates to localities if the components of your localities have the same name. For example, consider the following partial configuration:

|  Node | Region | Datacenter |
|  ------ | ------ | ------ |
|  Node1 | us-east | datacenter-1 |
|  Node2 | us-west | datacenter-1 |

In this case, if you try to set the latitude/longitude coordinates to the datacenter level of the localities, you will get the "primary key exists" error and the Node Map will not be displayed. You can, however, set the latitude/longitude coordinates to the region components of the localities, and the Node Map will be displayed.
