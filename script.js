const categories = [
    {id:"quiz", title:"Quiz"},
    {id:"longquiz", title:"Long Quiz"},
    {id:"examination", title:"Examination"},
    {id:"activity", title:"Activity"},
    {id:"project", title:"Project"}
];

const container = document.getElementById("categories");

function getFiles(id) {
    try { return JSON.parse(localStorage.getItem("smjobs_" + id) || "[]"); }
    catch { return []; }
}

function saveFiles(id, files) {
    try {
        localStorage.setItem("smjobs_" + id, JSON.stringify(files));
    } catch {
        alert("The browser storage is full. Please remove some files.");
    }
}

function renderCategory(cat, index) {
    const files = getFiles(cat.id);

    const box = document.createElement("article");
    box.className = "category-box";
    box.id = cat.id;

    box.innerHTML = `
        <div class="category-header">
            <div>
                <div class="category-number">${String(index + 1).padStart(2,"0")}</div>
                <h3>${cat.title}</h3>
            </div>
            <label class="upload-button">
                + Upload Files
                <input type="file" multiple data-category="${cat.id}">
            </label>
        </div>
        <p class="upload-info">Upload pictures, PDF files, documents, and other academic work for this category.</p>
        <div class="file-grid" id="grid-${cat.id}"></div>
    `;

    container.appendChild(box);
    renderFiles(cat.id);

    box.querySelector("input").addEventListener("change", async (event) => {
        const selected = [...event.target.files];
        const current = getFiles(cat.id);

        for (const file of selected) {
            const dataUrl = await fileToDataURL(file);
            current.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: dataUrl
            });
        }

        saveFiles(cat.id, current);
        renderFiles(cat.id);
        event.target.value = "";
    });
}

function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function renderFiles(id) {
    const grid = document.getElementById("grid-" + id);
    const files = getFiles(id);

    if (!files.length) {
        grid.innerHTML = `<div class="empty-message">No files uploaded yet.</div>`;
        return;
    }

    grid.innerHTML = files.map((file, index) => {
        const isImage = file.type.startsWith("image/");
        const preview = isImage
            ? `<img src="${file.data}" alt="${escapeHTML(file.name)}">`
            : `<div class="file-icon">📄</div>`;

        return `
            <div class="file-card">
                <div class="file-preview">${preview}</div>
                <div class="file-details">
                    <div class="file-name" title="${escapeHTML(file.name)}">${escapeHTML(file.name)}</div>
                    <div class="file-actions">
                        <a class="view-btn" href="${file.data}" target="_blank">View</a>
                        <a class="download-btn" href="${file.data}" download="${escapeHTML(file.name)}">Download</a>
                        <button class="delete-btn" onclick="deleteFile('${id}', ${index})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function deleteFile(id, index) {
    if (!confirm("Delete this file?")) return;
    const files = getFiles(id);
    files.splice(index, 1);
    saveFiles(id, files);
    renderFiles(id);
}

function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[char]));
}

categories.forEach(renderCategory);

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

menuBtn.addEventListener("click", () => {
    nav.classList.toggle("active");
});

document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("active"));
});
