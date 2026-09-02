export const CreateIndex8 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="853" width="1779" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
text {
  fill: #2f3337;
  font-size: 14px;
}
rect {
  fill: #ffffff;
  stroke: #3a3d40;
  stroke-width: 2;
}
rect.terminal {
  fill: #ffffff;
}
rect.nonterminal {
  fill: #ffffff;
}
text.terminal {
  fill: #2f3337;
  font-weight: 600;
}
text.nonterminal {
  fill: #2563eb;
}
a text.nonterminal {
  text-decoration: underline;
}
path.line {
  fill: none;
  stroke: #3a3d40;
  stroke-width: 2;
}
polygon {
  fill: #2f3337;
  stroke: #2f3337;
}</style>
<polygon points="9 17 1 13 1 21"></polygon>
<polygon points="17 17 9 13 9 21"></polygon>
<rect height="32" rx="10" width="72" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">CREATE</text>
<rect height="32" rx="10" width="74" x="143" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="141" y="33"></rect>
<text class="terminal" x="151" y="53">UNIQUE</text>
<rect height="32" rx="10" width="64" x="45" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="43" y="143"></rect>
<text class="terminal" x="53" y="163">INDEX</text>
<rect height="32" rx="10" width="130" x="149" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="130" x="147" y="175"></rect>
<text class="terminal" x="157" y="195">CONCURRENTLY</text><a xlink:href="/docs/v24.3/sql-grammar#opt_index_name" xlink:title="opt_index_name">
<rect height="32" width="126" x="339" y="145"></rect>
<rect class="nonterminal" height="32" width="126" x="337" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="11" class="nonterminal" x="349" y="163">opt_index_name</text></a><rect height="32" rx="10" width="34" x="339" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="337" y="187"></rect>
<text class="terminal" x="347" y="207">IF</text>
<rect height="32" rx="10" width="48" x="393" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="391" y="187"></rect>
<text class="terminal" x="401" y="207">NOT</text>
<rect height="32" rx="10" width="70" x="461" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="459" y="187"></rect>
<text class="terminal" x="469" y="207">EXISTS</text><a xlink:href="/docs/v24.3/sql-grammar#index_name" xlink:title="index_name">
<rect height="32" width="98" x="551" y="189"></rect>
<rect class="nonterminal" height="32" width="98" x="549" y="187"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="11" class="nonterminal" x="561" y="207">index_name</text></a><rect height="32" rx="10" width="40" x="689" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="687" y="143"></rect>
<text class="terminal" x="697" y="163">ON</text><a xlink:href="/docs/v24.3/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="749" y="145"></rect>
<rect class="nonterminal" height="32" width="96" x="747" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="759" y="163">table_name</text></a><a xlink:href="/docs/v24.3/sql-grammar#opt_index_access_method" xlink:title="opt_index_access_method">
<rect height="32" width="190" x="865" y="145"></rect>
<rect class="nonterminal" height="32" width="190" x="863" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="166" font-size="11" class="nonterminal" x="875" y="163">opt_index_access_method</text></a><rect height="32" rx="10" width="26" x="1075" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1073" y="143"></rect>
<text class="terminal" x="1083" y="163">(</text><a xlink:href="/docs/v24.3/sql-grammar#func_expr_windowless" xlink:title="func_expr_windowless">
<rect height="32" width="162" x="1161" y="145"></rect>
<rect class="nonterminal" height="32" width="162" x="1159" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="138" font-size="11" class="nonterminal" x="1171" y="163">func_expr_windowless</text></a><rect height="32" rx="10" width="26" x="1161" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1159" y="187"></rect>
<text class="terminal" x="1169" y="207">(</text><a xlink:href="/docs/v24.3/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="1207" y="189"></rect>
<rect class="nonterminal" height="32" width="64" x="1205" y="187"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="1217" y="207">a_expr</text></a><rect height="32" rx="10" width="26" x="1291" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1289" y="187"></rect>
<text class="terminal" x="1299" y="207">)</text><a xlink:href="/docs/v24.3/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="1161" y="233"></rect>
<rect class="nonterminal" height="32" width="56" x="1159" y="231"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="1171" y="251">name</text></a><a xlink:href="/docs/v24.3/sql-grammar#index_elem_options" xlink:title="index_elem_options">
<rect height="32" width="148" x="1363" y="145"></rect>
<rect class="nonterminal" height="32" width="148" x="1361" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="11" class="nonterminal" x="1373" y="163">index_elem_options</text></a><rect height="32" rx="10" width="24" x="1141" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="1139" y="99"></rect>
<text class="terminal" x="1149" y="119">,</text>
<rect height="32" rx="10" width="26" x="1551" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1549" y="143"></rect>
<text class="terminal" x="1559" y="163">)</text><a xlink:href="/docs/v24.3/sql-grammar#opt_hash_sharded" xlink:title="opt_hash_sharded">
<rect height="32" width="140" x="1597" y="145"></rect>
<rect class="nonterminal" height="32" width="140" x="1595" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="116" font-size="11" class="nonterminal" x="1607" y="163">opt_hash_sharded</text></a><rect height="32" rx="10" width="90" x="45" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="43" y="319"></rect>
<text class="terminal" x="53" y="339">INVERTED</text>
<rect height="32" rx="10" width="64" x="155" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="153" y="319"></rect>
<text class="terminal" x="163" y="339">INDEX</text>
<rect height="32" rx="10" width="130" x="259" y="353"></rect>
<rect class="terminal" height="32" rx="10" width="130" x="257" y="351"></rect>
<text class="terminal" x="267" y="371">CONCURRENTLY</text><a xlink:href="/docs/v24.3/sql-grammar#opt_index_name" xlink:title="opt_index_name">
<rect height="32" width="126" x="449" y="321"></rect>
<rect class="nonterminal" height="32" width="126" x="447" y="319"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="11" class="nonterminal" x="459" y="339">opt_index_name</text></a><rect height="32" rx="10" width="34" x="449" y="365"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="447" y="363"></rect>
<text class="terminal" x="457" y="383">IF</text>
<rect height="32" rx="10" width="48" x="503" y="365"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="501" y="363"></rect>
<text class="terminal" x="511" y="383">NOT</text>
<rect height="32" rx="10" width="70" x="571" y="365"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="569" y="363"></rect>
<text class="terminal" x="579" y="383">EXISTS</text><a xlink:href="/docs/v24.3/sql-grammar#index_name" xlink:title="index_name">
<rect height="32" width="98" x="661" y="365"></rect>
<rect class="nonterminal" height="32" width="98" x="659" y="363"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="11" class="nonterminal" x="671" y="383">index_name</text></a><rect height="32" rx="10" width="40" x="799" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="797" y="319"></rect>
<text class="terminal" x="807" y="339">ON</text><a xlink:href="/docs/v24.3/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="859" y="321"></rect>
<rect class="nonterminal" height="32" width="96" x="857" y="319"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="869" y="339">table_name</text></a><rect height="32" rx="10" width="26" x="975" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="973" y="319"></rect>
<text class="terminal" x="983" y="339">(</text><a xlink:href="/docs/v24.3/sql-grammar#func_expr_windowless" xlink:title="func_expr_windowless">
<rect height="32" width="162" x="1061" y="321"></rect>
<rect class="nonterminal" height="32" width="162" x="1059" y="319"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="138" font-size="11" class="nonterminal" x="1071" y="339">func_expr_windowless</text></a><rect height="32" rx="10" width="26" x="1061" y="365"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1059" y="363"></rect>
<text class="terminal" x="1069" y="383">(</text><a xlink:href="/docs/v24.3/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="1107" y="365"></rect>
<rect class="nonterminal" height="32" width="64" x="1105" y="363"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="1117" y="383">a_expr</text></a><rect height="32" rx="10" width="26" x="1191" y="365"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1189" y="363"></rect>
<text class="terminal" x="1199" y="383">)</text><a xlink:href="/docs/v24.3/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="1061" y="409"></rect>
<rect class="nonterminal" height="32" width="56" x="1059" y="407"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="1071" y="427">name</text></a><a xlink:href="/docs/v24.3/sql-grammar#index_elem_options" xlink:title="index_elem_options">
<rect height="32" width="148" x="1263" y="321"></rect>
<rect class="nonterminal" height="32" width="148" x="1261" y="319"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="11" class="nonterminal" x="1273" y="339">index_elem_options</text></a><rect height="32" rx="10" width="24" x="1041" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="1039" y="275"></rect>
<text class="terminal" x="1049" y="295">,</text>
<rect height="32" rx="10" width="26" x="1451" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1449" y="319"></rect>
<text class="terminal" x="1459" y="339">)</text>
<rect height="32" rx="10" width="92" x="748" y="491"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="746" y="489"></rect>
<text class="terminal" x="756" y="509">COVERING</text>
<rect height="32" rx="10" width="84" x="748" y="535"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="746" y="533"></rect>
<text class="terminal" x="756" y="553">STORING</text>
<rect height="32" rx="10" width="80" x="748" y="579"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="746" y="577"></rect>
<text class="terminal" x="756" y="597">INCLUDE</text>
<rect height="32" rx="10" width="26" x="880" y="491"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="878" y="489"></rect>
<text class="terminal" x="888" y="509">(</text><a xlink:href="/docs/v24.3/sql-grammar#name_list" xlink:title="name_list">
<rect height="32" width="82" x="926" y="491"></rect>
<rect class="nonterminal" height="32" width="82" x="924" y="489"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="936" y="509">name_list</text></a><rect height="32" rx="10" width="26" x="1028" y="491"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1026" y="489"></rect>
<text class="terminal" x="1036" y="509">)</text>
<rect height="32" rx="10" width="98" x="621" y="677"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="619" y="675"></rect>
<text class="terminal" x="629" y="695">PARTITION</text>
<rect height="32" rx="10" width="44" x="759" y="709"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="757" y="707"></rect>
<text class="terminal" x="767" y="727">ALL</text>
<rect height="32" rx="10" width="38" x="843" y="677"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="841" y="675"></rect>
<text class="terminal" x="851" y="695">BY</text><a xlink:href="/docs/v24.3/sql-grammar#partition_by_inner" xlink:title="partition_by_inner">
<rect height="32" width="136" x="901" y="677"></rect>
<rect class="nonterminal" height="32" width="136" x="899" y="675"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="10" class="nonterminal" x="911" y="695">partition_by_inner</text></a><rect height="32" rx="10" width="58" x="1077" y="645"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="1075" y="643"></rect>
<text class="terminal" x="1085" y="663">WITH</text>
<rect height="32" rx="10" width="26" x="1155" y="645"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1153" y="643"></rect>
<text class="terminal" x="1163" y="663">(</text><a xlink:href="/docs/v24.3/sql-grammar#storage_parameter" xlink:title="storage_parameter">
<rect height="32" width="144" x="1235" y="819"></rect>
<rect class="nonterminal" height="32" width="144" x="1233" y="817"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="120" font-size="11" class="nonterminal" x="1245" y="837">storage_parameter</text></a><rect height="32" rx="10" width="24" x="1235" y="775"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="1233" y="773"></rect>
<text class="terminal" x="1243" y="793">,</text>
<rect height="32" rx="10" width="26" x="1419" y="819"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1417" y="817"></rect>
<text class="terminal" x="1427" y="837">)</text><a xlink:href="/docs/v24.3/sql-grammar#opt_where_clause" xlink:title="opt_where_clause">
<rect height="32" width="136" x="1465" y="819"></rect>
<rect class="nonterminal" height="32" width="136" x="1463" y="817"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="1475" y="837">opt_where_clause</text></a><a xlink:href="/docs/v24.3/sql-grammar#opt_index_visible" xlink:title="opt_index_visible">
<rect height="32" width="130" x="1621" y="819"></rect>
<rect class="nonterminal" height="32" width="130" x="1619" y="817"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="1631" y="837">opt_index_visible</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m20 0 h10 m0 0 h84 m-114 0 h20 m94 0 h20 m-134 0 q10 0 10 10 m114 0 q0 -10 10 -10 m-124 10 v12 m114 0 v-12 m-114 12 q0 10 10 10 m94 0 q10 0 10 -10 m-104 10 h10 m74 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-256 142 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m64 0 h10 m20 0 h10 m0 0 h140 m-170 0 h20 m150 0 h20 m-190 0 q10 0 10 10 m170 0 q0 -10 10 -10 m-180 10 v12 m170 0 v-12 m-170 12 q0 10 10 10 m150 0 q10 0 10 -10 m-160 10 h10 m130 0 h10 m40 -32 h10 m126 0 h10 m0 0 h184 m-350 0 h20 m330 0 h20 m-370 0 q10 0 10 10 m350 0 q0 -10 10 -10 m-360 10 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m98 0 h10 m20 -44 h10 m40 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m190 0 h10 m0 0 h10 m26 0 h10 m40 0 h10 m162 0 h10 m-202 0 h20 m182 0 h20 m-222 0 q10 0 10 10 m202 0 q0 -10 10 -10 m-212 10 v24 m202 0 v-24 m-202 24 q0 10 10 10 m182 0 q10 0 10 -10 m-192 10 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m0 0 h6 m-192 -10 v20 m202 0 v-20 m-202 20 v24 m202 0 v-24 m-202 24 q0 10 10 10 m182 0 q10 0 10 -10 m-192 10 h10 m56 0 h10 m0 0 h106 m20 -88 h10 m148 0 h10 m-410 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m390 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-390 0 h10 m24 0 h10 m0 0 h346 m20 44 h10 m26 0 h10 m0 0 h10 m140 0 h10 m-1732 0 h20 m1712 0 h20 m-1752 0 q10 0 10 10 m1732 0 q0 -10 10 -10 m-1742 10 v156 m1732 0 v-156 m-1732 156 q0 10 10 10 m1712 0 q10 0 10 -10 m-1722 10 h10 m90 0 h10 m0 0 h10 m64 0 h10 m20 0 h10 m0 0 h140 m-170 0 h20 m150 0 h20 m-190 0 q10 0 10 10 m170 0 q0 -10 10 -10 m-180 10 v12 m170 0 v-12 m-170 12 q0 10 10 10 m150 0 q10 0 10 -10 m-160 10 h10 m130 0 h10 m40 -32 h10 m126 0 h10 m0 0 h184 m-350 0 h20 m330 0 h20 m-370 0 q10 0 10 10 m350 0 q0 -10 10 -10 m-360 10 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m98 0 h10 m20 -44 h10 m40 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m26 0 h10 m40 0 h10 m162 0 h10 m-202 0 h20 m182 0 h20 m-222 0 q10 0 10 10 m202 0 q0 -10 10 -10 m-212 10 v24 m202 0 v-24 m-202 24 q0 10 10 10 m182 0 q10 0 10 -10 m-192 10 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m0 0 h6 m-192 -10 v20 m202 0 v-20 m-202 20 v24 m202 0 v-24 m-202 24 q0 10 10 10 m182 0 q10 0 10 -10 m-192 10 h10 m56 0 h10 m0 0 h106 m20 -88 h10 m148 0 h10 m-410 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m390 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-390 0 h10 m24 0 h10 m0 0 h346 m20 44 h10 m26 0 h10 m0 0 h260 m22 -176 l2 0 m2 0 l2 0 m2 0 l2 0 m-1093 314 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h336 m-366 0 h20 m346 0 h20 m-386 0 q10 0 10 10 m366 0 q0 -10 10 -10 m-376 10 v12 m366 0 v-12 m-366 12 q0 10 10 10 m346 0 q10 0 10 -10 m-336 10 h10 m92 0 h10 m-132 0 h20 m112 0 h20 m-152 0 q10 0 10 10 m132 0 q0 -10 10 -10 m-142 10 v24 m132 0 v-24 m-132 24 q0 10 10 10 m112 0 q10 0 10 -10 m-122 10 h10 m84 0 h10 m0 0 h8 m-122 -10 v20 m132 0 v-20 m-132 20 v24 m132 0 v-24 m-132 24 q0 10 10 10 m112 0 q10 0 10 -10 m-122 10 h10 m80 0 h10 m0 0 h12 m20 -88 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-517 186 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h426 m-456 0 h20 m436 0 h20 m-476 0 q10 0 10 10 m456 0 q0 -10 10 -10 m-466 10 v12 m456 0 v-12 m-456 12 q0 10 10 10 m436 0 q10 0 10 -10 m-446 10 h10 m98 0 h10 m20 0 h10 m0 0 h54 m-84 0 h20 m64 0 h20 m-104 0 q10 0 10 10 m84 0 q0 -10 10 -10 m-94 10 v12 m84 0 v-12 m-84 12 q0 10 10 10 m64 0 q10 0 10 -10 m-74 10 h10 m44 0 h10 m20 -32 h10 m38 0 h10 m0 0 h10 m136 0 h10 m20 -32 h10 m58 0 h10 m0 0 h10 m26 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-10 174 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m144 0 h10 m-184 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m164 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-164 0 h10 m24 0 h10 m0 0 h120 m20 44 h10 m26 0 h10 m0 0 h10 m136 0 h10 m0 0 h10 m130 0 h10 m3 0 h-3"></path>
<polygon points="1769 833 1777 829 1777 837"></polygon>
<polygon points="1769 833 1761 829 1761 837"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
