import * as THREE from 'three'
import { createLanguageService } from 'typescript'

export class PixelShader {
  constructor(imageElement){
    this.container = imageElement.parentElement
    this.image = imageElement
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1)

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,

    })
    this.renderer.setSize(this.image.offsetWidth, this.image.offsetHeight)

    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(this.image.src, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.format = THREE.RGBAFormat;
    })

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: {value: texture},
        time: {value: 0.1},
        pixelSize: {value: 80},
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }
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
        varying vec2 vUv;

        void main() {
          float d = distance(vUv, uMouse);
          float radius = 0.3;
          float influence = smoothstep(radius, 0.0, d);
          vec2 dir = normalize(vUv - uMouse);
          float offset = sin(time * 3.0 + d * 30.0) * 0.01;
          vec2 displacedUV = vUv + dir * offset * influence;
          vec2 pixelatedCoord = floor(displacedUV * pixelSize) / pixelSize;
          vec2 fluidPixelUV = mix(displacedUV, pixelatedCoord, influence);
          // float oscillation = sin(time * 5.0 + d * 50.0) * 0.005;
          // vec2 fluidUV = vUv + dir * oscillation * (1.0 - smoothstep(0.0, radius, d));
          // vec2 pixelatedUV = floor(fluidUV * pixelSize) / pixelSize;
          vec4 pixelatedColor = texture2D(uTexture, fluidPixelUV);
          vec4 originalColor = texture2D(uTexture, vUv);
          // float factor = 1.0 - smoothstep(0.0, radius, d);
          gl_FragColor = mix(originalColor, pixelatedColor, influence);
        }
      `
    });
    console.log(this.material)

    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, this.material)
    this.scene.add(mesh)

    this.animate = this.animate.bind(this)
    this.isHovered = false

    this.renderer.domElement.style.display = 'none';
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';

    this.container.style.position = 'relative';
    this.container.appendChild(this.renderer.domElement);
    this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(e){
    const rect = this.container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    this.material.uniforms.uMouse.value.set(x, y);
  }

  animate(time){
    if(this.isHovered){
      this.material.uniforms.time.value = time * 0.01
      this.renderer.render(this.scene, this.camera)
    }
    this.animationFrame = requestAnimationFrame(this.animate)
  }

  start(){
    this.renderer.domElement.style.display = 'block'
    this.image.style.opacity = '0'
    if(!this.animationFrame){
      this.animate(0)
    }
  }

  stop(){
    this.renderer.domElement.style.display = 'none'
    this.image.style.opacity = '1'
    if(this.animationFrame){
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }
}
