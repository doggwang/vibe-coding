import exifr from 'exifr';

export const parsePhotoExif = async (file) => {
  try {
    const exifData = await exifr.parse(file);
    
    const result = {
      gps: null,
      createTime: null,
      cameraInfo: null
    };

    if (exifData) {
      if (exifData.latitude && exifData.longitude) {
        result.gps = {
          latitude: exifData.latitude,
          longitude: exifData.longitude,
          address: null
        };
      }

      if (exifData.DateTimeOriginal || exifData.CreateDate || exifData.ModifyDate) {
        result.createTime = exifData.DateTimeOriginal || exifData.CreateDate || exifData.ModifyDate;
      }

      if (exifData.Make || exifData.Model) {
        result.cameraInfo = `${exifData.Make || ''} ${exifData.Model || ''}`.trim();
      }
    }

    return result;
  } catch (error) {
    console.error('解析EXIF失败:', error);
    return {
      gps: null,
      createTime: null,
      cameraInfo: null
    };
  }
};

export const createThumbnail = (file, maxWidth = 300) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      const width = maxWidth;
      const height = img.height * scale;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      }, 'image/jpeg', 0.8);
    };

    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const createPhotoUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
