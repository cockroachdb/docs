export const TransactionStmt2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="169" width="205" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#begin_stmt" xlink:title="begin_stmt">
<rect height="32" width="92" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="92" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="61" y="21">begin_stmt</text></a><a xlink:href="#commit_stmt" xlink:title="commit_stmt">
<rect height="32" width="102" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="102" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="11" class="nonterminal" x="61" y="65">commit_stmt</text></a><a xlink:href="#rollback_stmt" xlink:title="rollback_stmt">
<rect height="32" width="106" x="51" y="91"></rect>
<rect class="nonterminal" height="32" width="106" x="49" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="61" y="109">rollback_stmt</text></a><a xlink:href="#abort_stmt" xlink:title="abort_stmt">
<rect height="32" width="90" x="51" y="135"></rect>
<rect class="nonterminal" height="32" width="90" x="49" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="10" class="nonterminal" x="61" y="153">abort_stmt</text></a><path class="line" d="m17 17 h2 m20 0 h10 m92 0 h10 m0 0 h14 m-146 0 h20 m126 0 h20 m-166 0 q10 0 10 10 m146 0 q0 -10 10 -10 m-156 10 v24 m146 0 v-24 m-146 24 q0 10 10 10 m126 0 q10 0 10 -10 m-136 10 h10 m102 0 h10 m0 0 h4 m-136 -10 v20 m146 0 v-20 m-146 20 v24 m146 0 v-24 m-146 24 q0 10 10 10 m126 0 q10 0 10 -10 m-136 10 h10 m106 0 h10 m-136 -10 v20 m146 0 v-20 m-146 20 v24 m146 0 v-24 m-146 24 q0 10 10 10 m126 0 q10 0 10 -10 m-136 10 h10 m90 0 h10 m0 0 h16 m23 -132 h-3"></path>
<polygon points="195 17 203 13 203 21"></polygon>
<polygon points="195 17 187 13 187 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
