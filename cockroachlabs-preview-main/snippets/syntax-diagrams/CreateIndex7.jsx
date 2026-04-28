export const CreateIndex7 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="787" width="749" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="257" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="255" y="1"></rect>
<text class="terminal" x="265" y="21">INDEX</text>
<rect height="32" rx="10" width="130" x="361" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="130" x="359" y="33"></rect>
<text class="terminal" x="369" y="53">CONCURRENTLY</text><a xlink:href="/docs/v24.3/sql-grammar#opt_index_name" xlink:title="opt_index_name">
<rect height="32" width="126" x="133" y="101"></rect>
<rect class="nonterminal" height="32" width="126" x="131" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="11" class="nonterminal" x="143" y="119">opt_index_name</text></a><rect height="32" rx="10" width="34" x="133" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="131" y="143"></rect>
<text class="terminal" x="141" y="163">IF</text>
<rect height="32" rx="10" width="48" x="187" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="185" y="143"></rect>
<text class="terminal" x="195" y="163">NOT</text>
<rect height="32" rx="10" width="70" x="255" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="253" y="143"></rect>
<text class="terminal" x="263" y="163">EXISTS</text><a xlink:href="/docs/v24.3/sql-grammar#index_name" xlink:title="index_name">
<rect height="32" width="98" x="345" y="145"></rect>
<rect class="nonterminal" height="32" width="98" x="343" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="11" class="nonterminal" x="355" y="163">index_name</text></a><rect height="32" rx="10" width="40" x="483" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="481" y="99"></rect>
<text class="terminal" x="491" y="119">ON</text><a xlink:href="/docs/v24.3/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="543" y="101"></rect>
<rect class="nonterminal" height="32" width="96" x="541" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="553" y="119">table_name</text></a><rect height="32" rx="10" width="64" x="45" y="287"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="43" y="285"></rect>
<text class="terminal" x="53" y="305">USING</text><a xlink:href="/docs/v24.3/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="129" y="287"></rect>
<rect class="nonterminal" height="32" width="56" x="127" y="285"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="139" y="305">name</text></a><rect height="32" rx="10" width="26" x="225" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="223" y="253"></rect>
<text class="terminal" x="233" y="273">(</text><a xlink:href="/docs/v24.3/sql-grammar#func_expr_windowless" xlink:title="func_expr_windowless">
<rect height="32" width="162" x="311" y="255"></rect>
<rect class="nonterminal" height="32" width="162" x="309" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="138" font-size="11" class="nonterminal" x="321" y="273">func_expr_windowless</text></a><rect height="32" rx="10" width="26" x="311" y="299"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="309" y="297"></rect>
<text class="terminal" x="319" y="317">(</text><a xlink:href="/docs/v24.3/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="357" y="299"></rect>
<rect class="nonterminal" height="32" width="64" x="355" y="297"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="367" y="317">a_expr</text></a><rect height="32" rx="10" width="26" x="441" y="299"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="439" y="297"></rect>
<text class="terminal" x="449" y="317">)</text><a xlink:href="/docs/v24.3/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="311" y="343"></rect>
<rect class="nonterminal" height="32" width="56" x="309" y="341"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="321" y="361">name</text></a><a xlink:href="/docs/v24.3/sql-grammar#index_elem_options" xlink:title="index_elem_options">
<rect height="32" width="148" x="513" y="255"></rect>
<rect class="nonterminal" height="32" width="148" x="511" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="11" class="nonterminal" x="523" y="273">index_elem_options</text></a><rect height="32" rx="10" width="24" x="291" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="289" y="209"></rect>
<text class="terminal" x="299" y="229">,</text>
<rect height="32" rx="10" width="26" x="701" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="699" y="253"></rect>
<text class="terminal" x="709" y="273">)</text>
<rect height="32" rx="10" width="64" x="112" y="425"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="110" y="423"></rect>
<text class="terminal" x="120" y="443">USING</text>
<rect height="32" rx="10" width="58" x="196" y="425"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="194" y="423"></rect>
<text class="terminal" x="204" y="443">HASH</text>
<rect height="32" rx="10" width="92" x="334" y="425"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="332" y="423"></rect>
<text class="terminal" x="342" y="443">COVERING</text>
<rect height="32" rx="10" width="84" x="334" y="469"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="332" y="467"></rect>
<text class="terminal" x="342" y="487">STORING</text>
<rect height="32" rx="10" width="80" x="334" y="513"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="332" y="511"></rect>
<text class="terminal" x="342" y="531">INCLUDE</text>
<rect height="32" rx="10" width="26" x="466" y="425"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="464" y="423"></rect>
<text class="terminal" x="474" y="443">(</text><a xlink:href="/docs/v24.3/sql-grammar#name_list" xlink:title="name_list">
<rect height="32" width="82" x="512" y="425"></rect>
<rect class="nonterminal" height="32" width="82" x="510" y="423"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="522" y="443">name_list</text></a><rect height="32" rx="10" width="26" x="614" y="425"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="612" y="423"></rect>
<text class="terminal" x="622" y="443">)</text>
<rect height="32" rx="10" width="98" x="106" y="611"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="104" y="609"></rect>
<text class="terminal" x="114" y="629">PARTITION</text>
<rect height="32" rx="10" width="44" x="244" y="643"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="242" y="641"></rect>
<text class="terminal" x="252" y="661">ALL</text>
<rect height="32" rx="10" width="38" x="328" y="611"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="326" y="609"></rect>
<text class="terminal" x="336" y="629">BY</text><a xlink:href="/docs/v24.3/sql-grammar#partition_by_inner" xlink:title="partition_by_inner">
<rect height="32" width="136" x="386" y="611"></rect>
<rect class="nonterminal" height="32" width="136" x="384" y="609"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="10" class="nonterminal" x="396" y="629">partition_by_inner</text></a><rect height="32" rx="10" width="58" x="562" y="579"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="560" y="577"></rect>
<text class="terminal" x="570" y="597">WITH</text>
<rect height="32" rx="10" width="26" x="640" y="579"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="638" y="577"></rect>
<text class="terminal" x="648" y="597">(</text><a xlink:href="/docs/v24.3/sql-grammar#storage_parameter" xlink:title="storage_parameter">
<rect height="32" width="144" x="205" y="753"></rect>
<rect class="nonterminal" height="32" width="144" x="203" y="751"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="120" font-size="11" class="nonterminal" x="215" y="771">storage_parameter</text></a><rect height="32" rx="10" width="24" x="205" y="709"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="203" y="707"></rect>
<text class="terminal" x="213" y="727">,</text>
<rect height="32" rx="10" width="26" x="389" y="753"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="387" y="751"></rect>
<text class="terminal" x="397" y="771">)</text><a xlink:href="/docs/v24.3/sql-grammar#opt_where_clause" xlink:title="opt_where_clause">
<rect height="32" width="136" x="435" y="753"></rect>
<rect class="nonterminal" height="32" width="136" x="433" y="751"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="445" y="771">opt_where_clause</text></a><a xlink:href="/docs/v24.3/sql-grammar#opt_index_visible" xlink:title="opt_index_visible">
<rect height="32" width="130" x="591" y="753"></rect>
<rect class="nonterminal" height="32" width="130" x="589" y="751"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="601" y="771">opt_index_visible</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m20 0 h10 m0 0 h84 m-114 0 h20 m94 0 h20 m-134 0 q10 0 10 10 m114 0 q0 -10 10 -10 m-124 10 v12 m114 0 v-12 m-114 12 q0 10 10 10 m94 0 q10 0 10 -10 m-104 10 h10 m74 0 h10 m20 -32 h10 m64 0 h10 m20 0 h10 m0 0 h140 m-170 0 h20 m150 0 h20 m-190 0 q10 0 10 10 m170 0 q0 -10 10 -10 m-180 10 v12 m170 0 v-12 m-170 12 q0 10 10 10 m150 0 q10 0 10 -10 m-160 10 h10 m130 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-442 98 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m126 0 h10 m0 0 h184 m-350 0 h20 m330 0 h20 m-370 0 q10 0 10 10 m350 0 q0 -10 10 -10 m-360 10 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m98 0 h10 m20 -44 h10 m40 0 h10 m0 0 h10 m96 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-658 154 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h150 m-180 0 h20 m160 0 h20 m-200 0 q10 0 10 10 m180 0 q0 -10 10 -10 m-190 10 v12 m180 0 v-12 m-180 12 q0 10 10 10 m160 0 q10 0 10 -10 m-170 10 h10 m64 0 h10 m0 0 h10 m56 0 h10 m20 -32 h10 m26 0 h10 m40 0 h10 m162 0 h10 m-202 0 h20 m182 0 h20 m-222 0 q10 0 10 10 m202 0 q0 -10 10 -10 m-212 10 v24 m202 0 v-24 m-202 24 q0 10 10 10 m182 0 q10 0 10 -10 m-192 10 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m0 0 h6 m-192 -10 v20 m202 0 v-20 m-202 20 v24 m202 0 v-24 m-202 24 q0 10 10 10 m182 0 q10 0 10 -10 m-192 10 h10 m56 0 h10 m0 0 h106 m20 -88 h10 m148 0 h10 m-410 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m390 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-390 0 h10 m24 0 h10 m0 0 h346 m20 44 h10 m26 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-679 138 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h152 m-182 0 h20 m162 0 h20 m-202 0 q10 0 10 10 m182 0 q0 -10 10 -10 m-192 10 v12 m182 0 v-12 m-182 12 q0 10 10 10 m162 0 q10 0 10 -10 m-172 10 h10 m64 0 h10 m0 0 h10 m58 0 h10 m40 -32 h10 m0 0 h336 m-366 0 h20 m346 0 h20 m-386 0 q10 0 10 10 m366 0 q0 -10 10 -10 m-376 10 v12 m366 0 v-12 m-366 12 q0 10 10 10 m346 0 q10 0 10 -10 m-336 10 h10 m92 0 h10 m-132 0 h20 m112 0 h20 m-152 0 q10 0 10 10 m132 0 q0 -10 10 -10 m-142 10 v24 m132 0 v-24 m-132 24 q0 10 10 10 m112 0 q10 0 10 -10 m-122 10 h10 m84 0 h10 m0 0 h8 m-122 -10 v20 m132 0 v-20 m-132 20 v24 m132 0 v-24 m-132 24 q0 10 10 10 m112 0 q10 0 10 -10 m-122 10 h10 m80 0 h10 m0 0 h12 m20 -88 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-618 186 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h426 m-456 0 h20 m436 0 h20 m-476 0 q10 0 10 10 m456 0 q0 -10 10 -10 m-466 10 v12 m456 0 v-12 m-456 12 q0 10 10 10 m436 0 q10 0 10 -10 m-446 10 h10 m98 0 h10 m20 0 h10 m0 0 h54 m-84 0 h20 m64 0 h20 m-104 0 q10 0 10 10 m84 0 q0 -10 10 -10 m-94 10 v12 m84 0 v-12 m-84 12 q0 10 10 10 m64 0 q10 0 10 -10 m-74 10 h10 m44 0 h10 m20 -32 h10 m38 0 h10 m0 0 h10 m136 0 h10 m20 -32 h10 m58 0 h10 m0 0 h10 m26 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-525 174 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m144 0 h10 m-184 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m164 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-164 0 h10 m24 0 h10 m0 0 h120 m20 44 h10 m26 0 h10 m0 0 h10 m136 0 h10 m0 0 h10 m130 0 h10 m3 0 h-3"></path>
<polygon points="739 767 747 763 747 771"></polygon>
<polygon points="739 767 731 763 731 771"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
