build-highs:
	mkdir -p .tmp && cd .tmp && \
	git clone git@github.com:ERGO-Code/HiGHS.git && cd HiGHS && \
	mkdir -p build && cd build && \
	cmake -DFAST_BUILD=ON -DBUILD_SHARED_LIBS=ON ..;
	cd .tmp/HiGHS/build && cmake --build .;

.PHONY: build-highs
