const images = [
  "images/bg1.jpg","images/bg2.jpg","images/bg3.jpg","images/bg4.jpg","images/bg5.jpg",
  "images/bg6.jpg","images/bg7.jpg","images/bg8.jpg","images/bg9.jpg","images/bg10.jpg",
  "images/bg11.jpg","images/bg12.jpg","images/bg13.jpg","images/bg14.jpg","images/bg15.jpg",
  "images/bg16.jpg","images/bg17.jpg","images/bg18.jpg","images/bg19.jpg","images/bg20.jpg",
  "images/bg21.jpg","images/bg22.jpg","images/bg23.jpg","images/bg24.jpg","images/bg25.jpg",
  "images/bg26.jpg","images/bg27.jpg","images/bg28.jpg"
];
let uploadedImage = null;
let currentBackground = null;
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

// NEW: Position inputs
const posXInput = document.getElementById("posX");
const posYInput = document.getElementById("posY");

// Helpers
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
function updatePositionInputsDefaults() {
  if (!posXInput || !posYInput) return;
  posXInput.max = canvas.width - 1;
  posYInput.max = canvas.height - 1;
  if (!posXInput.value) posXInput.value = Math.floor(canvas.width / 2);
  if (!posYInput.value) posYInput.value = Math.floor(canvas.height / 2);
}

// Handle canvas size change
document.getElementById("canvasSize").addEventListener("change", function () {
  const selected = this.value;
  const size = sizeOptions[selected];
  if (size) {
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    if (currentBackground) {
      const bg = new Image();
      bg.src = currentBackground.src;
      bg.onload = () => { ctx.drawImage(bg, 0, 0, canvas.width, canvas.height); };
      if (bg.complete) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } else {
      const tutorialImg = new Image();
      tutorialImg.src = "images/tutorial.jpg";
      tutorialImg.onload = () => { ctx.drawImage(tutorialImg, 0, 0, canvas.width, canvas.height); };
    }

    updatePositionInputsDefaults();
    showToast(`Canvas resized to ${selected}`);
  }
});

// Load tutorial image on first visit
window.addEventListener("DOMContentLoaded", () => {
  const tutorialImg = new Image();
  tutorialImg.src = "images/tutorial.jpg";
  tutorialImg.onload = () => { ctx.drawImage(tutorialImg, 0, 0, canvas.width, canvas.height); };
  updatePositionInputsDefaults();
});

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
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
        currentBackground = uploadedImage;
        showToast("Image uploaded successfully!");
      };
    };
    reader.readAsDataURL(file);
  }
});

// Generate canvas image
function generateImage() {
  const quote = document.getElementById("quoteText").value;
  const font = document.getElementById("fontSelect").value;
  const fontSize = parseInt(document.getElementById("fontSize").value, 10);
  const fontColor = document.getElementById("fontColor").value;
  const image = new Image();

  hasGenerated = true;
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
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Watermark
    const watermark = document.getElementById("watermarkText").value.trim();
    if (watermark) {
      ctx.font = "16px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.textAlign = "right";
      ctx.fillText(watermark, canvas.width - 20, canvas.height - 20);
    }

    // Quote
    ctx.fillStyle = fontColor;
    ctx.font = `${fontSize}px "${font}"`;
    ctx.shadowColor = fontColor;
    ctx.shadowBlur = 10;

    const xProvided = posXInput && posXInput.value !== "";
    const yProvided = posYInput && posYInput.value !== "";
    const useManualPos = xProvided && yProvided;

    const parsedX = clamp(
      parseInt(posXInput.value || Math.floor(canvas.width/2), 10),
      0,
      canvas.width-1
    );
    const parsedY = clamp(
      parseInt(posYInput.value || 0, 10),
      0,
      canvas.height-1
    );

      const maxWidth = useManualPos ? Math.max(50, canvas.width - parsedX - 20) : canvas.width * 0.8;
      const lines = wrapText(ctx, quote, maxWidth);
      const lineHeight = fontSize * 1.4; // dynamic spacing

      let startX, startY;
      if (useManualPos) {
        ctx.textAlign = "left";
        startX = parsedX;
        startY = parsedY;
      } else {
        ctx.textAlign = "center";
        const verticalAlign = document.getElementById("verticalAlign").value;
        switch (verticalAlign) {
          case "top":
            startY = 50;
            break;
          case "bottom":
            startY = canvas.height - lines.length * lineHeight - 50;
            break;
          default:
            startY = canvas.height / 2 - (lines.length * lineHeight) / 2;
        }
        startX = canvas.width / 2;
      }

      lines.forEach((line, i) => {
        ctx.fillText(line, startX, startY + i * lineHeight);
    });

    ctx.shadowBlur = 0;
    showToast("Quote generated successfully!");
  };
}

// Wrap long quotes
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

// Download image
function downloadImage() {
  if (!hasGenerated) {
    showToast("Please generate a quote before downloading.");
    return;
  }
  const link = document.createElement("a");
  link.download = "quote-image.png";
  link.href = canvas.toDataURL();
  link.click();
  showToast("Quote saved!");
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

