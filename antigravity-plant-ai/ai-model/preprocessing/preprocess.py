import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split

IMG_SIZE = 224

def load_data(data_dir):
    """
    Load images and labels from the dataset directory.
    Assumes structure: data_dir/class_name/image.jpg
    """
    images = []
    labels = []
    class_names = os.listdir(data_dir)
    
    for class_index, class_name in enumerate(class_names):
        class_dir = os.path.join(data_dir, class_name)
        if not os.path.isdir(class_dir):
            continue
            
        for img_name in os.listdir(class_dir):
            img_path = os.path.join(class_dir, img_name)
            try:
                img = cv2.imread(img_path)
                img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
                img = img / 255.0  # Normalize
                images.append(img)
                labels.append(class_index)
            except Exception as e:
                print(f"Error loading {img_path}: {e}")
                
    return np.array(images), np.array(labels), class_names

def preprocess_image(image_path):
    """
    Preprocess a single image for inference.
    """
    img = cv2.imread(image_path)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img / 255.0
    return np.expand_dims(img, axis=0)
