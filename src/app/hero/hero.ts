import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private globeGroup!: THREE.Group;
  private controls!: OrbitControls;
  private animationId = 0;

  ngOnInit() {
    this.initThree();
    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  private initThree() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // Camera
    const width = this.canvasContainer.nativeElement.clientWidth;
    const height = this.canvasContainer.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 3;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(width, height);
    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
    pointLight.position.set(0, 0, 3);
    this.scene.add(pointLight);

    // Globe group
    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    // Globe mesh
    const globeGeo = new THREE.SphereGeometry(1, 48, 48);
    const globeMat = new THREE.MeshPhongMaterial({
      emissive: 0xffffff,
      emissiveIntensity: 0.25,
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    this.globeGroup.add(globe);

    // White circular placeholders
    const circleGeo = new THREE.CircleGeometry(0.12, 32);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const orbitRadius = 1.8;
    const circlesPerRing = 8;

    // Horizontal ring (equator)
    for (let i = 0; i < circlesPerRing; i++) {
      const angle = (i / circlesPerRing) * Math.PI * 2;
      const x = orbitRadius * Math.cos(angle);
      const y = 0;
      const z = orbitRadius * Math.sin(angle);
      const circle = new THREE.Mesh(circleGeo, circleMat);
      circle.position.set(x, y, z);
      circle.lookAt(0, 0, 0);
      this.globeGroup.add(circle);
    }

    // Vertical ring (longitude)
    for (let i = 0; i < circlesPerRing; i++) {
      const angle = (i / circlesPerRing) * Math.PI * 2;
      const x = 0;
      const y = orbitRadius * Math.sin(angle);
      const z = orbitRadius * Math.cos(angle);
      const circle = new THREE.Mesh(circleGeo, circleMat);
      circle.position.set(x, y, z);
      circle.lookAt(0, 0, 0);
      this.globeGroup.add(circle);
    }

    // Slight pre-rotation
    this.globeGroup.rotation.y = Math.PI / 5;
    this.globeGroup.rotation.x = 0.25;

    // OrbitControls (now interactive)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.rotateSpeed = 0.8; // smooth control speed
    this.controls.dampingFactor = 0.08;

    // Resize handling
    window.addEventListener('resize', () => this.onResize());
  }

  private onResize() {
    const width = this.canvasContainer.nativeElement.clientWidth;
    const height = this.canvasContainer.nativeElement.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
