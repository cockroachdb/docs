export const DropExternalConnectionStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="537" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">DROP</text>
<rect height="32" rx="10" width="90" x="109" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="107" y="1"></rect>
<text class="terminal" x="117" y="21">EXTERNAL</text>
<rect height="32" rx="10" width="112" x="219" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="112" x="217" y="1"></rect>
<text class="terminal" x="227" y="21">CONNECTION</text><a xlink:href="#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="351" y="3"></rect>
<rect class="nonterminal" height="32" width="158" x="349" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="361" y="21">string_or_placeholder</text></a><path class="line" d="m17 17 h2 m0 0 h10 m58 0 h10 m0 0 h10 m90 0 h10 m0 0 h10 m112 0 h10 m0 0 h10 m158 0 h10 m3 0 h-3"></path>
<polygon points="527 17 535 13 535 21"></polygon>
<polygon points="527 17 519 13 519 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
