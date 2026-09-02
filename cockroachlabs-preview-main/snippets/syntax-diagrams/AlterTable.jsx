export const AlterTable = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="949" width="1751" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="62" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">ALTER</text>
<rect height="32" rx="10" width="62" x="133" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="131" y="45"></rect>
<text class="terminal" x="141" y="65">TABLE</text>
<rect height="32" width="96" x="235" y="47"></rect>
<rect class="nonterminal" height="32" width="96" x="233" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="245" y="65">table_name</text><a xlink:href="/docs/stable/sql-grammar#alter_table_cmd" xlink:title="alter_table_cmd">
<rect height="32" width="124" x="391" y="47"></rect>
<rect class="nonterminal" height="32" width="124" x="389" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="401" y="65">alter_table_cmd</text></a><rect height="32" rx="10" width="24" x="391" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="389" y="1"></rect>
<text class="terminal" x="399" y="21">,</text>
<rect height="32" rx="10" width="60" x="371" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="369" y="89"></rect>
<text class="terminal" x="379" y="109">SPLIT</text>
<rect height="32" rx="10" width="38" x="451" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="449" y="89"></rect>
<text class="terminal" x="459" y="109">AT</text><a xlink:href="/docs/stable/sql-grammar#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="509" y="91"></rect>
<rect class="nonterminal" height="32" width="94" x="507" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="519" y="109">select_stmt</text></a><rect height="32" rx="10" width="58" x="643" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="641" y="121"></rect>
<text class="terminal" x="651" y="141">WITH</text>
<rect height="32" rx="10" width="106" x="721" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="106" x="719" y="121"></rect>
<text class="terminal" x="729" y="141">EXPIRATION</text><a xlink:href="/docs/stable/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="847" y="123"></rect>
<rect class="nonterminal" height="32" width="64" x="845" y="121"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="857" y="141">a_expr</text></a><rect height="32" rx="10" width="80" x="371" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="369" y="165"></rect>
<text class="terminal" x="379" y="185">UNSPLIT</text>
<rect height="32" rx="10" width="38" x="491" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="489" y="165"></rect>
<text class="terminal" x="499" y="185">AT</text><a xlink:href="/docs/stable/sql-grammar#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="549" y="167"></rect>
<rect class="nonterminal" height="32" width="94" x="547" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="559" y="185">select_stmt</text></a><rect height="32" rx="10" width="44" x="491" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="489" y="209"></rect>
<text class="terminal" x="499" y="229">ALL</text>
<rect height="32" rx="10" width="102" x="371" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="102" x="369" y="275"></rect>
<text class="terminal" x="379" y="295">CONFIGURE</text>
<rect height="32" rx="10" width="58" x="493" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="491" y="275"></rect>
<text class="terminal" x="501" y="295">ZONE</text>
<rect height="32" rx="10" width="64" x="591" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="589" y="275"></rect>
<text class="terminal" x="599" y="295">USING</text>
<rect height="32" width="70" x="675" y="277"></rect>
<rect class="nonterminal" height="32" width="70" x="673" y="275"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="46" font-size="10" class="nonterminal" x="685" y="295">variable</text><rect height="32" rx="10" width="30" x="765" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="763" y="275"></rect>
<text class="terminal" x="773" y="295">=</text>
<rect height="32" rx="10" width="58" x="835" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="833" y="275"></rect>
<text class="terminal" x="843" y="295">COPY</text>
<rect height="32" rx="10" width="60" x="913" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="911" y="275"></rect>
<text class="terminal" x="921" y="295">FROM</text>
<rect height="32" rx="10" width="74" x="993" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="991" y="275"></rect>
<text class="terminal" x="1001" y="295">PARENT</text>
<rect height="32" width="54" x="835" y="321"></rect>
<rect class="nonterminal" height="32" width="54" x="833" y="319"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="845" y="339">value</text><rect height="32" rx="10" width="24" x="1147" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="1145" y="275"></rect>
<text class="terminal" x="1155" y="295">,</text>
<rect height="32" width="70" x="1191" y="277"></rect>
<rect class="nonterminal" height="32" width="70" x="1189" y="275"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="46" font-size="10" class="nonterminal" x="1201" y="295">variable</text><rect height="32" rx="10" width="30" x="1281" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="1279" y="275"></rect>
<text class="terminal" x="1289" y="295">=</text>
<rect height="32" width="54" x="1351" y="277"></rect>
<rect class="nonterminal" height="32" width="54" x="1349" y="275"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="1361" y="295">value</text><rect height="32" rx="10" width="58" x="1351" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="1349" y="319"></rect>
<text class="terminal" x="1359" y="339">COPY</text>
<rect height="32" rx="10" width="60" x="1429" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="1427" y="319"></rect>
<text class="terminal" x="1437" y="339">FROM</text>
<rect height="32" rx="10" width="74" x="1509" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="1507" y="319"></rect>
<text class="terminal" x="1517" y="339">PARENT</text>
<rect height="32" rx="10" width="82" x="591" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="589" y="385"></rect>
<text class="terminal" x="599" y="405">DISCARD</text>
<rect height="32" rx="10" width="76" x="371" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="369" y="429"></rect>
<text class="terminal" x="379" y="449">RENAME</text>
<rect height="32" rx="10" width="38" x="467" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="465" y="429"></rect>
<text class="terminal" x="475" y="449">TO</text>
<rect height="32" width="130" x="525" y="431"></rect>
<rect class="nonterminal" height="32" width="130" x="523" y="429"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="12" class="nonterminal" x="535" y="449">table_new_name</text><rect height="32" rx="10" width="44" x="371" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="369" y="473"></rect>
<text class="terminal" x="379" y="493">SET</text>
<rect height="32" rx="10" width="76" x="455" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="453" y="473"></rect>
<text class="terminal" x="463" y="493">SCHEMA</text><a xlink:href="/docs/stable/sql-grammar#schema_name" xlink:title="schema_name">
<rect height="32" width="112" x="551" y="475"></rect>
<rect class="nonterminal" height="32" width="112" x="549" y="473"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="88" font-size="12" class="nonterminal" x="561" y="493">schema_name</text></a><a xlink:href="/docs/stable/sql-grammar#locality" xlink:title="locality">
<rect height="32" width="64" x="455" y="519"></rect>
<rect class="nonterminal" height="32" width="64" x="453" y="517"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="465" y="537">locality</text></a><rect height="32" rx="10" width="72" x="371" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="369" y="561"></rect>
<text class="terminal" x="379" y="581">OWNER</text>
<rect height="32" rx="10" width="38" x="463" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="461" y="561"></rect>
<text class="terminal" x="471" y="581">TO</text><a xlink:href="/docs/stable/sql-grammar#role_spec" xlink:title="role_spec">
<rect height="32" width="82" x="521" y="563"></rect>
<rect class="nonterminal" height="32" width="82" x="519" y="561"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="531" y="581">role_spec</text></a><rect height="32" rx="10" width="34" x="235" y="651"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="233" y="649"></rect>
<text class="terminal" x="243" y="669">IF</text>
<rect height="32" rx="10" width="70" x="289" y="651"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="287" y="649"></rect>
<text class="terminal" x="297" y="669">EXISTS</text>
<rect height="32" width="96" x="379" y="651"></rect>
<rect class="nonterminal" height="32" width="96" x="377" y="649"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="389" y="669">table_name</text><a xlink:href="/docs/stable/sql-grammar#alter_table_cmd" xlink:title="alter_table_cmd">
<rect height="32" width="124" x="535" y="651"></rect>
<rect class="nonterminal" height="32" width="124" x="533" y="649"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="545" y="669">alter_table_cmd</text></a><rect height="32" rx="10" width="24" x="535" y="607"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="533" y="605"></rect>
<text class="terminal" x="543" y="625">,</text>
<rect height="32" rx="10" width="76" x="515" y="695"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="513" y="693"></rect>
<text class="terminal" x="523" y="713">RENAME</text>
<rect height="32" rx="10" width="38" x="611" y="695"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="609" y="693"></rect>
<text class="terminal" x="619" y="713">TO</text>
<rect height="32" width="130" x="669" y="695"></rect>
<rect class="nonterminal" height="32" width="130" x="667" y="693"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="12" class="nonterminal" x="679" y="713">table_new_name</text><rect height="32" rx="10" width="44" x="515" y="739"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="513" y="737"></rect>
<text class="terminal" x="523" y="757">SET</text>
<rect height="32" rx="10" width="76" x="599" y="739"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="597" y="737"></rect>
<text class="terminal" x="607" y="757">SCHEMA</text><a xlink:href="/docs/stable/sql-grammar#schema_name" xlink:title="schema_name">
<rect height="32" width="112" x="695" y="739"></rect>
<rect class="nonterminal" height="32" width="112" x="693" y="737"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="88" font-size="12" class="nonterminal" x="705" y="757">schema_name</text></a><a xlink:href="/docs/stable/sql-grammar#locality" xlink:title="locality">
<rect height="32" width="64" x="599" y="783"></rect>
<rect class="nonterminal" height="32" width="64" x="597" y="781"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="609" y="801">locality</text></a><rect height="32" rx="10" width="72" x="515" y="827"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="513" y="825"></rect>
<text class="terminal" x="523" y="845">OWNER</text>
<rect height="32" rx="10" width="38" x="607" y="827"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="605" y="825"></rect>
<text class="terminal" x="615" y="845">TO</text><a xlink:href="/docs/stable/sql-grammar#role_spec" xlink:title="role_spec">
<rect height="32" width="82" x="665" y="827"></rect>
<rect class="nonterminal" height="32" width="82" x="663" y="825"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="675" y="845">role_spec</text></a><a xlink:href="/docs/stable/sql-grammar#alter_scatter_stmt" xlink:title="alter_scatter_stmt">
<rect height="32" width="138" x="51" y="871"></rect>
<rect class="nonterminal" height="32" width="138" x="49" y="869"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="10" class="nonterminal" x="61" y="889">alter_scatter_stmt</text></a><a xlink:href="/docs/stable/sql-grammar#alter_table_logged_stmt" xlink:title="alter_table_logged_stmt">
<rect height="32" width="178" x="51" y="915"></rect>
<rect class="nonterminal" height="32" width="178" x="49" y="913"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="154" font-size="10" class="nonterminal" x="61" y="933">alter_table_logged_stmt</text></a><path class="line" d="m17 61 h2 m20 0 h10 m62 0 h10 m0 0 h10 m62 0 h10 m20 0 h10 m96 0 h10 m40 0 h10 m124 0 h10 m-164 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m144 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-144 0 h10 m24 0 h10 m0 0 h100 m20 44 h1128 m-1332 0 h20 m1312 0 h20 m-1352 0 q10 0 10 10 m1332 0 q0 -10 10 -10 m-1342 10 v24 m1332 0 v-24 m-1332 24 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m60 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m94 0 h10 m20 0 h10 m0 0 h278 m-308 0 h20 m288 0 h20 m-328 0 q10 0 10 10 m308 0 q0 -10 10 -10 m-318 10 v12 m308 0 v-12 m-308 12 q0 10 10 10 m288 0 q10 0 10 -10 m-298 10 h10 m58 0 h10 m0 0 h10 m106 0 h10 m0 0 h10 m64 0 h10 m20 -32 h732 m-1322 -10 v20 m1332 0 v-20 m-1332 20 v56 m1332 0 v-56 m-1332 56 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m80 0 h10 m20 0 h10 m38 0 h10 m0 0 h10 m94 0 h10 m-192 0 h20 m172 0 h20 m-212 0 q10 0 10 10 m192 0 q0 -10 10 -10 m-202 10 v24 m192 0 v-24 m-192 24 q0 10 10 10 m172 0 q10 0 10 -10 m-182 10 h10 m44 0 h10 m0 0 h108 m20 -44 h1000 m-1322 -10 v20 m1332 0 v-20 m-1332 20 v90 m1332 0 v-90 m-1332 90 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m102 0 h10 m0 0 h10 m58 0 h10 m20 0 h10 m64 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m30 0 h10 m20 0 h10 m58 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m74 0 h10 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m54 0 h10 m0 0 h178 m60 -44 h10 m24 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m30 0 h10 m20 0 h10 m54 0 h10 m0 0 h178 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m58 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m74 0 h10 m-476 -44 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m476 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-476 0 h10 m0 0 h466 m-516 32 h20 m516 0 h20 m-556 0 q10 0 10 10 m536 0 q0 -10 10 -10 m-546 10 v58 m536 0 v-58 m-536 58 q0 10 10 10 m516 0 q10 0 10 -10 m-526 10 h10 m0 0 h506 m-1072 -78 h20 m1072 0 h20 m-1112 0 q10 0 10 10 m1092 0 q0 -10 10 -10 m-1102 10 v90 m1092 0 v-90 m-1092 90 q0 10 10 10 m1072 0 q10 0 10 -10 m-1082 10 h10 m82 0 h10 m0 0 h970 m-1302 -120 v20 m1332 0 v-20 m-1332 20 v134 m1332 0 v-134 m-1332 134 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m76 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m130 0 h10 m0 0 h1008 m-1322 -10 v20 m1332 0 v-20 m-1332 20 v24 m1332 0 v-24 m-1332 24 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m44 0 h10 m20 0 h10 m76 0 h10 m0 0 h10 m112 0 h10 m-248 0 h20 m228 0 h20 m-268 0 q10 0 10 10 m248 0 q0 -10 10 -10 m-258 10 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m64 0 h10 m0 0 h144 m20 -44 h980 m-1322 -10 v20 m1332 0 v-20 m-1332 20 v68 m1332 0 v-68 m-1332 68 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m72 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m82 0 h10 m0 0 h1060 m-1468 -516 h20 m1468 0 h20 m-1508 0 q10 0 10 10 m1488 0 q0 -10 10 -10 m-1498 10 v584 m1488 0 v-584 m-1488 584 q0 10 10 10 m1468 0 q10 0 10 -10 m-1478 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m96 0 h10 m40 0 h10 m124 0 h10 m-164 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m144 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-144 0 h10 m24 0 h10 m0 0 h100 m20 44 h148 m-352 0 h20 m332 0 h20 m-372 0 q10 0 10 10 m352 0 q0 -10 10 -10 m-362 10 v24 m352 0 v-24 m-352 24 q0 10 10 10 m332 0 q10 0 10 -10 m-342 10 h10 m76 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m130 0 h10 m0 0 h28 m-342 -10 v20 m352 0 v-20 m-352 20 v24 m352 0 v-24 m-352 24 q0 10 10 10 m332 0 q10 0 10 -10 m-342 10 h10 m44 0 h10 m20 0 h10 m76 0 h10 m0 0 h10 m112 0 h10 m-248 0 h20 m228 0 h20 m-268 0 q10 0 10 10 m248 0 q0 -10 10 -10 m-258 10 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m64 0 h10 m0 0 h144 m-322 -54 v20 m352 0 v-20 m-352 20 v68 m352 0 v-68 m-352 68 q0 10 10 10 m332 0 q10 0 10 -10 m-342 10 h10 m72 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m82 0 h10 m0 0 h80 m20 -176 h836 m-1672 -604 h20 m1672 0 h20 m-1712 0 q10 0 10 10 m1692 0 q0 -10 10 -10 m-1702 10 v804 m1692 0 v-804 m-1692 804 q0 10 10 10 m1672 0 q10 0 10 -10 m-1682 10 h10 m138 0 h10 m0 0 h1514 m-1682 -10 v20 m1692 0 v-20 m-1692 20 v24 m1692 0 v-24 m-1692 24 q0 10 10 10 m1672 0 q10 0 10 -10 m-1682 10 h10 m178 0 h10 m0 0 h1474 m23 -868 h-3"></path>
<polygon points="1741 61 1749 57 1749 65"></polygon>
<polygon points="1741 61 1733 57 1733 65"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
