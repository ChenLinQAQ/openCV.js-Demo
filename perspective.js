window.addEventListener('load', () => {
    let base = document.getElementById('canvas-base'),
        control = document.getElementById('canvas-control'),
        result = document.getElementById('canvas-result'),
        container = document.getElementById('container')
    let baseCtx = base.getContext('2d'),
        controlCtx = control.getContext('2d'),
        resultCtx = result.getContext('2d')
    
    // 可以是Image对象，也可以是HTMLVideoElement对象
    let image;
    
    let points = [[20, 20], [20, 80], [80, 80], [80, 20]]
    let imageWidth = 100, imageHeight = 100
    let resultWidth = 300, resultHeight = 300
    let imageScale = 1, resultScale = 1

    const imgPos2Canvas = pos => pos.map(v => v * imageScale)
    const canvasPos2Img = pos => pos.map(v => v / imageScale)
    const resultPos2Canvas = pos => pos.map(v => v * resultScale)
    
    function drawControl() {
        let [width, height] = imgPos2Canvas([imageWidth, imageHeight])
        controlCtx.strokeStyle = '#FFF'
        controlCtx.strokeWidth = '10px'
        controlCtx.fillStyle = '#0005'

        controlCtx.clearRect(0, 0, width, height)
        controlCtx.fillRect(0, 0, width, height)

        let points1 = points.map(pos => imgPos2Canvas(pos))

        controlCtx.clearRect(
            points1[0][0],
            points1[0][1],
            points1[2][0] - points1[0][0],
            points1[2][1] - points1[0][1]
        )
        controlCtx.beginPath()
        controlCtx.moveTo(points1[3][0], points1[3][1])
        points1.forEach(([x, y]) => {
            controlCtx.lineTo(x, y)
        })
        controlCtx.stroke()

        controlCtx.fillStyle = '#FFF'
        points1.forEach(([x, y]) => {
            controlCtx.beginPath()
            controlCtx.ellipse(x, y, 10, 10, 0, 0, 360)
            controlCtx.fill()
        })
    }

    function updateScale() {
        const { width, height } = container.getBoundingClientRect()
        imageScale = Math.min(width / imageWidth, height / imageHeight)
        resultScale = Math.min(width / resultWidth, height / resultHeight)
        updateCanvas()
    }

    function updateImage() {
        if (image instanceof HTMLVideoElement) {
            imageWidth = image.videoWidth
            imageHeight = image.videoHeight
        }
        else if (image instanceof Image || image instanceof HTMLImageElement) {
            imageWidth = image.width
            imageHeight = image.height
        }
        else {
            console.error("传入的image不合法")
            return
        }
        points = [
            [imageWidth * 0.2, imageHeight * 0.2],
            [imageWidth * 0.8, imageHeight * 0.2],
            [imageWidth * 0.8, imageHeight * 0.8],
            [imageWidth * 0.2, imageHeight * 0.8]
        ]
        updateScale()
    }

    function updateCanvas() {
        let [width, height] = imgPos2Canvas([imageWidth, imageHeight])
        control.width = base.width = width
        control.height = base.height = height
        baseCtx.drawImage(image, 0, 0, width, height)
        drawControl()
        drawResult()
    }

    function drawResult() {
        // code here
    }

    function loadImage(file) {
        let reader = new FileReader()
        reader.onload = () => {
            image = new Image()
            image.onload = updateImage
            image.src = reader.result
        }
        reader.readAsDataURL(file)
    }

    document.getElementById('img-input').addEventListener('change', e => {
        if (e.target.files.length) {
            loadImage(e.target.files[0])
        }
    })

    window.addEventListener('resize', updateScale)

    
})