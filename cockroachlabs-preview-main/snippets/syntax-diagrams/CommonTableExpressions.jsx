export const CommonTableExpressions = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="485" width="1015" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">WITH</text>
<rect height="32" rx="10" width="98" x="129" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="127" y="33"></rect>
<text class="terminal" x="137" y="53">RECURSIVE</text><a xlink:href="/docs/stable/sql-grammar#table_alias_name" xlink:title="table_alias_name">
<rect height="32" width="134" x="45" y="145"></rect>
<rect class="nonterminal" height="32" width="134" x="43" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="55" y="163">table_alias_name</text></a><a xlink:href="/docs/stable/sql-grammar#opt_col_def_list_no_types" xlink:title="opt_col_def_list_no_types">
<rect height="32" width="188" x="199" y="145"></rect>
<rect class="nonterminal" height="32" width="188" x="197" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="164" font-size="10" class="nonterminal" x="209" y="163">opt_col_def_list_no_types</text></a><rect height="32" rx="10" width="38" x="407" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="405" y="143"></rect>
<text class="terminal" x="415" y="163">AS</text>
<rect height="32" rx="10" width="48" x="505" y="209"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="503" y="207"></rect>
<text class="terminal" x="513" y="227">NOT</text>
<rect height="32" rx="10" width="122" x="593" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="122" x="591" y="175"></rect>
<text class="terminal" x="601" y="195">MATERIALIZED</text>
<rect height="32" rx="10" width="26" x="755" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="753" y="143"></rect>
<text class="terminal" x="763" y="163">(</text><a xlink:href="/docs/stable/sql-grammar#preparable_stmt" xlink:title="preparable_stmt">
<rect height="32" width="126" x="801" y="145"></rect>
<rect class="nonterminal" height="32" width="126" x="799" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="811" y="163">preparable_stmt</text></a><rect height="32" rx="10" width="26" x="947" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="945" y="143"></rect>
<text class="terminal" x="955" y="163">)</text>
<rect height="32" rx="10" width="24" x="45" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="43" y="99"></rect>
<text class="terminal" x="53" y="119">,</text><a xlink:href="/docs/stable/sql-grammar#insert_stmt" xlink:title="insert_stmt">
<rect height="32" width="92" x="865" y="275"></rect>
<rect class="nonterminal" height="32" width="92" x="863" y="273"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="875" y="293">insert_stmt</text></a><a xlink:href="/docs/stable/sql-grammar#update_stmt" xlink:title="update_stmt">
<rect height="32" width="102" x="865" y="319"></rect>
<rect class="nonterminal" height="32" width="102" x="863" y="317"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="11" class="nonterminal" x="875" y="337">update_stmt</text></a><a xlink:href="/docs/stable/sql-grammar#delete_stmt" xlink:title="delete_stmt">
<rect height="32" width="96" x="865" y="363"></rect>
<rect class="nonterminal" height="32" width="96" x="863" y="361"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="875" y="381">delete_stmt</text></a><a xlink:href="/docs/stable/sql-grammar#upsert_stmt" xlink:title="upsert_stmt">
<rect height="32" width="98" x="865" y="407"></rect>
<rect class="nonterminal" height="32" width="98" x="863" y="405"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="10" class="nonterminal" x="875" y="425">upsert_stmt</text></a><a xlink:href="/docs/stable/sql-grammar#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="865" y="451"></rect>
<rect class="nonterminal" height="32" width="94" x="863" y="449"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="875" y="469">select_stmt</text></a><path class="line" d="m17 17 h2 m0 0 h10 m58 0 h10 m20 0 h10 m0 0 h108 m-138 0 h20 m118 0 h20 m-158 0 q10 0 10 10 m138 0 q0 -10 10 -10 m-148 10 v12 m138 0 v-12 m-138 12 q0 10 10 10 m118 0 q10 0 10 -10 m-128 10 h10 m98 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-266 142 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m134 0 h10 m0 0 h10 m188 0 h10 m0 0 h10 m38 0 h10 m20 0 h10 m0 0 h240 m-270 0 h20 m250 0 h20 m-290 0 q10 0 10 10 m270 0 q0 -10 10 -10 m-280 10 v12 m270 0 v-12 m-270 12 q0 10 10 10 m250 0 q10 0 10 -10 m-240 10 h10 m0 0 h58 m-88 0 h20 m68 0 h20 m-108 0 q10 0 10 10 m88 0 q0 -10 10 -10 m-98 10 v12 m88 0 v-12 m-88 12 q0 10 10 10 m68 0 q10 0 10 -10 m-78 10 h10 m48 0 h10 m20 -32 h10 m122 0 h10 m20 -32 h10 m26 0 h10 m0 0 h10 m126 0 h10 m0 0 h10 m26 0 h10 m-968 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m948 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-948 0 h10 m24 0 h10 m0 0 h904 m22 44 l2 0 m2 0 l2 0 m2 0 l2 0 m-192 130 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m92 0 h10 m0 0 h10 m-142 0 h20 m122 0 h20 m-162 0 q10 0 10 10 m142 0 q0 -10 10 -10 m-152 10 v24 m142 0 v-24 m-142 24 q0 10 10 10 m122 0 q10 0 10 -10 m-132 10 h10 m102 0 h10 m-132 -10 v20 m142 0 v-20 m-142 20 v24 m142 0 v-24 m-142 24 q0 10 10 10 m122 0 q10 0 10 -10 m-132 10 h10 m96 0 h10 m0 0 h6 m-132 -10 v20 m142 0 v-20 m-142 20 v24 m142 0 v-24 m-142 24 q0 10 10 10 m122 0 q10 0 10 -10 m-132 10 h10 m98 0 h10 m0 0 h4 m-132 -10 v20 m142 0 v-20 m-142 20 v24 m142 0 v-24 m-142 24 q0 10 10 10 m122 0 q10 0 10 -10 m-132 10 h10 m94 0 h10 m0 0 h8 m23 -176 h-3"></path>
<polygon points="1005 289 1013 285 1013 293"></polygon>
<polygon points="1005 289 997 285 997 293"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
