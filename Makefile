# Silently include .env configuration
sinclude .env
export

# Run "make" to get help
.DEFAULT_GOAL := help

# Default directories
SOURCE=analysis/datia
PROCESSED=analysis/data

# Environment(s)
PYENV=pipenv run

# Flags
RCLONE_FLAGS=--config secrets/rclone.conf -v

##@ Basic usage
.PHONY: all
all: $(PROCESSED)/test.csv  ## Make both test files. 
	@echo "Replace with your own processing pipeline." || true

.PHONY: clean
clean: clean/source clean/data  ## Clean files

.PHONY: help
help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z\%\\.\/_-]+:.*?##/ { printf "\033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Processing

$(PROCESSED)/test.csv: analysis/source/test.csvreate test csv in processed data directory
	cp $< $@

##@ Source files

$(SOURCE)/test.csv:  ## Create test csv in processed data directory
	curl https://raw.githubusercontent.com/themarshallproject/COVID_prison_data/master/data/covid_prison_cases.csv -o $@

##@ Upload/sync

.PHONY: deploy
deploy: all  ## Deploy to S3 (for Observable or other sharing)
	gulp deploy:data

##@ Cleanup
.PHONY: clean/source
clean/source:  ## Clean source data
	rm -rf $(SOURCE)/*

.PHONY: clean/data
clean/data:  ## Clean processed data
	rm -rf $(PROCESSED)/* 
