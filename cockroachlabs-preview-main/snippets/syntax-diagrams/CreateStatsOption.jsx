export const CreateStatsOption = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="125" width="275" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#as_of_clause" xlink:title="as_of_clause">
<rect height="32" width="104" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="104" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="10" class="nonterminal" x="61" y="21">as_of_clause</text></a><rect height="32" rx="10" width="64" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">USING</text>
<rect height="32" rx="10" width="92" x="135" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="133" y="45"></rect>
<text class="terminal" x="143" y="65">EXTREMES</text><a xlink:href="#where_clause" xlink:title="where_clause">
<rect height="32" width="106" x="51" y="91"></rect>
<rect class="nonterminal" height="32" width="106" x="49" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="11" class="nonterminal" x="61" y="109">where_clause</text></a><path class="line" d="m17 17 h2 m20 0 h10 m104 0 h10 m0 0 h72 m-216 0 h20 m196 0 h20 m-236 0 q10 0 10 10 m216 0 q0 -10 10 -10 m-226 10 v24 m216 0 v-24 m-216 24 q0 10 10 10 m196 0 q10 0 10 -10 m-206 10 h10 m64 0 h10 m0 0 h10 m92 0 h10 m-206 -10 v20 m216 0 v-20 m-216 20 v24 m216 0 v-24 m-216 24 q0 10 10 10 m196 0 q10 0 10 -10 m-206 10 h10 m106 0 h10 m0 0 h70 m23 -88 h-3"></path>
<polygon points="265 17 273 13 273 21"></polygon>
<polygon points="265 17 257 13 257 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
