`%` | Return
--- | ---
[decimal](decimal.html) `%` [decimal](decimal.html) | [decimal](decimal.html)
[float](float.html) `%` [float](float.html) | [float](float.html)
[int](int.html) `%` [int](int.html) | [int](int.html)

`&` | Return
--- | ---
[int](int.html) `&` [int](int.html) | [int](int.html)

`*` | Return
--- | ---
[decimal](decimal.html) `*` [decimal](decimal.html) | [decimal](decimal.html)
[decimal](decimal.html) `*` [int](int.html) | [decimal](decimal.html)
[float](float.html) `*` [float](float.html) | [float](float.html)
[int](int.html) `*` [decimal](decimal.html) | [decimal](decimal.html)
[int](int.html) `*` [int](int.html) | [int](int.html)
[int](int.html) `*` [interval](interval.html) | [interval](interval.html)
[interval](interval.html) `*` [int](int.html) | [interval](interval.html)

`+` | Return
--- | ---
`+`[decimal](decimal.html) | [decimal](decimal.html)
`+`[float](float.html) | [float](float.html)
`+`[int](int.html) | [int](int.html)
[date](date.html) `+` [int](int.html) | [date](date.html)
[decimal](decimal.html) `+` [decimal](decimal.html) | [decimal](decimal.html)
[float](float.html) `+` [float](float.html) | [float](float.html)
[int](int.html) `+` [date](date.html) | [date](date.html)
[int](int.html) `+` [int](int.html) | [int](int.html)
[interval](interval.html) `+` [interval](interval.html) | [interval](interval.html)
[interval](interval.html) `+` [timestamp](timestamp.html) | [timestamp](timestamp.html)
[interval](interval.html) `+` timestamptz | timestamptz
[timestamp](timestamp.html) `+` [interval](interval.html) | [timestamp](timestamp.html)
timestamptz `+` [interval](interval.html) | timestamptz

`-` | Return
--- | ---
`-`[decimal](decimal.html) | [decimal](decimal.html)
`-`[float](float.html) | [float](float.html)
`-`[int](int.html) | [int](int.html)
[date](date.html) `-` [date](date.html) | [int](int.html)
[date](date.html) `-` [int](int.html) | [date](date.html)
[decimal](decimal.html) `-` [decimal](decimal.html) | [decimal](decimal.html)
[float](float.html) `-` [float](float.html) | [float](float.html)
[int](int.html) `-` [int](int.html) | [int](int.html)
[interval](interval.html) `-` [interval](interval.html) | [interval](interval.html)
[timestamp](timestamp.html) `-` [interval](interval.html) | [timestamp](timestamp.html)
[timestamp](timestamp.html) `-` [timestamp](timestamp.html) | [interval](interval.html)
timestamptz `-` [interval](interval.html) | timestamptz
timestamptz `-` timestamptz | [interval](interval.html)

`/` | Return
--- | ---
[decimal](decimal.html) `/` [decimal](decimal.html) | [decimal](decimal.html)
[float](float.html) `/` [float](float.html) | [float](float.html)
[int](int.html) `/` [int](int.html) | [decimal](decimal.html)
[interval](interval.html) `/` [int](int.html) | [interval](interval.html)

`//` | Return
--- | ---
[decimal](decimal.html) `//` [decimal](decimal.html) | [decimal](decimal.html)
[float](float.html) `//` [float](float.html) | [float](float.html)
[int](int.html) `//` [int](int.html) | [int](int.html)

`<` | Return
--- | ---
[bool](bool.html) `<` [bool](bool.html) | [bool](bool.html)
[bytes](bytes.html) `<` [bytes](bytes.html) | [bool](bool.html)
[date](date.html) `<` [date](date.html) | [bool](bool.html)
[decimal](decimal.html) `<` [decimal](decimal.html) | [bool](bool.html)
[decimal](decimal.html) `<` [float](float.html) | [bool](bool.html)
[decimal](decimal.html) `<` [int](int.html) | [bool](bool.html)
[float](float.html) `<` [decimal](decimal.html) | [bool](bool.html)
[float](float.html) `<` [float](float.html) | [bool](bool.html)
[float](float.html) `<` [int](int.html) | [bool](bool.html)
[int](int.html) `<` [decimal](decimal.html) | [bool](bool.html)
[int](int.html) `<` [float](float.html) | [bool](bool.html)
[int](int.html) `<` [int](int.html) | [bool](bool.html)
[interval](interval.html) `<` [interval](interval.html) | [bool](bool.html)
[string](string.html) `<` [string](string.html) | [bool](bool.html)
[timestamp](timestamp.html) `<` [timestamp](timestamp.html) | [bool](bool.html)
timestamptz `<` timestamptz | [bool](bool.html)
tuple `<` tuple | [bool](bool.html)

