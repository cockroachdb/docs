---
title: MULTIPOINT
summary: A MULTIPOINT is a collection of POINTs.
toc: true
---

A `MULTIPOINT` is a collection of [Points](point.html).  MultiPoints are useful for gathering a group of Points into one geometry. For example, you may want to gather the points denoting all of the State Capitols in the U.S. into a single geometry.

## Examples

### SQL

A MultiPoint can be created from SQL by calling an aggregate function such as `ST_Collect` or [`ST_Union`](st_union.html) on a column that contains [Point](point.html) geometries.  In the example below, we will build a MultiPoint from several Points.

First, insert the Points:

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE tmp_points (id INT8 default unique_rowid(), geom GEOMETRY);

INSERT INTO tmp_points (geom)
VALUES
(st_geomfromtext('POINT (-88.243357000000003 40.117404000000001)')),
(st_geomfromtext('POINT (-94.598371 39.050068000000003)')),
(st_geomfromtext('POINT (-73.962090000000003 40.609226)'));
~~~

Next, build a MultiPoint from the individual [Points](point.html) using `ST_Collect`, and check the output with `ST_GeometryType` to verify that it is indeed a MultiPoint:

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_GeometryType(st_collect(geom)) AS output FROM tmp_points;
~~~

~~~
     output
-----------------
  ST_MultiPoint
(1 row)
~~~

Finally, drop the temporary table:

{% include copy-clipboard.html %}
~~~ sql
DROP TABLE tmp_points;
~~~

### Well known text

A MultiPoint can be created from SQL by calling the `st_geomfromtext` function on a MultiPoint definition expressed in the [Well Known Text (WKT)](spatial-glossary.html#wkt) format.

For example, the MultiPoint in the example below includes the locations of [independent bookstores in Chicago, Illinois USA](https://www.bookweb.org/member_directory/search/ABAmember/results/0/Chicago/IL/0):

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_GeomFromText('MULTIPOINT (-87.738258999999999 42.010930999999999, -87.716257999999996 41.981231000000001, -87.708889999999997 41.975000000000001, -87.707705000000004 41.929195999999997, -87.707192000000006 41.926580000000001, -87.704300000000003 41.928013999999997, -87.698012000000006 41.939076, -87.682384999999996 41.943232000000002, -87.681599000000006 41.705936999999999, -87.677763999999996 41.916998, -87.674808999999996 41.9086, -87.668653000000006 41.977356999999998, -87.668611999999996 41.904580000000003, -87.664944000000006 41.921931999999998, -87.655131999999995 41.881686000000002, -87.654752999999999 41.881632000000003, -87.654584 41.944774000000002, -87.653409999999994 41.857928000000001, -87.650779999999997 41.926853000000001, -87.644745999999998 41.941915999999999, -87.644356999999999 41.899109000000003, -87.634562000000003 41.897446000000002, -87.630498000000003 41.899751000000002, -87.629164000000003 41.873215999999999, -87.627983999999998 41.883583999999999, -87.627189999999999 41.890832000000003, -87.624488999999997 41.885147000000003, -87.624283000000005 41.876899000000002, -87.624251999999998 41.874115000000003, -87.622851999999995 41.894931999999997, -87.619151000000002 41.864832999999997, -87.597796000000002 41.789636000000002, -87.596547999999999 41.790515999999997, -87.594948000000002 41.791434000000002, -87.591048999999998 41.808132999999998, -87.590436999999994 41.783611000000001, -87.590277 41.800938000000002)');
~~~

~~~
                                                                               st_geomfromtext
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  0104000000250000000101000000923EADA23FEF55C09CC1DF2F660145400101000000E55FCB2BD7ED55C0236937FA98FD44400101000000889D29745EED55C0CDCCCCCCCCFC44400101000000CE8DE9094BED55C079C9FFE4EFF6444001010000008BFF3BA242ED55C05890662C9AF644400101000000A9A44E4013ED55C0751DAA29C9F644400101000000CC0D863AACEC55C0B03A72A433F844400101000000FB912232ACEB55C0354580D3BBF844400101000000207F69519FEB55C0A704C4245CDA44400101000000FE99417C60EB55C0AB3FC23060F544400101000000F982161230EB55C0A3923A014DF444400101000000D4D7F335CBEA55C022C2BF081AFD44400101000000A46DFC89CAEA55C0CF4E0647C9F344400101000000F96A47718EEA55C0649126DE01F64440010100000009A4C4AEEDE955C0A8AB3B16DBF0444001010000004E7D2079E7E955C0B58D3F51D9F044400101000000081F4AB4E4E955C0390EBC5AEEF84440010100000047382D78D1E955C04E29AF95D0ED4440010100000004392861A6E955C089997D1EA3F644400101000000840EBA8443E955C021CA17B490F844400101000000B77C24253DE955C00745F30016F3444001010000003352EFA99CE855C088F6B182DFF244400101000000618C48145AE855C08BC56F0A2BF34440010100000084F4143944E855C0062CB98AC5EF44400101000000529ACDE330E855C06AA2CF4719F144400101000000359886E123E855C07A1D71C806F2444001010000008DEDB5A0F7E755C08693347F4CF144400101000000B91CAF40F4E755C09372F7393EF0444001010000009B1DA9BEF3E755C0B6F81400E3EF44400101000000E28FA2CEDCE755C06A12BC218DF2444001010000004912842BA0E755C033C005D9B2EE444001010000007F6B274A42E655C044DFDDCA12E544400101000000A19FA9D72DE655C07C7BD7A02FE54440010100000085B4C6A013E655C0A37895B54DE54440010100000058552FBFD3E555C0C0E8F2E670E7444001010000004B5645B8C9E555C097E4805D4DE4444001010000002FA52E19C7E555C0D40FEA2285E64440
(1 row)
~~~

## See also

- [Spatial objects](spatial-features.html#spatial-objects)
- [POINT](point.html)
- [LINESTRING](linestring.html)
- [POLYGON](polygon.html)
- [MULTILINESTRING](multilinestring.html)
- [MULTIPOLYGON](multipolygon.html)
- [GEOMETRYCOLLECTION](geometrycollection.html)
