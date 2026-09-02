export const AlterRole2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="657" width="1199" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="62" x="33" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="31" y="1"></rect>
<text class="terminal" x="41" y="21">ALTER</text>
<rect height="32" rx="10" width="56" x="135" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="133" y="1"></rect>
<text class="terminal" x="143" y="21">ROLE</text>
<rect height="32" rx="10" width="56" x="135" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="133" y="45"></rect>
<text class="terminal" x="143" y="65">USER</text>
<rect height="32" rx="10" width="34" x="65" y="161"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="63" y="159"></rect>
<text class="terminal" x="73" y="179">IF</text>
<rect height="32" rx="10" width="70" x="119" y="161"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="117" y="159"></rect>
<text class="terminal" x="127" y="179">EXISTS</text><a xlink:href="/docs/v23.2/sql-grammar#role_spec" xlink:title="role_spec">
<rect height="32" width="82" x="229" y="129"></rect>
<rect class="nonterminal" height="32" width="82" x="227" y="127"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="239" y="147">role_spec</text></a><rect height="32" rx="10" width="58" x="371" y="161"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="369" y="159"></rect>
<text class="terminal" x="379" y="179">WITH</text><a xlink:href="/docs/v23.2/sql-grammar#role_option" xlink:title="role_option">
<rect height="32" width="92" x="489" y="129"></rect>
<rect class="nonterminal" height="32" width="92" x="487" y="127"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="499" y="147">role_option</text></a><rect height="32" rx="10" width="36" x="371" y="281"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="369" y="279"></rect>
<text class="terminal" x="379" y="299">IN</text>
<rect height="32" rx="10" width="92" x="427" y="281"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="425" y="279"></rect>
<text class="terminal" x="435" y="299">DATABASE</text><a xlink:href="/docs/v23.2/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="539" y="281"></rect>
<rect class="nonterminal" height="32" width="124" x="537" y="279"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="549" y="299">database_name</text></a><rect height="32" rx="10" width="44" x="723" y="249"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="721" y="247"></rect>
<text class="terminal" x="731" y="267">SET</text><a xlink:href="/docs/v23.2/sql-grammar#var_name" xlink:title="var_name">
<rect height="32" width="84" x="787" y="249"></rect>
<rect class="nonterminal" height="32" width="84" x="785" y="247"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="797" y="267">var_name</text></a><rect height="32" rx="10" width="30" x="911" y="249"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="909" y="247"></rect>
<text class="terminal" x="919" y="267">=</text>
<rect height="32" rx="10" width="38" x="911" y="293"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="909" y="291"></rect>
<text class="terminal" x="919" y="311">TO</text><a xlink:href="/docs/v23.2/sql-grammar#var_value" xlink:title="var_value">
<rect height="32" width="82" x="1009" y="249"></rect>
<rect class="nonterminal" height="32" width="82" x="1007" y="247"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="1019" y="267">var_value</text></a><rect height="32" rx="10" width="24" x="1009" y="205"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="1007" y="203"></rect>
<text class="terminal" x="1017" y="223">,</text>
<rect height="32" rx="10" width="96" x="723" y="337"></rect>
<rect class="terminal" height="32" rx="10" width="96" x="721" y="335"></rect>
<text class="terminal" x="731" y="355">RESET_ALL</text>
<rect height="32" rx="10" width="44" x="839" y="337"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="837" y="335"></rect>
<text class="terminal" x="847" y="355">ALL</text>
<rect height="32" rx="10" width="62" x="723" y="381"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="721" y="379"></rect>
<text class="terminal" x="731" y="399">RESET</text><a xlink:href="/docs/v23.2/sql-grammar#session_var" xlink:title="session_var">
<rect height="32" width="96" x="805" y="381"></rect>
<rect class="nonterminal" height="32" width="96" x="803" y="379"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="815" y="399">session_var</text></a><rect height="32" rx="10" width="44" x="45" y="491"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="43" y="489"></rect>
<text class="terminal" x="53" y="509">ALL</text>
<rect height="32" rx="10" width="36" x="129" y="523"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="127" y="521"></rect>
<text class="terminal" x="137" y="541">IN</text>
<rect height="32" rx="10" width="92" x="185" y="523"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="183" y="521"></rect>
<text class="terminal" x="193" y="541">DATABASE</text><a xlink:href="/docs/v23.2/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="297" y="523"></rect>
<rect class="nonterminal" height="32" width="124" x="295" y="521"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="307" y="541">database_name</text></a><rect height="32" rx="10" width="44" x="481" y="491"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="479" y="489"></rect>
<text class="terminal" x="489" y="509">SET</text><a xlink:href="/docs/v23.2/sql-grammar#var_name" xlink:title="var_name">
<rect height="32" width="84" x="545" y="491"></rect>
<rect class="nonterminal" height="32" width="84" x="543" y="489"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="555" y="509">var_name</text></a><rect height="32" rx="10" width="30" x="669" y="491"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="667" y="489"></rect>
<text class="terminal" x="677" y="509">=</text>
<rect height="32" rx="10" width="38" x="669" y="535"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="667" y="533"></rect>
<text class="terminal" x="677" y="553">TO</text><a xlink:href="/docs/v23.2/sql-grammar#var_value" xlink:title="var_value">
<rect height="32" width="82" x="767" y="491"></rect>
<rect class="nonterminal" height="32" width="82" x="765" y="489"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="777" y="509">var_value</text></a><rect height="32" rx="10" width="24" x="767" y="447"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="765" y="445"></rect>
<text class="terminal" x="775" y="465">,</text>
<rect height="32" rx="10" width="96" x="481" y="579"></rect>
<rect class="terminal" height="32" rx="10" width="96" x="479" y="577"></rect>
<text class="terminal" x="489" y="597">RESET_ALL</text>
<rect height="32" rx="10" width="44" x="597" y="579"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="595" y="577"></rect>
<text class="terminal" x="605" y="597">ALL</text>
<rect height="32" rx="10" width="62" x="481" y="623"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="479" y="621"></rect>
<text class="terminal" x="489" y="641">RESET</text><a xlink:href="/docs/v23.2/sql-grammar#session_var" xlink:title="session_var">
<rect height="32" width="96" x="563" y="623"></rect>
<rect class="nonterminal" height="32" width="96" x="561" y="621"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="573" y="641">session_var</text></a><path class="line" d="m19 17 h2 m0 0 h10 m62 0 h10 m20 0 h10 m56 0 h10 m-96 0 h20 m76 0 h20 m-116 0 q10 0 10 10 m96 0 q0 -10 10 -10 m-106 10 v24 m96 0 v-24 m-96 24 q0 10 10 10 m76 0 q10 0 10 -10 m-86 10 h10 m56 0 h10 m22 -44 l2 0 m2 0 l2 0 m2 0 l2 0 m-230 126 l2 0 m2 0 l2 0 m2 0 l2 0 m42 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m82 0 h10 m40 0 h10 m0 0 h68 m-98 0 h20 m78 0 h20 m-118 0 q10 0 10 10 m98 0 q0 -10 10 -10 m-108 10 v12 m98 0 v-12 m-98 12 q0 10 10 10 m78 0 q10 0 10 -10 m-88 10 h10 m58 0 h10 m40 -32 h10 m92 0 h10 m-132 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m112 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-112 0 h10 m0 0 h102 m20 32 h530 m-820 0 h20 m800 0 h20 m-840 0 q10 0 10 10 m820 0 q0 -10 10 -10 m-830 10 v100 m820 0 v-100 m-820 100 q0 10 10 10 m800 0 q10 0 10 -10 m-790 10 h10 m0 0 h302 m-332 0 h20 m312 0 h20 m-352 0 q10 0 10 10 m332 0 q0 -10 10 -10 m-342 10 v12 m332 0 v-12 m-332 12 q0 10 10 10 m312 0 q10 0 10 -10 m-322 10 h10 m36 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m124 0 h10 m40 -32 h10 m44 0 h10 m0 0 h10 m84 0 h10 m20 0 h10 m30 0 h10 m0 0 h8 m-78 0 h20 m58 0 h20 m-98 0 q10 0 10 10 m78 0 q0 -10 10 -10 m-88 10 v24 m78 0 v-24 m-78 24 q0 10 10 10 m58 0 q10 0 10 -10 m-68 10 h10 m38 0 h10 m40 -44 h10 m82 0 h10 m-122 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m102 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-102 0 h10 m24 0 h10 m0 0 h58 m-408 44 h20 m408 0 h20 m-448 0 q10 0 10 10 m428 0 q0 -10 10 -10 m-438 10 v68 m428 0 v-68 m-428 68 q0 10 10 10 m408 0 q10 0 10 -10 m-418 10 h10 m96 0 h10 m0 0 h10 m44 0 h10 m0 0 h228 m-418 -10 v20 m428 0 v-20 m-428 20 v24 m428 0 v-24 m-428 24 q0 10 10 10 m408 0 q10 0 10 -10 m-418 10 h10 m62 0 h10 m0 0 h10 m96 0 h10 m0 0 h210 m-790 -142 v20 m820 0 v-20 m-820 20 v146 m820 0 v-146 m-820 146 q0 10 10 10 m800 0 q10 0 10 -10 m-810 10 h10 m0 0 h790 m-1126 -286 h20 m1126 0 h20 m-1166 0 q10 0 10 10 m1146 0 q0 -10 10 -10 m-1156 10 v342 m1146 0 v-342 m-1146 342 q0 10 10 10 m1126 0 q10 0 10 -10 m-1136 10 h10 m44 0 h10 m20 0 h10 m0 0 h302 m-332 0 h20 m312 0 h20 m-352 0 q10 0 10 10 m332 0 q0 -10 10 -10 m-342 10 v12 m332 0 v-12 m-332 12 q0 10 10 10 m312 0 q10 0 10 -10 m-322 10 h10 m36 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m124 0 h10 m40 -32 h10 m44 0 h10 m0 0 h10 m84 0 h10 m20 0 h10 m30 0 h10 m0 0 h8 m-78 0 h20 m58 0 h20 m-98 0 q10 0 10 10 m78 0 q0 -10 10 -10 m-88 10 v24 m78 0 v-24 m-78 24 q0 10 10 10 m58 0 q10 0 10 -10 m-68 10 h10 m38 0 h10 m40 -44 h10 m82 0 h10 m-122 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m102 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-102 0 h10 m24 0 h10 m0 0 h58 m-408 44 h20 m408 0 h20 m-448 0 q10 0 10 10 m428 0 q0 -10 10 -10 m-438 10 v68 m428 0 v-68 m-428 68 q0 10 10 10 m408 0 q10 0 10 -10 m-418 10 h10 m96 0 h10 m0 0 h10 m44 0 h10 m0 0 h228 m-418 -10 v20 m428 0 v-20 m-428 20 v24 m428 0 v-24 m-428 24 q0 10 10 10 m408 0 q10 0 10 -10 m-418 10 h10 m62 0 h10 m0 0 h10 m96 0 h10 m0 0 h210 m20 -132 h262 m23 -362 h-3"></path>
<polygon points="1189 143 1197 139 1197 147"></polygon>
<polygon points="1189 143 1181 139 1181 147"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
