### ANYELEMENT Functions

Function | Return
--- | ---
pg_catalog.pg_typeof(anyelement) | [string](string.html)

### Comparison Functions

Function | Return
--- | ---
greatest(anyelement...) | anyelement
least(anyelement...) | anyelement

### Date and Time Functions

Function | Return
--- | ---
age([timestamptz](timestamp.html)) | [interval](interval.html)
age([timestamptz](timestamp.html), [timestamptz](timestamp.html)) | [interval](interval.html)
clock_timestamp() | [timestamp](timestamp.html)
clock_timestamp() | [timestamptz](timestamp.html)
crdb_internal.force_retry([interval](interval.html)) | [int](int.html)
current_date() | [date](date.html)
current_timestamp() | [timestamp](timestamp.html)
current_timestamp() | [timestamptz](timestamp.html)
experimental_strptime([string](string.html), [string](string.html)) | [timestamptz](timestamp.html)
extract([string](string.html), [timestamp](timestamp.html)) | [int](int.html)
extract_duration([string](string.html), [interval](interval.html)) | [int](int.html)
now() | [timestamp](timestamp.html)
now() | [timestamptz](timestamp.html)
statement_timestamp() | [timestamp](timestamp.html)
statement_timestamp() | [timestamptz](timestamp.html)
transaction_timestamp() | [timestamp](timestamp.html)
transaction_timestamp() | [timestamptz](timestamp.html)

### ID Generation Functions

Function | Return
--- | ---
experimental_unique_bytes() | [bytes](bytes.html)
experimental_uuid_v4() | [bytes](bytes.html)
unique_rowid() | [int](int.html)
uuid_v4() | [bytes](bytes.html)

### Math and Numeric Functions

Function | Return
--- | ---
abs([decimal](decimal.html)) | [decimal](decimal.html)
abs([float](float.html)) | [float](float.html)
abs([int](int.html)) | [int](int.html)
acos([float](float.html)) | [float](float.html)
asin([float](float.html)) | [float](float.html)
atan([float](float.html)) | [float](float.html)
atan2([float](float.html), [float](float.html)) | [float](float.html)
cbrt([decimal](decimal.html)) | [decimal](decimal.html)
cbrt([float](float.html)) | [float](float.html)
ceil([decimal](decimal.html)) | [decimal](decimal.html)
ceil([float](float.html)) | [float](float.html)
ceiling([decimal](decimal.html)) | [decimal](decimal.html)
ceiling([float](float.html)) | [float](float.html)
cos([float](float.html)) | [float](float.html)
cot([float](float.html)) | [float](float.html)
degrees([float](float.html)) | [float](float.html)
div([decimal](decimal.html), [decimal](decimal.html)) | [decimal](decimal.html)
div([float](float.html), [float](float.html)) | [float](float.html)
div([int](int.html), [int](int.html)) | [int](int.html)
exp([decimal](decimal.html)) | [decimal](decimal.html)
exp([float](float.html)) | [float](float.html)
floor([decimal](decimal.html)) | [decimal](decimal.html)
floor([float](float.html)) | [float](float.html)
ln([decimal](decimal.html)) | [decimal](decimal.html)
ln([float](float.html)) | [float](float.html)
log([decimal](decimal.html)) | [decimal](decimal.html)
log([float](float.html)) | [float](float.html)
mod([decimal](decimal.html), [decimal](decimal.html)) | [decimal](decimal.html)
mod([float](float.html), [float](float.html)) | [float](float.html)
mod([int](int.html), [int](int.html)) | [int](int.html)
pi() | [float](float.html)
pow([decimal](decimal.html), [decimal](decimal.html)) | [decimal](decimal.html)
pow([float](float.html), [float](float.html)) | [float](float.html)
pow([int](int.html), [int](int.html)) | [int](int.html)
power([decimal](decimal.html), [decimal](decimal.html)) | [decimal](decimal.html)
power([float](float.html), [float](float.html)) | [float](float.html)
power([int](int.html), [int](int.html)) | [int](int.html)
radians([float](float.html)) | [float](float.html)
random() | [float](float.html)
round([decimal](decimal.html)) | [decimal](decimal.html)
round([decimal](decimal.html), [int](int.html)) | [decimal](decimal.html)
round([float](float.html)) | [float](float.html)
round([float](float.html), [int](int.html)) | [float](float.html)
sign([decimal](decimal.html)) | [decimal](decimal.html)
sign([float](float.html)) | [float](float.html)
sign([int](int.html)) | [int](int.html)
sin([float](float.html)) | [float](float.html)
sqrt([decimal](decimal.html)) | [decimal](decimal.html)
sqrt([float](float.html)) | [float](float.html)
tan([float](float.html)) | [float](float.html)
to_hex([int](int.html)) | [string](string.html)
trunc([decimal](decimal.html)) | [decimal](decimal.html)
trunc([float](float.html)) | [float](float.html)

