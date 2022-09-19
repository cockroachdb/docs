- [Decimals](decimal.html) must have precision specified.
- [`BYTES`](bytes.html) (or its aliases `BYTEA` and `BLOB`) are often used to store machine-readable data. When you stream these types through a changefeed with [`format=avro`](create-changefeed.html#format), CockroachDB does not encode or change the data. However, Avro clients can often include escape sequences to present the data in a printable format, which can interfere with deserialization. A potential solution is to hex-encode `BYTES` values when initially inserting them into CockroachDB. This will ensure that Avro clients can consistently decode the hexadecimal. Note that hex-encoding values at insertion will increase record size. 
- [`BIT`](bit.html) and [`VARBIT`](bit.html) types are encoded as arrays of 64-bit integers.
    
    For efficiency, CockroachDB encodes `BIT` and `VARBIT` bitfield types as arrays of 64-bit integers. That is, [base-2 (binary format)](https://en.wikipedia.org/wiki/Binary_number#Conversion_to_and_from_other_numeral_systems) `BIT` and `VARBIT` data types are converted to base 10 and stored in arrays. Encoding in CockroachDB is [big-endian](https://en.wikipedia.org/wiki/Endianness), therefore the last value may have many trailing zeroes. For this reason, the first value of each array is the number of bits that are used in the last value of the array.

    For instance, if the bitfield is 129 bits long, there will be 4 integers in the array. The first integer will be `1`; representing the number of bits in the last value, the second integer will be the first 64 bits, the third integer will be bits 65–128, and the last integer will either be `0` or `9223372036854775808` (i.e., the integer with only the first bit set, or `1000000000000000000000000000000000000000000000000000000000000000` when base 2).

    This example is base-10 encoded into an array as follows:

    ~~~
    {"array": [1, <first 64 bits>, <second 64 bits>, 0 or 9223372036854775808]}
    ~~~

    For downstream processing, it is necessary to base-2 encode every element in the array (except for the first element). The first number in the array gives you the number of bits to take from the last base-2 number — that is, the most significant bits. So, in the example above this would be `1`. Finally, all the base-2 numbers can be appended together, which will result in the original number of bits, 129.

    In a different example of this process where the bitfield is 136 bits long, the array would be similar to the following when base-10 encoded:

    ~~~
    {"array": [8, 18293058736425533439, 18446744073709551615, 13690942867206307840]}
    ~~~

    To then work with this data, you would convert each of the elements in the array to base-2 numbers, besides the first element. For the above array, this would convert to:

    ~~~
    [8, 1111110111011011111111111111111111111111111111111111111111111111, 1111111111111111111111111111111111111111111111111111111111111111, 1011111000000000000000000000000000000000000000000000000000000000]
    ~~~

    Next, you use the first element in the array to take the number of bits from the last base-2 element, `10111110`. Finally, you append each of the base-2 numbers together — in the above array, the second, third, and truncated last element. This results in 136 bits, the original number of bits.
