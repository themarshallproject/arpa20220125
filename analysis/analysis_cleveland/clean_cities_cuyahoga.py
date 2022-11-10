import pandas as pd 
#FILTERING and CLEANING df_cities for Ohio 

def read_csv(source_filename):
    df_cities = pd.read_csv(source_filename)

    return df_cities

def clean_data(df_cities):
    ## filtering through to just Ohio cities
    df_cities = df_cities.loc[df_cities['State'] == "Ohio"]
    ## rename column names: City => recipient, Allocation => allocation
    df_cities = df_cities[['City', 'Allocation']].rename(columns = {"City":"recipient", "Allocation":"allocation"})
    ## indicate that the data comes from the Treasury Department
    df_cities["source"] = "treasury"
    ## clean up the allocations column (replace useless characters, turn into int, etc.)
    df_cities['allocation'] = (df_cities['allocation'].str.strip('$'))
    df_cities['allocation'] = df_cities['allocation'].str.replace(',','')
    df_cities['allocation'] = df_cities['allocation'].str.replace('.00','')
    df_cities['allocation'] = df_cities['allocation'].astype(int)

    return df_cities

def export_data(df_cities, output_filename):
    df_cities.to_csv(output_filename, index = False)

if __name__ == "__main__":
    source_filename = "analysis/source_data/allocation/fiscalrecoveryfunds-metrocitiesfunding1-CSV.csv"
    output_filename = "analysis/source_data/allocation/cuyahoga_cities_allocation.csv"

    df_cities = read_csv(source_filename)
    df_cities_clean = clean_data(df_cities)
    export_data(df_cities_clean, output_filename)
