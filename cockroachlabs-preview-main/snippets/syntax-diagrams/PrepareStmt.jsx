export const PrepareStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="653" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="82" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">PREPARE</text><a xlink:href="#table_alias_name" xlink:title="table_alias_name">
<rect height="32" width="134" x="133" y="3"></rect>
<rect class="nonterminal" height="32" width="134" x="131" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="143" y="21">table_alias_name</text></a><a xlink:href="#prep_type_clause" xlink:title="prep_type_clause">
<rect height="32" width="134" x="287" y="3"></rect>
<rect class="nonterminal" height="32" width="134" x="285" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="297" y="21">prep_type_clause</text></a><rect height="32" rx="10" width="38" x="441" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="439" y="1"></rect>
<text class="terminal" x="449" y="21">AS</text><a xlink:href="#preparable_stmt" xlink:title="preparable_stmt">
<rect height="32" width="126" x="499" y="3"></rect>
<rect class="nonterminal" height="32" width="126" x="497" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="509" y="21">preparable_stmt</text></a><path class="line" d="m17 17 h2 m0 0 h10 m82 0 h10 m0 0 h10 m134 0 h10 m0 0 h10 m134 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m126 0 h10 m3 0 h-3"></path>
<polygon points="643 17 651 13 651 21"></polygon>
<polygon points="643 17 635 13 635 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
