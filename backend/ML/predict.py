import sys
import cv2
import numpy as np
from ultralytics import YOLO
from tensorflow.keras import models
from tensorflow.keras.preprocessing import image as ImagePreprocessor
from enum import Enum
import tensorflow as tf
import os

# Get the Python version
python_version = sys.version

# Get the TensorFlow version
tensorflow_version = tf.__version__

# Print the versions
print(f"Python version: {python_version}")
print(f"TensorFlow version: {tensorflow_version}")

class Dimension(Enum):
    Front = 1
    Back = 2
    Corner = 3
    Side = 4
    Camera = 5



def makePrediction(image, model_file):
    # Rescale the image to be of dimension 130x130
    image = cv2.resize(image, (130, 130))
    model = models.load_model(model_file)
    img_array = ImagePreprocessor.img_to_array(image)
    img_array = np.expand_dims(img_array, axis=0) / 255.0  # normalize the image array

    # Make predictions
    predictions = model.predict(img_array)
    # Get the predicted class
    predicted_class_index = np.argmax(predictions[0])
    return predicted_class_index + 1


def predict(image, dimen):
    # Specify the path to the trained model file
    if dimen == Dimension.Front:
        model_file = '/Users/aliraza/Desktop/FYP/Chat/backend/ML/Trained_Models/front_model.keras'
        return makePrediction(image, model_file)
    elif dimen == Dimension.Back:
        model_file = '/Users/aliraza/Desktop/FYP/Chat/backend/ML/Trained_Models/back_model.keras'
        return makePrediction(image, model_file)
    elif dimen == Dimension.Corner:
        model_file = '/Users/aliraza/Desktop/FYP/Chat/backend/ML/Trained_Models/corners_model.keras'
        return makePrediction(image, model_file)
    elif dimen == Dimension.Side:
        model_file = '/Users/aliraza/Desktop/FYP/Chat/backend/ML/Trained_Models/sides_model.keras'
        return makePrediction(image, model_file)
    elif dimen == Dimension.Camera:
        model_file = '/Users/aliraza/Desktop/FYP/Chat/backend/ML/Trained_Models/camera_model.keras'
        return makePrediction(image, model_file)
    else:
        raise ValueError("Invalid dimension")

# Resize image to 640x640 (The segmentation model also trained on 640x640 images)
def resize_image(img, size=640):
    H, W, _ = img.shape
    if H > W:
        img = cv2.resize(img, (size, int(size * H / W)))
    else:
        img = cv2.resize(img, (int(size * W / H), size))
    return img

def convertToGrayScale(image):
    grayScaleImage = image
    return grayScaleImage

# Segment image using YOLOv8 model
def segment_image(input_path, output_path, model_path):
    try:
        print(f"Loading model from {model_path}...")
        model = YOLO(model_path)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        sys.exit(2)

    try:
        print(f"Reading image from {input_path}...")
        img = cv2.imread(input_path)
        img = resize_image(img)
        H, W, _ = img.shape
    except Exception as e:
        print(f"Error reading or processing image: {e}")
        sys.exit(3)

    try:
        print("Running model on the image...")
        results = model(img)
    except Exception as e:
        print(f"Error running model: {e}")
        sys.exit(4)

    try:
        # Check if output directory exists, if not create it
        if not os.path.exists(output_path):
            os.makedirs(output_path)

        for result in results:
            for mask in result.masks.data:
                mask = mask.numpy() * 255
                mask = cv2.resize(mask, (W, H)).astype(np.uint8)
                # Generate the segmented output file using the input image and the output_mask
                segmented_img = cv2.bitwise_and(img, img, mask=mask)
                grayScaleImage = convertToGrayScale(segmented_img)
                output_file = os.path.join(output_path, "segmented_image.jpg")
                cv2.imwrite(output_file, grayScaleImage)
                print(f"Saved segmented image to {grayScaleImage}")
                return grayScaleImage
    except Exception as e:
        print(f"Error saving segmented image: {e}")
        sys.exit(5)

def getDimension(dimension):
    if dimension == "Front":
        return Dimension.Front
    elif dimension == "Back":
        return Dimension.Back
    elif dimension == "Corner":
        return Dimension.Corner
    elif dimension == "Side":
        return Dimension.Side
    elif dimension == "Camera":
        return Dimension.Camera
    else:
        raise ValueError("Invalid dimension")
if __name__ == '__main__':
    print("Segmenting image...")
    sys.stdout.flush()
    if len(sys.argv) != 5:
        print("Usage: python predict.py <input_path> <output_path> <model_path> <dimension_of_phone>")
        sys.exit(20)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    model_path = sys.argv[3]
    dimension = sys.argv[4]

    dimen = getDimension(dimension)

    print(f"Input path: {input_path}")
    print(f"Model path: {model_path}")
    print(f"Output path: {output_path}")
    print(f"Dimension of phone: {dimen}")
    sys.stdout.flush()

    img = segment_image(input_path, output_path, model_path)
    print("Segmentation completed successfully.")

    print("Predicting...")
    sys.stdout.flush()

    predictionResult = predict(img, dimen)
    print(f"Predicted Scores: {predictionResult}")
    print("Prediction completed successfully.")

