const { jsPDF } = window.jspdf;

document
  .getElementById("previewButton")
  .addEventListener("click", async function () {
    const title = document.getElementById("title").value;
    const details = document.getElementById("details").value;
    const jsonUrl = document.getElementById("jsonUrl").value;

    const previewContent = document.getElementById("previewContent");
    previewContent.innerHTML = ""; // Clear previous preview content

    // Add Title and Details to Preview
    const titleElement = document.createElement("h3");
    titleElement.textContent = `Title: ${title}`;
    previewContent.appendChild(titleElement);

    const detailsElement = document.createElement("p");
    detailsElement.textContent = `Details: ${details}`;
    previewContent.appendChild(detailsElement);

    // Fetch and Display Table Data
    try {
      const response = await fetch(jsonUrl);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid JSON format");

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";

      // Add Table Headers
      const headers = Object.keys(data[0]);
      const headerRow = document.createElement("tr");
      headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        th.style.border = "1px solid #ccc";
        th.style.padding = "8px";
        th.style.textAlign = "left";
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      // Add Table Rows
      data.forEach((row) => {
        const rowElement = document.createElement("tr");
        headers.forEach((header) => {
          const td = document.createElement("td");
          td.textContent = row[header];
          td.style.border = "1px solid #ccc";
          td.style.padding = "8px";
          rowElement.appendChild(td);
        });
        table.appendChild(rowElement);
      });

      previewContent.appendChild(table);
    } catch (err) {
      previewContent.textContent = "Error loading JSON data: " + err.message;
    }
  });

document
  .getElementById("pdfForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const details = document.getElementById("details").value;
    const jsonUrl = document.getElementById("jsonUrl").value;
    const headerBgColor = document.getElementById("headerBgColor").value;
    const headerTextColor = document.getElementById("headerTextColor").value;
    const savedLogo = localStorage.getItem("logoBase64"); // Retrieve saved logo from localStorage
    const pdf = new jsPDF();

    // Add Title
    pdf.setFontSize(18);
    pdf.text(title, 20, 30);

    // Add Details
    pdf.setFontSize(12);
    const detailLines = pdf.splitTextToSize(details, 170);
    pdf.text(detailLines, 20, 40);

    // Add Logo (if available)
    if (savedLogo) {
      pdf.addImage(savedLogo, "PNG", 150, 10, 25, 25); // Position: x=150, y=10, width=25, height=25
    }

    // Fetch table data and generate the table
    async function generateTable() {
      try {
        const proxy = "https://api.allorigins.win/raw?url=";
        const response = await fetch(proxy + encodeURIComponent(jsonUrl));
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid JSON format");

        const headers = Object.keys(data[0]).map((key) => ({
          title: key,
          dataKey: key,
        }));

        const rows = data.map((row) =>
          headers.map((header) => row[header.dataKey])
        );

        // Convert hex color to RGB
        const hexToRgb = (hex) => {
          const bigint = parseInt(hex.slice(1), 16);
          return [bigint >> 16, (bigint >> 8) & 255, bigint & 255];
        };

        // Add table to PDF using autoTable
        pdf.autoTable({
          head: [headers.map((header) => header.title)],
          body: rows,
          startY: 60,
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: hexToRgb(headerBgColor), // Use selected background color
            textColor: hexToRgb(headerTextColor), // Use selected text color
            fontStyle: "bold",
          },
        });

        // Add page numbers after all content is added
        addPageNumbers(pdf);

        // Save the PDF
        pdf.save("document.pdf");
      } catch (err) {
        alert("Error loading JSON data: " + err.message);
      }
    }

    generateTable();

    // Function to add page numbers
    function addPageNumbers(pdf) {
      const pageCount = pdf.internal.getNumberOfPages();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setFontSize(10);

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i); // Go to the page
        pdf.text(
          `${i}/${pageCount}`, // Format: x/y
          pageWidth - 20, // Position near the right edge
          pageHeight - 10 // Position near the bottom edge
        );
      }
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

// Save form data whenever an input changes
document.getElementById("pdfForm").addEventListener("input", saveFormData);

// Load form data when the page loads
window.addEventListener("load", loadFormData);
