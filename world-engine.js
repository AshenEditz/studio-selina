// 3D World Engine with Lip Sync
let scene, camera, renderer, controls, clock;
let avatar, mouth, leftEye, rightEye;
let isSpeaking = false;
let blinkTime = 0;

function initWorld() {
    console.log("🌍 Init world...");
    
    try {
        if (typeof THREE === "undefined") {
            console.error("THREE not loaded");
            showFallback();
            return false;
        }
        
        const canvas = document.getElementById("canvas");
        if (!canvas) return false;
        
        clock = new THREE.Clock();
        
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f0f23);
        scene.fog = new THREE.FogExp2(0x0f0f23, 0.04);
        
        // Camera
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || 400;
        camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.set(0, 1.4, 2.5);
        camera.lookAt(0, 1.2, 0);
        
        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        
        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(5, 10, 5);
        light.castShadow = true;
        scene.add(light);
        
        scene.add(new THREE.PointLight(0xff6b9d, 0.6, 15).translateX(-3).translateY(2));
        scene.add(new THREE.PointLight(0x00fff5, 0.6, 15).translateX(3).translateY(2));
        
        // Ground
        const ground = new THREE.Mesh(
            new THREE.CircleGeometry(15, 32),
            new THREE.MeshStandardMaterial({ color: 0x1a1a2e })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);
        
        // Grid
        const grid = new THREE.GridHelper(20, 20, 0xff6b9d, 0x00fff5);
        grid.material.opacity = 0.15;
        grid.material.transparent = true;
        scene.add(grid);
        
        // Create avatar
        createAvatar();
        
        // Controls
        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.minDistance = 1.5;
            controls.maxDistance = 4;
            controls.maxPolarAngle = Math.PI / 1.8;
            controls.enablePan = false;
            controls.target.set(0, 1.2, 0);
        }
        
        // Particles
        createParticles();
        
        // Start
        animate();
        
        window.addEventListener("resize", onResize);
        
        console.log("✅ World ready");
        return true;
        
    } catch (e) {
        console.error("World error:", e);
        showFallback();
        return false;
    }
}

function createAvatar() {
    avatar = new THREE.Group();
    
    const skin = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
    const hair = new THREE.MeshStandardMaterial({ color: 0xff6b9d, roughness: 0.4 });
    const outfit = new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.5 });
    
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), skin);
    head.scale.set(1, 1.12, 0.92);
    head.position.y = 1.48;
    head.castShadow = true;
    avatar.add(head);
    
    // Eyes
    const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeBlue = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const eyeBlack = new THREE.MeshBasicMaterial({ color: 0x1a1a2e });
    
    [-0.08, 0.08].forEach(x => {
        const white = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), eyeWhite);
        white.scale.set(1, 1.4, 0.4);
        white.position.set(x, 1.52, 0.18);
        avatar.add(white);
        
        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), eyeBlue);
        iris.position.set(x, 1.52, 0.2);
        avatar.add(iris);
        
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 12), eyeBlack);
        pupil.position.set(x, 1.52, 0.22);
        avatar.add(pupil);
        
        const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), eyeWhite);
        highlight.position.set(x + 0.01, 1.54, 0.23);
        avatar.add(highlight);
        
        if (x < 0) leftEye = white;
        else rightEye = white;
    });
    
    // Mouth
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xff8a9e });
    mouth = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 16, Math.PI), mouthMat);
    mouth.position.set(0, 1.4, 0.19);
    mouth.rotation.z = Math.PI;
    avatar.add(mouth);
    
    // Hair
    const mainHair = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 32), hair);
    mainHair.position.set(0, 1.58, -0.05);
    mainHair.scale.set(1.05, 1.1, 1);
    avatar.add(mainHair);
    
    // Bangs
    for (let i = 0; i < 5; i++) {
        const bang = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.15, 8), hair);
        bang.position.set((i - 2) * 0.05, 1.6, 0.14);
        bang.rotation.x = 0.4;
        avatar.add(bang);
    }
    
    // Twin tails
    [-0.15, 0.15].forEach(x => {
        for (let i = 0; i < 4; i++) {
            const seg = new THREE.Mesh(new THREE.SphereGeometry(0.05 - i * 0.008, 12, 12), hair);
            seg.position.set(x + (x < 0 ? -1 : 1) * i * 0.02, 1.4 - i * 0.1, -0.1);
            avatar.add(seg);
        }
    });
    
    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 12), skin);
    neck.position.y = 1.32;
    avatar.add(neck);
    
    // Body
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.3, 12, 16), outfit);
    body.position.y = 1.0;
    body.castShadow = true;
    avatar.add(body);
    
    // Arms
    [-0.2, 0.2].forEach(x => {
        const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.25, 8, 12), skin);
        arm.position.set(x * 1.1, 0.95, 0);
        arm.rotation.z = x < 0 ? 0.2 : -0.2;
        avatar.add(arm);
    });
    
    // Skirt
    const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.3, 24), outfit);
    skirt.position.y = 0.55;
    avatar.add(skirt);
    
    // Glow
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff6b9d, transparent: true, opacity: 0.1, side: THREE.BackSide })
    );
    glow.position.y = 1.48;
    glow.scale.setScalar(1.2);
    avatar.add(glow);
    
    window.outfitMat = outfit;
    window.hairMat = hair;
    
    scene.add(avatar);
}

