export const ShowIndex = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="211" width="633" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SHOW</text>
<rect height="32" rx="10" width="64" x="135" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="133" y="1"></rect>
<text class="terminal" x="143" y="21">INDEX</text>
<rect height="32" rx="10" width="80" x="135" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="133" y="45"></rect>
<text class="terminal" x="143" y="65">INDEXES</text>
<rect height="32" rx="10" width="54" x="135" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="133" y="89"></rect>
<text class="terminal" x="143" y="109">KEYS</text>
<rect height="32" rx="10" width="60" x="255" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="253" y="1"></rect>
<text class="terminal" x="263" y="21">FROM</text><a xlink:href="/docs/stable/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="355" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="353" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="365" y="21">table_name</text></a><rect height="32" rx="10" width="92" x="355" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="353" y="45"></rect>
<text class="terminal" x="363" y="65">DATABASE</text><a xlink:href="/docs/stable/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="467" y="47"></rect>
<rect class="nonterminal" height="32" width="124" x="465" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="477" y="65">database_name</text></a><rect height="32" rx="10" width="58" x="419" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="417" y="175"></rect>
<text class="terminal" x="427" y="195">WITH</text>
<rect height="32" rx="10" width="88" x="497" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="495" y="175"></rect>
<text class="terminal" x="505" y="195">COMMENT</text>
<path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m20 0 h10 m64 0 h10 m0 0 h16 m-120 0 h20 m100 0 h20 m-140 0 q10 0 10 10 m120 0 q0 -10 10 -10 m-130 10 v24 m120 0 v-24 m-120 24 q0 10 10 10 m100 0 q10 0 10 -10 m-110 10 h10 m80 0 h10 m-110 -10 v20 m120 0 v-20 m-120 20 v24 m120 0 v-24 m-120 24 q0 10 10 10 m100 0 q10 0 10 -10 m-110 10 h10 m54 0 h10 m0 0 h26 m20 -88 h10 m60 0 h10 m20 0 h10 m96 0 h10 m0 0 h140 m-276 0 h20 m256 0 h20 m-296 0 q10 0 10 10 m276 0 q0 -10 10 -10 m-286 10 v24 m276 0 v-24 m-276 24 q0 10 10 10 m256 0 q10 0 10 -10 m-266 10 h10 m92 0 h10 m0 0 h10 m124 0 h10 m22 -44 l2 0 m2 0 l2 0 m2 0 l2 0 m-256 142 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h176 m-206 0 h20 m186 0 h20 m-226 0 q10 0 10 10 m206 0 q0 -10 10 -10 m-216 10 v12 m206 0 v-12 m-206 12 q0 10 10 10 m186 0 q10 0 10 -10 m-196 10 h10 m58 0 h10 m0 0 h10 m88 0 h10 m23 -32 h-3"></path>
<polygon points="623 159 631 155 631 163"></polygon>
<polygon points="623 159 615 155 615 163"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
