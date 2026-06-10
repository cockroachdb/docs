export const UnreservedKeyword = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="431" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="76" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">SCONST</text>
<rect height="32" rx="10" width="94" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="94" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">LANGUAGE</text><a xlink:href="#non_reserved_word_or_sconst" xlink:title="non_reserved_word_or_sconst">
<rect height="32" width="218" x="165" y="47"></rect>
<rect class="nonterminal" height="32" width="218" x="163" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="194" font-size="11" class="nonterminal" x="175" y="65">non_reserved_word_or_sconst</text></a><path class="line" d="m17 17 h2 m20 0 h10 m76 0 h10 m0 0 h256 m-372 0 h20 m352 0 h20 m-392 0 q10 0 10 10 m372 0 q0 -10 10 -10 m-382 10 v24 m372 0 v-24 m-372 24 q0 10 10 10 m352 0 q10 0 10 -10 m-362 10 h10 m94 0 h10 m0 0 h10 m218 0 h10 m23 -44 h-3"></path>
<polygon points="421 17 429 13 429 21"></polygon>
<polygon points="421 17 413 13 413 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
