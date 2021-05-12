<span class="version-tag">New in v21.1:</span> You can also store a `{{page.title}}` with the following additional dimensions:

- A third dimension coordinate `Z` (`{{page.title}}Z`).
- A measure coordinate `M` (`{{page.title}}M`).
- Both a third dimension and a measure coordinate (`{{page.title}}ZM`).

The `Z` and `M` dimensions are accessible using a number of [built-in functions](functions-and-operators.html#spatial-functions), including:

- `ST_Z`
- `ST_M`
- `ST_Affine`
- `ST_Zmflag`
- `ST_MakePoint`
- `ST_MakePointM`
- `ST_Force3D`
- `ST_Force3DZ`
- `ST_Force3DM`
- `ST_Force4D`
- `ST_Snap`
- `ST_SnapToGrid`
- `ST_RotateZ`
- `ST_AddMeasure`

Note that these functions are not index-accelerated.
