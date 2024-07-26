import random
from flask import Flask, jsonify, send_file, url_for
from flask_cors import CORS
from flask_talisman import Talisman
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import os
import threading
import pytz

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
Talisman(app)

# Cache to store today's comic
comic_cache = {
    'date': None,
    'title': None,
    'image_filename': None
}

# Get the absolute path to the images directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, 'images')

# Lock for thread-safe operations
lock = threading.Lock()

# Central Time Zone
CENTRAL_TZ = pytz.timezone('America/Chicago')

@app.route('/')
def home():
    today = datetime.now(CENTRAL_TZ).date()
    with lock:
        if comic_cache['date'] == today:
            comic_title = comic_cache['title']
            image_filename = comic_cache['image_filename']
        else:
            comic_url, comic_title, image_filename = fetch_comic()
            if comic_url:
                comic_cache['date'] = today
                comic_cache['title'] = comic_title
                comic_cache['image_filename'] = image_filename

    if image_filename:
        image_url = url_for('get_comic_image', filename=image_filename, _external=True)
        
        return jsonify(title=comic_title, image_url=image_url)
    else:
        return jsonify(message="Comic not found"), 404

@app.route('/images/<filename>')
def get_comic_image(filename):
    return send_file(os.path.join(IMAGES_DIR, filename))

def fetch_comic():
    # Define the date range
    start_year = 1950
    end_year = 2000

    # Get today's month and day
    today = datetime.now()
    month = today.strftime('%B')
    day = today.day

    # Try fetching the comic strip until found
    max_attempts = 10
    while max_attempts > 0:
        # Generate a random year within the range
        random_year = random.randint(start_year, end_year)
    
        # Construct the URL
        base_url = 'https://peanuts.fandom.com/wiki/'
        formatted_date = f'{month}_{random_year}_comic_strips'
        full_url = f'{base_url}{formatted_date}'

        # Scrape the page
        response = requests.get(full_url)
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find the comic strip image for the specific day
        comic_tag = soup.find('b', string=f'{month} {day}, {random_year}')
        if comic_tag:
            comic_image = comic_tag.find_next('img')
            if comic_image:
                comic_url = comic_image['data-src']

                # Determine the file extension
                file_extension = comic_url.split('.')[-1].split('/')[0]
                
                # Save the image locally with the correct extension
                image_filename = f'daily_comic.{file_extension}'
                image_path = os.path.join(IMAGES_DIR, image_filename)
                
                # Cleanup old images
                cleanup_images()

                img_data = requests.get(comic_url).content

                with open(image_path, 'wb') as handler:
                    handler.write(img_data)
                    
                comic_title = comic_tag.text
                return comic_url, comic_title, image_filename
        max_attempts -= 1
    return None, None, None

def cleanup_images():
    for file in os.listdir(IMAGES_DIR):
        if file.startswith('daily_comic'):
            os.remove(os.path.join(IMAGES_DIR, file))

if __name__ == '__main__':
    if not os.path.exists(IMAGES_DIR):
        os.makedirs(IMAGES_DIR)
    app.run()
