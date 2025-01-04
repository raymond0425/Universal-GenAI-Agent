from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import requests

# Set up the Chrome options
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("blink-settings=imagesEnabled=false")
chrome_options.add_argument("--disable-extensions")
chrome_options.add_argument("--disable-infobars")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.page_load_strategy = 'eager'

# Initialize the WebDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

try:
    driver.get('https://www.scmp.com/')
    driver.implicitly_wait(5)
    scraped_content = driver.find_element(By.TAG_NAME, 'body').text

finally:
    driver.quit()

gemini_connector_url = 'http://localhost:3000/stream'
response = requests.post(gemini_connector_url, json={'webContent': scraped_content}, stream=True)

for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))