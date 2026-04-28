export const CreateTable45 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="529" width="1269" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="9 61 1 57 1 65"></polygon>
<polygon points="17 61 9 57 9 65"></polygon>
<rect height="32" rx="10" width="64" x="71" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="69" y="45"></rect>
<text class="terminal" x="79" y="65">INDEX</text><a xlink:href="/docs/v25.4/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="175" y="79"></rect>
<rect class="nonterminal" height="32" width="56" x="173" y="77"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="185" y="97">name</text></a><rect height="32" rx="10" width="74" x="71" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="69" y="121"></rect>
<text class="terminal" x="79" y="141">UNIQUE</text>
<rect height="32" rx="10" width="64" x="165" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="163" y="121"></rect>
<text class="terminal" x="173" y="141">INDEX</text><a xlink:href="/docs/v25.4/sql-grammar#opt_index_name" xlink:title="opt_index_name">
<rect height="32" width="126" x="249" y="123"></rect>
<rect class="nonterminal" height="32" width="126" x="247" y="121"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="11" class="nonterminal" x="259" y="141">opt_index_name</text></a><rect height="32" rx="10" width="26" x="415" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="413" y="45"></rect>
<text class="terminal" x="423" y="65">(</text><a xlink:href="/docs/v25.4/sql-grammar#index_elem" xlink:title="index_elem">
<rect height="32" width="92" x="481" y="47"></rect>
<rect class="nonterminal" height="32" width="92" x="479" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="491" y="65">index_elem</text></a><rect height="32" rx="10" width="24" x="481" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="479" y="1"></rect>
<text class="terminal" x="489" y="21">,</text>
<rect height="32" rx="10" width="26" x="613" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="611" y="45"></rect>
<text class="terminal" x="621" y="65">)</text>
<rect height="32" rx="10" width="64" x="679" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="677" y="77"></rect>
<text class="terminal" x="687" y="97">USING</text>
<rect height="32" rx="10" width="58" x="763" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="761" y="77"></rect>
<text class="terminal" x="771" y="97">HASH</text>
<rect height="32" rx="10" width="92" x="901" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="899" y="77"></rect>
<text class="terminal" x="909" y="97">COVERING</text>
<rect height="32" rx="10" width="84" x="901" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="899" y="121"></rect>
<text class="terminal" x="909" y="141">STORING</text>
<rect height="32" rx="10" width="80" x="901" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="899" y="165"></rect>
<text class="terminal" x="909" y="185">INCLUDE</text>
<rect height="32" rx="10" width="26" x="1033" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1031" y="77"></rect>
<text class="terminal" x="1041" y="97">(</text><a xlink:href="/docs/v25.4/sql-grammar#name_list" xlink:title="name_list">
<rect height="32" width="82" x="1079" y="79"></rect>
<rect class="nonterminal" height="32" width="82" x="1077" y="77"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="1089" y="97">name_list</text></a><rect height="32" rx="10" width="26" x="1181" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1179" y="77"></rect>
<text class="terminal" x="1189" y="97">)</text>
<rect height="32" rx="10" width="90" x="71" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="69" y="253"></rect>
<text class="terminal" x="79" y="273">INVERTED</text>
<rect height="32" rx="10" width="74" x="71" y="299"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="69" y="297"></rect>
<text class="terminal" x="79" y="317">VECTOR</text>
<rect height="32" rx="10" width="64" x="201" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="199" y="253"></rect>
<text class="terminal" x="209" y="273">INDEX</text><a xlink:href="/docs/v25.4/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="305" y="287"></rect>
<rect class="nonterminal" height="32" width="56" x="303" y="285"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="315" y="305">name</text></a><rect height="32" rx="10" width="26" x="401" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="399" y="253"></rect>
<text class="terminal" x="409" y="273">(</text><a xlink:href="/docs/v25.4/sql-grammar#index_elem" xlink:title="index_elem">
<rect height="32" width="92" x="467" y="255"></rect>
<rect class="nonterminal" height="32" width="92" x="465" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="477" y="273">index_elem</text></a><rect height="32" rx="10" width="24" x="467" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="465" y="209"></rect>
<text class="terminal" x="475" y="229">,</text>
<rect height="32" rx="10" width="26" x="599" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="597" y="253"></rect>
<text class="terminal" x="607" y="273">)</text>
<rect height="32" rx="10" width="98" x="301" y="397"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="299" y="395"></rect>
<text class="terminal" x="309" y="415">PARTITION</text>
<rect height="32" rx="10" width="44" x="439" y="429"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="437" y="427"></rect>
<text class="terminal" x="447" y="447">ALL</text>
<rect height="32" rx="10" width="38" x="523" y="397"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="521" y="395"></rect>
<text class="terminal" x="531" y="415">BY</text><a xlink:href="/docs/v25.4/sql-grammar#partition_by_inner" xlink:title="partition_by_inner">
<rect height="32" width="136" x="581" y="397"></rect>
<rect class="nonterminal" height="32" width="136" x="579" y="395"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="10" class="nonterminal" x="591" y="415">partition_by_inner</text></a><a xlink:href="/docs/v25.4/sql-grammar#opt_with_storage_parameter_list" xlink:title="opt_with_storage_parameter_list">
<rect height="32" width="234" x="757" y="365"></rect>
<rect class="nonterminal" height="32" width="234" x="755" y="363"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="210" font-size="10" class="nonterminal" x="767" y="383">opt_with_storage_parameter_list</text></a><a xlink:href="/docs/v25.4/sql-grammar#opt_where_clause" xlink:title="opt_where_clause">
<rect height="32" width="136" x="955" y="495"></rect>
<rect class="nonterminal" height="32" width="136" x="953" y="493"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="965" y="513">opt_where_clause</text></a><a xlink:href="/docs/v25.4/sql-grammar#opt_index_visible" xlink:title="opt_index_visible">
<rect height="32" width="130" x="1111" y="495"></rect>
<rect class="nonterminal" height="32" width="130" x="1109" y="493"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="1121" y="513">opt_index_visible</text></a><path class="line" d="m17 61 h2 m40 0 h10 m64 0 h10 m20 0 h10 m0 0 h66 m-96 0 h20 m76 0 h20 m-116 0 q10 0 10 10 m96 0 q0 -10 10 -10 m-106 10 v12 m96 0 v-12 m-96 12 q0 10 10 10 m76 0 q10 0 10 -10 m-86 10 h10 m56 0 h10 m20 -32 h124 m-344 0 h20 m324 0 h20 m-364 0 q10 0 10 10 m344 0 q0 -10 10 -10 m-354 10 v56 m344 0 v-56 m-344 56 q0 10 10 10 m324 0 q10 0 10 -10 m-334 10 h10 m74 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m126 0 h10 m20 -76 h10 m26 0 h10 m20 0 h10 m92 0 h10 m-132 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m112 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-112 0 h10 m24 0 h10 m0 0 h68 m20 44 h10 m26 0 h10 m20 0 h10 m0 0 h152 m-182 0 h20 m162 0 h20 m-202 0 q10 0 10 10 m182 0 q0 -10 10 -10 m-192 10 v12 m182 0 v-12 m-182 12 q0 10 10 10 m162 0 q10 0 10 -10 m-172 10 h10 m64 0 h10 m0 0 h10 m58 0 h10 m40 -32 h10 m0 0 h336 m-366 0 h20 m346 0 h20 m-386 0 q10 0 10 10 m366 0 q0 -10 10 -10 m-376 10 v12 m366 0 v-12 m-366 12 q0 10 10 10 m346 0 q10 0 10 -10 m-336 10 h10 m92 0 h10 m-132 0 h20 m112 0 h20 m-152 0 q10 0 10 10 m132 0 q0 -10 10 -10 m-142 10 v24 m132 0 v-24 m-132 24 q0 10 10 10 m112 0 q10 0 10 -10 m-122 10 h10 m84 0 h10 m0 0 h8 m-122 -10 v20 m132 0 v-20 m-132 20 v24 m132 0 v-24 m-132 24 q0 10 10 10 m112 0 q10 0 10 -10 m-122 10 h10 m80 0 h10 m0 0 h12 m20 -88 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m-1196 -32 h20 m1196 0 h20 m-1236 0 q10 0 10 10 m1216 0 q0 -10 10 -10 m-1226 10 v188 m1216 0 v-188 m-1216 188 q0 10 10 10 m1196 0 q10 0 10 -10 m-1186 10 h10 m90 0 h10 m-130 0 h20 m110 0 h20 m-150 0 q10 0 10 10 m130 0 q0 -10 10 -10 m-140 10 v24 m130 0 v-24 m-130 24 q0 10 10 10 m110 0 q10 0 10 -10 m-120 10 h10 m74 0 h10 m0 0 h16 m20 -44 h10 m64 0 h10 m20 0 h10 m0 0 h66 m-96 0 h20 m76 0 h20 m-116 0 q10 0 10 10 m96 0 q0 -10 10 -10 m-106 10 v12 m96 0 v-12 m-96 12 q0 10 10 10 m76 0 q10 0 10 -10 m-86 10 h10 m56 0 h10 m20 -32 h10 m26 0 h10 m20 0 h10 m92 0 h10 m-132 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m112 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-112 0 h10 m24 0 h10 m0 0 h68 m20 44 h10 m26 0 h10 m0 0 h602 m22 -208 l2 0 m2 0 l2 0 m2 0 l2 0 m-1010 318 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h426 m-456 0 h20 m436 0 h20 m-476 0 q10 0 10 10 m456 0 q0 -10 10 -10 m-466 10 v12 m456 0 v-12 m-456 12 q0 10 10 10 m436 0 q10 0 10 -10 m-446 10 h10 m98 0 h10 m20 0 h10 m0 0 h54 m-84 0 h20 m64 0 h20 m-104 0 q10 0 10 10 m84 0 q0 -10 10 -10 m-94 10 v12 m84 0 v-12 m-84 12 q0 10 10 10 m64 0 q10 0 10 -10 m-74 10 h10 m44 0 h10 m20 -32 h10 m38 0 h10 m0 0 h10 m136 0 h10 m20 -32 h10 m234 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-80 130 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m136 0 h10 m0 0 h10 m130 0 h10 m3 0 h-3"></path>
<polygon points="1259 509 1267 505 1267 513"></polygon>
<polygon points="1259 509 1251 505 1251 513"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
