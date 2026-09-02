export const ScrubTableStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="103" width="615" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="62" x="263" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="261" y="1"></rect>
<text class="terminal" x="271" y="21">TABLE</text><a xlink:href="#table_name" xlink:title="table_name">
<rect height="32" width="96" x="345" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="343" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="355" y="21">table_name</text></a><a xlink:href="#opt_as_of_clause" xlink:title="opt_as_of_clause">
<rect height="32" width="132" x="461" y="3"></rect>
<rect class="nonterminal" height="32" width="132" x="459" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="108" font-size="10" class="nonterminal" x="471" y="21">opt_as_of_clause</text></a><a xlink:href="#opt_scrub_options_clause" xlink:title="opt_scrub_options_clause">
<rect height="32" width="186" x="401" y="69"></rect>
<rect class="nonterminal" height="32" width="186" x="399" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="162" font-size="10" class="nonterminal" x="411" y="87">opt_scrub_options_clause</text></a><path class="line" d="m17 17 h2 m0 0 h10 m126 0 h10 m0 0 h10 m66 0 h10 m0 0 h10 m62 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m132 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-236 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m186 0 h10 m3 0 h-3"></path>
<polygon points="605 83 613 79 613 87"></polygon>
<polygon points="605 83 597 79 597 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
