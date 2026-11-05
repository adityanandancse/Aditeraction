// Tiny column-major mat4 helpers for the raw-WebGL hero — no library, zero
// allocations per frame. Every function writes into a caller-supplied Float32Array
// `out`; the hero preallocates one array per matrix and reuses them each frame.
//
// Conventions match what three.js produced before it was removed, so the shader
// (unchanged) sees byte-identical modelViewMatrix / projectionMatrix inputs:
//   • perspective  == PerspectiveCamera.updateProjectionMatrix (zoom 1, WebGL NDC)
//   • lookAt       == camera.matrixWorldInverse (the view matrix)
//   • composeModel == Object3D.matrix for position + Euler 'XYZ' + scale 1

type M4 = Float32Array;
type V3 = ArrayLike<number>;

/** Vertical-FOV symmetric perspective. Matches three PerspectiveCamera (zoom 1). */
export function perspective(
  out: M4,
  fovDeg: number,
  aspect: number,
  near: number,
  far: number,
): M4 {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360); // 1 / tan(fov/2)
  const nf = 1 / (near - far);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = 2 * far * near * nf;
  out[15] = 0;
  return out;
}

const UP = new Float32Array([0, 1, 0]);

/** View matrix for a camera at `eye` looking at `target`. Matches three's lookAt. */
export function lookAt(out: M4, eye: V3, target: V3, up: V3 = UP): M4 {
  let zx = eye[0]! - target[0]!;
  let zy = eye[1]! - target[1]!;
  let zz = eye[2]! - target[2]!;
  let len = Math.hypot(zx, zy, zz);
  if (len === 0) {
    zz = 1;
  } else {
    zx /= len;
    zy /= len;
    zz /= len;
  }
  // x = normalize(cross(up, z))
  let xx = up[1]! * zz - up[2]! * zy;
  let xy = up[2]! * zx - up[0]! * zz;
  let xz = up[0]! * zy - up[1]! * zx;
  len = Math.hypot(xx, xy, xz);
  if (len === 0) {
    xx = 1;
    xy = 0;
    xz = 0;
  } else {
    xx /= len;
    xy /= len;
    xz /= len;
  }
  // y = cross(z, x)
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  out[0] = xx;
  out[1] = yx;
  out[2] = zx;
  out[3] = 0;
  out[4] = xy;
  out[5] = yy;
  out[6] = zy;
  out[7] = 0;
  out[8] = xz;
  out[9] = yz;
  out[10] = zz;
  out[11] = 0;
  out[12] = -(xx * eye[0]! + xy * eye[1]! + xz * eye[2]!);
  out[13] = -(yx * eye[0]! + yy * eye[1]! + yz * eye[2]!);
  out[14] = -(zx * eye[0]! + zy * eye[1]! + zz * eye[2]!);
  out[15] = 1;
  return out;
}

/**
 * Model matrix = translate(px,py,pz) · rotateX(rx) · rotateY(ry) · rotateZ(rz),
 * i.e. three's Euler 'XYZ' order with unit scale. Element layout is copied from
 * three's makeRotationFromEuler so the result is byte-for-byte identical.
 */
export function composeModel(
  out: M4,
  px: number,
  py: number,
  pz: number,
  rx: number,
  ry: number,
  rz: number,
): M4 {
  const a = Math.cos(rx);
  const b = Math.sin(rx);
  const c = Math.cos(ry);
  const d = Math.sin(ry);
  const e = Math.cos(rz);
  const f = Math.sin(rz);
  const ae = a * e;
  const af = a * f;
  const be = b * e;
  const bf = b * f;

  out[0] = c * e;
  out[1] = af + be * d;
  out[2] = bf - ae * d;
  out[3] = 0;
  out[4] = -c * f;
  out[5] = ae - bf * d;
  out[6] = be + af * d;
  out[7] = 0;
  out[8] = d;
  out[9] = -b * c;
  out[10] = a * c;
  out[11] = 0;
  out[12] = px;
  out[13] = py;
  out[14] = pz;
  out[15] = 1;
  return out;
}

/** out = a · b (column-major). `out` must not alias `a` or `b`. */
export function multiply(out: M4, a: M4, b: M4): M4 {
  const a00 = a[0]!,
    a01 = a[1]!,
    a02 = a[2]!,
    a03 = a[3]!;
  const a10 = a[4]!,
    a11 = a[5]!,
    a12 = a[6]!,
    a13 = a[7]!;
  const a20 = a[8]!,
    a21 = a[9]!,
    a22 = a[10]!,
    a23 = a[11]!;
  const a30 = a[12]!,
    a31 = a[13]!,
    a32 = a[14]!,
    a33 = a[15]!;

  for (let i = 0; i < 4; i++) {
    const bi = i * 4;
    const b0 = b[bi]!,
      b1 = b[bi + 1]!,
      b2 = b[bi + 2]!,
      b3 = b[bi + 3]!;
    out[bi] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[bi + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[bi + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[bi + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  }
  return out;
}
