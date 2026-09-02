export const ExtractList = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="357" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#extract_arg" xlink:title="extract_arg">
<rect height="32" width="94" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="94" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="61" y="21">extract_arg</text></a><rect height="32" rx="10" width="60" x="165" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="163" y="1"></rect>
<text class="terminal" x="173" y="21">FROM</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="245" y="3"></rect>
<rect class="nonterminal" height="32" width="64" x="243" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="255" y="21">a_expr</text></a><a xlink:href="#expr_list" xlink:title="expr_list">
<rect height="32" width="74" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="74" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="50" font-size="10" class="nonterminal" x="61" y="65">expr_list</text></a><path class="line" d="m17 17 h2 m20 0 h10 m94 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m64 0 h10 m-298 0 h20 m278 0 h20 m-318 0 q10 0 10 10 m298 0 q0 -10 10 -10 m-308 10 v24 m298 0 v-24 m-298 24 q0 10 10 10 m278 0 q10 0 10 -10 m-288 10 h10 m74 0 h10 m0 0 h184 m23 -44 h-3"></path>
<polygon points="347 17 355 13 355 21"></polygon>
<polygon points="347 17 339 13 339 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
