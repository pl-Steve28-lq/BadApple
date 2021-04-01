import { BaseCanvasApp } from './BaseApp.js'
import { 
  KeyboardManager, MouseManager,
  RGB, int, rand
} from './Utils.js'

class App extends BaseCanvasApp {
  constructor() { super() }
  
  init() {
    this.km = new KeyboardManager()
    this.km.setOnKeyPressListener(this.keyEvent.bind(this))

    this.mm = new MouseManager()
    this.mm.setOnClickListener(this.toggleVideo.bind(this))

    console.log(this.Width, this.Height)

    this.initialized = false
    this.video = document.createElement('video')
    this.video.src = '../BadApple.mp4'

    this.video.addEventListener('loadeddata', () => {
      console.log("Load Complete!")
    }, false)
  }

  toggleVideo() {
    let init = this.initialized
    if (init) this.video.pause()
    else this.video.play()

    this.initialized = !init
  }

  keyEvent(k) {
    if (k == "Enter") this.toggleVideo()
    else if (k == " ") this.video.currentTime = 0
    else return
  }

  initializeLetters() {
    this.letter = []

    let alphabet = "abcdefghijklmnopqrstuvwxyz1234567890;'\"=+-_[]{}()~"
    let W = int(this.Width/15), H = int(this.Height/20)
    let i = 0, w = this.Width/W, h = this.Height/H
    for (let _ of new Array(W*H)) {
      let a = alphabet[rand()*alphabet.length | 0]
      this.letter.push({
        key: a,
        x: w*(i%W) + rand()*(this.Width/25),
        y: h*((i/W)|0) + rand()*(this.Height/25),
        clr: "black"
      })
      i += 1
    }
  }

  drawFrame() {
    let W = this.Width, H = this.Height
    let w = int(W/2), h = int(H/2)
    this.videoCtx.drawImage(this.video, 0, 0, w, h)
    this.ctx.drawImage(this.video, 0, 0, int(W/5), int(H/5))
    let _image = this.videoCtx.getImageData(0, 0, w, h),
        image = _image.data
    let i = 0
    let frame = new Int8Array(w*h)
    let black = 0
    while (i < image.length) {
      let r = image[i],
          g = image[i+1],
          b = image[i+2],
          a = image[i+3]
      let blc = Number(r+g+b <= 3)
      frame[i/4] = blc
      if (blc) black += blc
      i += 4
    }
    
    let j = 0
    while (j < this.letter.length) {
      let {x, y} = this.letter[j]
      let color = frame[w*int(y/2)+int(x/2)]
      if (color == undefined) color = (black > w*h/2)
      let clr = color ? "rgb(0, 0, 0, 0)" : "white"
      this.letter[j].clr = clr
      j += 1
    }
  }

  resize() {
    super.resize()

    this.videoCanvas = !!this.videoCanvas ?
      this.videoCanvas : document.createElement('canvas')
    this.videoCtx = !!this.videoCtx ?
      this.videoCtx : this.videoCanvas.getContext('2d')

    this.videoCanvas.width = this.Width * this.pixelRatio
    this.videoCanvas.height = this.Height * this.pixelRatio

    this.videoCtx.scale(
      this.pixelRatio,
      this.pixelRatio
    )

    this.initializeLetters()
  }

  animate() {
    super.animate()
    this.ctx.font = '36px NanumSquare'
    this.letter.forEach(info => {
      this.ctx.fillStyle = info.clr
      this.ctx.fillText(info.key, info.x, info.y)
    })
    if (!this.initialized) this.drawWelcome()
    else this.drawFrame()
  }

  drawWelcome() {
    let enter = "Press Enter or Click to play"
    let space = "(Space to Restart Video)"
    let cfb = "rgb(100, 149, 237)"

    let drawText = (t, s, y) => {
      this.ctx.fillStyle = cfb
      this.ctx.font = `${s}px NanumSquare`
      let w = (this.Width-this.ctx.measureText(t).width)/2
      this.ctx.fillText(t, w, y)
    }

    drawText(enter, 48, this.Height/5)
    drawText(space, 32, 1.5*this.Height/5)
  }
}

window.onload = () => { new App() }