import collections
from pprint import pprint
import census_data_aggregator
from census_data_downloader.core import MOE_MAP
from census_data_downloader.core.tables import BaseTableConfig
from census_data_downloader.core.decorators import register

#command line usage, commands to be find here:  
#https://github.com/datadesk/census-data-downloader 