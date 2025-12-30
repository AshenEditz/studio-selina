// ============================================
// SELINA AI - 3D WORLD ENGINE
// With Lip Sync, Blinking, Breathing, Hair Physics
// Created by Ashen Editz
// ============================================

let scene, camera, renderer, controls, clock;
let avatar, avatarParts = {};
let currentScene = 'city';
let isSpeaking = false;
let blinkTimer = 0;

// Animation states
const animationState = {
    mouthOpen: 0,
    eyesClosed: 0,
    breathOffset: 0,
    hairSwing: 0,
    headTilt: 0,
    bodyBounce: 0
};

// ============================================
// INITIALIZE WORLD
// ============================================
function initWorld() {
    console.log('🌍 Initializing 3D World...');
    
    try {
        if (typeof THREE === 'undefined') {
            console.error('THREE.js not loaded');
            showFallbackAvatar();
            return false;
        }
        
        const container = document.getElementById('canvas3D');
        if (!container) {
            console.error('Canvas not found');
            return false;
        }
        
        clock = new THREE.Clock();
        
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f0f23);
        scene.fog = new THREE.FogExp2(0x0f0f23, 0.04);
        
        // Camera
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || 400;
        camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.set(0, 1.4, 2.5);
        camera.lookAt(0, 1.2, 0);
        
        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: container,
            antialias: true,
            alpha: false,
            powerPreference: 'default'
        });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        
        // Lighting
        setupLighting();
        
        // Environment
        createEnvironment();
        
        // Create Avatar
        createAnimeAvatar();
        
        // Controls
        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 1.2;
            controls.maxDistance = 4;
            controls.maxPolarAngle = Math.PI / 1.8;
            controls.minPolarAngle = Math.PI / 4;
            controls.enablePan = false;
            controls.target.set(0, 1.2, 0);
        }
        
        // Start Animation Loop
        animate();
        
        // Resize Handler
        window.addEventListener('resize', onResize);
        
        console.log('✅ 3D World Ready');
        return true;
        
    } catch (error) {
        console.error('World Error:', error);
        showFallbackAvatar();
        return false;
    }
}

// ============================================
// LIGHTING SETUP
// ============================================
function setupLighting() {
    // Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    
    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);
    
    // Pink Fill Light
    const pinkLight = new THREE.PointLight(0xff6b9d, 0.7, 15);
    pinkLight.position.set(-3, 2, 3);
    scene.add(pinkLight);
    
    // Cyan Rim Light
    const cyanLight = new THREE.PointLight(0x00fff5, 0.7, 15);
    cyanLight.position.set(3, 2, -2);
    scene.add(cyanLight);
    
    // Bottom Fill
    const bottomLight = new THREE.PointLight(0x9966ff, 0.4, 10);
    bottomLight.position.set(0, -1, 2);
    scene.add(bottomLight);
    
    // Hemisphere
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x362c28, 0.4);
    scene.add(hemiLight);
}

