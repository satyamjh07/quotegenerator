const images = ["images/bg1.jpg", "images/bg2.jpg", "images/bg3.jpg"];
let uploadedImage = null;

document.getElementById("bgUpload").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      uploadedImage = new Image();
      uploadedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function generateImage() {
  const canvas = document.getElementById("quoteCanvas");
  const ctx = canvas.getContext("2d");
  const quote = document.getElementById("quoteText").value;
  const font = document.getElementById("fontSelect").value;

  const image = uploadedImage ? uploadedImage : new Image();
  if (!uploadedImage) {
    image.src = images[Math.floor(Math.random() * images.length)];
  }

  image.onload = function () {
    // Draw background image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Dull background (overlay transparent black)
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    const fontSize = document.getElementById("fontSize").value;
    const fontColor = document.getElementById("fontColor").value;
    const textAlign = document.getElementById("textAlign").value;

    ctx.fillStyle = fontColor;
    ctx.font = `${fontSize}px "${font}"`;
    ctx.textAlign = textAlign;
    ctx.shadowColor = fontColor;
    ctx.shadowBlur = 10; // Glow effect

    const lines = wrapText(ctx, quote, canvas.width * 0.8);
    const startY = canvas.height / 2 - (lines.length * 35) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, startY + i * 35);
    });

    // Reset shadow after drawing
    ctx.shadowBlur = 0;
  };

  if (uploadedImage) {
    image.onload(); // trigger immediately if already uploaded
  }
}

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

function downloadImage() {
  const canvas = document.getElementById("quoteCanvas");
  const link = document.createElement("a");
  link.download = "quote-image.png";
  link.href = canvas.toDataURL();
  link.click();
}
// 🖼️ Load tutorial image on first visit
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("quoteCanvas");
  const ctx = canvas.getContext("2d");

  const tutorialImg = new Image();
  tutorialImg.src = "images/tutorial.jpg"; // Change path if needed

  tutorialImg.onload = function () {
    ctx.drawImage(tutorialImg, 0, 0, canvas.width, canvas.height);
  };
});
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then((reg) => console.log("Service Worker registered!", reg))
      .catch((err) => console.error("SW registration failed:", err));
  });
}
