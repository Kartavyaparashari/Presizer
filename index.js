const { jsPDF } = window.jspdf;
let base64Image = '';
let cropper = null;

const dropArea = document.getElementById('drop-area');
const uploadInput = document.getElementById('upload-photo');
const cropSection = document.getElementById('crop-section');
const cropImage = document.getElementById('crop-image');
const cropButton = document.getElementById('crop-button');
const layoutSection = document.getElementById('layout-section');
const printSection = document.getElementById('print-section');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);
dropArea.addEventListener('click', () => uploadInput.click());

uploadInput.addEventListener('change', function(e) {
    handleFiles(this.files);
});

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            cropImage.src = e.target.result;
            document.getElementById('input-section').style.display = 'none';
            cropSection.style.display = 'block';
            initCropper();
        };

        reader.readAsDataURL(file);
    }
}

function initCropper() {
    if (cropper) {
        cropper.destroy();
    }
    cropper = new Cropper(cropImage, {
        aspectRatio: 35 / 45,
        viewMode: 1,
        minCropBoxWidth: 100,
        minCropBoxHeight: 100,
    });
}

cropButton.addEventListener('click', function() {
    const croppedCanvas = cropper.getCroppedCanvas({
        width: 350,
        height: 450
    });
    base64Image = croppedCanvas.toDataURL('image/jpeg');
    const previewImage = document.getElementById('preview-image');
    previewImage.src = base64Image;
    previewImage.style.display = 'block';
    document.getElementById('preview-container').style.display = 'block';
    cropSection.style.display = 'none';
    layoutSection.style.display = 'block';
});

document.getElementById('create-layout').addEventListener('click', function() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const photoGrid = document.querySelector('.photo-grid');

    if (!base64Image) {
        alert("Please upload and crop an image first.");
        return;
    }

    photoGrid.innerHTML = '';
    document.getElementById('layout-container').style.display = 'block';

    // Always create 42 slots (6x7 grid)
    for (let i = 0; i < 42; i++) {
        const img = document.createElement('img');
        if (i < quantity) {
            img.src = base64Image;
        } else {
            img.style.visibility = 'hidden'; // Hide extra slots
        }
        photoGrid.appendChild(img);
    }

    // Show print section after creating layout
    printSection.style.display = 'block';
});

document.getElementById('choose-another').addEventListener('click', function() {
    document.getElementById('input-section').style.display = 'block';
    layoutSection.style.display = 'none';
    document.getElementById('layout-container').style.display = 'none';
    document.getElementById('preview-container').style.display = 'none';
    printSection.style.display = 'none';
    base64Image = '';
});

function generatePDF() {
    const doc = new jsPDF('p', 'mm', 'a4');
    const imgElements = document.querySelectorAll('.photo-grid img');
    const images = Array.from(imgElements).filter(img => img.style.visibility !== 'hidden');

    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 10;
    const marginTop = 10;
    const imgWidth = 28;
    const imgHeight = 36;
    const gapHorizontal = 5;
    const gapVertical = 5;

    images.forEach((img, index) => {
        const col = index % 6;
        const row = Math.floor(index / 6);
        const x = marginLeft + col * (imgWidth + gapHorizontal);
        const y = marginTop + row * (imgHeight + gapVertical);

        doc.addImage(img.src, 'JPEG', x, y, imgWidth, imgHeight);
    });

    return doc;
}

document.getElementById('print-pdf').addEventListener('click', function() {
    const doc = generatePDF();
    window.open(doc.output('bloburl'), '_blank');
});

document.getElementById('download-pdf').addEventListener('click', function() {
    const doc = generatePDF();
    doc.save('passport_photos.pdf');
});