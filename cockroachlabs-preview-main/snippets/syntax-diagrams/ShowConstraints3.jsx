export const ShowConstraints3 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="631" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="110" x="135" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="133" y="1"></rect>
<text class="terminal" x="143" y="21">CONSTRAINT</text>
<rect height="32" rx="10" width="120" x="135" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="120" x="133" y="45"></rect>
<text class="terminal" x="143" y="65">CONSTRAINTS</text>
<rect height="32" rx="10" width="60" x="295" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="293" y="1"></rect>
<text class="terminal" x="303" y="21">FROM</text><a xlink:href="/docs/v24.1/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="375" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="373" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="385" y="21">table_name</text></a><a xlink:href="/docs/v24.1/sql-grammar#with_comment" xlink:title="with_comment">
<rect height="32" width="112" x="491" y="3"></rect>
<rect class="nonterminal" height="32" width="112" x="489" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="88" font-size="11" class="nonterminal" x="501" y="21">with_comment</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m20 0 h10 m110 0 h10 m0 0 h10 m-160 0 h20 m140 0 h20 m-180 0 q10 0 10 10 m160 0 q0 -10 10 -10 m-170 10 v24 m160 0 v-24 m-160 24 q0 10 10 10 m140 0 q10 0 10 -10 m-150 10 h10 m120 0 h10 m20 -44 h10 m60 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m112 0 h10 m3 0 h-3"></path>
<polygon points="621 17 629 13 629 21"></polygon>
<polygon points="621 17 613 13 613 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
