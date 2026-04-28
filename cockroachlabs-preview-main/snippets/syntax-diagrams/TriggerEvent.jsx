export const TriggerEvent = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="201" width="373" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="70" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">INSERT</text>
<rect height="32" rx="10" width="70" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">DELETE</text>
<rect height="32" rx="10" width="74" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">UPDATE</text>
<rect height="32" rx="10" width="38" x="165" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="163" y="121"></rect>
<text class="terminal" x="173" y="141">OF</text><a xlink:href="#name_list" xlink:title="name_list">
<rect height="32" width="82" x="223" y="123"></rect>
<rect class="nonterminal" height="32" width="82" x="221" y="121"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="233" y="141">name_list</text></a><rect height="32" rx="10" width="92" x="51" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="49" y="165"></rect>
<text class="terminal" x="59" y="185">TRUNCATE</text>
<path class="line" d="m17 17 h2 m20 0 h10 m70 0 h10 m0 0 h204 m-314 0 h20 m294 0 h20 m-334 0 q10 0 10 10 m314 0 q0 -10 10 -10 m-324 10 v24 m314 0 v-24 m-314 24 q0 10 10 10 m294 0 q10 0 10 -10 m-304 10 h10 m70 0 h10 m0 0 h204 m-304 -10 v20 m314 0 v-20 m-314 20 v24 m314 0 v-24 m-314 24 q0 10 10 10 m294 0 q10 0 10 -10 m-304 10 h10 m74 0 h10 m20 0 h10 m0 0 h150 m-180 0 h20 m160 0 h20 m-200 0 q10 0 10 10 m180 0 q0 -10 10 -10 m-190 10 v12 m180 0 v-12 m-180 12 q0 10 10 10 m160 0 q10 0 10 -10 m-170 10 h10 m38 0 h10 m0 0 h10 m82 0 h10 m-284 -42 v20 m314 0 v-20 m-314 20 v56 m314 0 v-56 m-314 56 q0 10 10 10 m294 0 q10 0 10 -10 m-304 10 h10 m92 0 h10 m0 0 h182 m23 -164 h-3"></path>
<polygon points="363 17 371 13 371 21"></polygon>
<polygon points="363 17 355 13 355 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
