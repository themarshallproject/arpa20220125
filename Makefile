# Silently include .env configuration
sinclude .env
export

# Run "make" to get help
.DEFAULT_GOAL := help

# Environment(s)
PYENV=pipenv run


##@ Basic usage
.PHONY: all
all: analysis/output_data/output.csv  ## Download source data and run R analysis

.PHONY: clean
clean: clean/source_data clean/output_data  ## Clean files

.PHONY: merge_old_and_new_data
merge_old_and_new_data: analysis/output_data/q1_data_with_303_vetted_info.csv

.PHONY: help
help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z0-9\%\\.\/_-]+:.*?##/ { printf "\033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)



##@ Analysis
analysis/output_data/group_by_category.csv: analysis/source_data/April-2022-Quarterly-and-Annual-Reporting-Data-through-March-31-2022.xlsx ## Export grouped data for graphics
	@echo "Export grouped data for graphics"
	$(PYENV) python analysis/group_by_category.py $< $@

analysis/output_data/output.csv: analysis/source_data/input.csv  ## Run R analysis on the downloaded data, including saving output
	@echo "Running R analysis"
	Rscript analysis/analysis.R

##@ Merge old and new datasets
analysis/output_data/q1_data_with_303_vetted_info.csv:
	$(PYENV) python analysis/merge_two_datasets_with_unique_id.py

##@ Source files
analysis/source_data/April-2022-Quarterly-and-Annual-Reporting-Data-through-March-31-2022.xlsx:	## Download April twenty-two ARPA Data
	@echo "Downloading source data"
	curl https://s3.amazonaws.com/tmp-gfx-public-data/arpa_ncsl20220125/April-2022-Quarterly-and-Annual-Reporting-Data-through-March-31-2022.xlsx -o $@

##@ Upload/sync

.PHONY: deploy
deploy: all  ## Deploy to S3 (for Observable or other sharing)
	gulp deploy:data

##@ Cleanup
.PHONY: clean/source_data
clean/source_data:  ## Clean source data
	rm -rf analysis/source_data/*

.PHONY: clean/output_data
clean/output_data:  ## Clean processed data
	rm -rf analysis/output_data/* 
