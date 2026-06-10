export const ScrubDatabaseStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="679" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="126" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="126" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">EXPERIMENTAL</text>
<rect height="32" rx="10" width="66" x="177" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="175" y="1"></rect>
<text class="terminal" x="185" y="21">SCRUB</text>
<rect height="32" rx="10" width="92" x="263" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="261" y="1"></rect>
<text class="terminal" x="271" y="21">DATABASE</text><a xlink:href="#database_name" xlink:title="database_name">
<rect height="32" width="124" x="375" y="3"></rect>
<rect class="nonterminal" height="32" width="124" x="373" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="385" y="21">database_name</text></a><a xlink:href="#opt_as_of_clause" xlink:title="opt_as_of_clause">
<rect height="32" width="132" x="519" y="3"></rect>
<rect class="nonterminal" height="32" width="132" x="517" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="108" font-size="10" class="nonterminal" x="529" y="21">opt_as_of_clause</text></a><path class="line" d="m17 17 h2 m0 0 h10 m126 0 h10 m0 0 h10 m66 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m124 0 h10 m0 0 h10 m132 0 h10 m3 0 h-3"></path>
<polygon points="669 17 677 13 677 21"></polygon>
<polygon points="669 17 661 13 661 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
