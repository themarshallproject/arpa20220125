import requests
#from census import Census
#from us import states

API_KEY = "64c5c62713b9769a5a273e8a98df638a5a67a0c2"

# c = Census(API_KEY)
# c.acs5.get(('NAME', 'DP05_0078PEM'),
#           {'for': 'county:{}'.format(counties.MD.fips)})
# print(c.acs5.get)
# query_params = {
#         "get": "NAME, DP05_0078PEM"
#         "for": "county:*",
#         "api_key": API_KEY
#     }
resp = requests.get("https://api.census.gov/data/2019/acs/acs5/groups/B26103B.json")
print(resp.json()["variables"].keys())
variables  = resp.json()["variables"].keys()
for variable in variables: 
    url=f"https://api.census.gov/data/2019/acs/acs1?get=NAME,{variable}&for=county:*"
    response = requests.get(url)
    print(variable, [i[1] for i in response if i[1] is not None])
# print(response.status_code)
# #https://api.census.gov/data/2019/acs/acs1?get=NAME,DP05_0078PEM‌&for=state:*

