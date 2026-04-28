export const PartitionByTable = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="475" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#partition_by" xlink:title="partition_by">
<rect height="32" width="96" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="61" y="21">partition_by</text></a><rect height="32" rx="10" width="98" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">PARTITION</text>
<rect height="32" rx="10" width="44" x="169" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="167" y="45"></rect>
<text class="terminal" x="177" y="65">ALL</text>
<rect height="32" rx="10" width="38" x="233" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="231" y="45"></rect>
<text class="terminal" x="241" y="65">BY</text><a xlink:href="#partition_by_inner" xlink:title="partition_by_inner">
<rect height="32" width="136" x="291" y="47"></rect>
<rect class="nonterminal" height="32" width="136" x="289" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="10" class="nonterminal" x="301" y="65">partition_by_inner</text></a><path class="line" d="m17 17 h2 m20 0 h10 m96 0 h10 m0 0 h280 m-416 0 h20 m396 0 h20 m-436 0 q10 0 10 10 m416 0 q0 -10 10 -10 m-426 10 v24 m416 0 v-24 m-416 24 q0 10 10 10 m396 0 q10 0 10 -10 m-406 10 h10 m98 0 h10 m0 0 h10 m44 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m136 0 h10 m23 -44 h-3"></path>
<polygon points="465 17 473 13 473 21"></polygon>
<polygon points="465 17 457 13 457 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
