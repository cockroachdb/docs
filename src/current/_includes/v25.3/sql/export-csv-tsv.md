[`IMPORT INTO`](import-into.html) requires that you export one file per table with the following attributes:

- Files must be in valid [CSV](https://tools.ietf.org/html/rfc4180) (comma-separated values) or [TSV](https://www.iana.org/assignments/media-types/text/tab-separated-values) (tab-separated values) format. 
- The delimiter must be a single character. Use the [`delimiter` option](import-into.html#import-options) to set a character other than a comma (such as a tab, for TSV format).
- Files must be UTF-8 encoded.
- If one of the following characters appears in a field, the field must be enclosed by double quotes:
    - Delimiter (`,` by default).
    - Double quote (`"`). Because the field will be enclosed by double quotes, escape a double quote inside a field by preceding it with another double quote. For example: `"aaa","b""bb","ccc"`.
    - Newline (`\n`).
    - Carriage return (`\r`).
- If a column is of type [`BYTES`](bytes.html), it can either be a valid UTF-8 string or a [hex-encoded byte literal](sql-constants.html#hexadecimal-encoded-byte-array-literals) beginning with `\x`. For example, a field whose value should be the bytes `1`, `2` would be written as `\x0102`.