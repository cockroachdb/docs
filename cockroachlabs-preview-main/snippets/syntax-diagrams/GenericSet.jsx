export const GenericSet = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="327" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#var_name" xlink:title="var_name">
<rect height="32" width="84" x="31" y="3"></rect>
<rect class="nonterminal" height="32" width="84" x="29" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="41" y="21">var_name</text></a><a xlink:href="#to_or_eq" xlink:title="to_or_eq">
<rect height="32" width="78" x="135" y="3"></rect>
<rect class="nonterminal" height="32" width="78" x="133" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="54" font-size="10" class="nonterminal" x="145" y="21">to_or_eq</text></a><a xlink:href="#var_list" xlink:title="var_list">
<rect height="32" width="66" x="233" y="3"></rect>
<rect class="nonterminal" height="32" width="66" x="231" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="42" font-size="10" class="nonterminal" x="243" y="21">var_list</text></a><path class="line" d="m17 17 h2 m0 0 h10 m84 0 h10 m0 0 h10 m78 0 h10 m0 0 h10 m66 0 h10 m3 0 h-3"></path>
<polygon points="317 17 325 13 325 21"></polygon>
<polygon points="317 17 309 13 309 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
