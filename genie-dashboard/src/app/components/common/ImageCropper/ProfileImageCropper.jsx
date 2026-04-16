import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X } from "lucide-react";
import { getCroppedImg } from "../../../utils/cropImage";

export default function ProfileImageCropper({ image, onClose, onCropComplete }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropCompleteHandler = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleCropSave = async () => {
        try {
            const blob = await getCroppedImg(image, croppedAreaPixels, zoom, 1);
            onCropComplete(blob);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-white rounded-xl p-4 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3">
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="relative w-full h-80">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // 🔥 1:1 = 2x2 ratio
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropCompleteHandler}
                    />
                </div>

                <div className="flex justify-between mt-4">
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(e.target.value)}
                    />
                    <button
                        onClick={handleCropSave}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Crop & Save
                    </button>
                </div>
            </div>
        </div>
    );
}