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

    const corsProxy = "https://cors-anywhere.herokuapp.com/"; // CORS proxy URL
    const proxiedUrl = corsProxy + jsonUrl; // Combine proxy and JSON URL

    const pdf = new jsPDF();

    // Add Title
    pdf.setFontSize(18);
    pdf.text(title, 20, 30);

    // Add Details
    pdf.setFontSize(12);
    const detailLines = pdf.splitTextToSize(details, 170);
    pdf.text(detailLines, 20, 40);

    // Fetch table data
    try {
      const response = await fetch(proxiedUrl); // Use the proxied URL
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid JSON format");

      // Extract headers and rows for autoTable
      const headers = Object.keys(data[0]).map((key) => ({
        title: key,
        dataKey: key,
      }));

      // Map rows to match the headers
      const rows = data.map((row) =>
        headers.map((header) => row[header.dataKey])
      );

      // Add table to PDF using autoTable
      pdf.autoTable({
        head: [headers.map((header) => header.title)], // Extract header titles
        body: rows, // Use the mapped rows
        startY: 60,
        theme: "grid", // Optional: "striped", "grid", or "plain"
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [41, 128, 185], // Optional: Header background color
          textColor: 255, // Optional: Header text color
          fontStyle: "bold",
        },
      });

      // Save the PDF
      pdf.save("document.pdf");
    } catch (err) {
      alert("Error loading JSON data: " + err.message);
    }
  });
