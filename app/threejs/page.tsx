/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import TWEEN, { Tween } from '@tweenjs/tween.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import styles from '@/app/ui/threejs/threejs.module.css'

const BOOK_WIDTH = 8.42 / 2
const BOOK_HEIGHT = 5.96 / 4
const THICKNESS = 0.005

const getRandomColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  // return color
  return '#4E5F52'
}

const Home = () => {
  const bookInfo = {
    page: 0,
    totalThickness: 0,
    currentPage: 0,
  }
  const [showLoading, setShowLoading] = useState(true)
  const [isStart, setIsStart] = useState(false)
  const [checkCurrentPage, setCheckCurrentPage] = useState(0)
  const [bgColor, setBgColor] = useState('blue')
  const refRenderer = useRef<any>(null)
  const threejsEl = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const scene = new THREE.Scene()
  const manager = new THREE.LoadingManager()
  const loader = new THREE.TextureLoader(manager)
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const defaultMaterial = new THREE.MeshBasicMaterial({ color: '#7e6944' })

  // 清理函数
  const cleanup = () => {
    if (refRenderer.current) {
      refRenderer.current.dispose()
      refRenderer.current.forceContextLoss()
      refRenderer.current.domElement.remove()
      refRenderer.current = null
    }
  }
  useEffect(() => {
    cleanup()
    refRenderer.current = new THREE.WebGLRenderer({
      alpha: true,
    })
    initScene()
    animate()
    addBook(getImages())
    return () => {
      // 在组件卸载时，记得清理渲染器和其他资源
      refRenderer.current.dispose()
    }
  }, [])

  useEffect(() => {
    setBgColor(getRandomColor())
  }, [checkCurrentPage])

  const getImages = () => {
    const arr: any[] = []
    for (let i = 1; i <= 64; i++) {
      arr.push(`/assets/images/threejs/book/book-${i}.jpg`)
    }
    return arr
  }

  const generateManager = () => {
    const progressBarEl = document.querySelector(`.${styles.progressBar}`) as HTMLDivElement
    // 监听加载进度事件
    manager.onProgress = function(url, itemsLoaded, itemsTotal) {
      const progress = itemsLoaded / itemsTotal
      if (progressBarEl) {
        progressBarEl.style.width = `${progress * 100}%`
      }
    }
    // 监听加载完成事件
    manager.onLoad = function() {
      setShowLoading(false)
    }
  }

  const generateBook = (frontPage, backPage, thickness = THICKNESS) => {
    const geometry = new THREE.BoxGeometry((BOOK_WIDTH * 2) / 2, BOOK_HEIGHT * 2, thickness)
    const material = [
      defaultMaterial,
      defaultMaterial,
      defaultMaterial,
      defaultMaterial,
      new THREE.MeshStandardMaterial({ map: loader.load(backPage), roughness: 1 }),
      new THREE.MeshStandardMaterial({ map: loader.load(frontPage), roughness: 1 }),
    ]
    const book = new THREE.Mesh(geometry, material)
    book.name = `页面${bookInfo.page}`
    bookInfo.page += 1
    book.rotation.y = Math.PI
    book.position.x = BOOK_WIDTH / 2
    const pivot = new THREE.Object3D()
    pivot.position.z = -bookInfo.totalThickness
    bookInfo.totalThickness += thickness
    pivot.add(book)
    return pivot
  }

  const addControls = () => {
    const controls = new OrbitControls(cameraRef.current, refRenderer.current.domElement)
    // 限制相机的缩放范围
    controls.minDistance = 0
    controls.maxDistance = 10
    // 限制相机的水平旋转范围
    controls.minAzimuthAngle = -Math.PI / 4 // -45度
    controls.maxAzimuthAngle = Math.PI / 4 // 45度
    controls.update()
    return controls
  }
  const addBook = (images: any) => {
    const books: any[] = []
    for (let i = 0; i < images.length; i += 2) {
      books.push({ frontPage: images[i], backPage: images[i + 1] })
    }
    const bookObjects = books.map((bookData: any) => {
      const { frontPage, backPage } = bookData
      const book = generateBook(frontPage, backPage)
      scene.add(book)
      return book
    })
    return bookObjects
  }

  const addLight = () => {
    // 使用平行光代替聚光灯，提供更均匀的照明
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
    directionalLight.position.set(0, 0, 5)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.9)
    directionalLight2.position.set(0, 5, 0)

    scene.add(ambientLight)
    scene.add(directionalLight)
    scene.add(directionalLight2)
  }

  const initScene = () => {
    // 在这里初始化 camera
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    cameraRef.current.position.z = 5

    refRenderer.current.setSize(window.innerWidth, window.innerHeight)
    threejsEl?.current?.appendChild(refRenderer.current.domElement)
    addLight()
    addControls()
    generateManager()
  }

  const animate = () => {
    TWEEN.update()
    requestAnimationFrame(animate)
    refRenderer.current.render(scene, cameraRef.current)
  }

  const onMouseClick = (event: any) => {
    // 将鼠标点击位置的屏幕坐标转换为three.js的标准坐标
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    // 通过raycaster检测鼠标点击的物体
    raycaster.setFromCamera(mouse, cameraRef.current)
    const intersects = raycaster.intersectObjects(scene.children)
    // 如果有物体被点击
    if (intersects.length > 0) {
      const book = intersects[0].object.parent
      if (book) {
        const relativePosition = intersects[0].point.sub(book.position)
        const targetRotation =
          book.rotation.y === 0 ? book.rotation.y - Math.PI : book.rotation.y + Math.PI // 计算目标旋转角度
        const isOutOfRange =
          (book.rotation.y === 0 && relativePosition.x > 2.6) ||
          (book.rotation.y !== 0 && relativePosition.x < -2.6)
        if (isOutOfRange) {
          let isFunctionCalled = false
          const turnRight = book.rotation.y === 0
          const TURN_PAGE_VALUE = -Math.ceil((Math.PI * 100) / 2)
          new Tween(book.rotation)
            .to({ y: targetRotation }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
              if (
                Math.ceil(book.rotation.y * 100) < TURN_PAGE_VALUE &&
                !isFunctionCalled &&
                turnRight
              ) {
                isFunctionCalled = true
                bookInfo.currentPage += 1
                setCheckCurrentPage(pre => pre + 1)
                book.position.z =
                  book.position.z -
                  (bookInfo.page - (bookInfo.currentPage - 1)) * THICKNESS +
                  bookInfo.currentPage * THICKNESS
              }
              if (
                Math.ceil(book.rotation.y * 100) > TURN_PAGE_VALUE &&
                !isFunctionCalled &&
                !turnRight
              ) {
                isFunctionCalled = true
                book.position.z =
                  book.position.z +
                  (bookInfo.page - bookInfo.currentPage + 1) * THICKNESS -
                  bookInfo.currentPage * THICKNESS
                bookInfo.currentPage -= 1
                setCheckCurrentPage(pre => pre - 1)
              }
            })
            .start()
        }
      }
    }
  }

  useEffect(() => {
    // 将 window 事件监听器移动到 useEffect 中
    window.addEventListener('click', onMouseClick, false)

    // 清理函数
    return () => {
      window.removeEventListener('click', onMouseClick, false)
    }
  }, []) // 确保在组件挂载时添加事件监听器

  return (
    <div>
      {!isStart ? (
        <div className={styles.loading}>
          <div className={styles.progressBarContainer}>
            <div className={styles.loadingWrap}>
              <img className={styles.loadingBg} src={'/assets/images/threejs/loading.png'} alt="" />
              <div className={styles.progressBar} />
              <div className={styles.loadingText}>
                {showLoading ? (
                  <div>Loading</div>
                ) : (
                  <div
                    className={styles.blink}
                    onClick={() => {
                      setIsStart(true)
                    }}
                  >
                    · Enter ·
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div
        className={styles.container}
        style={{ backgroundImage: `linear-gradient(${bgColor}, rgb(0, 0, 0))` }}
        ref={threejsEl}
      />
    </div>
  )
}

export default Home