// ============================================
// CREATE DETAILED ANIME AVATAR
// ============================================
function createAnimeAvatar() {
    console.log('👧 Creating anime avatar with animations...');
    
    avatar = new THREE.Group();
    avatar.name = 'Selina';
    
    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xffdbac,
        roughness: 0.5,
        metalness: 0.0
    });
    
    const hairMat = new THREE.MeshStandardMaterial({
        color: 0xff6b9d,
        roughness: 0.4,
        metalness: 0.1
    });
    
    const outfitMat = new THREE.MeshStandardMaterial({
        color: 0x87ceeb,
        roughness: 0.5,
        metalness: 0.0
    });
    
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e });
    const lipMat = new THREE.MeshStandardMaterial({ color: 0xff8a9e, roughness: 0.3 });
    
    // ========== HEAD ==========
    const headGroup = new THREE.Group();
    headGroup.name = 'head';
    
    const headGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.scale.set(1, 1.12, 0.92);
    head.castShadow = true;
    headGroup.add(head);
    
    // ========== EYES ==========
    // Left Eye Group
    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.name = 'leftEye';
    leftEyeGroup.position.set(-0.08, 0.04, 0.18);
    
    // Eye White
    const eyeWhiteGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, whiteMat);
    leftEyeWhite.scale.set(1, 1.4, 0.4);
    leftEyeGroup.add(leftEyeWhite);
    
    // Iris
    const irisGeo = new THREE.SphereGeometry(0.032, 16, 16);
    const leftIris = new THREE.Mesh(irisGeo, irisMat);
    leftIris.position.z = 0.02;
    leftIris.scale.set(1, 1.3, 1);
    leftEyeGroup.add(leftIris);
    
    // Pupil
    const pupilGeo = new THREE.SphereGeometry(0.018, 12, 12);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.z = 0.035;
    leftEyeGroup.add(leftPupil);
    
    // Highlights
    const highlightGeo = new THREE.SphereGeometry(0.01, 8, 8);
    const leftHighlight1 = new THREE.Mesh(highlightGeo, whiteMat);
    leftHighlight1.position.set(0.012, 0.015, 0.04);
    leftEyeGroup.add(leftHighlight1);
    
    const leftHighlight2 = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), whiteMat);
    leftHighlight2.position.set(-0.008, -0.01, 0.04);
    leftEyeGroup.add(leftHighlight2);
    
    // Eyelid (for blinking)
    const eyelidGeo = new THREE.SphereGeometry(0.048, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const eyelidMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, side: THREE.DoubleSide });
    const leftEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    leftEyelid.name = 'leftEyelid';
    leftEyelid.rotation.x = Math.PI;
    leftEyelid.scale.set(1, 1.4, 0.5);
    leftEyelid.position.z = 0.01;
    leftEyelid.visible = false;
    leftEyeGroup.add(leftEyelid);
    
    headGroup.add(leftEyeGroup);
    avatarParts.leftEye = leftEyeGroup;
    avatarParts.leftEyelid = leftEyelid;
    
    // Right Eye Group (clone)
    const rightEyeGroup = leftEyeGroup.clone();
    rightEyeGroup.name = 'rightEye';
    rightEyeGroup.position.x = 0.08;
    headGroup.add(rightEyeGroup);
    avatarParts.rightEye = rightEyeGroup;
    avatarParts.rightEyelid = rightEyeGroup.getObjectByName('leftEyelid');
    
    // ========== EYEBROWS ==========
    const browGeo = new THREE.CapsuleGeometry(0.008, 0.04, 4, 8);
    const browMat = new THREE.MeshBasicMaterial({ color: 0xcc5588 });
    
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.name = 'leftBrow';
    leftBrow.position.set(-0.08, 0.1, 0.17);
    leftBrow.rotation.z = -0.15;
    headGroup.add(leftBrow);
    avatarParts.leftBrow = leftBrow;
    
    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.name = 'rightBrow';
    rightBrow.position.set(0.08, 0.1, 0.17);
    rightBrow.rotation.z = 0.15;
    headGroup.add(rightBrow);
    avatarParts.rightBrow = rightBrow;
    
    // ========== NOSE ==========
    const noseGeo = new THREE.ConeGeometry(0.012, 0.03, 8);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, -0.03, 0.2);
    nose.rotation.x = 0.3;
    headGroup.add(nose);
    
    // ========== MOUTH (FOR LIP SYNC) ==========
    const mouthGroup = new THREE.Group();
    mouthGroup.name = 'mouth';
    mouthGroup.position.set(0, -0.08, 0.19);
    
    // Upper Lip
    const upperLipGeo = new THREE.TorusGeometry(0.03, 0.008, 8, 16, Math.PI);
    const upperLip = new THREE.Mesh(upperLipGeo, lipMat);
    upperLip.name = 'upperLip';
    upperLip.rotation.x = -0.1;
    upperLip.rotation.z = Math.PI;
    mouthGroup.add(upperLip);
    
    // Lower Lip
    const lowerLipGeo = new THREE.TorusGeometry(0.028, 0.007, 8, 16, Math.PI);
    const lowerLip = new THREE.Mesh(lowerLipGeo, lipMat);
    lowerLip.name = 'lowerLip';
    lowerLip.position.y = -0.01;
    lowerLip.rotation.x = 0.1;
    mouthGroup.add(lowerLip);
    
    // Mouth Interior (visible when open)
    const mouthInteriorGeo = new THREE.SphereGeometry(0.02, 12, 12);
    const mouthInteriorMat = new THREE.MeshBasicMaterial({ color: 0x3d1f1f });
    const mouthInterior = new THREE.Mesh(mouthInteriorGeo, mouthInteriorMat);
    mouthInterior.name = 'mouthInterior';
    mouthInterior.position.set(0, -0.005, -0.01);
    mouthInterior.scale.set(1.2, 0.5, 0.5);
    mouthGroup.add(mouthInterior);
    
    headGroup.add(mouthGroup);
    avatarParts.mouth = mouthGroup;
    avatarParts.upperLip = upperLip;
    avatarParts.lowerLip = lowerLip;
    avatarParts.mouthInterior = mouthInterior;
    
    // ========== BLUSH ==========
    const blushGeo = new THREE.CircleGeometry(0.022, 16);
    const blushMat = new THREE.MeshBasicMaterial({ 
        color: 0xffaaaa, 
        transparent: true, 
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.12, -0.03, 0.18);
    leftBlush.rotation.y = 0.3;
    headGroup.add(leftBlush);
    
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.12, -0.03, 0.18);
    rightBlush.rotation.y = -0.3;
    headGroup.add(rightBlush);
    
    // ========== EARS ==========
    const earGeo = new THREE.SphereGeometry(0.035, 16, 16);
    
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.2, 0, 0);
    leftEar.scale.set(0.5, 1, 0.6);
    headGroup.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.2, 0, 0);
    rightEar.scale.set(0.5, 1, 0.6);
    headGroup.add(rightEar);
    
    // Position head group
    headGroup.position.y = 1.48;
    avatar.add(headGroup);
    avatarParts.head = headGroup;
    
    // ========== HAIR ==========
    const hairGroup = new THREE.Group();
    hairGroup.name = 'hair';
    
    // Main Hair Volume
    const mainHairGeo = new THREE.SphereGeometry(0.26, 32, 32);
    const mainHair = new THREE.Mesh(mainHairGeo, hairMat);
    mainHair.position.set(0, 0.1, -0.05);
    mainHair.scale.set(1.05, 1.1, 1);
    mainHair.castShadow = true;
    hairGroup.add(mainHair);
    
    // Back Hair
    const backHairGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const backHair = new THREE.Mesh(backHairGeo, hairMat);
    backHair.position.set(0, -0.08, -0.15);
    backHair.scale.set(1, 1.5, 0.8);
    backHair.castShadow = true;
    hairGroup.add(backHair);
    
    // Bangs
    for (let i = 0; i < 7; i++) {
        const bangGeo = new THREE.ConeGeometry(0.032, 0.16, 8);
        const bang = new THREE.Mesh(bangGeo, hairMat);
        const x = (i - 3) * 0.048;
        bang.position.set(x, 0.12, 0.14);
        bang.rotation.x = 0.35 + Math.random() * 0.15;
        bang.rotation.z = (Math.random() - 0.5) * 0.15;
        bang.castShadow = true;
        hairGroup.add(bang);
    }
    
    // Side Hair Strands (animated)
    const sideHairParts = [];
    [-1, 1].forEach(side => {
        const sideGroup = new THREE.Group();
        sideGroup.name = side < 0 ? 'leftSideHair' : 'rightSideHair';
        
        for (let i = 0; i < 4; i++) {
            const strandGeo = new THREE.ConeGeometry(0.025, 0.18 + i * 0.04, 8);
            const strand = new THREE.Mesh(strandGeo, hairMat);
            strand.position.set(
                side * (0.16 + i * 0.015),
                -0.03 - i * 0.07,
                0.02 - i * 0.025
            );
            strand.rotation.z = side * (0.25 + i * 0.08);
            strand.rotation.x = 0.15;
            strand.castShadow = true;
            sideGroup.add(strand);
        }
        
        hairGroup.add(sideGroup);
        sideHairParts.push(sideGroup);
    });
    
    avatarParts.sideHair = sideHairParts;
    
    // Twin Tails
    const twinTails = [];
    [-0.14, 0.14].forEach((x, idx) => {
        const tailGroup = new THREE.Group();
        tailGroup.name = idx === 0 ? 'leftTail' : 'rightTail';
        
        for (let i = 0; i < 6; i++) {
            const segGeo = new THREE.SphereGeometry(0.055 - i * 0.007, 12, 12);
            const seg = new THREE.Mesh(segGeo, hairMat);
            seg.position.y = -i * 0.1;
            seg.scale.set(0.7, 1.1, 0.7);
            seg.castShadow = true;
            tailGroup.add(seg);
        }
        
        tailGroup.position.set(x, -0.03, -0.08);
        tailGroup.rotation.z = x < 0 ? 0.18 : -0.18;
        hairGroup.add(tailGroup);
        twinTails.push(tailGroup);
    });
    
    avatarParts.twinTails = twinTails;
    
    hairGroup.position.y = 1.48;
    avatar.add(hairGroup);
    avatarParts.hair = hairGroup;
    
    // ========== RIBBON ==========
    const ribbonGeo = new THREE.TorusGeometry(0.05, 0.012, 8, 16);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xff1493, roughness: 0.3 });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.set(0.17, 1.63, -0.06);
    ribbon.rotation.set(0.4, 0.4, 0.2);
    avatar.add(ribbon);
    
    // Ribbon Tails
    [-1, 1].forEach(dir => {
        const tailGeo = new THREE.ConeGeometry(0.018, 0.1, 8);
        const tail = new THREE.Mesh(tailGeo, ribbonMat);
        tail.position.set(0.17 + dir * 0.035, 1.56, -0.06);
        tail.rotation.z = dir * 0.4;
        avatar.add(tail);
    });
    
    // ========== NECK ==========
    const neckGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.1, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.32;
    neck.castShadow = true;
    avatar.add(neck);
    avatarParts.neck = neck;
    
    // ========== BODY ==========
    const bodyGroup = new THREE.Group();
    bodyGroup.name = 'body';
    
    const bodyGeo = new THREE.CapsuleGeometry(0.15, 0.32, 12, 16);
    const body = new THREE.Mesh(bodyGeo, outfitMat);
    body.position.y = 1.0;
    body.castShadow = true;
    bodyGroup.add(body);
    
    // Chest
    const chestGeo = new THREE.SphereGeometry(0.09, 16, 16);
    [-0.06, 0.06].forEach(x => {
        const chest = new THREE.Mesh(chestGeo, outfitMat);
        chest.position.set(x, 1.05, 0.08);
        chest.scale.set(0.8, 0.85, 0.55);
        bodyGroup.add(chest);
    });
    
    // Collar
    const collarGeo = new THREE.TorusGeometry(0.08, 0.018, 8, 16);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, 1.22, 0.04);
    collar.rotation.x = Math.PI / 2 + 0.25;
    bodyGroup.add(collar);
    
    avatar.add(bodyGroup);
    avatarParts.body = bodyGroup;
    
    // ========== ARMS ==========
    createArm(-1, avatar, skinMat, outfitMat);
    createArm(1, avatar, skinMat, outfitMat);
    
    // ========== SKIRT ==========
    const skirtGeo = new THREE.ConeGeometry(0.26, 0.32, 32, 1, true);
    const skirt = new THREE.Mesh(skirtGeo, outfitMat);
    skirt.position.y = 0.58;
    skirt.castShadow = true;
    avatar.add(skirt);
    avatarParts.skirt = skirt;
    
    // Skirt Ruffle
    const ruffleGeo = new THREE.TorusGeometry(0.26, 0.015, 8, 32);
    const ruffleMat = new THREE.MeshStandardMaterial({ color: 0x6ab3f0, roughness: 0.4 });
    const ruffle = new THREE.Mesh(ruffleGeo, ruffleMat);
    ruffle.position.y = 0.43;
    ruffle.rotation.x = Math.PI / 2;
    avatar.add(ruffle);
    
    // ========== LEGS ==========
    const legGeo = new THREE.CapsuleGeometry(0.045, 0.32, 8, 12);
    const sockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    
    [-0.09, 0.09].forEach(x => {
        // Upper Leg
        const upperLeg = new THREE.Mesh(legGeo, skinMat);
        upperLeg.position.set(x, 0.35, 0);
        upperLeg.scale.set(1, 0.65, 1);
        upperLeg.castShadow = true;
        avatar.add(upperLeg);
        
        // Lower Leg (Sock)
        const lowerLegGeo = new THREE.CapsuleGeometry(0.042, 0.18, 8, 12);
        const lowerLeg = new THREE.Mesh(lowerLegGeo, sockMat);
        lowerLeg.position.set(x, 0.12, 0);
        lowerLeg.castShadow = true;
        avatar.add(lowerLeg);
    });
    
    // ========== SHOES ==========
    const shoeGeo = new THREE.BoxGeometry(0.07, 0.035, 0.1);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3 });
    
    [-0.09, 0.09].forEach(x => {
        const shoe = new THREE.Mesh(shoeGeo, shoeMat);
        shoe.position.set(x, 0.018, 0.015);
        shoe.castShadow = true;
        avatar.add(shoe);
    });
    
    // ========== GLOW EFFECT ==========
    const glowGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff6b9d,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 1.48;
    glow.scale.set(1.15, 1.25, 1.15);
    avatar.add(glow);
    
    // Store materials for outfit change
    window.outfitMaterial = outfitMat;
    window.hairMaterial = hairMat;
    
    scene.add(avatar);
    console.log('✅ Anime avatar with animations created');
}

