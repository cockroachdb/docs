export const AlterProcedure2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="267" width="695" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="62" x="31" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="29" y="45"></rect>
<text class="terminal" x="39" y="65">ALTER</text>
<rect height="32" rx="10" width="104" x="113" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="104" x="111" y="45"></rect>
<text class="terminal" x="121" y="65">PROCEDURE</text>
<rect height="32" width="90" x="237" y="47"></rect>
<rect class="nonterminal" height="32" width="90" x="235" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="11" class="nonterminal" x="247" y="65">proc_name</text><rect height="32" rx="10" width="26" x="367" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="365" y="45"></rect>
<text class="terminal" x="375" y="65">(</text><a xlink:href="/docs/v23.2/sql-grammar#routine_param" xlink:title="routine_param">
<rect height="32" width="114" x="453" y="47"></rect>
<rect class="nonterminal" height="32" width="114" x="451" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="90" font-size="11" class="nonterminal" x="463" y="65">routine_param</text></a><rect height="32" rx="10" width="24" x="453" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="451" y="1"></rect>
<text class="terminal" x="461" y="21">,</text>
<rect height="32" rx="10" width="26" x="627" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="625" y="45"></rect>
<text class="terminal" x="635" y="65">)</text>
<rect height="32" rx="10" width="76" x="369" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="367" y="143"></rect>
<text class="terminal" x="377" y="163">RENAME</text>
<rect height="32" rx="10" width="38" x="465" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="463" y="143"></rect>
<text class="terminal" x="473" y="163">TO</text>
<rect height="32" width="124" x="523" y="145"></rect>
<rect class="nonterminal" height="32" width="124" x="521" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="533" y="163">proc_new_name</text><rect height="32" rx="10" width="72" x="369" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="367" y="187"></rect>
<text class="terminal" x="377" y="207">OWNER</text>
<rect height="32" rx="10" width="38" x="461" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="459" y="187"></rect>
<text class="terminal" x="469" y="207">TO</text><a xlink:href="/docs/v23.2/sql-grammar#role_spec" xlink:title="role_spec">
<rect height="32" width="82" x="519" y="189"></rect>
<rect class="nonterminal" height="32" width="82" x="517" y="187"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="529" y="207">role_spec</text></a><rect height="32" rx="10" width="44" x="369" y="233"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="367" y="231"></rect>
<text class="terminal" x="377" y="251">SET</text>
<rect height="32" rx="10" width="76" x="433" y="233"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="431" y="231"></rect>
<text class="terminal" x="441" y="251">SCHEMA</text><a xlink:href="/docs/v23.2/sql-grammar#schema_name" xlink:title="schema_name">
<rect height="32" width="112" x="529" y="233"></rect>
<rect class="nonterminal" height="32" width="112" x="527" y="231"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="88" font-size="12" class="nonterminal" x="539" y="251">schema_name</text></a><path class="line" d="m17 61 h2 m0 0 h10 m62 0 h10 m0 0 h10 m104 0 h10 m0 0 h10 m90 0 h10 m20 0 h10 m26 0 h10 m40 0 h10 m114 0 h10 m-154 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m134 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-134 0 h10 m24 0 h10 m0 0 h90 m-174 44 h20 m174 0 h20 m-214 0 q10 0 10 10 m194 0 q0 -10 10 -10 m-204 10 v14 m194 0 v-14 m-194 14 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m0 0 h164 m20 -34 h10 m26 0 h10 m-326 0 h20 m306 0 h20 m-346 0 q10 0 10 10 m326 0 q0 -10 10 -10 m-336 10 v30 m326 0 v-30 m-326 30 q0 10 10 10 m306 0 q10 0 10 -10 m-316 10 h10 m0 0 h296 m22 -50 l2 0 m2 0 l2 0 m2 0 l2 0 m-368 98 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m76 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m124 0 h10 m-318 0 h20 m298 0 h20 m-338 0 q10 0 10 10 m318 0 q0 -10 10 -10 m-328 10 v24 m318 0 v-24 m-318 24 q0 10 10 10 m298 0 q10 0 10 -10 m-308 10 h10 m72 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m82 0 h10 m0 0 h46 m-308 -10 v20 m318 0 v-20 m-318 20 v24 m318 0 v-24 m-318 24 q0 10 10 10 m298 0 q10 0 10 -10 m-308 10 h10 m44 0 h10 m0 0 h10 m76 0 h10 m0 0 h10 m112 0 h10 m0 0 h6 m23 -88 h-3"></path>
<polygon points="685 159 693 155 693 163"></polygon>
<polygon points="685 159 677 155 677 163"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
