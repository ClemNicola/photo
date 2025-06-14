import * as THREE from 'three';

export class PixelShader {
  constructor(imageElement) {
    this.container = imageElement.parentElement;
    this.image = imageElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.lastMousePosition = new THREE.Vector2(0.5, 0.5);
    const width = this.image.offsetWidth;
    const height = this.image.offsetHeight;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    this.renderer.setSize(width, height);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(this.image.src, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.format = THREE.RGBAFormat;
    });

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        time: { value: 0.1 },
        pixelSize: { value: 35 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uStrength: { value: 0.0 },
        uFadeStrength: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float time;
        uniform float pixelSize;
        uniform vec2 uMouse;
        uniform float uStrength;
        uniform float uFadeStrength;
        varying vec2 vUv;

        void main() {
          float d = distance(vUv, uMouse);
          float radius = 0.02;
          float influence = smoothstep(radius, 0.9 , d);
          influence = (1.0 - influence) * uFadeStrength;
          vec2 dir = normalize(vUv - uMouse);
          vec2 pixelatedUV = vUv;
          if (influence > 0.0) {
            float pixelSizeScaled = pixelSize * (1.5 + uStrength * 2.0);
            pixelatedUV = floor(vUv * pixelSizeScaled) / pixelSizeScaled;
            float distortionStrength = sin(time * 1.5 + d * 20.0) * 0.007 * uStrength;
            pixelatedUV += dir * distortionStrength * influence;
          };
          vec4 pixelatedColor = texture2D(uTexture, pixelatedUV);
          vec4 originalColor = texture2D(uTexture, vUv);
          gl_FragColor = mix(originalColor, pixelatedColor, uStrength * influence);
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(mesh);

    this.animate = this.animate.bind(this);
    this.isHovered = false;

    this.renderer.domElement.style.display = 'none';
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';

    this.container.style.position = 'relative';
    this.container.style.padding = '20px';
    this.container.style.margin = '-20px';

    this.image.style.position = 'relative';
    this.image.style.zIndex = '1';
    this.image.style.objectFit = 'cover';

    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '20px';
    this.renderer.domElement.style.left = '20px';

    this.container.appendChild(this.renderer.domElement);
    this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.container.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.material.uniforms.uFadeStrength.value = 1.0;
    });
    this.container.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.lastMousePosition.copy(this.material.uniforms.uMouse.value);
    });
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const padding = 20;
    const x = (e.clientX - (rect.left + padding)) / (rect.width - padding * 2);
    const y = 1.0 - (e.clientY - (rect.top + padding)) / (rect.height - padding * 2);
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));
    this.material.uniforms.uMouse.value.set(clampedX, clampedY);
    this.material.uniforms.uStrength.value = 1.0;
    this.lastMousePosition.set(clampedX, clampedY);
  }

  resize() {
    const width = this.image.offsetWidth;
    const height = this.image.offsetHeight;
    this.renderer.setSize(width, height);
    this.renderer.domElement.style.width = `${width}px`;
    this.renderer.domElement.style.height = `${height}px`;
  }
  animate(time) {
    if (this.isHovered) {
      this.material.uniforms.time.value = time * 0.01;
      this.renderer.render(this.scene, this.camera);
    }
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  start() {
    this.resize();
    this.renderer.domElement.style.display = 'block';
    this.image.style.opacity = '0';
    if (!this.animationFrame) {
      this.animate(0);
    }
  }

  stop() {
    this.renderer.domElement.style.display = 'none';
    this.image.style.opacity = '1';
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}
