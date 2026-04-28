export const CommentOn6 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="367" width="733" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="88" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">COMMENT</text>
<rect height="32" rx="10" width="40" x="139" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="137" y="1"></rect>
<text class="terminal" x="147" y="21">ON</text>
<rect height="32" rx="10" width="92" x="219" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="217" y="1"></rect>
<text class="terminal" x="227" y="21">DATABASE</text><a xlink:href="/docs/v25.4/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="331" y="3"></rect>
<rect class="nonterminal" height="32" width="124" x="329" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="341" y="21">database_name</text></a><rect height="32" rx="10" width="76" x="219" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="217" y="45"></rect>
<text class="terminal" x="227" y="65">SCHEMA</text><a xlink:href="/docs/v25.4/sql-grammar#qualifiable_schema_name" xlink:title="qualifiable_schema_name">
<rect height="32" width="186" x="315" y="47"></rect>
<rect class="nonterminal" height="32" width="186" x="313" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="162" font-size="11" class="nonterminal" x="325" y="65">qualifiable_schema_name</text></a><rect height="32" rx="10" width="54" x="219" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="217" y="89"></rect>
<text class="terminal" x="227" y="109">TYPE</text><a xlink:href="/docs/v25.4/sql-grammar#type_name" xlink:title="type_name">
<rect height="32" width="92" x="293" y="91"></rect>
<rect class="nonterminal" height="32" width="92" x="291" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="12" class="nonterminal" x="303" y="109">type_name</text></a><rect height="32" rx="10" width="62" x="239" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="237" y="133"></rect>
<text class="terminal" x="247" y="153">TABLE</text>
<rect height="32" rx="10" width="110" x="239" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="237" y="177"></rect>
<text class="terminal" x="247" y="197">CONSTRAINT</text><a xlink:href="/docs/v25.4/sql-grammar#constraint_name" xlink:title="constraint_name">
<rect height="32" width="126" x="369" y="179"></rect>
<rect class="nonterminal" height="32" width="126" x="367" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="379" y="197">constraint_name</text></a><rect height="32" rx="10" width="40" x="515" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="513" y="177"></rect>
<text class="terminal" x="523" y="197">ON</text><a xlink:href="/docs/v25.4/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="595" y="135"></rect>
<rect class="nonterminal" height="32" width="96" x="593" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="605" y="153">table_name</text></a><rect height="32" rx="10" width="78" x="219" y="223"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="217" y="221"></rect>
<text class="terminal" x="227" y="241">COLUMN</text><a xlink:href="/docs/v25.4/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="317" y="223"></rect>
<rect class="nonterminal" height="32" width="108" x="315" y="221"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="327" y="241">column_name</text></a><rect height="32" rx="10" width="64" x="219" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="217" y="265"></rect>
<text class="terminal" x="227" y="285">INDEX</text><a xlink:href="/docs/v25.4/sql-grammar#table_index_name" xlink:title="table_index_name">
<rect height="32" width="138" x="303" y="267"></rect>
<rect class="nonterminal" height="32" width="138" x="301" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="11" class="nonterminal" x="313" y="285">table_index_name</text></a><rect height="32" rx="10" width="36" x="537" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="535" y="331"></rect>
<text class="terminal" x="545" y="351">IS</text><a xlink:href="/docs/v25.4/sql-grammar#comment_text" xlink:title="comment_text">
<rect height="32" width="112" x="593" y="333"></rect>
<rect class="nonterminal" height="32" width="112" x="591" y="331"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="88" font-size="11" class="nonterminal" x="603" y="351">comment_text</text></a><path class="line" d="m17 17 h2 m0 0 h10 m88 0 h10 m0 0 h10 m40 0 h10 m20 0 h10 m92 0 h10 m0 0 h10 m124 0 h10 m0 0 h236 m-512 0 h20 m492 0 h20 m-532 0 q10 0 10 10 m512 0 q0 -10 10 -10 m-522 10 v24 m512 0 v-24 m-512 24 q0 10 10 10 m492 0 q10 0 10 -10 m-502 10 h10 m76 0 h10 m0 0 h10 m186 0 h10 m0 0 h190 m-502 -10 v20 m512 0 v-20 m-512 20 v24 m512 0 v-24 m-512 24 q0 10 10 10 m492 0 q10 0 10 -10 m-502 10 h10 m54 0 h10 m0 0 h10 m92 0 h10 m0 0 h306 m-502 -10 v20 m512 0 v-20 m-512 20 v24 m512 0 v-24 m-512 24 q0 10 10 10 m492 0 q10 0 10 -10 m-482 10 h10 m62 0 h10 m0 0 h254 m-356 0 h20 m336 0 h20 m-376 0 q10 0 10 10 m356 0 q0 -10 10 -10 m-366 10 v24 m356 0 v-24 m-356 24 q0 10 10 10 m336 0 q10 0 10 -10 m-346 10 h10 m110 0 h10 m0 0 h10 m126 0 h10 m0 0 h10 m40 0 h10 m20 -44 h10 m96 0 h10 m-502 -10 v20 m512 0 v-20 m-512 20 v68 m512 0 v-68 m-512 68 q0 10 10 10 m492 0 q10 0 10 -10 m-502 10 h10 m78 0 h10 m0 0 h10 m108 0 h10 m0 0 h266 m-502 -10 v20 m512 0 v-20 m-512 20 v24 m512 0 v-24 m-512 24 q0 10 10 10 m492 0 q10 0 10 -10 m-502 10 h10 m64 0 h10 m0 0 h10 m138 0 h10 m0 0 h250 m22 -264 l2 0 m2 0 l2 0 m2 0 l2 0 m-218 330 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m36 0 h10 m0 0 h10 m112 0 h10 m3 0 h-3"></path>
<polygon points="723 347 731 343 731 351"></polygon>
<polygon points="723 347 715 343 715 351"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