function createParticles() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(500 * 3);
    for (let i = 0; i < 500 * 3; i++) {
        pos[i] = (Math.random() - 0.5) * 20;
        if (i % 3 === 1) pos[i] = Math.random() * 10;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    
    const mat = new THREE.PointsMaterial({ size: 0.04, color: 0xff6b9d, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(geo, mat);
    particles.name = "particles";
    scene.add(particles);
}

function animate() {
    requestAnimationFrame(animate);
    if (!renderer) return;
    
    const delta = clock.getDelta();
    if (controls) controls.update();
    
    // Breathing
    if (avatar) {
        avatar.position.y = Math.sin(Date.now() * 0.0015) * 0.015;
        avatar.rotation.y = Math.sin(Date.now() * 0.0005) * 0.05;
    }
    
    // Blinking
    blinkTime += delta;
    if (blinkTime > 3 + Math.random() * 2) {
        blinkTime = 0;
        if (leftEye && rightEye) {
            leftEye.scale.y = 0.1;
            rightEye.scale.y = 0.1;
            setTimeout(() => {
                if (leftEye) leftEye.scale.y = 1.4;
                if (rightEye) rightEye.scale.y = 1.4;
            }, 150);
        }
    }
    
    // Lip sync
    if (mouth) {
        if (isSpeaking) {
            const open = Math.sin(Date.now() * 0.02) * 0.5 + 0.5;
            mouth.scale.y = 1 + open * 0.5;
            mouth.position.y = 1.4 - open * 0.01;
        } else {
            mouth.scale.y = 1;
            mouth.position.y = 1.4;
        }
    }
    
    // Particles
    const p = scene.getObjectByName("particles");
    if (p) {
        p.rotation.y += 0.0002;
        const arr = p.geometry.attributes.position.array;
        for (let i = 1; i < arr.length; i += 3) {
            arr[i] -= 0.003;
            if (arr[i] < 0) arr[i] = 10;
        }
        p.geometry.attributes.position.needsUpdate = true;
    }
    
    renderer.render(scene, camera);
}

function startLipSync() {
    isSpeaking = true;
    document.getElementById("emojiIcon").textContent = "💬";
    document.getElementById("emojiText").textContent = "Speaking";
}

function stopLipSync() {
    isSpeaking = false;
    document.getElementById("emojiIcon").textContent = "😊";
    document.getElementById("emojiText").textContent = "Happy";
}

function changeOutfit(color) {
    const colors = { blue: 0x87ceeb, pink: 0xff6b9d, purple: 0x9b59b6, cyan: 0x00fff5 };
    if (window.outfitMat && colors[color]) {
        window.outfitMat.color.setHex(colors[color]);
        showToast("Outfit changed! 👗");
    }
}

function changeScene(type) {
    const scenes = {
        night: { bg: 0x0f0f23, fog: 0x1a1a2e },
        day: { bg: 0x87ceeb, fog: 0xb0e0e6 },
        sunset: { bg: 0xff8c69, fog: 0xffa07a },
        space: { bg: 0x000011, fog: 0x000022 }
    };
    const s = scenes[type];
    if (s && scene) {
        scene.background = new THREE.Color(s.bg);
        scene.fog = new THREE.FogExp2(s.fog, 0.04);
        showToast("Scene changed! 🌍");
    }
}

function onResize() {
    if (!camera || !renderer) return;
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

function showFallback() {
    const world = document.getElementById("world");
    if (!world) return;
    world.innerHTML = `
        <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background:linear-gradient(180deg,#1a0033,#0f0f23);">
            <div style="text-align:center;">
                <div style="font-size:5rem;animation:bounce 2s infinite;">💖</div>
                <h2 style="color:#ff6b9d;margin:20px 0;">Selina AI</h2>
                <p style="color:#00fff5;">by Ashen Editz</p>
            </div>
        </div>
        <style>@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}</style>
    `;
}

window.initWorld = initWorld;
window.startLipSync = startLipSync;
window.stopLipSync = stopLipSync;
window.changeOutfit = changeOutfit;
window.changeScene = changeScene;

console.log("✅ World engine loaded");
