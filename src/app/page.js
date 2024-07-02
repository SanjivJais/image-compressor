"use client";
import { useState } from "react";


export default function Home() {

  const [previews, setPreviews] = useState([])
  const [compressed, setCompressed] = useState(false)
  const [compressPercent, setCompressPercent] = useState(30)



  const handleFiles = (files) => {
    const filePreviews = [];

    for (let file of files) {
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        filePreviews.push({
          name: file.name,
          url: imageUrl,
          size: file.size,
        });

        if (filePreviews.length === files.length) {
          setPreviews(filePreviews);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const compressImage = (file, quality) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: file.type }));
          }, file.type, quality);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCompression = async () => {
    const compressedPreviews = await Promise.all(
      previews.map(async (preview) => {
        const response = await fetch(preview.url);
        const blob = await response.blob();
        const file = new File([blob], preview.name, { type: blob.type });
        const compressedFile = await compressImage(file, 1 - compressPercent / 100); // 70% quality
        const compressedUrl = URL.createObjectURL(compressedFile);
        return {
          name: compressedFile.name,
          url: compressedUrl,
          size: compressedFile.size
        };
      })
    );

    setPreviews(compressedPreviews);
    setCompressed(true)
  };

  const handleDownload = (url, fileName) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };



  return (
    <main className="flex flex-col h-screen w-screen items-center p-8">

      <div className="flex flex-col gap-2 justify-center items-center mt-8">
        <h1 className="font-semibold text-2xl">Image Compressor</h1>
        <p className="text-sm font-light">By Sanjiv Jaiswal</p>
      </div>

      <div className="my-10 text-base flex flex-col items-center justify-center bg-secondary h-96 lg:w-[70vw] md:w-[80vw] w-[90vw] rounded-md border-primary border-dotted border-2">

        {previews.length === 0 && <div
          className={`flex flex-col gap-2 justify-center items-center w-full h-full`}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('bg-secondaryLight');
          }}

          onDragLeave={(e) => {
            e.currentTarget.classList.remove('bg-secondaryLight');
          }}

          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('bg-secondaryLight');
            handleFiles(e.dataTransfer.files);
          }}

        >
          <p className="opacity-70">Drag your image here</p>
          <p className="opacity-70">or</p>
          <input type="file" onChange={(e) => handleFiles(e.target.files)} accept="image/*" id="imageInput" className="hidden" multiple />
          <label htmlFor="imageInput" className="bg-primary font-medium cursor-pointer w-36 h-12 flex items-center justify-center rounded-md">Choose image</label>
        </div>}

        <div id="previewContainer" className="grid lg:grid-cols-3 grid-cols-2 w-full overflow-auto gap-4 justify-center items-center p-4">
          {/* preview container */}
          {previews.map((file, index) => (
            <div key={index} className="flex flex-col gap-2">
              <p className="text-center text-sm">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
              <img
                src={file.url}
                alt={file.name}
                className="mx-auto h-auto w-full mt-2 rounded-lg max-w-80"
              />

              {compressed && <button
                className="px-4 py-2 rounded w-fit self-center mt-2 text-sm border-primary border-[1px]"
                onClick={() => handleDownload(file.url, file.name)}
              >
                Download
              </button>}

            </div>
          ))}


        </div>

      </div>
      {previews.length > 0 && (<div className="flex gap-4">


        <div className="text-white w-56">
          <div className="flex justify-between mb-1 text-sm font-medium">
            <label htmlFor="compression_range">Compress</label>
            <p>{compressPercent}%</p>
          </div>
          <input onChange={(e) => setCompressPercent(e.target.value)} id="compression_range" type="range" value={compressPercent} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
        </div>

        <button
          className="px-4 py-2 bg-primary text-white rounded-md"
          onClick={handleCompression}
          disabled={compressed}
        >
          Compress
        </button>
      </div>
      )}

    </main>
  );
}
