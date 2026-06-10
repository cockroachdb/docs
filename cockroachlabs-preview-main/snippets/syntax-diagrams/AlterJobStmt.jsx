export const AlterJobStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="523" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="62" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">ALTER</text>
<rect height="32" rx="10" width="46" x="113" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="111" y="1"></rect>
<text class="terminal" x="121" y="21">JOB</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="179" y="3"></rect>
<rect class="nonterminal" height="32" width="64" x="177" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="189" y="21">a_expr</text></a><rect height="32" rx="10" width="72" x="263" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="261" y="1"></rect>
<text class="terminal" x="271" y="21">OWNER</text>
<rect height="32" rx="10" width="38" x="355" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="353" y="1"></rect>
<text class="terminal" x="363" y="21">TO</text><a xlink:href="#role_spec" xlink:title="role_spec">
<rect height="32" width="82" x="413" y="3"></rect>
<rect class="nonterminal" height="32" width="82" x="411" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="423" y="21">role_spec</text></a><path class="line" d="m17 17 h2 m0 0 h10 m62 0 h10 m0 0 h10 m46 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m72 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m82 0 h10 m3 0 h-3"></path>
<polygon points="513 17 521 13 521 21"></polygon>
<polygon points="513 17 505 13 505 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
