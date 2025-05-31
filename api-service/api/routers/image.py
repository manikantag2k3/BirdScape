import os
import io
from fastapi import APIRouter, Query
from starlette.responses import FileResponse
import uuid
from PIL import Image, ImageDraw, ImageFont


# Define Router
router = APIRouter()

# Routes


@router.post("/text2image")
async def text2audio(json_obj: dict):
    print(print(json_obj))

    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)

    # Generate a unique id
    file_id = uuid.uuid1()
    file_path = os.path.join(output_dir, str(file_id)+".png")

    img = Image.new('RGB', (300, 200), color=(73, 109, 137))
    d = ImageDraw.Draw(img)
    d.text((100, 100), json_obj["text"], fill=(255, 255, 0))

    # Save the image
    img.save(file_path)

    return {
        "image_path": file_path,
        "text": json_obj["text"]
    }


@router.get("/get_image")
async def get_audio_data(
        path: str = Query(..., description="Image path")
):
    print(path)
    return FileResponse(path, media_type="image/png")
