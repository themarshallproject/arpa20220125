## combines all three allocation files (city, county, and NEU(small cities))
## filter that list with a hand-compiled list of all cities/villages in Cuyahoga county (compiled by Rachel)
## export this data for further analysis

import pandas as pd

#JOIINING with df of villages and small cities in Cuyahoga
df_neu = pd.read_csv("analysis/source_data/allocation/NEU_allocations.csv")
df_cities = pd.read_csv("analysis/source_data/allocation/cuyahoga_cities_allocation.csv")
df_all = pd.concat([df_cities,df_neu])

#JOIINING with df of counties for Cuyahoga county 
df_county = pd.read_csv("analysis/source_data/allocation/cuyahoga_county_allocation.csv")
df_all = pd.concat([df_all,df_county])

#MAKING a list for recipients in Cuyahoga county
places = pd.read_csv("analysis/source_data/cleveland/cle_arpa.csv")
places['recipient'] = places['cle_arpa'].str.split(",").str[0]
places_list = list(places["recipient"])

#FILTERING the data on all allocations for the list of places
df_all = df_all[df_all['recipient'].isin(places_list)]

#JOINING with the places in Cleveland 
df_allocations= places.merge(df_all, on = "recipient", how = "left")
df_allocations.to_csv("analysis/output_data/allocations_cuyahoga.csv", index = False)