// ========== CREATE ARM ==========
function createArm(side, parent, skinMat, outfitMat) {
    const x = side * 0.2;
    
    // Shoulder
    const shoulderGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const shoulder = new THREE.Mesh(shoulderGeo, outfitMat);
    shoulder.position.set(x, 1.14, 0);
    parent.add(shoulder);
    
    // Upper Arm
    const upperArmGeo = new THREE.CapsuleGeometry(0.032, 0.14, 8, 12);
    const upperArm = new THREE.Mesh(upperArmGeo, skinMat);
    upperArm.position.set(x * 1.08, 1.0, 0);
    upperArm.rotation.z = side * 0.22;
    upperArm.castShadow = true;
    parent.add(upperArm);
    
    // Lower Arm
    const lowerArmGeo = new THREE.CapsuleGeometry(0.028, 0.13, 8, 12);
    const lowerArm = new THREE.Mesh(lowerArmGeo, skinMat);
    lowerArm.position.set(x * 1.18, 0.84, 0.04);
    lowerArm.rotation.z = side * 0.12;
    lowerArm.rotation.x = -0.18;
    lowerArm.castShadow = true;
    parent.add(lowerArm);
    
    // Hand
    const handGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const hand = new THREE.Mesh(handGeo, skinMat);
    hand.position.set(x * 1.22, 0.7, 0.06);
    hand.scale.set(0.8, 1, 0.6);
    hand.castShadow = true;
    parent.add(hand);
    
    if (side < 0) {
        avatarParts.leftArm = { upperArm, lowerArm, hand };
    } else {
        avatarParts.rightArm = { upperArm, lowerArm, hand };
    }
}

