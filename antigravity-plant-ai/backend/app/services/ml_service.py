
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MLService:
    def __init__(self):
        self.model = None
        self.classes = ["Healthy", "Leaf Spot", "Rust", "Powdery Mildew", "Blight"] # Example classes
        self._load_model()

    def _load_model(self):
        """Loads the TensorFlow model once at startup."""
        if os.path.exists(settings.MODEL_PATH):
            try:
                self.model = tf.keras.models.load_model(settings.MODEL_PATH)
                logger.info(f"Model loaded successfully from {settings.MODEL_PATH}")
            except Exception as e:
                logger.error(f"Error loading model: {e}")
                self.model = None
        else:
            logger.warning(f"Model file not found at {settings.MODEL_PATH}. Prediction will return mock data.")

    def predict(self, img_path: str):
        """Predicts plant disease from an image."""
        if self.model is None:
            # Mock prediction for development
            idx = np.random.randint(0, len(self.classes))
            return {
                "disease": self.classes[idx],
                "confidence": float(np.random.uniform(0.85, 0.99)),
                "is_mock": True
            }

        try:
            img = image.load_img(img_path, target_size=(settings.IMAGE_SIZE, settings.IMAGE_SIZE))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0

            predictions = self.model.predict(img_array)
            idx = np.argmax(predictions[0])
            
            return {
                "disease": self.classes[idx] if idx < len(self.classes) else "Unknown",
                "confidence": float(predictions[0][idx]),
                "is_mock": False
            }
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise e

# Create a singleton instance
ml_service = MLService()
