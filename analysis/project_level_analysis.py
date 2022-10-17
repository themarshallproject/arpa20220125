import numpy as np
import pandas as pd

def flag_topics(df):

    list_le = ["police","PD","gun","law enforcement","public safety","crime","criminal","body cameras","tasers","armor","sheriff","officer"]
    list_court = ["court","public defenders","prosecutors","juvenile court","juvenile justice"]
    list_correction = ["jail","prison","correction","incarcerated","inmate","guards","custody"]

    df["law_enforcement"] = df["Project Description"].str.lower().str.contains("|".join(list_le))== True
    df["court"] = df["Project Description"].str.lower().str.contains("|".join(list_court))== True
    df["corrections"] = df["Project Description"].str.lower().str.contains("|".join(list_correction))== True

    return df

def flag_cj_projects(row):
    if row["law_enforcement"] | row["court"] | row["corrections"]:
        return True
    else:
        pass
    

def main():

    print("reading in file")
    df = pd.read_excel('analysis/source_data/April-2022-Quarterly-and-Annual-Reporting-Data-through-March-31-2022.xlsx', 'Projects', skiprows=0, index_col=0)
    print("flagging by topics")
    df = flag_topics(df)
    print("flagging cj")
    df["cj_related"] = df.apply(flag_cj_projects, axis = 1)
    print("saving file")
    df.to_csv("analysis/output_data/q1_cj_related_projects_to_vet.csv")

if __name__ == "__main__":
    main()