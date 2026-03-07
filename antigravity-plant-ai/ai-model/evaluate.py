import tensorflow as tf
from preprocessing.preprocess import load_data
import os

MODEL_PATH = 'models/plant_disease_model.h5'
DATA_DIR = 'dataset'

def evaluate_model():
    if not os.path.exists(MODEL_PATH):
        print("Model not found. Please train the model first.")
        return

    print("Loading model...")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    print("Loading test data...")
    X, y, class_names = load_data(DATA_DIR)
    
    print("Evaluating...")
    loss, accuracy = model.evaluate(X, y)
    print(f"Test Loss: {loss:.4f}")
    print(f"Test Accuracy: {accuracy:.4f}")

if __name__ == "__main__":
    evaluate_model()
