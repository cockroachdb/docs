export const CreateFuncStmt3 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="267" width="693" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="72" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">CREATE</text><a xlink:href="#opt_or_replace" xlink:title="opt_or_replace">
<rect height="32" width="116" x="123" y="3"></rect>
<rect class="nonterminal" height="32" width="116" x="121" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="92" font-size="10" class="nonterminal" x="133" y="21">opt_or_replace</text></a><rect height="32" rx="10" width="92" x="259" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="257" y="1"></rect>
<text class="terminal" x="267" y="21">FUNCTION</text><a xlink:href="#routine_create_name" xlink:title="routine_create_name">
<rect height="32" width="156" x="371" y="3"></rect>
<rect class="nonterminal" height="32" width="156" x="369" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="11" class="nonterminal" x="381" y="21">routine_create_name</text></a><rect height="32" rx="10" width="26" x="547" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="545" y="1"></rect>
<text class="terminal" x="555" y="21">(</text><a xlink:href="#opt_routine_param_with_default_list" xlink:title="opt_routine_param_with_default_list">
<rect height="32" width="256" x="197" y="69"></rect>
<rect class="nonterminal" height="32" width="256" x="195" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="232" font-size="10" class="nonterminal" x="207" y="87">opt_routine_param_with_default_list</text></a><rect height="32" rx="10" width="26" x="473" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="471" y="67"></rect>
<text class="terminal" x="481" y="87">)</text>
<rect height="32" rx="10" width="84" x="45" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="43" y="165"></rect>
<text class="terminal" x="53" y="185">RETURNS</text><a xlink:href="#opt_return_set" xlink:title="opt_return_set">
<rect height="32" width="116" x="149" y="167"></rect>
<rect class="nonterminal" height="32" width="116" x="147" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="92" font-size="10" class="nonterminal" x="159" y="185">opt_return_set</text></a><a xlink:href="#routine_return_type" xlink:title="routine_return_type">
<rect height="32" width="148" x="285" y="167"></rect>
<rect class="nonterminal" height="32" width="148" x="283" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="295" y="185">routine_return_type</text></a><a xlink:href="#opt_create_routine_opt_list" xlink:title="opt_create_routine_opt_list">
<rect height="32" width="198" x="473" y="135"></rect>
<rect class="nonterminal" height="32" width="198" x="471" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="174" font-size="10" class="nonterminal" x="483" y="153">opt_create_routine_opt_list</text></a><a xlink:href="#opt_routine_body" xlink:title="opt_routine_body">
<rect height="32" width="134" x="531" y="233"></rect>
<rect class="nonterminal" height="32" width="134" x="529" y="231"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="541" y="251">opt_routine_body</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m116 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m156 0 h10 m0 0 h10 m26 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-420 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m256 0 h10 m0 0 h10 m26 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-518 66 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h398 m-428 0 h20 m408 0 h20 m-448 0 q10 0 10 10 m428 0 q0 -10 10 -10 m-438 10 v12 m428 0 v-12 m-428 12 q0 10 10 10 m408 0 q10 0 10 -10 m-418 10 h10 m84 0 h10 m0 0 h10 m116 0 h10 m0 0 h10 m148 0 h10 m20 -32 h10 m198 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-184 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m134 0 h10 m3 0 h-3"></path>
<polygon points="683 247 691 243 691 251"></polygon>
<polygon points="683 247 675 243 675 251"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
