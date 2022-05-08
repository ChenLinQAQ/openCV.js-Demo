
window.addEventListener('load', () => {

    let base = document.getElementById('canvas-base'),              // 显示原始图片
        control = document.getElementById('canvas-control'),        // 绘制控制四边形
        result = document.getElementById('canvas-result'),          // 显示结果
        saveCanvas = document.getElementById('canvas-save'),        // 保存结果，设置为隐藏的canvas
        container = document.getElementById('container')
    let baseCtx = base.getContext('2d'),
        controlCtx = control.getContext('2d'),
        resultCtx = result.getContext('2d')


    // 是否已经开始转换，用于实时更新
    let convert_begin = false;
    
    // 可以是Image对象，也可以是HTMLVideoElement对象
    let image = null;
    
    let points = [[20, 20], [20, 80], [80, 80], [80, 20]]
    let imageWidth = 100, imageHeight = 100
    let resultWidth = 300, resultHeight = 300
    let imageScale = 1, resultScale = 1
    let startX, startY, draggingNow = -1
    let touchId, offsetTop, offsetLeft    

    const imgPos2Canvas = pos => pos.map(v => v * imageScale)
    const canvasPos2Img = pos => pos.map(v => v / imageScale)


    // 找到距离最近的一个触摸点
    const findNearest = pos => points.reduce(
        ({ minD, minIndex }, point, index) => {
            let d = Math.sqrt((pos[0] - point[0]) ** 2 + (pos[1] - point[1]) ** 2)
            return d < minD ? { minD: d, minIndex: index } : { minD, minIndex }
        },
        { minD: Infinity, minIndex: -1 }
    ).minIndex

    // 绘制四边形
    function drawControl() {
        let [width, height] = imgPos2Canvas([imageWidth, imageHeight])
        controlCtx.strokeStyle = '#FFF'
        controlCtx.strokeWidth = '10px'
        controlCtx.fillStyle = '#0005'

        controlCtx.clearRect(0, 0, width, height)
        controlCtx.fillRect(0, 0, width, height)

        let points1 = points.map(pos => imgPos2Canvas(pos))

        controlCtx.beginPath()
        controlCtx.moveTo(points1[3][0], points1[3][1])
        points1.forEach(([x, y]) => {
            controlCtx.lineTo(x, y)
        })
        controlCtx.stroke()

        points1.forEach(([x, y], index) => {
            controlCtx.fillStyle = index === draggingNow ? '#48adff' : '#FFF'
            controlCtx.beginPath()
            controlCtx.ellipse(x, y, 10, 10, 0, 0, 360)
            controlCtx.fill()
        })
    }

    // 更新伸缩比例，canvas显示的实际是缩略图
    function updateScale() {
        if (!image) return
        const { width, height, left, top } = container.getBoundingClientRect()
        imageScale = Math.min(width / imageWidth, height / imageHeight)
        offsetLeft = (width - imageWidth * imageScale) / 2
        offsetTop = top
        // 输出距离
        console.log("asdasd")
        console.log(imageWidth, imageHeight)
        console.log(resultWidth, resultHeight)
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
        // 通过openCV绘制改变清晰度
        baseCtx.drawImage(image, 0, 0, width, height)
        drawControl()
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

    function handleTouchStart(e) {
        e.preventDefault()
        let touch = e.changedTouches[0]
        touchId = touch.identifier
        startX = touch.clientX
        startY = touch.clientY
        draggingNow = findNearest(canvasPos2Img([startX - offsetLeft, startY - offsetTop]))
        console.log(draggingNow)
    }

    function handleTouchMove(e) {
        e.preventDefault()
        let touch = Array.prototype.find.call(
            e.changedTouches,
            touch => touch.identifier === touchId
        )
        if (!touch) return
        let delta = canvasPos2Img([touch.clientX - startX, touch.clientY - startY])
        startX = touch.clientX
        startY = touch.clientY
        points[draggingNow][0] += delta[0]
        points[draggingNow][1] += delta[1]
        updateCanvas()
    }

    function handleTouchEnd(e) {
        e.preventDefault()
        let touch = Array.prototype.find.call(
            e.changedTouches,
            touch => touch.identifier === touchId
        )
        draggingNow = -1
        updateCanvas()
        if (convert_begin)
            convert()
    }

    // 透视变换
    function convert() {
        convert_begin = true;
        let src = cv.imread(image);
        // console.log(src);
        let dst = new cv.Mat();
        // console.log(src.rows, src.cols);
        let dsize = new cv.Size(src.cols, src.rows);    // 设置变换后图片的尺寸
        // console.log(points[0].X, points[0].Y, points[1].X, points[1].Y,points[3].X,points[3].Y,points[2].X,points[2].Y);
        console.log(points)
        let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [points[0][0], points[0][1], points[1][0], points[1][1],points[2][0],points[2][1],points[3][0],points[3][1]]);
        let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, src.cols, 0, src.cols, src.rows, 0, src.rows]);
        let M = cv.getPerspectiveTransform(srcTri, dstTri);
        // You can try more different parameters
        cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

        let dsize_re = new cv.Size(imageWidth * imageScale, imageHeight * imageScale);
        let image2 = new cv.Mat(dsize_re, cv.CV_32S);
        cv.resize(dst, image2, dsize_re);
        console.log(dsize_re)
        // cv.resize(image, imageWidth * imageScale, imageHeight * imageScale)
        cv.imshow('canvas-save', dst)   // 绘制用户保存的canvas，但是不显示
        // saveCanvas.getContext('2d').clearRect(0, 0, saveCanvas.width, saveCanvas.height)
        cv.imshow('canvas-result', image2)
        // saveCanvas.style.display = "none"
        src.delete(); dst.delete(); M.delete(); srcTri.delete(); dstTri.delete();
        console.log(image2)

    }

    function hello() {
        console.log("hello world");
        return 'hello world'
    }

    function getBase64() {
        var res = saveCanvas.toDataURL('image/jpg');
        // console.log(res)
        return "asdasd"
    }

    // 浏览器可以正常保存图片
    function save() {
        hello()
        saveCanvas.toBlob(function(blob) {
            saveAs(blob, ".png");
        })
    }

    document.getElementById('img-input').addEventListener('change', e => {
        if (e.target.files.length) {
            convert_begin = false
            loadImage(e.target.files[0])
            resultCtx.clearRect(0, 0, result.width, result.height)
        }
    })

    // 注册监听函数
    window.addEventListener('resize', updateScale)

    control.addEventListener('touchstart', handleTouchStart)
    control.addEventListener('touchmove', handleTouchMove)
    control.addEventListener('touchend', handleTouchEnd)

    document.getElementById('convert').addEventListener('click', convert)
    document.getElementById('save').addEventListener('click', save)
})