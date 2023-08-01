import matplotlib.pyplot as plt
import numpy as np
from PIL import Image


img = Image.open("icon.png")

img=img.resize((60,60))
img.save("icon(60x60).png")
