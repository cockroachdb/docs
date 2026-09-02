export const SelectClause3 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="543" width="743" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="70" x="31" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="29" y="45"></rect>
<text class="terminal" x="39" y="65">SELECT</text>
<rect height="32" rx="10" width="44" x="141" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="139" y="77"></rect>
<text class="terminal" x="149" y="97">ALL</text>
<rect height="32" rx="10" width="86" x="141" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="139" y="165"></rect>
<text class="terminal" x="149" y="185">DISTINCT</text>
<rect height="32" rx="10" width="40" x="267" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="265" y="165"></rect>
<text class="terminal" x="275" y="185">ON</text>
<rect height="32" rx="10" width="26" x="327" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="325" y="165"></rect>
<text class="terminal" x="335" y="185">(</text><a xlink:href="/docs/v23.2/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="393" y="167"></rect>
<rect class="nonterminal" height="32" width="64" x="391" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="403" y="185">a_expr</text></a><rect height="32" rx="10" width="24" x="393" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="391" y="121"></rect>
<text class="terminal" x="401" y="141">,</text>
<rect height="32" rx="10" width="26" x="497" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="495" y="165"></rect>
<text class="terminal" x="505" y="185">)</text><a xlink:href="/docs/v23.2/sql-grammar#target_elem" xlink:title="target_elem">
<rect height="32" width="98" x="603" y="47"></rect>
<rect class="nonterminal" height="32" width="98" x="601" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="10" class="nonterminal" x="613" y="65">target_elem</text></a><rect height="32" rx="10" width="24" x="603" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="601" y="1"></rect>
<text class="terminal" x="611" y="21">,</text>
<rect height="32" rx="10" width="60" x="70" y="293"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="68" y="291"></rect>
<text class="terminal" x="78" y="311">FROM</text><a xlink:href="/docs/v23.2/sql-grammar#table_ref" xlink:title="table_ref">
<rect height="32" width="78" x="170" y="293"></rect>
<rect class="nonterminal" height="32" width="78" x="168" y="291"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="54" font-size="10" class="nonterminal" x="180" y="311">table_ref</text></a><rect height="32" rx="10" width="24" x="170" y="249"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="168" y="247"></rect>
<text class="terminal" x="178" y="267">,</text>
<rect height="32" rx="10" width="38" x="308" y="325"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="306" y="323"></rect>
<text class="terminal" x="316" y="343">AS</text>
<rect height="32" rx="10" width="38" x="366" y="325"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="364" y="323"></rect>
<text class="terminal" x="374" y="343">OF</text>
<rect height="32" rx="10" width="74" x="424" y="325"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="422" y="323"></rect>
<text class="terminal" x="432" y="343">SYSTEM</text>
<rect height="32" rx="10" width="54" x="518" y="325"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="516" y="323"></rect>
<text class="terminal" x="526" y="343">TIME</text><a xlink:href="/docs/v23.2/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="592" y="325"></rect>
<rect class="nonterminal" height="32" width="64" x="590" y="323"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="602" y="343">a_expr</text></a><rect height="32" rx="10" width="70" x="140" y="423"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="138" y="421"></rect>
<text class="terminal" x="148" y="441">WHERE</text><a xlink:href="/docs/v23.2/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="230" y="423"></rect>
<rect class="nonterminal" height="32" width="64" x="228" y="421"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="240" y="441">a_expr</text></a><rect height="32" rx="10" width="68" x="354" y="423"></rect>
<rect class="terminal" height="32" rx="10" width="68" x="352" y="421"></rect>
<text class="terminal" x="362" y="441">GROUP</text>
<rect height="32" rx="10" width="38" x="442" y="423"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="440" y="421"></rect>
<text class="terminal" x="450" y="441">BY</text><a xlink:href="/docs/v23.2/sql-grammar#group_by_list" xlink:title="group_by_list">
<rect height="32" width="106" x="500" y="423"></rect>
<rect class="nonterminal" height="32" width="106" x="498" y="421"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="510" y="441">group_by_list</text></a><rect height="32" rx="10" width="74" x="211" y="509"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="209" y="507"></rect>
<text class="terminal" x="219" y="527">HAVING</text><a xlink:href="/docs/v23.2/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="305" y="509"></rect>
<rect class="nonterminal" height="32" width="64" x="303" y="507"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="315" y="527">a_expr</text></a><rect height="32" rx="10" width="86" x="429" y="509"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="427" y="507"></rect>
<text class="terminal" x="437" y="527">WINDOW</text><a xlink:href="/docs/v23.2/sql-grammar#window_definition_list" xlink:title="window_definition_list">
<rect height="32" width="160" x="535" y="509"></rect>
<rect class="nonterminal" height="32" width="160" x="533" y="507"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="136" font-size="10" class="nonterminal" x="545" y="527">window_definition_list</text></a><path class="line" d="m17 61 h2 m0 0 h10 m70 0 h10 m20 0 h10 m0 0 h412 m-442 0 h20 m422 0 h20 m-462 0 q10 0 10 10 m442 0 q0 -10 10 -10 m-452 10 v12 m442 0 v-12 m-442 12 q0 10 10 10 m422 0 q10 0 10 -10 m-432 10 h10 m44 0 h10 m0 0 h358 m-432 -10 v20 m442 0 v-20 m-442 20 v68 m442 0 v-68 m-442 68 q0 10 10 10 m422 0 q10 0 10 -10 m-432 10 h10 m86 0 h10 m20 0 h10 m40 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m64 0 h10 m-104 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m84 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-84 0 h10 m24 0 h10 m0 0 h40 m20 44 h10 m26 0 h10 m-296 0 h20 m276 0 h20 m-316 0 q10 0 10 10 m296 0 q0 -10 10 -10 m-306 10 v14 m296 0 v-14 m-296 14 q0 10 10 10 m276 0 q10 0 10 -10 m-286 10 h10 m0 0 h266 m60 -154 h10 m98 0 h10 m-138 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m118 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-118 0 h10 m24 0 h10 m0 0 h74 m22 44 l2 0 m2 0 l2 0 m2 0 l2 0 m-715 246 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m60 0 h10 m20 0 h10 m78 0 h10 m-118 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m98 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-98 0 h10 m24 0 h10 m0 0 h54 m40 44 h10 m0 0 h358 m-388 0 h20 m368 0 h20 m-408 0 q10 0 10 10 m388 0 q0 -10 10 -10 m-398 10 v12 m388 0 v-12 m-388 12 q0 10 10 10 m368 0 q10 0 10 -10 m-378 10 h10 m38 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m54 0 h10 m0 0 h10 m64 0 h10 m-626 -32 h20 m626 0 h20 m-666 0 q10 0 10 10 m646 0 q0 -10 10 -10 m-656 10 v46 m646 0 v-46 m-646 46 q0 10 10 10 m626 0 q10 0 10 -10 m-636 10 h10 m0 0 h616 m22 -66 l2 0 m2 0 l2 0 m2 0 l2 0 m-620 98 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h164 m-194 0 h20 m174 0 h20 m-214 0 q10 0 10 10 m194 0 q0 -10 10 -10 m-204 10 v12 m194 0 v-12 m-194 12 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m70 0 h10 m0 0 h10 m64 0 h10 m40 -32 h10 m0 0 h262 m-292 0 h20 m272 0 h20 m-312 0 q10 0 10 10 m292 0 q0 -10 10 -10 m-302 10 v12 m292 0 v-12 m-292 12 q0 10 10 10 m272 0 q10 0 10 -10 m-282 10 h10 m68 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m106 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-479 86 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h168 m-198 0 h20 m178 0 h20 m-218 0 q10 0 10 10 m198 0 q0 -10 10 -10 m-208 10 v12 m198 0 v-12 m-198 12 q0 10 10 10 m178 0 q10 0 10 -10 m-188 10 h10 m74 0 h10 m0 0 h10 m64 0 h10 m40 -32 h10 m0 0 h276 m-306 0 h20 m286 0 h20 m-326 0 q10 0 10 10 m306 0 q0 -10 10 -10 m-316 10 v12 m306 0 v-12 m-306 12 q0 10 10 10 m286 0 q10 0 10 -10 m-296 10 h10 m86 0 h10 m0 0 h10 m160 0 h10 m23 -32 h-3"></path>
<polygon points="733 491 741 487 741 495"></polygon>
<polygon points="733 491 725 487 725 495"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
