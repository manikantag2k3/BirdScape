REM Define some environment variables
SET IMAGE_NAME="text-to-image-api-service"
SET BASE_DIR="%cd%"

REM Build the image based on the Dockerfile
docker build -t %IMAGE_NAME% -f Dockerfile .

REM Run the container
docker run --rm --name %IMAGE_NAME% -ti ^
--mount type=bind,source=%BASE_DIR%,target=/app ^
-p 9000:9000 ^
-e DEV=1 %IMAGE_NAME%
