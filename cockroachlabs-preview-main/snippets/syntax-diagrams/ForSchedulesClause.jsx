export const ForSchedulesClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="381" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="48" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">FOR</text>
<rect height="32" rx="10" width="100" x="119" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="117" y="1"></rect>
<text class="terminal" x="127" y="21">SCHEDULES</text><a xlink:href="#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="239" y="3"></rect>
<rect class="nonterminal" height="32" width="94" x="237" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="249" y="21">select_stmt</text></a><rect height="32" rx="10" width="92" x="119" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="117" y="45"></rect>
<text class="terminal" x="127" y="65">SCHEDULE</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="231" y="47"></rect>
<rect class="nonterminal" height="32" width="64" x="229" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="241" y="65">a_expr</text></a><path class="line" d="m17 17 h2 m0 0 h10 m48 0 h10 m20 0 h10 m100 0 h10 m0 0 h10 m94 0 h10 m-254 0 h20 m234 0 h20 m-274 0 q10 0 10 10 m254 0 q0 -10 10 -10 m-264 10 v24 m254 0 v-24 m-254 24 q0 10 10 10 m234 0 q10 0 10 -10 m-244 10 h10 m92 0 h10 m0 0 h10 m64 0 h10 m0 0 h38 m23 -44 h-3"></path>
<polygon points="371 17 379 13 379 21"></polygon>
<polygon points="371 17 363 13 363 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
