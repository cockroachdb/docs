export const Storing = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="371" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="98" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">PARTITION</text>
<rect height="32" rx="10" width="38" x="149" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="147" y="1"></rect>
<text class="terminal" x="157" y="21">BY</text><a xlink:href="#partition_by_inner" xlink:title="partition_by_inner">
<rect height="32" width="136" x="207" y="3"></rect>
<rect class="nonterminal" height="32" width="136" x="205" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="10" class="nonterminal" x="217" y="21">partition_by_inner</text></a><path class="line" d="m17 17 h2 m0 0 h10 m98 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m136 0 h10 m3 0 h-3"></path>
<polygon points="361 17 369 13 369 21"></polygon>
<polygon points="361 17 353 13 353 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
