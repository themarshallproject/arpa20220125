from matplotlib import test
import pandas as pd
import glob

def get_year(filename):
    year = filename.split("payroll/")[1]
    year = year.split("emp")[0]
    year = int("20"+year)
    return year

def test_get_year():
    assert get_year("analysis/source_data/payroll/19emp.xlsx") == 2019

#READ THE FILES
def read_files(datasets):
    dfs =[]
    for i, data in enumerate(datasets):
        df = pd.read_excel(data)
        #GET YEAR FROM THE FILENAME
        df['year'] = get_year(data) 
        dfs.append(df)
    return dfs 

#ADD AVERAGE PAY
def add_average_pay(dfs):
    for df in dfs:
            df["average_fulltime_pay"] = df["Full-time Payroll"]/df["Full-time Employees"]
            df["average_annual_pay"] =  df["average_fulltime_pay"]*12
    return dfs 

def test_add_pay():
    dfs = [pd.read_excel("analysis/source_data/payroll/21emp.xlsx")]
    dfs = add_average_pay(dfs)
    print(round(dfs[0]['average_fulltime_pay'].iloc[0]))
    assert round(dfs[0]['average_fulltime_pay'].iloc[0]) == 5220
    
def main():
 
    datasets = glob.glob("analysis/source_data/payroll/*.xlsx")
    dfs = read_files(datasets)
    dfs = add_average_pay(dfs)

    #MERGE DATAFRAMES
    df_all = pd.concat(dfs)

    #EXPORT AS 1 FILE 
    print("saving file")
    df_all.to_csv("analysis/output_data/payroll_data.csv")

    #SLICE THE COLUMNS 
    # columns = ["State", "Type of Government", \
    #         "Name of Government", "Population/Enrollment/Function Code", \
    #         "Government Function", "Full-time Employees", \
    #         "Full-time Payroll", "average_annual_pay"]

if __name__ == "__main__":
    main()