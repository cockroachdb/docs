export const ResumeAllJobsStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="351" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="76" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">RESUME</text>
<rect height="32" rx="10" width="44" x="127" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="125" y="1"></rect>
<text class="terminal" x="135" y="21">ALL</text><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="191" y="3"></rect>
<rect class="nonterminal" height="32" width="56" x="189" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="201" y="21">name</text></a><rect height="32" rx="10" width="56" x="267" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="265" y="1"></rect>
<text class="terminal" x="275" y="21">JOBS</text>
<path class="line" d="m17 17 h2 m0 0 h10 m76 0 h10 m0 0 h10 m44 0 h10 m0 0 h10 m56 0 h10 m0 0 h10 m56 0 h10 m3 0 h-3"></path>
<polygon points="341 17 349 13 349 21"></polygon>
<polygon points="341 17 333 13 333 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
