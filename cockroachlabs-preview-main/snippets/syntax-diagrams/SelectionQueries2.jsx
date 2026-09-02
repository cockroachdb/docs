export const SelectionQueries2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="345" width="385" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="/docs/stable/sql-grammar#simple_select_clause" xlink:title="simple_select_clause">
<rect height="32" width="154" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="154" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="10" class="nonterminal" x="61" y="21">simple_select_clause</text></a><a xlink:href="/docs/stable/sql-grammar#values_clause" xlink:title="values_clause">
<rect height="32" width="110" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="110" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="10" class="nonterminal" x="61" y="65">values_clause</text></a><a xlink:href="/docs/stable/sql-grammar#table_clause" xlink:title="table_clause">
<rect height="32" width="100" x="51" y="91"></rect>
<rect class="nonterminal" height="32" width="100" x="49" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="76" font-size="10" class="nonterminal" x="61" y="109">table_clause</text></a><a xlink:href="/docs/stable/sql-grammar#set_operation" xlink:title="set_operation">
<rect height="32" width="108" x="51" y="135"></rect>
<rect class="nonterminal" height="32" width="108" x="49" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="61" y="153">set_operation</text></a><rect height="32" rx="10" width="26" x="51" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="49" y="177"></rect>
<text class="terminal" x="59" y="197">(</text><a xlink:href="/docs/stable/sql-grammar#simple_select_clause" xlink:title="simple_select_clause">
<rect height="32" width="154" x="117" y="179"></rect>
<rect class="nonterminal" height="32" width="154" x="115" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="10" class="nonterminal" x="127" y="197">simple_select_clause</text></a><a xlink:href="/docs/stable/sql-grammar#values_clause" xlink:title="values_clause">
<rect height="32" width="110" x="117" y="223"></rect>
<rect class="nonterminal" height="32" width="110" x="115" y="221"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="10" class="nonterminal" x="127" y="241">values_clause</text></a><a xlink:href="/docs/stable/sql-grammar#table_clause" xlink:title="table_clause">
<rect height="32" width="100" x="117" y="267"></rect>
<rect class="nonterminal" height="32" width="100" x="115" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="76" font-size="10" class="nonterminal" x="127" y="285">table_clause</text></a><a xlink:href="/docs/stable/sql-grammar#set_operation" xlink:title="set_operation">
<rect height="32" width="108" x="117" y="311"></rect>
<rect class="nonterminal" height="32" width="108" x="115" y="309"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="127" y="329">set_operation</text></a><rect height="32" rx="10" width="26" x="311" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="309" y="177"></rect>
<text class="terminal" x="319" y="197">)</text>
<path class="line" d="m17 17 h2 m20 0 h10 m154 0 h10 m0 0 h132 m-326 0 h20 m306 0 h20 m-346 0 q10 0 10 10 m326 0 q0 -10 10 -10 m-336 10 v24 m326 0 v-24 m-326 24 q0 10 10 10 m306 0 q10 0 10 -10 m-316 10 h10 m110 0 h10 m0 0 h176 m-316 -10 v20 m326 0 v-20 m-326 20 v24 m326 0 v-24 m-326 24 q0 10 10 10 m306 0 q10 0 10 -10 m-316 10 h10 m100 0 h10 m0 0 h186 m-316 -10 v20 m326 0 v-20 m-326 20 v24 m326 0 v-24 m-326 24 q0 10 10 10 m306 0 q10 0 10 -10 m-316 10 h10 m108 0 h10 m0 0 h178 m-316 -10 v20 m326 0 v-20 m-326 20 v24 m326 0 v-24 m-326 24 q0 10 10 10 m306 0 q10 0 10 -10 m-316 10 h10 m26 0 h10 m20 0 h10 m154 0 h10 m-194 0 h20 m174 0 h20 m-214 0 q10 0 10 10 m194 0 q0 -10 10 -10 m-204 10 v24 m194 0 v-24 m-194 24 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m110 0 h10 m0 0 h44 m-184 -10 v20 m194 0 v-20 m-194 20 v24 m194 0 v-24 m-194 24 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m100 0 h10 m0 0 h54 m-184 -10 v20 m194 0 v-20 m-194 20 v24 m194 0 v-24 m-194 24 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m108 0 h10 m0 0 h46 m20 -132 h10 m26 0 h10 m23 -176 h-3"></path>
<polygon points="375 17 383 13 383 21"></polygon>
<polygon points="375 17 367 13 367 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
