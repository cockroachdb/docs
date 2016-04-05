## Operators

`%` | Return
--- | ---
`decimal % decimal` | `decimal`
`float % float` | `float`
`int % int` | `int`

`&` | Return
--- | ---
`int & int` | `int`

`*` | Return
--- | ---
`decimal * decimal` | `decimal`
`float * float` | `float`
`int * int` | `int`
`int * interval` | `interval`
`interval * int` | `interval`

`+` | Return
--- | ---
`+decimal` | `decimal`
`+float` | `float`
`+int` | `int`
`date + int` | `date`
`decimal + decimal` | `decimal`
`float + float` | `float`
`int + date` | `date`
`int + int` | `int`
`interval + interval` | `interval`
`interval + timestamp` | `timestamp`
`timestamp + interval` | `timestamp`

`-` | Return
--- | ---
`-decimal` | `decimal`
`-float` | `float`
`-int` | `int`
`date - date` | `int`
`date - int` | `date`
`decimal - decimal` | `decimal`
`float - float` | `float`
`int - int` | `int`
`interval - interval` | `interval`
`timestamp - interval` | `timestamp`
`timestamp - timestamp` | `interval`

`/` | Return
--- | ---
`decimal / decimal` | `decimal`
`float / float` | `float`
`int / int` | `float`
`interval / int` | `interval`

`<` | Return
--- | ---
`bool < bool` | `bool`
`bytes < bytes` | `bool`
`date < date` | `bool`
`decimal < decimal` | `bool`
`decimal < float` | `bool`
`decimal < int` | `bool`
`float < decimal` | `bool`
`float < float` | `bool`
`float < int` | `bool`
`int < decimal` | `bool`
`int < float` | `bool`
`int < int` | `bool`
`interval < interval` | `bool`
`string < string` | `bool`
`timestamp < timestamp` | `bool`

`<<` | Return
--- | ---
`int << int` | `int`

`<=` | Return
--- | ---
`bool <= bool` | `bool`
`bytes <= bytes` | `bool`
`date <= date` | `bool`
`decimal <= decimal` | `bool`
`decimal <= float` | `bool`
`decimal <= int` | `bool`
`float <= decimal` | `bool`
`float <= float` | `bool`
`float <= int` | `bool`
`int <= decimal` | `bool`
`int <= float` | `bool`
`int <= int` | `bool`
`interval <= interval` | `bool`
`string <= string` | `bool`
`timestamp <= timestamp` | `bool`

`=` | Return
--- | ---
`bool = bool` | `bool`
`bytes = bytes` | `bool`
`date = date` | `bool`
`decimal = decimal` | `bool`
`decimal = float` | `bool`
`decimal = int` | `bool`
`float = decimal` | `bool`
`float = float` | `bool`
`float = int` | `bool`
`int = decimal` | `bool`
`int = float` | `bool`
`int = int` | `bool`
`interval = interval` | `bool`
`string = string` | `bool`
`timestamp = timestamp` | `bool`
`tuple = tuple` | `bool`

`>>` | Return
--- | ---
`int >> int` | `int`

`IN` | Return
--- | ---
`bool IN tuple` | `bool`
`bytes IN tuple` | `bool`
`date IN tuple` | `bool`
`float IN tuple` | `bool`
`int IN tuple` | `bool`
`interval IN tuple` | `bool`
`string IN tuple` | `bool`
`timestamp IN tuple` | `bool`
`tuple IN tuple` | `bool`

`LIKE` | Return
--- | ---
`string LIKE string` | `bool`

`SIMILAR TO` | Return
--- | ---
`string SIMILAR TO string` | `bool`

`^` | Return
--- | ---
`int ^ int` | `int`

`|` | Return
--- | ---
`int | int` | `int`

`||` | Return
--- | ---
`bytes || bytes` | `bytes`
`string || string` | `string`

`~` | Return
--- | ---
`~int` | `int`