`<<` | Return
--- | ---
[int](int.html) `<<` [int](int.html) | [int](int.html)

`<=` | Return
--- | ---
[bool](bool.html) `<=` [bool](bool.html) | [bool](bool.html)
[bytes](bytes.html) `<=` [bytes](bytes.html) | [bool](bool.html)
[date](date.html) `<=` [date](date.html) | [bool](bool.html)
[decimal](decimal.html) `<=` [decimal](decimal.html) | [bool](bool.html)
[decimal](decimal.html) `<=` [float](float.html) | [bool](bool.html)
[decimal](decimal.html) `<=` [int](int.html) | [bool](bool.html)
[float](float.html) `<=` [decimal](decimal.html) | [bool](bool.html)
[float](float.html) `<=` [float](float.html) | [bool](bool.html)
[float](float.html) `<=` [int](int.html) | [bool](bool.html)
[int](int.html) `<=` [decimal](decimal.html) | [bool](bool.html)
[int](int.html) `<=` [float](float.html) | [bool](bool.html)
[int](int.html) `<=` [int](int.html) | [bool](bool.html)
[interval](interval.html) `<=` [interval](interval.html) | [bool](bool.html)
[string](string.html) `<=` [string](string.html) | [bool](bool.html)
[timestamp](timestamp.html) `<=` [timestamp](timestamp.html) | [bool](bool.html)
timestamptz `<=` timestamptz | [bool](bool.html)
tuple `<=` tuple | [bool](bool.html)

`=` | Return
--- | ---
[bool](bool.html) `=` [bool](bool.html) | [bool](bool.html)
[bytes](bytes.html) `=` [bytes](bytes.html) | [bool](bool.html)
[date](date.html) `=` [date](date.html) | [bool](bool.html)
[decimal](decimal.html) `=` [decimal](decimal.html) | [bool](bool.html)
[decimal](decimal.html) `=` [float](float.html) | [bool](bool.html)
[decimal](decimal.html) `=` [int](int.html) | [bool](bool.html)
[float](float.html) `=` [decimal](decimal.html) | [bool](bool.html)
[float](float.html) `=` [float](float.html) | [bool](bool.html)
[float](float.html) `=` [int](int.html) | [bool](bool.html)
[int](int.html) `=` [decimal](decimal.html) | [bool](bool.html)
[int](int.html) `=` [float](float.html) | [bool](bool.html)
[int](int.html) `=` [int](int.html) | [bool](bool.html)
[interval](interval.html) `=` [interval](interval.html) | [bool](bool.html)
[string](string.html) `=` [string](string.html) | [bool](bool.html)
[timestamp](timestamp.html) `=` [timestamp](timestamp.html) | [bool](bool.html)
timestamptz `=` timestamptz | [bool](bool.html)
tuple `=` tuple | [bool](bool.html)

`>>` | Return
--- | ---
[int](int.html) `>>` [int](int.html) | [int](int.html)

`IN` | Return
--- | ---
[bool](bool.html) `IN` tuple | [bool](bool.html)
[bytes](bytes.html) `IN` tuple | [bool](bool.html)
[date](date.html) `IN` tuple | [bool](bool.html)
[float](float.html) `IN` tuple | [bool](bool.html)
[int](int.html) `IN` tuple | [bool](bool.html)
[interval](interval.html) `IN` tuple | [bool](bool.html)
[string](string.html) `IN` tuple | [bool](bool.html)
[timestamp](timestamp.html) `IN` tuple | [bool](bool.html)
timestamptz `IN` tuple | [bool](bool.html)
tuple `IN` tuple | [bool](bool.html)

`LIKE` | Return
--- | ---
[string](string.html) `LIKE` [string](string.html) | [bool](bool.html)

`SIMILAR TO` | Return
--- | ---
[string](string.html) `SIMILAR TO` [string](string.html) | [bool](bool.html)

`^` | Return
--- | ---
[int](int.html) `^` [int](int.html) | [int](int.html)

`|` | Return
--- | ---
[int](int.html) `|` [int](int.html) | [int](int.html)

`||` | Return
--- | ---
[bytes](bytes.html) `||` [bytes](bytes.html) | [bytes](bytes.html)
[string](string.html) `||` [string](string.html) | [string](string.html)

`~` | Return
--- | ---
`~`[int](int.html) | [int](int.html)

