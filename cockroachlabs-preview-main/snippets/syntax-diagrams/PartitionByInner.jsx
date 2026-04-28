export const PartitionByInner = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="125" width="637" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="52" x="71" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="52" x="69" y="1"></rect>
<text class="terminal" x="79" y="21">LIST</text>
<rect height="32" rx="10" width="26" x="143" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="141" y="1"></rect>
<text class="terminal" x="151" y="21">(</text><a xlink:href="#name_list" xlink:title="name_list">
<rect height="32" width="82" x="189" y="3"></rect>
<rect class="nonterminal" height="32" width="82" x="187" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="199" y="21">name_list</text></a><rect height="32" rx="10" width="26" x="291" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="289" y="1"></rect>
<text class="terminal" x="299" y="21">)</text>
<rect height="32" rx="10" width="26" x="337" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="335" y="1"></rect>
<text class="terminal" x="345" y="21">(</text><a xlink:href="#list_partitions" xlink:title="list_partitions">
<rect height="32" width="106" x="383" y="3"></rect>
<rect class="nonterminal" height="32" width="106" x="381" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="393" y="21">list_partitions</text></a><rect height="32" rx="10" width="66" x="71" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="69" y="45"></rect>
<text class="terminal" x="79" y="65">RANGE</text>
<rect height="32" rx="10" width="26" x="157" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="155" y="45"></rect>
<text class="terminal" x="165" y="65">(</text><a xlink:href="#name_list" xlink:title="name_list">
<rect height="32" width="82" x="203" y="47"></rect>
<rect class="nonterminal" height="32" width="82" x="201" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="213" y="65">name_list</text></a><rect height="32" rx="10" width="26" x="305" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="303" y="45"></rect>
<text class="terminal" x="313" y="65">)</text>
<rect height="32" rx="10" width="26" x="351" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="349" y="45"></rect>
<text class="terminal" x="359" y="65">(</text><a xlink:href="#range_partitions" xlink:title="range_partitions">
<rect height="32" width="126" x="397" y="47"></rect>
<rect class="nonterminal" height="32" width="126" x="395" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="407" y="65">range_partitions</text></a><rect height="32" rx="10" width="26" x="563" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="561" y="1"></rect>
<text class="terminal" x="571" y="21">)</text>
<rect height="32" rx="10" width="86" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">NOTHING</text>
<path class="line" d="m17 17 h2 m40 0 h10 m52 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m106 0 h10 m0 0 h34 m-492 0 h20 m472 0 h20 m-512 0 q10 0 10 10 m492 0 q0 -10 10 -10 m-502 10 v24 m492 0 v-24 m-492 24 q0 10 10 10 m472 0 q10 0 10 -10 m-482 10 h10 m66 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m126 0 h10 m20 -44 h10 m26 0 h10 m-578 0 h20 m558 0 h20 m-598 0 q10 0 10 10 m578 0 q0 -10 10 -10 m-588 10 v68 m578 0 v-68 m-578 68 q0 10 10 10 m558 0 q10 0 10 -10 m-568 10 h10 m86 0 h10 m0 0 h452 m23 -88 h-3"></path>
<polygon points="627 17 635 13 635 21"></polygon>
<polygon points="627 17 619 13 619 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
