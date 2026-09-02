export const BackupTargets = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="301" width="443" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="82" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">identifier</text><a xlink:href="#col_name_keyword" xlink:title="col_name_keyword">
<rect height="32" width="142" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="142" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="61" y="65">col_name_keyword</text></a><a xlink:href="#unreserved_keyword" xlink:title="unreserved_keyword">
<rect height="32" width="152" x="51" y="91"></rect>
<rect class="nonterminal" height="32" width="152" x="49" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="128" font-size="11" class="nonterminal" x="61" y="109">unreserved_keyword</text></a><a xlink:href="#complex_table_pattern" xlink:title="complex_table_pattern">
<rect height="32" width="168" x="51" y="135"></rect>
<rect class="nonterminal" height="32" width="168" x="49" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="144" font-size="11" class="nonterminal" x="61" y="153">complex_table_pattern</text></a><a xlink:href="#table_pattern" xlink:title="table_pattern">
<rect height="32" width="106" x="71" y="179"></rect>
<rect class="nonterminal" height="32" width="106" x="69" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="81" y="197">table_pattern</text></a><rect height="32" rx="10" width="24" x="197" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="195" y="177"></rect>
<text class="terminal" x="205" y="197">,</text>
<rect height="32" rx="10" width="62" x="71" y="223"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="69" y="221"></rect>
<text class="terminal" x="79" y="241">TABLE</text><a xlink:href="#table_pattern_list" xlink:title="table_pattern_list">
<rect height="32" width="134" x="261" y="179"></rect>
<rect class="nonterminal" height="32" width="134" x="259" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="10" class="nonterminal" x="271" y="197">table_pattern_list</text></a><rect height="32" rx="10" width="92" x="51" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="49" y="265"></rect>
<text class="terminal" x="59" y="285">DATABASE</text><a xlink:href="#name_list" xlink:title="name_list">
<rect height="32" width="82" x="163" y="267"></rect>
<rect class="nonterminal" height="32" width="82" x="161" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="173" y="285">name_list</text></a><path class="line" d="m17 17 h2 m20 0 h10 m82 0 h10 m0 0 h262 m-384 0 h20 m364 0 h20 m-404 0 q10 0 10 10 m384 0 q0 -10 10 -10 m-394 10 v24 m384 0 v-24 m-384 24 q0 10 10 10 m364 0 q10 0 10 -10 m-374 10 h10 m142 0 h10 m0 0 h202 m-374 -10 v20 m384 0 v-20 m-384 20 v24 m384 0 v-24 m-384 24 q0 10 10 10 m364 0 q10 0 10 -10 m-374 10 h10 m152 0 h10 m0 0 h192 m-374 -10 v20 m384 0 v-20 m-384 20 v24 m384 0 v-24 m-384 24 q0 10 10 10 m364 0 q10 0 10 -10 m-374 10 h10 m168 0 h10 m0 0 h176 m-374 -10 v20 m384 0 v-20 m-384 20 v24 m384 0 v-24 m-384 24 q0 10 10 10 m364 0 q10 0 10 -10 m-354 10 h10 m106 0 h10 m0 0 h10 m24 0 h10 m-190 0 h20 m170 0 h20 m-210 0 q10 0 10 10 m190 0 q0 -10 10 -10 m-200 10 v24 m190 0 v-24 m-190 24 q0 10 10 10 m170 0 q10 0 10 -10 m-180 10 h10 m62 0 h10 m0 0 h88 m20 -44 h10 m134 0 h10 m-374 -10 v20 m384 0 v-20 m-384 20 v68 m384 0 v-68 m-384 68 q0 10 10 10 m364 0 q10 0 10 -10 m-374 10 h10 m92 0 h10 m0 0 h10 m82 0 h10 m0 0 h150 m23 -264 h-3"></path>
<polygon points="433 17 441 13 441 21"></polygon>
<polygon points="433 17 425 13 425 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
