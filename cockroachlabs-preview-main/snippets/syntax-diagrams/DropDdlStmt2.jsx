export const DropDdlStmt2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="389" width="253" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#drop_database_stmt" xlink:title="drop_database_stmt">
<rect height="32" width="154" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="154" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="11" class="nonterminal" x="61" y="21">drop_database_stmt</text></a><a xlink:href="#drop_index_stmt" xlink:title="drop_index_stmt">
<rect height="32" width="128" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="128" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="104" font-size="11" class="nonterminal" x="61" y="65">drop_index_stmt</text></a><a xlink:href="#drop_table_stmt" xlink:title="drop_table_stmt">
<rect height="32" width="126" x="51" y="91"></rect>
<rect class="nonterminal" height="32" width="126" x="49" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="61" y="109">drop_table_stmt</text></a><a xlink:href="#drop_view_stmt" xlink:title="drop_view_stmt">
<rect height="32" width="122" x="51" y="135"></rect>
<rect class="nonterminal" height="32" width="122" x="49" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="98" font-size="11" class="nonterminal" x="61" y="153">drop_view_stmt</text></a><a xlink:href="#drop_sequence_stmt" xlink:title="drop_sequence_stmt">
<rect height="32" width="154" x="51" y="179"></rect>
<rect class="nonterminal" height="32" width="154" x="49" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="11" class="nonterminal" x="61" y="197">drop_sequence_stmt</text></a><a xlink:href="#drop_schema_stmt" xlink:title="drop_schema_stmt">
<rect height="32" width="142" x="51" y="223"></rect>
<rect class="nonterminal" height="32" width="142" x="49" y="221"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="61" y="241">drop_schema_stmt</text></a><a xlink:href="#drop_type_stmt" xlink:title="drop_type_stmt">
<rect height="32" width="122" x="51" y="267"></rect>
<rect class="nonterminal" height="32" width="122" x="49" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="98" font-size="11" class="nonterminal" x="61" y="285">drop_type_stmt</text></a><a xlink:href="#drop_func_stmt" xlink:title="drop_func_stmt">
<rect height="32" width="120" x="51" y="311"></rect>
<rect class="nonterminal" height="32" width="120" x="49" y="309"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="96" font-size="11" class="nonterminal" x="61" y="329">drop_func_stmt</text></a><a xlink:href="#drop_proc_stmt" xlink:title="drop_proc_stmt">
<rect height="32" width="120" x="51" y="355"></rect>
<rect class="nonterminal" height="32" width="120" x="49" y="353"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="96" font-size="11" class="nonterminal" x="61" y="373">drop_proc_stmt</text></a><path class="line" d="m17 17 h2 m20 0 h10 m154 0 h10 m-194 0 h20 m174 0 h20 m-214 0 q10 0 10 10 m194 0 q0 -10 10 -10 m-204 10 v24 m194 0 v-24 m-194 24 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m128 0 h10 m0 0 h26 m-184 -10 v20 m194 0 v-20 m-194 20 v24 m194 0 v-24 m-194 24 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m126 0 h10 m0 0 h28 m-184 -10 v20 m194 0 v-20 m-194 20 v24 m194 0 v-24 m-194 24 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m122 0 h10 m0 0 h32 m-184 -10 v20 m194 0 v-20 m-194 20 v24 m194 0 v-24 m-194 24 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m154 0 h10 m-184 -10 v20 m194 0 v-20 m-194 20 v24 m194 0 v-24 m-194 24 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m142 0 h10 m0 0 h12 m-184 -10 v20 m194 0 v-20 m-194 20 v24 m194 0 v-24 m-194 24 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m122 0 h10 m0 0 h32 m-184 -10 v20 m194 0 v-20 m-194 20 v24 m194 0 v-24 m-194 24 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m120 0 h10 m0 0 h34 m-184 -10 v20 m194 0 v-20 m-194 20 v24 m194 0 v-24 m-194 24 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m120 0 h10 m0 0 h34 m23 -352 h-3"></path>
<polygon points="243 17 251 13 251 21"></polygon>
<polygon points="243 17 235 13 235 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
