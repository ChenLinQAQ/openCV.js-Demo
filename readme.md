## 1. perspectiveOfficial.html

​	官方提供的透视变换的例子[OpenCV: Geometric Transformations of Images](https://docs.opencv.org/3.4/dd/d52/tutorial_js_geometric_transformations.html)

​     

<img src="https://s2.loli.net/2022/05/07/znxiOrQS74jKfto.png" alt="image.png" style="zoom: 33%;" />

<img src="https://s2.loli.net/2022/05/07/oXG8TzSKYwUsJVc.png" alt="image.png" style="zoom: 33%;" />



## 3. canvasPaintDemo.html

​	github上找的一个Canvas绘图的例子，可以支持绘图、保存图片、拖拽，这个例子启发了我做下面的绘制并拖动不规则四边形的方法。

<img src="https://s2.loli.net/2022/05/07/Pqf6sZVuU5KrIan.png" alt="image.png" style="zoom: 50%;" />

## 2. myTrans.html

  	用官方的例子，改写的一个不成熟的例子，可以自己绘制梯形，并拖动。

​     这样就得到了一个变形的哆啦A梦。

<img src="https://s2.loli.net/2022/05/07/EjFZa7PlBkfdexY.png" alt="image.png" style="zoom: 33%;" />

<img src="https://s2.loli.net/2022/05/07/YjfSQw64Il5aqvy.png" alt="image.png" style="zoom:33%;" />



​	我之前也尝试过通过拉伸加仿射变换来解决，不过得得到的效果是这样的；

<img src="https://s2.loli.net/2022/05/07/tFaAMrDpfJumCPQ.png" alt="image.png" style="zoom: 33%;" />

<img src="https://s2.loli.net/2022/05/07/fCKenkgzIY1EQU7.png" alt="_H@HKNI06L91O64UONQD756.png" style="zoom: 50%;" />

### 4. openFileWithOpenCVDemo.html

​	我们有一个需求就是：从本地读取图片到image中，然后getImageData获取到像素矩阵，但是这样会报错出现了<b>跨域</b>的问题。

####    两个解决方案：

   1. 通过base64编码，在Android中获取到图片资源，然后通过编码成base64，再通过<b>WebView</b>调用JS中的方法，传递参数，在JS中解析成Image，这样的确解决了跨域的问题。

      但是后来使用OpenCV的方法的时候，调用这个Image对象会报错，未找到解决的办法。
      
   2. 通过<b><input type = "file"/ ></b>打开文件，但是同样的遇到了问题，Android会禁止对这个<b>input</b>的响应，在网上找到的解决办法是为<b>WebView重写WebClient中        
  
      onShowFileChooser方法</b>，测试的确可行。
   
### 5. perspective.html

这个是为了动态适配Android屏幕做的版本。











