"use strict";

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ==========================================
// 1. 场景
// ==========================================

// 创建场景空间 
const scene = new THREE.Scene();

// 【指数分布】雾效，让远处的物体渐渐消失在黑暗中
scene.fog = new THREE.FogExp2(0x020205, 0.015);

// 透明相机
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 3, 10);

// 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true }); // 启用 MSAA
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

// 启用阻力
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// ==========================================
// 2. 灯光系统 (光源材料)
// ==========================================
// 封装一个创建灯光的函数
function createLights() {
    // 环境光，提供基础照明
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    // 核心（点光源），蓝色，位于中心
    const coreLight = new THREE.PointLight(0x00ffff, 50, 20);
    scene.add(coreLight);

    // 辅助（点光源），品红，不断环绕
    const orbitLight = new THREE.PointLight(0xff00ff, 30, 20);
    scene.add(orbitLight);

    return { coreLight, orbitLight };
}
const lights = createLights();

// ==========================================
// 3. 主体：核心能量体 (定制材质)
// ==========================================

function createCore() {
    // 使用二十面体，细分两次，看起来更圆滑
    const geometry = new THREE.IcosahedronGeometry(1.5, 6);

    // 自定义着色器材质 (GLSL语言，很难，但你可以感受一下)
    // 这里我们不用传统的打光，而是让它的颜色随法线方向和时间自己变化
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Color(0x00ffff) },
            color2: { value: new THREE.Color(0xff00ff) }
        },
        vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec3 vNormal;
      void main() {
        // 【正弦函数】利用法线和时间计算混合比例
        float intensity = sin(vNormal.x * 3.0 + time) * 0.5 + 0.5;
        vec3 finalColor = mix(color1, color2, intensity);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return mesh;
}
const core = createCore();

// ==========================================
// 4. 外围粒子星系 (大量数据)
// ==========================================

function createGalaxy() {
    const particlesCount = 30000; // 一万五千个粒子
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const colorInside = new THREE.Color(0x00ffff);
    const colorOutside = new THREE.Color(0xff00ff);

    for (let i = 0; i < particlesCount; i++) {
        // 【极坐标与圆柱坐标系】
        // 半径随距离增加，模拟星系旋臂
        const radius = Math.random() * 8 + 1;
        const branchAngle = (i % 3) * ((Math.PI * 2) / 3); // 形成三条旋臂
        const spinAngle = radius * 0.8; // 半径越远，旋转角度越大

        // 随机散布范围（越远越松散）
        const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * radius;
        const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * radius;
        const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * radius;

        // 计算最终坐标
        const angle = branchAngle + spinAngle;
        positions[i * 3] = Math.cos(angle) * radius + randomX;
        positions[i * 3 + 1] = randomY;
        positions[i * 3 + 2] = Math.sin(angle) * radius + randomZ;

        // 颜色插值：中心青蓝，边缘紫红
        const mixedColor = colorInside.clone().lerp(colorOutside, radius / 10);
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.03,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    return points;
}
const galaxy = createGalaxy();

// ==========================================
// 5. htree 辉光：后期特效 (泛光)
// ==========================================
function initPostProcessing() {
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        10.05,  // 强度
        1.5,  // 半径
        0.85  // 阈值
    );
    composer.addPass(bloomPass);
    return composer;
}
const composer = initPostProcessing();

// ==========================================
// 6. 动画循环 (主程序驱动)
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // 1. 核心能量体自转 + 脉动
    core.rotation.y = elapsedTime * 0.2;
    core.rotation.z = elapsedTime * 0.1;
    core.material.uniforms.time.value = elapsedTime; // 传递时间给着色器

    // 2. 星系旋转
    galaxy.rotation.y = elapsedTime * 0.05;

    // 3. 环绕光源运动
    // 【参数方程】光源绕着中心点做圆周运动
    lights.orbitLight.position.x = Math.cos(elapsedTime) * 5;
    lights.orbitLight.position.z = Math.sin(elapsedTime) * 5;
    lights.orbitLight.position.y = Math.sin(elapsedTime * 2) * 2;

    controls.update();
    composer.render(); // 使用后期合成器渲染
}

animate();

// 窗口自适应
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});