import { Curtains, Plane } from 'curtainsjs';

export class LiquidShader {
  constructor(containerId, planeClass, imageElement) {
    this.containerId = containerId;
    this.planeClass = planeClass;
    this.imageElement = imageElement;
    this.init();
  }

  init() {
    // Récupérer les éléments DOM
    this.containerElement = document.getElementById(this.containerId);
    this.planeElement = document.querySelector(`.${this.planeClass}`);

    if (!this.containerElement || !this.planeElement) {
      console.error('Elements not found:', {
        containerId: this.containerId,
        planeClass: this.planeClass,
      });
      return;
    }

    this.curtains = new Curtains({
      container: this.containerElement,
      pixelRatio: Math.min(3, window.devicePixelRatio),
    });

    const params = {
      vertexShaderID: 'plane-vs',
      fragmentShaderID: 'plane-fs',
      uniforms: {
        uTime: {
          name: 'uTime',
          type: '1f',
          value: 0,
        },
      },
    };

    this.plane = new Plane(this.curtains, this.planeElement, params);

    this.curtains.onSuccess(() => {
      if (this.curtains.canvas) {
        const computedStyle = window.getComputedStyle(this.planeElement);
        const clipPath = computedStyle.clipPath;

        Object.assign(this.curtains.canvas.style, {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          zIndex: '1',
          clipPath: clipPath !== 'none' ? clipPath : 'inset(0 100% 0 0)',
          transition: 'clip-path 300ms ease-in-out',
        });

        // Observer les changements de classe sur le parent pour mettre à jour le clip-path
        const groupElement = this.containerElement.closest('.group');
        if (groupElement) {
          const observer = new MutationObserver(() => {
            const newComputedStyle = window.getComputedStyle(this.planeElement);
            const newClipPath = newComputedStyle.clipPath;
            if (newClipPath !== 'none') {
              this.curtains.canvas.style.clipPath = newClipPath;
            }
          });

          observer.observe(groupElement, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true,
          });

          groupElement.addEventListener('mouseenter', () => {
            this.curtains.canvas.style.clipPath = 'inset(0 0 0 0)';
          });

          groupElement.addEventListener('mouseleave', () => {
            this.curtains.canvas.style.clipPath = 'inset(0 100% 0 0)';
          });
        }
      }
    });

    this.plane.onRender(() => {
      this.plane.uniforms.uTime.value = Number(this.plane.uniforms.uTime.value) + 1;
    });
  }
}
