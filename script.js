const headerBgColorPicker = document.getElementById("headerBgColor");
const headerTextColorPicker = document.getElementById("headerTextColor");

// Function to update page title dynamically
function updatePageTitle(title) {
  const heading = document.getElementById("pageTitle");
  const displayTitle =
    title && title.trim() !== "" ? title.trim() : "Generator";
  heading.textContent = `Generator - ${displayTitle}`;
  document.title = `Generator - ${displayTitle}`;
}

// Reusable function to fetch JSON data
async function fetchJSONData(url) {
  const proxy = "https://api.allorigins.win/raw?url=";
  const response = await fetch(proxy + encodeURIComponent(url));
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid JSON format");
  return data;
}

// Preview Button Logic
document
  .getElementById("previewButton")
  .addEventListener("click", async function () {
    const title = document.getElementById("title").value;
    const details = document.getElementById("details").value;
    const jsonUrl = document.getElementById("jsonUrl").value;
    const headerBgColor = document.getElementById("headerBgColor").value;
    const headerTextColor = document.getElementById("headerTextColor").value;
    const savedLogo = localStorage.getItem("logoBase64");

    const previewContent = document.getElementById("previewContent");

    // Update page title
    updatePageTitle(title);

    // Define displayTitle for use in the preview content
    const displayTitle =
      title && title.trim() !== "" ? title.trim() : "Generator";

    previewContent.innerHTML = `
    <div style="text-align:right; margin-bottom:10px;">
      ${
        savedLogo
          ? `<img src="${savedLogo}" alt="Logo" style="max-width:100px; margin-bottom:5px;">`
          : ""
      }
      <h1>${displayTitle}</h1>
      <h3>${details.replace(/\n/g, "<br>")}</h3>
      <p id="loadingText" style="color:gray;">Loading data...</p>
    </div>
  `;

    try {
      const data = await fetchJSONData(jsonUrl);

      let tableHtml = '<table style="width:100%; border-collapse:collapse;">';

      // Headers
      tableHtml += "<tr>";
      Object.keys(data[0]).forEach((header) => {
        tableHtml += `<th style="border:1px solid #ccc; padding:8px; background:${headerBgColor}; color:${headerTextColor};">${header}</th>`;
      });
      tableHtml += "</tr>";

      // Rows
      data.forEach((row) => {
        tableHtml += "<tr>";
        Object.values(row).forEach((cell) => {
          tableHtml += `<td style="border:1px solid #ccc; padding:8px;">${cell}</td>`;
        });
        tableHtml += "</tr>";
      });
      tableHtml += "</table>";

      // Safely remove loading text
      const loadingText = document.getElementById("loadingText");
      if (loadingText) loadingText.remove();

      previewContent.innerHTML += tableHtml;
    } catch (err) {
      const loadingText = document.getElementById("loadingText");
      if (loadingText) loadingText.remove();

      previewContent.innerHTML += `<p style="color:red;">Error loading JSON data: ${err.message}</p>`;
    }
  });

// Function to save form data to localStorage
function saveFormData() {
  const formData = {
    title: document.getElementById("title").value,
    details: document.getElementById("details").value,
    jsonUrl: document.getElementById("jsonUrl").value,
    headerBgColor: document.getElementById("headerBgColor").value,
    headerTextColor: document.getElementById("headerTextColor").value,
    logo: localStorage.getItem("logoBase64") || "", // Save logo Base64 if available
  };

  localStorage.setItem("pdfFormData", JSON.stringify(formData));
}

// Function to load form data from localStorage
function loadFormData() {
  const savedData = localStorage.getItem("pdfFormData");
  if (savedData) {
    const formData = JSON.parse(savedData);
    document.getElementById("title").value = formData.title || "";
    document.getElementById("details").value = formData.details || "";
    document.getElementById("jsonUrl").value = formData.jsonUrl || "";
    document.getElementById("headerBgColor").value =
      formData.headerBgColor || "#2980b9";
    document.getElementById("headerTextColor").value =
      formData.headerTextColor || "#ffffff";

    // If a logo is saved, display it in the file input preview
    const savedLogo = localStorage.getItem("logoBase64");
    if (savedLogo) {
      displayLogoPreview(savedLogo);
    }
  }
}

// Save the uploaded logo as Base64 in localStorage and display it
document.getElementById("logo").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const logoBase64 = event.target.result;

      // Save the Base64 string to localStorage
      localStorage.setItem("logoBase64", logoBase64);

      // Display the logo preview
      displayLogoPreview(logoBase64);
    };
    reader.readAsDataURL(file);
  }
});

// Function to display the logo preview
function displayLogoPreview(logoBase64) {
  // Remove any existing preview
  const existingPreview = document.querySelector("#logoPreview");
  if (existingPreview) {
    existingPreview.remove();
  }

  // Create a new image element for the preview
  const logoPreview = document.createElement("img");
  logoPreview.id = "logoPreview";
  logoPreview.src = logoBase64;
  logoPreview.alt = "Uploaded Logo";
  logoPreview.style.maxWidth = "100px";
  logoPreview.style.marginTop = "10px";
  logoPreview.style.border = "1px solid #ccc";
  logoPreview.style.borderRadius = "4px";

  // Insert the preview below the file input
  document
    .getElementById("logo")
    .insertAdjacentElement("afterend", logoPreview);
}

function updateTableHeaderColors(bgColor, textColor) {
  const tableHeaders = previewContent.querySelectorAll("table th");
  tableHeaders.forEach((header) => {
    header.style.backgroundColor = bgColor;
    header.style.color = textColor;
  });
}
headerBgColorPicker.addEventListener("input", () => {
  updateTableHeaderColors(
    headerBgColorPicker.value,
    headerTextColorPicker.value
  );
});

headerTextColorPicker.addEventListener("input", () => {
  updateTableHeaderColors(
    headerBgColorPicker.value,
    headerTextColorPicker.value
  );
});
// Update page title in real-time as user types in the title field
document.getElementById("title").addEventListener("input", function () {
  updatePageTitle(this.value);
});

// Save form data whenever an input changes
document.getElementById("pdfForm").addEventListener("input", saveFormData);

// Load form data when the page loads
window.addEventListener("load", loadFormData);
