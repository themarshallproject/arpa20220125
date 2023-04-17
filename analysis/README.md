# Data processing
In this repo, we are merging project-level ARPA data that the Treasury Department released, and extracting projects that mentions something about the criminal justice system in the project description.

## Data source
The Treasury Department requires large cities to report its ARPA spending every quarter, and smaller jurisdictions can report every year. You can find the excel spreadsheet [from the Treasury's website](https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/state-and-local-fiscal-recovery-funds/recipient-compliance-and-reporting-responsibilities), under the "public reporting" sections.

## Analysis notebooks
There are two notebooks that are currently relevant. 

- `merge_data.ipynb` notebook merges project-level data from different data releases.
- `project-level-analysis.ipynb` reads in the merged data and runs a text analysis on the project descriptions, extracting projects that contains keywords about the criminal justice system. You can check `classfications` for the keywords we're extracting, or editing directly in the notebook.

In addition, the `legacy_notebooks` directory has a number of notebooks that we used for previous analysis, including scrapers and text analysis on the interim report.

## Requirements

Python (3.6+) and Pandas

The data files are stored with [git-lfs](https://docs.github.com/en/repositories/working-with-files/managing-large-files/installing-git-large-file-storage). You might need to install it before pulling the repo.