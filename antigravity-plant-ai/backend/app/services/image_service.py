
import cv2
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)

class ImageProcessingService:
    @staticmethod
    def estimate_height(img_path: str):
        """
        Estimates plant height using image processing.
        In a real scenario, this requires a reference object in the frame.
        For AgriRakshak, we use a heuristic based on pixel height relative to frame.
        """
        try:
            img = cv2.imread(img_path)
            if img is None:
                return 0.0
            
            h, w, _ = img.shape
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Find the largest contour (assuming it's the plant)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                return 15.0 # Mock default
            
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w_box, h_box = cv2.boundingRect(largest_contour)
            
            # Calculate height in cm (Simplified ratio: 100px = 10cm)
            estimated_height = (h_box / h) * 50.0 # Assuming plant takes % of a 50cm frame
            return round(float(estimated_height), 2)
            
        except Exception as e:
            logger.error(f"Height estimation error: {e}")
            return 12.5 # Default mockup

    @staticmethod
    def analyze_leaf_color(img_path: str):
        """Analyzes green intensity to detect nutrient health."""
        try:
            img = cv2.imread(img_path)
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            
            # Green range
            lower_green = np.array([35, 40, 40])
            upper_green = np.array([85, 255, 255])
            
            mask = cv2.inRange(hsv, lower_green, upper_green)
            green_pixels = cv2.countNonZero(mask)
            total_pixels = img.shape[0] * img.shape[1]
            
            intensity = (green_pixels / total_pixels) * 100
            # Normalize score out of 100
            health_score = min(100, intensity * 2) 
            return round(float(health_score), 2)
            
        except Exception as e:
            logger.error(f"Color analysis error: {e}")
            return 85.0 # Default mockup
