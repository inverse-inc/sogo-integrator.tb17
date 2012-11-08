PACKAGE = sogo-integrator
VERSION = $(shell grep em:version install.rdf | sed -e 's@\(em:version=\|\"\|\ \)@@g')

ifeq ($(build),)
XPI_ARCHIVE = $(PACKAGE)-$(VERSION).xpi
else
XPI_ARCHIVE = $(PACKAGE)-$(VERSION)-$(build).xpi
endif

SHELL = /bin/bash
ZIP = /usr/bin/zip

FILENAMES = $(shell cat MANIFEST)

all: custom-build MANIFEST-pre MANIFEST rest

custom-build:
	@if test "x$$build" == "x"; then \
	  echo "Building package with default settings."; \
	else \
	  echo "Building package with custom settings for '$$build'."; \
	  if ! test -d custom/$$build; then \
	    echo "Custom build '$$build' does not exist"; \
	    exit 1; \
	  fi; fi

MANIFEST: MANIFEST-pre
	@if ! cmp MANIFEST MANIFEST-pre >& /dev/null; then \
	  cat MANIFEST-pre | egrep -v '^custom/' | egrep -v '^./custom' > MANIFEST; \
	  echo MANIFEST updated; \
	else \
	  rm -f MANIFEST-pre; \
	fi;

MANIFEST-pre:
	@echo chrome.manifest > $@
	@echo NEWS >> $@
	@echo COPYING >> $@
	@find -type f -name "*.dtd" >> $@
	@find -type f -name "*.gif" >> $@
	@find -type f -name "*.idl" >> $@
	@find -type f -name "*.js" >> $@
	@find -type f -name "*.css" >> $@
	@find -type f -name "*.jpg" >> $@
	@find -type f -name "*.png" >> $@
	@find -type f -name "*.properties" >> $@
	@find -type f -name "*.rdf" >> $@
	@find -type f -name "*.xpt" >> $@
	@find -type f -name "*.xul" >> $@
	@find -type f -name "*.xml" >> $@

rest:
	@make $(XPI_ARCHIVE)

$(XPI_ARCHIVE): $(FILENAMES)
	@echo Generating $(XPI_ARCHIVE)...
	@rm -f $(XPI_ARCHIVE)
	@$(ZIP) -9r $(XPI_ARCHIVE) $(FILENAMES) > /dev/null
	@if test "x$$build" != "x"; then \
	  cd custom/$$build; \
	  $(ZIP) -9r ../../$(XPI_ARCHIVE) * > /dev/null; \
	fi

clean:
	rm -f MANIFEST-pre
	rm -f *.xpi
	find -name "*~" -exec rm -f {} \;

distclean: clean
	rm -f MANIFEST
