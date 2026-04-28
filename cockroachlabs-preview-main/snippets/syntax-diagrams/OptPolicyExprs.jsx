export const OptPolicyExprs = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="165" width="757" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="9 5 1 1 1 9"></polygon>
<polygon points="17 5 9 1 9 9"></polygon>
<rect height="32" rx="10" width="64" x="71" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="69" y="21"></rect>
<text class="terminal" x="79" y="41">USING</text>
<rect height="32" rx="10" width="26" x="175" y="55"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="173" y="53"></rect>
<text class="terminal" x="183" y="73">(</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="221" y="55"></rect>
<rect class="nonterminal" height="32" width="64" x="219" y="53"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="231" y="73">a_expr</text></a><rect height="32" rx="10" width="26" x="305" y="55"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="303" y="53"></rect>
<text class="terminal" x="313" y="73">)</text>
<rect height="32" rx="10" width="58" x="351" y="55"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="349" y="53"></rect>
<text class="terminal" x="359" y="73">WITH</text>
<rect height="32" rx="10" width="64" x="429" y="55"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="427" y="53"></rect>
<text class="terminal" x="437" y="73">CHECK</text>
<rect height="32" rx="10" width="58" x="71" y="99"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="69" y="97"></rect>
<text class="terminal" x="79" y="117">WITH</text>
<rect height="32" rx="10" width="64" x="149" y="99"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="147" y="97"></rect>
<text class="terminal" x="157" y="117">CHECK</text>
<rect height="32" rx="10" width="26" x="253" y="131"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="251" y="129"></rect>
<text class="terminal" x="261" y="149">(</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="299" y="131"></rect>
<rect class="nonterminal" height="32" width="64" x="297" y="129"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="309" y="149">a_expr</text></a><rect height="32" rx="10" width="26" x="383" y="131"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="381" y="129"></rect>
<text class="terminal" x="391" y="149">)</text>
<rect height="32" rx="10" width="64" x="429" y="131"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="427" y="129"></rect>
<text class="terminal" x="437" y="149">USING</text>
<rect height="32" rx="10" width="26" x="553" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="551" y="21"></rect>
<text class="terminal" x="561" y="41">(</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="599" y="23"></rect>
<rect class="nonterminal" height="32" width="64" x="597" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="609" y="41">a_expr</text></a><rect height="32" rx="10" width="26" x="683" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="681" y="21"></rect>
<text class="terminal" x="691" y="41">)</text>
<path class="line" d="m17 5 h2 m20 0 h10 m0 0 h668 m-698 0 h20 m678 0 h20 m-718 0 q10 0 10 10 m698 0 q0 -10 10 -10 m-708 10 v12 m698 0 v-12 m-698 12 q0 10 10 10 m678 0 q10 0 10 -10 m-668 10 h10 m64 0 h10 m20 0 h10 m0 0 h328 m-358 0 h20 m338 0 h20 m-378 0 q10 0 10 10 m358 0 q0 -10 10 -10 m-368 10 v12 m358 0 v-12 m-358 12 q0 10 10 10 m338 0 q10 0 10 -10 m-348 10 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m58 0 h10 m0 0 h10 m64 0 h10 m-462 -32 h20 m462 0 h20 m-502 0 q10 0 10 10 m482 0 q0 -10 10 -10 m-492 10 v56 m482 0 v-56 m-482 56 q0 10 10 10 m462 0 q10 0 10 -10 m-472 10 h10 m58 0 h10 m0 0 h10 m64 0 h10 m20 0 h10 m0 0 h250 m-280 0 h20 m260 0 h20 m-300 0 q10 0 10 10 m280 0 q0 -10 10 -10 m-290 10 v12 m280 0 v-12 m-280 12 q0 10 10 10 m260 0 q10 0 10 -10 m-270 10 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m64 0 h10 m40 -108 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m23 -32 h-3"></path>
<polygon points="747 5 755 1 755 9"></polygon>
<polygon points="747 5 739 1 739 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
