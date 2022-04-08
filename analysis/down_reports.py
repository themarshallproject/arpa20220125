import click
import requests
from bs4 import BeautifulSoup
import pandas as pd
from xml.sax import ContentHandler, parse

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support import expected_conditions as EC

WAIT_FOR_ELEMENT = 10

@click.command()
@click.argument("url")
@click.argument("output_file", type=click.File('w'))
def down_reports(url, output_file):

    options = webdriver.ChromeOptions()
    #prefs = {'download.default_directory' : '/Users/anastasia/Desktop/arpa20220125/analysis/output_data'}
    options.add_argument("download.default_directory=/Users/anastasia/Desktop/arpa20220125/analysis/output_data")
    driver_path = 'source_data/chromedriver'
    driver = webdriver.Chrome(driver_path, chrome_options=options)

    driver = webdriver.Chrome(chrome_options=options)
    
    driver.get(url)

    try:
        click.echo("downloading", err=True)
        WebDriverWait(driver, WAIT_FOR_ELEMENT).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "downloadbutton"))
        )     
        file_name = driver.find_element_by_class_name("title").text
        click.echo(file_name, err=True) 
        #print(filename)   
        click.echo("clicking", err=True) 
        download_button = driver.find_element_by_class_name("downloadbutton")
        click.echo(download_button.text, err=True) 
        download_button.click()
        #assign the result to a variable
        fileoutput = "ana"
        click.echo("saving", err=True) 
        #output_file.write(file_name)

    except TimeoutException as e:
        print("Wait Time Out")
        print(e)
        
#     return filename

    #df.head().apply(down_interim_report, axis = 1)

if __name__ == '__main__':
    down_reports()

