import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useAppContext } from '../context/AppContext';
import { filterPhotosByTag, sortPhotosByTime } from '../utils/mapUtils';
import { TraceLine } from './TraceLine';
import 'leaflet/dist/leaflet.css';

const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const MapContainerComponent = () => {
  const { photos, selectedTag, showTrace } = useAppContext();
  const [center, setCenter] = useState([35.8617, 104.1954]);
  const [zoom, setZoom] = useState(4);

  const filteredPhotos = filterPhotosByTag(photos, selectedTag);
  const sortedPhotos = sortPhotosByTime(filteredPhotos.filter(p => p.gps));

  const handleMarkerClick = (photo) => {
    if (photo.gps) {
      setCenter([photo.gps.latitude, photo.gps.longitude]);
      setZoom(10);
    }
  };

  return (
    <div className="h-full w-full relative" style={{ height: '100%', width: '100%', minHeight: '400px' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
        />
        
        <MapController center={center} zoom={zoom} />

        <TraceLine />

        {sortedPhotos.map((photo) => (
          photo.gps && (
            <Marker
              key={photo.id}
              position={[photo.gps.latitude, photo.gps.longitude]}
              eventHandlers={{
                click: () => handleMarkerClick(photo)
              }}
            >
              <Popup>
                <div className="p-3 min-w-[220px]">
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.name}
                    className="w-full h-auto rounded-lg mb-3 border border-gray-200"
                  />
                  <h3 className="font-semibold text-sm text-gray-800 mb-2">{photo.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {photo.gps.address || '未知位置'}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(photo.createTime).toLocaleString('zh-CN')}
                  </p>
                  {photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {photo.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {sortedPhotos.length === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-95 border border-gray-200 px-6 py-3 rounded-lg shadow-sm z-[1000]">
          <p className="text-sm text-gray-600">暂无照片标记，上传照片后地图上会显示标记点</p>
        </div>
      )}
    </div>
  );
};

export default MapContainerComponent;
