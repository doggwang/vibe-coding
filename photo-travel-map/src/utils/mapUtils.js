export const DEFAULT_CENTER = [35.8617, 104.1954];
export const DEFAULT_ZOOM = 4;

export const getMarkerIcon = (color = '#3b82f6') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

export const sortPhotosByTime = (photos) => {
  return [...photos].sort((a, b) => {
    const timeA = a.createTime ? new Date(a.createTime).getTime() : 0;
    const timeB = b.createTime ? new Date(b.createTime).getTime() : 0;
    return timeA - timeB;
  });
};

export const filterPhotosByTag = (photos, selectedTag) => {
  if (!selectedTag) return photos;
  return photos.filter(photo => photo.tags.includes(selectedTag));
};

export const filterPhotosByTimeRange = (photos, startDate, endDate) => {
  if (!startDate && !endDate) return photos;
  
  return photos.filter(photo => {
    if (!photo.createTime) return false;
    const photoDate = new Date(photo.createTime).getTime();
    
    if (startDate && photoDate < new Date(startDate).getTime()) return false;
    if (endDate && photoDate > new Date(endDate).getTime()) return false;
    
    return true;
  });
};

export const formatAddress = (address) => {
  if (!address) return '未知位置';
  return address.length > 50 ? address.substring(0, 50) + '...' : address;
};

export const formatDate = (dateString) => {
  if (!dateString) return '未知时间';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
