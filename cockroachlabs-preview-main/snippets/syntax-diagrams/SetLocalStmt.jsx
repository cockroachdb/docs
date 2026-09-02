export const SetLocalStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="279" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="44" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SET</text>
<rect height="32" rx="10" width="64" x="95" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="93" y="1"></rect>
<text class="terminal" x="103" y="21">LOCAL</text><a xlink:href="#set_rest" xlink:title="set_rest">
<rect height="32" width="72" x="179" y="3"></rect>
<rect class="nonterminal" height="32" width="72" x="177" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="48" font-size="10" class="nonterminal" x="189" y="21">set_rest</text></a><path class="line" d="m17 17 h2 m0 0 h10 m44 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m72 0 h10 m3 0 h-3"></path>
<polygon points="269 17 277 13 277 21"></polygon>
<polygon points="269 17 261 13 261 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
