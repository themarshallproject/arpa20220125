import click

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time

import os.path
from webdriver_manager.chrome import ChromeDriverManager

WAIT_FOR_ELEMENT = 10

options = webdriver.ChromeOptions()
options.add_argument("--headless")

d = DesiredCapabilities.CHROME
d['goog:loggingPrefs'] = { 'browser':'ALL' }


s=Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=s, options=options, desired_capabilities=d)

@click.command()
@click.argument("url")
def down_reports(url):
    driver.get(url)
    try:
        WebDriverWait(driver, WAIT_FOR_ELEMENT).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "downloadbutton"))
        )
        file_name = driver.find_element(by = By.CLASS_NAME, value = "title").text
        click.echo(file_name, err=True)

        driver.execute_script("""
                        window.open = function(url) {
                            console.log(url);
                            localStorage.setItem('url', url);
                            return url;
                        };
                        """
                        .replace('\r\n', ' ').replace('\r', ' ').replace('\n', ' '))

        download_button = driver.find_element(by=By.CLASS_NAME, value="downloadbutton")
        down_btn = download_button.click()
        print(down_btn)
        driver.execute_script(f"console.log('{driver.current_url}');")
        url = driver.execute_script("return localStorage.getItem('url');")
        print(url)
        print(type(url))

    except TimeoutException as e:
        print("Wait Time Out")
        print(e)
if __name__ == '__main__':
    down_reports()