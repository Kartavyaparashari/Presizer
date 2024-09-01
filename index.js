 const { jsPDF } = window.jspdf;
        let base64Image = '';
        let cropper = null;

        const dropArea = document.getElementById('drop-area');
        const uploadInput = document.getElementById('upload-photo');
        const captureInput =document.getElementById('capture');
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
        captureInput.addEventListener('change', function(e) {  // Capture button handling
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
            createLayout();
            printSection.style.display = 'block';
        });

        function createLayout() {
            const layoutContainer = document.querySelector('.photo-grid');
            const quantity = parseInt(document.getElementById('quantity').value);
            const blanks = parseInt(document.getElementById('blanks').value);
            const totalImages = quantity + blanks;

            layoutContainer.innerHTML = ''; // Clear the grid

            for (let i = 0; i < 42; i++) {
                const img = document.createElement('img');
                if (i < blanks) {
                    img.style.backgroundColor = '#ffffff'; // Blank image with white background
                    img.style.border = '1px solid #ddd'; // Optional border for blank images
                } else if (i < totalImages) {
                    img.src = base64Image;
                } else {
                    img.style.visibility = 'hidden'; // Hide extra slots
                }
                layoutContainer.appendChild(img);
            }

            document.getElementById('layout-container').style.display = 'block';
        }

        document.getElementById('print-pdf').addEventListener('click', function() {
            generatePDF(false);
        });

        document.getElementById('download-pdf').addEventListener('click', function() {
            generatePDF(true);
        });

        document.getElementById('choose-another').addEventListener('click', function() {
            window.location.reload();
        });

        function generatePDF(download = false) {
            const layoutContainer = document.querySelector('.photo-grid');
            const images = layoutContainer.querySelectorAll('img');
            const pdf = new jsPDF('portrait', 'mm', 'a4');

            const pageWidth = 210;
            const pageHeight = 297;
            const marginLeft = 3.6; // Further decreased left margin
            const marginTop = 2; // Further decreased top margin for first row
            const imgWidth = 30; // Slightly adjusted for better fit
            const imgHeight = 39; // Slightly adjusted for better fit
            const gapHorizontal = 3.5; // Further decreased gap horizontally
            const gapVertical = 3; // Further decreased gap vertically

            let x = marginLeft;
            let y = marginTop;

            images.forEach((img, index) => {
                if (index % 6 === 0 && index !== 0) { // Check for new row
                    x = marginLeft;
                    y += imgHeight + gapVertical;
                }
                if (img.src) {
                    pdf.addImage(img.src, 'JPEG', x, y, imgWidth, imgHeight);
                }
                x += imgWidth + gapHorizontal;
            });

            // Ensure the last row is included in the PDF
            if (y + imgHeight > pageHeight) {
                pdf.addPage();
                x = marginLeft;
                y = marginTop;
            }

            if (download) {
                pdf.save('passport_photos.pdf');
            } else {
                pdf.autoPrint();
                window.open(pdf.output('bloburl'), '_blank');
            }
        }
