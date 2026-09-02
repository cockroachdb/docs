export const SelectClause4 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="499" width="743" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="70" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SELECT</text>
<rect height="32" rx="10" width="44" x="161" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="159" y="33"></rect>
<text class="terminal" x="169" y="53">ALL</text><a xlink:href="/docs/v24.1/sql-grammar#opt_target_list" xlink:title="opt_target_list">
<rect height="32" width="114" x="245" y="3"></rect>
<rect class="nonterminal" height="32" width="114" x="243" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="90" font-size="10" class="nonterminal" x="255" y="21">opt_target_list</text></a><rect height="32" rx="10" width="86" x="141" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="139" y="121"></rect>
<text class="terminal" x="149" y="141">DISTINCT</text>
<rect height="32" rx="10" width="40" x="267" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="265" y="121"></rect>
<text class="terminal" x="275" y="141">ON</text>
<rect height="32" rx="10" width="26" x="327" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="325" y="121"></rect>
<text class="terminal" x="335" y="141">(</text><a xlink:href="/docs/v24.1/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="393" y="123"></rect>
<rect class="nonterminal" height="32" width="64" x="391" y="121"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="403" y="141">a_expr</text></a><rect height="32" rx="10" width="24" x="393" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="391" y="77"></rect>
<text class="terminal" x="401" y="97">,</text>
<rect height="32" rx="10" width="26" x="497" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="495" y="121"></rect>
<text class="terminal" x="505" y="141">)</text><a xlink:href="/docs/v24.1/sql-grammar#target_elem" xlink:title="target_elem">
<rect height="32" width="98" x="583" y="123"></rect>
<rect class="nonterminal" height="32" width="98" x="581" y="121"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="10" class="nonterminal" x="593" y="141">target_elem</text></a><rect height="32" rx="10" width="24" x="583" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="581" y="77"></rect>
<text class="terminal" x="591" y="97">,</text>
<rect height="32" rx="10" width="60" x="70" y="249"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="68" y="247"></rect>
<text class="terminal" x="78" y="267">FROM</text><a xlink:href="/docs/v24.1/sql-grammar#table_ref" xlink:title="table_ref">
<rect height="32" width="78" x="170" y="249"></rect>
<rect class="nonterminal" height="32" width="78" x="168" y="247"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="54" font-size="10" class="nonterminal" x="180" y="267">table_ref</text></a><rect height="32" rx="10" width="24" x="170" y="205"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="168" y="203"></rect>
<text class="terminal" x="178" y="223">,</text>
<rect height="32" rx="10" width="38" x="308" y="281"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="306" y="279"></rect>
<text class="terminal" x="316" y="299">AS</text>
<rect height="32" rx="10" width="38" x="366" y="281"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="364" y="279"></rect>
<text class="terminal" x="374" y="299">OF</text>
<rect height="32" rx="10" width="74" x="424" y="281"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="422" y="279"></rect>
<text class="terminal" x="432" y="299">SYSTEM</text>
<rect height="32" rx="10" width="54" x="518" y="281"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="516" y="279"></rect>
<text class="terminal" x="526" y="299">TIME</text><a xlink:href="/docs/v24.1/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="592" y="281"></rect>
<rect class="nonterminal" height="32" width="64" x="590" y="279"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="602" y="299">a_expr</text></a><rect height="32" rx="10" width="70" x="140" y="379"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="138" y="377"></rect>
<text class="terminal" x="148" y="397">WHERE</text><a xlink:href="/docs/v24.1/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="230" y="379"></rect>
<rect class="nonterminal" height="32" width="64" x="228" y="377"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="240" y="397">a_expr</text></a><rect height="32" rx="10" width="68" x="354" y="379"></rect>
<rect class="terminal" height="32" rx="10" width="68" x="352" y="377"></rect>
<text class="terminal" x="362" y="397">GROUP</text>
<rect height="32" rx="10" width="38" x="442" y="379"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="440" y="377"></rect>
<text class="terminal" x="450" y="397">BY</text><a xlink:href="/docs/v24.1/sql-grammar#group_by_list" xlink:title="group_by_list">
<rect height="32" width="106" x="500" y="379"></rect>
<rect class="nonterminal" height="32" width="106" x="498" y="377"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="510" y="397">group_by_list</text></a><rect height="32" rx="10" width="74" x="211" y="465"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="209" y="463"></rect>
<text class="terminal" x="219" y="483">HAVING</text><a xlink:href="/docs/v24.1/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="305" y="465"></rect>
<rect class="nonterminal" height="32" width="64" x="303" y="463"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="315" y="483">a_expr</text></a><rect height="32" rx="10" width="86" x="429" y="465"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="427" y="463"></rect>
<text class="terminal" x="437" y="483">WINDOW</text><a xlink:href="/docs/v24.1/sql-grammar#window_definition_list" xlink:title="window_definition_list">
<rect height="32" width="160" x="535" y="465"></rect>
<rect class="nonterminal" height="32" width="160" x="533" y="463"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="136" font-size="10" class="nonterminal" x="545" y="483">window_definition_list</text></a><path class="line" d="m17 17 h2 m0 0 h10 m70 0 h10 m40 0 h10 m0 0 h54 m-84 0 h20 m64 0 h20 m-104 0 q10 0 10 10 m84 0 q0 -10 10 -10 m-94 10 v12 m84 0 v-12 m-84 12 q0 10 10 10 m64 0 q10 0 10 -10 m-74 10 h10 m44 0 h10 m20 -32 h10 m114 0 h10 m0 0 h342 m-600 0 h20 m580 0 h20 m-620 0 q10 0 10 10 m600 0 q0 -10 10 -10 m-610 10 v100 m600 0 v-100 m-600 100 q0 10 10 10 m580 0 q10 0 10 -10 m-590 10 h10 m86 0 h10 m20 0 h10 m40 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m64 0 h10 m-104 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m84 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-84 0 h10 m24 0 h10 m0 0 h40 m20 44 h10 m26 0 h10 m-296 0 h20 m276 0 h20 m-316 0 q10 0 10 10 m296 0 q0 -10 10 -10 m-306 10 v14 m296 0 v-14 m-296 14 q0 10 10 10 m276 0 q10 0 10 -10 m-286 10 h10 m0 0 h266 m40 -34 h10 m98 0 h10 m-138 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m118 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-118 0 h10 m24 0 h10 m0 0 h74 m42 -76 l2 0 m2 0 l2 0 m2 0 l2 0 m-715 246 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m60 0 h10 m20 0 h10 m78 0 h10 m-118 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m98 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-98 0 h10 m24 0 h10 m0 0 h54 m40 44 h10 m0 0 h358 m-388 0 h20 m368 0 h20 m-408 0 q10 0 10 10 m388 0 q0 -10 10 -10 m-398 10 v12 m388 0 v-12 m-388 12 q0 10 10 10 m368 0 q10 0 10 -10 m-378 10 h10 m38 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m54 0 h10 m0 0 h10 m64 0 h10 m-626 -32 h20 m626 0 h20 m-666 0 q10 0 10 10 m646 0 q0 -10 10 -10 m-656 10 v46 m646 0 v-46 m-646 46 q0 10 10 10 m626 0 q10 0 10 -10 m-636 10 h10 m0 0 h616 m22 -66 l2 0 m2 0 l2 0 m2 0 l2 0 m-620 98 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h164 m-194 0 h20 m174 0 h20 m-214 0 q10 0 10 10 m194 0 q0 -10 10 -10 m-204 10 v12 m194 0 v-12 m-194 12 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m70 0 h10 m0 0 h10 m64 0 h10 m40 -32 h10 m0 0 h262 m-292 0 h20 m272 0 h20 m-312 0 q10 0 10 10 m292 0 q0 -10 10 -10 m-302 10 v12 m292 0 v-12 m-292 12 q0 10 10 10 m272 0 q10 0 10 -10 m-282 10 h10 m68 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m106 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-479 86 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h168 m-198 0 h20 m178 0 h20 m-218 0 q10 0 10 10 m198 0 q0 -10 10 -10 m-208 10 v12 m198 0 v-12 m-198 12 q0 10 10 10 m178 0 q10 0 10 -10 m-188 10 h10 m74 0 h10 m0 0 h10 m64 0 h10 m40 -32 h10 m0 0 h276 m-306 0 h20 m286 0 h20 m-326 0 q10 0 10 10 m306 0 q0 -10 10 -10 m-316 10 v12 m306 0 v-12 m-306 12 q0 10 10 10 m286 0 q10 0 10 -10 m-296 10 h10 m86 0 h10 m0 0 h10 m160 0 h10 m23 -32 h-3"></path>
<polygon points="733 447 741 443 741 451"></polygon>
<polygon points="733 447 725 443 725 451"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
