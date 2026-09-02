export const CreateChangefeed3 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="337" width="1303" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="11 17 3 13 3 21"></polygon>
<polygon points="19 17 11 13 11 21"></polygon>
<rect height="32" rx="10" width="72" x="33" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="31" y="1"></rect>
<text class="terminal" x="41" y="21">CREATE</text>
<rect height="32" rx="10" width="110" x="125" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="123" y="1"></rect>
<text class="terminal" x="133" y="21">CHANGEFEED</text>
<rect height="32" rx="10" width="48" x="45" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="43" y="111"></rect>
<text class="terminal" x="53" y="131">FOR</text><a xlink:href="/docs/v24.1/sql-grammar#changefeed_target" xlink:title="changefeed_target">
<rect height="32" width="142" x="133" y="113"></rect>
<rect class="nonterminal" height="32" width="142" x="131" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="143" y="131">changefeed_target</text></a><rect height="32" rx="10" width="24" x="133" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="131" y="67"></rect>
<text class="terminal" x="141" y="87">,</text>
<rect height="32" rx="10" width="56" x="315" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="313" y="111"></rect>
<text class="terminal" x="323" y="131">INTO</text>
<rect height="32" width="44" x="391" y="113"></rect>
<rect class="nonterminal" height="32" width="44" x="389" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="20" font-size="10" class="nonterminal" x="401" y="131">sink</text><rect height="32" rx="10" width="58" x="475" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="473" y="111"></rect>
<text class="terminal" x="483" y="131">WITH</text>
<rect height="32" width="60" x="573" y="113"></rect>
<rect class="nonterminal" height="32" width="60" x="571" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="36" font-size="10" class="nonterminal" x="583" y="131">option</text><rect height="32" rx="10" width="30" x="673" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="671" y="143"></rect>
<text class="terminal" x="681" y="163">=</text>
<rect height="32" width="54" x="723" y="145"></rect>
<rect class="nonterminal" height="32" width="54" x="721" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="733" y="163">value</text><rect height="32" rx="10" width="24" x="573" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="571" y="67"></rect>
<text class="terminal" x="581" y="87">,</text>
<rect height="32" rx="10" width="56" x="45" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="43" y="253"></rect>
<text class="terminal" x="53" y="273">INTO</text>
<rect height="32" width="44" x="121" y="255"></rect>
<rect class="nonterminal" height="32" width="44" x="119" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="20" font-size="10" class="nonterminal" x="131" y="273">sink</text><rect height="32" rx="10" width="58" x="205" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="203" y="253"></rect>
<text class="terminal" x="213" y="273">WITH</text>
<rect height="32" width="60" x="303" y="255"></rect>
<rect class="nonterminal" height="32" width="60" x="301" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="36" font-size="10" class="nonterminal" x="313" y="273">option</text><rect height="32" rx="10" width="30" x="403" y="287"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="401" y="285"></rect>
<text class="terminal" x="411" y="305">=</text>
<rect height="32" width="54" x="453" y="287"></rect>
<rect class="nonterminal" height="32" width="54" x="451" y="285"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="463" y="305">value</text><rect height="32" rx="10" width="24" x="303" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="301" y="209"></rect>
<text class="terminal" x="311" y="229">,</text>
<rect height="32" rx="10" width="38" x="587" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="585" y="253"></rect>
<text class="terminal" x="595" y="273">AS</text>
<rect height="32" rx="10" width="70" x="645" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="643" y="253"></rect>
<text class="terminal" x="653" y="273">SELECT</text><a xlink:href="/docs/v24.1/sql-grammar#target_list" xlink:title="target_list">
<rect height="32" width="86" x="735" y="255"></rect>
<rect class="nonterminal" height="32" width="86" x="733" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="745" y="273">target_list</text></a><rect height="32" rx="10" width="60" x="841" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="839" y="253"></rect>
<text class="terminal" x="849" y="273">FROM</text><a xlink:href="/docs/v24.1/sql-grammar#changefeed_target_expr" xlink:title="changefeed_target_expr">
<rect height="32" width="178" x="921" y="255"></rect>
<rect class="nonterminal" height="32" width="178" x="919" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="154" font-size="11" class="nonterminal" x="931" y="273">changefeed_target_expr</text></a><a xlink:href="/docs/v24.1/sql-grammar#opt_where_clause" xlink:title="opt_where_clause">
<rect height="32" width="136" x="1119" y="255"></rect>
<rect class="nonterminal" height="32" width="136" x="1117" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="1129" y="273">opt_where_clause</text></a><path class="line" d="m19 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m110 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-254 110 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m48 0 h10 m20 0 h10 m142 0 h10 m-182 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m162 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-162 0 h10 m24 0 h10 m0 0 h118 m20 44 h10 m56 0 h10 m0 0 h10 m44 0 h10 m20 0 h10 m58 0 h10 m20 0 h10 m60 0 h10 m20 0 h10 m0 0 h114 m-144 0 h20 m124 0 h20 m-164 0 q10 0 10 10 m144 0 q0 -10 10 -10 m-154 10 v12 m144 0 v-12 m-144 12 q0 10 10 10 m124 0 q10 0 10 -10 m-134 10 h10 m30 0 h10 m0 0 h10 m54 0 h10 m-244 -32 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m244 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-244 0 h10 m24 0 h10 m0 0 h200 m-362 44 h20 m362 0 h20 m-402 0 q10 0 10 10 m382 0 q0 -10 10 -10 m-392 10 v46 m382 0 v-46 m-382 46 q0 10 10 10 m362 0 q10 0 10 -10 m-372 10 h10 m0 0 h352 m20 -66 h418 m-1250 0 h20 m1230 0 h20 m-1270 0 q10 0 10 10 m1250 0 q0 -10 10 -10 m-1260 10 v122 m1250 0 v-122 m-1250 122 q0 10 10 10 m1230 0 q10 0 10 -10 m-1240 10 h10 m56 0 h10 m0 0 h10 m44 0 h10 m20 0 h10 m58 0 h10 m20 0 h10 m60 0 h10 m20 0 h10 m0 0 h114 m-144 0 h20 m124 0 h20 m-164 0 q10 0 10 10 m144 0 q0 -10 10 -10 m-154 10 v12 m144 0 v-12 m-144 12 q0 10 10 10 m124 0 q10 0 10 -10 m-134 10 h10 m30 0 h10 m0 0 h10 m54 0 h10 m-244 -32 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m244 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-244 0 h10 m24 0 h10 m0 0 h200 m-362 44 h20 m362 0 h20 m-402 0 q10 0 10 10 m382 0 q0 -10 10 -10 m-392 10 v46 m382 0 v-46 m-382 46 q0 10 10 10 m362 0 q10 0 10 -10 m-372 10 h10 m0 0 h352 m20 -66 h10 m38 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m86 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m178 0 h10 m0 0 h10 m136 0 h10 m23 -142 h-3"></path>
<polygon points="1293 127 1301 123 1301 131"></polygon>
<polygon points="1293 127 1285 123 1285 131"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
