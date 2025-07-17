const images = ["images/bg1.jpg", "images/bg2.jpg", "images/bg3.jpg", "images/bg4.jpg", "images/bg5.jpg"];
let uploadedImage = null;
let currentBackground = null; // Track current background image
let hasGenerated = false;
const canvas = document.getElementById("quoteCanvas");
const ctx = canvas.getContext("2d");
// Size Options
const sizeOptions = {
original: { width: 800, height: 800 },
square: { width: 1080, height: 1080 },
portrait: { width: 1080, height: 1350 },
story: { width: 1080, height: 1920 },
wide: { width: 1280, height: 720 }
};

// Handle canvas size change
document.getElementById("canvasSize").addEventListener("change", function () {
const selected = this.value;
const size = sizeOptions[selected];
if (size) {
canvas.width = size.width;
canvas.height = size.height;

// Responsive visual size  
canvas.style.width = "100%";         // fills its container  
canvas.style.height = "auto";        // keeps aspect ratio  

if (currentBackground) {  
  const bg = new Image();  
  bg.src = currentBackground.src;  
  bg.onload = () => {  
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);  
  };  
  if (bg.complete) {  
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);  
  }  
} else {  
  const tutorialImg = new Image();  
  tutorialImg.src = "images/tutorial.jpg";  
  tutorialImg.onload = function () {  
    ctx.drawImage(tutorialImg, 0, 0, canvas.width, canvas.height);  
  };  
}  

currentQuote = "";  
showToast(`Canvas resized to ${selected}`);

}
});

// Load tutorial image on first visit
window.addEventListener("DOMContentLoaded", () => {

const tutorialImg = new Image();
tutorialImg.src = "images/tutorial.jpg";

tutorialImg.onload = function () {
ctx.drawImage(tutorialImg, 0, 0, canvas.width, canvas.height);
};
});

function showToast(message) {
const toast = document.getElementById("toast");
toast.textContent = message;
toast.classList.add("show");

setTimeout(() => {
toast.classList.remove("show");
}, 3000); // Toast stays for 3 seconds
}

// Handle image upload
document.getElementById("bgUpload").addEventListener("change", function (event) {
const file = event.target.files[0];
if (file) {
const reader = new FileReader();
reader.onload = function (e) {
uploadedImage = new Image();
uploadedImage.src = e.target.result;
uploadedImage.onload = () => {
currentBackground = uploadedImage; // Set as current background
showToast("Image uploaded successfully!");
};
};
reader.readAsDataURL(file);
}
});

// Generate the canvas image
function generateImage() {
const canvas = document.getElementById("quoteCanvas");
const ctx = canvas.getContext("2d");
const quote = document.getElementById("quoteText").value;
const font = document.getElementById("fontSelect").value;
const fontSize = document.getElementById("fontSize").value;
const fontColor = document.getElementById("fontColor").value;
const textAlign = document.getElementById("textAlign").value;
const image = new Image();

hasGenerated = true;
// validate input
if (!quote.trim()) {
showToast("Please enter a quote!");
return;
}
if (uploadedImage) {
image.src = uploadedImage.src;
currentBackground = uploadedImage;
} else if (currentBackground) {
image.src = currentBackground.src;
} else {
const randomImage = images[Math.floor(Math.random() * images.length)];
image.src = randomImage;
currentBackground = image;
}

image.onload = function () {
// Draw background
ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

// Dim background  
ctx.fillStyle = "rgba(0, 0, 0, 0.4)";  
ctx.fillRect(0, 0, canvas.width, canvas.height);  

// Text styling  
ctx.fillStyle = fontColor;  
ctx.font = `${fontSize}px "${font}"`;  
ctx.textAlign = textAlign;  
ctx.shadowColor = fontColor;  
ctx.shadowBlur = 10;  

const lines = wrapText(ctx, quote, canvas.width * 0.8);  
const startY = canvas.height / 2 - (lines.length * 35) / 2;  

lines.forEach((line, i) => {  
  ctx.fillText(line, canvas.width / 2, startY + i * 35);  
});  

ctx.shadowBlur = 0;  
showToast("Quote generated successfully!");

};
}

// Break long quotes into multiple lines
function wrapText(ctx, text, maxWidth) {
const words = text.split(" ");
const lines = [];
let line = "";

for (let word of words) {
const testLine = line + word + " ";
const metrics = ctx.measureText(testLine);
if (metrics.width > maxWidth && line !== "") {
lines.push(line.trim());
line = word + " ";
} else {
line = testLine;
}
}

if (line) lines.push(line.trim());
return lines;
}

// Download the final image
function downloadImage() {
const canvas = document.getElementById("quoteCanvas");
const link = document.createElement("a");
if (!hasGenerated) {
showToast("Please generate a quote before downloading.");
return; }
else{
link.download = "quote-image.png";
link.href = canvas.toDataURL();
link.click();
showToast("Quote saved!");
}
}

// Register service worker for PWA
if ("serviceWorker" in navigator) {
window.addEventListener("load", () => {
navigator.serviceWorker
.register("service-worker.js")
.then((reg) => console.log("Service Worker registered!", reg))
.catch((err) => console.error("SW registration failed:", err));
});
}
