## Functions

T functions | Return
--- | ---
greatest(T, ...) | T
least(T, ...) | T

bool functions | Return
--- | ---
max(bool) | bool
min(bool) | bool

bytes functions | Return
--- | ---
experimental_unique_bytes() | bytes
experimental_uuid_v4() | bytes
left(bytes, int) | bytes
max(bytes) | bytes
min(bytes) | bytes
right(bytes, int) | bytes

date functions | Return
--- | ---
current_date() | date
max(date) | date
min(date) | date

decimal functions | Return
--- | ---
abs(decimal) | decimal
avg(decimal) | decimal
cbrt(decimal) | decimal
ceil(decimal) | decimal
ceiling(decimal) | decimal
div(decimal, decimal) | decimal
exp(decimal) | decimal
floor(decimal) | decimal
ln(decimal) | decimal
log(decimal) | decimal
max(decimal) | decimal
min(decimal) | decimal
mod(decimal, decimal) | decimal
pow(decimal, decimal) | decimal
power(decimal, decimal) | decimal
round(decimal) | decimal
round(decimal, int) | decimal
sign(decimal) | decimal
sqrt(decimal) | decimal
stddev(decimal) | decimal
stddev(int) | decimal
sum(decimal) | decimal
trunc(decimal) | decimal
variance(decimal) | decimal
variance(int) | decimal

float functions | Return
--- | ---
abs(float) | float
acos(float) | float
asin(float) | float
atan(float) | float
atan2(float, float) | float
avg(float) | float
avg(int) | float
cbrt(float) | float
ceil(float) | float
ceiling(float) | float
cos(float) | float
cot(float) | float
degrees(float) | float
div(float, float) | float
exp(float) | float
floor(float) | float
ln(float) | float
log(float) | float
max(float) | float
min(float) | float
mod(float, float) | float
pi() | float
pow(float, float) | float
power(float, float) | float
radians(float) | float
random() | float
round(float) | float
round(float, int) | float
sign(float) | float
sin(float) | float
sqrt(float) | float
stddev(float) | float
sum(float) | float
tan(float) | float
trunc(float) | float
variance(float) | float

int functions | Return
--- | ---
abs(int) | int
ascii(string) | int
count(bool) | int
count(bytes) | int
count(date) | int
count(decimal) | int
count(float) | int
count(int) | int
count(interval) | int
count(string) | int
count(timestamp) | int
count(tuple) | int
extract(string, timestamp) | int
length(bytes) | int
length(string) | int
max(int) | int
min(int) | int
mod(int, int) | int
octet_length(bytes) | int
octet_length(string) | int
sign(int) | int
strpos(string, string) | int
sum(int) | int
transaction_timestamp_unique() | int
unique_rowid() | int

interval functions | Return
--- | ---
age(timestamp) | interval
age(timestamp, timestamp) | interval
max(interval) | interval
min(interval) | interval

string functions | Return
--- | ---
btrim(string) | string
btrim(string, string) | string
concat(string, ...) | string
concat_ws(string, ...) | string
initcap(string) | string
left(string, int) | string
lower(string) | string
ltrim(string) | string
ltrim(string, string) | string
max(string) | string
md5(string) | string
min(string) | string
overlay(string, string, int) | string
overlay(string, string, int, int) | string
regexp_extract(string, string) | string
regexp_replace(string, string, string) | string
regexp_replace(string, string, string, string) | string
repeat(string, int) | string
replace(string, string, string) | string
reverse(string) | string
right(string, int) | string
rtrim(string) | string
rtrim(string, string) | string
sha1(string) | string
sha256(string) | string
split_part(string, string, int) | string
substr(string, int) | string
substr(string, int, int) | string
substr(string, string) | string
substr(string, string, string) | string
substring(string, int) | string
substring(string, int, int) | string
substring(string, string) | string
substring(string, string, string) | string
to_hex(int) | string
translate(string, string, string) | string
upper(string) | string
version() | string

timestamp functions | Return
--- | ---
clock_timestamp() | timestamp
current_timestamp() | timestamp
max(timestamp) | timestamp
min(timestamp) | timestamp
now() | timestamp
statement_timestamp() | timestamp
transaction_timestamp() | timestamp

