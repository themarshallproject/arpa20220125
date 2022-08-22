import pandas as pd

# Ana and Weihua vetted 336 cj-related projects from the 2021 dataset
# After getting the Q1 2022 dataset, we did not want to lose that progress and start over
# So we created this script that creates unique IDs for cj-related projects, and merge thd vetted data
# from the old dataset to the new one.

# Ideally you'll only need to run this script once new data come in
# We did run into one problem: some projects from the old dataset do not exist in the new one.
# Why? Gotta report that out!

def read_data(filenames):
    df_old = pd.read_csv(filenames[0])
    df_new = pd.read_csv(filenames[1])

    return df_old, df_new


def get_unique_ids(df_old, df_new):
    df_old["tmp_id"] = df_old["Recipient Name"] + \
                       "_" + df_old["Project Name"]

    df_new["tmp_id"] = df_new["Recipient Name"] + \
                       "_" + df_new["Project Name"]

    return df_old, df_new


def merge(df_old_with_id, df_new_with_id):
    df_old_vetted = df_old_with_id[~df_old_with_id["vet"].isnull()]
    df_old_vetted_short = df_old_vetted[
        ["tmp_id", 'law_enforcement', 'court', 'corrections', 'cj_related', 'vet', 'reporter']]

    # merge the new dataset with rows from the old one that we looked at.
    df_merge = pd.merge(df_new, df_old_vetted_short, on="tmp_id", how="left")

    # there are 33 rows that did not merge. Will export and investigate more.
    id_joined = pd.merge(df_new_with_id, df_old_vetted_short, on="tmp_id")["tmp_id"].to_list()
    df_did_not_merge = df_old_vetted[~df_old_vetted["tmp_id"].isin(id_joined)]

    return df_merge, df_did_not_merge

def export(df_merge, df_did_not_merge, df_merge_path, df_did_not_merge_path):
    df_merge.to_csv(df_merge_path, index=False)
    df_did_not_merge.to_csv(df_did_not_merge_path, index=False)

if __name__ == "__main__":
    filenames = ["analysis/source_data/cj_related/cj_related_old.csv", "analysis/source_data/cj_related/cj_related_new.csv"]

    # read in two datasets
    df_old, df_new = read_data(filenames)
    # get unique id by combining columns in the two datasets
    df_old_with_id, df_new_with_id = get_unique_ids(df_old, df_new)
    # let's do some merging!
    df_merge, df_did_not_merge = merge(df_old_with_id, df_new_with_id)

    # export
    df_merge_path = "analysis/output_data/q1_data_with_303_vetted_info.csv"
    df_did_not_merge_path = "analysis/output_data/missing_from_q1.csv"
    export(df_merge, df_did_not_merge, df_merge_path, df_did_not_merge_path)