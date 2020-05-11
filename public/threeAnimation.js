import {visibleHeightAtZDepth, visibleWidthAtZDepth, lerp} from "../utils.js"
import {nextSlide, prevSlide} from "../main.js"

const raycaster = new THREE.Raycaster()
const objLoader = new THREE.OBJLoader()

let arrowBoxUp = null
let arrowBoxDown = null
let arrowBoxUpRotation = 0
let arrowBoxDownRotation = 0

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight)

const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
renderer.setSize(window.innerWidth, window.innerHeight)
// renderer.render(scene, camera)

document.body.append(renderer.domElement)

objLoader.load(
    'models/cube.obj',
    ({children}) => {
      const screenBorderRight = visibleWidthAtZDepth(-10, camera) / 2
      const screenBottom = -visibleHeightAtZDepth(-10, camera) / 2

      addCube(children[0], nextSlide, screenBorderRight - 1.5, screenBottom + 1)
      addCube(children[0], prevSlide, screenBorderRight - 2.5, screenBottom + 1, true)

      animate()
    }
)

const addCube = (object, callbackFn, x, y, reversed) => {
  const cubeMesh = object.clone()

  cubeMesh.scale.setScalar(.3)
  reversed ? cubeMesh.rotation.set(THREE.Math.degToRad(270),0,330) : cubeMesh.rotation.set(THREE.Math.degToRad(90),0,0)
  
  const boundingBox = new THREE.Mesh(
      new THREE.BoxGeometry(.7, .7, .7),
      new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
  )

  boundingBox.position.x = x
  boundingBox.position.y = y
  boundingBox.position.z = -10

  boundingBox.add(cubeMesh)

  boundingBox.callbackFn = callbackFn

  reversed ? arrowBoxDown = boundingBox : arrowBoxUp  = boundingBox
  scene.add(boundingBox)
}

const animate = () => {
  arrowBoxUpRotation = lerp(arrowBoxUpRotation, 0, .07)
  arrowBoxUp.rotation.set(THREE.Math.degToRad(arrowBoxUpRotation), 0, 0)

  arrowBoxDownRotation = lerp(arrowBoxDownRotation, 0, .07)
  arrowBoxDown.rotation.set(THREE.Math.degToRad(arrowBoxDownRotation), 0, 0)

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

export const handleThreeAnimation = () => {
}

window.addEventListener('click', () => {
  const mousePosition = new THREE.Vector2()
  mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
  mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mousePosition, camera)

  const intersectedObjects = raycaster.intersectObjects(scene.children)
  intersectedObjects.length && intersectedObjects[0].object.callbackFn()

  if (raycaster.intersectObjects([arrowBoxUp]).length) {
    arrowBoxUpRotation = 360
  } else if (raycaster.intersectObjects([arrowBoxDown]).length){
    arrowBoxDownRotation = -360
  }
})


