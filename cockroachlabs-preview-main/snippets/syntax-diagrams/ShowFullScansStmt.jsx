export const ShowFullScansStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="103" width="567" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="100" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">STATEMENT</text>
<rect height="32" rx="10" width="64" x="235" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="233" y="1"></rect>
<text class="terminal" x="243" y="21">HINTS</text>
<rect height="32" rx="10" width="48" x="319" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="317" y="1"></rect>
<text class="terminal" x="327" y="21">FOR</text><a xlink:href="#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="387" y="3"></rect>
<rect class="nonterminal" height="32" width="158" x="385" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="397" y="21">string_or_placeholder</text></a><a xlink:href="#opt_with_show_hints_options" xlink:title="opt_with_show_hints_options">
<rect height="32" width="210" x="329" y="69"></rect>
<rect class="nonterminal" height="32" width="210" x="327" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="186" font-size="11" class="nonterminal" x="339" y="87">opt_with_show_hints_options</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m0 0 h10 m100 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m158 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-260 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m210 0 h10 m3 0 h-3"></path>
<polygon points="557 83 565 79 565 87"></polygon>
<polygon points="557 83 549 79 549 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
