/* objects.js — the procedural hero objects, one per client site.
 *
 * Each builder takes (THREE, ctx) from hero3d.mountHero and returns a Group.
 * ctx gives {mat, h, tex, paint} — see hero3d.js.
 *
 * Modelling notes that matter for realism:
 *  - Anything turned on a lathe in reality is built with LatheGeometry from a
 *    hand-authored profile. Straight cylinders read as toys; a profile with a
 *    shoulder, a taper and a fillet reads as machined.
 *  - Flat forged parts (scissor blades, clipper blades, wrench jaws) use
 *    ExtrudeGeometry with a bevel so the edges catch a highlight.
 *  - Patterns (barber stripes, coil windings, tyre tread) are canvas textures
 *    rather than geometry — far cheaper and more convincing at this scale.
 */

/* ---------------------------------------------------------------- BARBER POLE
   Humble Barbershop. Glass sleeve over a helical stripe, chrome end caps
   lathed from a real turned profile, wall bracket. */

/* Extracted for this site only — the full library of 11 hero objects
   lives in _shared/objects.js. Regenerate with tools/build_site.py. */

export function barberPole(THREE, ctx) {
  const {mat, h, tex} = ctx;
  const g = new THREE.Group();

  const stripe = tex(512, 512, (c, w, hh) => {
    c.fillStyle = '#F4F2EE'; c.fillRect(0, 0, w, hh);
    const band = hh / 6;
    c.lineWidth = band; c.lineCap = 'butt';
    const cols = ['#C8202C', '#1D3F8F'];
    for (let i = -8; i < 16; i++) {
      c.strokeStyle = cols[(i + 16) % 2];
      const off = i * band * 3;
      c.beginPath(); c.moveTo(off - hh, hh * 2); c.lineTo(off + hh * 2, -hh); c.stroke();
    }
  }, [1, 2.2]);

  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.52, 5.2, 96, 1, true),
    new THREE.MeshPhysicalMaterial({
      map: stripe, roughness: 0.38, metalness: 0,
      clearcoat: 0.6, clearcoatRoughness: 0.25
    })
  );
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.62, 5.25, 96, 1, true), mat.glass
  );
  g.add(inner, glass);

  // turned chrome cap profile — shoulder, waist, dome
  const capPts = [[0,0],[0.40,0],[0.64,0.10],[0.70,0.26],[0.66,0.42],
                  [0.60,0.52],[0.62,0.72],[0.52,0.92],[0.30,1.04],[0.10,1.10],[0,1.12]];
  const top = h.lathe(capPts, mat.chrome, 72); top.position.y = 2.6;
  const bot = h.lathe(capPts, mat.chrome, 72); bot.position.y = -2.6; bot.scale.y = -1;
  g.add(top, bot);

  const arm = h.cyl(0.075, 0.075, 1.5, mat.chrome, 32);
  arm.rotation.z = Math.PI / 2; arm.position.set(-1.05, 0, 0);
  const plate = h.cyl(0.42, 0.42, 0.14, mat.chrome, 48);
  plate.rotation.z = Math.PI / 2; plate.position.set(-1.82, 0, 0);
  g.add(arm, plate);

  g.userData.stripe = stripe;   // animated in tick()
  return g;
}

/* ------------------------------------------------------------- HAIR CLIPPERS
   Mack the Barber. Body is a rounded shell with a taper lever; the blade is an
   extruded comb with visible teeth, which is what makes it read as clippers. */
