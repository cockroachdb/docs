export const CreateIndexStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="367" width="1435" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">CREATE</text><a xlink:href="#opt_unique" xlink:title="opt_unique">
<rect height="32" width="92" x="123" y="3"></rect>
<rect class="nonterminal" height="32" width="92" x="121" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="133" y="21">opt_unique</text></a><rect height="32" rx="10" width="64" x="45" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="43" y="67"></rect>
<text class="terminal" x="53" y="87">INDEX</text><a xlink:href="#opt_concurrently" xlink:title="opt_concurrently">
<rect height="32" width="126" x="129" y="69"></rect>
<rect class="nonterminal" height="32" width="126" x="127" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="139" y="87">opt_concurrently</text></a><a xlink:href="#opt_index_name" xlink:title="opt_index_name">
<rect height="32" width="126" x="295" y="69"></rect>
<rect class="nonterminal" height="32" width="126" x="293" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="11" class="nonterminal" x="305" y="87">opt_index_name</text></a><rect height="32" rx="10" width="34" x="295" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="293" y="111"></rect>
<text class="terminal" x="303" y="131">IF</text>
<rect height="32" rx="10" width="48" x="349" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="347" y="111"></rect>
<text class="terminal" x="357" y="131">NOT</text>
<rect height="32" rx="10" width="70" x="417" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="415" y="111"></rect>
<text class="terminal" x="425" y="131">EXISTS</text><a xlink:href="#index_name" xlink:title="index_name">
<rect height="32" width="98" x="507" y="113"></rect>
<rect class="nonterminal" height="32" width="98" x="505" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="11" class="nonterminal" x="517" y="131">index_name</text></a><rect height="32" rx="10" width="40" x="645" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="643" y="67"></rect>
<text class="terminal" x="653" y="87">ON</text><a xlink:href="#table_name" xlink:title="table_name">
<rect height="32" width="96" x="705" y="69"></rect>
<rect class="nonterminal" height="32" width="96" x="703" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="715" y="87">table_name</text></a><a xlink:href="#opt_index_access_method" xlink:title="opt_index_access_method">
<rect height="32" width="190" x="821" y="69"></rect>
<rect class="nonterminal" height="32" width="190" x="819" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="166" font-size="11" class="nonterminal" x="831" y="87">opt_index_access_method</text></a><rect height="32" rx="10" width="26" x="1031" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1029" y="67"></rect>
<text class="terminal" x="1039" y="87">(</text><a xlink:href="#index_params" xlink:title="index_params">
<rect height="32" width="110" x="1077" y="69"></rect>
<rect class="nonterminal" height="32" width="110" x="1075" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="11" class="nonterminal" x="1087" y="87">index_params</text></a><rect height="32" rx="10" width="26" x="1207" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1205" y="67"></rect>
<text class="terminal" x="1215" y="87">)</text><a xlink:href="#opt_hash_sharded" xlink:title="opt_hash_sharded">
<rect height="32" width="140" x="1253" y="69"></rect>
<rect class="nonterminal" height="32" width="140" x="1251" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="116" font-size="11" class="nonterminal" x="1263" y="87">opt_hash_sharded</text></a><rect height="32" rx="10" width="90" x="65" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="63" y="155"></rect>
<text class="terminal" x="73" y="175">INVERTED</text>
<rect height="32" rx="10" width="74" x="65" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="63" y="199"></rect>
<text class="terminal" x="73" y="219">VECTOR</text>
<rect height="32" rx="10" width="64" x="195" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="193" y="155"></rect>
<text class="terminal" x="203" y="175">INDEX</text><a xlink:href="#opt_concurrently" xlink:title="opt_concurrently">
<rect height="32" width="126" x="279" y="157"></rect>
<rect class="nonterminal" height="32" width="126" x="277" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="289" y="175">opt_concurrently</text></a><a xlink:href="#opt_index_name" xlink:title="opt_index_name">
<rect height="32" width="126" x="445" y="157"></rect>
<rect class="nonterminal" height="32" width="126" x="443" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="11" class="nonterminal" x="455" y="175">opt_index_name</text></a><rect height="32" rx="10" width="34" x="445" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="443" y="199"></rect>
<text class="terminal" x="453" y="219">IF</text>
<rect height="32" rx="10" width="48" x="499" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="497" y="199"></rect>
<text class="terminal" x="507" y="219">NOT</text>
<rect height="32" rx="10" width="70" x="567" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="565" y="199"></rect>
<text class="terminal" x="575" y="219">EXISTS</text><a xlink:href="#index_name" xlink:title="index_name">
<rect height="32" width="98" x="657" y="201"></rect>
<rect class="nonterminal" height="32" width="98" x="655" y="199"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="11" class="nonterminal" x="667" y="219">index_name</text></a><rect height="32" rx="10" width="40" x="795" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="793" y="155"></rect>
<text class="terminal" x="803" y="175">ON</text><a xlink:href="#table_name" xlink:title="table_name">
<rect height="32" width="96" x="855" y="157"></rect>
<rect class="nonterminal" height="32" width="96" x="853" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="865" y="175">table_name</text></a><rect height="32" rx="10" width="26" x="971" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="969" y="155"></rect>
<text class="terminal" x="979" y="175">(</text><a xlink:href="#index_params" xlink:title="index_params">
<rect height="32" width="110" x="1017" y="157"></rect>
<rect class="nonterminal" height="32" width="110" x="1015" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="11" class="nonterminal" x="1027" y="175">index_params</text></a><rect height="32" rx="10" width="26" x="1147" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1145" y="155"></rect>
<text class="terminal" x="1155" y="175">)</text><a xlink:href="#opt_storing" xlink:title="opt_storing">
<rect height="32" width="92" x="374" y="267"></rect>
<rect class="nonterminal" height="32" width="92" x="372" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="384" y="285">opt_storing</text></a><a xlink:href="#opt_partition_by_index" xlink:title="opt_partition_by_index">
<rect height="32" width="168" x="486" y="267"></rect>
<rect class="nonterminal" height="32" width="168" x="484" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="144" font-size="10" class="nonterminal" x="496" y="285">opt_partition_by_index</text></a><a xlink:href="#opt_with_storage_parameter_list" xlink:title="opt_with_storage_parameter_list">
<rect height="32" width="234" x="674" y="267"></rect>
<rect class="nonterminal" height="32" width="234" x="672" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="210" font-size="10" class="nonterminal" x="684" y="285">opt_with_storage_parameter_list</text></a><a xlink:href="#opt_where_clause" xlink:title="opt_where_clause">
<rect height="32" width="136" x="928" y="267"></rect>
<rect class="nonterminal" height="32" width="136" x="926" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="938" y="285">opt_where_clause</text></a><a xlink:href="#opt_index_visible" xlink:title="opt_index_visible">
<rect height="32" width="130" x="1277" y="333"></rect>
<rect class="nonterminal" height="32" width="130" x="1275" y="331"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="1287" y="351">opt_index_visible</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m92 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-234 66 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m64 0 h10 m0 0 h10 m126 0 h10 m20 0 h10 m126 0 h10 m0 0 h184 m-350 0 h20 m330 0 h20 m-370 0 q10 0 10 10 m350 0 q0 -10 10 -10 m-360 10 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m98 0 h10 m20 -44 h10 m40 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m190 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m140 0 h10 m-1388 0 h20 m1368 0 h20 m-1408 0 q10 0 10 10 m1388 0 q0 -10 10 -10 m-1398 10 v68 m1388 0 v-68 m-1388 68 q0 10 10 10 m1368 0 q10 0 10 -10 m-1358 10 h10 m90 0 h10 m-130 0 h20 m110 0 h20 m-150 0 q10 0 10 10 m130 0 q0 -10 10 -10 m-140 10 v24 m130 0 v-24 m-130 24 q0 10 10 10 m110 0 q10 0 10 -10 m-120 10 h10 m74 0 h10 m0 0 h16 m20 -44 h10 m64 0 h10 m0 0 h10 m126 0 h10 m20 0 h10 m126 0 h10 m0 0 h184 m-350 0 h20 m330 0 h20 m-370 0 q10 0 10 10 m350 0 q0 -10 10 -10 m-360 10 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m98 0 h10 m20 -44 h10 m40 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m26 0 h10 m0 0 h220 m22 -88 l2 0 m2 0 l2 0 m2 0 l2 0 m-1083 198 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m92 0 h10 m0 0 h10 m168 0 h10 m0 0 h10 m234 0 h10 m0 0 h10 m136 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m169 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m130 0 h10 m3 0 h-3"></path>
<polygon points="1425 347 1433 343 1433 351"></polygon>
<polygon points="1425 347 1417 343 1417 351"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
