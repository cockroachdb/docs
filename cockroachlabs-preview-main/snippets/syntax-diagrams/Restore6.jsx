export const Restore6 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="457" width="749" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="161" y="65">TABLE</text><a xlink:href="/docs/v25.4/sql-grammar#table_pattern" xlink:title="table_pattern">
<rect height="32" width="106" x="255" y="47"></rect>
<rect class="nonterminal" height="32" width="106" x="253" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="265" y="65">table_pattern</text></a><rect height="32" rx="10" width="24" x="255" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="253" y="1"></rect>
<text class="terminal" x="263" y="21">,</text>
<rect height="32" rx="10" width="92" x="153" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="151" y="133"></rect>
<text class="terminal" x="161" y="153">DATABASE</text><a xlink:href="/docs/v25.4/sql-grammar#database_name" xlink:title="database_name">
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
<text class="terminal" x="477" y="65">FROM</text><a xlink:href="/docs/v25.4/sql-grammar#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="549" y="47"></rect>
<rect class="nonterminal" height="32" width="158" x="547" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="559" y="65">string_or_placeholder</text></a><rect height="32" rx="10" width="36" x="25" y="261"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="23" y="259"></rect>
<text class="terminal" x="33" y="279">IN</text><a xlink:href="/docs/v25.4/sql-grammar#string_or_placeholder_opt_list" xlink:title="string_or_placeholder_opt_list">
<rect height="32" width="214" x="81" y="261"></rect>
<rect class="nonterminal" height="32" width="214" x="79" y="259"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="190" font-size="10" class="nonterminal" x="91" y="279">string_or_placeholder_opt_list</text></a><rect height="32" rx="10" width="38" x="335" y="293"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="333" y="291"></rect>
<text class="terminal" x="343" y="311">AS</text>
<rect height="32" rx="10" width="38" x="393" y="293"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="391" y="291"></rect>
<text class="terminal" x="401" y="311">OF</text>
<rect height="32" rx="10" width="74" x="451" y="293"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="449" y="291"></rect>
<text class="terminal" x="459" y="311">SYSTEM</text>
<rect height="32" rx="10" width="54" x="545" y="293"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="543" y="291"></rect>
<text class="terminal" x="553" y="311">TIME</text>
<rect height="32" width="88" x="619" y="293"></rect>
<rect class="nonterminal" height="32" width="88" x="617" y="291"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="64" font-size="11" class="nonterminal" x="629" y="311">timestamp</text><rect height="32" rx="10" width="58" x="239" y="379"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="237" y="377"></rect>
<text class="terminal" x="247" y="397">WITH</text><a xlink:href="/docs/v25.4/sql-grammar#restore_options_list" xlink:title="restore_options_list">
<rect height="32" width="148" x="337" y="379"></rect>
<rect class="nonterminal" height="32" width="148" x="335" y="377"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="347" y="397">restore_options_list</text></a><rect height="32" rx="10" width="84" x="337" y="423"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="335" y="421"></rect>
<text class="terminal" x="345" y="441">OPTIONS</text>
<rect height="32" rx="10" width="26" x="441" y="423"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="439" y="421"></rect>
<text class="terminal" x="449" y="441">(</text><a xlink:href="/docs/v25.4/sql-grammar#restore_options_list" xlink:title="restore_options_list">
<rect height="32" width="148" x="487" y="423"></rect>
<rect class="nonterminal" height="32" width="148" x="485" y="421"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="497" y="441">restore_options_list</text></a><rect height="32" rx="10" width="26" x="655" y="423"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="653" y="421"></rect>
<text class="terminal" x="663" y="441">)</text>
<path class="line" d="m17 61 h2 m0 0 h10 m82 0 h10 m20 0 h10 m62 0 h10 m20 0 h10 m106 0 h10 m-146 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m126 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-126 0 h10 m24 0 h10 m0 0 h82 m20 44 h48 m-316 0 h20 m296 0 h20 m-336 0 q10 0 10 10 m316 0 q0 -10 10 -10 m-326 10 v68 m316 0 v-68 m-316 68 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m92 0 h10 m20 0 h10 m124 0 h10 m-164 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m144 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-144 0 h10 m24 0 h10 m0 0 h100 m-286 34 v20 m316 0 v-20 m-316 20 v24 m316 0 v-24 m-316 24 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m74 0 h10 m0 0 h10 m64 0 h10 m0 0 h118 m-306 -10 v20 m316 0 v-20 m-316 20 v14 m316 0 v-14 m-316 14 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m0 0 h286 m20 -166 h10 m60 0 h10 m0 0 h10 m158 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-726 214 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m36 0 h10 m0 0 h10 m214 0 h10 m20 0 h10 m0 0 h382 m-412 0 h20 m392 0 h20 m-432 0 q10 0 10 10 m412 0 q0 -10 10 -10 m-422 10 v12 m412 0 v-12 m-412 12 q0 10 10 10 m392 0 q10 0 10 -10 m-402 10 h10 m38 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m54 0 h10 m0 0 h10 m88 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-552 86 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h472 m-502 0 h20 m482 0 h20 m-522 0 q10 0 10 10 m502 0 q0 -10 10 -10 m-512 10 v12 m502 0 v-12 m-502 12 q0 10 10 10 m482 0 q10 0 10 -10 m-492 10 h10 m58 0 h10 m20 0 h10 m148 0 h10 m0 0 h196 m-384 0 h20 m364 0 h20 m-404 0 q10 0 10 10 m384 0 q0 -10 10 -10 m-394 10 v24 m384 0 v-24 m-384 24 q0 10 10 10 m364 0 q10 0 10 -10 m-374 10 h10 m84 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m148 0 h10 m0 0 h10 m26 0 h10 m43 -76 h-3"></path>
<polygon points="739 361 747 357 747 365"></polygon>
<polygon points="739 361 731 357 731 365"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
