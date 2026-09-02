export const ValuesClause = () => {
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
<polygon points="9 61 1 57 1 65"></polygon>
<polygon points="17 61 9 57 9 65"></polygon>
<rect height="32" rx="10" width="72" x="31" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="29" y="45"></rect>
<text class="terminal" x="39" y="65">VALUES</text>
<rect height="32" rx="10" width="26" x="143" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="141" y="45"></rect>
<text class="terminal" x="151" y="65">(</text><a xlink:href="#expr_list" xlink:title="expr_list">
<rect height="32" width="74" x="189" y="47"></rect>
<rect class="nonterminal" height="32" width="74" x="187" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="50" font-size="10" class="nonterminal" x="199" y="65">expr_list</text></a><rect height="32" rx="10" width="26" x="283" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="281" y="45"></rect>
<text class="terminal" x="291" y="65">)</text>
<rect height="32" rx="10" width="24" x="143" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="141" y="1"></rect>
<text class="terminal" x="151" y="21">,</text>
<path class="line" d="m17 61 h2 m0 0 h10 m72 0 h10 m20 0 h10 m26 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m26 0 h10 m-206 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m186 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-186 0 h10 m24 0 h10 m0 0 h142 m23 44 h-3"></path>
<polygon points="347 61 355 57 355 65"></polygon>
<polygon points="347 61 339 57 339 65"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
