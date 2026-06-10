export const LegacyTransactionStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="239" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#legacy_begin_stmt" xlink:title="legacy_begin_stmt">
<rect height="32" width="140" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="140" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="116" font-size="11" class="nonterminal" x="61" y="21">legacy_begin_stmt</text></a><a xlink:href="#legacy_end_stmt" xlink:title="legacy_end_stmt">
<rect height="32" width="128" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="128" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="104" font-size="11" class="nonterminal" x="61" y="65">legacy_end_stmt</text></a><path class="line" d="m17 17 h2 m20 0 h10 m140 0 h10 m-180 0 h20 m160 0 h20 m-200 0 q10 0 10 10 m180 0 q0 -10 10 -10 m-190 10 v24 m180 0 v-24 m-180 24 q0 10 10 10 m160 0 q10 0 10 -10 m-170 10 h10 m128 0 h10 m0 0 h12 m23 -44 h-3"></path>
<polygon points="229 17 237 13 237 21"></polygon>
<polygon points="229 17 221 13 221 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
