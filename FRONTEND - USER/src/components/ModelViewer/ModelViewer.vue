<template>
  <div ref="container" class="model-3d-floating">
    <div class="model-list">
      <button
        v-for="(m, index) in models"
        :key="index"
        :class="{ active: index === currentModelIndex }"
        @click="selectModel(index)"
      >
        {{ m.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits } from "vue"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

const container = ref(null)
const emit = defineEmits(["model-loaded"])

let scene, camera, renderer, controls, clock
let model, mixer
let animationId

// Danh sách model
const models = [
  { name: "iPhone 17 Pro Max", path: "/models/Model Iphone 17 Pro Max.glb" },
  { name: "iPhone 17 Air", path: "/models/Model Iphone 17 Air.glb" },
  { name: "Galaxy S25 Ultra", path: "/models/Model Samsung S25 Ultra.glb" }
]

let currentModelIndex = ref(0)

// Hàm chuẩn hóa model
function normalizeModel(model, targetHeight = 1.2) {
  const box = new THREE.Box3().setFromObject(model)
  const size = new THREE.Vector3()
  box.getSize(size)

  const scale = targetHeight / size.y
  model.scale.setScalar(scale)

  const center = box.getCenter(new THREE.Vector3())
  model.position.sub(center.multiplyScalar(scale))
  model.position.y += targetHeight / 2
}

// Hàm load model theo index
function loadModel(index) {
  if (!scene) return
  if (model) {
    scene.remove(model)
    mixer = null
  }

  const loader = new GLTFLoader()
  loader.load(models[index].path, (gltf) => {
    model = gltf.scene
    normalizeModel(model)
    scene.add(model)

    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model)
      mixer.clipAction(gltf.animations[0]).play()
    }

    emit("model-loaded")
    console.log(`${models[index].name} loaded`)
  })
}

// Chọn model khi click
function selectModel(index) {
  currentModelIndex.value = index
  loadModel(index)
}

// Resize
function onResize() {
  if (!container.value) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

// Animation loop
function animate() {
  animationId = requestAnimationFrame(animate)
  const delta = clock.getDelta()
  if (mixer) mixer.update(delta)
  controls.update()
  renderer.render(scene, camera)
}

onMounted(() => {
  clock = new THREE.Clock()

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)

  const { clientWidth: w, clientHeight: h } = container.value
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
  camera.position.set(0, 1.2, 2.8)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.value.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 1.2))
  const dir = new THREE.DirectionalLight(0xffffff, 2)
  dir.position.set(3, 6, 4)
  scene.add(dir)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 2
  controls.maxDistance = 4
  controls.target.set(0, 0.8, 0)

  window.addEventListener("resize", onResize)

  // Load model đầu tiên
  loadModel(currentModelIndex.value)

  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener("resize", onResize)
  controls?.dispose()
  renderer?.dispose()
  scene?.clear()
})
</script>

<style scoped>
.model-3d-floating {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 320px;
  height: 450px;
  border-radius: 16px;
  overflow: hidden;
  background: radial-gradient(circle at top, #f0f0f0, #d9d9d9);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.model-list button {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: #fff;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.model-list button.active {
  background: #4a90e2;
  color: #fff;
}



</style>
