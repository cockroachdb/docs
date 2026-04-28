export const SconstOrPlaceholder = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="377" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="158" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="61" y="21">string_or_placeholder</text></a><rect height="32" rx="10" width="26" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">(</text><a xlink:href="#string_or_placeholder_list" xlink:title="string_or_placeholder_list">
<rect height="32" width="186" x="97" y="47"></rect>
<rect class="nonterminal" height="32" width="186" x="95" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="162" font-size="10" class="nonterminal" x="107" y="65">string_or_placeholder_list</text></a><rect height="32" rx="10" width="26" x="303" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="301" y="45"></rect>
<text class="terminal" x="311" y="65">)</text>
<path class="line" d="m17 17 h2 m20 0 h10 m158 0 h10 m0 0 h120 m-318 0 h20 m298 0 h20 m-338 0 q10 0 10 10 m318 0 q0 -10 10 -10 m-328 10 v24 m318 0 v-24 m-318 24 q0 10 10 10 m298 0 q10 0 10 -10 m-308 10 h10 m26 0 h10 m0 0 h10 m186 0 h10 m0 0 h10 m26 0 h10 m23 -44 h-3"></path>
<polygon points="367 17 375 13 375 21"></polygon>
<polygon points="367 17 359 13 359 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
