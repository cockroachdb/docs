export const ShowSchemas = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="69" width="557" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SHOW</text>
<rect height="32" rx="10" width="86" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">SCHEMAS</text>
<rect height="32" rx="10" width="60" x="241" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="239" y="33"></rect>
<text class="terminal" x="249" y="53">FROM</text><a xlink:href="/docs/stable/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="321" y="35"></rect>
<rect class="nonterminal" height="32" width="56" x="319" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="331" y="53">name</text></a><a xlink:href="/docs/stable/sql-grammar#with_comment" xlink:title="with_comment">
<rect height="32" width="112" x="417" y="3"></rect>
<rect class="nonterminal" height="32" width="112" x="415" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="88" font-size="11" class="nonterminal" x="427" y="21">with_comment</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m0 0 h10 m86 0 h10 m20 0 h10 m0 0 h146 m-176 0 h20 m156 0 h20 m-196 0 q10 0 10 10 m176 0 q0 -10 10 -10 m-186 10 v12 m176 0 v-12 m-176 12 q0 10 10 10 m156 0 q10 0 10 -10 m-166 10 h10 m60 0 h10 m0 0 h10 m56 0 h10 m20 -32 h10 m112 0 h10 m3 0 h-3"></path>
<polygon points="547 17 555 13 555 21"></polygon>
<polygon points="547 17 539 13 539 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
