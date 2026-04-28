export const SourceReplicationOptions = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="405" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="106" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="106" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">EXPIRATION</text>
<rect height="32" rx="10" width="86" x="157" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="155" y="1"></rect>
<text class="terminal" x="165" y="21">WINDOW</text>
<rect height="32" rx="10" width="30" x="263" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="261" y="1"></rect>
<text class="terminal" x="271" y="21">=</text><a xlink:href="#d_expr" xlink:title="d_expr">
<rect height="32" width="64" x="313" y="3"></rect>
<rect class="nonterminal" height="32" width="64" x="311" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="323" y="21">d_expr</text></a><path class="line" d="m17 17 h2 m0 0 h10 m106 0 h10 m0 0 h10 m86 0 h10 m0 0 h10 m30 0 h10 m0 0 h10 m64 0 h10 m3 0 h-3"></path>
<polygon points="395 17 403 13 403 21"></polygon>
<polygon points="395 17 387 13 387 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
