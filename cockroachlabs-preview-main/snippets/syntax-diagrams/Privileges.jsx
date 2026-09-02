export const Privileges = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="321" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="44" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">ALL</text><a xlink:href="#opt_privileges_clause" xlink:title="opt_privileges_clause">
<rect height="32" width="158" x="115" y="3"></rect>
<rect class="nonterminal" height="32" width="158" x="113" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="125" y="21">opt_privileges_clause</text></a><a xlink:href="#privilege_list" xlink:title="privilege_list">
<rect height="32" width="100" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="100" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="76" font-size="10" class="nonterminal" x="61" y="65">privilege_list</text></a><path class="line" d="m17 17 h2 m20 0 h10 m44 0 h10 m0 0 h10 m158 0 h10 m-262 0 h20 m242 0 h20 m-282 0 q10 0 10 10 m262 0 q0 -10 10 -10 m-272 10 v24 m262 0 v-24 m-262 24 q0 10 10 10 m242 0 q10 0 10 -10 m-252 10 h10 m100 0 h10 m0 0 h122 m23 -44 h-3"></path>
<polygon points="311 17 319 13 319 21"></polygon>
<polygon points="311 17 303 13 303 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
