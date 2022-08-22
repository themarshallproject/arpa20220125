import scrapy
from bs4 import BeautifulSoup


import pdb

class RegulationsSpider(scrapy.Spider):
    name = 'regulations'
    allowed_domains = ['regulations.gov']
    start_urls = ['https://www.regulations.gov/comment/TREAS-DO-2021-0008-0213']

    def parse(self, response):
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.find(class_="card-title")

        pdb.set_trace()
        yield { "fake_data": "fake data"}