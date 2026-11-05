// Decorative particle hero, raw WebGL — ZERO runtime dependencies (three removed).
// Lazy-loaded ONLY (React.lazy in Landing), so none of this touches the entry or
// SSR bundle. The component owns a single <canvas>; context, program, buffers,
// loop, sizing and teardown are all imperative. GLSL ES 1.00 shaders run in both
// webgl2 and webgl1 contexts unchanged.
import { useEffect, useRef } from "react";
import { buildParticles } from "./buildParticles";
import { heroDebugEnabled, heroGate, heroStat } from "./heroDebug";
import { composeModel, lookAt, multiply, perspective } from "./mat4";

const STAGE = ["01 / 03", "02 / 03", "03 / 03", "—"];

const ease = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const band = (x: number, a: number, b: number) => ease(clamp01((x - a) / (b - a)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Sticky hero height — mirrors `h-[min(100svh,960px)]` in Landing.tsx. Scroll
// progress runs over the section's travel while that sticky block is pinned.
const STICKY_MAX = 960;

// three used to inject these before the shader body; GLSL ES 1.00 needs them
// spelled out. The VERT/FRAG bodies below are byte-for-byte the originals.
const VERT_PREFIX = `precision highp float;
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
`;
const FRAG_PREFIX = `precision highp float;
`;

const VERT = /* glsl */ `
attribute vec3 aB; attribute vec3 aC; attribute float aD; attribute float aR;
uniform float uMix; uniform float uBurst; uniform float uTime; uniform float uSize; uniform float uMax;
varying float vA; varying float vR;
void main(){
  float sp = uTime * 0.15; float cs = cos(sp), sn = sin(sp);
  vec3 sph = vec3(position.x*cs - position.z*sn, position.y, position.x*sn + position.z*cs);
  float m = clamp(uMix * 1.7 - aD * 0.7, 0.0, 1.0); m = m*m*(3.0-2.0*m);
  vec3 p = mix(sph, aB, m);
  float bu = clamp(uBurst * 1.5 - aR * 0.5, 0.0, 1.0);
  p = mix(p, aC, bu * bu);
  float wob = 0.05 * (1.0 - m * 0.85);
  p += wob * vec3(sin(uTime*1.1 + p.y*3.0 + aR*6.0), cos(uTime*1.3 + p.x*3.0), sin(uTime*0.9 + p.z*3.0));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = min(uMax, uSize * (0.45 + aR * 0.7) / -mv.z);
  vA = clamp(1.3 - (-mv.z - 4.0) / 9.0, 0.18, 1.0); vR = aR;
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
uniform vec3 uColor; uniform vec3 uPaper; uniform float uFade;
varying float vA; varying float vR;
void main(){
  gl_FragColor = vec4(mix(uColor, uPaper, step(0.97, vR)), vA * uFade);
}`;

const inViewport = (el: Element | null): boolean => {
  if (!el) return true;
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
};

type GL = WebGL2RenderingContext | WebGLRenderingContext;

export default function HeroCanvas({
  onReady,
  onError,
}: {
  onReady: () => void;
  onError: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep the latest callbacks without re-running the effect — passing fresh
  // closures as deps used to tear down the context the instant onReady fired,
  // freezing the hero. The effect now runs exactly once.
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;
  // Holds a pending loseContext() scheduled by a previous cleanup. Under React
  // StrictMode (dev) the effect runs mount → cleanup → mount on the SAME canvas;
  // a context killed by loseContext() cannot be restored on that canvas, so the
  // teardown defers loseContext() and the next mount cancels it to reuse the
  // still-live context. Persisted in a ref so it survives the remount.
  const disposeTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const DEBUG = heroDebugEnabled();
    heroGate("mounted", true);

    // Remounting (StrictMode or HMR): cancel the pending context disposal so we
    // keep the live context instead of letting it be lost.
    if (disposeTimerRef.current !== undefined) {
      clearTimeout(disposeTimerRef.current);
      disposeTimerRef.current = undefined;
    }

    let disposed = false;
    let raf = 0;
    let compileRaf = 0;

    // --- context (webgl2 → webgl1 fallback) --------------------------------
    const attrsOpts: WebGLContextAttributes = {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    };
    let gl: GL | null = null;
    try {
      gl = (canvas.getContext("webgl2", attrsOpts) as WebGL2RenderingContext | null) ?? null;
      if (!gl) gl = (canvas.getContext("webgl", attrsOpts) as WebGLRenderingContext | null) ?? null;
    } catch {
      gl = null;
    }
    if (!gl) {
      onErrorRef.current();
      return;
    }
    const ctx = gl; // non-null alias for closures

    const maxDpr = window.innerWidth < 900 ? 1.5 : 1.75;
    // ALIASED_POINT_SIZE_RANGE is [min, max]; clamp uMax to max. Some drivers
    // (e.g. SwiftShader) return null for this query — fall back to a safe cap.
    const psRange = ctx.getParameter(ctx.ALIASED_POINT_SIZE_RANGE) as Float32Array | null;
    const psMax = psRange && psRange.length > 1 && psRange[1] ? psRange[1] : 64;

    // Fixed GL state (matches three: NormalBlending, no depth) ---------------
    ctx.clearColor(11 / 255, 11 / 255, 13 / 255, 1); // #0B0B0D
    ctx.disable(ctx.DEPTH_TEST);
    ctx.enable(ctx.BLEND);
    ctx.blendFuncSeparate(
      ctx.SRC_ALPHA,
      ctx.ONE_MINUS_SRC_ALPHA,
      ctx.ONE,
      ctx.ONE_MINUS_SRC_ALPHA,
    );

    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Aditeraction code-nib mark forming from particles");

    const landing = document.getElementById("landing");

    // --- GL resources (rebuilt on context-restore) --------------------------
    let program: WebGLProgram | null = null;
    const buffers: WebGLBuffer[] = [];
    let attrs: Awaited<ReturnType<typeof buildParticles>> | null = null;
    let N = 0;
    let programLinked = false;
    let buffersReady = false;
    let compiled = false;
    const uloc: Record<string, WebGLUniformLocation | null> = {};

    // --- preallocated matrices (zero allocation per frame) ------------------
    const projArr = new Float32Array(16);
    const viewArr = new Float32Array(16);
    const modelArr = new Float32Array(16);
    const mvArr = new Float32Array(16);
    const eye = new Float32Array(3);
    const target = new Float32Array(3);

    // --- sizing -------------------------------------------------------------
    let width = Math.max(1, canvas.clientWidth);
    let height = Math.max(1, canvas.clientHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    let uMaxVal = Math.min(22 * dpr, psMax);
    const applySize = () => {
      width = Math.max(1, canvas.clientWidth);
      height = Math.max(1, canvas.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      uMaxVal = Math.min(22 * dpr, psMax);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.viewport(0, 0, canvas.width, canvas.height);
    };
    applySize();
    const ro = new ResizeObserver(applySize);
    ro.observe(canvas);

    // --- frame state (plain locals — no per-frame allocation) ---------------
    let progress = 0;
    let smooth = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let lastShot = -1;
    let frameCount = 0;
    let readyFired = false;
    let landingEl: HTMLElement | null = landing;
    let stageEl: HTMLElement | null = null;

    const t0 = performance.now();
    let lastT = 0;
    let fpsFrames = 0;
    let fpsLast = t0;

    // --- loop control: pause when off-screen or document-hidden ------------
    let onScreen = inViewport(landing);
    let docVisible = typeof document === "undefined" ? true : !document.hidden;
    let running = false;
    heroGate("inViewport", onScreen);
    heroGate("docVisible", docVisible);
    // Toggle a document-level class so CSS can pause the blink caret (and any
    // other hero-only animation) while #landing is scrolled out of view.
    const markOffscreen = (off: boolean) =>
      document.documentElement.classList.toggle("adx-hero-offscreen", off);
    markOffscreen(!onScreen);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!compiled || !program) return;

      const dt = Math.min(lastT ? (now - lastT) / 1000 : 0, 0.05);
      lastT = now;
      const elapsed = (now - t0) / 1000;

      // Scroll progress straight from the section's rect. Lenis updates scroll
      // synchronously, so the rect read here is the smoothed position.
      const el = landingEl ?? (landingEl = document.getElementById("landing"));
      if (el) {
        const r = el.getBoundingClientRect();
        const stickyH = Math.min(window.innerHeight, STICKY_MAX);
        const range = r.height - stickyH;
        progress = range > 0 ? clamp01(-r.top / range) : 0;
      }

      smooth += (progress - smooth) * (1 - Math.exp(-dt * 4.2));
      const s = smooth;
      const form = band(s, 0.08, 0.55);
      const dive = band(s, 0.5, 0.95);
      const burst = band(s, 0.7, 1.0);

      mouseX += (targetX - mouseX) * (1 - Math.exp(-dt * 3));
      mouseY += (targetY - mouseY) * (1 - Math.exp(-dt * 3));

      const narrow = width < 900;
      const aspect = width / Math.max(1, height);
      const k = Math.max(1, 1.25 / aspect);

      // group transform (position + Euler XYZ, scale 1)
      const gx = narrow ? 0 : lerp(lerp(1.3, 0.6, form), 0, dive);
      const gy = (narrow ? 0.5 : 0) + lerp(0, 0.3, form) * (1 - dive);
      const rx = lerp(0.25, 0, form);
      const ry = mouseX * 0.12 * form;

      eye[0] = mouseX * 0.8 * (1 - form * 0.6);
      eye[1] = 0.6 * (1 - form) - mouseY * 0.5;
      eye[2] = lerp(lerp(10 * k, 6.5 * k, form), 1.2, dive);
      target[0] = narrow ? 0 : lerp(lerp(-0.7, -0.2, form), 0, dive);
      target[1] = lerp(0, 0.3, form) * (1 - dive) * 0.5;
      target[2] = 0;

      perspective(projArr, 32, aspect, 0.05, 200);
      lookAt(viewArr, eye, target);
      composeModel(modelArr, gx, gy, 0, rx, ry, 0);
      multiply(mvArr, viewArr, modelArr);

      ctx.useProgram(program);
      ctx.uniform1f(uloc.uTime!, elapsed);
      ctx.uniform1f(uloc.uMix!, form);
      ctx.uniform1f(uloc.uBurst!, burst);
      ctx.uniform1f(uloc.uFade!, 1 - band(s, 0.88, 1.0));
      ctx.uniform1f(uloc.uSize!, 30 * dpr * k);
      ctx.uniform1f(uloc.uMax!, uMaxVal);
      ctx.uniformMatrix4fv(uloc.projectionMatrix!, false, projArr);
      ctx.uniformMatrix4fv(uloc.modelViewMatrix!, false, mvArr);

      const shot = s < 0.2 ? 0 : s < 0.55 ? 1 : s < 0.88 ? 2 : 3;
      if (shot !== lastShot) {
        lastShot = shot;
        if (!landingEl) landingEl = document.getElementById("landing");
        if (!stageEl) stageEl = document.getElementById("adx-stage");
        landingEl?.setAttribute("data-shot", String(shot));
        if (stageEl) stageEl.textContent = STAGE[shot]!;
      }

      ctx.clear(ctx.COLOR_BUFFER_BIT);
      ctx.drawArrays(ctx.POINTS, 0, N);

      // Fallback fades only after the program is linked AND 2 frames drawn.
      frameCount += 1;
      if (!readyFired && frameCount >= 2) {
        readyFired = true;
        canvas.style.visibility = "visible";
        onReadyRef.current();
      }

      if (DEBUG) {
        fpsFrames += 1;
        if (now - fpsLast >= 500) {
          heroStat("fps", Math.round((fpsFrames * 1000) / (now - fpsLast)));
          fpsFrames = 0;
          fpsLast = now;
        }
        heroStat("framesRendered", frameCount);
        heroStat("progressRaw", progress);
        heroStat("smooth", smooth);
        heroStat("shot", shot);
      }
    };

    const start = () => {
      if (running || disposed) return;
      running = true;
      heroGate("running", true);
      lastT = 0; // reset dt baseline so a long pause doesn't jump the sim
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      heroGate("running", false);
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (onScreen && docVisible && compiled) start();
      else stop();
    };

    // --- program build: non-blocking via KHR_parallel_shader_compile -------
    const compileShader = (type: number, src: string): WebGLShader | null => {
      const sh = ctx.createShader(type);
      if (!sh) return null;
      ctx.shaderSource(sh, src);
      ctx.compileShader(sh);
      return sh;
    };

    const buildProgram = () => {
      const vs = compileShader(ctx.VERTEX_SHADER, VERT_PREFIX + VERT);
      const fs = compileShader(ctx.FRAGMENT_SHADER, FRAG_PREFIX + FRAG);
      const prog = ctx.createProgram();
      if (!vs || !fs || !prog) {
        onErrorRef.current();
        return;
      }
      ctx.attachShader(prog, vs);
      ctx.attachShader(prog, fs);
      ctx.linkProgram(prog);

      const ext = ctx.getExtension("KHR_parallel_shader_compile") as {
        COMPLETION_STATUS_KHR: number;
      } | null;
      heroGate("compileAsyncSupported", !!ext);

      const finishLink = () => {
        if (disposed) return;
        if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) {
          // eslint-disable-next-line no-console
          if (DEBUG) console.error("[hero] link failed:", ctx.getProgramInfoLog(prog));
          ctx.deleteShader(vs);
          ctx.deleteShader(fs);
          ctx.deleteProgram(prog);
          onErrorRef.current();
          return;
        }
        ctx.deleteShader(vs);
        ctx.deleteShader(fs);
        program = prog;

        // Cache uniform locations and set the constant colors once.
        for (const name of [
          "uMix",
          "uBurst",
          "uTime",
          "uFade",
          "uSize",
          "uMax",
          "uColor",
          "uPaper",
          "modelViewMatrix",
          "projectionMatrix",
        ]) {
          uloc[name] = ctx.getUniformLocation(prog, name);
        }
        ctx.useProgram(prog);
        ctx.uniform3f(uloc.uColor!, 1, 77 / 255, 46 / 255); // #FF4D2E
        ctx.uniform3f(uloc.uPaper!, 244 / 255, 241 / 255, 236 / 255); // #F4F1EC
        programLinked = true;
        maybeFinish();
      };

      if (ext) {
        const poll = () => {
          if (disposed) return;
          if (ctx.getProgramParameter(prog, ext.COMPLETION_STATUS_KHR)) finishLink();
          else compileRaf = requestAnimationFrame(poll);
        };
        compileRaf = requestAnimationFrame(poll);
      } else {
        finishLink();
      }
    };

    const uploadBuffers = () => {
      if (!program || !attrs) return;
      const defs: Array<[name: string, data: Float32Array, size: number]> = [
        ["position", attrs.position, 3],
        ["aB", attrs.aB, 3],
        ["aC", attrs.aC, 3],
        ["aD", attrs.aD, 1],
        ["aR", attrs.aR, 1],
      ];
      for (const [name, data, size] of defs) {
        const loc = ctx.getAttribLocation(program, name);
        if (loc < 0) continue;
        const buf = ctx.createBuffer();
        if (!buf) continue;
        ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
        ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW);
        ctx.enableVertexAttribArray(loc);
        ctx.vertexAttribPointer(loc, size, ctx.FLOAT, false, 0, 0);
        buffers.push(buf);
      }
      buffersReady = true;
    };

    const maybeFinish = () => {
      if (programLinked && attrs && !buffersReady) uploadBuffers();
      if (programLinked && buffersReady && !compiled) {
        compiled = true;
        heroGate("compiled", true);
        sync();
      }
    };

    // --- pointer (passive), visibility, intersection -----------------------
    const onMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const onVisibility = () => {
      docVisible = !document.hidden;
      heroGate("docVisible", docVisible);
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = landing
      ? new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (entry) {
              onScreen = entry.isIntersecting;
              heroGate("inViewport", onScreen);
              markOffscreen(!onScreen);
              sync();
            }
          },
          { rootMargin: "0px" },
        )
      : null;
    if (landing && io) io.observe(landing);

    // --- context loss / restore --------------------------------------------
    const onContextLost = (e: Event) => {
      e.preventDefault(); // required for restore to be possible
      stop();
      compiled = false;
      programLinked = false;
      buffersReady = false;
      program = null;
      buffers.length = 0;
      readyFired = false;
      cancelAnimationFrame(compileRaf);
      canvas.style.visibility = "hidden";
      onErrorRef.current(); // flip data-canvas → fallback visible
    };
    const onContextRestored = () => {
      if (disposed) return;
      // Re-apply fixed state on the restored context, then rebuild resources.
      ctx.clearColor(11 / 255, 11 / 255, 13 / 255, 1);
      ctx.disable(ctx.DEPTH_TEST);
      ctx.enable(ctx.BLEND);
      ctx.blendFuncSeparate(
        ctx.SRC_ALPHA,
        ctx.ONE_MINUS_SRC_ALPHA,
        ctx.ONE,
        ctx.ONE_MINUS_SRC_ALPHA,
      );
      applySize();
      buildProgram(); // attrs are still cached → maybeFinish() re-uploads buffers
    };
    canvas.addEventListener("webglcontextlost", onContextLost as EventListener, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored as EventListener, false);

    // --- kick off program compile + particle build in parallel -------------
    buildProgram();
    buildParticles()
      .then((a) => {
        if (disposed) return;
        attrs = a;
        N = a.count;
        maybeFinish();
      })
      .catch(() => {
        if (!disposed) onErrorRef.current();
      });

    // --- teardown -----------------------------------------------------------
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(compileRaf);
      ro.disconnect();
      io?.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      document.documentElement.classList.remove("adx-hero-offscreen");
      canvas.removeEventListener("webglcontextlost", onContextLost as EventListener);
      canvas.removeEventListener("webglcontextrestored", onContextRestored as EventListener);
      for (const b of buffers) ctx.deleteBuffer(b);
      buffers.length = 0;
      if (program) ctx.deleteProgram(program);
      program = null;
      // Defer loseContext() so a StrictMode/HMR remount (which re-runs this
      // effect on the same canvas) can cancel it and reuse the live context.
      // A genuine unmount lets it fire, freeing the GPU context immediately.
      const loseExt = ctx.getExtension("WEBGL_lose_context") as {
        loseContext: () => void;
      } | null;
      disposeTimerRef.current = window.setTimeout(() => {
        disposeTimerRef.current = undefined;
        loseExt?.loseContext();
      }, 0);
    };
    // Run exactly once; latest onReady/onError are read through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}
