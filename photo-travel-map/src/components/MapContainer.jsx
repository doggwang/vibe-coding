import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useApp } from '../context/AppContext';
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
  const { photos, selectedTag, showTrace, selectedPhoto, setSelectedPhoto } = useApp();
  const [center, setCenter] = useState([35.8617, 104.1954]);
  const [zoom, setZoom] = useState(4);
  const [locating, setLocating] = useState(false);

  const filteredPhotos = filterPhotosByTag(photos, selectedTag);
  const sortedPhotos = sortPhotosByTime(filteredPhotos.filter(p => p.gps));

  useEffect(() => {
    if (selectedPhoto) {
      const photo = photos.find(p => p.id === selectedPhoto);
      if (photo && photo.gps) {
        setCenter([photo.gps.latitude, photo.gps.longitude]);
        setZoom(12);
      }
    }
  }, [selectedPhoto, photos]);

  const handleMarkerClick = (photo) => {
    if (photo.gps) {
      setCenter([photo.gps.latitude, photo.gps.longitude]);
      setZoom(12);
      setSelectedPhoto(photo.id);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('您的浏览器不支持定位功能');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCenter([latitude, longitude]);
        setZoom(12);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        let errorMessage = '定位失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '您拒绝了定位请求，请在浏览器设置中允许定位';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '定位请求超时';
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        className="z-0"
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
                    className="w-full h-auto rounded-xl mb-3 border-2 border-slate-200 shadow-lg"
                  />
                  <h3 className="font-semibold text-sm text-slate-800 mb-2">{photo.name}</h3>
                  <p className="text-xs text-slate-600 mb-2">
                    {photo.gps.address || '未知位置'}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    {new Date(photo.createTime).toLocaleString('zh-CN')}
                  </p>
                  {photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {photo.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg font-medium shadow-sm"
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
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-slate-200 px-6 py-3 rounded-2xl shadow-xl z-[1000]">
          <p className="text-sm text-slate-600">暂无照片标记，上传照片后地图上会显示标记点</p>
        </div>
      )}

      <button
        onClick={handleLocateMe}
        disabled={locating}
        className="absolute top-4 right-4 z-[1000] p-3 bg-white border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
        title="定位到我"
      >
        {locating ? (
          <div className="w-5 h-5 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default MapContainerComponent;
