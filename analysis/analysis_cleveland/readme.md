Data processing

TKTK

Data Sources 

    1. Allocations
    
    Allocations come from several sources:
     
    Allocation for Metropolitan Cities (CSV) and  Allocation for Counties (CSV)
    can be found on the Treasury website:
    https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/state-and-local-fiscal-recovery-funds
    These get cleaned in clean_counties_cuyahoga.py 
    and clean_cities_cuyahoga.py.

    Allocations for smaller places are from this pdf:
    https://grants.ohio.gov/Documents/Funding_Opportunities/ARPA/ARPA_Non-Entitlement_Allocations_Distributions_2022-05-13.pdf
    This gets cleaned at clean_neu_allocations_cuyahoga.py. 

    These three allocations get combined in compile_allocations_cuyahoga.py into analysis/output_data/allocations_cuyahoga.csv


    2. Criminal justice related spending 

    Direct spendings come from the Treasury and are being processed by our code that flags criminal justice-related spending in project-level-analysis.py.

    In the filter_cyahoga.py file, we are filtering this data only for recipients in the Greater Cleveland area (Cuyahoga County, Cleveland and small places). Their list comes from here: 
    https://docs.google.com/spreadsheets/d/1s0FW5YoiX1KxiJKvZYgTdgGamRxKygQH9SdjkOrdoFw/edit#gid=0

    The filtered data gets exported as output_data/cuyahoga_arpa_projects_to_vet.csv.

    It goes into the google sheet where it gets manually vetted (Vet column) and also categorized (Focus column). 

    This data lives here:
    https://docs.google.com/spreadsheets/d/10A3xUicxV0yoEtRXz85z_nqDwzy_TbMqh_XD9qLNTok/edit#gid=912893235

    It gets exported as csv from Google Sheets and goes back to the repo as
    source_data/cleveland/cuyahoga_arpa_projects_vetted.csv
    It also gets downloaded to Observable for some of the calculations.

    3. Finally, indirect allocations from the state. 

    They were hand input by Rachel Disell here:
    https://docs.google.com/spreadsheets/d/1VaZU-rJdtvhGJMLtLYfqqiAcBRrswdM_N1iCRubEXF8/edit#gid=125400899

    Tabs: Ohio_CC_courts and Ohio_CC_Violent crime reduction.

    Ana copied them over to a clean table here:
    https://docs.google.com/spreadsheets/d/1nq0AwnOEi61XXPcbFUaI_aHfBl4lHWKphSqp3f9B0Jc/edit#gid=1493443383

    Then, exported as xlsx file, cleaned here 
    clean_indirect_multiplesheets.py
    and saved as cle_indirect_multiple.csv

    Finally, direct and indirect criminal justice related spending get together in combine_spendings_cle.py and exported as cle_cj_all_spending.csv

    This goes to Observable. 



    




