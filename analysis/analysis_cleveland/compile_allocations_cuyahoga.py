import pandas as pd

#FILTERING and CLEANING df_cities for Ohio 
df_cities = pd.read_csv("analysis/source_data/allocation/fiscalrecoveryfunds-metrocitiesfunding1-CSV.csv")
df_cities = df_cities.loc[df_cities['State'] == "Ohio"]
df_cities = df_cities[['City', 'Allocation']].rename(columns = {"City":"recipient", "Allocation":"allocation"})
df_cities["source"] = "treasury"
df_cities['allocation'] = (df_cities['allocation'].str.strip('$'))
df_cities['allocation'] = df_cities['allocation'].str.replace(',','')
df_cities['allocation'] = df_cities['allocation'].str.replace('.00','')
df_cities['allocation'] = df_cities['allocation'].astype(int)

#JOIINING with df of villages and small cities in Cuyahoga
df_neu = pd.read_csv("analysis/source_data/allocation/NEU_allocations.csv")
df_all = pd.concat([df_cities,df_neu])

#JOIINING with df of counties for Cuyahoga county 
df_county = pd.read_csv("analysis/source_data/allocation/cuyahoga_county_allocation.csv")
df_all = pd.concat([df_all,df_county])

#MAKING a list for recipients in Cuyahoga county
places = pd.read_csv("analysis/source_data/selection/cle_arpa.csv")
places['recipient'] = places['cle_arpa'].str.split(",").str[0]
places_list = list(places["recipient"])

#FILTERING the data on all allocations for the list of places
df_all = df_all[df_all['recipient'].isin(places_list)]

#JOINING with the places in Cleveland 
df_allocations= places.merge(df_all, on = "recipient", how = "left")
df_allocations.to_csv("analysis/output_data/allocations_cuyahoga.csv", index = False)