// ============================================
// LIP SYNC ANIMATION
// ============================================
function startLipSync() {
    isSpeaking = true;
    document.getElementById('speakingIndicator')?.classList.remove('hidden');
}

function stopLipSync() {
    isSpeaking = false;
    animationState.mouthOpen = 0;
    document.getElementById('speakingIndicator')?.classList.add('hidden');
}

function updateLipSync(delta) {
    if (!avatarParts.mouth) return;
    
    if (isSpeaking) {
        // Random mouth movement for speaking
        const targetOpen = Math.sin(Date.now() * 0.015) * 0.5 + 
                          Math.sin(Date.now() * 0.023) * 0.3 + 0.3;
        animationState.mouthOpen += (targetOpen - animationState.mouthOpen) * 0.3;
    } else {
        // Close mouth smoothly
        animationState.mouthOpen *= 0.85;
    }
    
    const mouthOpen = Math.max(0, Math.min(1, animationState.mouthOpen));
    
    // Animate mouth parts
    if (avatarParts.lowerLip) {
        avatarParts.lowerLip.position.y = -0.01 - mouthOpen * 0.025;
        avatarParts.lowerLip.scale.y = 1 + mouthOpen * 0.3;
    }
    
    if (avatarParts.upperLip) {
        avatarParts.upperLip.position.y = mouthOpen * 0.008;
    }
    
    if (avatarParts.mouthInterior) {
        avatarParts.mouthInterior.scale.y = 0.5 + mouthOpen * 0.8;
        avatarParts.mouthInterior.visible = mouthOpen > 0.15;
    }
}

