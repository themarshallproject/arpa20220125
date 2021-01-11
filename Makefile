# Silently include .env configuration
sinclude .env
export

# Run "make" to get help
.DEFAULT_GOAL := help

# Environment(s)
PYENV=pipenv run

# Flags
RCLONE_FLAGS=--config secrets/rclone.conf -v

##@ Basic usage
.PHONY: all
all: getSource runR  ## Download source data and run R analysis

.PHONY: clean
clean: clean/source_data clean/output_data  ## Clean files

.PHONY: help
help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z\%\\.\/_-]+:.*?##/ { printf "\033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)



##@ Analysis
.PHONY: runR
runR: analysis/analysis.R  ## Run R analysis on the downloaded data, including saving output
	@echo "Running R analysis"
	Rscript $< 


##@ Source files
.PHONY: getSource
getSource:  ## Download a test input csv to source data directory
	@echo "Downloading source data"
	curl https://raw.githubusercontent.com/themarshallproject/COVID_prison_data/master/data/covid_prison_cases.csv -o "analysis/source_data/input.csv"

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
