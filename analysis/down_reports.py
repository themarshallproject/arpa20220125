import click
import pandas as pd

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from time import sleep 

import os.path 

from webdriver_manager.chrome import ChromeDriverManager

WAIT_FOR_ELEMENT = 10

options = webdriver.ChromeOptions()
#prefs = {'download.default_directory' : '/Users/anastasia/Desktop/arpa20220125/analysis/output_data/reports//'}
#prefs = {'download.default_directory' : '/tmp/reports//'}
#options.add_experimental_option("prefs", prefs)
options.add_argument("--headless")

s=Service(ChromeDriverManager().install()) 
driver = webdriver.Chrome(service=s, options=options)

@click.command()
@click.argument("url")
def down_reports(url):  
    driver.get(url) 
    try:  
        click.echo("waiting for the button", err=True)
        WebDriverWait(driver, WAIT_FOR_ELEMENT).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "downloadbutton"))
        ) 
        file_name = driver.find_element(by = By.CLASS_NAME, value = "title").text
        click.echo(file_name, err=True)

        output = driver.execute("""
        [].forEach.call(document.querySelectorAll('a'), function(link){
        if(link.attributes.target) {
            link.attributes.target.value = '_self';
        }
        });
        window.open = function(url) {
        location.href = url;
        console.log(url);
            };""".replace('\r\n', ' ').replace('\r', ' ').replace('\n', ' '))
        click.echo(output)







        file_exists = os.path.exists(f'output_data/reports/{file_name}.xls')
        #file_exists = #check the bucket
        click.echo(file_exists, err = True)
        if file_exists == False:
            click.echo("finding the button", err=True) 
            download_button = driver.find_element(by=By.CLASS_NAME, value="downloadbutton")
            click.echo("clicking")  
            down_btn = download_button.click()
            click.echo(down_btn)
            click.echo("saving", err=True)
            #return (file_name, sleep(3), driver.close())
        else: 
            return (driver.close())
    except TimeoutException as e:
        print("Wait Time Out")
        print(e)
if __name__ == '__main__':
    down_reports()