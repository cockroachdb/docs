export const CheckExternalConnectionStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="103" width="537" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">CHECK</text>
<rect height="32" rx="10" width="90" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">EXTERNAL</text>
<rect height="32" rx="10" width="112" x="225" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="112" x="223" y="1"></rect>
<text class="terminal" x="233" y="21">CONNECTION</text><a xlink:href="#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="357" y="3"></rect>
<rect class="nonterminal" height="32" width="158" x="355" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="367" y="21">string_or_placeholder</text></a><a xlink:href="#opt_with_check_external_connection_options_list" xlink:title="opt_with_check_external_connection_options_list">
<rect height="32" width="338" x="171" y="69"></rect>
<rect class="nonterminal" height="32" width="338" x="169" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="314" font-size="10" class="nonterminal" x="181" y="87">opt_with_check_external_connection_options_list</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m0 0 h10 m90 0 h10 m0 0 h10 m112 0 h10 m0 0 h10 m158 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-388 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m338 0 h10 m3 0 h-3"></path>
<polygon points="527 83 535 79 535 87"></polygon>
<polygon points="527 83 519 79 519 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