// ============================================
// BLINKING ANIMATION
// ============================================
function updateBlinking(delta) {
    blinkTimer += delta;
    
    // Blink every 3-6 seconds
    const blinkInterval = 3 + Math.random() * 3;
    
    if (blinkTimer > blinkInterval) {
        blinkTimer = 0;
        doBlink();
    }
}

function doBlink() {
    if (!avatarParts.leftEye || !avatarParts.rightEye) return;
    
    const blinkDuration = 150; // ms
    
    // Close eyes
    animationState.eyesClosed = 1;
    avatarParts.leftEye.scale.y = 0.1;
    avatarParts.rightEye.scale.y = 0.1;
    
    // Open eyes after delay
    setTimeout(() => {
        avatarParts.leftEye.scale.y = 1;
        avatarParts.rightEye.scale.y = 1;
        animationState.eyesClosed = 0;
    }, blinkDuration);
}

// ============================================
// BREATHING ANIMATION
// ============================================
function updateBreathing(delta) {
    animationState.breathOffset = Math.sin(Date.now() * 0.0015) * 0.015;
    
    if (avatarParts.body) {
        avatarParts.body.scale.x = 1 + animationState.breathOffset * 0.5;
        avatarParts.body.scale.z = 1 + animationState.breathOffset * 0.5;
    }
    
    if (avatar) {
        avatar.position.y = animationState.breathOffset;
    }
}

