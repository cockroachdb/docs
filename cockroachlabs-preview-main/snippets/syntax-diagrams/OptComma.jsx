export const OptComma = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="241" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="74" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">ICONST</text><a xlink:href="#only_signed_iconst" xlink:title="only_signed_iconst">
<rect height="32" width="142" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="142" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="10" class="nonterminal" x="61" y="65">only_signed_iconst</text></a><path class="line" d="m17 17 h2 m20 0 h10 m74 0 h10 m0 0 h68 m-182 0 h20 m162 0 h20 m-202 0 q10 0 10 10 m182 0 q0 -10 10 -10 m-192 10 v24 m182 0 v-24 m-182 24 q0 10 10 10 m162 0 q10 0 10 -10 m-172 10 h10 m142 0 h10 m23 -44 h-3"></path>
<polygon points="231 17 239 13 239 21"></polygon>
<polygon points="231 17 223 13 223 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
