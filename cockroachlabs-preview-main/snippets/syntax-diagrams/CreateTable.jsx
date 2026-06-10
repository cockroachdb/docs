export const CreateTable = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="413" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="31" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="29" y="45"></rect>
<text class="terminal" x="39" y="65">WITH</text>
<rect height="32" rx="10" width="26" x="109" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="107" y="45"></rect>
<text class="terminal" x="117" y="65">(</text><a xlink:href="/docs/stable/sql-grammar#storage_parameter" xlink:title="storage_parameter">
<rect height="32" width="144" x="175" y="47"></rect>
<rect class="nonterminal" height="32" width="144" x="173" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="120" font-size="11" class="nonterminal" x="185" y="65">storage_parameter</text></a><rect height="32" rx="10" width="24" x="175" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="173" y="1"></rect>
<text class="terminal" x="183" y="21">,</text>
<rect height="32" rx="10" width="26" x="359" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="357" y="45"></rect>
<text class="terminal" x="367" y="65">)</text>
<path class="line" d="m17 61 h2 m0 0 h10 m58 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m144 0 h10 m-184 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m164 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-164 0 h10 m24 0 h10 m0 0 h120 m20 44 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="403 61 411 57 411 65"></polygon>
<polygon points="403 61 395 57 395 65"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