### SETOF TUPLE{INT} Functions

Function | Return
--- | ---
pg_catalog.generate_series([int](int.html), [int](int.html)) | setof tuple{[int](int.html)}
pg_catalog.generate_series([int](int.html), [int](int.html), [int](int.html)) | setof tuple{[int](int.html)}

### String and Byte Functions

Function | Return
--- | ---
ascii([string](string.html)) | [int](int.html)
btrim([string](string.html)) | [string](string.html)
btrim([string](string.html), [string](string.html)) | [string](string.html)
concat([string](string.html)...) | [string](string.html)
concat_ws([string](string.html)...) | [string](string.html)
experimental_strftime([date](date.html), [string](string.html)) | [string](string.html)
experimental_strftime([timestamp](timestamp.html), [string](string.html)) | [string](string.html)
experimental_strftime([timestamptz](timestamp.html), [string](string.html)) | [string](string.html)
from_ip([bytes](bytes.html)) | [string](string.html)
from_uuid([bytes](bytes.html)) | [string](string.html)
initcap([string](string.html)) | [string](string.html)
left([bytes](bytes.html), [int](int.html)) | [bytes](bytes.html)
left([string](string.html), [int](int.html)) | [string](string.html)
length([bytes](bytes.html)) | [int](int.html)
length([string](string.html)) | [int](int.html)
lower([string](string.html)) | [string](string.html)
ltrim([string](string.html)) | [string](string.html)
ltrim([string](string.html), [string](string.html)) | [string](string.html)
md5([string](string.html)) | [string](string.html)
octet_length([bytes](bytes.html)) | [int](int.html)
octet_length([string](string.html)) | [int](int.html)
overlay([string](string.html), [string](string.html), [int](int.html)) | [string](string.html)
overlay([string](string.html), [string](string.html), [int](int.html), [int](int.html)) | [string](string.html)
pg_catalog.pg_get_expr(pg_node_tree: [string](string.html), relation_oid: [int](int.html)) | [string](string.html)
pg_catalog.pg_get_expr(pg_node_tree: [string](string.html), relation_oid: [int](int.html), pretty_[bool](bool.html): [bool](bool.html)) | [string](string.html)
pg_catalog.pg_get_userbyid(role_oid: [int](int.html)) | [string](string.html)
regexp_extract([string](string.html), [string](string.html)) | [string](string.html)
regexp_replace([string](string.html), [string](string.html), [string](string.html)) | [string](string.html)
regexp_replace([string](string.html), [string](string.html), [string](string.html), [string](string.html)) | [string](string.html)
repeat([string](string.html), [int](int.html)) | [string](string.html)
replace(input: [string](string.html), from: [string](string.html), to: [string](string.html)) | [string](string.html)
reverse([string](string.html)) | [string](string.html)
right([bytes](bytes.html), [int](int.html)) | [bytes](bytes.html)
right([string](string.html), [int](int.html)) | [string](string.html)
rtrim([string](string.html)) | [string](string.html)
rtrim([string](string.html), [string](string.html)) | [string](string.html)
sha1([string](string.html)) | [string](string.html)
sha256([string](string.html)) | [string](string.html)
split_part([string](string.html), [string](string.html), [int](int.html)) | [string](string.html)
strpos([string](string.html), [string](string.html)) | [int](int.html)
substr([string](string.html), [int](int.html)) | [string](string.html)
substr([string](string.html), [int](int.html), [int](int.html)) | [string](string.html)
substr([string](string.html), [string](string.html)) | [string](string.html)
substr([string](string.html), [string](string.html), [string](string.html)) | [string](string.html)
substring([string](string.html), [int](int.html)) | [string](string.html)
substring([string](string.html), [int](int.html), [int](int.html)) | [string](string.html)
substring([string](string.html), [string](string.html)) | [string](string.html)
substring([string](string.html), [string](string.html), [string](string.html)) | [string](string.html)
to_ip([string](string.html)) | [bytes](bytes.html)
to_uuid([string](string.html)) | [bytes](bytes.html)
translate(input: [string](string.html), from: [string](string.html), to: [string](string.html)) | [string](string.html)
upper([string](string.html)) | [string](string.html)

### System Info Functions

Function | Return
--- | ---
array_length(anyelement[], [int](int.html)) | [int](int.html)
array_lower(anyelement[], [int](int.html)) | [int](int.html)
array_upper(anyelement[], [int](int.html)) | [int](int.html)
cluster_logical_timestamp() | [decimal](decimal.html)
current_schema() | [string](string.html)
current_schemas([bool](bool.html)) | [string](string.html)[]
version() | [string](string.html)

