import tensorflow.keras.models as models
import cv2

# Specify the path to the trained model file
model_file = '/Users/aliraza/Desktop/FYP/Chat/backend/ML/Trained_Models/corners_models.keras'

# Load the trained model
model = models.load_model(model_file)


# Define a function to calculate the corner rate of an image
def corner_rate(image):
    # Resize the image to 640x640
    image = cv2.resize(image, (640, 640))

    # Preprocess the image
    image = image / 255.0
    image = np.expand_dims(image, axis=0)

    # Predict the corner rate using the trained model
    corner_rate = model.predict(image)

    return corner_rate[0][0]