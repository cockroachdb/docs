---
title: geo: implement ST_3DDWithin and ST_3DDistance
summary: `st_3ddistance()`
toc: true
docs_area: reference.sql
---

### `st_3ddistance()`
**Category**: Geospatial Functions
**Signature**: `st_3ddistance(geometry_a GEOMETRY, geometry_b GEOMETRY) → FLOAT`
**Description**: Returns the 3-dimensional minimum Cartesian distance between two geometries. If either geometry has no Z component, this is equivalent to `ST_Distance` with Z coordinates treated as 0.

**Example**:
```sql
-- Distance between two 3D points
SELECT ST_3DDistance('POINT Z(0 0 0)'::GEOMETRY, 'POINT Z(1 1 1)'::GEOMETRY);
-- Returns: 1.7320508075688772

-- Z-only difference
SELECT ST_3DDistance('POINT Z(0 0 0)'::GEOMETRY, 'POINT Z(0 0 5)'::GEOMETRY);
-- Returns: 5

-- 2D geometries (Z treated as 0)
SELECT ST_3DDistance('POINT(0 0)'::GEOMETRY, 'POINT(3 4)'::GEOMETRY);
-- Returns: 5
```

### `st_3ddwithin()`
**Category**: Geospatial Functions
**Signature**: `st_3ddwithin(geometry_a GEOMETRY, geometry_b GEOMETRY, distance FLOAT) → BOOL`
**Description**: Returns true if any part of `geometry_a` is within `distance` units of `geometry_b`, using 3D Euclidean distance. This is equivalent to `ST_3DDistance(geometry_a, geometry_b) <= distance`.

**Example**:
```sql
-- Check if 3D points are within distance
SELECT ST_3DDWithin('POINT Z(0 0 0)'::GEOMETRY, 'POINT Z(1 1 1)'::GEOMETRY, 2.0);
-- Returns: true

-- Check with exact distance threshold
SELECT ST_3DDWithin('POINT Z(0 0 0)'::GEOMETRY, 'POINT Z(0 0 5)'::GEOMETRY, 5.0);
-- Returns: true

-- Below threshold
SELECT ST_3DDWithin('POINT Z(0 0 0)'::GEOMETRY, 'POINT Z(0 0 5)'::GEOMETRY, 4.0);
-- Returns: false
```

### `_st_3ddwithin()`
**Category**: Geospatial Functions
**Signature**: `_st_3ddwithin(geometry_a GEOMETRY, geometry_b GEOMETRY, distance FLOAT) → BOOL`
**Description**: Returns true if any part of `geometry_a` is within `distance` units of `geometry_b`, using 3D Euclidean distance. This variant does not utilize any spatial index and is intended for internal use or when spatial indexes should be bypassed.

**Example**:
```sql
-- Internal variant without spatial index optimization
SELECT _ST_3DDWithin('POINT Z(0 0 0)'::GEOMETRY, 'POINT Z(1 1 1)'::GEOMETRY, 2.0);
-- Returns: true
```
