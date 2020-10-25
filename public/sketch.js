let img;
let start =0;


// function preload(){
//   img = loadImage(str);
// }

function setup() {
  createCanvas(400, 400);
  pixelDensity(1);
  
  // let millisecond = millis();
//   if (millisecond === 3000){
//     console.log("in sketch");
//   }
setInterval(checkStatus, 3000);

//   createLoop({duration:3, gif:{
//     download:true,
//     fileName:`images/output/output${num}.png`
//   }});
}

function colorize() {
  image(img, 0,0,width,height);
  loadPixels();
  
  var yoff =start;
  for (let x = 0; x<width; x++){ // look at every pixel
    var xoff =start;
    for (let y = 0; y<height; y++){
      
      let index = (x+ y* width) * 4;
      let n = noise(xoff,yoff)*255;
      
      let r = pixels[index + 0]  // r
      let g = pixels[index + 1]  // g
      let b = pixels[index + 2] // b
      let a = pixels[index + 3]  // alpha
      
      let bright = (r+g+b)/3;
      pixels[index + 0] = (r+n)/2;
      pixels[index + 1] = (g+n)/2;
      // pixels[index + 2] = (b+n)/2;      
      xoff += 0.02;
    
    }
    yoff += 0.02;
  }
  start += 0.01;

  updatePixels();

  canvasToURL();
}

async function checkStatus(){
  const response = await fetch('/status',{method:"GET"});
  const data = await response.json();
  if (data.status ==false)
  {
    console.log("not ready!");
  }
  else{
    console.log("ready!");
    getInput();
  }
}

async function getInput(){
  const response = await fetch('/input',{method:"GET"});
  const data = await response.json();
  img = loadImage(data.file, colorize);
  
}

async function canvasToURL () {
  var c = document.querySelector("canvas"); 
  var imageData = c.toDataURL('image/png'); // produces a base64 image string
 
  
    const data3 = {imageData};
//   // send imageData to server.....

  const response = await fetch(`/output`,{
    method:"POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data3),
});
console.log("sent!");
// const response = await fetch('/output', options);
// console.log(response);
}