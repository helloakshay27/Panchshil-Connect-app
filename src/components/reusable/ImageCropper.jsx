import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";

export const ImageCropper = ({
    open,
    image,
    formData,
    setFormData,
    onComplete,
    requiredRatios = [1], // e.g., [16/9, 9/16]
    requiredRatioLabel = "1:1",
    allowedRatios = [{ label: "1:1", ratio: 1 }],
    ...props
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [aspect, setAspect] = useState(allowedRatios[0].ratio);
    const [aspectLabel, setAspectLabel] = useState(allowedRatios[0].label);
    const [imageRatio, setImageRatio] = useState(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (image) {
            const img = new Image();
            img.onload = () => {
                const ratio = img.naturalWidth / img.naturalHeight;
                setImageRatio(ratio);
                setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                setCrop({ x: 0, y: 0 });
                console.log(`Image dimensions: ${img.naturalWidth}x${img.naturalHeight}, Ratio: ${ratio}`);
            };
            img.src = image;
        }
    }, [image]);

    const handleAspectChange = (targetAspect, label) => {
        setAspect(targetAspect);
        setAspectLabel(label);
    };

    const isRatioAcceptable = (actual, expectedList, tolerance = 0.1) => {
        return expectedList.some(expected => Math.abs(actual - expected) <= tolerance);
    };

    const isGridSizeValid = () => {
        if (aspect === 16 / 9) {
            return imageDimensions.width >= 400 && imageDimensions.height >= 225;
        }
        return true;
    };

    const getContainerDimensions = () => {
        const baseSize = 300;
        if (aspect === 16 / 9) return { width: baseSize * 1.2, height: baseSize };
        if (aspect === 9 / 16) return { width: baseSize, height: baseSize * 1.2 };
        if (aspect === 3 / 2) return { width: baseSize * 1.1, height: baseSize * (2 / 3) };
        return { width: baseSize, height: baseSize };
    };

    if (!open || !image) return null;

    const { width, height } = getContainerDimensions();

    const base64ToFile = (base64, filename) => {
        const arr = base64.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
            <div className="modal-dialog modal-dialog-centered" style={{ borderRadius: "12px" }}>
                <div className="modal-content rounded-3 overflow-hidden">
                    <div className="modal-header border-0 justify-content-center pt-4 pb-2">
                        <h5 className="modal-title text-center text-orange-600 fs-5 fw-semibold">Crop Image</h5>
                    </div>
                    <div className="modal-body px-4">
                        <div className="d-flex justify-content-center mb-4 flex-wrap" style={{ gap: "8px" }}>
                            {allowedRatios.map(({ label, ratio }) => (
                                <button
                                    key={label}
                                    onClick={() => handleAspectChange(ratio, label)}
                                    className={`px-3 py-2 rounded ${aspect === ratio
                                            ? "purple-btn2 text-white"
                                            : "border border-purple-500 text-purple-600 bg-white"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div
                            style={{
                                position: "relative",
                                height,
                                background: "#fff",
                                borderRadius: "8px",
                                overflow: "hidden",
                            }}
                        >
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={1}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                                {...props}
                            />
                        </div>
                    </div>
                    <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex justify-content-end" style={{ gap: "10px" }}>
                        <button
                            className="px-4 py-2 rounded border border-gray-400 text-gray-700 bg-white hover:bg-gray-100"
                            onClick={() => onComplete(null)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 rounded purple-btn2 text-white"
                            onClick={async () => {
                                if (croppedAreaPixels && image) {
                                    const requiredLabels = requiredRatios.map(r => {
                                        const match = allowedRatios.find(ar => ar.ratio === r);
                                        return match?.label || r.toFixed(2);
                                    }).join(" or ");

                                    if (!isRatioAcceptable(imageRatio, requiredRatios, 0.1)) {
                                        alert(`❌ Invalid image.\nOriginal image ratio (${imageRatio?.toFixed(2)}) must match one of the allowed ratios: ${requiredLabels}`);
                                        return;
                                    }

                                    if (!isRatioAcceptable(imageRatio, [aspect], 0.25)) {
                                        alert(`❌ Cannot crop this image as ${aspectLabel}.\nThe original image shape (${imageRatio.toFixed(2)}) does not fit the selected aspect.`);
                                        return;
                                    }

                                    if (aspect === 16 / 9 && !isGridSizeValid()) {
                                        alert("❌ Image too small. Must be at least 400x225 for 16:9.");
                                        return;
                                    }

                                    const canvas = document.createElement("canvas");
                                    const img = new Image();
                                    img.crossOrigin = "anonymous";
                                    img.src = image;
                                    img.onload = () => {
                                        const ctx = canvas.getContext("2d");
                                        canvas.width = croppedAreaPixels.width;
                                        canvas.height = croppedAreaPixels.height;
                                        ctx.drawImage(
                                            img,
                                            croppedAreaPixels.x,
                                            croppedAreaPixels.y,
                                            croppedAreaPixels.width,
                                            croppedAreaPixels.height,
                                            0,
                                            0,
                                            croppedAreaPixels.width,
                                            croppedAreaPixels.height
                                        );
                                        const croppedBase64 = canvas.toDataURL("image/png");
                                        const croppedFile = base64ToFile(croppedBase64, "cropped_image.png");
                                        onComplete({ base64: croppedBase64, file: croppedFile });
                                        setFormData({ ...formData, banner_video: croppedFile });
                                    };
                                }
                            }}
                        >
                            Finish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
