### T Functions

Function | Return
--- | ---
greatest(T, ...) | T
least(T, ...) | T

### bytes Functions

Function | Return
--- | ---
experimental_unique_bytes() | [bytes](bytes.html)
experimental_uuid_v4() | [bytes](bytes.html)
left([bytes](bytes.html), [int](int.html)) | [bytes](bytes.html)
right([bytes](bytes.html), [int](int.html)) | [bytes](bytes.html)
uuid_v4() | [bytes](bytes.html)

### date Functions

Function | Return
--- | ---
current_date() | [date](date.html)

### decimal Functions

Function | Return
--- | ---
abs([decimal](decimal.html)) | [decimal](decimal.html)
cbrt([decimal](decimal.html)) | [decimal](decimal.html)
ceil([decimal](decimal.html)) | [decimal](decimal.html)
ceiling([decimal](decimal.html)) | [decimal](decimal.html)
cluster_logical_timestamp() | [decimal](decimal.html)
div([decimal](decimal.html), [decimal](decimal.html)) | [decimal](decimal.html)
exp([decimal](decimal.html)) | [decimal](decimal.html)
floor([decimal](decimal.html)) | [decimal](decimal.html)
ln([decimal](decimal.html)) | [decimal](decimal.html)
log([decimal](decimal.html)) | [decimal](decimal.html)
mod([decimal](decimal.html), [decimal](decimal.html)) | [decimal](decimal.html)
pow([decimal](decimal.html), [decimal](decimal.html)) | [decimal](decimal.html)
power([decimal](decimal.html), [decimal](decimal.html)) | [decimal](decimal.html)
round([decimal](decimal.html)) | [decimal](decimal.html)
round([decimal](decimal.html), [int](int.html)) | [decimal](decimal.html)
sign([decimal](decimal.html)) | [decimal](decimal.html)
sqrt([decimal](decimal.html)) | [decimal](decimal.html)
trunc([decimal](decimal.html)) | [decimal](decimal.html)

### float Functions

Function | Return
--- | ---
abs([float](float.html)) | [float](float.html)
acos([float](float.html)) | [float](float.html)
asin([float](float.html)) | [float](float.html)
atan([float](float.html)) | [float](float.html)
atan2([float](float.html), [float](float.html)) | [float](float.html)
cbrt([float](float.html)) | [float](float.html)
ceil([float](float.html)) | [float](float.html)
ceiling([float](float.html)) | [float](float.html)
cos([float](float.html)) | [float](float.html)
cot([float](float.html)) | [float](float.html)
degrees([float](float.html)) | [float](float.html)
div([float](float.html), [float](float.html)) | [float](float.html)
exp([float](float.html)) | [float](float.html)
floor([float](float.html)) | [float](float.html)
ln([float](float.html)) | [float](float.html)
log([float](float.html)) | [float](float.html)
mod([float](float.html), [float](float.html)) | [float](float.html)
pi() | [float](float.html)
pow([float](float.html), [float](float.html)) | [float](float.html)
power([float](float.html), [float](float.html)) | [float](float.html)
radians([float](float.html)) | [float](float.html)
random() | [float](float.html)
round([float](float.html)) | [float](float.html)
round([float](float.html), [int](int.html)) | [float](float.html)
sign([float](float.html)) | [float](float.html)
sin([float](float.html)) | [float](float.html)
sqrt([float](float.html)) | [float](float.html)
tan([float](float.html)) | [float](float.html)
trunc([float](float.html)) | [float](float.html)

### int Functions

Function | Return
--- | ---
abs([int](int.html)) | [int](int.html)
ascii([string](string.html)) | [int](int.html)
extract([string](string.html), [timestamp](timestamp.html)) | [int](int.html)
length([bytes](bytes.html)) | [int](int.html)
length([string](string.html)) | [int](int.html)
mod([int](int.html), [int](int.html)) | [int](int.html)
octet_length([bytes](bytes.html)) | [int](int.html)
octet_length([string](string.html)) | [int](int.html)
sign([int](int.html)) | [int](int.html)
strpos([string](string.html), [string](string.html)) | [int](int.html)
unique_rowid() | [int](int.html)

### interval Functions

Function | Return
--- | ---
age([timestamp](timestamp.html)) | [interval](interval.html)
age([timestamp](timestamp.html), [timestamp](timestamp.html)) | [interval](interval.html)

### string Functions

Function | Return
--- | ---
btrim([string](string.html)) | [string](string.html)
btrim([string](string.html), [string](string.html)) | [string](string.html)
concat(string, ...) | [string](string.html)
concat_ws(string, ...) | [string](string.html)
format_timestamp_ns([timestamp](timestamp.html)) | [string](string.html)
initcap([string](string.html)) | [string](string.html)
left([string](string.html), [int](int.html)) | [string](string.html)
lower([string](string.html)) | [string](string.html)
ltrim([string](string.html)) | [string](string.html)
ltrim([string](string.html), [string](string.html)) | [string](string.html)
md5([string](string.html)) | [string](string.html)
overlay([string](string.html), [string](string.html), [int](int.html)) | [string](string.html)
overlay([string](string.html), [string](string.html), [int](int.html), [int](int.html)) | [string](string.html)
regexp_extract([string](string.html), [string](string.html)) | [string](string.html)
regexp_replace([string](string.html), [string](string.html), [string](string.html)) | [string](string.html)
regexp_replace([string](string.html), [string](string.html), [string](string.html), [string](string.html)) | [string](string.html)
repeat([string](string.html), [int](int.html)) | [string](string.html)
replace([string](string.html), [string](string.html), [string](string.html)) | [string](string.html)
reverse([string](string.html)) | [string](string.html)
right([string](string.html), [int](int.html)) | [string](string.html)
rtrim([string](string.html)) | [string](string.html)
rtrim([string](string.html), [string](string.html)) | [string](string.html)
sha1([string](string.html)) | [string](string.html)
sha256([string](string.html)) | [string](string.html)
split_part([string](string.html), [string](string.html), [int](int.html)) | [string](string.html)
substr([string](string.html), [int](int.html)) | [string](string.html)
substr([string](string.html), [int](int.html), [int](int.html)) | [string](string.html)
substr([string](string.html), [string](string.html)) | [string](string.html)
substr([string](string.html), [string](string.html), [string](string.html)) | [string](string.html)
substring([string](string.html), [int](int.html)) | [string](string.html)
substring([string](string.html), [int](int.html), [int](int.html)) | [string](string.html)
substring([string](string.html), [string](string.html)) | [string](string.html)
substring([string](string.html), [string](string.html), [string](string.html)) | [string](string.html)
to_hex([int](int.html)) | [string](string.html)
translate([string](string.html), [string](string.html), [string](string.html)) | [string](string.html)
upper([string](string.html)) | [string](string.html)
version() | [string](string.html)

### timestamp Functions

Function | Return
--- | ---
clock_timestamp() | [timestamp](timestamp.html)
current_timestamp() | [timestamp](timestamp.html)
current_timestamp_ns() | [timestamp](timestamp.html)
now() | [timestamp](timestamp.html)
parse_timestamp_ns([string](string.html)) | [timestamp](timestamp.html)
statement_timestamp() | [timestamp](timestamp.html)
transaction_timestamp() | [timestamp](timestamp.html)

