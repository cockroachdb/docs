export const RoutineBodyStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="331" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#stmt_without_legacy_transaction" xlink:title="stmt_without_legacy_transaction">
<rect height="32" width="232" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="232" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="208" font-size="10" class="nonterminal" x="61" y="21">stmt_without_legacy_transaction</text></a><a xlink:href="#routine_return_stmt" xlink:title="routine_return_stmt">
<rect height="32" width="148" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="148" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="61" y="65">routine_return_stmt</text></a><path class="line" d="m17 17 h2 m20 0 h10 m232 0 h10 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m148 0 h10 m0 0 h84 m23 -44 h-3"></path>
<polygon points="321 17 329 13 329 21"></polygon>
<polygon points="321 17 313 13 313 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
