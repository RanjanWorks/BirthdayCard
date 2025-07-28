document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const nameInput = document.getElementById("name");
  const bgButtons = document.querySelectorAll("[data-bg]");
  let selectedBg = "gradient1";

  // Background selection
  bgButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      bgButtons.forEach((b) => b.classList.remove("border-purple-500"));
      this.classList.add("border-purple-500");
      selectedBg = this.dataset.bg;

      // Update preview immediately
      const cardPreview = document.getElementById("cardPreview");
      // Remove all existing background classes
      cardPreview.classList.remove(
        "bg-gradient1",
        "bg-gradient2",
        "bg-gradient3",
        "bg-solid1",
        "bg-solid2",
        "bg-solid3"
      );
      // Add selected background class
      cardPreview.classList.add(`bg-${selectedBg}`);
    });
  });
  const birthdateInput = document.getElementById("birthdate");
  const messageInput = document.getElementById("message");
  const photoInput = document.getElementById("photo");
  const fileNameSpan = document.getElementById("fileName");
  const generateBtn = document.getElementById("generateBtn");
  const downloadImageBtn = document.getElementById("downloadImageBtn");
  const downloadPdfBtn = document.getElementById("downloadPdfBtn");
  const shareWhatsappBtn = document.getElementById("shareWhatsappBtn");

  // Preview Elements
  const previewName = document.getElementById("previewName");
  const previewAge = document.getElementById("previewAge");
  const previewMessage = document.getElementById("previewMessage");
  const photoContainer = document.getElementById("photoContainer");
  const confettiContainer = document.getElementById("confettiContainer");

  // Set default birthdate to today (for better UX)
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  birthdateInput.value = formattedDate;

  // File upload handling
  photoInput.addEventListener("change", function (e) {
    if (e.target.files.length > 0) {
      fileNameSpan.textContent = e.target.files[0].name;
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = function (event) {
        photoContainer.innerHTML = `
                            <div class="absolute inset-0 rounded-full border-2 border-dashed border-pink-300 animate-spin-slow"></div>
                            <img src="${event.target.result}" class="w-full h-full object-cover rounded-full" alt="Uploaded photo">
                            <div class="absolute -bottom-2 -right-2 bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                                <i class="fas fa-birthday-cake text-sm"></i>
                            </div>
                        `;
      };

      reader.readAsDataURL(file);
    } else {
      fileNameSpan.textContent = "No file chosen";
      photoContainer.innerHTML =
        '<i class="fas fa-user text-gray-400 text-4xl"></i>';
    }
  });

  // Share to WhatsApp
  shareWhatsappBtn.addEventListener("click", function () {
    html2canvas(document.getElementById("cardPreview")).then((canvas) => {
      const imageData = canvas.toDataURL("image/png");
      const name = nameInput.value.trim() || "Friend";
      const message = `Check out this birthday card I made for ${name}!`;

      // Create temporary link
      const link = document.createElement("a");
      link.href = imageData;
      link.download = "birthday-card.png";

      // Share via WhatsApp
      if (navigator.share) {
        navigator
          .share({
            title: "Birthday Card",
            text: message,
            files: [
              new File([link.href], "birthday-card.png", { type: "image/png" }),
            ],
          })
          .catch((err) => {
            console.log("Error sharing:", err);
            fallbackWhatsappShare(imageData, message);
          });
      } else {
        fallbackWhatsappShare(imageData, message);
      }
    });
  });

  function fallbackWhatsappShare(imageData, message) {
    // For browsers that don't support Web Share API
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      message
    )}&image=${encodeURIComponent(imageData)}`;
    window.open(whatsappUrl, "_blank");
  }

  // Generate card preview
  generateBtn.addEventListener("click", function () {
    // Apply selected background
    const cardPreview = document.getElementById("cardPreview");
    cardPreview.className =
      "card-preview rounded-xl p-4 md:p-8 min-h-64 md:min-h-96 flex flex-col items-center justify-center relative overflow-hidden";
    cardPreview.classList.add(`bg-${selectedBg}`);

    // Update name
    const name = nameInput.value.trim() || "Friend";
    previewName.textContent = name;

    // Calculate and update age
    const birthdate = new Date(birthdateInput.value);
    const age = calculateAge(birthdate);
    previewAge.textContent =
      age === 0 ? "Newborn baby!" : `Turning ${age} years young!`;

    // Update message
    const message =
      messageInput.value.trim() ||
      "Wishing you a day filled with happiness and joy!";
    previewMessage.innerHTML = `<p class="text-gray-700">${message.replace(
      /\n/g,
      "<br>"
    )}</p>`;

    // Enable download and share buttons
    downloadImageBtn.disabled = false;
    downloadPdfBtn.disabled = false;
    shareWhatsappBtn.disabled = false;

    // Add confetti effect
    createConfetti();

    // Show success message
    Toastify({
      text: "Card generated successfully!",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      stopOnFocus: true,
    }).showToast();
  });

  // Download as Image
  downloadImageBtn.addEventListener("click", function () {
    // Pause animations temporarily for capture
    const confettiElements = document.querySelectorAll(".confetti");
    confettiElements.forEach((el) => {
      el.style.animationPlayState = "paused";
    });

    html2canvas(document.getElementById("cardPreview"), {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "birthday-card.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      // Resume animations after capture
      confettiElements.forEach((el) => {
        el.style.animationPlayState = "running";
      });
    });
  });

  // Download as PDF
  downloadPdfBtn.addEventListener("click", function () {
    // Pause animations temporarily for capture
    const confettiElements = document.querySelectorAll(".confetti");
    confettiElements.forEach((el) => {
      el.style.animationPlayState = "paused";
    });

    const { jsPDF } = window.jspdf;
    html2canvas(document.getElementById("cardPreview"), {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("birthday-card.pdf");

      // Resume animations after capture
      confettiElements.forEach((el) => {
        el.style.animationPlayState = "running";
      });
    });
  });

  // Helper function to calculate age
  function calculateAge(birthdate) {
    if (!birthdate) return 0;

    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthdate.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Confetti effect
  function createConfetti() {
    // Clear existing confetti
    confettiContainer.innerHTML = "";

    // Create new confetti
    const colors = [
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4CAF50",
      "#8BC34A",
      "#CDDC39",
      "#FFEB3B",
      "#FFC107",
      "#FF9800",
      "#FF5722",
    ];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.top = Math.random() * 100 + "%";
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 10 + 5 + "px";
      confetti.style.height = Math.random() * 10 + 5 + "px";
      confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
      confetti.style.animationDelay = Math.random() * 2 + "s";
      confetti.style.transform = `translateY(${Math.random() * 100}%)`;
      confettiContainer.appendChild(confetti);
    }
  }

  // Toast notification library
  function Toastify(options) {
    const toast = document.createElement("div");
    toast.style.cssText = `
                    position: fixed;
                    right: 20px;
                    top: 20px;
                    padding: 12px 20px;
                    color: white;
                    background: ${options.backgroundColor || "#333"};
                    border-radius: 4px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    transition: all 0.3s ease;
                `;

    toast.innerHTML = `
                    <span>${options.text}</span>
                    ${
                      options.close
                        ? '<button style="margin-left: 15px; background: transparent; border: none; color: white; cursor: pointer;">×</button>'
                        : ""
                    }
                `;

    document.body.appendChild(toast);

    if (options.close) {
      toast.querySelector("button").addEventListener("click", () => {
        toast.remove();
      });
    }

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, options.duration || 3000);

    return {
      showToast: () => {},
    };
  }
});
