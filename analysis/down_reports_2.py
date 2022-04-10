import pandas as pd

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

import time
WAIT_FOR_ELEMENT = 10

df = pd.read_csv("output_data/output.csv")

s=Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=s)

#test_url = "https://apps-treas.my.salesforce.com/sfc/p/#t0000000TZbC/a/t0000001elCE/Be7ZSeRxooqwSp9AAtzN2iY04gNnlPV4yzynDC4aVCE"
#driver.get(test_url)
#WebDriverWait(driver, WAIT_FOR_ELEMENT).until(
#                EC.element_to_be_clickable((By.CLASS_NAME, "downloadbutton"))
#            )    
#file_name = driver.find_element(by = By.CLASS_NAME, value = "title").text 
#download_button = driver.find_element(by=By.CLASS_NAME, value="downloadbutton")
#download_button.click()

def down_reports(url):
    url = df["Interim Report"]
    print(url)
    driver.get(url)
    WebDriverWait(driver, WAIT_FOR_ELEMENT).until(
                EC.element_to_be_clickable((By.CLASS_NAME, "downloadbutton"))
            )    
    file_name = driver.find_element(by = By.CLASS_NAME, value = "title").text 
    download_button = driver.find_element(by=By.CLASS_NAME, value="downloadbutton")
    download_button.click()
    return file_name

df["interim_report_file_name"] = df.apply(down_reports,\
                                               axis=1)