// ============================================
// HAIR PHYSICS
// ============================================
function updateHairPhysics(delta) {
    const time = Date.now() * 0.001;
    animationState.hairSwing = Math.sin(time * 0.8) * 0.05;
    
    // Side Hair
    if (avatarParts.sideHair) {
        avatarParts.sideHair.forEach((sideGroup, idx) => {
            const dir = idx === 0 ? 1 : -1;
            sideGroup.rotation.z = dir * animationState.hairSwing * 0.5;
            sideGroup.rotation.x = Math.sin(time * 1.2 + idx) * 0.03;
        });
    }
    
    // Twin Tails
    if (avatarParts.twinTails) {
        avatarParts.twinTails.forEach((tail, idx) => {
            const dir = idx === 0 ? 1 : -1;
            tail.rotation.z = dir * (0.18 + Math.sin(time * 1.5 + idx * 2) * 0.08);
            tail.rotation.x = Math.sin(time * 1.1 + idx) * 0.05;
            
            // Animate each segment
            tail.children.forEach((seg, segIdx) => {
                seg.rotation.z = Math.sin(time * 1.8 + segIdx * 0.3) * 0.04 * (segIdx + 1);
            });
        });
    }
}

// ============================================
// HEAD & BODY IDLE ANIMATION
// ============================================
function updateIdleAnimation(delta) {
    const time = Date.now() * 0.001;
    
    // Head tilt
    if (avatarParts.head) {
        avatarParts.head.rotation.z = Math.sin(time * 0.5) * 0.04;
        avatarParts.head.rotation.y = Math.sin(time * 0.3) * 0.06;
    }
    
    // Hair follows head
    if (avatarParts.hair && avatarParts.head) {
        avatarParts.hair.rotation.z = avatarParts.head.rotation.z;
        avatarParts.hair.rotation.y = avatarParts.head.rotation.y;
    }
    
    // Subtle body sway
    if (avatar) {
        avatar.rotation.y = Math.sin(time * 0.4) * 0.05;
    }
    
    // Eyebrow expressions (occasional)
    if (avatarParts.leftBrow && avatarParts.rightBrow) {
        const browRaise = Math.sin(time * 0.2) * 0.005;
        avatarParts.leftBrow.position.y = 0.1 + browRaise;
        avatarParts.rightBrow.position.y = 0.1 + browRaise;
    }
}

// ============================================
// EMOTION ANIMATION
// ============================================
function setEmotion(emotion) {
    const icon = document.getElementById('emotionIcon');
    const label = document.getElementById('emotionLabel');
    
    const emotions = {
        happy: { icon: '😊', label: 'Happy', browY: 0.1 },
        excited: { icon: '✨', label: 'Excited', browY: 0.12 },
        thinking: { icon: '🤔', label: 'Thinking', browY: 0.08 },
        love: { icon: '💖', label: 'Loving', browY: 0.11 },
        surprised: { icon: '😮', label: 'Surprised', browY: 0.14 },
        listening: { icon: '👂', label: 'Listening', browY: 0.1 },
        speaking: { icon: '💬', label: 'Speaking', browY: 0.1 }
    };
    
    const e = emotions[emotion] || emotions.happy;
    
    if (icon) icon.textContent = e.icon;
    if (label) label.textContent = e.label;
    
    // Animate eyebrows based on emotion
    if (avatarParts.leftBrow && avatarParts.rightBrow) {
        avatarParts.leftBrow.position.y = e.browY;
        avatarParts.rightBrow.position.y = e.browY;
    }
}

