Privilege | Levels
----------|------------
`ALL` | Database, Schema, Table, Sequence, Type
`CREATE` | Database, Schema, Table, Sequence
`DROP` | Database, Table, Sequence
`EXECUTE` | Function
`GRANT` | Database, Function, Schema, Table, Sequence, Type
`CONNECT` | Database
`SELECT` | Table, Sequence
`INSERT` | Table, Sequence
`DELETE` | Table, Sequence
`UPDATE` | Table, Sequence
`USAGE`  | Function, Schema, Sequence, Type
`ZONECONFIG` | Database, Table, Sequence
`EXTERNALCONNECTION` | System
`BACKUP` | System, Database, Table
`RESTORE` | System, Database
`EXTERNALIOIMPLICITACCESS` | System
`MODIFYCLUSTERSETTING` | <a name="modifyclustersetting"></a> {% if page.name == "authorization.md" %} [Global privilege](../grant.html#grant-global-privileges-on-the-entire-cluster) that allows users to use the [`SET CLUSTER SETTING`](../set-cluster-setting.html) statement. {% else %} [Global privilege](grant.html#grant-global-privileges-on-the-entire-cluster) that allows users to use the [`SET CLUSTER SETTING`](set-cluster-setting.html) statement. {% endif %}
