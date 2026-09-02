export const CreateProcedure3 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="315" width="671" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">CREATE</text>
<rect height="32" rx="10" width="40" x="143" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="141" y="33"></rect>
<text class="terminal" x="151" y="53">OR</text>
<rect height="32" rx="10" width="80" x="203" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="201" y="33"></rect>
<text class="terminal" x="211" y="53">REPLACE</text>
<rect height="32" rx="10" width="104" x="323" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="104" x="321" y="1"></rect>
<text class="terminal" x="331" y="21">PROCEDURE</text><a xlink:href="/docs/v24.1/sql-grammar#routine_create_name" xlink:title="routine_create_name">
<rect height="32" width="156" x="447" y="3"></rect>
<rect class="nonterminal" height="32" width="156" x="445" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="11" class="nonterminal" x="457" y="21">routine_create_name</text></a><rect height="32" rx="10" width="26" x="623" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="621" y="1"></rect>
<text class="terminal" x="631" y="21">(</text><a xlink:href="/docs/v24.1/sql-grammar#routine_param" xlink:title="routine_param">
<rect height="32" width="114" x="65" y="145"></rect>
<rect class="nonterminal" height="32" width="114" x="63" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="90" font-size="11" class="nonterminal" x="75" y="163">routine_param</text></a><rect height="32" rx="10" width="24" x="65" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="63" y="99"></rect>
<text class="terminal" x="73" y="119">,</text>
<rect height="32" rx="10" width="26" x="239" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="237" y="143"></rect>
<text class="terminal" x="247" y="163">)</text>
<rect height="32" rx="10" width="38" x="345" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="343" y="175"></rect>
<text class="terminal" x="353" y="195">AS</text>
<rect height="32" width="130" x="403" y="177"></rect>
<rect class="nonterminal" height="32" width="130" x="401" y="175"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="413" y="195">routine_body_str</text><rect height="32" rx="10" width="94" x="345" y="221"></rect>
<rect class="terminal" height="32" rx="10" width="94" x="343" y="219"></rect>
<text class="terminal" x="353" y="239">LANGUAGE</text>
<rect height="32" rx="10" width="48" x="479" y="221"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="477" y="219"></rect>
<text class="terminal" x="487" y="239">SQL</text>
<rect height="32" rx="10" width="84" x="479" y="265"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="477" y="263"></rect>
<text class="terminal" x="487" y="283">PLPGSQL</text>
<path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m20 0 h10 m0 0 h150 m-180 0 h20 m160 0 h20 m-200 0 q10 0 10 10 m180 0 q0 -10 10 -10 m-190 10 v12 m180 0 v-12 m-180 12 q0 10 10 10 m160 0 q10 0 10 -10 m-170 10 h10 m40 0 h10 m0 0 h10 m80 0 h10 m20 -32 h10 m104 0 h10 m0 0 h10 m156 0 h10 m0 0 h10 m26 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-668 142 l2 0 m2 0 l2 0 m2 0 l2 0 m42 0 h10 m114 0 h10 m-154 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m134 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-134 0 h10 m24 0 h10 m0 0 h90 m-174 44 h20 m174 0 h20 m-214 0 q10 0 10 10 m194 0 q0 -10 10 -10 m-204 10 v14 m194 0 v-14 m-194 14 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m0 0 h164 m20 -34 h10 m26 0 h10 m60 0 h10 m0 0 h248 m-278 0 h20 m258 0 h20 m-298 0 q10 0 10 10 m278 0 q0 -10 10 -10 m-288 10 v12 m278 0 v-12 m-278 12 q0 10 10 10 m258 0 q10 0 10 -10 m-268 10 h10 m38 0 h10 m0 0 h10 m130 0 h10 m0 0 h50 m-268 -10 v20 m278 0 v-20 m-278 20 v24 m278 0 v-24 m-278 24 q0 10 10 10 m258 0 q10 0 10 -10 m-268 10 h10 m94 0 h10 m20 0 h10 m48 0 h10 m0 0 h36 m-124 0 h20 m104 0 h20 m-144 0 q10 0 10 10 m124 0 q0 -10 10 -10 m-134 10 v24 m124 0 v-24 m-124 24 q0 10 10 10 m104 0 q10 0 10 -10 m-114 10 h10 m84 0 h10 m-278 -120 l20 0 m-1 0 q-9 0 -9 -10 l0 4 q0 -10 10 -10 m298 16 l20 0 m-20 0 q10 0 10 -10 l0 4 q0 -10 -10 -10 m-298 0 h10 m0 0 h288 m-338 16 h20 m338 0 h20 m-378 0 q10 0 10 10 m358 0 q0 -10 10 -10 m-368 10 v134 m358 0 v-134 m-358 134 q0 10 10 10 m338 0 q10 0 10 -10 m-348 10 h10 m0 0 h328 m23 -154 h-3"></path>
<polygon points="661 159 669 155 669 163"></polygon>
<polygon points="661 159 653 155 653 163"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