// ============================================
// ENVIRONMENT
// ============================================
function createEnvironment() {
    // Ground
    const groundGeo = new THREE.CircleGeometry(20, 64);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Grid
    const grid = new THREE.GridHelper(30, 30, 0xff6b9d, 0x00fff5);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    scene.add(grid);
    
    // Particles
    createParticles();
}

function createParticles() {
    const particlesGeo = new THREE.BufferGeometry();
    const count = 600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 25;
        positions[i + 1] = Math.random() * 15;
        positions[i + 2] = (Math.random() - 0.5) * 25;
        
        const color = Math.random() > 0.5 ? 
            new THREE.Color(0xff6b9d) : 
            new THREE.Color(0x00fff5);
        
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }
    
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMat = new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeo, particlesMat);
    particles.name = 'particles';
    scene.add(particles);
}

// ============================================
// ANIMATION LOOP
// ============================================
function animate() {
    requestAnimationFrame(animate);
    
    if (!renderer || !scene || !camera) return;
    
    const delta = clock.getDelta();
    
    // Update controls
    if (controls) controls.update();
    
    // Run all animations
    updateLipSync(delta);
    updateBlinking(delta);
    updateBreathing(delta);
    updateHairPhysics(delta);
    updateIdleAnimation(delta);
    
    // Animate particles
    const particles = scene.getObjectByName('particles');
    if (particles) {
        particles.rotation.y += 0.0002;
        
        const positions = particles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.004;
            if (positions[i] < 0) positions[i] = 15;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    renderer.render(scene, camera);
}

// ============================================
// OUTFIT CHANGE
// ============================================
function changeOutfit(style) {
    const colors = {
        casual: { outfit: 0x87ceeb, hair: 0xff6b9d },
        school: { outfit: 0xe74c3c, hair: 0xff6b9d },
        formal: { outfit: 0x9b59b6, hair: 0x9966cc },
        cyber: { outfit: 0x00fff5, hair: 0x00ffff },
        kimono: { outfit: 0xff6b9d, hair: 0xff69b4 },
        sport: { outfit: 0x2ecc71, hair: 0xff6b9d }
    };
    
    const c = colors[style];
    if (c) {
        if (window.outfitMaterial) window.outfitMaterial.color.setHex(c.outfit);
        if (window.hairMaterial) window.hairMaterial.color.setHex(c.hair);
        showToast(`Outfit: ${style} 👗`);
    }
}

// ============================================
// SCENE CHANGE
// ============================================
function changeScene(sceneType) {
    const scenes = {
        city: { bg: 0x0f0f23, fog: 0x1a1a2e },
        park: { bg: 0x87ceeb, fog: 0xb0e0e6 },
        beach: { bg: 0xff8c69, fog: 0xffa07a },
        space: { bg: 0x000011, fog: 0x000022 }
    };
    
    const s = scenes[sceneType];
    if (s && scene) {
        scene.background = new THREE.Color(s.bg);
        scene.fog = new THREE.FogExp2(s.fog, 0.04);
        currentScene = sceneType;
        showToast(`Scene: ${sceneType} 🌍`);
    }
}

// ============================================
// RESIZE
// ============================================
function onResize() {
    if (!camera || !renderer) return;
    
    const container = document.getElementById('canvas3D');
    if (!container) return;
    
    const w = container.clientWidth;
    const h = container.clientHeight;
    
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

// ============================================
// FALLBACK 2D AVATAR
// ============================================
function showFallbackAvatar() {
    const container = document.getElementById('worldContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background:linear-gradient(180deg,#1a0033 0%,#0f0f23 100%);">
            <div style="text-align:center;animation:floatAnim 3s ease-in-out infinite;">
                <div style="width:150px;height:150px;margin:0 auto 20px;background:linear-gradient(135deg,#ff6b9d,#c44569);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:4rem;box-shadow:0 15px 50px rgba(255,107,157,0.5);">💖</div>
                <h2 style="color:#ff6b9d;font-size:1.6rem;margin-bottom:10px;">Selina AI</h2>
                <p style="color:#00fff5;font-size:0.95rem;">Created by Ashen Editz</p>
            </div>
        </div>
        <style>@keyframes floatAnim{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}</style>
    `;
}

// Export functions
window.initWorld = initWorld;
window.changeOutfit = changeOutfit;
window.changeScene = changeScene;
window.setEmotion = setEmotion;
window.startLipSync = startLipSync;
window.stopLipSync = stopLipSync;

console.log('✅ World Engine loaded');