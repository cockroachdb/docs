export const Restore2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="595" width="559" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="82" x="31" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="29" y="45"></rect>
<text class="terminal" x="39" y="65">RESTORE</text>
<rect height="32" rx="10" width="62" x="153" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="151" y="45"></rect>
<text class="terminal" x="161" y="65">TABLE</text><a xlink:href="/docs/v23.2/sql-grammar#table_pattern" xlink:title="table_pattern">
<rect height="32" width="106" x="255" y="47"></rect>
<rect class="nonterminal" height="32" width="106" x="253" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="265" y="65">table_pattern</text></a><rect height="32" rx="10" width="24" x="255" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="253" y="1"></rect>
<text class="terminal" x="263" y="21">,</text>
<rect height="32" rx="10" width="92" x="153" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="151" y="133"></rect>
<text class="terminal" x="161" y="153">DATABASE</text><a xlink:href="/docs/v23.2/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="285" y="135"></rect>
<rect class="nonterminal" height="32" width="124" x="283" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="295" y="153">database_name</text></a><rect height="32" rx="10" width="24" x="285" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="283" y="89"></rect>
<text class="terminal" x="293" y="109">,</text>
<rect height="32" rx="10" width="74" x="153" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="151" y="177"></rect>
<text class="terminal" x="161" y="197">SYSTEM</text>
<rect height="32" rx="10" width="64" x="247" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="245" y="177"></rect>
<text class="terminal" x="255" y="197">USERS</text>
<rect height="32" rx="10" width="60" x="469" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="467" y="45"></rect>
<text class="terminal" x="477" y="65">FROM</text>
<rect height="32" width="98" x="65" y="293"></rect>
<rect class="nonterminal" height="32" width="98" x="63" y="291"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="10" class="nonterminal" x="75" y="311">subdirectory</text><rect height="32" rx="10" width="70" x="65" y="337"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="63" y="335"></rect>
<text class="terminal" x="73" y="355">LATEST</text>
<rect height="32" rx="10" width="36" x="203" y="293"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="201" y="291"></rect>
<text class="terminal" x="211" y="311">IN</text>
<rect height="32" width="102" x="299" y="261"></rect>
<rect class="nonterminal" height="32" width="102" x="297" y="259"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="10" class="nonterminal" x="309" y="279">collectionURI</text><rect height="32" rx="10" width="26" x="299" y="349"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="297" y="347"></rect>
<text class="terminal" x="307" y="367">(</text>
<rect height="32" width="86" x="365" y="349"></rect>
<rect class="nonterminal" height="32" width="86" x="363" y="347"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="375" y="367">localityURI</text><rect height="32" rx="10" width="24" x="365" y="305"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="363" y="303"></rect>
<text class="terminal" x="373" y="323">,</text>
<rect height="32" rx="10" width="26" x="491" y="349"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="489" y="347"></rect>
<text class="terminal" x="499" y="367">)</text>
<rect height="32" rx="10" width="38" x="95" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="93" y="429"></rect>
<text class="terminal" x="103" y="449">AS</text>
<rect height="32" rx="10" width="38" x="153" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="151" y="429"></rect>
<text class="terminal" x="161" y="449">OF</text>
<rect height="32" rx="10" width="74" x="211" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="209" y="429"></rect>
<text class="terminal" x="219" y="449">SYSTEM</text>
<rect height="32" rx="10" width="54" x="305" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="303" y="429"></rect>
<text class="terminal" x="313" y="449">TIME</text>
<rect height="32" width="88" x="379" y="431"></rect>
<rect class="nonterminal" height="32" width="88" x="377" y="429"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="64" font-size="11" class="nonterminal" x="389" y="449">timestamp</text><rect height="32" rx="10" width="58" x="49" y="517"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="47" y="515"></rect>
<text class="terminal" x="57" y="535">WITH</text><a xlink:href="/docs/v23.2/sql-grammar#restore_options_list" xlink:title="restore_options_list">
<rect height="32" width="148" x="147" y="517"></rect>
<rect class="nonterminal" height="32" width="148" x="145" y="515"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="157" y="535">restore_options_list</text></a><rect height="32" rx="10" width="84" x="147" y="561"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="145" y="559"></rect>
<text class="terminal" x="155" y="579">OPTIONS</text>
<rect height="32" rx="10" width="26" x="251" y="561"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="249" y="559"></rect>
<text class="terminal" x="259" y="579">(</text><a xlink:href="/docs/v23.2/sql-grammar#restore_options_list" xlink:title="restore_options_list">
<rect height="32" width="148" x="297" y="561"></rect>
<rect class="nonterminal" height="32" width="148" x="295" y="559"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="307" y="579">restore_options_list</text></a><rect height="32" rx="10" width="26" x="465" y="561"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="463" y="559"></rect>
<text class="terminal" x="473" y="579">)</text>
<path class="line" d="m17 61 h2 m0 0 h10 m82 0 h10 m20 0 h10 m62 0 h10 m20 0 h10 m106 0 h10 m-146 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m126 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-126 0 h10 m24 0 h10 m0 0 h82 m20 44 h48 m-316 0 h20 m296 0 h20 m-336 0 q10 0 10 10 m316 0 q0 -10 10 -10 m-326 10 v68 m316 0 v-68 m-316 68 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m92 0 h10 m20 0 h10 m124 0 h10 m-164 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m144 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-144 0 h10 m24 0 h10 m0 0 h100 m-286 34 v20 m316 0 v-20 m-316 20 v24 m316 0 v-24 m-316 24 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m74 0 h10 m0 0 h10 m64 0 h10 m0 0 h118 m-306 -10 v20 m316 0 v-20 m-316 20 v14 m316 0 v-14 m-316 14 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m0 0 h286 m20 -166 h10 m60 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-548 214 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h204 m-234 0 h20 m214 0 h20 m-254 0 q10 0 10 10 m234 0 q0 -10 10 -10 m-244 10 v12 m234 0 v-12 m-234 12 q0 10 10 10 m214 0 q10 0 10 -10 m-204 10 h10 m98 0 h10 m-138 0 h20 m118 0 h20 m-158 0 q10 0 10 10 m138 0 q0 -10 10 -10 m-148 10 v24 m138 0 v-24 m-138 24 q0 10 10 10 m118 0 q10 0 10 -10 m-128 10 h10 m70 0 h10 m0 0 h28 m20 -44 h10 m36 0 h10 m40 -32 h10 m102 0 h10 m0 0 h116 m-258 0 h20 m238 0 h20 m-278 0 q10 0 10 10 m258 0 q0 -10 10 -10 m-268 10 v68 m258 0 v-68 m-258 68 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m26 0 h10 m20 0 h10 m86 0 h10 m-126 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m106 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-106 0 h10 m24 0 h10 m0 0 h62 m20 44 h10 m26 0 h10 m22 -88 l2 0 m2 0 l2 0 m2 0 l2 0 m-506 138 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h382 m-412 0 h20 m392 0 h20 m-432 0 q10 0 10 10 m412 0 q0 -10 10 -10 m-422 10 v12 m412 0 v-12 m-412 12 q0 10 10 10 m392 0 q10 0 10 -10 m-402 10 h10 m38 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m54 0 h10 m0 0 h10 m88 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-502 86 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h472 m-502 0 h20 m482 0 h20 m-522 0 q10 0 10 10 m502 0 q0 -10 10 -10 m-512 10 v12 m502 0 v-12 m-502 12 q0 10 10 10 m482 0 q10 0 10 -10 m-492 10 h10 m58 0 h10 m20 0 h10 m148 0 h10 m0 0 h196 m-384 0 h20 m364 0 h20 m-404 0 q10 0 10 10 m384 0 q0 -10 10 -10 m-394 10 v24 m384 0 v-24 m-384 24 q0 10 10 10 m364 0 q10 0 10 -10 m-374 10 h10 m84 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m148 0 h10 m0 0 h10 m26 0 h10 m43 -76 h-3"></path>
<polygon points="549 499 557 495 557 503"></polygon>
<polygon points="549 499 541 495 541 503"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
