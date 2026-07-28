let selectedFile = null;

const cameraInput = document.getElementById('cameraInput');
const galleryInput = document.getElementById('galleryInput');
const uploadForm = document.getElementById('uploadForm');
const imagePreview = document.getElementById('imagePreview');
const captionInput = document.getElementById('caption');
const galleryGrid = document.getElementById('galleryGrid');
const submitBtn = document.getElementById('submitBtn');

// Handle file selection from either Camera or Gallery inputs
[cameraInput, galleryInput].forEach(input => {
  input.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      selectedFile = e.target.files[0];
      
      // Display image preview
      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.src = event.target.result;
        uploadForm.classList.remove('hidden');
      };
      reader.readAsDataURL(selectedFile);
    }
  });
});

// Handle Photo Upload to Supabase
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!selectedFile) return;

  submitBtn.disabled = true;
  submitBtn.innerText = 'Uploading...';

  try {
    // 1. Upload Image file to Supabase Storage
    const fileName = `${Date.now()}_${selectedFile.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('wedding-gallery')
      .upload(fileName, selectedFile);

    if (storageError) throw storageError;

    // 2. Get Public URL for uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('wedding-gallery')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // 3. Save Image URL & Caption into PostgreSQL Database
    const { error: dbError } = await supabase
      .from('wedding-photos')
      .insert([{ image_url: imageUrl, caption: captionInput.value }]);

    if (dbError) throw dbError;

    // Reset Form and Refresh Feed
    alert('Photo uploaded successfully!');
    uploadForm.reset();
    uploadForm.classList.add('hidden');
    selectedFile = null;
    fetchGalleryPhotos();

  } catch (error) {
    console.error('Error uploading:', error);
    alert('Failed to upload photo. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = 'Upload to Gallery';
  }
});

// Fetch and Render Gallery Items
async function fetchGalleryPhotos() {
  const { data: photos, error } = await supabase
    .from('wedding-photos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gallery:', error);
    galleryGrid.innerHTML = '<p>Could not load gallery images.</p>';
    return;
  }

  if (photos.length === 0) {
    galleryGrid.innerHTML = '<p>No photos uploaded yet. Be the first!</p>';
    return;
  }

  galleryGrid.innerHTML = photos.map(photo => `
    <div class="gallery-card">
      <img src="${photo.image_url}" alt="Wedding moment" loading="lazy">
      <p>${escapeHtml(photo.caption || '')}</p>
    </div>
  `).join('');
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}

// Initial Load
fetchGalleryPhotos();