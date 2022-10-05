import pandas as pd
import glob

# def read_file(df):
#     df = pd.read_excel(df)
#     return df 
    
# datasets = glob.glob("analysis/source_data/payroll/*.xlsx")

# dfs = []

# for i, data in enumerate(datasets):
#     df = read_file(data)
#     df = f'data_{i+1}'
#     dfs.append(df)

# print(dfs)

#READ THE FILES
df_21 = pd.read_excel("21emp.xlsx")
df_20 = pd.read_excel("20emp.xlsx")
df_19 = pd.read_excel("19emp.xlsx")
df_18 = pd.read_excel("18emp.xlsx")

#ADD AVERAGE PAY
dfs = [df_21, df_20, df_19, df_18]

for df in dfs:
    df["average_fulltime_pay"] = df["Full-time Payroll"]/df["Full-time Employees"]
    df["average_annual_pay"] =  df["average_fulltime_pay"]*12

#SLICE THE COLUMNS 
columns = ["State", "Type of Government", \
           "Name of Government", "Population/Enrollment/Function Code", \
           "Government Function", "Full-time Employees", \
           "Full-time Payroll", "average_annual_pay"]

for df in dfs: 
    df = df[[c for c in df.columns if c in columns]]

#MERGE DATAFRAMES 
for df in dfs: 
    df_merge = pd.merge(df_20, df, on=["State", "Type of Government", "Name of Government",\
    "Government Function"])

#EXPORT AS 1 FILE 

    