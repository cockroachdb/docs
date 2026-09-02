export const Insert = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="573" width="685" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">WITH</text>
<rect height="32" rx="10" width="98" x="149" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="147" y="77"></rect>
<text class="terminal" x="157" y="97">RECURSIVE</text><a xlink:href="/docs/stable/sql-grammar#common_table_expr" xlink:title="common_table_expr">
<rect height="32" width="150" x="307" y="47"></rect>
<rect class="nonterminal" height="32" width="150" x="305" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="126" font-size="11" class="nonterminal" x="317" y="65">common_table_expr</text></a><rect height="32" rx="10" width="24" x="307" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="305" y="1"></rect>
<text class="terminal" x="315" y="21">,</text>
<rect height="32" rx="10" width="70" x="517" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="515" y="45"></rect>
<text class="terminal" x="525" y="65">INSERT</text>
<rect height="32" rx="10" width="56" x="607" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="605" y="45"></rect>
<text class="terminal" x="615" y="65">INTO</text><a xlink:href="/docs/stable/sql-grammar#table_name_opt_idx" xlink:title="table_name_opt_idx">
<rect height="32" width="150" x="143" y="161"></rect>
<rect class="nonterminal" height="32" width="150" x="141" y="159"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="126" font-size="11" class="nonterminal" x="153" y="179">table_name_opt_idx</text></a><rect height="32" rx="10" width="38" x="333" y="193"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="331" y="191"></rect>
<text class="terminal" x="341" y="211">AS</text><a xlink:href="/docs/stable/sql-grammar#table_alias_name" xlink:title="table_alias_name">
<rect height="32" width="134" x="391" y="193"></rect>
<rect class="nonterminal" height="32" width="134" x="389" y="191"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="401" y="211">table_alias_name</text></a><rect height="32" rx="10" width="26" x="93" y="303"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="91" y="301"></rect>
<text class="terminal" x="101" y="321">(</text><a xlink:href="/docs/stable/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="159" y="303"></rect>
<rect class="nonterminal" height="32" width="108" x="157" y="301"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="169" y="321">column_name</text></a><rect height="32" rx="10" width="24" x="159" y="259"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="157" y="257"></rect>
<text class="terminal" x="167" y="277">,</text>
<rect height="32" rx="10" width="26" x="307" y="303"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="305" y="301"></rect>
<text class="terminal" x="315" y="321">)</text><a xlink:href="/docs/stable/sql-grammar#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="373" y="303"></rect>
<rect class="nonterminal" height="32" width="94" x="371" y="301"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="383" y="321">select_stmt</text></a><rect height="32" rx="10" width="80" x="73" y="369"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="71" y="367"></rect>
<text class="terminal" x="81" y="387">DEFAULT</text>
<rect height="32" rx="10" width="72" x="173" y="369"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="171" y="367"></rect>
<text class="terminal" x="181" y="387">VALUES</text><a xlink:href="/docs/stable/sql-grammar#on_conflict" xlink:title="on_conflict">
<rect height="32" width="88" x="527" y="335"></rect>
<rect class="nonterminal" height="32" width="88" x="525" y="333"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="64" font-size="10" class="nonterminal" x="537" y="353">on_conflict</text></a><rect height="32" rx="10" width="100" x="339" y="479"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="337" y="477"></rect>
<text class="terminal" x="347" y="497">RETURNING</text><a xlink:href="/docs/stable/sql-grammar#target_elem" xlink:title="target_elem">
<rect height="32" width="98" x="499" y="479"></rect>
<rect class="nonterminal" height="32" width="98" x="497" y="477"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="10" class="nonterminal" x="509" y="497">target_elem</text></a><rect height="32" rx="10" width="24" x="499" y="435"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="497" y="433"></rect>
<text class="terminal" x="507" y="453">,</text>
<rect height="32" rx="10" width="86" x="479" y="523"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="477" y="521"></rect>
<text class="terminal" x="487" y="541">NOTHING</text>
<path class="line" d="m17 61 h2 m20 0 h10 m58 0 h10 m20 0 h10 m0 0 h108 m-138 0 h20 m118 0 h20 m-158 0 q10 0 10 10 m138 0 q0 -10 10 -10 m-148 10 v12 m138 0 v-12 m-138 12 q0 10 10 10 m118 0 q10 0 10 -10 m-128 10 h10 m98 0 h10 m40 -32 h10 m150 0 h10 m-190 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m170 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-170 0 h10 m24 0 h10 m0 0 h126 m-446 44 h20 m446 0 h20 m-486 0 q10 0 10 10 m466 0 q0 -10 10 -10 m-476 10 v46 m466 0 v-46 m-466 46 q0 10 10 10 m446 0 q10 0 10 -10 m-456 10 h10 m0 0 h436 m20 -66 h10 m70 0 h10 m0 0 h10 m56 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-564 114 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m150 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m38 0 h10 m0 0 h10 m134 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-536 142 l2 0 m2 0 l2 0 m2 0 l2 0 m42 0 h10 m26 0 h10 m20 0 h10 m108 0 h10 m-148 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m128 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-128 0 h10 m24 0 h10 m0 0 h84 m20 44 h10 m26 0 h10 m-280 0 h20 m260 0 h20 m-300 0 q10 0 10 10 m280 0 q0 -10 10 -10 m-290 10 v14 m280 0 v-14 m-280 14 q0 10 10 10 m260 0 q10 0 10 -10 m-270 10 h10 m0 0 h250 m20 -34 h10 m94 0 h10 m-434 0 h20 m414 0 h20 m-454 0 q10 0 10 10 m434 0 q0 -10 10 -10 m-444 10 v46 m434 0 v-46 m-434 46 q0 10 10 10 m414 0 q10 0 10 -10 m-424 10 h10 m80 0 h10 m0 0 h10 m72 0 h10 m0 0 h222 m40 -66 h10 m0 0 h98 m-128 0 h20 m108 0 h20 m-148 0 q10 0 10 10 m128 0 q0 -10 10 -10 m-138 10 v12 m128 0 v-12 m-128 12 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m88 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-360 176 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m100 0 h10 m40 0 h10 m98 0 h10 m-138 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m118 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-118 0 h10 m24 0 h10 m0 0 h74 m-158 44 h20 m158 0 h20 m-198 0 q10 0 10 10 m178 0 q0 -10 10 -10 m-188 10 v24 m178 0 v-24 m-178 24 q0 10 10 10 m158 0 q10 0 10 -10 m-168 10 h10 m86 0 h10 m0 0 h52 m-318 -44 h20 m318 0 h20 m-358 0 q10 0 10 10 m338 0 q0 -10 10 -10 m-348 10 v58 m338 0 v-58 m-338 58 q0 10 10 10 m318 0 q10 0 10 -10 m-328 10 h10 m0 0 h308 m23 -78 h-3"></path>
<polygon points="675 493 683 489 683 497"></polygon>
<polygon points="675 493 667 489 667 497"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
